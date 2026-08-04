export const APP_CONFIG = {
    NAME: "LMS Portal",
    DESCRIPTION: "Nền tảng quản lý học tập",
    ORGANIZATION: "LMS",
    ACCESS_TOKEN_KEY: "access_token",
    REFRESH_TOKEN_KEY: "refresh_token",
    DEFAULT_LOCALE: "vi",
    CONTACT_EMAIL: "support@lms-portal.local",
    DATE_FORMAT_DISPLAY: "dd/MM/yyyy",
    DEFAULT_THEME_COLOR: "#800020",
} as const;

/**
 * Icon sizes from design tokens
 */
export const ICON_SIZES = {
    XS: 12,
    SM: 14,
    MD: 16,
    LG: 20,
    XL: 24,
    XXL: 40,
} as const;

/**
 * Icon colors from design tokens
 * These values match CSS variables in src/styles/theme.css
 */
export const ICON_COLORS = {
    WHITE: "#ffffff",
    GRAY_400: "#64748b",
    GRAY_500: "#475569",
    GRAY_300: "#94a3b8",
    GRAY_600: "#334155",
    GRAY_700: "#1E293B",
    GRAY_800: "#0F172A",
    BRAND_50: "#ECEDFB",
    BRAND_400: "#6C72E0",
    BRAND_500: "#4B51C4",
    BRAND_600: "#363C97",
    NAV_500: "#454A72",
    NAV_700: "#30334D",
    GOLD_50: "#F8EED6",
    GOLD_500: "#CE9A38",
    GOLD_600: "#A97A1F",
    CREAM: "#F6F7FC",
    INK: "#20233A",
    MUTED: "#5B6070",
    LINE: "#E6E8F2",
    AI_400: "#2E8FBE",
    AI_500: "#1B6CA8",
    AI_600: "#14567F",
    BLUE_25: "#F5F6FF",
    BLUE_400: "#4C59D9",
    BLUE_LIGHT_50: "#F0F9FF",
    BLUE_LIGHT_700: "#026AA2",
    SUCCESS_50: "#E3F1E8",
    SUCCESS_500: "#3E8E5A",
    SUCCESS_700: "#027A48",
    PINK_50: "#FDF2FA",
    PINK_700: "#C11574",
    WARNING_50: "#FBEED8",
    WARNING_500: "#CF8A2C",
    WARNING_700: "#B54708",
    ERROR_50: "#FBE5E2",
    ERROR_700: "#B42318",
    ERROR_500: "#C0392B",
    RED_500: "#C0392B",
    GREEN_500: "#3E8E5A",

    // Textarea resize handle colors
    GRAY_NEUTRAL_300: "#D2D5DA",
    GRAY_NEUTRAL_700: "#38404A",
    BLACK: "#000000",

    // Theme 400 Colors
    ERROR_400: "#F97066",
    RED_400: "#F97066",
    WARNING_400: "#FDB022",
    SUCCESS_400: "#32D583",
    GREEN_400: "#32D583",
    TEAL_400: "#2ED3B7",
    INDIGO_400: "#8098F9",
    PURPLE_400: "#9B8AFB",
    PINK_400: "#F670C7",
    ORANGE_400: "#F38744",

    AMBER_500: "#CF8A2C",
    AMBER_50: "#FBEED8",
    BLUE_500: "#1B6CA8",
    BLUE_50: "#EFF6FF",
    RED_600: "#DC2626",
    RED_50: "#FBE5E2",
    GREEN_600: "#16A34A",
    GRAY_100: "#F2F4F7",
    GRAY_100_SLATE: "#E2E8F0",
    GRAY_200: "#E4E7EC",
    GRAY_200_SLATE: "#CBD5E1",
    TOAST_SUCCESS_BG: "#E3F1E8",
    TOAST_INFO_BG: "#EFF6FF",
    TOAST_INFO_BORDER: "#1B6CA8",
    TOAST_INFO_ICON: "#1B6CA8",
} as const;

/** Alias for lint rule "COLORS từ config". Use ICON_COLORS or this. */
export const COLORS = ICON_COLORS;

/**
 * Application routes
 */
export const ROUTES = {
    LOGIN: "/login",
    REGISTER: "/register",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
    HOME: "/",
    DASHBOARD: "/dashboard",
} as const;

export const IMAGE_PATHS = {
    LOGO: "/logo.svg",
    RIKKEI_LOGO: "/assets/rikkei-logo.png",
} as const;

/**
 * Error message keywords for parsing backend error responses
 */
export const ERROR_KEYWORDS = {
    EXPIRED: ["hết hạn", "expired"],
    INVALID: ["không hợp lệ", "invalid"],
    CONSTRAINT: ["constraint", "liên kết", "foreign key"],
} as const;

export const SENTRY_CONFIG = {
    TRACES_SAMPLE_RATE: 0.1,
    REPLAYS_SESSION_SAMPLE_RATE: 0.05,
    REPLAYS_ERROR_SAMPLE_RATE: 1.0,
} as const;

export const ANALYTICS_CONFIG = {
    GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
} as const;

export const VALIDATION_LIMITS = {
    NAME_MAX_LENGTH: 255,
    DESCRIPTION_MAX_LENGTH: 1000,
} as const;

export const DEBOUNCE_MS = 300;

/**
 * UI Breakpoints in pixels
 */
export const BREAKPOINTS = {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    XXL: 1536,
} as const;
