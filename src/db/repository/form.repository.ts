import { prisma } from '../prisma.js';
import type {
    AllValidQuestionsDataDTO,
    CategoryOutputCreateListDTO,
} from '../../types/form.js';
import { InternalError } from '../../core/ApiError.js';

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

const isChildBelongsToParent = async (
    childId: number,
    parentId: number,
): Promise<boolean> => {
    const child = await prisma.child.findUnique({
        where: { id: childId },
        select: { parentId: true },
    });

    return child?.parentId === parentId;
};

const AllValidQuestionsData = async (
    answers: { questionId: number; response: number }[],
): Promise<AllValidQuestionsDataDTO[] | null> => {
    const questionIds = Array.from(
        new Set(answers.map((a: { questionId: number }) => a.questionId)),
    );
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

        const submissionData = answers.map(
            (a: { questionId: number; response: number }) => {
                return {
                    questionId: a.questionId,
                    parentResponse: a.response,
                    formId: formCreation.id,
                };
            },
        );
        await tx.autismBehaviourQuestionResponse.createMany({
            data: submissionData,
        });
        const data = await tx.autismBehaviourForm.findUnique({
            where: { id: formCreation.id },
            select: {
                id: true,
                childId: true,
                parentId: true,
                questionResponses: {
                    select: {
                        parentResponse: true,
                        question: {
                            select: {
                                id: true,
                                question: true,
                                weight: true,
                                categoryId: true,
                            },
                        },
                    },
                },
            },
        });
        if (!data) {
            throw new InternalError('Form submission failed');
        }
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
    AllValidQuestionsData,
    createFormSubmission,
    saveCategoryOutputs,
};
