import { prisma } from '../prisma.js';
import type { DayOfWeek, Prisma, RoutineCheckStatus } from '@prisma/client';

type WeekInput = Record<
    DayOfWeek,
    {
        startMinute: number;
        endMinute: number;
        title: string;
        notes?: string | undefined;
        order?: number | undefined;
        activityId?: number | undefined;
    }[]
>;

function parseDateKey(date: string): Date {
    const parts = date.split('-');
    const y = Number(parts[0] ?? NaN);
    const m = Number(parts[1] ?? NaN);
    const d = Number(parts[2] ?? NaN);
    if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) {
        throw new Error('Invalid date key');
    }
    return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
}

function dayOfWeekFromDateKey(dateKey: Date): DayOfWeek {
    const day = dateKey.getUTCDay(); // 0=Sun..6=Sat
    switch (day) {
        case 0:
            return 'SUN';
        case 1:
            return 'MON';
        case 2:
            return 'TUE';
        case 3:
            return 'WED';
        case 4:
            return 'THU';
        case 5:
            return 'FRI';
        default:
            return 'SAT';
    }
}

function hasOverlaps(
    items: { startMinute: number; endMinute: number }[],
): boolean {
    const sorted = [...items].sort(
        (a, b) => a.startMinute - b.startMinute || a.endMinute - b.endMinute,
    );
    for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const cur = sorted[i];
        if (!prev || !cur) continue;
        if (cur.startMinute < prev.endMinute) return true;
    }
    return false;
}

async function findChildOwner(childId: number) {
    return prisma.child.findUnique({
        where: { id: childId },
        select: { parentId: true },
    });
}

