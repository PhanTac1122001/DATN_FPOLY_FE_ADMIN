"use client";

import { Suspense, useEffect } from "react";
import { AdminLayout } from "@/components/layout/admin/admin-layout";
import { useAppRouter } from "@/hooks/use-app-router";
import { useAuth } from "@/hooks/use-auth";
import { TypeDetailCourseView } from "./type-detail-course-view";

interface TypeDetailCourseClientViewProps {
    id: string;
    courseId: string;
}

export function TypeDetailCourseClientView({ id, courseId }: TypeDetailCourseClientViewProps) {
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
        <AdminLayout 
            title="Quản lý Học liệu" 
            subtitle="Cấu hình chương trình học, buổi học, bài học và đính kèm học liệu"
            disableScroll={true}
        >
            <Suspense
                fallback={
                    <div className="flex h-[300px] items-center justify-center">
                        <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
                    </div>
                }
            >
                <TypeDetailCourseView id={id} courseId={courseId} />
            </Suspense>
        </AdminLayout>
    );
}
