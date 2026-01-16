import z from 'zod';

const CreateForumPost = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    content: z.string().min(10, 'Content must be at least 10 characters'),
});

const CreateComment = z.object({
    content: z.string().min(2, 'Comment too short'),
});

const VoteSchema = z.object({
    type: z.enum(['UPVOTE', 'DOWNVOTE']),
});

export default {
    CreateForumPost,
    CreateComment,
    VoteSchema,
};
