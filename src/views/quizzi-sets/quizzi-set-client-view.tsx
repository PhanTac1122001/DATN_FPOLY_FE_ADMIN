"use client";

import { useEffect } from "react";
import { AdminLayout } from "@/components/layout/admin/admin-layout";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { useAppRouter } from "@/hooks/use-app-router";
import { useAuth } from "@/hooks/use-auth";
import { QuizziSetListView } from "./quizzi-set-list-view";

export function QuizziSetClientView() {
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
                    <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-purple-600" />
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <AdminLayout title={UI_TEXT.quizziSetsPage.title} subtitle={UI_TEXT.quizziSetsPage.subtitle} disableScroll={true}>
            <QuizziSetListView />
        </AdminLayout>
    );
}
