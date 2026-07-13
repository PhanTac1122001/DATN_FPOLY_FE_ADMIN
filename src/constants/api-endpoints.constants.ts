export const API_PREFIX = "/api";

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_PREFIX}/auth/login`,
        REGISTER: `${API_PREFIX}/auth/register`,
        VERIFY_EMAIL: `${API_PREFIX}/auth/verify-email`,
        LOGOUT: `${API_PREFIX}/auth/logout`,
        REFRESH: `${API_PREFIX}/auth/refresh`,
        FORGOT_PASSWORD: `${API_PREFIX}/auth/forgot-password`,
        RESET_PASSWORD: `${API_PREFIX}/auth/reset-password`,
        PROFILE: `${API_PREFIX}/auth/me`,
        UPDATE_PROFILE: `${API_PREFIX}/auth/me`,
        CHANGE_PASSWORD: `${API_PREFIX}/auth/change-password`,
        GOOGLE_LOGIN: `${API_PREFIX}/auth/google-login`,
        GOOGLE_REGISTER: `${API_PREFIX}/auth/google-register`,
    },
    HEALTH: `${API_PREFIX}/health`,
    UPLOAD: {
        IMAGE: `${API_PREFIX}/upload/image`,
        FILE: `${API_PREFIX}/upload/file`,
    },
} as const;
