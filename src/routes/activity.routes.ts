import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import activityController from '../controllers/activity.controller.js';

const router = Router();

router.use(protect);

router.get('/:childId', protect, activityController.getActivities);

export default router;
