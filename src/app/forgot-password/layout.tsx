import { Metadata } from "next";
import { UI_TEXT } from "@/constants/ui-text.constants";

export const metadata: Metadata = {
    title: UI_TEXT.metadata.forgotPassword.title,
    description: UI_TEXT.metadata.forgotPassword.description,
    alternates: {
        canonical: "/forgot-password",
    },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
