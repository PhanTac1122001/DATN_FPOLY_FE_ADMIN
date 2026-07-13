"use client";

import { useEffect } from "react";
import type { Route } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/ui/auth/register-form";
import { ROUTES } from "@/constants/app.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { useAppRouter } from "@/hooks/use-app-router";
import { useAuth } from "@/hooks/use-auth";

export default function RegisterPage() {
    const router = useAppRouter();
    const { user, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && user) {
            router.replace(ROUTES.HOME as Route);
        }
    }, [user, isLoading, router]);

    if (isLoading || user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500" />
                    <p className="text-sm text-gray-600">{UI_TEXT.common.loading}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-white px-6 py-12">
            <div className="w-full max-w-[440px]">
                <div className="mb-8 text-center">
                    <Link href={ROUTES.HOME} className="font-display text-2xl font-bold text-brand-500">
                        {UI_TEXT.home.title}
                    </Link>
                </div>
                <RegisterForm />
            </div>
        </div>
    );
}
