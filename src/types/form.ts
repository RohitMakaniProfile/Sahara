type QuestionnaireQuestionDTO = {
    id: number;
    text: string;
    weight: number;
    order: number;
};

type QuestionnaireCategoryDTO = {
    id: number;
    name: string;
    questions: QuestionnaireQuestionDTO[];
};
type AllValidQuestionsDataDTO = {
    id: number;
    weight: number;
    categoryId: number;
};
type CategoryAccumulator = {
    totalScore: number;
    maxPossibleScore: number;
};
type FormSubmissionDTO = {
    id: number;
    questionResponses: {
        parentResponse: number;
        question: {
            weight: number;
            categoryId: number;
        };
    }[];
};
type CategoryOutputCreateDTO = {
    formId: number;
    categoryId: number;
    totalScore: number;
    maxPossibleScore: number;
    normalizedScore: number;
};

type CategoryOutputCreateListDTO = CategoryOutputCreateDTO[];

type CategoryCalculationItemDTO = {
    categoryId: number;
    totalScore: number;
    maxPossibleScore: number;
    normalizedScore: number;
};

type CategoryCalculationDTO = CategoryCalculationItemDTO[];

export type {
    QuestionnaireCategoryDTO,
    QuestionnaireQuestionDTO,
    AllValidQuestionsDataDTO,
    CategoryAccumulator,
    FormSubmissionDTO,
    CategoryOutputCreateDTO,
    CategoryOutputCreateListDTO,
    CategoryCalculationDTO,
};
