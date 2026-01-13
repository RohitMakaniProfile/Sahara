import { z } from 'zod';
import { MAX_RESPONSE } from '../config.js';

const formSubmission = z.object({
    childId: z.coerce.number('Child ID is required'),

    answers: z
        .array(
            z.object({
                questionId: z.coerce.number('Question ID is required'),
                response: z.coerce
                    .number('Answer value is required')
                    .min(0, 'Response must be >=0')
                    .max(MAX_RESPONSE, `Response must be <=${MAX_RESPONSE}`),
            }),
        )
        .nonempty('Answers are required'),
});

export default {
    formSubmission,
};
