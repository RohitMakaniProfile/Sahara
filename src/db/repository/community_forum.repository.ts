import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js"

const createNewForumPost = async (data : Prisma.ForumPostCreateInput)=>{
    // Implementation for creating a new forum post in the database
    const postdata = await prisma.forumPost.create({
        data
    });
    return postdata;

} 
export default 
{ 
    createNewForumPost 

};