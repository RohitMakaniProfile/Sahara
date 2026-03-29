import express from 'express';
import authRouter from './auth.routes.js';
import childRouter from './child.routes.js';
import formRouter from './form.routes.js';
import communityPostsRouter from './communityPost.routes.js';
import activityRouter from './activity.routes.js';
import routineRouter from './routine.routes.js';
import parentRouter from './parent.routes.js';
import accRouter from './acc.routes.js';
import aiRouter from './ai.routes.js';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/parent', parentRouter);
router.use('/child', childRouter);
router.use('/form', formRouter);
router.use('/posts', communityPostsRouter);
router.use('/activity', activityRouter);
router.use('/routine', routineRouter);
router.use('/acc', accRouter);
router.use('/ai', aiRouter);
export default router;
