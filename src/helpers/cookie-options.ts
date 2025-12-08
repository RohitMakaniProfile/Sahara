import type { CookieOptions } from 'express';
export const configCookies: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
};
