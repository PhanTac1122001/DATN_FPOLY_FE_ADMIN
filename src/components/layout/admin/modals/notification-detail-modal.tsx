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

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="w-full max-w-lg overflow-hidden !rounded-[24px]">
                <Dialog className="p-6 outline-none">
                    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
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

                    <div className="my-4 max-h-[60vh] space-y-3 overflow-y-auto pr-1">
                        <div className="rounded-xl bg-slate-50 p-3 text-sm font-medium text-slate-700">{notification.message}</div>

                        {notification.body && notification.body.length > 0 && (
                            <div className="space-y-2 text-sm text-slate-600">
                                {notification.body.map((p, idx) => (
                                    <p key={idx} className="leading-relaxed">
                                        {p}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-[12px] text-slate-500">
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
