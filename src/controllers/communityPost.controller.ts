import type { Response, Request } from 'express';
import type { ProtectedRequest } from '../types/app-requests.js';
import { asyncHandler } from '../core/asyncHandler.js';
import postRepository from '../db/repository/communityForum.repository.js';
import {
    SuccessCreatedResponse,
    SuccessDeletionResponse,
    SuccessResponse,
} from '../core/ApiResponse.js';
import { ForbiddenError, NotFoundError } from '../core/ApiError.js';
import type { CommunityPostSchema } from '../schema/forum.schema.js';

async function verifyPostExist(postId: number) {
    const post = await postRepository.checkPostById(postId);
    if (!post) throw new NotFoundError('No Post exists with given ID.');
    return post;
}

function verifyOwnershipOfThePost(postAuthorId: number, currentUserId: number) {
    if (postAuthorId !== currentUserId)
        throw new ForbiddenError('Not allowed to edit the post.');
}

const createCommunityPost = asyncHandler<ProtectedRequest>(
    async (req, res: Response) => {
        const parentId = req.user.parentId;
        const title = req.body.title;
        const content = req.body.content;

        const post = await postRepository.createNewPost(
            title,
            content,
            parentId,
        );

        new SuccessCreatedResponse('Forum post created', post).send(res);
    },
);

const getCommunityPosts = asyncHandler(async (req: Request, res: Response) => {
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

    const { posts, total } = await postRepository.getAllPosts({
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

const updateCommunityPost = asyncHandler<ProtectedRequest>(async (req, res) => {
    const postId = Number(req.params.postId);

    const post = await verifyPostExist(postId);

    verifyOwnershipOfThePost(post.authorId, req.user.parentId);

    const updatedPost = await postRepository.updatePost(
        postId,
        req.body as CommunityPostSchema['UpdateCommunityPost'],
    );

    new SuccessResponse('Post updated successfully.', updatedPost).send(res);
});

const deletePost = asyncHandler<ProtectedRequest>(async (req, res) => {
    const postId = Number(req.params.postId);

    const post = await verifyPostExist(postId);
    verifyOwnershipOfThePost(post.authorId, req.user.parentId);

    await postRepository.deletePost(postId);

    new SuccessDeletionResponse().send(res);
});

const getPostDetails = asyncHandler(async (req, res) => {
    const postId = Number(req.params.postId);

    const post = await postRepository.getPostById(postId);
    if (!post) throw new NotFoundError('No Post exists with given ID.');

    new SuccessResponse('Post Found.', post).send(res);
});

const createComment = asyncHandler<ProtectedRequest>(async (req, res) => {
    const postId = Number(req.params.postId);
    await verifyPostExist(postId);

    const createdComment = await postRepository.createComment(
        req.user.parentId,
        postId,
        req.body as CommunityPostSchema['CreateComment'],
    );

    new SuccessCreatedResponse('Comment Created.', createdComment).send(res);
});

export default {
    createCommunityPost,
    getCommunityPosts,
    updateCommunityPost,
    deletePost,
    getPostDetails,
    createComment,
};
