import type {
    CategoryAccumulator,
    CategoryCalculationDTO,
    FormSubmissionDTO,
} from '../types/form.js';

const categoryCalculation = (
    submissionData: FormSubmissionDTO,
): CategoryCalculationDTO => {
    const categoryMap: Record<number, CategoryAccumulator> = {};

    for (const r of submissionData.questionResponses) {
        const categoryId = r.question.categoryId;
        const weight = r.question.weight;
        const answer = r.parentResponse;

        if (!categoryMap[categoryId]) {
            categoryMap[categoryId] = {
                totalScore: 0,
                maxPossibleScore: 0,
            };
        }

        categoryMap[categoryId].totalScore += answer * weight;

        categoryMap[categoryId].maxPossibleScore += 2 * weight;
    }

    const categoryOutputs = Object.entries(categoryMap).map(
        ([categoryId, scores]) => ({
            categoryId: Number(categoryId),
            totalScore: scores.totalScore,
            maxPossibleScore: scores.maxPossibleScore,
            normalizedScore:
                scores.maxPossibleScore === 0
                    ? 0
                    : (scores.totalScore / scores.maxPossibleScore) * 100,
        }),
    );

    return categoryOutputs;
};

export default {
    categoryCalculation,
};
