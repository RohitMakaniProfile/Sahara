import type { Request, Response } from 'express';
import { asyncHandler } from '../core/asyncHandler.js';
import parentRepository from '../db/repository/parent.repository.js';
import refreshRepo from '../db/repository/refreshToken.repository.js';
import { PasswordUtils } from '../core/password.js';
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from '../core/token.js';
import { prisma } from '../db/prisma.js';
import { BadRequestError } from '../core/ApiError.js';
import { SuccessResponse } from '../core/ApiResponse.js';
import type { RefreshToken } from '@prisma/client';

import { sendRefreshCookie } from '../services/auth.services.js';
import { REFRESH_TOKEN_TTL_MS } from '../config.js';


export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name , phoneNumber, location } = req.body;

  if (!email || !password) throw new BadRequestError('Email & Password required');
  if (!name || !phoneNumber || !location) throw new BadRequestError('Name, Phone Number & Location required');

  const existing = await parentRepository.findByEmail(email);
  if (existing) throw new BadRequestError('Email already exists');

  const hashedPassword = await PasswordUtils.hash(password);

 
  const parentWithToken = await prisma.$transaction(async (tx) => {
    const parent = await tx.parent.create({
      data: {
        email,
        hashedPassword,
        name,
        phoneNumber,
        location,
      },
    });

    const refreshTokenPlain = generateRefreshToken(parent.id);
    const hashedRefresh = await PasswordUtils.hash(refreshTokenPlain);

    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    const rt = await tx.refreshToken.create({
      data: {
        tokenHash: hashedRefresh,
        parent: { connect: { id: parent.id } },
        expiresAt,
      },
    });

    return { parent, refreshTokenPlain, expiresAt };
  });

  
  sendRefreshCookie(res, parentWithToken.refreshTokenPlain, parentWithToken.expiresAt);

  const accessToken = generateAccessToken(parentWithToken.parent.id);

  new SuccessResponse('Registered', {
    parent: { id: parentWithToken.parent.id, email: parentWithToken.parent.email },
    accessToken,
  }).send(res);
});      

export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password)
        throw new BadRequestError('Email & Password required');

    const parent = await parentRepository.findByEmail(email);
    if (!parent) throw new BadRequestError('Invalid credentials');

    const valid = await PasswordUtils.compare(password, parent.hashedPassword);
    if (!valid) throw new BadRequestError('Invalid credentials');

    const accessToken = generateAccessToken(parent.id);
    const refreshToken = generateRefreshToken(parent.id);

    const hashedRefresh = await PasswordUtils.hash(refreshToken);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    await refreshRepo.create({
        tokenHash: hashedRefresh,
        parent: { connect: { id: parent.id } },
        expiresAt,
    });

    sendRefreshCookie(res, refreshToken, expiresAt);

    new SuccessResponse('Logged in', {
        parent: { id: parent.id, email: parent.email },
        accessToken,
    }).send(res);
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
    const tokenFromCookie = req.cookies.refreshToken;
    if (!tokenFromCookie) throw new BadRequestError('No refresh token');

    const payload = verifyRefreshToken(tokenFromCookie);
    if (!payload) throw new BadRequestError('Invalid refresh token');

    const savedTokens = await refreshRepo.findManyByParent(payload.parentId);

    let match: RefreshToken | null = null;
    for (const t of savedTokens) {
        const ok = await PasswordUtils.compare(tokenFromCookie, t.tokenHash);
        if (ok) {
            match = t;
            break;
        }
    }

    if (!match) {
        await refreshRepo.deleteAllByParent(payload.parentId);
        throw new BadRequestError(
            'Token reuse detected — logged out everywhere.',
        );
    }

    // rotation
    const newAccess = generateAccessToken(payload.parentId);
    const newRefresh = generateRefreshToken(payload.parentId);
    const hashedNewRefresh = await PasswordUtils.hash(newRefresh);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

    await prisma.$transaction([
        refreshRepo.deleteById(match.id),
        refreshRepo.create({
            tokenHash: hashedNewRefresh,
            parent: { connect: { id: payload.parentId } },
            expiresAt,
        }),
    ]);

    sendRefreshCookie(res, newRefresh, expiresAt);
    new SuccessResponse('Refreshed', { accessToken: newAccess }).send(res);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const tokenFromCookie = req.cookies.refreshToken;
  if (!tokenFromCookie) {
    new SuccessResponse('Already logged out', {}).send(res);
    return;
  }

  const payload = verifyRefreshToken(tokenFromCookie);
  if (!payload) {
    // clear cookie and return
    res.clearCookie('refreshToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
    new SuccessResponse('Logged out', {}).send(res);
    return;
  }

  // find tokens for that parent only (faster)
  const savedTokens = await refreshRepo.findManyByParent(payload.parentId);
  for (const t of savedTokens) {
    const ok = await PasswordUtils.compare(tokenFromCookie, t.tokenHash);
    if (ok) {
      await refreshRepo.deleteById(t.id);
      break;
    }
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  new SuccessResponse('Logged out', {}).send(res);
});



export const childRegister = asyncHandler(async (req: Request, res: Response) => {

  const parentId = req.user?.parentId;
  const { name, dob, gender, relationWithParent } = req.body;

  if (!parentId) throw new BadRequestError('Authentication required');
  if (!name || !dob) throw new BadRequestError('Name & DOB required');

  const parsedDob = new Date(dob);
  if (Number.isNaN(parsedDob.getTime())) throw new BadRequestError('Invalid DOB');

  const child = await prisma.child.create({
    data: {
      name,
      dob: parsedDob,
      gender,
      relationWithParent,
      parent: { connect: { id: parentId } },
    },
  });

  new SuccessResponse('Child Registered', {
    child: { id: child.id, name: child.name, dob: child.dob },
  }).send(res);
});