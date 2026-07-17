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

export interface TestCaseMock {
    input: string;
    output: string;
}

export interface EssayQuestionMock {
    id: string;
    title: string;
    language: string;
    functionName: string;
    detail: string;
    templateCode: string;
    testCases: TestCaseMock[];
    points: number;
}

export interface ExamSetMock {
    id: string;
    name: string;
    questionCount: number;
    createdAt: string;
    questions: QuestionMock[];
    essayQuestions?: EssayQuestionMock[];
}

export interface ExamSetDetailViewProps {
    id: string;
}

export interface ExamSetDetailClientViewProps {
    id: string;
}

export interface QuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (question: QuestionMock) => void;
    question?: QuestionMock | null;
}
