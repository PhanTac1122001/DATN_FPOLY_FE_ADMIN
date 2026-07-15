import type { PermissionCode } from "@/config/permissions";

export function useAuth() {
    const user = {
        id: "mock-id",
        fullName: "Nguyễn Minh Anh (Admin)",
        email: "admin@mock.local",
        avatarUrl: null as string | null,
        phoneNumber: null as string | null,
        role: "ADMIN",
        roles: ["ADMIN"],
        permissions: [] as string[],
        createdAt: new Date().toISOString(),
    };
    const isLoading = false;
    const error = null;

    const hasPermission = (_permission: PermissionCode) => {
        return true;
    };

    const hasAnyPermission = (_permissions: PermissionCode[]) => {
        return true;
    };

    const hasAllPermissions = (_permissions: PermissionCode[]) => {
        return true;
    };

    return {
        user,
        isLoading,
        error,
        isAuthenticated: true,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
    };
}
