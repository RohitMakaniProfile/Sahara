import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import formController from '../controllers/form.controller.js';

const router = express.Router();

router.use(protect);

router.get('/', formController.getForm);

export default router;
