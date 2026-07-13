import type { ReactNode } from "react";
import type { PermissionCode } from "@/config/permissions";
import type { RoleCode } from "./api-types";

// ============================================
// Permission Guard Types
// ============================================

export interface PermissionGuardProps {
    children: ReactNode;
    permission?: PermissionCode;
    permissions?: PermissionCode[];
    fallback?: ReactNode;
}

// ============================================
// Protected Route Types
// ============================================

export interface ProtectedRouteProps {
    children: ReactNode;
    permission?: PermissionCode;
    permissions?: PermissionCode[];
    role?: RoleCode;
    roles?: RoleCode[];
}

export interface AuthShellProps {
    children: ReactNode;
}

export type AuthEntryStep = "splash" | "login";

export interface AuthSplashProps {
    onStart: () => void;
}

