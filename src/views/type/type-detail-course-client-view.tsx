"use client";

import { Suspense, useEffect } from "react";
import { AdminLayout } from "@/components/layout/admin/admin-layout";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { useAppRouter } from "@/hooks/use-app-router";
import { useAuth } from "@/hooks/use-auth";
import type { TypeDetailCourseClientViewProps } from "@/types/type.types";
import { TypeDetailCourseView } from "./type-detail-course-view";

export function TypeDetailCourseClientView({ courseId }: TypeDetailCourseClientViewProps) {
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
                <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <AdminLayout title={UI_TEXT.learningMaterials.title} subtitle={UI_TEXT.learningMaterials.subtitle} disableScroll={true} hideSidebarAndHeader={true}>
            <Suspense
                fallback={
                    <div className="flex h-[300px] items-center justify-center">
                        <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
                    </div>
                }
            >
                <TypeDetailCourseView courseId={courseId} />
            </Suspense>
        </AdminLayout>
    );
}
