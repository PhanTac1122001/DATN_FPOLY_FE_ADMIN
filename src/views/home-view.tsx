"use client";

import { useAuth } from "@/hooks/use-auth";

export function HomeView() {
    const { user } = useAuth();

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 py-16 text-center bg-linear-to-b from-white to-slate-50 rounded-2xl border border-slate-100 p-8 shadow-sm">
            <h1 className="font-display text-4xl font-bold text-slate-950">
                Chào mừng quay trở lại, {user?.fullName || "Admin"}!
            </h1>
            <p className="max-w-xl text-base text-slate-600">
                Đây là trang quản lý hệ thống LMS Portal. Hãy sử dụng thanh điều hướng để quản lý hệ thống.
            </p>
        </div>
    );
}
