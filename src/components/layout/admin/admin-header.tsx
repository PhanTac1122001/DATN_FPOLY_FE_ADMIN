"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar } from "@/components/base/avatar/avatar";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { RoleEnum } from "@/types/staff.types";

const PAD_LENGTH = 2;
const CLOCK_INTERVAL = 1000;

export function AdminHeader({
    title = "",
    subtitle = "",
}: {
    title?: string;
    subtitle?: string;
}) {
    const { user } = useAuth();
    const [time, setTime] = useState("");

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(PAD_LENGTH, "0");
            const minutes = String(now.getMinutes()).padStart(PAD_LENGTH, "0");
            setTime(`${hours}:${minutes}`);
        };

        updateClock();
        const interval = setInterval(updateClock, CLOCK_INTERVAL);
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

    const getRoleLabel = (roles?: string[], defaultRole?: string) => {
        if (!roles || roles.length === 0) {
            return defaultRole === RoleEnum.ADMIN ? UI_TEXT.staff.roleAdmin : UI_TEXT.staff.roleTeacher;
        }
        if (roles.includes(RoleEnum.ADMIN)) return UI_TEXT.staff.roleAdmin;
        if (roles.includes(RoleEnum.MANAGER)) return UI_TEXT.staff.roleManager;
        if (roles.includes(RoleEnum.TEACHER)) return UI_TEXT.staff.roleTeacher;
        if (roles.includes(RoleEnum.TEACHER_ASSISTANT)) return UI_TEXT.staff.roleTeacherAssistant;
        if (roles.includes(RoleEnum.ASSISTANT)) return UI_TEXT.staff.roleAssistant;
        return UI_TEXT.staff.roleDefault;
    };

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-line bg-white/86 px-8 py-4 backdrop-blur-md">
            <div className="min-w-0">
                <h1 className="font-display text-[20px] font-extrabold tracking-tight leading-normal text-ink">
                    {title || UI_TEXT.common.appName}
                </h1>
                {subtitle && (
                    <p className="mt-0.5 text-[12px] font-medium text-muted">
                        {subtitle}
                    </p>
                )}
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
                            {user?.fullName || UI_TEXT.common.appName}
                        </div>
                        <div className="text-[10.5px] font-medium text-muted">
                            {getRoleLabel(user?.roles, user?.role)}
                        </div>
                    </div>
                    <Avatar
                        size="sm"
                        src={user?.avatarUrl || undefined}
                        initials={getInitials(user?.fullName)}
                        alt={user?.fullName}
                        className="bg-linear-to-br from-wine-bright to-wine text-white font-extrabold"
                    />
                </div>
            </div>
        </header>
    );
}
