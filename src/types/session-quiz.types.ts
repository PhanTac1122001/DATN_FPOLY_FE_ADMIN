export type QuestionType = "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TEXT";
export type QuestionCategory = "BAI_CU" | "BAI_MOI" | "NONE";
export type QuestionDifficulty = "EASY" | "MEDIUM" | "HARD";

export interface SessionQuizOption {
    _id?: string;
    content: string;
    isCorrect: boolean;
    explanation?: string;
}

export interface SessionQuizQuestion {
    _id?: string;
    content: string;
    type: QuestionType;
    points?: number;
    category?: QuestionCategory | string;
    difficulty?: QuestionDifficulty | string;
    options?: SessionQuizOption[];
}

export interface SessionQuizItem {
    id: string;
    title: string;
    description?: string;
    durationMinutes: number;
    passThreshold: number;
    educationProgramId?: string;
    subjectId?: string;
    sessionIds: string[];
    questions: SessionQuizQuestion[];
    questionCount: number;
    createdAt: string;
}

export interface CreateSessionQuizPayload {
    title: string;
    description?: string;
    durationMinutes?: number;
    passThreshold?: number;
    educationProgramId?: string;
    subjectId?: string;
    sessionIds: string[];
    questions: SessionQuizQuestion[];
}

export interface UpdateSessionQuizPayload extends Partial<CreateSessionQuizPayload> {}

export interface QuerySessionQuizParams {
    educationProgramId?: string;
    subjectId?: string;
    sessionId?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export interface SessionQuizListResponse {
    items: SessionQuizItem[];
    total: number;
    page: number;
    limit: number;
}

export interface ImportExcelResponse {
    success: boolean;
    totalImported: number;
    questions: SessionQuizQuestion[];
}
