import { refreshTokenTtlMs } from '../../config.js';
import { PasswordUtils } from '../../core/password.js';
import { generateRefreshToken } from '../../core/token.js';
import { prisma } from '../prisma.js';
import type { Parent, Prisma } from '@prisma/client';

const create = async (data: Prisma.ParentCreateInput) => {
    return prisma.parent.create({ data });
};

const findByEmail = async (email: string) => {
    return prisma.parent.findUnique({ where: { email } });
};
interface createWithTokenReturn {
    parent: Parent;
    refreshTokenPlain: string;
    expiresAt: Date;
}

const createWithToken = async (
    data: Prisma.ParentCreateInput,
): Promise<createWithTokenReturn> => {
    const parentWithToken = await prisma.$transaction(async (tx) => {
        const parent = await tx.parent.create({
            data,
        });

        const refreshTokenPlain = generateRefreshToken(parent.id);
        const hashedRefresh = await PasswordUtils.hash(refreshTokenPlain);

        const expiresAt = new Date(Date.now() + refreshTokenTtlMs);

        await tx.refreshToken.create({
            data: {
                tokenHash: hashedRefresh,
                parent: { connect: { id: parent.id } },
                expiresAt,
            },
        });

        return { parent, refreshTokenPlain, expiresAt };
    });
    return parentWithToken;
};

export default {
    create,
    findByEmail,
    createWithToken,
};
