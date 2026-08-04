export interface LmsNotificationEntity {
    id: string;
    userId: string | null;
    targetStudentIds?: string[];
    title: string;
    message: string;
    body?: string[];
    author?: string;
    categoryCode: string;
    categoryLabel: string;
    categoryTone?: string;
    isPinned: boolean;
    viewCount: number;
    isUnread: boolean;
    readAt: string | null;
    metaData?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

export interface NotificationCategory {
    code: string;
    label: string;
    sortOrder: number;
    tone?: string;
    isActive: boolean;
    requiresTargetStudents?: boolean;
}

export interface CreateStaffNotificationDto {
    categoryCode: string;
    title: string;
    message: string;
    body?: string[];
    author?: string;
    isPinned?: boolean;
    studentIds?: string[];
}

export interface UpdateStaffNotificationDto {
    categoryCode?: string;
    title?: string;
    message?: string;
    body?: string[];
    author?: string;
    isPinned?: boolean;
    studentIds?: string[];
}

export interface PaginatedNotificationsResponse {
    items: LmsNotificationEntity[];
    totalItems: number;
    limit: number;
    offset: number;
}

export interface NotificationDetailModalProps {
    notification: LmsNotificationEntity | null;
    isOpen: boolean;
    onClose: () => void;
}

export interface CreateNotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}
