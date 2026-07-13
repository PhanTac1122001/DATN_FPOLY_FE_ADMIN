import { Metadata } from "next";
import { UI_TEXT } from "@/constants/ui-text.constants";

export const metadata: Metadata = {
    title: UI_TEXT.metadata.login.title,
    description: UI_TEXT.metadata.login.description,
    alternates: {
        canonical: "/login",
    },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
