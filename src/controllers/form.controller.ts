import type { Request, Response } from "express";
import { asyncHandler } from "../core/asyncHandler.js";
import { prisma } from "../db/prisma.js";
import { SuccessResponse } from "../core/ApiResponse.js";
import type { QuestionnaireCategoryDTO } from "../types/form.js";

const getForm = asyncHandler(async (_req: Request, res: Response) => {
    const categories = await prisma.autismCategory.findMany({
        orderBy:{id:'asc'},
        include:{
            questions:{
                orderBy:{order:'asc'},
                select:{
                    id:true,
                    question:true,
                    weight:true,
                    order:true
                }
            }
        }
    });
    const payload: QuestionnaireCategoryDTO[] = categories.map((c) => ({
    id: c.id,
    name: c.name,
    questions: c.questions.map((q) => ({
        id: q.id,
        text: q.question,  
        weight: q.weight,
        order: q.order,
    })),

    
    }));
    new SuccessResponse("Form fetched successfully", payload).send(res);
})     

const submitForm = asyncHandler(async (_req: Request, res: Response) => {


    new SuccessResponse("Form submitted successfully",{}).send(res);
});
export default { getForm, submitForm };