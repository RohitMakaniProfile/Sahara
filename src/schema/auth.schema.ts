import z from 'zod';

const ParentRegister = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Email must be a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export default {
    ParentRegister,
};
