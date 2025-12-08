import { Router } from 'express';
import {
    register,
    login,
    logout,
    refresh,
} from '../controllers/auth.controller.js';
import { validator } from '../middlewares/validator.middleware.js';
import authSchema from '../schema/auth.schema.js';
import { ValidationSource } from '../helpers/validator.js';

const router = Router();

router.post(
    '/register',
    validator(authSchema.ParentRegister, ValidationSource.BODY),
    register,
);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;
