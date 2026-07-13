// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
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
