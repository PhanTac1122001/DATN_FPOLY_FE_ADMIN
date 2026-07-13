import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/ui/auth/forgot-password-form";
import { ROUTES } from "@/constants/app.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";

export const metadata: Metadata = {
    title: `${UI_TEXT.auth.forgotPassword.title} - ${UI_TEXT.common.appName}`,
    description: UI_TEXT.auth.forgotPassword.subtitle,
};

export default function ForgotPasswordPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-white px-6 py-12">
            <div className="w-full max-w-[440px]">
                <div className="mb-8 text-center">
                    <Link href={ROUTES.HOME} className="font-display text-2xl font-bold text-brand-500">
                        {UI_TEXT.home.title}
                    </Link>
                </div>
                <ForgotPasswordForm />
            </div>
        </div>
    );
}
