import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { validator } from '../middlewares/validator.middleware.js';
import authSchema from '../schema/auth.schema.js';
import childSchema from '../schema/child.schema.js';
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
    '/:childId',
    validator(childSchema.ChildParams, ValidationSource.PARAM),
    childController.getChildProfile,
);
router.get(
    '/:childId/assessment/latest',
    childController.getChildLatestFormResults,
);

router.patch(
    '/:childId',
    validator(childSchema.ChildParams, ValidationSource.PARAM),
    validator(childSchema.ChildUpdate, ValidationSource.BODY),
    childController.updateChildProfile,
);

export default router;
