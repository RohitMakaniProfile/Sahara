import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import parentController from '../controllers/parent.controller.js';

const router = Router();
router.use(protect);

router.get('/profile', parentController.getProfile);

export default router;
