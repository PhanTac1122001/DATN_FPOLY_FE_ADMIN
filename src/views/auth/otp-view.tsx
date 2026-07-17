"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import { AuthShell } from "@/components/layout/auth/auth-shell";
import { OtpForm } from "@/components/ui/auth/otp-form";
import { ROUTES } from "@/constants/app.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { useAppRouter } from "@/hooks/use-app-router";
import { useAuth } from "@/hooks/use-auth";

export function OtpView() {
    const router = useAppRouter();
    const { user, isLoading } = useAuth();
    const [email, setEmail] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(true);

    useEffect(() => {
        if (!isLoading && user) {
            router.replace(ROUTES.HOME as Route);
            return;
        }

        const storedEmail = sessionStorage.getItem("login_email");
        if (!storedEmail) {
            router.replace(ROUTES.LOGIN as Route);
            return;
        }
        setEmail(storedEmail);
        setIsVerifying(false);
    }, [user, isLoading, router]);

    if (isLoading || isVerifying || !email) {
        return (
            <div className="flex min-h-dvh items-center justify-center bg-cream">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500" />
                    <p className="text-sm text-slate-600">{UI_TEXT.auth.otp.loading}</p>
                </div>
            </div>
        );
    }

    return (
        <AuthShell>
            <OtpForm email={email} />
        </AuthShell>
    );
}
