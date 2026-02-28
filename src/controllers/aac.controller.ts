import { asyncHandler } from '../core/asyncHandler.js';
import type { Request, Response } from 'express';
import { SuccessResponse } from '../core/ApiResponse.js';
import aacRepository from '../db/repository/acc.repository.js';
import { BadRequestError } from '../core/ApiError.js';

const getAAC = asyncHandler(async (_req: Request, res: Response) => {
    const quickSymbols = await aacRepository.getQuickSymbols();
    const categories = await aacRepository.getCategories();
    const response = {
        quickSymbols,
        categories,
    };

    new SuccessResponse('AAC keyboard fetched successfully', response).send(
        res,
    );
});

const getAACCategorySymbols = asyncHandler(
    async (req: Request, res: Response) => {
        const { categoryId } = req.params;
        if (!categoryId || isNaN(parseInt(categoryId))) {
            throw new BadRequestError('Category ID is required');
        }
        const symbols = await aacRepository.getAACCategorySymbols(
            parseInt(categoryId),
        );
        new SuccessResponse(
            'AAC category symbols fetched successfully',
            symbols,
        ).send(res);
    },
);
export default { getAAC, getAACCategorySymbols };
