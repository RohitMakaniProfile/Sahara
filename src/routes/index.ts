import express from 'express';
import authRouter from './auth.routes.js';
import childRouter from './child.routes.js';
import formRouter from './form.routes.js';

const router = express.Router();

router.use('/api/auth', authRouter);
router.use('/api/child', childRouter);

router.use('/api', formRouter);

export default router;
