import jwt from 'jsonwebtoken';
import { JWT_SECRET, REFRESH_SECRET } from '../config.js';


export interface AccessTokenPayload {
  parentId: number;
  exp: number; 
}

export interface RefreshTokenPayload {
  parentId: number;
  exp: number;
}

export const generateAccessToken = (parentId: number) => {
  return jwt.sign({ parentId }, JWT_SECRET!, { expiresIn: '15m' });
};

export const generateRefreshToken = (parentId: number) => {
  return jwt.sign({ parentId }, REFRESH_SECRET!, { expiresIn: '7d' });
};


export const verifyAccessToken = (token: string): AccessTokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET!) as AccessTokenPayload;
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload | null => {
  try {
    return jwt.verify(token, REFRESH_SECRET!) as RefreshTokenPayload;
  } catch {
    return null;
  }
};
