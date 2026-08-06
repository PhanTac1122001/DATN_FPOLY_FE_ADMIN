"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Save, Tag, X } from "lucide-react";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { APP_CONFIG } from "@/constants/app.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { sessionTypeService } from "@/services/session-type.service";
import { toast } from "@/services/toast.service";
import type { SessionType } from "@/types/session-type.types";

export interface SessionTypeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editingType?: SessionType | null;
}

export function SessionTypeFormModal({
    isOpen,
    onClose,
    onSuccess,
    editingType,
}: SessionTypeFormModalProps) {
    const isEdit = !!editingType;

    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [color] = useState<string>(APP_CONFIG.DEFAULT_THEME_COLOR);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setError("");
            if (editingType) {
                setCode(editingType.code || "");
                setName(editingType.name || "");
                setDescription(editingType.description || "");
            } else {
                setCode("");
                setName("");
                setDescription("");
            }
        }
    }, [isOpen, editingType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!isEdit && !code.trim()) {
            setError(UI_TEXT.sessionTypes.requiredError);
            return;
        }
        if (!name.trim()) {
            setError(UI_TEXT.sessionTypes.requiredError);
            return;
        }

        try {
            setSubmitting(true);

            if (isEdit && editingType) {
                await sessionTypeService.update(editingType.id, {
                    name: name.trim(),
                    description: description.trim() || undefined,
                });
                toast.success(UI_TEXT.common.successTitle, UI_TEXT.sessionTypeModal.toastUpdateSuccess);
            } else {
                await sessionTypeService.create({
                    code: code.trim().toUpperCase(),
                    name: name.trim(),
                    description: description.trim() || undefined,
                    color,
                });
                toast.success(UI_TEXT.common.successTitle, UI_TEXT.sessionTypeModal.toastCreateSuccess);
            }

            onSuccess();
            onClose();
        } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : UI_TEXT.common.genericError;
            setError(errMsg);
            toast.error(UI_TEXT.common.errorTitle, errMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const t = UI_TEXT.sessionTypes;

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="w-full max-w-md overflow-hidden !rounded-[24px]">
                <Dialog className="flex flex-col outline-none">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-wine">
                                <Tag className="size-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-extrabold text-slate-900">
                                    {isEdit ? "Chỉnh sửa loại buổi học" : "Thêm loại buổi học mới"}
                                </h2>
                                <p className="text-xs font-semibold text-slate-400">
                                    {isEdit ? "Cập nhật thông tin hiển thị loại buổi" : "Nhập mã và tên loại buổi học mới"}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
                        {error && (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-600">
                                {error}
                            </div>
                        )}

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-extrabold text-slate-700">
                                {t.codeLabel} {!isEdit && <span className="text-rose-500">*</span>}
                            </label>
                            <input
                                type="text"
                                disabled={isEdit}
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="VD: LY_THUYET, THUC_HANH"
                                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold uppercase text-slate-800 outline-none transition focus:border-wine focus:ring-1 focus:ring-wine disabled:bg-slate-100 disabled:text-slate-500"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-extrabold text-slate-700">
                                {t.nameLabel} <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="VD: Lý thuyết, Thực hành..."
                                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 outline-none transition focus:border-wine focus:ring-1 focus:ring-wine"
                                autoFocus
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-extrabold text-slate-700">{t.descLabel}</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Mô tả chi tiết về loại buổi học này..."
                                rows={3}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-wine focus:ring-1 focus:ring-wine"
                            />
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="cursor-pointer rounded-full border border-slate-200 px-5 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
                            >
                                {UI_TEXT.common.cancel}
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || !name.trim() || (!isEdit && !code.trim())}
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-wine px-6 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-wine/90 disabled:opacity-50"
                            >
                                {submitting ? (
                                    <Loader2 className="size-3.5 animate-spin" />
                                ) : isEdit ? (
                                    <Save className="size-3.5" />
                                ) : (
                                    <Plus className="size-3.5" />
                                )}
                                <span>{isEdit ? UI_TEXT.common.save : "Tạo loại mới"}</span>
                            </button>
                        </div>
                    </form>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
