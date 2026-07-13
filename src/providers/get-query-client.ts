import { QueryClient, defaultShouldDehydrateQuery, isServer } from "@tanstack/react-query";
import { DEFAULT_MUTATION_RETRY_COUNT, DEFAULT_QUERY_RETRY_COUNT, DEFAULT_STALE_TIME_SECONDS, SECONDS_TO_MS } from "@/constants/query-provider.constants";

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: DEFAULT_STALE_TIME_SECONDS * SECONDS_TO_MS,
                refetchOnWindowFocus: false,
                retry: DEFAULT_QUERY_RETRY_COUNT,
            },
            mutations: {
                retry: DEFAULT_MUTATION_RETRY_COUNT,
            },
            dehydrate: {
                // include pending queries in dehydration
                shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query) || query.state.status === "pending",
            },
        },
    });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
    if (isServer) {
        // Server: always make a new query client
        return makeQueryClient();
    } else {
        // Browser: make a new query client if we don't already have one
        if (!browserQueryClient) browserQueryClient = makeQueryClient();
        return browserQueryClient;
    }
}
