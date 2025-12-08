import express from 'express';
import authRouter from './auth.routes.js';
import childRouter from './child.routes.js';

const router = express.Router();

router.use('/api/auth', authRouter);
router.use('/api/child', childRouter);

export default router;
