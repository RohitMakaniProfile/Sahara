import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import aacController from '../controllers/aac.controller.js';

const router = Router();

router.use(protect);
router.get('/', aacController.getAAC);
router.get('/:categoryId/symbols', aacController.getAACCategorySymbols);

export default router;
