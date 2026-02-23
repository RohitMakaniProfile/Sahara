import type { ChildRoutineItem, DayOfWeek } from '@prisma/client';
import { asyncHandler } from '../core/asyncHandler.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../core/ApiError.js';
import { SuccessCreatedResponse, SuccessResponse } from '../core/ApiResponse.js';
import routineRepository from '../db/repository/routine.repository.js';
import type { ProtectedRequest } from '../types/app-requests.js';
import type { RoutineSchema } from '../schema/routine.schema.js';

function emptyWeek<T = never>() {
    return {
        MON: [],
        TUE: [],
        WED: [],
        THU: [],
        FRI: [],
        SAT: [],
        SUN: [],
    } as Record<DayOfWeek, T[]>;
}

async function assertChildOwnership(parentId: number, childId: number) {
    const child = await routineRepository.findChildOwner(childId);
    if (!child) throw new NotFoundError('Child not found');
    if (child.parentId !== parentId) throw new ForbiddenError('Not allowed');
}

function serializeItem(i: ChildRoutineItem) {
    return {
        id: i.id,
        routineId: i.routineId,
        dayOfWeek: i.dayOfWeek,
        startMinute: i.startMinute,
        endMinute: i.endMinute,
        title: i.title,
        notes: i.notes ?? null,
        order: i.order,
        activityId: i.activityId ?? null,
        isActive: i.isActive,
    };
}

type RoutineWeekInputItem = {
    startMinute: number;
    endMinute: number;
    title: string;
    notes?: string | undefined;
    order: number;
    activityId?: number | undefined;
};
type RoutineWeekInput = Record<DayOfWeek, RoutineWeekInputItem[]>;

const getRoutine = asyncHandler<ProtectedRequest>(async (req, res) => {
    const parentId = req.user.parentId;
    const childId = Number(req.params.childId);
    await assertChildOwnership(parentId, childId);

    const routine = await routineRepository.getRoutineWithItems(parentId, childId);
    if (!routine) {
        new SuccessResponse('No routine found', {
            routine: null,
            week: emptyWeek<ReturnType<typeof serializeItem>>(),
        }).send(res);
        return;
    }

    const week = emptyWeek<ReturnType<typeof serializeItem>>();
    for (const item of routine.items) {
        week[item.dayOfWeek].push(serializeItem(item));
    }

    new SuccessResponse('Routine retrieved', {
        routine: {
            id: routine.id,
            name: routine.name,
            timezone: routine.timezone,
            isActive: routine.isActive,
            createdAt: routine.createdAt,
            updatedAt: routine.updatedAt,
        },
        week,
    }).send(res);
});

const putRoutine = asyncHandler<ProtectedRequest>(async (req, res) => {
    const parentId = req.user.parentId;
    const childId = Number(req.params.childId);
    await assertChildOwnership(parentId, childId);

    const body = req.body as RoutineSchema['RoutineUpsert'];

    const routine = await routineRepository.getOrCreateRoutine({
        parentId,
        childId,
        ...(body.timezone ? { timezone: body.timezone } : {}),
        ...(body.name ? { name: body.name } : {}),
    });

    const weekInput: RoutineWeekInput = {
        MON: body.week.MON,
        TUE: body.week.TUE,
        WED: body.week.WED,
        THU: body.week.THU,
        FRI: body.week.FRI,
        SAT: body.week.SAT,
        SUN: body.week.SUN,
    };

    const result = await routineRepository.replaceRoutineWeek({
        routineId: routine.id,
        parentId,
        childId,
        ...(body.name ? { name: body.name } : {}),
        ...(body.timezone ? { timezone: body.timezone } : {}),
        week: weekInput,
    });

    if (!result.ok) throw new BadRequestError(result.reason);

    const updated = await routineRepository.getRoutineWithItems(parentId, childId);
    const week = emptyWeek<ReturnType<typeof serializeItem>>();
    for (const item of updated?.items ?? []) {
        week[item.dayOfWeek].push(serializeItem(item));
    }

    new SuccessResponse('Routine updated', {
        routine: updated
            ? {
                  id: updated.id,
                  name: updated.name,
                  timezone: updated.timezone,
                  isActive: updated.isActive,
                  createdAt: updated.createdAt,
                  updatedAt: updated.updatedAt,
              }
            : null,
        week,
        createdItemsCount: result.updated.createdItemsCount,
    }).send(res);
});

