"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";
import { NETWORK_TOAST_ID } from "@/constants/toast.constants";
import { toast } from "@/services/toast.service";

export function ToastProvider() {
    useEffect(() => {
        const handleOffline = () => {
            toast.warning("Sự cố mạng", "Mất kết nối Internet. Vui lòng kiểm tra lại mạng.", {
                id: NETWORK_TOAST_ID,
                duration: Infinity,
            });
        };

        const handleOnline = () => {
            toast.dismiss(NETWORK_TOAST_ID);
        };

        window.addEventListener("offline", handleOffline);
        window.addEventListener("online", handleOnline);

        if (!navigator.onLine) {
            handleOffline();
        }

        return () => {
            window.removeEventListener("offline", handleOffline);
            window.removeEventListener("online", handleOnline);
            toast.dismiss(NETWORK_TOAST_ID);
        };
    }, []);

    return (
        <Toaster
            position="top-right"
            expand={false}
            duration={4000}
            toastOptions={{
                unstyled: true,
                classNames: {
                    toast: "flex items-center gap-3 p-4 rounded-xl shadow-lg border text-sm font-medium transition-all duration-300",
                    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
                    error: "bg-red-50 text-red-700 border-red-200",
                    info: "bg-blue-50 text-blue-700 border-blue-200",
                    warning: "bg-orange-50 text-orange-700 border-orange-200",
                    default: "bg-white text-slate-800 border-slate-200",
                },
            }}
        />
    );
}
