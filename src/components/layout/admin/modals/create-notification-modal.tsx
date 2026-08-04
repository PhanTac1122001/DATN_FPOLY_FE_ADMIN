"use client";

import { useEffect, useState } from "react";
import { Loader2, Send, X } from "lucide-react";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { notificationService } from "@/services/notification.service";
import type { CreateNotificationModalProps, NotificationCategory } from "@/types/notification.types";

export function CreateNotificationModal({ isOpen, onClose, onSuccess }: CreateNotificationModalProps) {
    const [categories, setCategories] = useState<NotificationCategory[]>([]);
    const [loadingCats, setLoadingCats] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [categoryCode, setCategoryCode] = useState("");
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [bodyText, setBodyText] = useState("");
    const [author, setAuthor] = useState("");
    const [isPinned, setIsPinned] = useState(false);
    const [studentIdsText, setStudentIdsText] = useState("");

    useEffect(() => {
        if (!isOpen) return;
        setLoadingCats(true);
        setError("");
        notificationService
            .listCategories()
            .then((res) => {
                setCategories(res.items || []);
                if (res.items && res.items.length > 0) {
                    setCategoryCode(res.items[0].code);
                }
            })
            .catch((err) => {
                console.error("Failed to load categories", err);
            })
            .finally(() => setLoadingCats(false));
    }, [isOpen]);

    if (!isOpen) return null;

    const selectedCat = categories.find((c) => c.code === categoryCode);
    const requiresStudents = selectedCat?.requiresTargetStudents;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!title.trim() || !message.trim() || !categoryCode) {
            setError(UI_TEXT.notifications.errRequired);
            return;
        }

        const studentIds = studentIdsText
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

        if (requiresStudents && studentIds.length === 0) {
            setError(UI_TEXT.notifications.errStudentIdsRequired);
            return;
        }

        const body = bodyText
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);

        try {
            setSubmitting(true);
            await notificationService.createStaffNotification({
                categoryCode,
                title: title.trim(),
                message: message.trim(),
                body: body.length > 0 ? body : undefined,
                author: author.trim() || undefined,
                isPinned,
                studentIds: requiresStudents ? studentIds : undefined,
            });
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : UI_TEXT.notifications.errCreateFailed;
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl duration-150 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-display text-lg font-bold text-slate-900">{UI_TEXT.notifications.createNewTitle}</h3>
                    <button
                        onClick={onClose}
                        className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 max-h-[70vh] space-y-4 overflow-y-auto pr-1">
                    {error && <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600">{error}</div>}

                    <div>
                        <label className="mb-1 block text-xs font-bold text-slate-700">
                            {UI_TEXT.notifications.categoryLabel} <span className="text-red-500">{"*"}</span>
                        </label>
                        {loadingCats ? (
                            <div className="flex items-center gap-2 py-2 text-xs text-slate-400">
                                <Loader2 className="size-4 animate-spin" /> {UI_TEXT.notifications.loadingCategories}
                            </div>
                        ) : (
                            <select
                                value={categoryCode}
                                onChange={(e) => setCategoryCode(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-wine-bright focus:outline-none"
                            >
                                {categories.map((cat) => (
                                    <option key={cat.code} value={cat.code}>
                                        {cat.label} {"("}
                                        {cat.code}
                                        {")"}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {requiresStudents && (
                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-700">
                                {UI_TEXT.notifications.studentIdsLabel} <span className="text-red-500">{"*"}</span>
                            </label>
                            <input
                                type="text"
                                value={studentIdsText}
                                onChange={(e) => setStudentIdsText(e.target.value)}
                                placeholder={UI_TEXT.notifications.studentIdsPlaceholder}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-wine-bright focus:outline-none"
                            />
                        </div>
                    )}

                    <div>
                        <label className="mb-1 block text-xs font-bold text-slate-700">
                            {UI_TEXT.notifications.titleLabel} <span className="text-red-500">{"*"}</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={UI_TEXT.notifications.titlePlaceholder}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-wine-bright focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-bold text-slate-700">
                            {UI_TEXT.notifications.messageLabel} <span className="text-red-500">{"*"}</span>
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={2}
                            placeholder={UI_TEXT.notifications.messagePlaceholder}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-wine-bright focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-bold text-slate-700">{UI_TEXT.notifications.bodyLabel}</label>
                        <textarea
                            value={bodyText}
                            onChange={(e) => setBodyText(e.target.value)}
                            rows={3}
                            placeholder={UI_TEXT.notifications.bodyPlaceholder}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-wine-bright focus:outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1 block text-xs font-bold text-slate-700">{UI_TEXT.notifications.authorLabel}</label>
                            <input
                                type="text"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                placeholder={UI_TEXT.notifications.authorPlaceholder}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-wine-bright focus:outline-none"
                            />
                        </div>

                        <div className="flex items-center pt-5">
                            <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={isPinned}
                                    onChange={(e) => setIsPinned(e.target.checked)}
                                    className="size-4 rounded border-slate-300 text-wine-bright focus:ring-wine-bright"
                                />
                                {UI_TEXT.notifications.pinLabel}
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50"
                        >
                            {UI_TEXT.common.cancel}
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-wine-bright px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-wine disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                            {UI_TEXT.notifications.sendButton}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
