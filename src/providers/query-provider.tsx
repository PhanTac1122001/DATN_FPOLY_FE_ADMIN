"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { DEFAULT_MUTATION_RETRY_COUNT, DEFAULT_QUERY_RETRY_COUNT, DEFAULT_STALE_TIME_SECONDS, SECONDS_TO_MS } from "@/constants/query-provider.constants";
import type { QueryProviderProps } from "@/types/providers.types";

export function QueryProvider({ children }: QueryProviderProps) {
    const [client] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: DEFAULT_STALE_TIME_SECONDS * SECONDS_TO_MS,
                        refetchOnWindowFocus: false,
                        retry: DEFAULT_QUERY_RETRY_COUNT,
                    },
                    mutations: {
                        retry: DEFAULT_MUTATION_RETRY_COUNT,
                    },
                },
            }),
    );

    return (
        <QueryClientProvider client={client}>
            {children}
            {process.env.NODE_ENV === "development" ? <ReactQueryDevtools initialIsOpen={false} /> : null}
        </QueryClientProvider>
    );
}
