import type { NotificationCategory } from "@/types/notification.types";

export const DEFAULT_CATEGORY_COLOR = "#8A2535";
export const ALL_CATEGORY_KEY = "ALL";

export const DEFAULT_NOTIFICATION_CATEGORIES: NotificationCategory[] = [
    { code: "GIAO_VU", label: "Giáo vụ", sortOrder: 1, isActive: true, requiresTargetStudents: false },
    { code: "HOC_VU", label: "Học vụ", sortOrder: 2, isActive: true, requiresTargetStudents: false },
    { code: "HOC_BONG", label: "Học bổng", sortOrder: 3, isActive: true, requiresTargetStudents: false },
    { code: "SU_KIEN", label: "Sự kiện", sortOrder: 4, isActive: true, requiresTargetStudents: false },
    { code: "CA_NHAN", label: "Cá nhân", sortOrder: 5, isActive: true, requiresTargetStudents: true },
];
