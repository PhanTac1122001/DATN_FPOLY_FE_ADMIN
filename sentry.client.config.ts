// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import * as Sentry from "@sentry/nextjs";
import { SENTRY_CONFIG } from "@/constants/app.constants";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
// Disable Sentry in local development
const isLocalDevelopment = process.env.NODE_ENV === "development";

if (dsn && !isLocalDevelopment) {
    Sentry.init({
        dsn,
        // Add optional integrations for additional features
        integrations: [Sentry.replayIntegration()],
        tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? SENTRY_CONFIG.TRACES_SAMPLE_RATE),
        enableLogs: true,
        replaysSessionSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE ?? SENTRY_CONFIG.REPLAYS_SESSION_SAMPLE_RATE),
        replaysOnErrorSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_REPLAYS_ERROR_SAMPLE_RATE ?? SENTRY_CONFIG.REPLAYS_ERROR_SAMPLE_RATE),
        // Note: sendDefaultPii should be false in production for privacy compliance
        sendDefaultPii: process.env.NODE_ENV === "development",
    });
}

// Export router transition hook for Next.js App Router
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
