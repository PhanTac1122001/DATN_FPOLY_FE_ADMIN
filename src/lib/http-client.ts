import { fetchEventSource } from "@microsoft/fetch-event-source";
import * as Sentry from "@sentry/nextjs";
import Cookies from "js-cookie";
import { API_ENDPOINTS } from "@/constants/api-endpoints.constants";
import { APP_CONFIG } from "@/constants/app.constants";
import { HTTP_STATUS_NO_CONTENT, HTTP_STATUS_UNAUTHORIZED } from "@/constants/http.constants";
import { HttpMethod } from "@/types/api-types";
import type { EventStreamClientOptions, HttpClientOptions, HttpParseMode } from "@/types/http-client.types";

export type { HttpParseMode, HttpClientOptions };

export class HttpError<T = unknown> extends Error {
    public readonly status: number;
    public readonly payload?: T;

    constructor(status: number, message: string, payload?: T) {
        super(message);
        this.name = "HttpError";
        this.status = status;
        this.payload = payload;
    }
}

class StreamUnauthorizedRetryError extends Error {
    constructor() {
        super("Stream unauthorized");
        this.name = "StreamUnauthorizedRetryError";
    }
}

async function resolveAccessToken(): Promise<string | undefined> {
    if (typeof window === "undefined") {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        return cookieStore.get(APP_CONFIG.ACCESS_TOKEN_KEY)?.value;
    }
    return Cookies.get(APP_CONFIG.ACCESS_TOKEN_KEY);
}

function resolveBaseUrl() {
    return typeof window === "undefined" ? process.env.API_URL || "http://backend:3000" : "";
}

async function buildRequestHeaders(headers: HeadersInit | undefined, body: BodyInit | null | undefined, requireAuth: boolean) {
    const finalHeaders = new Headers(headers);

    if (!finalHeaders.has("Content-Type") && body && !(body instanceof FormData)) {
        finalHeaders.set("Content-Type", "application/json");
    }

    if (body instanceof FormData && finalHeaders.has("Content-Type")) {
        finalHeaders.delete("Content-Type");
    }

    if (requireAuth) {
        const token = await resolveAccessToken();
        if (token) {
            finalHeaders.set("Authorization", `Bearer ${token}`);
        }
    }

    return finalHeaders;
}

function handleAuthFailure() {
    if (typeof window !== "undefined") {
        const path = window.location.pathname;
        if (path === "/login" || path === "/login/otp") {
            return;
        }
        Cookies.remove(APP_CONFIG.ACCESS_TOKEN_KEY, { path: "/" });
        Cookies.remove(APP_CONFIG.ACCESS_TOKEN_KEY);
        Cookies.remove(APP_CONFIG.REFRESH_TOKEN_KEY, { path: "/" });
        Cookies.remove(APP_CONFIG.REFRESH_TOKEN_KEY);

        // Signal that the session has expired
        Cookies.set("session_expired", "1", { path: "/" });

        window.location.href = "/login";
    }
}

