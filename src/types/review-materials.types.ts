export interface ReviewStats {
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    totalCount: number;
}

export interface ReviewLessonItem {
    id: string;
    name: string;
    sessionId: string;
    approvalStatus: number; // 0=PENDING, 1=APPROVED, 2=REJECTED
    position?: number;
    createdBy?: string;
    updatedBy?: string;
    author?: string;
    videoUrl?: string;
    video?: { url: string; durationTime?: number; questions?: unknown[] };
    reading?: { content?: string; pdf?: string; htmlUrl?: string; questions?: unknown[] };
    pdf?: string;
    quizId?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ReviewHomeworkItem {
    id: string;
    title: string;
    description?: string;
    sessionId: string;
    status: number; // 0=PENDING, 1=APPROVED, 2=REJECTED
    position?: number;
    createdBy?: string;
    updatedBy?: string;
    author?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ReviewLessonListResponse {
    stats: ReviewStats;
    items: ReviewLessonItem[];
}

export interface ReviewHomeworkListResponse {
    stats: ReviewStats;
    items: ReviewHomeworkItem[];
}

export interface GetReviewMaterialsQuery {
    sessionId: string;
    status?: number;
    search?: string;
}

export interface ReviewSessionItem {
    id: string;
    name: string;
    position?: number;
}

export type ReviewTabType = "lessons" | "homework" | "tests";

export interface ReviewVideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    lessonItem: ReviewLessonItem | null;
    sessionName: string;
}

export interface ReviewReadingModalProps {
    isOpen: boolean;
    onClose: () => void;
    lessonItem: ReviewLessonItem | null;
    sessionName: string;
}

export interface ReviewQuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    lessonItem: ReviewLessonItem | null;
    sessionName: string;
}

export interface ReviewHomeworkModalProps {
    isOpen: boolean;
    onClose: () => void;
    homeworkItem: ReviewHomeworkItem | null;
    sessionName: string;
}
