"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, KeyRound, LogOut, User as UserIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Avatar } from "@/components/base/avatar/avatar";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { useAuth } from "@/hooks/use-auth";
import { useLogout } from "@/hooks/use-logout";
import { RoleEnum } from "@/types/staff.types";
import { cx } from "@/utils/cx";

export function UserDropdown() {
    const { user } = useAuth();
    const { logout, isLoggingOut } = useLogout();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getInitials = (name?: string) => {
        if (!name) return "A";
        const cleanName = name.replace(/\s*\(.*?\)\s*/g, "").trim();
        const parts = cleanName.split(/\s+/).filter(Boolean);
        if (parts.length === 0) return "A";
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
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex items-center gap-2.5 rounded-full border border-line bg-white px-3 py-1 shadow-xs transition duration-150 hover:border-wine/30 hover:bg-slate-50 focus:outline-none"
                aria-expanded={isOpen}
            >
                <div className="text-right">
                    <div className="text-[13px] leading-tight font-bold text-ink">{user?.fullName || UI_TEXT.common.appName}</div>
                    <div className="text-[10.5px] font-medium text-muted">{getRoleLabel(user?.roles, user?.role)}</div>
                </div>
                <Avatar
                    size="sm"
                    src={user?.avatarUrl || undefined}
                    initials={getInitials(user?.fullName)}
                    alt={user?.fullName}
                    className="bg-gradient-to-br from-wine-bright to-wine font-extrabold text-white"
                />
                <ChevronDown className={cx("size-3.5 text-muted transition-transform duration-200", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl backdrop-blur-md transition-all">
                    {/* User Info Header */}
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                        <Avatar
                            size="md"
                            src={user?.avatarUrl || undefined}
                            initials={getInitials(user?.fullName)}
                            alt={user?.fullName}
                            className="bg-gradient-to-br from-wine-bright to-wine font-extrabold text-white"
                        />
                        <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-bold text-slate-900">{user?.fullName}</div>
                            <div className="truncate text-xs font-medium text-slate-500">{user?.email}</div>
                            <div className="mt-1">
                                <span className="inline-block rounded-md bg-wine/10 px-2 py-0.5 text-[10px] font-bold text-wine-deep uppercase">
                                    {getRoleLabel(user?.roles, user?.role)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="my-2 border-t border-slate-100" />

                    {/* Navigation Menu */}
                    <div className="space-y-0.5">
                        <Link
                            href={"/profile" as Route}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-wine/5 hover:text-wine-deep"
                        >
                            <UserIcon className="size-4 text-slate-400" />
                            <span>{UI_TEXT.layout.profileInfo}</span>
                        </Link>

                        <Link
                            href={"/profile?tab=password" as Route}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-wine/5 hover:text-wine-deep"
                        >
                            <KeyRound className="size-4 text-slate-400" />
                            <span>{UI_TEXT.layout.changePassword}</span>
                        </Link>
                    </div>

                    <div className="my-2 border-t border-slate-100" />

                    {/* Logout Button */}
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            logout();
                        }}
                        disabled={isLoggingOut}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                    >
                        <LogOut className="size-4 text-rose-500" />
                        <span>{isLoggingOut ? UI_TEXT.layout.loggingOut : UI_TEXT.layout.logout}</span>
                    </button>
                </div>
            )}
        </div>
    );
}
