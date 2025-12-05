import type { Response } from 'express';

export const sendRefreshCookie = (res: Response, token: string, expiresAt: Date) => {
    const maxAge = Math.max(0, expiresAt.getTime() - Date.now());
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge,
    });
};
