import { asyncHandler } from '../core/asyncHandler.js';
import type { Response } from 'express';
import type { ProtectedRequest } from '../types/app-requests.js';
import childRepository from '../db/repository/child.repository.js';
import { SuccessCreatedResponse, SuccessResponse } from '../core/ApiResponse.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../core/ApiError.js';
import childServices from '../services/child.services.js';
import type { ChildSchema } from '../schema/child.schema.js';

const childRegister = asyncHandler<ProtectedRequest>(
    async (req: ProtectedRequest, res: Response) => {
        const parentId = req.user.parentId;

        const {
            name,
            dob,
            gender,
            relationWithParent,
            knownDiagnosis,
            diagnosisStage,
            developmentalStage,
            dominantHand,
        } = req.body;

        const parsedDob = dob instanceof Date ? dob : new Date(dob);
        const age = childServices.calculateAge(parsedDob);

        const child = await childRepository.create({
            name,
            dob: parsedDob,
            gender,
            relationWithParent,
            ...(knownDiagnosis !== undefined ? { knownDiagnosis } : {}),
            ...(diagnosisStage !== undefined ? { diagnosisStage } : {}),
            ...(developmentalStage !== undefined ? { developmentalStage } : {}),
            ...(dominantHand !== undefined ? { dominantHand } : {}),
            parentId,
        });

        new SuccessCreatedResponse('Child Registered', {
            child: { id: child.id, name: child.name, dob: child.dob, age },
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

const listChildren = asyncHandler<ProtectedRequest>(
    async (req: ProtectedRequest, res: Response) => {
        const parentId = req.user.parentId;
        const children = await childRepository.listByParentId(parentId);

        new SuccessResponse('Children retrieved', {
            children: children.map((c) => ({
                id: c.id,
                name: c.name,
                dob: c.dob,
                age: childServices.calculateAge(c.dob),
                gender: c.gender,
                relationWithParent: c.relationWithParent,
            })),
        }).send(res);
    },
);

const getChildProfile = asyncHandler<ProtectedRequest>(
    async (req: ProtectedRequest, res: Response) => {
        const parentId = req.user?.parentId;
        const childId = Number(req.params?.childId);
        if (Number.isNaN(childId)) throw new BadRequestError('Invalid childId');

        const child = await childRepository.findById(childId);
        if (!child) throw new NotFoundError('Child not found');
        if (child.parentId !== parentId) {
            throw new ForbiddenError('Not allowed');
        }

        const age = childServices.calculateAge(child.dob);

        new SuccessResponse('Child retrieved', {
            child: {
                id: child.id,
                name: child.name,
                dob: child.dob,
                age,
                gender: child.gender,
                relationWithParent: child.relationWithParent,
                knownDiagnosis: child.knownDiagnosis,
                diagnosisStage: child.diagnosisStage,
                developmentalStage: child.developmentalStage,
                dominantHand: child.dominantHand,
                parentId: child.parentId,
                createdAt: child.createdAt,
                updatedAt: child.updatedAt,
            },
        }).send(res);
    },
);

const updateChildProfile = asyncHandler<ProtectedRequest>(
    async (req: ProtectedRequest, res: Response) => {
        const parentId = req.user.parentId;
        const childId = Number(req.params.childId);
        if (Number.isNaN(childId)) throw new BadRequestError('Invalid childId');

        const existing = await childRepository.findById(childId);
        if (!existing) throw new NotFoundError('Child not found');
        if (existing.parentId !== parentId) {
            throw new ForbiddenError('Not allowed');
        }

        const body = req.body as ChildSchema['ChildUpdate'];

        const updated = await childRepository.updateById(childId, {
            ...(body.name !== undefined ? { name: body.name } : {}),
            ...(body.dob !== undefined ? { dob: body.dob } : {}),
            ...(body.gender !== undefined ? { gender: body.gender } : {}),
            ...(body.relationWithParent !== undefined
                ? { relationWithParent: body.relationWithParent }
                : {}),
            ...(body.knownDiagnosis !== undefined
                ? { knownDiagnosis: body.knownDiagnosis }
                : {}),
            ...(body.diagnosisStage !== undefined
                ? { diagnosisStage: body.diagnosisStage }
                : {}),
            ...(body.developmentalStage !== undefined
                ? { developmentalStage: body.developmentalStage }
                : {}),
            ...(body.dominantHand !== undefined
                ? { dominantHand: body.dominantHand }
                : {}),
        });

        const age = childServices.calculateAge(updated.dob);

        new SuccessResponse('Child updated', {
            child: {
                id: updated.id,
                name: updated.name,
                dob: updated.dob,
                age,
                gender: updated.gender,
                relationWithParent: updated.relationWithParent,
                knownDiagnosis: updated.knownDiagnosis,
                diagnosisStage: updated.diagnosisStage,
                developmentalStage: updated.developmentalStage,
                dominantHand: updated.dominantHand,
            },
        }).send(res);
    },
);

export default {
    childRegister,
    getChildLatestFormResults,
    listChildren,
    getChildProfile,
    updateChildProfile,
};
