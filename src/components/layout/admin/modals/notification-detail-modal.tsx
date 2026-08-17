"use client";

import { Calendar, Eye, Pin, Tag, User, X } from "lucide-react";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import type { NotificationDetailModalProps } from "@/types/notification.types";

export function NotificationDetailModal({ notification, isOpen, onClose }: NotificationDetailModalProps) {
    if (!notification) return null;

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return dateStr;
        }
    };

    const renderNotificationMessage = (message: string) => {
        if (!message) return null;

        const statusMap: Array<{ keywords: string[]; label: string; className: string }> = [
            {
                keywords: ["Có mặt", "CO_MAT", "PRESENT"],
                label: UI_TEXT.classes.statusPresent,
                className:
                    "inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-extrabold text-emerald-700 mx-1",
            },
            {
                keywords: ["Đi muộn", "DI_MUON", "LATE"],
                label: UI_TEXT.classes.statusLate,
                className: "inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-extrabold text-amber-700 mx-1",
            },
            {
                keywords: ["Vắng không phép", "Vắng mặt", "ABSENT_UNEXCUSED", "ABSENT"],
                label: UI_TEXT.classes.statusAbsentUnexcused,
                className: "inline-flex items-center rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-xs font-extrabold text-rose-700 mx-1",
            },
            {
                keywords: ["Vắng có phép", "Nghỉ có phép", "ABSENT_EXCUSED", "EXCUSED", "PERMITTED", "CO_PHEP"],
                label: UI_TEXT.classes.statusAbsentExcused,
                className: "inline-flex items-center rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-extrabold text-blue-700 mx-1",
            },
        ];

        for (const item of statusMap) {
            for (const kw of item.keywords) {
                if (message.includes(kw)) {
                    const idx = message.indexOf(kw);
                    const before = message.slice(0, idx);
                    const after = message.slice(idx + kw.length);
                    return (
                        <div className="rounded-xl bg-slate-50 p-4 text-sm leading-relaxed font-semibold text-slate-800 shadow-2xs">
                            {before}
                            <span className={item.className}>{item.label}</span>
                            {after}
                        </div>
                    );
                }
            }
        }

        return <div className="rounded-xl bg-slate-50 p-4 text-sm font-medium text-slate-700">{message}</div>;
    };

    const renderBodyItem = (line: string) => {
        const statusMap: Array<{ keywords: string[]; label: string; className: string }> = [
            {
                keywords: ["Có mặt", "CO_MAT", "PRESENT"],
                label: UI_TEXT.classes.statusPresent,
                className: "inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700",
            },
            {
                keywords: ["Đi muộn", "DI_MUON", "LATE"],
                label: UI_TEXT.classes.statusLate,
                className: "inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-700",
            },
            {
                keywords: ["Vắng không phép", "Vắng mặt", "ABSENT_UNEXCUSED", "ABSENT"],
                label: UI_TEXT.classes.statusAbsentUnexcused,
                className: "inline-flex items-center rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-xs font-bold text-rose-700",
            },
            {
                keywords: ["Vắng có phép", "Nghỉ có phép", "ABSENT_EXCUSED", "EXCUSED", "PERMITTED", "CO_PHEP"],
                label: UI_TEXT.classes.statusAbsentExcused,
                className: "inline-flex items-center rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-bold text-blue-700",
            },
        ];

        for (const item of statusMap) {
            for (const kw of item.keywords) {
                if (line.includes(kw)) {
                    const idx = line.indexOf(kw);
                    const namePart = line.slice(0, idx).replace(/:\s*$/, "").trim();
                    return (
                        <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-white p-2.5 text-xs font-semibold text-slate-800 shadow-2xs">
                            <span className="max-w-[70%] truncate">{namePart}</span>
                            <span className={item.className}>{item.label}</span>
                        </div>
                    );
                }
            }
        }

        return <div className="rounded-lg border border-slate-100 bg-white p-2.5 text-xs font-medium text-slate-700">{line}</div>;
    };

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden !rounded-[24px]">
                <Dialog className="flex max-h-[90vh] flex-col overflow-hidden p-6 outline-none">
                    <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 pb-4">
                        <div>
                            <div className="mb-1.5 flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-md bg-wine-soft px-2 py-0.5 text-[11px] font-bold text-wine-deep">
                                    <Tag className="size-3" />
                                    {notification.categoryLabel || notification.categoryCode}
                                </span>
                                {notification.isPinned && (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                                        <Pin className="size-3" />
                                        <span>{UI_TEXT.notifications.pinnedBadge}</span>
                                    </span>
                                )}
                            </div>
                            <h3 className="font-display text-lg font-bold text-slate-900">{notification.title}</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    <div className="my-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                        {renderNotificationMessage(notification.message)}

                        {notification.body && notification.body.length > 0 && (
                            <div className="mt-3 space-y-2 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
                                <div className="flex items-center justify-between px-1">
                                    <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                                        {`${UI_TEXT.notificationDetailModal.attendanceListPrefix}${notification.body.length} ${UI_TEXT.notificationDetailModal.attendanceListSuffix}`}
                                    </span>
                                </div>
                                <div className="max-h-[55vh] space-y-1.5 overflow-y-auto pr-1">
                                    {notification.body.map((p, idx) => (
                                        <div key={idx}>{renderBodyItem(p)}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-[12px] text-slate-500">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                                <User className="size-3.5 text-slate-400" />
                                {notification.author || UI_TEXT.sessionTypes.systemBadge}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="size-3.5 text-slate-400" />
                                {formatDate(notification.createdAt)}
                            </span>
                        </div>
                        <span className="flex items-center gap-1 font-medium">
                            <Eye className="size-3.5 text-slate-400" />
                            {notification.viewCount} {UI_TEXT.notifications.viewsLabel}
                        </span>
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
