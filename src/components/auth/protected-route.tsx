"use client";

import { useEffect, useMemo } from "react";
import { useAppRouter } from "@/hooks/use-app-router";
import { useAuth } from "@/hooks/use-auth";
import { RoleCode } from "@/types/api-types";
import type { ProtectedRouteProps } from "@/types/auth-components.types";

export function ProtectedRoute({ children, permission, permissions, role, roles }: ProtectedRouteProps) {
    const router = useAppRouter();
    const { user, isLoading, isAuthenticated, hasPermission, hasAnyPermission } = useAuth();

    // Combine role and roles into a single array for checking
    const requiredRoles = useMemo(() => roles || (role ? [role] : undefined), [roles, role]);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            // Check roles first
            if (requiredRoles && user?.role && !requiredRoles.includes(user.role as RoleCode)) {
                router.push("/403");
                return;
            }
            // Check permission
            if (permission && !hasPermission(permission)) {
                router.push("/403");
                return;
            }
            if (permissions && !hasAnyPermission(permissions)) {
                router.push("/403");
                return;
            }
        }
    }, [isLoading, isAuthenticated, permission, permissions, requiredRoles, user?.role, hasPermission, hasAnyPermission, router]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    // Check roles
    if (requiredRoles && user?.role && !requiredRoles.includes(user.role as RoleCode)) {
        return null;
    }

    // Check permission
    if (permission && !hasPermission(permission)) {
        return null;
    }

    // Check multiple permissions
    if (permissions && !hasAnyPermission(permissions)) {
        return null;
    }

    return <>{children}</>;
}
