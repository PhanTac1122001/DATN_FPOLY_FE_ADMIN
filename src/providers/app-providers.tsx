"use client";

import { QueryProvider } from "./query-provider";
import { ToastProvider } from "./toast-provider";
import type { AppProvidersProps } from "@/types/providers.types";
import { LoadingOverlay } from "@/components/common/loading-overlay";

export function AppProviders({ children }: AppProvidersProps) {
    return (
        <QueryProvider>
            {children}
            <ToastProvider />
            <LoadingOverlay />
        </QueryProvider>
    );
}
