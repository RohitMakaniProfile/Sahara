import type { Prisma } from '@prisma/client';
import { prisma } from '../prisma.js';

const createNewForumPost = async (data: Prisma.ForumPostCreateInput) => {
    // Implementation for creating a new forum post in the database
    const postdata = await prisma.forumPost.create({
        data,
    });
    return postdata;
};
const getAllForumPosts = async ({
    limit,
    skip,
}: {
    limit: number;
    skip: number;
}) => {
    const [posts, total] = await prisma.$transaction([
        prisma.forumPost.findMany({
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
        prisma.forumPost.count(),
    ]);

    return {
        posts,
        total,
    };
};

export default {
    createNewForumPost,
    getAllForumPosts,
};
