export interface CourseCategory {
    id: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    priority: number;
    isActive: boolean;
    createdAt: string;
}

export interface CreateCourseCategoryPayload {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    priority?: number;
    isActive?: boolean;
}

export type UpdateCourseCategoryPayload = Partial<CreateCourseCategoryPayload>;

export interface CourseCategoryManagerModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}
