import { prisma } from '../prisma.js';
import type { Prisma } from '@prisma/client';

const create = async (data: Prisma.ParentCreateInput) => {
    return prisma.parent.create({ data });
};

const findByEmail = async (email: string) => {
    return prisma.parent.findUnique({ where: { email } });
};

export default {
    create,
    findByEmail,
};
