import jwtUtil from '../core/token.js';
import { AccessTokenError, AuthFailureError } from '../core/ApiError.js';
import type { ProtectedRequest } from '../types/app-requests.js';
import { asyncHandler } from '../core/asyncHandler.js';

export const protect = asyncHandler<ProtectedRequest>(
    async (req, _res, next) => {
        const header = req.headers.authorization;

        if (!header || !header.startsWith('Bearer ')) {
            throw new AuthFailureError('Authorization required');
        }

        const token = header.split(' ')[1];
        const payload = jwtUtil.verifyAccessToken(token as string);

        if (!payload) {
            throw new AccessTokenError('Invalid or expired access token');
        }

        // Attach typed user payload to req.user (globally defined)
        req.user = {
            parentId: payload.parentId,
        };

        next();
    },
);
