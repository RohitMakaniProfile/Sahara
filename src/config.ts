import dotenv from 'dotenv';

dotenv.config();

export const port = process.env.PORT;
export const isProduction = process.env.NODE_ENV === 'production';
export const logDirectory = process.env.LOG_DIRECTORY;
export const originUrl = process.env.ORIGIN_URL;
