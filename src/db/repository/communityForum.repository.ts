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

const getAllPosts = async (
    userId: number,
    limit: number,
    cursorCreatedAt: Date | null,
    cursorId: number | null,
) => {
    const posts = await prisma.$queryRaw<
        {
            id: bigint;
            title: string;
            content: string;
            commentCount: bigint;
            upvotes: bigint;
            downvotes: bigint;
            myVote: 'UPVOTE' | 'DOWNVOTE' | null;
            createdAt: Date;
        }[]
    >`
SELECT
  p.id,
  p.title,
  LEFT(p.content, 200) AS content,
  p.created_at AS "createdAt",

  COUNT(DISTINCT c.id) AS "commentCount",

  COUNT(DISTINCT v.id) FILTER (WHERE v.type = 'UPVOTE') AS upvotes,
  COUNT(DISTINCT v.id) FILTER (WHERE v.type = 'DOWNVOTE') AS downvotes,

  MAX(
    CASE
      WHEN v.parent_id = ${userId} THEN v.type
      ELSE NULL
    END
  ) AS "myVote"

FROM community_posts p

LEFT JOIN post_comments c
  ON c.post_id = p.id AND c.is_active = true

LEFT JOIN votes v
  ON v.post_id = p.id

WHERE
  p.is_active = true
  AND (
    ${cursorCreatedAt}::timestamp IS NULL
    OR (p.created_at, p.id) < (${cursorCreatedAt}::timestamp, ${cursorId}::integer)
  )

GROUP BY p.id
ORDER BY p.created_at DESC, p.id DESC
LIMIT ${limit + 1};
`;
    return posts;
};

const checkPostById = async (posId: number) => {
    return await prisma.communityPost.findUnique({
        where: {
            id: posId,
            isActive: true,
        },
        select: {
            id: true,
            authorId: true,
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

const softDeletePost = async (postId: number) => {
    return await prisma.communityPost.update({
        where: {
            id: postId,
        },
        data: {
            isActive: true,
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

const checkCommentById = async (commentId: number) => {
    return await prisma.postComment.findUnique({
        where: { id: commentId },
    });
};

const updateComment = async (commentId: number, content: string) => {
    return await prisma.postComment.update({
        where: { id: commentId },
        data: {
            content,
        },
    });
};

const softDeleteComment = async (commentId: number) => {
    return await prisma.postComment.update({
        where: { id: commentId },
        data: {
            isActive: false,
        },
    });
};

export default {
    createNewPost,
    getAllPosts,
    checkPostById,
    updatePost,
    softDeletePost,
    getPostById,
    createComment,
    checkCommentById,
    updateComment,
    softDeleteComment,
};
