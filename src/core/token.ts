import jwt from 'jsonwebtoken';
import { jwtSecret, refreshSecret } from '../config.js';

export interface AccessTokenPayload {
    parentId: number;
    exp: number;
}

export interface RefreshTokenPayload {
    parentId: number;
    exp: number;
}

export const generateAccessToken = (parentId: number) => {
    return jwt.sign({ parentId }, jwtSecret!, { expiresIn: '15m' });
};

export const generateRefreshToken = (parentId: number) => {
    return jwt.sign({ parentId }, refreshSecret!, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string): AccessTokenPayload | null => {
    try {
        return jwt.verify(token, jwtSecret!) as AccessTokenPayload;
    } catch {
        return null;
    }
};

export const verifyRefreshToken = (
    token: string,
): RefreshTokenPayload | null => {
    try {
        return jwt.verify(token, refreshSecret!) as RefreshTokenPayload;
    } catch {
        return null;
    }
};
