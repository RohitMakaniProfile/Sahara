import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import { validator } from '../middlewares/validator.middleware.js';
import authSchema from '../schema/auth.schema.js';
import { ValidationSource } from '../helpers/validator.js';

const router = Router();

router.post(
    '/register',
    validator(authSchema.ParentRegister, ValidationSource.BODY),
    authController.register,
);
router.post(
    '/login',
    validator(authSchema.ParentLogin, ValidationSource.BODY),
    authController.login,
);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

export default router;
