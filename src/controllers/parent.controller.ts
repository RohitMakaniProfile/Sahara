import type { Response } from 'express';
import { asyncHandler } from '../core/asyncHandler.js';
import parentRepository from '../db/repository/parent.repository.js';
import type { ProtectedRequest } from '../types/app-requests.js';
import { NotFoundError } from '../core/ApiError.js';
import { SuccessResponse } from '../core/ApiResponse.js';

const getProfile = asyncHandler<ProtectedRequest>(async (req, res: Response) => {
    const parentId = req.user.parentId;
    const parent = await parentRepository.findProfileById(parentId);
    if (!parent) throw new NotFoundError('Parent not found');

    new SuccessResponse('Parent profile retrieved', { parent }).send(res);
});

export default { getProfile };

