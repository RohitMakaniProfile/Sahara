import type { Response } from 'express';
import { asyncHandler } from '../core/asyncHandler.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../core/ApiError.js';
import { SuccessResponse } from '../core/ApiResponse.js';
import type { ProtectedRequest } from '../types/app-requests.js';
import type { AISchema } from '../schema/ai.schema.js';
import aiRepository from '../db/repository/ai.repository.js';
import {
    runAdaptiveEngine,
    parentCoachChat,
    generateTherapistReport,
    checkReassessmentNeeded,
    explainRoutineItem,
    getPersonalizedAAC,
} from '../services/ai.services.js';

// Shared ownership check — returns null if not found, throws if forbidden
async function assertChildOwnership(parentId: number, childId: number) {
    const child = await aiRepository.getChildWithContext(childId, parentId);
    if (!child) throw new NotFoundError('Child not found');
    return child;
}

// ---------------------------------------------------------------------------
// GET /api/ai/routine/:childId/adaptive
// Priority 1 — Adaptive Daily Routine Engine
// ---------------------------------------------------------------------------
const getAdaptiveRoutine = asyncHandler<ProtectedRequest>(async (req, res: Response) => {
    const parentId = req.user.parentId;
    const childId = Number(req.params.childId);
    if (isNaN(childId)) throw new BadRequestError('Invalid childId');

    await assertChildOwnership(parentId, childId);

    const query = req.query as unknown as AISchema['AdaptiveRoutineQuery'];

    const plan = await runAdaptiveEngine(childId, parentId, {
        lowEnergy: query.lowEnergy ?? false,
        ...(query.timezone !== undefined ? { timezone: query.timezone } : {}),
    });

    if (!plan) throw new NotFoundError('Child not found');

    new SuccessResponse('Adaptive routine generated', { plan }).send(res);
});

// ---------------------------------------------------------------------------
// GET /api/ai/routine/:childId/items/:itemId/why
// "Why this routine item?" explanation
// ---------------------------------------------------------------------------
const whyThisItem = asyncHandler<ProtectedRequest>(async (req, res: Response) => {
    const parentId = req.user.parentId;
    const childId = Number(req.params.childId);
    const itemId = Number(req.params.itemId);
    if (isNaN(childId) || isNaN(itemId)) throw new BadRequestError('Invalid params');

    await assertChildOwnership(parentId, childId);

    const result = await explainRoutineItem(childId, parentId, itemId);
    if (!result) throw new NotFoundError('Routine item not found');

    new SuccessResponse('Explanation generated', result).send(res);
});

// ---------------------------------------------------------------------------
// POST /api/ai/chat/:childId
// Priority 2 — AI Parent Coach Chat
// ---------------------------------------------------------------------------
const postParentCoachChat = asyncHandler<ProtectedRequest>(async (req, res: Response) => {
    const parentId = req.user.parentId;
    const childId = Number(req.params.childId);
    if (isNaN(childId)) throw new BadRequestError('Invalid childId');

    await assertChildOwnership(parentId, childId);

    const body = req.body as AISchema['ParentCoachChatBody'];

    const result = await parentCoachChat(parentId, childId, body.messages);
    if (!result) throw new NotFoundError('Child not found');

    new SuccessResponse('Coach response', result).send(res);
});

// ---------------------------------------------------------------------------
// GET /api/ai/report/:childId
// Priority 4 — Therapist Progress Report
// ---------------------------------------------------------------------------
const getTherapistReport = asyncHandler<ProtectedRequest>(async (req, res: Response) => {
    const parentId = req.user.parentId;
    const childId = Number(req.params.childId);
    if (isNaN(childId)) throw new BadRequestError('Invalid childId');

    await assertChildOwnership(parentId, childId);

    const report = await generateTherapistReport(childId, parentId);
    if (!report) throw new NotFoundError('Child not found');

    new SuccessResponse('Therapist report generated', { report }).send(res);
});

// ---------------------------------------------------------------------------
// GET /api/ai/reassessment/:childId
// Priority 5 — Reassessment Intelligence
// ---------------------------------------------------------------------------
const getReassessmentCheck = asyncHandler<ProtectedRequest>(async (req, res: Response) => {
    const parentId = req.user.parentId;
    const childId = Number(req.params.childId);
    if (isNaN(childId)) throw new BadRequestError('Invalid childId');

    await assertChildOwnership(parentId, childId);

    const result = await checkReassessmentNeeded(childId, parentId);
    if (!result) throw new NotFoundError('Child not found');

    new SuccessResponse('Reassessment check complete', result).send(res);
});

// ---------------------------------------------------------------------------
// GET /api/ai/aac/:childId/personalized
// Priority 3 — AAC Predictive Intelligence
// ---------------------------------------------------------------------------
const getPersonalizedAACForChild = asyncHandler<ProtectedRequest>(async (req, res: Response) => {
    const parentId = req.user.parentId;
    const childId = Number(req.params.childId);
    if (isNaN(childId)) throw new BadRequestError('Invalid childId');

    await assertChildOwnership(parentId, childId);

    const result = await getPersonalizedAAC(childId, parentId);
    if (!result) throw new NotFoundError('Child not found');

    new SuccessResponse('Personalised AAC retrieved', result).send(res);
});

// ---------------------------------------------------------------------------
// POST /api/ai/aac/:childId/log
// Log AAC symbol usage for a child
// ---------------------------------------------------------------------------
const logAACUsage = asyncHandler<ProtectedRequest>(async (req, res: Response) => {
    const parentId = req.user.parentId;
    const childId = Number(req.params.childId);
    if (isNaN(childId)) throw new BadRequestError('Invalid childId');

    await assertChildOwnership(parentId, childId);

    const body = req.body as AISchema['AACLogBody'];

    await aiRepository.logAACUsage(childId, body.symbolIds);

    new SuccessResponse('AAC usage logged', {
        childId,
        count: body.symbolIds.length,
    }).send(res);
});

export default {
    getAdaptiveRoutine,
    whyThisItem,
    postParentCoachChat,
    getTherapistReport,
    getReassessmentCheck,
    getPersonalizedAACForChild,
    logAACUsage,
};
