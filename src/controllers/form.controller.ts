import type { Request, Response } from 'express';
import { asyncHandler } from '../core/asyncHandler.js';
import { SuccessResponse } from '../core/ApiResponse.js';
import type { QuestionnaireCategoryDTO } from '../types/form.js';
import formRepository from '../db/repository/form.repository.js';
import type { ProtectedRequest } from '../types/app-requests.js';
import { BadRequestError } from '../core/ApiError.js';
import formservices from '../services/form.services.js';

const getForm = asyncHandler(async (_req: Request, res: Response) => {
    const form = await formRepository.getFormStructure();
    const payload: QuestionnaireCategoryDTO[] = form.map((c) => ({
        id: c.id,
        name: c.name,
        questions: c.questions.map((q) => ({
            id: q.id,
            text: q.question,
            weight: q.weight,
            order: q.order,
        })),
    }));
    new SuccessResponse('Form fetched successfully', payload).send(res);
});

const formSubmissionData = asyncHandler<ProtectedRequest>(
    async (req: ProtectedRequest, res: Response) => {
        const parentId = req.user?.parentId;
        const { childId, answers } = req.body;

        const childIdValidity = await formRepository.isChildBelongsToParent(
            childId,
        );
        if (!(childIdValidity?.parentId === parentId)) {
            throw new BadRequestError('Child does not belong to the parent');
        }
        const allValidQuestionData =
            await formRepository.allValidQuestionsData(answers);
        if (!allValidQuestionData) {
            throw new BadRequestError('One or more questionIds are invalid');
        }
        const submissionData = await formRepository.createFormSubmission(
            answers,
            childId,
            parentId,
        );
        const categoryOutputs =
            formservices.categoryCalculation(submissionData);

        const categoryOutputData = categoryOutputs.map((co) => ({
            formId: submissionData.id,
            categoryId: co.categoryId,
            totalScore: co.totalScore,
            maxPossibleScore: co.maxPossibleScore,
            normalizedScore: co.normalizedScore,
        }));

        await formRepository.saveCategoryOutputs(categoryOutputData);

        new SuccessResponse('Form submitted successfully', {
            formID: submissionData.id,
        }).send(res);
    },
);

export default { getForm, formSubmissionData };
