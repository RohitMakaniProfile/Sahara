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

const createCommunityPost = asyncHandler<ProtectedRequest>(async (req, res) => {
    const parentId = req.user.parentId;
    const title = req.body.title;
    const content = req.body.content;

    const post = await postRepository.createNewPost(title, content, parentId);

    new SuccessCreatedResponse('Forum post created', post).send(res);
});

const getCommunityPosts = asyncHandler<ProtectedRequest>(async (req, res) => {
    const cursorCreatedAt = req.params.cursorCreatedAt
        ? new Date(req.params.cursorCreatedAt)
        : null;
    const cursorId = req.params.cursorId ? Number(req.params.cursorId) : null;
    const limit = Number(req.params.limit ?? 10);

    const posts = await postRepository.getAllPosts(
        req.user.parentId,
        Number(limit),
        cursorCreatedAt,
        cursorId,
    );

    if (posts.length === 0)
        new SuccessResponse('No community posts', {
            posts,
            hasMore: false,
            nextCursor: {
                createdAt: null,
                id: null,
            },
        }).send(res);

    const hasMore = posts.length > limit;
    if (hasMore) posts.pop();
    const lastPost = posts[posts.length - 1];

    new SuccessResponse('Forum posts retrieved', {
        posts: posts.map(post => ({ 
            ...post, 
            id: Number(post.id),
            commentCount: post.commentCount.toString(),
            upvotes: post.upvotes.toString(),
            downvotes: post.downvotes.toString()
        })),
        nextCursor: {
            id: lastPost?.id,
            createdAt: lastPost?.createdAt,
        },
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

    await postRepository.softDeletePost(postId);

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

async function checkComment(commentId: number) {
    const comment = await postRepository.checkCommentById(commentId);
    if (!comment) throw new NotFoundError('No comment found with given ID.');

    return comment;
}

const updateComment = asyncHandler<ProtectedRequest>(async (req, res) => {
    const commentId = Number(req.params.commentId);
    const postId = Number(req.params.postId);

    const comment = await checkComment(commentId);

    if (comment.postId !== postId)
        throw new NotFoundError('Comment not found for this post.');

    if (comment.authorId !== req.user.parentId)
        throw new ForbiddenError('Comment does not belong to the user.');

    const updatedComment = await postRepository.updateComment(
        commentId,
        req.body.content,
    );

    new SuccessResponse('Comment updated successfully.', updatedComment).send(
        res,
    );
});

const deleteComment = asyncHandler<ProtectedRequest>(async (req, res) => {
    const commentId = Number(req.params.commentId);
    const postId = Number(req.params.postId);

    const comment = await checkComment(commentId);

    if (comment.postId !== postId)
        throw new NotFoundError('Comment not found for this post.');

    if (comment.authorId !== req.user.parentId)
        throw new ForbiddenError('Comment does not belong to the user.');

    await postRepository.softDeleteComment(commentId);

    new SuccessDeletionResponse().send(res);
});

export default {
    createCommunityPost,
    getCommunityPosts,
    updateCommunityPost,
    deletePost,
    getPostDetails,
    createComment,
    updateComment,
    deleteComment,
};
