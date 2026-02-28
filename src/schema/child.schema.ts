import {
    ChildDevelopmentStages,
    DiagnosisStages,
    DiagnosisTypes,
    Gender,
    ParentChildRelations,
} from '@prisma/client';
import z from 'zod';

const ChildParams = z.object({
    childId: z.coerce.number('Child ID is required.').int().positive(),
});

const dobSchema = z.preprocess(
    (value) => {
        if (typeof value === 'string') {
            const d = new Date(value);
            if (!Number.isNaN(d.getTime())) return d;
        }
        return value;
    },
    z.date().refine((d) => d < new Date(), {
        message: 'Date of birth must be in the past',
    }),
);

const ChildUpdate = z
    .object({
        name: z.string().min(1).max(100).optional(),
        dob: dobSchema.optional(),
        gender: z.enum(Gender).optional(),
        relationWithParent: z.enum(ParentChildRelations).optional().nullable(),
        knownDiagnosis: z.enum(DiagnosisTypes).optional().nullable(),
        diagnosisStage: z.enum(DiagnosisStages).optional().nullable(),
        developmentalStage: z
            .enum(ChildDevelopmentStages)
            .optional()
            .nullable(),
        dominantHand: z.string().min(1).max(50).optional().nullable(),
    })
    .refine((v) => Object.keys(v).length > 0, {
        message: 'At least one field is required',
    });

export type ChildSchema = {
    ChildParams: z.infer<typeof ChildParams>;
    ChildUpdate: z.infer<typeof ChildUpdate>;
};

export default {
    ChildParams,
    ChildUpdate,
};
