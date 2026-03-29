import { asyncHandler } from '../core/asyncHandler.js';
import type { Response } from 'express';
import type { ProtectedRequest } from '../types/app-requests.js';
import { SuccessResponse } from '../core/ApiResponse.js';
import videos from '../data/videos.data.js';

// GET /api/videos
// Optional query: ?audience=parent|child  ?category=Motor Skills  ?tag=fine-motor
const getAllVideos = asyncHandler<ProtectedRequest>(
    async (req: ProtectedRequest, res: Response) => {
        const { audience, category, tag } = req.query as Record<string, string>;

        let result = videos;

        if (audience === 'parent' || audience === 'child') {
            result = result.filter((v) => v.audience === audience);
        }

        if (category) {
            const cat = category.toLowerCase();
            result = result.filter((v) => v.category.toLowerCase() === cat);
        }

        if (tag) {
            const t = tag.toLowerCase();
            result = result.filter((v) => v.tags.includes(t));
        }

        new SuccessResponse('Videos fetched successfully', { videos: result }).send(res);
    },
);

// GET /api/videos/parent
const getParentVideos = asyncHandler<ProtectedRequest>(
    async (_req: ProtectedRequest, res: Response) => {
        const result = videos.filter((v) => v.audience === 'parent');

        const grouped = result.reduce<Record<string, typeof result>>(
            (acc, v) => {
                const key = v.category;
                if (!acc[key]) acc[key] = [];
                (acc[key] as typeof result).push(v);
                return acc;
            },
            {},
        );

        new SuccessResponse('Parent guidance videos fetched', {
            total: result.length,
            categories: grouped,
        }).send(res);
    },
);

// GET /api/videos/children
const getChildrenVideos = asyncHandler<ProtectedRequest>(
    async (_req: ProtectedRequest, res: Response) => {
        const result = videos.filter((v) => v.audience === 'child');

        const grouped = result.reduce<Record<string, typeof result>>(
            (acc, v) => {
                const key = v.category;
                if (!acc[key]) acc[key] = [];
                (acc[key] as typeof result).push(v);
                return acc;
            },
            {},
        );

        new SuccessResponse('Children videos fetched', {
            total: result.length,
            categories: grouped,
        }).send(res);
    },
);

// GET /api/videos/categories
const getCategories = asyncHandler<ProtectedRequest>(
    async (_req: ProtectedRequest, res: Response) => {
        const parentCats = [...new Set(
            videos.filter((v) => v.audience === 'parent').map((v) => v.category),
        )];
        const childCats = [...new Set(
            videos.filter((v) => v.audience === 'child').map((v) => v.category),
        )];

        new SuccessResponse('Categories fetched', {
            parent: parentCats,
            child: childCats,
        }).send(res);
    },
);

export default {
    getAllVideos,
    getParentVideos,
    getChildrenVideos,
    getCategories,
};
