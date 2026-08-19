export interface ExtraVideoItem {
    _id?: string;
    title?: string;
    url: string;
}

export interface LearningResourceItem {
    _id: string;
    classId: string;
    courseId: string | { _id: string; name?: string; code?: string };
    sessionId: string | { _id: string; name?: string; position?: number };
    videoUrl?: string;
    documentUrl?: string;
    extraVideos?: ExtraVideoItem[];
    createdBy?: {
        _id?: string;
        name?: string;
        email?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface CreateLearningResourcePayload {
    courseId: string;
    sessionId: string;
    videoUrl?: string;
    documentUrl?: string;
}

export interface UpdateLearningResourcePayload {
    courseId?: string;
    sessionId?: string;
    videoUrl?: string;
    documentUrl?: string;
}

export interface AddExtraVideoPayload {
    url: string;
    title?: string;
}

export interface CreateEditResourceModalProps {
    isOpen: boolean;
    classId: string;
    courseId: string;
    sessionId: string;
    resourceToEdit?: LearningResourceItem | null;
    onClose: () => void;
    onSuccess: () => void;
}

export interface CreateExtraVideoModalProps {
    isOpen: boolean;
    resourceId: string;
    onClose: () => void;
    onSuccess: () => void;
}
