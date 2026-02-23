import { Gender, ParentChildRelations } from '@prisma/client';
import z from 'zod';

const ParentRegister = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.email('Email must be a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    phoneNumber: z
        .string()
        .min(10, 'Phone number must be at least 10 digits long'),
    location: z.string(),
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

const ParentLogin = ParentRegister.pick({ email: true, password: true });

const ChildRegister = z.object({
    name: z.string().min(1, 'Name is required'),
    dob: dobSchema,
    gender: z.enum(Gender, 'Gender must be one of: male, female, other'),
    relationWithParent: z.enum(ParentChildRelations),
});

export default {
    ParentRegister,
    ChildRegister,
    ParentLogin,
};
