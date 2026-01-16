import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import forumController from '../controllers/community_forum.controller.js';

const router = express.Router();

// Define your community forum routes here

router.post('/posts', protect, forumController.createForumPost);
router.get('/posts', forumController.getForumPosts);

// router.get('/posts/:id',getForumPostById);
// router.put('/posts/:id',updateForumPost);
// router.delete('/posts/:id',deleteForumPost);

export default router;
