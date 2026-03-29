import { z } from 'zod';

const ParentCoachChatBody = z.object({
    messages: z
        .array(
            z.object({
                role: z.enum(['user', 'assistant']),
                content: z.string().min(1).max(2000),
            }),
        )
        .min(1)
        .max(20),
});

const AdaptiveRoutineQuery = z.object({
    lowEnergy: z
        .string()
        .optional()
        .transform((v) => v === 'true'),
    timezone: z.string().optional(),
});

const ChildParams = z.object({
    childId: z.coerce.number().int().positive(),
});

const ItemParams = z.object({
    childId: z.coerce.number().int().positive(),
    itemId: z.coerce.number().int().positive(),
});

const AACLogBody = z.object({
    symbolIds: z.array(z.number().int().positive()).min(1).max(50),
});

export type AISchema = {
    ParentCoachChatBody: z.infer<typeof ParentCoachChatBody>;
    AdaptiveRoutineQuery: z.infer<typeof AdaptiveRoutineQuery>;
    ChildParams: z.infer<typeof ChildParams>;
    ItemParams: z.infer<typeof ItemParams>;
    AACLogBody: z.infer<typeof AACLogBody>;
};

export default {
    ParentCoachChatBody,
    AdaptiveRoutineQuery,
    ChildParams,
    ItemParams,
    AACLogBody,
};
