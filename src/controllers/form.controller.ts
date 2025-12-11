import type { Request, Response } from "express";
import { asyncHandler } from "../core/asyncHandler.js";
import { SuccessResponse } from "../core/ApiResponse.js";
import type { QuestionnaireCategoryDTO } from "../types/form.js";
import formRepository from "../db/repository/form.repository.js";

const getForm = asyncHandler(async (_req: Request, res: Response) => {
   const form = await formRepository.getFormStructure();
    const payload: QuestionnaireCategoryDTO[] = form.map((c) => ({
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


export default { getForm };