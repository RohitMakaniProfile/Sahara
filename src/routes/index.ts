import express from 'express';
import authRouter from './auth.routes.js';
import childRouter from './child.routes.js';
import formRouter from './form.routes.js';
import communityPostsRouter from './communityPost.routes.js';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/child', childRouter);
router.use('/form', formRouter);
router.use('/posts', communityPostsRouter);

export default router;
