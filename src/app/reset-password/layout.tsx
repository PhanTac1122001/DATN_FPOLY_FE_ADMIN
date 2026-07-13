import { Metadata } from "next";
import { UI_TEXT } from "@/constants/ui-text.constants";

export const metadata: Metadata = {
    title: UI_TEXT.metadata.resetPassword.title,
    description: UI_TEXT.metadata.resetPassword.description,
    alternates: {
        canonical: "/reset-password",
    },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
