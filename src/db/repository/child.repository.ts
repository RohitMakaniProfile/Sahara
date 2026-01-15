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

export default {
    create,
    findParent,
};
