"use client";

import { useEffect } from "react";
import { AdminLayout } from "@/components/layout/admin/admin-layout";
import { useAuth } from "@/hooks/use-auth";
import { useAppRouter } from "@/hooks/use-app-router";
import { UsersView } from "./users-view";

export function UsersClientView() {
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
        <AdminLayout title="Quản lý học viên" subtitle="Danh sách và cấu hình thông tin học tập của học viên">
            <UsersView />
        </AdminLayout>
    );
}
