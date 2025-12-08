import { verifyAccessToken } from '../core/token.js';
import { BadRequestError } from '../core/ApiError.js';
import type { ProtectedRequest } from '../types/app-requests.js';
import { asyncHandler } from '../core/asyncHandler.js';

export const protect = asyncHandler<ProtectedRequest>(
    async (req, _res, next) => {
        const header = req.headers.authorization;

        if (!header || !header.startsWith('Bearer ')) {
            throw new BadRequestError('Authorization required');
        }

        const token = header.split(' ')[1];
        const payload = verifyAccessToken(token as string);

        if (!payload) {
            throw new BadRequestError('Invalid or expired access token');
        }

        // Attach typed user payload to req.user (globally defined)
        req.user = {
            parentId: payload.parentId,
        };

        next();
    },
);
