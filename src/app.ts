import logger from './core/logger.js';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { originUrl } from './config.js';
import router from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { NotFoundError } from './core/ApiError.js';
import helmet from 'helmet';
import { SuccessMsgResponse } from './core/ApiResponse.js';

process.on('uncaughtException', (e) => {
    logger.error(e);
});

export const app = express();

app.use(cookieParser());

// Adjust the size of response body as per requirement
app.use(express.json({ limit: '10mb' }));
app.use(
    express.urlencoded({
        limit: '10mb',
        extended: true,
        parameterLimit: 50000,
    }),
);
// Allows cross origin reference
app.use(
    cors({
        origin: originUrl,
        optionsSuccessStatus: 200,
        credentials: true,
    }),
);
// Adds security header, express best security practice
app.use(helmet());

// Health check route
router.get('/health', (_req, res) => {
    new SuccessMsgResponse(
        'Sahara Backend application is healthy and running.',
    ).send(res);
});
// Main routes
app.use('/', router);

app.use((_req, _res, next) => next(new NotFoundError()));
app.use(errorHandler);
