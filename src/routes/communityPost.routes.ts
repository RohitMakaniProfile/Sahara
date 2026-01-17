import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import communityPostController from '../controllers/communityPost.controller.js';
import { validator } from '../middlewares/validator.middleware.js';
import forumSchema from '../schema/forum.schema.js';
import { ValidationSource } from '../helpers/validator.js';

const router = express.Router();

// Define your community forum routes here
// First checkbox is implementation and second one is testing
// [X][X] create posts
// [X][X] delete post
// [X][X] edit title and content of the post
// [][] Get Post title, content and comments
// [X][X] add comment in post
// [X][] edit comment
// [X][] delete comment
// [X][] reply comment of the post
// [X][X] get all the posts with pagination - don't get full content from DB,
// [] get all the comments of the post with pagination
// [] get replies of particular comments with pagination
// [] upvote and downvote in post
// [] upvote and downvote in comments

router.use(protect);

router.post(
    '/',
    validator(forumSchema.CreateCommunityPost),
    communityPostController.createCommunityPost,
);

router.delete(
    '/:postId',
    validator(forumSchema.PostParams, ValidationSource.PARAM),
    communityPostController.deletePost,
);

router.patch(
    '/:postId',
    validator(forumSchema.PostParams, ValidationSource.PARAM),
    validator(forumSchema.UpdateCommunityPost, ValidationSource.BODY),
    communityPostController.updateCommunityPost,
);

router.get(
    '/:postId',
    validator(forumSchema.PostParams, ValidationSource.PARAM),
    communityPostController.getPostDetails,
);

router.post(
    '/:postId/comment',
    validator(forumSchema.PostParams, ValidationSource.PARAM),
    validator(forumSchema.CreateComment, ValidationSource.BODY),
    communityPostController.createComment,
);

router.patch(
    '/:postId/comment/:commentId',
    validator(forumSchema.CommentParams, ValidationSource.PARAM),
    validator(forumSchema.UpdateComment, ValidationSource.BODY),
    communityPostController.updateComment,
);

router.delete(
    '/:postId/comment/:commentId',
    validator(forumSchema.CommentParams, ValidationSource.PARAM),
    communityPostController.deleteComment,
);

router.get(
    '/', 
    validator(forumSchema.PaginationPostsQuery, ValidationSource.QUERY),
    communityPostController.getCommunityPosts
);

// router.get('/posts/:id',getForumPostById);
// router.put('/posts/:id',updateForumPost);
// router.delete('/posts/:id',deleteForumPost);

export default router;
