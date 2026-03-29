import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import videoController from '../controllers/video.controller.js';

const router = Router();

router.use(protect);

router.get('/',            videoController.getAllVideos);
router.get('/categories',  videoController.getCategories);
router.get('/parent',      videoController.getParentVideos);
router.get('/children',    videoController.getChildrenVideos);

export default router;
