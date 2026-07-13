import { GoogleAnalytics as NextGoogleAnalytics } from "@next/third-parties/google";
import { ANALYTICS_CONFIG } from "@/constants/app.constants";

export function GoogleAnalytics() {
    const isProduction = process.env.NODE_ENV === "production";

    if (!isProduction || !ANALYTICS_CONFIG.GA_MEASUREMENT_ID) {
        return null;
    }

    return <NextGoogleAnalytics gaId={ANALYTICS_CONFIG.GA_MEASUREMENT_ID} />;
}
