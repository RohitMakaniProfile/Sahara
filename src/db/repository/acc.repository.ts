import { prisma } from '../prisma.js';

const getQuickSymbols = async () => {
    return await prisma.aACSymbol.findMany({
        where: { isGlobalQuick: true, isActive: true },
        orderBy: { orderIndex: 'asc' },
        select: {
            id: true,
            title: true,
            iconUrl: true,
            ttsText: true,
            orderIndex: true,
        },
    });
};

const getCategories = async () => {
    return await prisma.aACCategory.findMany({
        where: { isActive: true },
        orderBy: { orderIndex: 'asc' },
        select: {
            id: true,
            title: true,
            iconUrl: true,
            orderIndex: true,
        },
    });
};

const getAACCategorySymbols = async (categoryId: number) => {
    return await prisma.aACSymbol.findMany({
        where: { categoryId: categoryId, isActive: true },
        orderBy: { orderIndex: 'asc' },
        select: {
            id: true,
            title: true,
            iconUrl: true,
            ttsText: true,
            orderIndex: true,
        },
    });
};
export default { getQuickSymbols, getCategories, getAACCategorySymbols };
