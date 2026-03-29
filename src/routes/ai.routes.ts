import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { validator } from '../middlewares/validator.middleware.js';
import { ValidationSource } from '../helpers/validator.js';
import aiController from '../controllers/ai.controller.js';
import aiSchema from '../schema/ai.schema.js';

const router = Router();

router.use(protect);

// Priority 1 — Adaptive Daily Routine Engine
// GET /api/ai/routine/:childId/adaptive?lowEnergy=false&timezone=Asia/Kolkata
router.get('/routine/:childId/adaptive', aiController.getAdaptiveRoutine);

// "Why this routine item?" — one-sentence AI explanation
// GET /api/ai/routine/:childId/items/:itemId/why
router.get('/routine/:childId/items/:itemId/why', aiController.whyThisItem);

// Priority 2 — AI Parent Coach Chat
// POST /api/ai/chat/:childId
router.post(
    '/chat/:childId',
    validator(aiSchema.ParentCoachChatBody, ValidationSource.BODY),
    aiController.postParentCoachChat,
);

// Priority 4 — Therapist Progress Report
// GET /api/ai/report/:childId
router.get('/report/:childId', aiController.getTherapistReport);

// Priority 5 — Reassessment Intelligence
// GET /api/ai/reassessment/:childId
router.get('/reassessment/:childId', aiController.getReassessmentCheck);

// Priority 3 — AAC Predictive Intelligence
// GET /api/ai/aac/:childId/personalized
router.get('/aac/:childId/personalized', aiController.getPersonalizedAACForChild);

// Log AAC symbol usage
// POST /api/ai/aac/:childId/log
router.post(
    '/aac/:childId/log',
    validator(aiSchema.AACLogBody, ValidationSource.BODY),
    aiController.logAACUsage,
);

export default router;
