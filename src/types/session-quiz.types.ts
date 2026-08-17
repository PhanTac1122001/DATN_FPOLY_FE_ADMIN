export type QuestionType = "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TEXT";
export type QuestionCategory = "BAI_CU" | "BAI_MOI" | "NONE";
export type QuestionDifficulty = "EASY" | "MEDIUM" | "HARD";

export enum QuizSessionStatusEnum {
    IDLE = "IDLE",
    ACTIVE = "ACTIVE",
    CLOSED = "CLOSED",
}

export enum StudentQuizStatusEnum {
    SUBMITTED = "SUBMITTED",
    DOING = "DOING",
    NOT_STARTED = "NOT_STARTED",
}

export interface SessionQuizOption {
    id?: string;
    _id?: string;
    content: string;
    isCorrect: boolean;
    explanation?: string;
}

export interface SessionQuizQuestion {
    id?: string;
    _id?: string;
    content: string;
    type: QuestionType;
    points?: number;
    category?: QuestionCategory | string;
    difficulty?: QuestionDifficulty | string;
    mediaUrl?: string;
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

export type UpdateSessionQuizPayload = Partial<CreateSessionQuizPayload>;

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

export enum QuestionTypeEnum {
    SINGLE_CHOICE = "SINGLE_CHOICE",
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
    TEXT = "TEXT",
}

export enum QuestionCategoryEnum {
    NONE = "NONE",
    BAI_CU = "BAI_CU",
    BAI_MOI = "BAI_MOI",
}

export enum QuestionDifficultyEnum {
    EASY = "EASY",
    MEDIUM = "MEDIUM",
    HARD = "HARD",
}

export interface SessionInfo {
    id: string;
    title: string;
    description?: string;
    position?: number;
}

export interface CreateQuizziSetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (item: SessionQuizItem) => void;
    editQuiz?: SessionQuizItem | null;
}

export interface ImportExcelResponse {
    success: boolean;
    totalImported: number;
    questions: SessionQuizQuestion[];
}

export interface StartQuizSessionPayload {
    classId: string;
    educationProgramId: string;
    subjectId: string;
    sessionId: string;
    quizId: string;
}

export interface StopQuizSessionPayload {
    classId: string;
    quizSessionId: string;
}

export interface ActiveQuizSessionParams {
    classId: string;
    subjectId?: string;
    sessionId?: string;
    quizId?: string;
    quizSessionId?: string;
}

export interface StudentQuizResultItem {
    id?: string;
    _id?: string;
    quizSessionId: string;
    classId: string;
    quizId: string;
    studentId: string;
    studentCode: string;
    studentName: string;
    dateOfBirth?: string;
    score: number;
    correctAnswersCount: number;
    totalQuestionsCount: number;
    answers?: { questionId: string; selectedOptionIds: string[] }[];
    status: "DOING" | "SUBMITTED";
    submittedAt?: string;
}

export interface ActiveQuizSessionResponse {
    session: {
        id?: string;
        _id?: string;
        classId: string;
        educationProgramId: string;
        subjectId: string;
        sessionId: string;
        quizId: string;
        attempt?: number;
        status: QuizSessionStatusEnum;
        startedAt?: string;
        stoppedAt?: string;
        serverTime?: string;
    } | null;
    quiz?: SessionQuizItem | null;
    results: StudentQuizResultItem[];
    serverTime?: string;
}

export interface ClassQuizSessionHistoryItem {
    id: string;
    _id: string;
    attempt: number;
    startedAt?: string;
    stoppedAt?: string;
    status: QuizSessionStatusEnum;
    resultsCount: number;
}

export interface QuizDashboardModalProps {
    isOpen: boolean;
    onClose: () => void;
    results: StudentQuizResultItem[];
    activeQuiz?: SessionQuizItem | null;
    isClosed?: boolean;
    sessionInfo?: {
        attempt?: number;
        startedAt?: string;
        stoppedAt?: string;
    } | null;
    history?: ClassQuizSessionHistoryItem[];
    selectedSessionId?: string;
    onSelectAttempt?: (quizSessionId: string) => void;
}

export interface QuizReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    quizzes: SessionQuizItem[];
    selectedQuizId?: string;
    onSelectQuiz?: (quizId: string) => void;
}

export interface QuizziSetDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    quizziSet: SessionQuizItem | null;
}

export interface StudentQuizDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentResult: StudentQuizResultItem | null;
    activeQuiz?: SessionQuizItem | null;
    isClosed?: boolean;
}
