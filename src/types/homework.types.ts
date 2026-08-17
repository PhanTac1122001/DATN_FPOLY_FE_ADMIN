export enum HomeworkStatusEnum {
    COMPLETED = "COMPLETED",
    NOT_COMPLETED = "NOT_COMPLETED",
    PENDING_AI = "PENDING_AI",
    PENDING_TEACHER = "PENDING_TEACHER",
}

export enum AiStatusEnum {
    PENDING = "PENDING",
    RUNNING = "RUNNING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    SKIPPED = "SKIPPED",
}

export enum AiDecisionEnum {
    PASS = "PASS",
    FAIL = "FAIL",
}

export interface HomeworkSubmissionItem {
    id: string;
    studentId: string;
    sessionId: string;
    homeworkId: string;
    classId?: string;
    attemptNo: number;
    githubUrl: string;
    branch?: string;
    aiStatus: AiStatusEnum;
    aiDecision?: AiDecisionEnum;
    aiReport?: string;
    aiSummary?: string;
    aiScore?: number;
    aiMaxScore?: number;
    aiError?: string;
    submittedAt?: string;
    createdAt?: string;
}

export interface HomeworkCompletionItem {
    id: string;
    studentId: string;
    sessionId: string;
    homeworkId: string;
    classId?: string;
    status: HomeworkStatusEnum;
    submissionCount: number;
    lastAttemptNo: number;
    lastGithubUrl?: string;
    lastBranch?: string;
    aiStatus?: AiStatusEnum;
    aiDecision?: AiDecisionEnum;
    aiReport?: string;
    aiSummary?: string;
    aiScore?: number;
    isFeedbackApproved?: boolean;
    feedbackApprovedAt?: string;
    teacherNote?: string;
    gradedAt?: string;
    student?: {
        id?: string;
        fullName?: string;
        studentCode?: string;
        email?: string;
        avatar?: string;
    };
    homework?: {
        id?: string;
        title?: string;
        description?: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

export interface StudentHomeworkDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    completionId: string;
    onSuccess?: () => void;
}

export interface ClassHomeworkReviewViewProps {
    classId: string;
}

export interface HomeworkFilterOptions {
    status?: string;
    search?: string;
}
