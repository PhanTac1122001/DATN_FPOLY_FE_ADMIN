import type { Metadata, Viewport } from "next";
import NextTopLoader from "nextjs-toploader";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { ICON_COLORS } from "@/constants/app.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { AppProviders } from "@/providers/app-providers";
import { RouteProvider } from "@/providers/router-provider";
import "@/styles/globals.css";
import { cx } from "@/utils/cx";
import { primaryFont } from "./fonts";

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
    title: {
        template: "%s | LMS Portal",
        default: UI_TEXT.metadata.layout.titleDefault,
    },
    description: UI_TEXT.metadata.layout.description,
    keywords: ["lms", "học tập", "quản lý học tập", "LMS Portal"],
    openGraph: {
        title: UI_TEXT.metadata.layout.titleDefault,
        description: UI_TEXT.metadata.layout.description,
        url: "/",
        siteName: "LMS Portal",
        locale: "vi_VN",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: UI_TEXT.metadata.layout.twitterTitle,
        description: UI_TEXT.metadata.layout.twitterDescription,
    },
};

export const viewport: Viewport = {
    themeColor: ICON_COLORS.BRAND_500,
    colorScheme: "light",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="vi" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.cdnfonts.com" crossOrigin="anonymous" />
                <link href="https://fonts.cdnfonts.com/css/sf-pro-display" rel="stylesheet" />
            </head>
            <body className={cx(primaryFont.variable, "bg-white font-sans antialiased")}>
                <GoogleAnalytics />
                <NextTopLoader color={ICON_COLORS.BRAND_500} showSpinner={false} />
                <RouteProvider>
                    <AppProviders>{children}</AppProviders>
                </RouteProvider>
            </body>
        </html>
    );
}
