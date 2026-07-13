import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import type { Route } from "next";
import { APP_CONFIG, ROUTES } from "@/constants/app.constants";
import { logout as logoutService } from "@/services/auth.service";
import { useAppRouter } from "@/hooks/use-app-router";

export function useLogout() {
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const queryClient = useQueryClient();
    const router = useAppRouter();

    const logout = () => {
        setIsLoggingOut(true);
        
        // Gọi API logout ở chế độ chạy ngầm (fire-and-forget), không đợi kết quả
        logoutService().catch((error) => {
            console.error("Background logout service call failed", error);
        });

        // Xóa token và cache ngay lập tức ở client
        Cookies.remove(APP_CONFIG.ACCESS_TOKEN_KEY, { path: "/" });
        Cookies.remove(APP_CONFIG.ACCESS_TOKEN_KEY);

        // Clear queries
        queryClient.removeQueries({ queryKey: ["profile"] });
        queryClient.clear();

        // Chuyển hướng ngay lập tức về trang login
        router.replace(ROUTES.LOGIN as Route);
        setIsLoggingOut(false);
    };

    return {
        logout,
        isLoggingOut,
    };
}
