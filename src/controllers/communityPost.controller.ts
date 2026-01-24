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
import _ from 'lodash';

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
    const cursorCreatedAt = req.query.cursorCreatedAt
        ? new Date(req.query.cursorCreatedAt as string)
        : null;
    const cursorId = req.query.cursorId ? Number(req.query.cursorId) : null;
    const limit = Number(req.query.limit ?? 10);
    const posts = await postRepository.getAllPosts(
        req.user.parentId,
        Number(limit),
        cursorCreatedAt,
        cursorId,
    );

    if (posts.length === 0) {
        new SuccessResponse('No community posts', {
            posts,
            hasMore: false,
            nextCursor: {
                createdAt: null,
                id: null,
            },
        }).send(res);
        return;
    }

    const hasMore = posts.length > limit;
    if (hasMore) posts.pop();
    const lastPost = posts[posts.length - 1];

    new SuccessResponse('Forum posts retrieved', {
        posts: posts.map((post) => ({
            ...post,
            id: Number(post.id),
            commentCount: post.commentCount.toString(),
            upvotes: post.upvotes.toString(),
            downvotes: post.downvotes.toString(),
            hasComments: post.hasComments,
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

const voteOnPost = asyncHandler<ProtectedRequest>(async (req, res) => {
    const postId = Number(req.params.postId);
    const vote = req.body as CommunityPostSchema['VoteSchema'];

    await verifyPostExist(postId);

    const result = await postRepository.voteOnPost(
        req.user.parentId,
        postId,
        vote,
    );
    new SuccessResponse('Vote action processed', {
        postId,
        action: result ? 'APPLIED' : 'REMOVED',
        voteType: result?.type ?? null,
    }).send(res);
});

const voteOnComment = asyncHandler<ProtectedRequest>(async (req, res) => {
    const postId = Number(req.params.postId);
    const commentId = Number(req.params.commentId);
    const vote = req.body as CommunityPostSchema['VoteSchema'];

    await verifyPostExist(postId);
    const comment = await checkComment(commentId);

    if (comment.postId !== postId)
        throw new NotFoundError('Comment not found for this post.');

    const result = await postRepository.voteOnComment(
        req.user.parentId,
        commentId,
        vote,
    );
    new SuccessResponse('Vote action processed', {
        commentId,
        action: result ? 'APPLIED' : 'REMOVED',
        voteType: result?.type ?? null,
    }).send(res);
});

const getCommentsForPost = asyncHandler<ProtectedRequest>(async (req, res) => {
    const postId = Number(req.params.postId);
    await verifyPostExist(postId);

    const cursorCreatedAt = req.query.cursorCreatedAt
        ? new Date(req.query.cursorCreatedAt as string)
        : null;
    const cursorId = req.query.cursorId ? Number(req.query.cursorId) : null;
    const limit = Number(req.query.limit ?? 10);

    const comments = await postRepository.getCommentsForPost(
        req.user.parentId,
        postId,
        Number(limit),
        cursorCreatedAt,
        cursorId,
    );

    if (comments.length === 0) {
        new SuccessResponse('No comments for this post', {
            comments,
            hasMore: false,
            nextCursor: {
                createdAt: null,
                id: null,
            },
        }).send(res);
        return;
    }

    const hasMore = comments.length > limit;
    if (hasMore) comments.pop();
    const lastComment = comments[comments.length - 1];

    new SuccessResponse('Comments retrieved', {
        comments: comments.map((comment) => ({
            ..._.omit(comment, ['content']),
            id: Number(comment.id),
            upvotes: comment.upvotes.toString(),
            downvotes: comment.downvotes.toString(),
            hasReplies: comment.hasReplies,
            ...(comment.isActive ? { content: comment.content } : {}),
        })),
        nextCursor: {
            id: lastComment?.id,
            createdAt: lastComment?.createdAt,
        },
        hasMore,
    }).send(res);
});

const getRepliesForComment = asyncHandler<ProtectedRequest>(
    async (req, res) => {
        const postId = Number(req.params.postId);
        const commentId = Number(req.params.commentId);
        await verifyPostExist(postId);
        const comment = await checkComment(commentId);

        if (comment.postId !== postId)
            throw new NotFoundError('Comment not found for this post.');

        const cursorCreatedAt = req.query.cursorCreatedAt
            ? new Date(req.query.cursorCreatedAt as string)
            : null;
        const cursorId = req.query.cursorId ? Number(req.query.cursorId) : null;
        const limit = Number(req.query.limit ?? 10);
        const replies = await postRepository.getRepliesForComment(
            postId,
            req.user.parentId,
            commentId,
            Number(limit),
            cursorCreatedAt,
            cursorId,
        );

        if (replies.length === 0) {
            new SuccessResponse('No replies for this comment', {
                replies,
                hasMore: false,
                nextCursor: {
                    createdAt: null,
                    id: null,
                },
            }).send(res);
            return;
        }

        const hasMore = replies.length > limit;
        if (hasMore) replies.pop();
        const lastReply = replies[replies.length - 1];

        new SuccessResponse('Replies retrieved', {
            replies: replies.map((reply) => ({
                ...reply,
                id: Number(reply.id),
                upvotes: reply.upvotes.toString(),
                downvotes: reply.downvotes.toString(),
                hasReplies: reply.hasReplies,
            })),
            nextCursor: {
                id: lastReply?.id,
                createdAt: lastReply?.createdAt,
            },
            hasMore,
        }).send(res);
    },
);

export default {
    createCommunityPost,
    getCommunityPosts,
    updateCommunityPost,
    deletePost,
    getPostDetails,
    createComment,
    updateComment,
    deleteComment,
    voteOnPost,
    voteOnComment,
    getCommentsForPost,
    getRepliesForComment,
};
