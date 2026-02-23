import { asyncHandler } from '../core/asyncHandler.js';
import type { Response } from 'express';
import type { ProtectedRequest } from '../types/app-requests.js';
import childRepository from '../db/repository/child.repository.js';
import { SuccessResponse } from '../core/ApiResponse.js';
import { BadRequestError } from '../core/ApiError.js';
import childServices from '../services/child.services.js';


const childRegister = asyncHandler<ProtectedRequest>(
    async (req: ProtectedRequest, res: Response) => {
        const parentId = req.user.parentId;

        const { name, dob, gender, relationWithParent } = req.body;

        const parsedDob = new Date(dob);
        const age = childServices.calculateAge(parsedDob);

        const child = await childRepository.create({
            name,
            dob: parsedDob,
            gender,
            relationWithParent,
            parentId,
        });

        new SuccessResponse('Child Registered', {
            child: { id: child.id, name: child.name, dob: child.dob ,age},
        }).send(res);
    },
);
const getChildLatestFormResults = asyncHandler<ProtectedRequest>(
    async (req: ProtectedRequest, res: Response) => {
        const parentId = req.user?.parentId;
        const childId = Number(req.params?.childId);
        if (isNaN(childId)) {
            throw new BadRequestError('Invalid childId');
        }

        const result = await childRepository.latestFormResults(
            childId,
            parentId,
        );

        if (!result) {
            new SuccessResponse(
                'No assessment results found for the child',
                null,
            ).send(res);
            return;
        }

        const response = {
            formId: result.id,
            submittedAt: result.createdAt,
            categories: result.categoryOutputs.map((co) => ({
                category: {
                    id: co.category.id,
                    name: co.category.name,
                },
                totalScore: co.totalScore,
                maxPossibleScore: co.maxPossibleScore,
                normalizedScore: co.normalizedScore,
                severity:
                    co.normalizedScore >= 80
                        ? 'High'
                        : co.normalizedScore >= 50
                          ? 'Medium'
                          : 'Low',
            })),
        };

        new SuccessResponse(
            'Latest assessment retrieved successfully',
            response,
        ).send(res);
    },
);

export default {
    childRegister,
    getChildLatestFormResults,
};
