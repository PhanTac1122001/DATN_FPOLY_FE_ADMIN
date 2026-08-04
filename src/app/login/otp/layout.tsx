import type { Metadata } from "next";
import { UI_TEXT } from "@/constants/ui-text.constants";

export const metadata: Metadata = {
    title: `${UI_TEXT.metadata.otp.title} - ${UI_TEXT.common.appName}`,
    description: UI_TEXT.metadata.otp.description,
};

export default function OtpLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
