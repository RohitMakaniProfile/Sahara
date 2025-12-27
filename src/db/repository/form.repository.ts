import { prisma } from '../prisma.js';
import type {
    AllValidQuestionsDataDTO,
    CategoryOutputCreateListDTO,
} from '../../types/form.js';

const getFormStructure = async () => {
    const categories = await prisma.autismCategory.findMany({
        orderBy: { id: 'asc' },
        include: {
            questions: {
                orderBy: { order: 'asc' },
                select: {
                    id: true,
                    question: true,
                    weight: true,
                    order: true,
                },
            },
        },
    });
    return categories;
};

const isChildBelongsToParent = async (childId: number) => {
    const child = await prisma.child.findUnique({
        where: { id: childId },
        select: { parentId: true },
    });

    return child;
};

const allValidQuestionsData = async (
    answers: { questionId: number; response: number }[],
): Promise<AllValidQuestionsDataDTO[] | null> => {
    const questionIds = Array.from(new Set(answers.map((a) => a.questionId)));

    const dbQuestions = await prisma.autismBehaviourQuestionnaire.findMany({
        where: { id: { in: questionIds } },
        select: { id: true, weight: true, categoryId: true },
    });

    if (dbQuestions.length !== questionIds.length) {
        return null;
    }
    return dbQuestions;
};

const createFormSubmission = async (
    answers: { questionId: number; response: number }[],
    childId: number,
    parentId: number,
) => {
    return await prisma.$transaction(async (tx) => {
        const formCreation = await tx.autismBehaviourForm.create({
            data: {
                childId: childId,
                parentId: parentId,
            },
            select: { id: true },
        });

        const submissionData = answers.map((a) => ({
            questionId: a.questionId,
            parentResponse: a.response,
            formId: formCreation.id,
        }));

        await tx.autismBehaviourQuestionResponse.createMany({
            data: submissionData,
        });
        
        const data = await tx.autismBehaviourForm.findUnique({
            where: { id: formCreation.id },
            select: {
                id: true,
                questionResponses: {
                    select: {
                        parentResponse: true,
                        question: {
                            select: {
                                weight: true,
                                categoryId: true,
                            },
                        },
                    },
                },
            },
        });
    
        return data;
    });
};

const saveCategoryOutputs = async (
    categoryOutputData: CategoryOutputCreateListDTO,
) => {
    await prisma.autismCategoryOutput.createMany({
        data: categoryOutputData,
    });
};

export default {
    getFormStructure,
    isChildBelongsToParent,
    allValidQuestionsData,
    createFormSubmission,
    saveCategoryOutputs,
};
