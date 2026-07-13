// ============================================================================
// Avatar Constants
// ============================================================================

export const AVATAR_LABEL_GROUP_STYLES = {
    sm: { root: "gap-2", title: "text-sm font-semibold", subtitle: "text-xs" },
    md: { root: "gap-2", title: "text-sm font-semibold", subtitle: "text-sm" },
    lg: { root: "gap-3", title: "text-md font-semibold", subtitle: "text-md" },
    xl: { root: "gap-4", title: "text-lg font-semibold", subtitle: "text-md" },
} as const;

export const AVATAR_PROFILE_PHOTO_STYLES = {
    sm: {
        root: "size-18 p-0.75",
        rootWithPlaceholder: "p-1",
        content: "",
        icon: "size-9",
        initials: "text-display-sm font-semibold",
        badge: "bottom-0.5 right-0.5",
    },
    md: {
        root: "size-24 p-1",
        rootWithPlaceholder: "p-1.25",
        content: "shadow-xl",
        icon: "size-12",
        initials: "text-display-md font-semibold",
        badge: "bottom-1 right-1",
    },
    lg: {
        root: "size-40 p-1.5",
        rootWithPlaceholder: "p-1.75",
        content: "shadow-2xl",
        icon: "size-20",
        initials: "text-display-xl font-semibold",
        badge: "bottom-2 right-2",
    },
} as const;

export const AVATAR_PROFILE_PHOTO_TICK_SIZE_MAP = {
    sm: "2xl",
    md: "3xl",
    lg: "4xl",
} as const;

export const AVATAR_STYLES = {
    xxs: { root: "size-4 outline-[0.5px] -outline-offset-[0.5px]", initials: "text-xs font-semibold", icon: "size-3" },
    xs: { root: "size-6 outline-[0.5px] -outline-offset-[0.5px]", initials: "text-xs font-semibold", icon: "size-4" },
    sm: { root: "size-8 outline-[0.75px] -outline-offset-[0.75px]", initials: "text-sm font-semibold", icon: "size-5" },
    md: { root: "size-10 outline-1 -outline-offset-1", initials: "text-md font-semibold", icon: "size-6" },
    lg: { root: "size-12 outline-1 -outline-offset-1", initials: "text-lg font-semibold", icon: "size-7" },
    xl: { root: "size-14 outline-1 -outline-offset-1", initials: "text-xl font-semibold", icon: "size-8" },
    "2xl": { root: "size-16 outline-1 -outline-offset-1", initials: "text-display-xs font-semibold", icon: "size-8" },
} as const;

export const AVATAR_ADD_BUTTON_SIZES = {
    xs: { root: "size-6", icon: "size-4" },
    sm: { root: "size-8", icon: "size-4" },
    md: { root: "size-10", icon: "size-5" },
} as const;

export const AVATAR_COMPANY_ICON_SIZES: Record<string, string> = {
    xs: "size-2",
    sm: "size-3",
    md: "size-3.5",
    lg: "size-4",
    xl: "size-4.5",
    "2xl": "size-5 ring-[1.67px]",
};

export const AVATAR_ONLINE_INDICATOR_SIZES: Record<string, string> = {
    xs: "size-1.5",
    sm: "size-2",
    md: "size-2.5",
    lg: "size-3",
    xl: "size-3.5",
    "2xl": "size-4",
    "3xl": "size-4.5",
    "4xl": "size-5",
};

export const VERIFIED_TICK_SIZES = {
    xs: { root: "size-2.5", tick: "size-[4.38px]" },
    sm: { root: "size-3", tick: "size-[5.25px]" },
    md: { root: "size-3.5", tick: "size-[6.13px]" },
    lg: { root: "size-4", tick: "size-[7px]" },
    xl: { root: "size-4.5", tick: "size-[7.88px]" },
    "2xl": { root: "size-5", tick: "size-[8.75px]" },
    "3xl": { root: "size-6", tick: "size-[10.5px]" },
    "4xl": { root: "size-8", tick: "size-[14px]" },
} as const;

// ============================================================================
// Badge Constants
// ============================================================================

export const BADGE_TYPES = {
    pillColor: "pill-color",
    badgeColor: "color",
    badgeModern: "modern",
} as const;

// ============================================================================
// Tooltip Constants
// ============================================================================

export const TOOLTIP_DEFAULT_DELAY = 300;
export const TOOLTIP_DEFAULT_OFFSET = 6;
export const TOOLTIP_CROSS_OFFSET = 12;
export const TOOLTIP_OFFSET_XS = 4;
export const TOOLTIP_OFFSET_SM = 8;

// ============================================================================
// Image Upload Constants
// ============================================================================

export const IMAGE_UPLOAD_DEFAULT_MAX_SIZE_MB = 10;
export const IMAGE_UPLOAD_COMPLETE_PROGRESS = 100;

// ============================================================================
// Progress Indicator Constants
// ============================================================================

export const PROGRESS_FULL_PERCENTAGE = 100;
export const PROGRESS_HALF_PERCENTAGE = 50;
export const PROGRESS_BASE_DIAMETER_MULTIPLIER = 2;
export const PROGRESS_PERCENTAGE_MAX = 100;
export const PROGRESS_DEFAULT_MAX_VALUE = 100;
export const PROGRESS_DEFAULT_MIN_VALUE = 0;

