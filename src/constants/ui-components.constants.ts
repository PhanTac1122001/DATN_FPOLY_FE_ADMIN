import { UI_TEXT } from "@/constants/ui-text.constants";
import { HomeworkDifficultyEnum, type HomeworkDifficultyLevel } from "@/types/group.types";

/**
 * UI Components Constants
 * Extracted from UI component files to fix ESLint no-restricted-syntax warnings
 */

export const RANDOM_SORT_OFFSET = 0.5;

export const HOMEWORK_DIFFICULTY_LEVELS: Array<{
    id: HomeworkDifficultyLevel;
    label: string;
    description: string;
    badgeColor: string;
}> = [
    {
        id: HomeworkDifficultyEnum.EASY,
        label: UI_TEXT.assignGroupHomeworkModal.levelEasy,
        description: UI_TEXT.assignGroupHomeworkModal.descEasy,
        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-300",
    },
    {
        id: HomeworkDifficultyEnum.MEDIUM,
        label: UI_TEXT.assignGroupHomeworkModal.levelMedium,
        description: UI_TEXT.assignGroupHomeworkModal.descMedium,
        badgeColor: "bg-blue-50 text-blue-700 border-blue-300",
    },
    {
        id: HomeworkDifficultyEnum.FAIR,
        label: UI_TEXT.assignGroupHomeworkModal.levelFair,
        description: UI_TEXT.assignGroupHomeworkModal.descFair,
        badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-300",
    },
    {
        id: HomeworkDifficultyEnum.GOOD,
        label: UI_TEXT.assignGroupHomeworkModal.levelGood,
        description: UI_TEXT.assignGroupHomeworkModal.descGood,
        badgeColor: "bg-amber-50 text-amber-700 border-amber-300",
    },
    {
        id: HomeworkDifficultyEnum.EXCELLENT,
        label: UI_TEXT.assignGroupHomeworkModal.levelExcellent,
        description: UI_TEXT.assignGroupHomeworkModal.descExcellent,
        badgeColor: "bg-purple-50 text-purple-700 border-purple-300",
    },
];

// ============================================
// Common timing constants
// ============================================
export const SEARCH_DEBOUNCE_MS = 300;
export const DEBOUNCE_DELAY_MS = 500;
export const AUTO_COMPLETE_DELAY_MS = 500;
export const MODAL_TRANSITION_MS = 300;
export const DEFAULT_ICON_SIZE = 20;
export const CIRCLE_CIRCUMFERENCE = 31.4;
export const PERCENT_100 = 100;
export const SCALE_500 = 500;
export const SCALE_2 = 2;
export const SCALE_5 = 5;
export const SEARCH_THRESHOLD_5 = 5;

export const DRAG_TYPES = {
    CHAPTER: "CHAPTER",
    LESSON: "LESSON",
} as const;

// ============================================
// Time calculation constants
// ============================================
export const SECONDS_IN_MINUTE = 60;
export const MINUTES_IN_HOUR = 60;
export const MS_IN_SECOND = 1000;
export const STALE_MINUTES = 5;

// ============================================
// Stale time constants (for React Query)
// ============================================
export const STALE_TIME_FIVE_MINUTES = STALE_MINUTES * SECONDS_IN_MINUTE * MS_IN_SECOND; // 300000ms
export const STALE_TIME_HOUR = MINUTES_IN_HOUR * SECONDS_IN_MINUTE * MS_IN_SECOND; // 3600000ms

// ============================================
// Pagination constants
// ============================================
export const DEFAULT_LIMIT = 100;
export const PAGE_LIMIT = 100;
export const FIRST_PAGE = 1;
export const CLASS_LIST_ITEMS_PER_PAGE = 3;
export const PAGINATION_LIMIT_3 = 3;
export const PAGINATION_LIMIT_6 = 6;
export const PAGINATION_LIMIT_10 = 10;
export const PAGINATION_LIMIT_20 = 20;
export const PAGINATION_LIMIT_50 = 50;
export const PAGINATION_LIMIT_100 = 100;

export const PAGINATION_LIMIT_OPTIONS = [PAGINATION_LIMIT_10, PAGINATION_LIMIT_20, PAGINATION_LIMIT_50, PAGINATION_LIMIT_100];

