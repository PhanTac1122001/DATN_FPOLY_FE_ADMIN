"use client";

import { useEffect } from "react";
import { AdminLayout } from "@/components/layout/admin/admin-layout";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { useAppRouter } from "@/hooks/use-app-router";
import { useAuth } from "@/hooks/use-auth";
import { RoleEnum } from "@/types/staff.types";
import { StaffListView } from "./staff-list-view";

export function StaffListClientView() {
    const { user, isLoading } = useAuth();
    const router = useAppRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.replace("/login");
            } else {
                const userRoles = user.roles || (user.role ? [user.role] : []);
                const hasAccess = userRoles.includes(RoleEnum.ADMIN) || userRoles.includes(RoleEnum.MANAGER);
                if (!hasAccess) {
                    router.replace("/");
                }
            }
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

    const userRoles = user.roles || (user.role ? [user.role] : []);
    const hasAccess = userRoles.includes(RoleEnum.ADMIN) || userRoles.includes(RoleEnum.MANAGER);
    if (!hasAccess) {
        return null;
    }

    return (
        <AdminLayout title={UI_TEXT.staff.title} subtitle={UI_TEXT.staff.subtitle} disableScroll={true}>
            <StaffListView />
        </AdminLayout>
    );
}
