export type HttpParseMode = "json" | "text" | "blob";

export interface HttpClientOptions extends RequestInit {
    baseUrl?: string;
    parseAs?: HttpParseMode;
    requireAuth?: boolean;
}

export interface EventStreamClientOptions extends Omit<import("@microsoft/fetch-event-source").FetchEventSourceInit, "headers" | "signal"> {
    baseUrl?: string;
    headers?: HeadersInit;
    requireAuth?: boolean;
    signal?: AbortSignal;
}
