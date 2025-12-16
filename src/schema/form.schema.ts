import { z } from 'zod';

const formSubmission = z.object({
    childId: z.coerce.number('Child ID is required'),

    answers: z
        .array(
            z.object({
                questionId: z.coerce.number('Question ID is required'),
                answerValue: z.coerce.number('Answer value is required'),
            }),
        )
        .nonempty('Answers are required'),
});

export default {
    formSubmission,
};
