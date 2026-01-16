import { prisma } from '../prisma.js';
import type { CommunityPostSchema } from '../../schema/forum.schema.js';
import { cleanObject } from '../../helpers/utils.js';

const createNewPost = async (
    title: string,
    content: string,
    parentId: number,
) => {
    // Implementation for creating a new forum post in the database
    const postdata = await prisma.communityPost.create({
        data: {
            title,
            content,
            authorId: parentId,
        },
    });
    return postdata;
};

const getAllPosts = async ({
    limit,
    skip,
}: {
    limit: number;
    skip: number;
}) => {
    const [posts, total] = await prisma.$transaction([
        prisma.communityPost.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                content: true,
                createdAt: true,
                updatedAt: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        }),
        // total posts count
        prisma.communityPost.count(),
    ]);

    return {
        posts,
        total,
    };
};

const checkPostById = async (posId: number) => {
    return await prisma.communityPost.findUnique({
        where: {
            id: posId,
        },
        select: {
            id: true,
            authorId: true
        },
    });
};

const updatePost = async (
    postId: number,
    updateData: CommunityPostSchema['UpdateCommunityPost'],
) => {
    return await prisma.communityPost.update({
        where: {
            id: postId,
        },
        data: cleanObject(updateData),
    });
};

const deletePost = async (postId: number) => {
    return await prisma.communityPost.delete({
        where: {
            id: postId,
        },
    });
};

const getPostById = async (postId: number) => {
    return await prisma.communityPost.findUnique({
        where: { id: postId },
        select: {
            id: true,
            title: true,
            content: true,
            author: {
                select: {
                    id: true,
                    name: true,
                },
            },
            createdAt: true,
        },
    });
};

const createComment = async (
    authorId: number,
    postId: number,
    commentData: CommunityPostSchema['CreateComment'],
) => {
    return await prisma.postComment.create({
        data: {
            postId,
            authorId,
            ...commentData,
        },
    });
};

export default {
    createNewPost,
    getAllPosts,
    checkPostById,
    updatePost,
    deletePost,
    getPostById,
    createComment
};
