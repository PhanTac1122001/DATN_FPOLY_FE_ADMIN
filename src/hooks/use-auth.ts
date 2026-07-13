import { useQuery } from "@tanstack/react-query";
import { PermissionCode } from "@/config/permissions";
import { PROFILE_CACHE_TIME } from "@/constants/query-cache.constants";
import { queryKeys } from "@/lib/query-keys";
import { getProfile } from "@/services/auth.service";

export function useAuth() {
    const {
        data: user,
        isLoading,
        error,
    } = useQuery({
        queryKey: queryKeys.profile(),
        queryFn: getProfile,
        retry: false,
        staleTime: PROFILE_CACHE_TIME,
    });

    const hasPermission = (permission: PermissionCode) => {
        if (!user?.permissions) return false;
        return user.permissions.includes(permission);
    };

    const hasAnyPermission = (permissions: PermissionCode[]) => {
        if (!user?.permissions) return false;
        return permissions.some((p) => user.permissions.includes(p));
    };

    const hasAllPermissions = (permissions: PermissionCode[]) => {
        if (!user?.permissions) return false;
        return permissions.every((p) => user.permissions.includes(p));
    };

    return {
        user,
        isLoading,
        error,
        isAuthenticated: !!user,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
    };
}
