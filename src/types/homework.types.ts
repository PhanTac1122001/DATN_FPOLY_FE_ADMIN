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
    aiReport?: string | Record<string, unknown>;
    aiSummary?: string | Record<string, unknown>;
    aiScore?: number;
    aiMaxScore?: number;
    aiError?: string;
    submittedAt?: string;
    createdAt?: string;
}

export interface HomeworkCompletionItem {
    id: string | null;
    studentId: string;
    sessionId: string;
    homeworkId?: string | null;
    classId?: string;
    status: HomeworkStatusEnum | null;
    submissionCount?: number;
    submittedCount?: number;
    lastAttemptNo?: number;
    lastGithubUrl?: string;
    githubUrl?: string;
    lastBranch?: string;
    aiStatus?: AiStatusEnum;
    aiDecision?: AiDecisionEnum;
    aiReport?: string | Record<string, unknown>;
    aiSummary?: string | Record<string, unknown>;
    aiScore?: number;
    aiMaxScore?: number;
    isFeedbackApproved?: boolean;
    feedbackApprovedAt?: string;
    teacherNote?: string;
    gradedAt?: string;
    submittedAt?: string;
    updatedAt?: string;
    createdAt?: string;
    student?: {
        id?: string;
        fullName?: string;
        studentCode?: string;
        email?: string;
        avatar?: string;
        dob?: string | null;
    };
    homework?: {
        id?: string;
        title?: string;
        description?: string;
    } | null;
}

export interface MarkSessionCompletionDto {
    studentId: string;
    sessionId: string;
    classId?: string;
    status: HomeworkStatusEnum.COMPLETED | HomeworkStatusEnum.NOT_COMPLETED | HomeworkStatusEnum.PENDING_TEACHER;
    teacherNote?: string;
}

export interface BulkMarkSessionCompletionDto {
    sessionId: string;
    classId?: string;
    items: Array<{
        studentId: string;
        status: HomeworkStatusEnum.COMPLETED | HomeworkStatusEnum.NOT_COMPLETED | HomeworkStatusEnum.PENDING_TEACHER;
    }>;
}

export interface EditSubmissionFeedbackDto {
    aiSummary?: string;
    aiScore?: number;
    aiMaxScore?: number;
    aiDecision?: AiDecisionEnum | string;
}

export interface SessionStudentItem {
    homeworkId: string;
    title: string;
    description?: string;
    submissionId: string | null;
    githubUrl: string | null;
    branch: string | null;
    submittedAt: string | null;
    updatedAt: string | null;
    attemptNo: number | null;
    aiStatus: AiStatusEnum | null;
    aiDecision: AiDecisionEnum | null;
    aiScore: number | null;
    aiMaxScore: number | null;
    aiSummary: string | null;
}

export interface SessionStudentDetailResponse {
    session: {
        id: string;
        name: string;
    };
    student: {
        id: string;
        fullName: string;
        studentCode?: string;
        dob?: string | null;
    };
    completion: {
        id: string | null;
        status: HomeworkStatusEnum | null;
        aiFeedbackApproved: boolean;
    };
    items: SessionStudentItem[];
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

export interface StudentHomeworkDetailViewProps {
    studentId: string;
    studentName: string;
    studentCode: string;
    sessionId: string;
    classId: string;
    courseId: string;
    className?: string;
    onBack: () => void;
}

export interface HomeworkFilterOptions {
    status?: string;
    search?: string;
}
