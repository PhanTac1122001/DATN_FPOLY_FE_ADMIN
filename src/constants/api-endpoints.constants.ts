export const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX || "/api";
export const AUTH_PREFIX = process.env.NEXT_PUBLIC_AUTH_PREFIX || "/v1";
// Chatbot quy trình là microservice riêng: proxy qua /chatbot-api (xem next.config.ts).
export const CHATBOT_PREFIX = process.env.NEXT_PUBLIC_CHATBOT_PREFIX || "/chatbot-api";

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
        IMAGE: `${API_PREFIX}/storages/upload-image`,
        FILE: `${API_PREFIX}/upload/file`,
    },
    QUIZ: {
        BASE: `${API_PREFIX}/staff/quizzes`,
        BY_ID: (id: string) => `${API_PREFIX}/staff/quizzes/${id}`,
        IMPORT_EXCEL: `${API_PREFIX}/staff/quizzes/import-excel`,
        EXCEL_TEMPLATE: `${API_PREFIX}/staff/quizzes/excel-template`,
    },
    SESSION_QUIZ: {
        BASE: `${API_PREFIX}/staff/session-quizzes`,
        BY_ID: (id: string) => `${API_PREFIX}/staff/session-quizzes/${id}`,
        IMPORT_EXCEL: `${API_PREFIX}/staff/session-quizzes/import-excel`,
        EXCEL_TEMPLATE: `${API_PREFIX}/staff/session-quizzes/excel-template`,
    },
    FLASHCARD_DECK: {
        BASE: `${API_PREFIX}/staff/flashcard-decks`,
        BY_ID: (id: string) => `${API_PREFIX}/staff/flashcard-decks/${id}`,
        CARDS: (id: string) => `${API_PREFIX}/staff/flashcard-decks/${id}/cards`,
        CARD_BY_ID: (id: string, cardId: string) => `${API_PREFIX}/staff/flashcard-decks/${id}/cards/${cardId}`,
        REORDER: (id: string) => `${API_PREFIX}/staff/flashcard-decks/${id}/cards/reorder`,
        IMPORT_EXCEL: `${API_PREFIX}/staff/flashcard-decks/import-excel`,
        EXCEL_TEMPLATE: `${API_PREFIX}/staff/flashcard-decks/excel-template`,
    },
    CHATBOT: {
        PROCESS_DOCUMENTS: `${CHATBOT_PREFIX}/admin/process-documents`,
        PROCESS_DOCUMENTS_EXTRACT: `${CHATBOT_PREFIX}/admin/process-documents/extract`,
        PROCESS_DOCUMENT_INGEST: (id: string) => `${CHATBOT_PREFIX}/admin/process-documents/${id}/ingest`,
        PROCESS_DOCUMENT_BY_ID: (id: string) => `${CHATBOT_PREFIX}/admin/process-documents/${id}`,
        CONTACTS: `${CHATBOT_PREFIX}/admin/contacts`,
        CONTACT_BY_ID: (id: string) => `${CHATBOT_PREFIX}/admin/contacts/${id}`,
        BOT_SETTINGS: `${CHATBOT_PREFIX}/admin/bot-settings`,
    },
    APPLICATION_REQUESTS: {
        BASE: `${API_PREFIX}/staff/application-requests`,
        BY_ID: (id: string) => `${API_PREFIX}/staff/application-requests/${id}`,
        APPROVE: (id: string) => `${API_PREFIX}/staff/application-requests/${id}/approve`,
        REJECT: (id: string) => `${API_PREFIX}/staff/application-requests/${id}/reject`,
        STUDENT_BASE: `${API_PREFIX}/student/application-requests`,
    },
} as const;
