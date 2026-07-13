import { HttpError } from "@/lib/http-client";

export function extractErrorCodeFromPayload(payload: unknown): string | undefined {
    if (!payload || typeof payload !== "object") return undefined;

    const directCode = (payload as { code?: unknown }).code;
    if (typeof directCode === "string") return directCode;

    const nestedMessage = (payload as { message?: unknown }).message;
    if (nestedMessage && typeof nestedMessage === "object") {
        const nestedCode = (nestedMessage as { code?: unknown }).code;
        if (typeof nestedCode === "string") return nestedCode;
    }

    return undefined;
}

export function resolveHttpOrUnknownErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpError) {
        const payload = error.payload as { message?: string | string[] } | undefined;
        const m = payload?.message;
        if (Array.isArray(m)) return m.join(", ");
        if (typeof m === "string") return m;
        return error.message || fallback;
    }
    return fallback;
}
