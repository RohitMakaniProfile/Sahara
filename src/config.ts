import dotenv from 'dotenv';

dotenv.config();

export const port = process.env.PORT;
export const isProduction = process.env.NODE_ENV === 'production';
export const logDirectory = process.env.LOG_DIRECTORY;
export const originUrl = process.env.ORIGIN_URL;
export const jwtSecret = process.env.JWT_SECRET!;
export const refreshSecret = process.env.REFRESH_SECRET!;
export const refreshTokenTtlMs = 7 * 24 * 60 * 60 * 1000; // 7 days
