import { useAuth } from "@/hooks/use-auth";
import type { PermissionGuardProps } from "@/types/auth-components.types";

export function PermissionGuard({ children, permission, fallback = null }: PermissionGuardProps) {
    const { hasPermission, isLoading } = useAuth();

    if (isLoading) {
        return null;
    }

    if (!permission || !hasPermission(permission)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