async function findActiveRoutine(parentId: number, childId: number) {
    return prisma.childRoutine.findFirst({
        where: { parentId, childId, isActive: true },
        orderBy: { updatedAt: 'desc' },
        select: {
            id: true,
            name: true,
            timezone: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}

async function getRoutineWithItems(parentId: number, childId: number) {
    return prisma.childRoutine.findFirst({
        where: { parentId, childId, isActive: true },
        orderBy: { updatedAt: 'desc' },
        include: {
            items: {
                where: { isActive: true },
                orderBy: [
                    { dayOfWeek: 'asc' },
                    { startMinute: 'asc' },
                    { endMinute: 'asc' },
                    { order: 'asc' },
                    { id: 'asc' },
                ],
            },
        },
    });
}

async function getOrCreateRoutine(params: {
    parentId: number;
    childId: number;
    timezone?: string;
    name?: string;
}) {
    const existing = await prisma.childRoutine.findFirst({
        where: { parentId: params.parentId, childId: params.childId, isActive: true },
        orderBy: { updatedAt: 'desc' },
    });
    if (existing) return existing;

    return prisma.childRoutine.create({
        data: {
            parentId: params.parentId,
            childId: params.childId,
            timezone: params.timezone ?? 'Asia/Kolkata',
            name: params.name ?? 'Default',
        },
    });
}

async function replaceRoutineWeek(params: {
    routineId: number;
    parentId: number;
    childId: number;
    name?: string;
    timezone?: string;
    week: WeekInput;
}) {
    for (const day of Object.keys(params.week) as DayOfWeek[]) {
        if (hasOverlaps(params.week[day])) {
            return { ok: false as const, reason: `Overlapping items for ${day}` };
        }
    }

    const updated = await prisma.$transaction(async (tx) => {
        const routine = await tx.childRoutine.update({
            where: { id: params.routineId },
            data: {
                ...(params.name ? { name: params.name } : {}),
                ...(params.timezone ? { timezone: params.timezone } : {}),
            },
        });

        await tx.childRoutineItem.updateMany({
            where: { routineId: params.routineId, isActive: true },
            data: { isActive: false },
        });

        const createData = (Object.keys(params.week) as DayOfWeek[]).flatMap(
            (day) =>
                params.week[day].map((item) => ({
                    routineId: params.routineId,
                    dayOfWeek: day,
                    startMinute: item.startMinute,
                    endMinute: item.endMinute,
                    title: item.title,
                    notes: item.notes ?? null,
                    order: item.order ?? 0,
                    activityId: item.activityId ?? null,
                })),
        );

        const createdItems = await tx.childRoutineItem.createMany({
            data: createData,
        });

        return { routine, createdItemsCount: createdItems.count };
    });

    return { ok: true as const, updated };
}

async function createRoutineItem(params: {
    routineId: number;
    dayOfWeek: DayOfWeek;
    startMinute: number;
    endMinute: number;
    title: string;
    notes?: string;
    order?: number;
    activityId?: number;
}) {
    const existing = await prisma.childRoutineItem.findMany({
        where: {
            routineId: params.routineId,
            dayOfWeek: params.dayOfWeek,
            isActive: true,
        },
        select: { startMinute: true, endMinute: true },
    });
    if (
        hasOverlaps([
            ...existing,
            { startMinute: params.startMinute, endMinute: params.endMinute },
        ])
    ) {
        return { ok: false as const, reason: 'Overlapping routine items' };
    }

    const item = await prisma.childRoutineItem.create({
        data: {
            routineId: params.routineId,
            dayOfWeek: params.dayOfWeek,
            startMinute: params.startMinute,
            endMinute: params.endMinute,
            title: params.title,
            notes: params.notes ?? null,
            order: params.order ?? 0,
            activityId: params.activityId ?? null,
        },
    });
    return { ok: true as const, item };
}

async function findItemForChild(params: {
    parentId: number;
    childId: number;
    itemId: number;
}) {
    return prisma.childRoutineItem.findFirst({
        where: {
            id: params.itemId,
            isActive: true,
            routine: {
                parentId: params.parentId,
                childId: params.childId,
                isActive: true,
            },
        },
        include: { routine: true },
    });
}

async function updateRoutineItem(params: {
    routineId: number;
    itemId: number;
    dayOfWeek?: DayOfWeek;
    startMinute?: number;
    endMinute?: number;
    title?: string;
    notes?: string | null;
    order?: number;
    activityId?: number | null;
}) {
    const existing = await prisma.childRoutineItem.findUnique({
        where: { id: params.itemId },
        select: { id: true, dayOfWeek: true, startMinute: true, endMinute: true },
    });
    if (!existing) return null;

    const day = params.dayOfWeek ?? existing.dayOfWeek;
    const startMinute = params.startMinute ?? existing.startMinute;
    const endMinute = params.endMinute ?? existing.endMinute;

    const others = await prisma.childRoutineItem.findMany({
        where: {
            routineId: params.routineId,
            dayOfWeek: day,
            isActive: true,
            NOT: { id: params.itemId },
        },
        select: { startMinute: true, endMinute: true },
    });

    if (hasOverlaps([...others, { startMinute, endMinute }])) {
        return { ok: false as const, reason: 'Overlapping routine items' };
    }

    const item = await prisma.childRoutineItem.update({
        where: { id: params.itemId },
        data: {
            ...(params.dayOfWeek ? { dayOfWeek: params.dayOfWeek } : {}),
            ...(params.startMinute !== undefined
                ? { startMinute: params.startMinute }
                : {}),
            ...(params.endMinute !== undefined ? { endMinute: params.endMinute } : {}),
            ...(params.title !== undefined ? { title: params.title } : {}),
            ...(params.notes !== undefined ? { notes: params.notes } : {}),
            ...(params.order !== undefined ? { order: params.order } : {}),
            ...(params.activityId !== undefined
                ? { activityId: params.activityId }
                : {}),
        },
    });

    return { ok: true as const, item };
}

async function softDeleteRoutineItem(itemId: number) {
    return prisma.childRoutineItem.update({
        where: { id: itemId },
        data: { isActive: false },
    });
}

async function getDayItemsWithCheckIns(params: {
    parentId: number;
    childId: number;
    date: string;
}) {
    type CheckInLite = { itemId: number; status: RoutineCheckStatus; note: string | null };
    type RoutineItem = Awaited<ReturnType<typeof prisma.childRoutineItem.findMany>>[number];
    type DayItem = RoutineItem & {
        checkIn: CheckInLite | null;
    };

    const dateKey = parseDateKey(params.date);
    const dayOfWeek = dayOfWeekFromDateKey(dateKey);

    const routine = await prisma.childRoutine.findFirst({
        where: { parentId: params.parentId, childId: params.childId, isActive: true },
        orderBy: { updatedAt: 'desc' },
        select: { id: true, timezone: true },
    });

    if (!routine) {
        return { routine: null, dateKey, dayOfWeek, items: [] as DayItem[] };
    }

    const items = await prisma.childRoutineItem.findMany({
        where: {
            routineId: routine.id,
            dayOfWeek,
            isActive: true,
        },
        orderBy: [
            { startMinute: 'asc' },
            { endMinute: 'asc' },
            { order: 'asc' },
            { id: 'asc' },
        ],
    });

    const checkIns = await prisma.routineCheckIn.findMany({
        where: {
            childId: params.childId,
            date: dateKey,
            itemId: { in: items.map((i) => i.id) },
        },
        select: { itemId: true, status: true, note: true },
    });

    const byItem = new Map(checkIns.map((c) => [c.itemId, c]));

    return {
        routine,
        dateKey,
        dayOfWeek,
        items: items.map((i) => ({
            ...i,
            checkIn: byItem.get(i.id) ?? null,
        })),
    };
}

async function upsertCheckIn(params: {
    parentId: number;
    childId: number;
    itemId: number;
    date: string;
    status: RoutineCheckStatus;
    note?: string;
}) {
    const item = await prisma.childRoutineItem.findFirst({
        where: {
            id: params.itemId,
            isActive: true,
            routine: {
                parentId: params.parentId,
                childId: params.childId,
                isActive: true,
            },
        },
        select: { id: true },
    });
    if (!item) return null;

    const dateKey = parseDateKey(params.date);

    const checkIn = await prisma.routineCheckIn.upsert({
        where: {
            childId_itemId_date: {
                childId: params.childId,
                itemId: params.itemId,
                date: dateKey,
            },
        },
        update: {
            status: params.status,
            ...(params.note !== undefined ? { note: params.note } : {}),
        },
        create: {
            childId: params.childId,
            itemId: params.itemId,
            date: dateKey,
            status: params.status,
            ...(params.note !== undefined ? { note: params.note } : {}),
        },
        select: { id: true, childId: true, itemId: true, date: true, status: true, note: true },
    });

    return checkIn;
}

async function listCheckIns(params: {
    parentId: number;
    childId: number;
    from?: string;
    to?: string;
}) {
    const child = await findChildOwner(params.childId);
    if (!child) return null;
    if (child.parentId !== params.parentId) return 'FORBIDDEN' as const;

    const where: Prisma.RoutineCheckInWhereInput = {
        childId: params.childId,
        ...(params.from || params.to
            ? {
                  date: {
                      ...(params.from ? { gte: parseDateKey(params.from) } : {}),
                      ...(params.to ? { lte: parseDateKey(params.to) } : {}),
                  },
              }
            : {}),
    };

    return prisma.routineCheckIn.findMany({
        where,
        orderBy: [{ date: 'asc' }, { itemId: 'asc' }],
        select: { id: true, itemId: true, date: true, status: true, note: true },
    });
}

export default {
    parseDateKey,
    dayOfWeekFromDateKey,
    findChildOwner,
    findActiveRoutine,
    getRoutineWithItems,
    getOrCreateRoutine,
    replaceRoutineWeek,
    createRoutineItem,
    findItemForChild,
    updateRoutineItem,
    softDeleteRoutineItem,
    getDayItemsWithCheckIns,
    upsertCheckIn,
    listCheckIns,
};

