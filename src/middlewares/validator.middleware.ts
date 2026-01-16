import type { RequestHandler } from 'express';
import { z, type ZodSchema } from 'zod';

import { BadRequestError } from './../core/ApiError.js';
import { ValidationSource } from './../helpers/validator.js';
import logger from '../core/logger.js';


export const validator = (
    schema: ZodSchema,
    source: ValidationSource = ValidationSource.BODY,
): RequestHandler => {
    return (req, _res, next): void => {
        const result = schema.safeParse(req[source]);

        if (!result.success) {
            logger.error(result.error);
            return next(new BadRequestError(z.prettifyError(result.error)));
        }
        req[source] = result.data;
        
        next();
    };
};