async function refreshAccessToken(baseUrl: string): Promise<boolean> {
    if (typeof window === "undefined") {
        return false;
    }
    const refreshToken = Cookies.get(APP_CONFIG.REFRESH_TOKEN_KEY);
    if (!refreshToken) {
        return false;
    }

    try {
        const refreshResponse = await fetch(`${baseUrl}${API_ENDPOINTS.AUTH.REFRESH}`, {
            method: HttpMethod.POST,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            if (data.accessToken && data.refreshToken) {
                Cookies.set(APP_CONFIG.ACCESS_TOKEN_KEY, data.accessToken, { expires: 1 });
                Cookies.set(APP_CONFIG.REFRESH_TOKEN_KEY, data.refreshToken, { expires: 7 });
                return true;
            }
        }
    } catch (e) {
        console.error("Refresh token failed:", e);
    }
    return false;
}

function isAbortError(error: unknown) {
    return error instanceof Error && error.name === "AbortError";
}

let isRefreshing = false;
let failedQueue: {
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
}[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

export async function httpClient<TResponse = unknown>(path: string, options?: HttpClientOptions): Promise<TResponse> {
    const defaultBaseUrl = resolveBaseUrl();

    const { baseUrl = defaultBaseUrl, parseAs = "json", requireAuth = true, headers, cache, ...rest } = options ?? {};
    const finalHeaders = await buildRequestHeaders(headers, rest.body, requireAuth);

    try {
        const response = await fetch(`${baseUrl}${path}`, {
            ...rest,
            headers: finalHeaders,
            credentials: "include",
            cache: cache ?? "no-store",
            next: rest.next ?? { revalidate: 0 },
        });

        if (!response.ok) {
            const contentType = response.headers.get("content-type") ?? "";
            const parseErrorPayload = contentType.includes("application/json")
                ? response
                      .clone()
                      .json()
                      .catch(() => undefined)
                : response
                      .clone()
                      .text()
                      .catch(() => undefined);

            const errorPayload = await parseErrorPayload;
            const errorMessage = deriveErrorMessage(errorPayload) ?? response.statusText;

            const error = new HttpError(response.status, errorMessage, errorPayload);
            throw error;
        }

        if (parseAs === "text") {
            return (await response.text()) as TResponse;
        }

        if (parseAs === "blob") {
            return (await response.blob()) as TResponse;
        }

        if (response.status === HTTP_STATUS_NO_CONTENT) {
            return undefined as TResponse;
        }

        const text = await response.text();
        if (!text) {
            return undefined as TResponse;
        }

        return JSON.parse(text) as TResponse;
    } catch (error) {
        if (error instanceof HttpError && error.status === HTTP_STATUS_UNAUTHORIZED) {
            if (path.includes("/auth/refresh") || path.includes("/auth/refresh-token") || path.includes("/auth/login")) {
                throw error;
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => {
                        return httpClient<TResponse>(path, options);
                    })
                    .catch((err) => {
                        throw err;
                    });
            }

            isRefreshing = true;

            try {
                const refreshed = await refreshAccessToken(baseUrl);

                if (refreshed) {
                    processQueue(null);
                    return httpClient<TResponse>(path, options);
                }

                const refreshError = new HttpError(HTTP_STATUS_UNAUTHORIZED, "Token refresh failed");
                processQueue(refreshError);
                handleAuthFailure();
                throw refreshError;
            } catch (refreshError) {
                processQueue(refreshError as Error);
                Sentry.captureException(refreshError);
                handleAuthFailure();
                throw refreshError;
            } finally {
                isRefreshing = false;
            }
        }

        Sentry.captureException(error);
        throw error;
    }
}

export function eventStreamClient(path: string, options: EventStreamClientOptions): () => void {
    const controller = new AbortController();

    if (options.signal) {
        if (options.signal.aborted) {
            controller.abort(options.signal.reason);
        } else {
            options.signal.addEventListener("abort", () => controller.abort(options.signal?.reason), { once: true });
        }
    }

    void runEventStream(path, options, controller, false);

    return () => {
        controller.abort();
    };
}

async function runEventStream(path: string, options: EventStreamClientOptions, controller: AbortController, hasRetriedUnauthorized: boolean): Promise<void> {
    const defaultBaseUrl = resolveBaseUrl();
    const { baseUrl = defaultBaseUrl, requireAuth = true, headers, body, onopen, onerror, openWhenHidden = true, ...rest } = options;
    const finalHeaders = await buildRequestHeaders(headers, body, requireAuth);
    let errorHandled = false;

    try {
        await fetchEventSource(`${baseUrl}${path}`, {
            ...rest,
            body,
            headers: Object.fromEntries(finalHeaders.entries()),
            signal: controller.signal,
            credentials: "include",
            openWhenHidden,
            async onopen(response) {
                if (
                    requireAuth &&
                    response.status === HTTP_STATUS_UNAUTHORIZED &&
                    !hasRetriedUnauthorized &&
                    !path.includes("/auth/refresh") &&
                    !path.includes("/auth/refresh-token") &&
                    !path.includes("/auth/login")
                ) {
                    const refreshed = await refreshAccessToken(baseUrl);
                    if (refreshed) {
                        throw new StreamUnauthorizedRetryError();
                    } else {
                        handleAuthFailure();
                    }
                }

                if (!response.ok) {
                    const contentType = response.headers.get("content-type") ?? "";
                    const errorPayload = contentType.includes("application/json")
                        ? await response
                              .clone()
                              .json()
                              .catch(() => undefined)
                        : await response
                              .clone()
                              .text()
                              .catch(() => undefined);
                    const errorMessage = deriveErrorMessage(errorPayload) ?? response.statusText;

                    throw new HttpError(response.status, errorMessage, errorPayload);
                }

                await onopen?.(response);
            },
            onerror(error) {
                if (controller.signal.aborted || isAbortError(error) || error instanceof StreamUnauthorizedRetryError) {
                    throw error;
                }

                errorHandled = true;
                onerror?.(error);
                throw error;
            },
        });
    } catch (error) {
        if (error instanceof StreamUnauthorizedRetryError && !hasRetriedUnauthorized && !controller.signal.aborted) {
            await runEventStream(path, options, controller, true);
            return;
        }

        if (controller.signal.aborted || isAbortError(error)) {
            return;
        }

        if (error instanceof HttpError && error.status === HTTP_STATUS_UNAUTHORIZED) {
            handleAuthFailure();
        }

        if (!errorHandled) {
            onerror?.(error);
        }
    }
}

function deriveErrorMessage(payload: unknown): string | undefined {
    if (payload === undefined || payload === null) {
        return undefined;
    }

    if (typeof payload === "string") {
        return payload;
    }

    if (Array.isArray(payload)) {
        return payload.map((item) => String(item)).join(", ");
    }

    if (typeof payload === "object") {
        const maybeMessage = (payload as { message?: unknown }).message;

        if (typeof maybeMessage === "string") {
            return maybeMessage;
        }

        if (Array.isArray(maybeMessage)) {
            return maybeMessage.map((item) => String(item)).join(", ");
        }

        try {
            return JSON.stringify(payload);
        } catch {
            return undefined;
        }
    }

    return String(payload);
}
