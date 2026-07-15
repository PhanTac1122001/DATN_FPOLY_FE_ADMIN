export interface OptionMock {
    id: string;
    label: string;
    text: string;
    isCorrect: boolean;
}

export interface QuestionMock {
    id: string;
    text: string;
    explanation: string;
    points: number;
    options: OptionMock[];
}

export interface ExamSetMock {
    id: string;
    name: string;
    questionCount: number;
    createdAt: string;
    questions: QuestionMock[];
}

export interface ExamSetDetailViewProps {
    id: string;
}

export interface ExamSetDetailClientViewProps {
    id: string;
}
