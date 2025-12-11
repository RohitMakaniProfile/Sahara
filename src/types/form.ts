export type QuestionnaireQuestionDTO = {
    id: number;
    text: string;
    weight: number;
    order: number;
};

export type QuestionnaireCategoryDTO = {
    id: number;
    name: string;
    questions: QuestionnaireQuestionDTO[];
};
