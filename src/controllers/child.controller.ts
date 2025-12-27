import { asyncHandler } from '../core/asyncHandler.js';
import type { Response } from 'express';
import type { ProtectedRequest } from '../types/app-requests.js';
import childRepository from '../db/repository/child.repository.js';
import { SuccessResponse } from '../core/ApiResponse.js';

const childRegister = asyncHandler<ProtectedRequest>(
    async (req: ProtectedRequest, res: Response) => {
        const parentId = req.user.parentId;

        const { name, dob, gender, relationWithParent } = req.body;

        const parsedDob = new Date(dob);

        const child = await childRepository.create({
            name,
            dob: parsedDob,
            gender,
            relationWithParent,
            parentId,
        });

        new SuccessResponse('Child Registered', {
            child: { id: child.id, name: child.name, dob: child.dob },
        }).send(res);
    },
);

export default {
    childRegister,
};
