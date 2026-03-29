import { prisma } from '../prisma.js';

// Full child context: profile + last N assessment forms with category scores
const getChildWithContext = async (childId: number, parentId: number) => {
    return prisma.child.findFirst({
        where: { id: childId, parentId },
        include: {
            autismBehaviourForms: {
                orderBy: { createdAt: 'desc' },
                take: 3,
                include: {
                    categoryOutputs: {
                        include: {
                            category: { select: { id: true, name: true } },
                        },
                        orderBy: { normalizedScore: 'asc' },
                    },
                },
            },
        },
    });
};

// Last N days of check-ins with linked activity info
const getRecentCheckIns = async (childId: number, days: number) => {
    const from = new Date();
    from.setDate(from.getDate() - days);
    from.setUTCHours(0, 0, 0, 0);

    return prisma.routineCheckIn.findMany({
        where: { childId, date: { gte: from } },
        include: {
            item: {
                select: {
                    id: true,
                    title: true,
                    activity: {
                        select: {
                            id: true,
                            title: true,
                            tags: true,
                            videoUrl: true,
                        },
                    },
                },
            },
        },
        orderBy: { date: 'desc' },
    });
};

// All activities for adaptive engine matching
const getAllActivities = async () => {
    return prisma.activity.findMany({
        select: {
            id: true,
            title: true,
            description: true,
            tags: true,
            videoUrl: true,
        },
    });
};

// Top-used AAC symbols for a child in a time window
const getTopAACSymbols = async (
    childId: number,
    days: number,
    limit: number,
) => {
    const from = new Date();
    from.setDate(from.getDate() - days);

    const grouped = await prisma.aACUsageLog.groupBy({
        by: ['symbolId'],
        where: { childId, usedAt: { gte: from } },
        _count: { symbolId: true },
        orderBy: { _count: { symbolId: 'desc' } },
        take: limit,
    });

    if (grouped.length === 0) return [];

    const symbolIds = grouped.map((g) => g.symbolId);
    const symbols = await prisma.aACSymbol.findMany({
        where: { id: { in: symbolIds }, isActive: true },
        select: {
            id: true,
            title: true,
            iconUrl: true,
            ttsText: true,
            orderIndex: true,
            categoryId: true,
        },
    });

    const usageMap = new Map(
        grouped.map((g) => [g.symbolId, g._count.symbolId]),
    );
    return symbols.sort(
        (a, b) => (usageMap.get(b.id) ?? 0) - (usageMap.get(a.id) ?? 0),
    );
};

// Record AAC symbol usage events
const logAACUsage = async (childId: number, symbolIds: number[]) => {
    return prisma.aACUsageLog.createMany({
        data: symbolIds.map((symbolId) => ({ childId, symbolId })),
    });
};

// Multiple assessment forms for trend analysis (therapist report)
const getAssessmentHistory = async (childId: number, limit = 4) => {
    return prisma.autismBehaviourForm.findMany({
        where: { childId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
            categoryOutputs: {
                include: { category: { select: { name: true } } },
                orderBy: { normalizedScore: 'asc' },
            },
        },
    });
};

// Routine item detail for "Why this?" explanation
const getRoutineItemById = async (itemId: number) => {
    return prisma.childRoutineItem.findUnique({
        where: { id: itemId },
        include: {
            activity: {
                select: { title: true, description: true, tags: true },
            },
            routine: { select: { childId: true } },
        },
    });
};

// AAC categories whose title keywords match provided tags
const getAACCategoriesByTags = async (tags: string[]) => {
    if (tags.length === 0) return [];
    const categories = await prisma.aACCategory.findMany({
        where: { isActive: true },
        select: { id: true, title: true, iconUrl: true, orderIndex: true },
    });

    // Fuzzy match: category title contains any keyword from tags
    const keywords = tags.flatMap((t) =>
        t.toLowerCase().replace(/_/g, ' ').split(' '),
    );

    return categories.filter((c) =>
        keywords.some((kw) => c.title.toLowerCase().includes(kw)),
    );
};

// Symbols from a list of category IDs (for suggested AAC)
const getSymbolsByCategories = async (
    categoryIds: number[],
    limit = 10,
) => {
    if (categoryIds.length === 0) return [];
    return prisma.aACSymbol.findMany({
        where: { categoryId: { in: categoryIds }, isActive: true },
        select: {
            id: true,
            title: true,
            iconUrl: true,
            ttsText: true,
            orderIndex: true,
            categoryId: true,
        },
        orderBy: { orderIndex: 'asc' },
        take: limit,
    });
};

export default {
    getChildWithContext,
    getRecentCheckIns,
    getAllActivities,
    getTopAACSymbols,
    logAACUsage,
    getAssessmentHistory,
    getRoutineItemById,
    getAACCategoriesByTags,
    getSymbolsByCategories,
};
