import dotenv from 'dotenv';

dotenv.config();

function requiredEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(
            `[config] Missing required environment variable: ${name}`,
        );
    }
    return value;
}

export const port = process.env.PORT;
export const isProduction = process.env.NODE_ENV === 'production';
export const logDirectory = process.env.LOG_DIRECTORY;
export const originUrl = process.env.ORIGIN_URL;
export const jwtSecret = requiredEnv('JWT_SECRET');
export const refreshSecret = requiredEnv('REFRESH_SECRET');
export const refreshTokenTtlMs = 7 * 24 * 60 * 60 * 1000; // 7 days
export const MAX_RESPONSE = 2;
