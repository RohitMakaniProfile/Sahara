// middlewares/auth.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../core/token.js';
import { BadRequestError } from '../core/ApiError.js';

export const protect = (req: Request, _res: Response, next: NextFunction) => {
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
};
