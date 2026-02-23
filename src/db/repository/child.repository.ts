import { Prisma } from '@prisma/client';
import { prisma } from '../prisma.js';

const create = async (data: Prisma.ChildUncheckedCreateInput) => {
    return await prisma.child.create({
        data,
    });
};

const findParent = async (childId: number) => {
    const data = await prisma.child.findUnique({
        where: {
            id: childId,
        },
        select: {
            parent: true,
        },
    });
    return data?.parent;
};

const latestFormResults = async (childId: number, parentId: number) => {
    const result = await prisma.autismBehaviourForm.findFirst({
        where: { childId, parentId },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            createdAt: true,
            categoryOutputs: {
                select: {
                    totalScore: true,
                    maxPossibleScore: true,
                    normalizedScore: true,
                    category: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
    });
    return result;
};

const findById = async (childId: number) => {
    return prisma.child.findUnique({
        where: { id: childId },
    });
};

const updateById = async (childId: number, data: Prisma.ChildUpdateInput) => {
    return prisma.child.update({
        where: { id: childId },
        data,
    });
};

export default {
    create,
    findParent,
    latestFormResults,
    findById,
    updateById,
};