// ============================================
// HTTP Status constants
// ============================================
export const HTTP_STATUS_UNAUTHORIZED = 401;
export const HTTP_STATUS_TOO_MANY_REQUESTS = 429;
export const HTTP_STATUS_SERVER_ERROR = 500;

// ============================================
// Redirect/Delay constants
// ============================================
export const REDIRECT_DELAY = 2000;

// ============================================
// Image upload constants
// ============================================
export const MAX_IMAGE_SIZE_MB = 10;
export const COMPRESSION_MAX_SIZE_MB = 2;
export const COMPRESSION_MAX_WIDTH_OR_HEIGHT = 1920;

// ============================================
// Avatar constants
// ============================================
export const MAX_AVATAR_SIZE_MB = 2;
export const AVATAR_MAX_WIDTH_HEIGHT = 1200;
export const MAX_INITIALS_LENGTH = 2;

// ============================================
// STATUS constants
// ============================================
export const LESSON_STATUS = {
    COMPLETED: "COMPLETED",
    LOCKED: "LOCKED",
    NOT_STARTED: "NOT_STARTED",
    IN_PROGRESS: "IN_PROGRESS",
} as const;

// ============================================
// Video source type constants
// ============================================
export const VIDEO_SOURCE_TYPES = {
    YOUTUBE_LINK: "YOUTUBE_LINK",
    UPLOADED: "UPLOADED",
} as const;

// ============================================
// Time constants for duration formatting
// ============================================
export const SECONDS_IN_HOUR = 3600;
export const TIME_PAD_LENGTH = 2;

// ============================================
// Image Upload Input color mapping constants
// ============================================
export const IMAGE_UPLOAD_COLORS: Record<string, { border: string; bg: string; ring: string; iconText: string; iconBorder: string }> = {
    brand: {
        border: "border-brand-500",
        bg: "bg-brand-50/20",
        ring: "ring-brand-500/10",
        iconText: "text-brand-600",
        iconBorder: "border-brand-200",
    },
    blue: {
        border: "border-blue-500",
        bg: "bg-blue-50/20",
        ring: "ring-blue-500/10",
        iconText: "text-blue-600",
        iconBorder: "border-blue-200",
    },
    slate: {
        border: "border-slate-500",
        bg: "bg-slate-50/20",
        ring: "ring-slate-500/10",
        iconText: "text-slate-600",
        iconBorder: "border-slate-200",
    },
    primary: {
        border: "border-primary-500",
        bg: "bg-primary-50/20",
        ring: "ring-primary-500/10",
        iconText: "text-primary-600",
        iconBorder: "border-primary-200",
    },
    orange: {
        border: "border-orange-500",
        bg: "bg-orange-50/20",
        ring: "ring-orange-500/10",
        iconText: "text-orange-600",
        iconBorder: "border-orange-200",
    },
    success: {
        border: "border-success-500",
        bg: "bg-success-50/20",
        ring: "ring-success-500/10",
        iconText: "text-success-600",
        iconBorder: "border-success-200",
    },
    warning: {
        border: "border-warning-500",
        bg: "bg-warning-50/20",
        ring: "ring-warning-500/10",
        iconText: "text-warning-600",
        iconBorder: "border-warning-200",
    },
    error: {
        border: "border-error-500",
        bg: "bg-error-50/20",
        ring: "ring-error-500/10",
        iconText: "text-error-600",
        iconBorder: "border-error-200",
    },
};

export const IMAGE_UPLOAD_HOVER_ICON_TEXT_CLASSES: Record<string, string> = {
    brand: "group-hover:text-brand-600 group-hover:border-brand-200",
    blue: "group-hover:text-blue-600 group-hover:border-blue-200",
    slate: "group-hover:text-slate-600 group-hover:border-slate-200",
    primary: "group-hover:text-primary-600 group-hover:border-primary-200",
    orange: "group-hover:text-orange-600 group-hover:border-orange-200",
    success: "group-hover:text-success-600 group-hover:border-success-200",
    warning: "group-hover:text-warning-600 group-hover:border-warning-200",
    error: "group-hover:text-error-600 group-hover:border-error-200",
};
