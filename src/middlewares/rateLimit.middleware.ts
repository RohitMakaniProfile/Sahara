import rateLimit from 'express-rate-limit';

const authLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10, // per IP per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Too many login attempts. Please try again later.',
    },
});

const authRegisterLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 5, // per IP per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Too many registration attempts. Please try again later.',
    },
});

export default {
    authLoginLimiter,
    authRegisterLimiter,
};

