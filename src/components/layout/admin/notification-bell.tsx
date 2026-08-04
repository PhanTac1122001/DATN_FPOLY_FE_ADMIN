"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Eye, Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { notificationService } from "@/services/notification.service";
import type { LmsNotificationEntity } from "@/types/notification.types";
import { CreateNotificationModal } from "./modals/create-notification-modal";
import { NotificationDetailModal } from "./modals/notification-detail-modal";

const maxDisplayCount = 99;
const paddingDigits = 2;
const monthOffset = 1;

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<LmsNotificationEntity[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<LmsNotificationEntity | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const data = await notificationService.listStaffNotifications({ limit: 10, offset: 0 });
            setNotifications(data?.items || []);
            setTotalCount(data?.totalItems || 0);
        } catch {
            setNotifications([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm(UI_TEXT.notifications.confirmDelete)) return;
        try {
            await notificationService.deleteStaffNotification(id);
            fetchNotifications();
        } catch (err) {
            console.error("Failed to delete notification", err);
        }
    };

    const handleItemClick = (item: LmsNotificationEntity) => {
        setSelectedNotification(item);
        setIsDetailOpen(true);
        setIsOpen(false);
    };

    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            return `${d.getHours().toString().padStart(paddingDigits, "0")}:${d
                .getMinutes()
                .toString()
                .padStart(paddingDigits, "0")} ${d.getDate()}/${d.getMonth() + monthOffset}`;
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) fetchNotifications();
                }}
                className="relative flex size-9 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-xs transition-colors hover:bg-slate-50 hover:text-wine-bright"
                title={UI_TEXT.notifications.title}
            >
                <Bell className="size-4.5" />
                {totalCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-wine-bright px-1 text-[10px] font-extrabold text-white">
                        {totalCount > maxDisplayCount ? "99+" : totalCount}
                    </span>
                )}
            </button>

            {/* Dropdown Popover */}
            {isOpen && (
                <div className="absolute top-11 right-0 z-50 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl duration-150 animate-in fade-in zoom-in-95 sm:w-96">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <h4 className="font-display text-sm font-bold text-slate-900">{UI_TEXT.notifications.title}</h4>
                            <span className="rounded-full bg-wine-soft px-2 py-0.5 text-[11px] font-bold text-wine-deep">{totalCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={fetchNotifications}
                                disabled={loading}
                                className="cursor-pointer rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                                title={UI_TEXT.notifications.reload}
                            >
                                <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
                            </button>
                            <button
                                onClick={() => {
                                    setIsCreateOpen(true);
                                    setIsOpen(false);
                                }}
                                className="flex cursor-pointer items-center gap-1 rounded-lg bg-wine-bright px-2.5 py-1 text-[11px] font-bold text-white shadow-xs transition-colors hover:bg-wine"
                            >
                                <Plus className="size-3" />
                                <span>{UI_TEXT.notifications.createButton}</span>
                            </button>
                        </div>
                    </div>

                    {/* Notification Items List */}
                    <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
                        {loading && notifications.length === 0 ? (
                            <div className="flex items-center justify-center gap-2 py-8 text-xs font-medium text-slate-400">
                                <Loader2 className="size-4 animate-spin" />
                                <span>{UI_TEXT.notifications.loading}</span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-8 text-center text-xs font-medium text-slate-400">{UI_TEXT.notifications.empty}</div>
                        ) : (
                            notifications.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => handleItemClick(item)}
                                    className="group flex cursor-pointer items-start gap-3 p-3.5 transition-colors hover:bg-cream/40"
                                >
                                    <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-wine-soft text-xs font-bold text-wine-bright">
                                        {item.categoryCode?.[0] || "N"}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-0.5 flex items-center justify-between gap-1">
                                            <span className="truncate text-xs font-bold text-slate-900 transition-colors group-hover:text-wine-bright">
                                                {item.title}
                                            </span>
                                            <span className="shrink-0 text-[10px] font-medium text-slate-400">{formatDate(item.createdAt)}</span>
                                        </div>
                                        <p className="line-clamp-2 text-[11.5px] leading-snug font-medium text-slate-600">{item.message}</p>
                                        <div className="mt-1.5 flex items-center justify-between">
                                            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                                                {item.categoryLabel || item.categoryCode}
                                            </span>
                                            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleItemClick(item);
                                                    }}
                                                    className="cursor-pointer rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                                                    title={UI_TEXT.common.actions.edit}
                                                >
                                                    <Eye className="size-3.5" />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(item.id, e)}
                                                    className="cursor-pointer rounded-md p-1 text-slate-400 hover:bg-red-100 hover:text-red-600"
                                                    title={UI_TEXT.common.actions.delete}
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Modals */}
            <NotificationDetailModal notification={selectedNotification} isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} />

            <CreateNotificationModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={fetchNotifications} />
        </div>
    );
}