const createItem = asyncHandler<ProtectedRequest>(async (req, res) => {
    const parentId = req.user.parentId;
    const childId = Number(req.params.childId);
    await assertChildOwnership(parentId, childId);

    const routine = await routineRepository.getOrCreateRoutine({ parentId, childId });
    const body = req.body as RoutineSchema['RoutineItemCreate'];

    const created = await routineRepository.createRoutineItem({
        routineId: routine.id,
        dayOfWeek: body.dayOfWeek,
        startMinute: body.startMinute,
        endMinute: body.endMinute,
        title: body.title,
        ...(body.notes !== undefined ? { notes: body.notes } : {}),
        order: body.order,
        ...(body.activityId !== undefined ? { activityId: body.activityId } : {}),
    });

    if (!created.ok) throw new BadRequestError(created.reason);

    new SuccessCreatedResponse('Routine item created', {
        item: serializeItem(created.item),
    }).send(res);
});

const updateItem = asyncHandler<ProtectedRequest>(async (req, res) => {
    const parentId = req.user.parentId;
    const childId = Number(req.params.childId);
    const itemId = Number(req.params.itemId);
    await assertChildOwnership(parentId, childId);

    const item = await routineRepository.findItemForChild({
        parentId,
        childId,
        itemId,
    });
    if (!item) throw new NotFoundError('Routine item not found');

    const body = req.body as RoutineSchema['RoutineItemUpdate'];

    const updated = await routineRepository.updateRoutineItem({
        routineId: item.routineId,
        itemId,
        ...(body.dayOfWeek !== undefined ? { dayOfWeek: body.dayOfWeek } : {}),
        ...(body.startMinute !== undefined ? { startMinute: body.startMinute } : {}),
        ...(body.endMinute !== undefined ? { endMinute: body.endMinute } : {}),
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.notes !== undefined ? { notes: body.notes } : {}),
        ...(body.order !== undefined ? { order: body.order } : {}),
        ...(body.activityId !== undefined ? { activityId: body.activityId } : {}),
    });

    if (!updated) throw new NotFoundError('Routine item not found');
    if (!updated.ok) throw new BadRequestError(updated.reason);

    new SuccessResponse('Routine item updated', {
        item: serializeItem(updated.item),
    }).send(res);
});

const deleteItem = asyncHandler<ProtectedRequest>(async (req, res) => {
    const parentId = req.user.parentId;
    const childId = Number(req.params.childId);
    const itemId = Number(req.params.itemId);
    await assertChildOwnership(parentId, childId);

    const item = await routineRepository.findItemForChild({
        parentId,
        childId,
        itemId,
    });
    if (!item) throw new NotFoundError('Routine item not found');

    const deleted = await routineRepository.softDeleteRoutineItem(itemId);

    new SuccessResponse('Routine item deleted', {
        item: serializeItem(deleted),
    }).send(res);
});

const getDay = asyncHandler<ProtectedRequest>(async (req, res) => {
    const parentId = req.user.parentId;
    const childId = Number(req.params.childId);
    await assertChildOwnership(parentId, childId);

    const { date } = req.query as unknown as RoutineSchema['DayQuery'];

    const day = await routineRepository.getDayItemsWithCheckIns({
        parentId,
        childId,
        date,
    });

    new SuccessResponse('Routine day retrieved', {
        date,
        dayOfWeek: day.dayOfWeek,
        timezone: day.routine?.timezone ?? 'Asia/Kolkata',
        routineId: day.routine?.id ?? null,
        items: day.items.map((i) => ({
            ...serializeItem(i),
            checkIn: i.checkIn,
        })),
    }).send(res);
});

