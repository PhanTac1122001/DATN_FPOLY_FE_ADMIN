import { API_PREFIX, AUTH_PREFIX } from "@/constants/api-endpoints.constants";

export const isValidUrl = (urlStr: string): boolean => {
    const trimmed = urlStr.trim();
    if (!trimmed) return false;
    try {
        const parsed = new URL(trimmed);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        return false;
    }
};

export function formatApiPath(path: string): string {
    if (!path || path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
    if (path.startsWith(API_PREFIX) || path.startsWith(AUTH_PREFIX) || path.startsWith("/api") || path.startsWith("/v1") || path.startsWith("/chatbot-api")) {
        return path;
    }
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${API_PREFIX}${cleanPath}`;
}
