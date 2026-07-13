// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import * as Sentry from "@sentry/nextjs";
import { SENTRY_CONFIG } from "@/constants/app.constants";

const dsn = process.env.SENTRY_DSN;
// Disable Sentry in local development
const isLocalDevelopment = process.env.NODE_ENV === "development";

if (dsn && !isLocalDevelopment) {
    Sentry.init({
        dsn,
        tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? SENTRY_CONFIG.TRACES_SAMPLE_RATE),
        enableLogs: true,
        // Note: sendDefaultPii should be false in production for privacy compliance
        sendDefaultPii: process.env.NODE_ENV === "development",
    });
}
