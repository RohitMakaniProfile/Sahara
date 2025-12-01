import z from 'zod';

export enum ValidationSource {
    BODY = 'body',
    HEADER = 'headers',
    QUERY = 'query',
    PARAM = 'params',
}

export const ZodUrlEndpoint = z
    .string()
    .refine((value: string) => !value.includes('://'), {
        message: 'Invalid endpoint: URLs with protocol are not allowed',
    });

export const ZodAuthBearer = z.string().refine(
    (value: string) => {
        if (!value.startsWith('Bearer ')) return false;

        const parts = value.split(' ');
        if (parts.length !== 2) return false;

        const token = parts[1];
        if (!token || token.trim().length === 0) return false;

        return true;
    },
    {
        message: "Invalid Authorization header. Expected: 'Bearer <token>'",
    },
);
