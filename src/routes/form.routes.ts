import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import formController from '../controllers/form.controller.js';

const router = express.Router();

router.use(protect);

router.get('/structure', formController.getForm);
router.post('/submission', formController.formSubmissionData);

export default router;
