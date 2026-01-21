import { prisma } from '../prisma.js';
import type { CommunityPostSchema } from '../../schema/forum.schema.js';
import { cleanObject } from '../../helpers/utils.js';
import type { CommentWithVotes } from '../../schema/forum.schema.js';

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
            hasComments: boolean;
        }[]
    >`
SELECT
  p.id,
  p.title,
  LEFT(p.content, 200) AS content,
  p.created_at AS "createdAt",

  EXISTS (
    SELECT 1
    FROM post_comments pc
    WHERE pc.post_id = p.id
        AND pc.is_active = true
    ) AS "hasComments",


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

GROUP BY p.id, p.title, p.content, p.created_at
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

const voteOnPost = async (
    userId: number,
    postId: number,
    vote: CommunityPostSchema['VoteSchema'],
) => {
    const result = await prisma.$transaction(async (tx) => {
        const existingVote = await tx.vote.findFirst({
            where: { parentId: userId, postId },
        });

        if (existingVote) {
            if (existingVote.type === vote.type) {
                await tx.vote.delete({ where: { id: existingVote.id } });
                return null;
            }

            return tx.vote.update({
                where: { id: existingVote.id },
                data: { type: vote.type },
            });
        }

        return tx.vote.create({
            data: {
                parentId: userId,
                postId,
                type: vote.type,
            },
        });
    });

    return result;
};

const voteOnComment = async (
    userId: number,
    commentId: number,
    vote: CommunityPostSchema['VoteSchema'],
) => {
    const result = await prisma.$transaction(async (tx) => {
        const existingVote = await tx.vote.findFirst({
            where: { parentId: userId, commentId },
        });

        if (existingVote) {
            if (existingVote.type === vote.type) {
                await tx.vote.delete({ where: { id: existingVote.id } });
                return null;
            }

            return tx.vote.update({
                where: { id: existingVote.id },
                data: { type: vote.type },
            });
        }

        return tx.vote.create({
            data: {
                parentId: userId,
                commentId,
                type: vote.type,
            },
        });
    });

    return result;
};

const getCommentsForPost = async (
  userId: number,
  postId: number,
  limit: number,
  cursorCreatedAt: Date | null,
  cursorId: number | null,
): Promise<CommentWithVotes[]> => {
  return prisma.$queryRaw<CommentWithVotes[]>`
    SELECT
      c.id,
      c.content,
      c.created_at AS "createdAt",

      COUNT(v.id) FILTER (WHERE v.type = 'UPVOTE') AS upvotes,
      COUNT(v.id) FILTER (WHERE v.type = 'DOWNVOTE') AS downvotes,

      MAX(
        CASE
          WHEN v.parent_id = ${userId} THEN v.type
          ELSE NULL
        END
      ) AS "myVote",

      EXISTS (
        SELECT 1
        FROM post_comments r
        WHERE r.parent_comment_id = c.id
          AND r.is_active = true
      ) AS "hasReplies"

    FROM post_comments c
    LEFT JOIN votes v
      ON v.comment_id = c.id

    WHERE
      c.post_id = ${postId}
      AND c.is_active = true
      AND c.parent_comment_id IS NULL
      AND (
        ${cursorCreatedAt}::timestamp IS NULL
        OR (c.created_at, c.id) > (${cursorCreatedAt}::timestamp, ${cursorId}::integer)
      )

    GROUP BY c.id, c.content, c.created_at
    ORDER BY c.created_at ASC, c.id ASC
    LIMIT ${limit + 1};
  `;
};


const getRepliesForComment = async (
  postId: number,
  userId: number,
  commentId: number,
  limit: number,
  cursorCreatedAt: Date | null,
  cursorId: number | null,
): Promise<CommentWithVotes[]> => {
  return prisma.$queryRaw<CommentWithVotes[]>`
    SELECT
      c.id,
      c.content,
      c.created_at AS "createdAt",

      COUNT(v.id) FILTER (WHERE v.type = 'UPVOTE') AS upvotes,
      COUNT(v.id) FILTER (WHERE v.type = 'DOWNVOTE') AS downvotes,

      MAX(
        CASE
          WHEN v.parent_id = ${userId} THEN v.type
          ELSE NULL
        END
      ) AS "myVote",

      EXISTS (
        SELECT 1
        FROM post_comments r
        WHERE r.parent_comment_id = c.id
          AND r.is_active = true
      ) AS "hasReplies"

    FROM post_comments c
    LEFT JOIN votes v
      ON v.comment_id = c.id

    WHERE
      c.post_id = ${postId}
      AND c.parent_comment_id = ${commentId}
      AND c.is_active = true
      AND (
        ${cursorCreatedAt}::timestamp IS NULL
        OR (c.created_at, c.id) > (${cursorCreatedAt}::timestamp, ${cursorId}::integer)
      )

    GROUP BY c.id, c.content, c.created_at
    ORDER BY c.created_at ASC, c.id ASC
    LIMIT ${limit + 1};
  `;
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
    voteOnPost,
    voteOnComment,
    getCommentsForPost,
    getRepliesForComment,
};
