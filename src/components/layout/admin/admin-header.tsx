"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface AdminHeaderProps {
    title?: string;
    subtitle?: string;
}

export function AdminHeader({
    title = "Thống kê hệ đào tạo",
    subtitle = "Tổng quan số học viên và lớp học theo từng hệ đào tạo",
}: AdminHeaderProps) {
    const { user } = useAuth();
    const [time, setTime] = useState("");

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, "0");
            const minutes = String(now.getMinutes()).padStart(2, "0");
            setTime(`${hours}:${minutes}`);
        };

        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, []);

    // Get initials for profile avatar
    const getInitials = (name?: string) => {
        if (!name) return "A";
        // Remove parenthesized text like (Admin)
        const cleanName = name.replace(/\s*\(.*?\)\s*/g, "").trim();
        const parts = cleanName.split(/\s+/).filter(Boolean);
        if (parts.length === 0) return "A";
        // Get the last word of the clean name and return its first letter
        const lastWord = parts[parts.length - 1];
        return lastWord[0].toUpperCase();
    };

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-line bg-white/86 px-8 py-4 backdrop-blur-md">
            <div className="min-w-0">
                <h1 className="font-display text-[20px] font-extrabold tracking-tight leading-normal text-ink">
                    {title}
                </h1>
                <p className="mt-0.5 text-[12px] font-medium text-muted">
                    {subtitle}
                </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
                {/* Live Time indicator */}
                <div className="flex items-center gap-1.5 rounded-full border border-wine/12 bg-wine-soft px-3 py-1.5 text-[12px] font-bold text-wine-deep">
                    <Clock className="size-3.5" />
                    <span>{time || "12:00"}</span>
                </div>

                {/* User profile indicator */}
                <div className="flex items-center gap-2.5 rounded-full border border-line bg-white px-3 py-1 shadow-xs">
                    <div className="text-right">
                        <div className="font-bold text-[13px] leading-tight text-ink">
                            {user?.fullName || "Rikkei Admin"}
                        </div>
                        <div className="text-[10.5px] font-medium text-muted">
                            {user?.role === "ADMIN" ? "Quản trị viên" : "Quản trị tối cao"}
                        </div>
                    </div>
                    <div className="flex size-8.5 items-center justify-center rounded-full bg-linear-to-br from-wine-bright to-wine text-[13.5px] font-extrabold text-white">
                        {getInitials(user?.fullName)}
                    </div>
                </div>
            </div>
        </header>
    );
}
