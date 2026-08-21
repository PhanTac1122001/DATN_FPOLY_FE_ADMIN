"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { MILLISECONDS_PER_SECOND, TIME_DIGIT_PADDING } from "@/constants/date-time.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { NotificationBell } from "./notification-bell";
import { UserDropdown } from "./user-dropdown";

export function AdminHeader({ title = "", subtitle = "" }: { title?: string; subtitle?: string }) {
    const [time, setTime] = useState("");

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(TIME_DIGIT_PADDING, "0");
            const minutes = String(now.getMinutes()).padStart(TIME_DIGIT_PADDING, "0");
            setTime(`${hours}:${minutes}`);
        };

        updateClock();
        const interval = setInterval(updateClock, MILLISECONDS_PER_SECOND);
        return () => clearInterval(interval);
    }, []);

    return (
        <header className="sticky top-0 z-30 flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-cream/86 px-8 py-4 backdrop-blur-[12px]">
            <div className="min-w-0">
                <h1 className="font-display text-[20px] leading-normal font-extrabold tracking-tight text-ink">{title || UI_TEXT.common.appName}</h1>
                {subtitle && <p className="mt-0.5 text-[12px] font-medium text-muted">{subtitle}</p>}
            </div>

            <div className="flex shrink-0 items-center gap-4">
                {/* Live Time indicator */}
                <div className="flex items-center gap-1.5 rounded-full border border-wine/12 bg-wine-soft px-3 py-1.5 text-[12px] font-bold text-wine-deep">
                    <Clock className="size-3.5" />
                    <span>{time || "12:00"}</span>
                </div>

                {/* Notification Bell Icon */}
                <NotificationBell />

                {/* User profile dropdown indicator */}
                <UserDropdown />
            </div>
        </header>
    );
}
