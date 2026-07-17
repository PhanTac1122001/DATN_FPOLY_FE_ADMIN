export const API_PREFIX = "/api";

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: "/v1/auth/login/staff",
        VERIFY_OTP: "/v1/auth/login/staff/verify-otp",
        RENEW_OTP: "/v1/auth/renew-otp",
        REGISTER: `${API_PREFIX}/auth/register`,
        VERIFY_EMAIL: `${API_PREFIX}/auth/verify-email`,
        LOGOUT: "/v1/auth/logout",
        REFRESH: "/v1/auth/refresh-token",
        FORGOT_PASSWORD: `${API_PREFIX}/auth/forgot-password`,
        RESET_PASSWORD: `${API_PREFIX}/auth/reset-password`,
        PROFILE: `${API_PREFIX}/staff/profile/me`,
        UPDATE_PROFILE: `${API_PREFIX}/staff/profile/me`,
        CHANGE_PASSWORD: `${API_PREFIX}/staff/password/change`,
        GOOGLE_LOGIN: `${API_PREFIX}/auth/google-login`,
        GOOGLE_REGISTER: `${API_PREFIX}/auth/google-register`,
    },
    HEALTH: `${API_PREFIX}/health`,
    UPLOAD: {
        IMAGE: `${API_PREFIX}/upload/image`,
        FILE: `${API_PREFIX}/upload/file`,
    },
} as const;
