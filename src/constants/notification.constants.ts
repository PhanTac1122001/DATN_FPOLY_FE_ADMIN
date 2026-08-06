import { UI_TEXT } from "@/constants/ui-text.constants";
import type { NotificationCategory } from "@/types/notification.types";

export const DEFAULT_CATEGORY_COLOR = "#8A2535";
export const ALL_CATEGORY_KEY = "ALL";

export const DEFAULT_NOTIFICATION_CATEGORIES: NotificationCategory[] = [
    { code: "GIAO_VU", label: UI_TEXT.notifications.catGiaoVu, sortOrder: 1, isActive: true, requiresTargetStudents: false },
    { code: "HOC_VU", label: UI_TEXT.notifications.catHocVu, sortOrder: 2, isActive: true, requiresTargetStudents: false },
    { code: "HOC_BONG", label: UI_TEXT.notifications.catHocBong, sortOrder: 3, isActive: true, requiresTargetStudents: false },
    { code: "SU_KIEN", label: UI_TEXT.notifications.catSuKien, sortOrder: 4, isActive: true, requiresTargetStudents: false },
    { code: "CA_NHAN", label: UI_TEXT.notifications.catCaNhan, sortOrder: 5, isActive: true, requiresTargetStudents: true },
];

export const NOTIFICATION_TARGET_MODES = {
    SYSTEM: "SYSTEM",
    CLASS: "CLASS",
    STUDENT: "STUDENT",
} as const;
