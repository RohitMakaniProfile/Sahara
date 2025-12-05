import { prisma } from '../prisma.js';
import type { Prisma } from '@prisma/client';

const create = (data: Prisma.RefreshTokenCreateInput) =>
    prisma.refreshToken.create({ data });

const findManyByParent = (parentId: number) =>
    prisma.refreshToken.findMany({ where: { parentId } });

const deleteById = (id: number) =>
    prisma.refreshToken.delete({ where: { id } });

const deleteAllByParent = (parentId: number) =>
    prisma.refreshToken.deleteMany({ where: { parentId } });

export default {
    create,
    findManyByParent,
    deleteById,
    deleteAllByParent,
};