const upsertCheckIn = asyncHandler<ProtectedRequest>(async (req, res) => {
    const parentId = req.user.parentId;
    const childId = Number(req.params.childId);
    await assertChildOwnership(parentId, childId);

    const body = req.body as RoutineSchema['CheckInUpsert'];

    const item = await routineRepository.findItemForChild({
        parentId,
        childId,
        itemId: body.itemId,
    });
    if (!item) throw new NotFoundError('Routine item not found for this child');

    const dateKey = routineRepository.parseDateKey(body.date);
    const expectedDow = routineRepository.dayOfWeekFromDateKey(dateKey);
    if (item.dayOfWeek !== expectedDow) {
        throw new BadRequestError(
            `Check-in date must match item's scheduled day (${item.dayOfWeek})`,
        );
    }

    const checkIn = await routineRepository.upsertCheckIn({
        parentId,
        childId,
        itemId: body.itemId,
        date: body.date,
        status: body.status,
        ...(body.note !== undefined ? { note: body.note } : {}),
    });

    if (!checkIn) throw new NotFoundError('Routine item not found for this child');

    new SuccessResponse('Check-in upserted', { checkIn }).send(res);
});

const listCheckIns = asyncHandler<ProtectedRequest>(async (req, res) => {
    const parentId = req.user.parentId;
    const childId = Number(req.params.childId);
    await assertChildOwnership(parentId, childId);

    const q = req.query as unknown as RoutineSchema['CheckInRangeQuery'];

    const checkIns = await routineRepository.listCheckIns({
        parentId,
        childId,
        ...(q.from ? { from: q.from } : {}),
        ...(q.to ? { to: q.to } : {}),
    });

    if (checkIns === null) throw new NotFoundError('Child not found');
    if (checkIns === 'FORBIDDEN') throw new ForbiddenError('Not allowed');

    new SuccessResponse('Check-ins retrieved', { checkIns }).send(res);
});

