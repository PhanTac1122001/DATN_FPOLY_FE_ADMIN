export const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX || "/api";
export const AUTH_PREFIX = process.env.NEXT_PUBLIC_AUTH_PREFIX || "/v1";

export { formatApiPath } from "@/utils/url.utils";

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${AUTH_PREFIX}/auth/login/staff`,
        VERIFY_OTP: `${AUTH_PREFIX}/auth/login/staff/verify-otp`,
        RENEW_OTP: `${AUTH_PREFIX}/auth/renew-otp`,
        REGISTER: `${API_PREFIX}/auth/register`,
        VERIFY_EMAIL: `${API_PREFIX}/auth/verify-email`,
        LOGOUT: `${AUTH_PREFIX}/auth/logout`,
        REFRESH: `${AUTH_PREFIX}/auth/refresh-token`,
        FORGOT_PASSWORD: `${API_PREFIX}/auth/forgot-password`,
        RESET_PASSWORD: `${API_PREFIX}/auth/reset-password`,
        PROFILE: `${API_PREFIX}/staff/profile/me`,
        UPDATE_PROFILE: `${API_PREFIX}/staff/profile/me`,
        AVATAR_UPLOAD: `${API_PREFIX}/staff/profile/avatar/upload`,
        CHANGE_PASSWORD: `${API_PREFIX}/staff/password/change`,
        GOOGLE_LOGIN: `${API_PREFIX}/auth/google-login`,
        GOOGLE_REGISTER: `${API_PREFIX}/auth/google-register`,
    },
    HEALTH: `${API_PREFIX}/health`,
    UPLOAD: {
        IMAGE: `${API_PREFIX}/upload/image`,
        FILE: `${API_PREFIX}/upload/file`,
    },
    QUIZ: {
        BASE: `${API_PREFIX}/staff/quizzes`,
        BY_ID: (id: string) => `${API_PREFIX}/staff/quizzes/${id}`,
    },
} as const;
