import { Router } from 'express';
import { SuccessMsgResponse } from '../core/ApiResponse.js';

const router = Router();

router.get('/health', (_req, res) => {
    new SuccessMsgResponse(
        'Sahara Backend application is healthy and running.',
    ).send(res);
});

export default router;
