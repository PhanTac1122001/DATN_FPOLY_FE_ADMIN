"use client";

import { useEffect } from "react";
import type { Route } from "next";
import { AuthShell } from "@/components/layout/auth/auth-shell";
import { LoginForm } from "@/components/ui/auth/login-form";
import { ROUTES } from "@/constants/app.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { useAppRouter } from "@/hooks/use-app-router";
import { useAuth } from "@/hooks/use-auth";

export function LoginView() {
    const router = useAppRouter();
    const { user, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && user) {
            router.replace(ROUTES.HOME as Route);
        }
    }, [user, isLoading, router]);

    if (isLoading || user) {
        return (
            <div className="flex min-h-dvh items-center justify-center bg-cream">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500" />
                    <p className="text-sm text-slate-600">{UI_TEXT.common.loading}</p>
                </div>
            </div>
        );
    }

    return (
        <AuthShell>
            <LoginForm />
        </AuthShell>
    );
}
