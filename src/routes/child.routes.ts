import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { validator } from '../middlewares/validator.middleware.js';
import authSchema from '../schema/auth.schema.js';
import { ValidationSource } from '../helpers/validator.js';
import childController from '../controllers/child.controller.js';

const router = Router();

router.use(protect);

router.post(
    '/register',
    validator(authSchema.ChildRegister, ValidationSource.BODY),
    childController.childRegister,
);
router.get(
    '/:childId/assessment/latest',
    childController.getChildLatestFormResults,
);

export default router;
