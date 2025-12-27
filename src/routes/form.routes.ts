import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import formController from '../controllers/form.controller.js';
import { validator } from '../middlewares/validator.middleware.js';
import formSschema from '../schema/form.schema.js';
import { ValidationSource } from '../helpers/validator.js';

const router = express.Router();

router.use(protect);

router.get('/structure', formController.getForm);
router.post(
    '/submit',
    validator(formSschema.formSubmission, ValidationSource.BODY),
    formController.formSubmissionData,
);

export default router;
