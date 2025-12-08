import { prisma } from '../prisma.js';
import type { Prisma } from '@prisma/client';

interface NewTokenData {
    tokenHash: string;
    parentId: number;
    expiresAt: Date;
}

const create = (data: Prisma.RefreshTokenCreateInput) =>
    prisma.refreshToken.create({ data });

const findManyByParent = (parentId: number) =>
    prisma.refreshToken.findMany({ where: { parentId } });

const deleteById = (id: number) =>
    prisma.refreshToken.delete({ where: { id } });

const deleteAllByParent = (parentId: number) =>
    prisma.refreshToken.deleteMany({ where: { parentId } });

const rotateToken = async (
    oldTokenId: number,
    newTokenData: NewTokenData,
): Promise<void> => {
    const { tokenHash, parentId, expiresAt } = newTokenData;

    await prisma.$transaction([
        // 1. Delete the old token using the existing helper function
        deleteById(oldTokenId),

        // 2. Create the new token using the existing helper function
        create({
            tokenHash,
            parent: { connect: { id: parentId } },
            expiresAt,
        }),
    ]);
};

export default {
    create,
    findManyByParent,
    deleteById,
    deleteAllByParent,
    rotateToken,
};
