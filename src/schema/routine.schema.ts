import z from 'zod';
const DayOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;
const RoutineCheckStatus = ['DONE', 'SKIPPED', 'PARTIAL'] as const;

const ChildParams = z.object({
    childId: z.coerce.number('Child ID is required.').int().positive(),
});

const ItemParams = z.object({
    itemId: z.coerce.number('Item ID is required.').int().positive(),
});

const minutesSchema = z.coerce.number().int().min(0).max(1440);

const RoutineItemBase = z.object({
    startMinute: minutesSchema,
    endMinute: minutesSchema,
    title: z.string().min(1, 'Title is required'),
    notes: z.string().max(2000).optional(),
    order: z.coerce.number().int().min(0).default(0),
    activityId: z.coerce.number().int().positive().optional(),
});

const RoutineItemCreate = RoutineItemBase.extend({
    dayOfWeek: z.enum(DayOfWeek),
}).refine((v) => v.startMinute < v.endMinute, {
    message: 'startMinute must be less than endMinute',
});

const RoutineItemUpdate = RoutineItemBase.partial()
    .extend({
        dayOfWeek: z.enum(DayOfWeek).optional(),
    })
    .refine((v) => Object.keys(v).length > 0, {
        message: 'At least one field is required',
    })
    .refine(
        (v) =>
            v.startMinute === undefined ||
            v.endMinute === undefined ||
            v.startMinute < v.endMinute,
        {
            message: 'startMinute must be less than endMinute',
        },
    );

const RoutineWeekItem = RoutineItemBase.refine(
    (v) => v.startMinute < v.endMinute,
    {
        message: 'startMinute must be less than endMinute',
    },
);

const RoutineWeek = z.object({
    MON: z.array(RoutineWeekItem).default([]),
    TUE: z.array(RoutineWeekItem).default([]),
    WED: z.array(RoutineWeekItem).default([]),
    THU: z.array(RoutineWeekItem).default([]),
    FRI: z.array(RoutineWeekItem).default([]),
    SAT: z.array(RoutineWeekItem).default([]),
    SUN: z.array(RoutineWeekItem).default([]),
});

const RoutineUpsert = z.object({
    name: z.string().min(1).max(100).optional(),
    timezone: z.string().min(1).max(100).optional(),
    week: RoutineWeek,
});

const dateString = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

const DayQuery = z.object({
    date: dateString,
});

const CheckInUpsert = z.object({
    itemId: z.coerce.number().int().positive(),
    date: dateString,
    status: z.enum(RoutineCheckStatus),
    note: z.string().max(2000).optional(),
});

const CheckInRangeQuery = z.object({
    from: dateString.optional(),
    to: dateString.optional(),
});

export type RoutineSchema = {
    ChildParams: z.infer<typeof ChildParams>;
    ItemParams: z.infer<typeof ItemParams>;
    RoutineItemCreate: z.infer<typeof RoutineItemCreate>;
    RoutineItemUpdate: z.infer<typeof RoutineItemUpdate>;
    RoutineUpsert: z.infer<typeof RoutineUpsert>;
    DayQuery: z.infer<typeof DayQuery>;
    CheckInUpsert: z.infer<typeof CheckInUpsert>;
    CheckInRangeQuery: z.infer<typeof CheckInRangeQuery>;
};

export default {
    ChildParams,
    ItemParams,
    RoutineItemCreate,
    RoutineItemUpdate,
    RoutineUpsert,
    DayQuery,
    CheckInUpsert,
    CheckInRangeQuery,
};
