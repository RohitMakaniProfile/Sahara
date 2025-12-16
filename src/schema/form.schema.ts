import { z } from 'zod';

const formSubmission = z.object({
    childId: z.coerce.number('Child ID is required'),

    answers: z
        .array(
            z.object({
                questionId: z.coerce.number('Question ID is required'),
                response: z.coerce
                    .number('Answer value is required')
                    .min(0, 'Response must be >=0')
                    .max(2, 'Response must be <=2'),
            }),
        )
        .nonempty('Answers are required'),
});

export default {
    formSubmission,
};
