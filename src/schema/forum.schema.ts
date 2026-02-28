import z from 'zod';

const CreateCommunityPost = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    content: z.string().min(10, 'Content must be at least 10 characters'),
});

const CreateComment = z.object({
    content: z.string().min(2, 'Comment too short'),
    parentCommentId: z.coerce.number().optional(),
});

const VoteSchema = z.object({
    type: z.enum(['UPVOTE', 'DOWNVOTE']),
});

const PostParams = z.object({
    postId: z.coerce.number('Post ID is required.'),
});

const CommentParams = PostParams.extend({
    commentId: z.coerce.number('Comment ID is required.'),
});

const PaginationPostsQuery = z.object({
    cursorCreatedAt: z.coerce.date().optional(),
    cursorId: z.coerce.number().optional(),
    limit: z.coerce.number().default(10),
});

const UpdateCommunityPost = CreateCommunityPost.partial();
const UpdateComment = CreateComment.pick({ content: true }).optional();

export type CommunityPostSchema = {
    UpdateCommunityPost: z.infer<typeof UpdateCommunityPost>;
    CreateComment: z.infer<typeof CreateComment>;
    CommentParams: z.infer<typeof CommentParams>;
    UpdateComment: z.infer<typeof UpdateComment>;
    PaginationPostsQuery: z.infer<typeof PaginationPostsQuery>;
    VoteSchema: z.infer<typeof VoteSchema>;
};
export type CommentWithVotes = {
    id: bigint;
    content: string;
    createdAt: Date;
    upvotes: bigint;
    downvotes: bigint;
    isActive: boolean;
    myVote: 'UPVOTE' | 'DOWNVOTE' | null;
    hasReplies: boolean;
};

export default {
    CreateCommunityPost,
    CreateComment,
    VoteSchema,
    PostParams,
    UpdateCommunityPost,
    CommentParams,
    UpdateComment,
    PaginationPostsQuery,
};