function dateKeyTodayInTimeZone(timeZone: string): string {
    const parts = new Intl.DateTimeFormat('en', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(new Date());

    const y = parts.find((p) => p.type === 'year')?.value;
    const m = parts.find((p) => p.type === 'month')?.value;
    const d = parts.find((p) => p.type === 'day')?.value;

    if (!y || !m || !d) throw new Error('Unable to compute local date key');
    return `${y}-${m}-${d}`;
}

function monthStartKeyFromToday(todayKey: string): string {
    // todayKey is YYYY-MM-DD
    return `${todayKey.slice(0, 8)}01`;
}

const getProgress = asyncHandler<ProtectedRequest>(async (req, res) => {
    const parentId = req.user.parentId;
    const childId = Number(req.params.childId);

    await assertChildOwnership(parentId, childId);

    const q = req.query as unknown as RoutineSchema['CheckInRangeQuery'];

    const routine = await routineRepository.getRoutineWithItems(parentId, childId);
    const timeZone = routine?.timezone ?? 'Asia/Kolkata';

    const defaultToKey = dateKeyTodayInTimeZone(timeZone);
    const defaultFromKey = monthStartKeyFromToday(defaultToKey);

    const fromKey = q.from ?? defaultFromKey;
    const toKey = q.to ?? defaultToKey;

    const startDateKey = routineRepository.parseDateKey(fromKey);
    const endDateKey = routineRepository.parseDateKey(toKey);

    if (startDateKey.getTime() > endDateKey.getTime()) {
        throw new BadRequestError('from must be less than or equal to to');
    }

    if (!routine) {
        new SuccessResponse('No routine found', {
            range: {
                from: fromKey,
                to: toKey,
            },
            completionRate: 0,
            totalScheduled: 0,
            done: 0,
            skipped: 0,
            partial: 0,
            missing: 0,
            currentStreak: 0,
            longestStreak: 0,
        }).send(res);
        return;
    }

    const activeItemIds = new Set(routine.items.map((i) => i.id));
    const itemIdsByDay = routine.items.reduce(
        (acc, i) => {
            acc[i.dayOfWeek].push(i.id);
            return acc;
        },
        emptyWeek<number>(),
    );

    const rawCheckIns = await routineRepository.listCheckIns({
        parentId,
        childId,
        from: fromKey,
        to: toKey,
    });

    if (rawCheckIns === null) throw new NotFoundError('Child not found');
    if (rawCheckIns === 'FORBIDDEN') throw new ForbiddenError('Not allowed');

    const checkIns = rawCheckIns.filter((c) => activeItemIds.has(c.itemId));
    type CheckIn = (typeof checkIns)[number];

    const checkInByDateItem = new Map<string, Map<number, CheckIn>>();
    for (const c of checkIns) {
        const dateKey = c.date.toISOString().slice(0, 10);
        const byItem = checkInByDateItem.get(dateKey) ?? new Map<number, CheckIn>();
        byItem.set(c.itemId, c);
        checkInByDateItem.set(dateKey, byItem);
    }

    let totalScheduled = 0;
    let done = 0;
    let skipped = 0;
    let partial = 0;
    let weightedDone = 0; // DONE=1, PARTIAL=0.5, SKIPPED=0

    let longestStreak = 0;
    let tempStreak = 0;

    const d = new Date(startDateKey);
    while (d.getTime() <= endDateKey.getTime()) {
        const dateKey = d.toISOString().slice(0, 10);
        const dow = routineRepository.dayOfWeekFromDateKey(d);
        const scheduledIds = itemIdsByDay[dow] ?? [];
        const scheduledCount = scheduledIds.length;

        if (scheduledCount > 0) {
            totalScheduled += scheduledCount;

            const byItem = checkInByDateItem.get(dateKey) ?? new Map<number, CheckIn>();

            let dailyWeighted = 0;
            for (const itemId of scheduledIds) {
                const c = byItem.get(itemId);
                if (!c) continue;
                if (c.status === 'DONE') {
                    done++;
                    dailyWeighted += 1;
                } else if (c.status === 'PARTIAL') {
                    partial++;
                    dailyWeighted += 0.5;
                } else if (c.status === 'SKIPPED') {
                    skipped++;
                }
            }

            weightedDone += dailyWeighted;

            const dailyCompletion = (dailyWeighted / scheduledCount) * 100;
            if (dailyCompletion >= 70) {
                tempStreak++;
                longestStreak = Math.max(longestStreak, tempStreak);
            } else {
                tempStreak = 0;
            }
        }

        d.setUTCDate(d.getUTCDate() + 1);
    }

    // current streak: walk backwards from end date, skipping days with no scheduled tasks
    let currentStreak = 0;
    const back = new Date(endDateKey);
    while (back.getTime() >= startDateKey.getTime()) {
        const dateKey = back.toISOString().slice(0, 10);
        const dow = routineRepository.dayOfWeekFromDateKey(back);
        const scheduledIds = itemIdsByDay[dow] ?? [];
        const scheduledCount = scheduledIds.length;

        if (scheduledCount === 0) {
            back.setUTCDate(back.getUTCDate() - 1);
            continue;
        }

        const byItem = checkInByDateItem.get(dateKey) ?? new Map<number, CheckIn>();
        let dailyWeighted = 0;
        for (const itemId of scheduledIds) {
            const c = byItem.get(itemId);
            if (!c) continue;
            if (c.status === 'DONE') dailyWeighted += 1;
            else if (c.status === 'PARTIAL') dailyWeighted += 0.5;
        }

        const dailyCompletion = (dailyWeighted / scheduledCount) * 100;
        if (dailyCompletion >= 70) currentStreak++;
        else break;

        back.setUTCDate(back.getUTCDate() - 1);
    }

    const completionRate =
        totalScheduled === 0 ? 0 : Math.round((weightedDone / totalScheduled) * 100);
    const missing = Math.max(0, totalScheduled - (done + skipped + partial));

    new SuccessResponse('Progress retrieved', {
        range: { from: fromKey, to: toKey },
        totalScheduled,
        done,
        skipped,
        partial,
        missing,
        completionRate,
        currentStreak,
        longestStreak,
    }).send(res);
});

export default {
    getRoutine,
    putRoutine,
    createItem,
    updateItem,
    deleteItem,
    getDay,
    upsertCheckIn,
    listCheckIns,
    getProgress,
};

