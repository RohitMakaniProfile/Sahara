import type { Request, Response } from 'express';
import { asyncHandler } from '../core/asyncHandler.js';
import parentRepository from '../db/repository/parent.repository.js';
import refreshRepository from '../db/repository/refreshToken.repository.js';
import { PasswordUtils } from '../core/password.js';
import jwtUtil from '../core/token.js';
import { prisma } from '../db/prisma.js';
import { BadRequestError } from '../core/ApiError.js';
import { SuccessMsgResponse, SuccessResponse } from '../core/ApiResponse.js';
import type { RefreshToken } from '@prisma/client';
import { sendRefreshCookie } from '../services/auth.services.js';
import { refreshTokenTtlMs } from '../config.js';
import type { ProtectedRequest } from '../types/app-requests.js';
import { configCookies } from '../helpers/cookie-options.js';

// TODO: Add some headers to detect the device of the client request(Web/Mobile)

/**
 * Request handler to register the parent.
 * @author Hemant Sharma
 */
const register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name, phoneNumber, location } = req.body;

    const existing = await parentRepository.findByEmail(email);
    if (existing) throw new BadRequestError('Email already exists');

    const hashedPassword = await PasswordUtils.hash(password);

    const parentWithToken = await parentRepository.createWithToken({
        email,
        hashedPassword,
        name,
        phoneNumber,
        location,
    });

    // It stores the token in the cookie - For web(future)
    sendRefreshCookie(
        res,
        parentWithToken.refreshTokenPlain,
        parentWithToken.expiresAt,
    );

    const accessToken = jwtUtil.generateAccessToken(parentWithToken.parent.id);

    new SuccessResponse('Registered', {
        parent: {
            id: parentWithToken.parent.id,
            email: parentWithToken.parent.email,
        },
        accessToken,
        // also include refresh token for mobile
        refreshToken: parentWithToken.refreshTokenPlain,
        refreshTokenExpiresAt: parentWithToken.expiresAt,
    }).send(res);
});

/**
 * Request handler to login the already registered parent.
 * Issues Access and Refresh Token
 * @author Hemant Sharma
 */
const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const parent = await parentRepository.findByEmail(email);
    if (!parent) throw new BadRequestError('Invalid credentials');

    const valid = await PasswordUtils.compare(password, parent.hashedPassword);
    if (!valid) throw new BadRequestError('Invalid credentials');

    const accessToken = jwtUtil.generateAccessToken(parent.id);
    const refreshToken = jwtUtil.generateRefreshToken(parent.id);

    const hashedRefresh = await PasswordUtils.hash(refreshToken);
    const expiresAt = new Date(Date.now() + refreshTokenTtlMs);

    await refreshRepository.create({
        tokenHash: hashedRefresh,
        parent: { connect: { id: parent.id } },
        expiresAt,
    });

    sendRefreshCookie(res, refreshToken, expiresAt);

    new SuccessResponse('Logged in', {
        parent: { id: parent.id, email: parent.email },
        accessToken,
        // Refresh token information for mobile
        refreshToken,
        refreshTokenExpiresAt: expiresAt,
    }).send(res);
});

/**
 * Reissues the token to keep the session continue.
 * @author Hemant Sharma
 */
const refresh = asyncHandler(async (req: Request, res: Response) => {
    // For Web
    const tokenFromCookie = req.cookies.refreshToken;
    // For Mobile devices
    const tokenFromBody = req.body.refreshToken;

    const refreshToken = tokenFromBody || tokenFromCookie;
    if (!refreshToken) throw new BadRequestError('No refresh token');

    const payload = jwtUtil.verifyRefreshToken(refreshToken);
    if (!payload) throw new BadRequestError('Invalid refresh token');

    const savedTokens = await refreshRepository.findManyByParent(
        payload.parentId,
    );

    let match: RefreshToken | null = null;
    for (const t of savedTokens) {
        const ok = await PasswordUtils.compare(refreshToken, t.tokenHash);
        if (ok) {
            match = t;
            break;
        }
    }

    if (!match) {
        await refreshRepository.deleteAllByParent(payload.parentId);
        throw new BadRequestError(
            'Token reuse detected — logged out everywhere.',
        );
    }

    // rotation
    const newAccess = jwtUtil.generateAccessToken(payload.parentId);
    const newRefresh = jwtUtil.generateRefreshToken(payload.parentId);
    const hashedNewRefresh = await PasswordUtils.hash(newRefresh);
    const expiresAt = new Date(Date.now() + refreshTokenTtlMs);

    await refreshRepository.rotateToken(match.id, {
        tokenHash: hashedNewRefresh,
        parentId: payload.parentId,
        expiresAt,
    });

    sendRefreshCookie(res, newRefresh, expiresAt);
    new SuccessResponse('Refreshed', {
        accessToken: newAccess,
        // Send refresh token also for mobile devices
        refreshToken: newRefresh,
        refreshTokenExpiresAt: expiresAt,
    }).send(res);
});

/**
 * @author Hemant Sharma
 */
const logout = asyncHandler(async (req: Request, res: Response) => {
    const tokenFromCookie = req.cookies.refreshToken;
    const tokenFromBody = req.body.refreshToken;
    const refreshToken = tokenFromBody || tokenFromCookie;
    if (!refreshToken) {
        new SuccessResponse('Already logged out', {}).send(res);
        return;
    }

    const payload = jwtUtil.verifyRefreshToken(refreshToken);
    if (!payload) {
        if (tokenFromCookie) {
            res.clearCookie('refreshToken', { ...configCookies });
        }
        new SuccessMsgResponse('Logged out').send(res);
        return;
    }

    // find tokens for that parent only (faster)
    const savedTokens = await refreshRepository.findManyByParent(
        payload.parentId,
    );

    for (const t of savedTokens) {
        const ok = await PasswordUtils.compare(tokenFromCookie, t.tokenHash);
        if (ok) {
            await refreshRepository.deleteById(t.id);
            break;
        }
    }

    if (tokenFromCookie) {
        res.clearCookie('refreshToken', {
            ...configCookies,
        });
    }

    new SuccessMsgResponse('Logged out').send(res);
});

const childRegister = asyncHandler<ProtectedRequest>(
    async (req: ProtectedRequest, res: Response) => {
        const parentId = req.user?.parentId;

        const { name, dob, gender, relationWithParent } = req.body;

        const parsedDob = new Date(dob);
        if (Number.isNaN(parsedDob.getTime()))
            throw new BadRequestError('Invalid DOB');

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
    },
);

export default {
    register,
    login,
    refresh,
    childRegister,
    logout,
};
