import z from 'zod';

const CreateCommunityPost = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    content: z.string().min(10, 'Content must be at least 10 characters'),
});

const CreateComment = z.object({
    content: z.string().min(2, 'Comment too short'),
    commentParentId: z.coerce.number().optional(),
});

const VoteSchema = z.object({
    type: z.enum(['UPVOTE', 'DOWNVOTE']),
});

const PostParams = z.object({
    postId: z.coerce.number('Post ID is required.'),
});

const UpdateCommunityPost = CreateCommunityPost.partial();

export type CommunityPostSchema = {
    UpdateCommunityPost: z.infer<typeof UpdateCommunityPost>;
    CreateComment: z.infer<typeof CreateComment>;
};

export default {
    CreateCommunityPost,
    CreateComment,
    VoteSchema,
    PostParams,
    UpdateCommunityPost,
};
