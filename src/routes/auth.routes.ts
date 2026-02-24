import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import { validator } from '../middlewares/validator.middleware.js';
import authSchema from '../schema/auth.schema.js';
import { ValidationSource } from '../helpers/validator.js';
import { protect } from '../middlewares/auth.middleware.js';
import rateLimit from '../middlewares/rateLimit.middleware.js';

const router = Router();

router.post(
    '/register',
    rateLimit.authRegisterLimiter,
    validator(authSchema.ParentRegister, ValidationSource.BODY),
    authController.register,
);
router.post(
    '/login',
    rateLimit.authLoginLimiter,
    validator(authSchema.ParentLogin, ValidationSource.BODY),
    authController.login,
);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.me);

export default router;