// ============================================================================
// Slider Constants
// ============================================================================

export const SLIDER_DEFAULT_MAX_VALUE = 100;
export const SLIDER_PERCENTAGE_MULTIPLIER = 100;

// ============================================================================
// Alert Constants
// ============================================================================

// ============================================================================
// Button Utility & Close Button Constants
// ============================================================================

export const BUTTON_UTILITY_STYLES = {
    secondary:
        "bg-primary text-fg-quaternary shadow-xs-skeumorphic ring-1 ring-primary ring-inset hover:bg-primary_hover hover:text-fg-quaternary_hover disabled:shadow-xs disabled:ring-disabled_subtle",
    tertiary: "text-fg-quaternary hover:bg-primary_hover hover:text-fg-quaternary_hover",
} as const;

export const CLOSE_BUTTON_SIZES = {
    xs: { root: "size-7", icon: "size-4" },
    sm: { root: "size-9", icon: "size-5" },
    md: { root: "size-10", icon: "size-5" },
    lg: { root: "size-11", icon: "size-6" },
} as const;

export const CLOSE_BUTTON_THEMES = {
    light: "text-fg-quaternary hover:bg-primary_hover hover:text-fg-quaternary_hover focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus-ring",
    dark: "text-fg-white/70 hover:text-fg-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 outline-focus-ring",
} as const;

// ============================================================================
// Select Constants
// ============================================================================

export const SELECT_ITEM_SIZES = { sm: "px-3.5 py-2", md: "px-3.5 py-2" } as const;

export const SELECT_SIZES = {
    sm: { root: "py-2 px-3", shortcut: "pr-2.5" },
    md: { root: "py-2.5 px-3.5", shortcut: "pr-3" },
} as const;

// ============================================================================
// Tag & Dot Constants
// ============================================================================

export const TAG_CLOSE_X_STYLES = {
    sm: { root: "p-0.5", icon: "size-2.5" },
    md: { root: "p-0.5", icon: "size-3" },
    lg: { root: "p-0.75", icon: "size-3.5" },
} as const;

export const TAG_STYLES = {
    sm: {
        root: {
            base: "px-2 py-0.75 text-xs font-medium",
            withCheckbox: "pl-1.25",
            withAvatar: "pl-1",
            withDot: "pl-1.5",
            withCount: "pr-1",
            withClose: "pr-1",
        },
        content: "gap-1",
        count: "px-1 text-xs font-medium",
    },
    md: {
        root: {
            base: "px-2.25 py-0.5 text-sm font-medium",
            withCheckbox: "pl-1",
            withAvatar: "pl-1.25",
            withDot: "pl-1.75",
            withCount: "pr-0.75",
            withClose: "pr-1",
        },
        content: "gap-1.25",
        count: "px-1.25 text-xs font-medium",
    },
    lg: {
        root: {
            base: "px-2.5 py-1 text-sm font-medium",
            withCheckbox: "pl-1.25",
            withAvatar: "pl-1.75",
            withDot: "pl-2.25",
            withCount: "pr-1",
            withClose: "pr-1",
        },
        content: "gap-1.5",
        count: "px-1.5 text-sm font-medium",
    },
} as const;

export const DOT_SIZES = {
    sm: { wh: 8, c: 4, r: 2.5 },
    md: { wh: 10, c: 5, r: 4 },
} as const;

// ============================================================================
// Alert Constants
// ============================================================================

export const ALERT_VARIANTS = {
    error: {
        container: "border-error-200 bg-error-50",
        icon: "text-error-500",
        iconColor: "var(--color-error-500)",
        heading: "text-error-700",
        text: "text-error-600",
    },
    success: {
        container: "border-success-200 bg-success-50",
        icon: "text-success-500",
        iconColor: "var(--color-success-500)",
        heading: "text-success-700",
        text: "text-success-600",
    },
    warning: {
        container: "border-warning-200 bg-warning-50",
        icon: "text-warning-500",
        iconColor: "var(--color-warning-500)",
        heading: "text-warning-700",
        text: "text-warning-600",
    },
    info: {
        container: "border-slate-200 bg-slate-50",
        icon: "text-slate-500",
        iconColor: "var(--color-slate-500)",
        heading: "text-slate-700",
        text: "text-slate-600",
    },
} as const;

// ============================================================================
// Payment Input Constants
// ============================================================================

export const PAYMENT_INPUT_DEFAULT_MAX_LENGTH = 19;

// ============================================================================
// MultiComboBox Constants
// ============================================================================

export const MULTI_COMBOBOX_BLUR_DELAY_MS = 200;
export const MULTI_COMBOBOX_MAX_HEIGHT_MD = 320;
export const MULTI_COMBOBOX_MAX_HEIGHT_SM = 256;
export const MULTI_COMBOBOX_GAP = 8;
// ============================================
// Container & Grid Constants
// ============================================

export const DEFAULT_GRID_COLUMNS = 12;
