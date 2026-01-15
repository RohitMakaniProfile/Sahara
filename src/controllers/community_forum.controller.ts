import type { Response, Request } from 'express';
import type { ProtectedRequest } from '../types/app-requests.js';
import { asyncHandler } from '../core/asyncHandler.js';
import forumRepository from '../db/repository/community_forum.repository.js';
import { BadRequestError } from '../core/ApiError.js';
import { SuccessResponse } from '../core/ApiResponse.js';

const createForumPost = asyncHandler<ProtectedRequest>(
    async (req, res: Response) => {
        const parentId = req.user?.parentId;
        const title = req.body.title;
        const content = req.body.content;

        if (!parentId) throw new BadRequestError('Unauthorized');

        const post = await forumRepository.createNewForumPost({
            title: title,
            content: content,
            author: { connect: { id: parentId } },
        });

        new SuccessResponse('Forum post created', post).send(res);
    },
);
const getForumPosts = asyncHandler(async (req: Request, res: Response) => {
    const limitFromQuery = Number(req.query.limit);
    const skipFromQuery = Number(req.query.skip);

    const limit =
        Number.isFinite(limitFromQuery) && limitFromQuery > 0
            ? limitFromQuery
            : 10;

    const skip =
        Number.isFinite(skipFromQuery) && skipFromQuery >= 0
            ? skipFromQuery
            : 0;

    const { posts, total } = await forumRepository.getAllForumPosts({
        limit,
        skip,
    });
    const hasMore = skip + posts.length < total;

    new SuccessResponse('Forum posts retrieved', {
        posts,
        total,
        limit,
        skip,
        hasMore,
    }).send(res);
});

export default { createForumPost, getForumPosts };
