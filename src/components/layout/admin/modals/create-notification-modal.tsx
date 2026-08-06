"use client";

import { useEffect, useState } from "react";
import { Loader2, Send, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { notificationService } from "@/services/notification.service";
import { toast } from "@/services/toast.service";
import type { CreateNotificationModalProps, NotificationCategory } from "@/types/notification.types";

const DEFAULT_CATEGORIES: NotificationCategory[] = [
    { code: "GIAO_VU", label: "Giáo vụ", sortOrder: 1, isActive: true, requiresTargetStudents: false },
    { code: "HOC_VU", label: "Học vụ", sortOrder: 2, isActive: true, requiresTargetStudents: false },
    { code: "HOC_BONG", label: "Học bổng", sortOrder: 3, isActive: true, requiresTargetStudents: false },
    { code: "SU_KIEN", label: "Sự kiện", sortOrder: 4, isActive: true, requiresTargetStudents: false },
    { code: "CA_NHAN", label: "Cá nhân", sortOrder: 5, isActive: true, requiresTargetStudents: true },
];

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
        setTitle("");
        setMessage("");
        setBodyText("");
        setAuthor("");
        setStudentIdsText("");
        setIsPinned(false);

        notificationService
            .listCategories()
            .then((res) => {
                const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
                const cats = items.length > 0 ? items : DEFAULT_CATEGORIES;
                setCategories(cats);
                if (cats.length > 0) {
                    setCategoryCode(cats[0].code);
                }
            })
            .catch((err) => {
                console.error("Failed to load categories, using defaults", err);
                setCategories(DEFAULT_CATEGORIES);
                setCategoryCode(DEFAULT_CATEGORIES[0].code);
            })
            .finally(() => setLoadingCats(false));
    }, [isOpen]);

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
            toast.success(UI_TEXT.notifications.createSuccessToast);
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : UI_TEXT.notifications.errCreateFailed;
            setError(msg);
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="w-full max-w-lg !overflow-hidden !rounded-[24px]">
                <Dialog className="flex max-h-[90vh] w-full flex-col rounded-[24px] bg-white shadow-2xl outline-none">
                    <div className="relative flex flex-col border-b border-slate-100 px-6 pt-6 pb-4">
                        <Heading slot="title" className="text-xl font-bold text-slate-900">
                            {UI_TEXT.notifications.createNewTitle}
                        </Heading>
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute top-5 right-5 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            aria-label="Close"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                        <div className="custom-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto p-6">
                            {error && <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600">{error}</div>}

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-slate-700">
                                    {UI_TEXT.notifications.categoryLabel} <span className="font-bold text-red-500">*</span>
                                </label>
                                {loadingCats ? (
                                    <div className="flex items-center gap-2 py-2 text-xs text-slate-400">
                                        <Loader2 className="size-4 animate-spin" /> {UI_TEXT.notifications.loadingCategories}
                                    </div>
                                ) : (
                                    <select
                                        value={categoryCode}
                                        onChange={(e) => setCategoryCode(e.target.value)}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-wine focus:outline-none"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat.code} value={cat.code}>
                                                {cat.label} ({cat.code})
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {requiresStudents && (
                                <Input
                                    label={
                                        <span>
                                            {UI_TEXT.notifications.studentIdsLabel} <span className="font-bold text-red-500">*</span>
                                        </span>
                                    }
                                    value={studentIdsText}
                                    onChange={(val: string) => setStudentIdsText(val)}
                                    placeholder={UI_TEXT.notifications.studentIdsPlaceholder}
                                />
                            )}

                            <Input
                                label={
                                    <span>
                                        {UI_TEXT.notifications.titleLabel} <span className="font-bold text-red-500">*</span>
                                    </span>
                                }
                                value={title}
                                onChange={(val: string) => setTitle(val)}
                                placeholder={UI_TEXT.notifications.titlePlaceholder}
                            />

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-slate-700">
                                    {UI_TEXT.notifications.messageLabel} <span className="font-bold text-red-500">*</span>
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={2}
                                    placeholder={UI_TEXT.notifications.messagePlaceholder}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm font-medium text-slate-800 focus:border-wine focus:outline-none"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-slate-700">{UI_TEXT.notifications.bodyLabel}</label>
                                <textarea
                                    value={bodyText}
                                    onChange={(e) => setBodyText(e.target.value)}
                                    rows={3}
                                    placeholder={UI_TEXT.notifications.bodyPlaceholder}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm font-medium text-slate-800 focus:border-wine focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label={UI_TEXT.notifications.authorLabel}
                                    value={author}
                                    onChange={(val: string) => setAuthor(val)}
                                    placeholder={UI_TEXT.notifications.authorPlaceholder}
                                />

                                <div className="flex items-center pt-6">
                                    <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={isPinned}
                                            onChange={(e) => setIsPinned(e.target.checked)}
                                            className="size-4 accent-wine"
                                        />
                                        {UI_TEXT.notifications.pinLabel}
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 rounded-b-[24px] border-t border-slate-100 bg-slate-50/60 p-4">
                            <Button type="button" color="secondary-gray" size="md" onClick={onClose} isDisabled={submitting}>
                                {UI_TEXT.common.cancel}
                            </Button>
                            <Button
                                color="primary"
                                size="md"
                                type="submit"
                                isLoading={submitting}
                                className="border-none bg-wine px-6 font-bold text-white hover:bg-wine-deep"
                                iconLeading={!submitting ? <Send className="size-4" /> : undefined}
                            >
                                {UI_TEXT.notifications.sendButton}
                            </Button>
                        </div>
                    </form>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
