import type {  Response } from 'express';
import type { ProtectedRequest } from '../types/app-requests.js';
import { asyncHandler } from '../core/asyncHandler.js';
import forumRepository from '../db/repository/community_forum.repository.js';
import { BadRequestError } from "../core/ApiError.js";
import { SuccessResponse } from "../core/ApiResponse.js";


const createForumPost = asyncHandler<ProtectedRequest>(
  async (req, res: Response) => {
    const parentId = req.user?.parentId;
    const title = req.body.title;
    const content = req.body.content;

    if (!parentId) throw new BadRequestError("Unauthorized");


    const post = await forumRepository.createNewForumPost({
      title: title,
      content: content,
      author: { connect: { id: parentId } },
    });

    new SuccessResponse("Forum post created", post).send(res);
  }
);

export default { createForumPost };