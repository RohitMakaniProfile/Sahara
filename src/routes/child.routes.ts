import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { validator } from '../middlewares/validator.middleware.js';
import authSchema from '../schema/auth.schema.js';
import { ValidationSource } from '../helpers/validator.js';
import authController from '../controllers/auth.controller.js';

const router = Router();

router.use(protect);

router.post(
    '/',
    validator(authSchema.ChildRegister, ValidationSource.BODY),
    authController.childRegister,
);

export default router;
