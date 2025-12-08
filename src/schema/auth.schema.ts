import z from 'zod';

const ParentRegister = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Email must be a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    phoneNumber: z
        .string()
        .min(10, 'Phone number must be at least 10 digits long'),
    location: z.string().optional(),
});

const dobSchema = z;
z.preprocess(
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

const ChildRegister = z.object({
    name: z.string().min(1, 'Name is required'),
    age: z.number().min(0, 'Age must be a positive number'),
    dob: dobSchema,
    gender: z.enum(
        ['male', 'female', 'other'],
        'Gender must be one of: male, female, other',
    ),

    parentId: z.string().min(1, 'Parent ID is required'),
});

export default {
    ParentRegister,
    ChildRegister,
};
