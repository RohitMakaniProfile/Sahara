import { asyncHandler } from '../core/asyncHandler.js';
import type { ProtectedRequest } from '../types/app-requests.js';
import { BadRequestError } from '../core/ApiError.js';
import { SuccessResponse } from '../core/ApiResponse.js';
import formRepository from '../db/repository/form.repository.js';
import recommendationService from '../services/activity.services.js';

const getActivities = asyncHandler<ProtectedRequest>(async (req, res) => {
    const childId = Number(req.params?.childId);
    if (isNaN(childId)) {
        throw new BadRequestError('Invalid childId');
    }

    // 1️⃣ Get latest form for child
    const latestForm = await formRepository.getLatestFormByChildId(childId);

    if (!latestForm) {
        throw new BadRequestError('No assessment found.');
    }

    // 2️⃣ Extract weighted tags
    const weightedTags = recommendationService.extractPriorityTags(
        latestForm.questionResponses,
    );

    // 3️⃣ Fetch ranked activities
    const activities =
        await recommendationService.getRankedActivities(weightedTags);

    new SuccessResponse('Recommendations fetched', activities).send(res);
});

export default {
    getActivities,
};
