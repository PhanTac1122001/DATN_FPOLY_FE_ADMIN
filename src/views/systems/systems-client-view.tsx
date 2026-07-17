"use client";

import { useEffect } from "react";
import { AdminLayout } from "@/components/layout/admin/admin-layout";
import { useAuth } from "@/hooks/use-auth";
import { useAppRouter } from "@/hooks/use-app-router";
import { SystemsView } from "./systems-view";
import { UI_TEXT } from "@/constants/ui-text.constants";

export function SystemsClientView() {
    const { user, isLoading } = useAuth();
    const router = useAppRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.replace("/login");
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-cream">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <AdminLayout title={UI_TEXT.trainingSystem.title} subtitle={UI_TEXT.trainingSystem.subtitle} disableScroll={true}>
            <SystemsView />
        </AdminLayout>
    );
}
