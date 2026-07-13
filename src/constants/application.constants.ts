/**
 * Application Component Constants
 * This file contains all constants used by application components.
 */
import { CloseCircle, InfoCircle, TickCircle } from "@/components/icons";

// ============================================================================
// Advanced Filter Constants
// ============================================================================

export const DEFAULT_MAX_CONDITIONS = 10;
export const DROPDOWN_GAP = 4;
export const VIEWPORT_GAP = 16;

// ============================================================================
// Calendar / Date Picker Constants
// ============================================================================

export const COMPARE_EQUAL = 0;
export const SLICE_START = 0;
export const DAY_ABBREV_LENGTH = 2;

// Cell Constants
export const FIRST_DAY_OF_MONTH = 1;
export const LAST_DAY_OF_MONTH_OFFSET = 0;
export const SUNDAY_INDEX = 0;
export const SATURDAY_INDEX = 6;

// Date Picker Constants
export const CALENDAR_ICON_SIZE = 20;
export const POPOVER_OFFSET = 8;

// Date Range Picker Constants
export const DATE_OFFSET = 1;
export const MONTH_JANUARY = 1;
export const MONTH_DECEMBER = 12;
export const ALL_TIME_START_YEAR = 2000;

// Range Calendar Constants
export const MONTHS_VISIBLE_DESKTOP = 2;
export const MONTHS_VISIBLE_MOBILE = 1;
export const DAY_SLICE_LENGTH = 2;
export const MONTH_OFFSET = 1;

// ============================================================================
// Notification Modal Constants
// ============================================================================

export const MODAL_VARIANTS = {
    success: {
        icon: TickCircle,
        iconColor: "var(--color-success-500)",
        titleColor: "text-slate-950",
        messageColor: "text-slate-600",
    },
    error: {
        icon: CloseCircle,
        iconColor: "var(--color-error-500)",
        titleColor: "text-slate-950",
        messageColor: "text-slate-600",
    },
    warning: {
        icon: InfoCircle,
        iconColor: "var(--color-warning-500)",
        titleColor: "text-slate-950",
        messageColor: "text-slate-600",
    },
    info: {
        icon: InfoCircle,
        iconColor: "var(--color-slate-500)",
        titleColor: "text-slate-950",
        messageColor: "text-slate-600",
    },
} as const;

// ============================================================================
// Loading Indicator Constants
// ============================================================================

export const LOADING_INDICATOR_STYLES = {
    sm: { root: "gap-4", label: "text-sm font-medium", spinner: "size-8" },
    md: { root: "gap-4", label: "text-sm font-medium", spinner: "size-12" },
    lg: { root: "gap-4", label: "text-lg font-medium", spinner: "size-14" },
    xl: { root: "gap-5", label: "text-lg font-medium", spinner: "size-16" },
} as const;

// ============================================================================
// Tabs Constants
// ============================================================================

export const TAB_SIZES = {
    sm: {
        "button-brand": "text-sm font-semibold py-2 px-3",
        "button-gray": "text-sm font-semibold py-2 px-3",
        "button-border": "text-sm font-semibold py-2 px-3",
        "button-minimal": "text-sm font-semibold py-2 px-3",
        underline: "text-sm font-semibold px-1 pb-2.5 pt-0",
        line: "text-sm font-semibold pl-2.5 pr-3 py-0.5",
    },
    md: {
        "button-brand": "text-md font-semibold py-2.5 px-3",
        "button-gray": "text-md font-semibold py-2.5 px-3",
        "button-border": "text-md font-semibold py-2.5 px-3",
        "button-minimal": "text-md font-semibold py-2.5 px-3",
        underline: "text-md font-semibold px-1 pb-2.5 pt-0",
        line: "text-md font-semibold pr-3.5 pl-3 py-1",
    },
} as const;

// ============================================================================
// Pagination Constants
// ============================================================================

export const PAGE_COUNT_MULTIPLIER = 2;
export const TOTAL_PAGE_NUMBERS_OFFSET = 5;
export const ELLIPSIS_THRESHOLD = 2;
export const RANGE_OFFSET = 3;
export const FIRST_PAGE = 1;
export const PAGE_STEP = 1;
export const DEFAULT_PAGE_INDEX = 1;
export const DEFAULT_TOTAL_PAGES = 10;
export const DEFAULT_PAGE_LIMIT = 10;
export const BANNER_SLIDE_DURATION = 8000;
export const STALE_TIME_ONE_HOUR = 3600000;
export const PASSING_SCORE_RATIO = 0.5;
export const DEFAULT_MAX_UNDERSTAND_SCORE = 10;
