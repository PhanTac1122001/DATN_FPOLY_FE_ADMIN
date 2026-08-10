"use client";

import { useEffect, useState } from "react";
import { Edit2, Loader2, Plus, Save, Tag, Trash2, X } from "lucide-react";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { APP_CONFIG } from "@/constants/app.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { sessionTypeService } from "@/services/session-type.service";
import { toast } from "@/services/toast.service";
import type { SessionType, SessionTypeModalProps } from "@/types/session-type.types";

export function SessionTypeModal({ isOpen, onClose, onChanged }: SessionTypeModalProps) {
    const [types, setTypes] = useState<SessionType[]>([]);
    const [loading, setLoading] = useState(false);

    const [view, setView] = useState<"list" | "form">("list");
    const [editingType, setEditingType] = useState<SessionType | null>(null);

    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const isEdit = !!editingType;
    const t = UI_TEXT.sessionTypes;

    const loadTypes = async () => {
        setLoading(true);
        try {
            const data = await sessionTypeService.getAll(true);
            setTypes(data || []);
        } catch (err) {
            console.error("Failed to load session types", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setView("list");
            setEditingType(null);
            setError("");
            return;
        }
        setView("list");
        loadTypes();
    }, [isOpen]);

    const handleOpenCreate = () => {
        setEditingType(null);
        setCode("");
        setName("");
        setDescription("");
        setError("");
        setView("form");
    };

    const handleOpenEdit = (type: SessionType) => {
        setEditingType(type);
        setCode(type.code || "");
        setName(type.name || "");
        setDescription(type.description || "");
        setError("");
        setView("form");
    };

    const handleBackToList = () => {
        setView("list");
        setEditingType(null);
        setError("");
    };

    const handleDelete = async (type: SessionType) => {
        if (!confirm(UI_TEXT.sessionTypes?.confirmDelete || "Bạn có chắc chắn muốn xóa?")) return;
        try {
            const res = await sessionTypeService.remove(type.id);
            if (res && res.hardDeleted === false) {
                toast.success(UI_TEXT.sessionTypeModal.toastSoftDeleteInfoTitle, UI_TEXT.sessionTypeModal.toastSoftDeleteInfoDesc);
            } else {
                toast.success(UI_TEXT.common.successTitle, UI_TEXT.sessionTypeModal.toastDeleteSuccess);
            }
            loadTypes();
            onChanged?.();
        } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : UI_TEXT.common.genericError;
            toast.error(UI_TEXT.common.errorTitle, errMsg);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!isEdit && !code.trim()) {
            setError(t.requiredError);
            return;
        }
        if (!name.trim()) {
            setError(t.requiredError);
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
                    color: APP_CONFIG.DEFAULT_THEME_COLOR,
                });
                toast.success(UI_TEXT.common.successTitle, UI_TEXT.sessionTypeModal.toastCreateSuccess);
            }

            onChanged?.();
            await loadTypes();
            handleBackToList();
        } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : UI_TEXT.common.genericError;
            setError(errMsg);
            toast.error(UI_TEXT.common.errorTitle, errMsg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className={`w-full overflow-hidden !rounded-[24px] ${view === "form" ? "max-w-md" : "max-w-2xl"}`}>
                <Dialog className="flex max-h-[85vh] flex-col outline-none">
                    {view === "list" ? (
                        <>
                            <div className="relative flex items-center justify-between border-b border-slate-100 px-6 py-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-wine">
                                        <Tag className="size-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">{t.modalTitle}</h3>
                                        <p className="text-xs font-medium text-slate-500">{t.subtitle}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 pr-8">
                                    <button
                                        type="button"
                                        onClick={handleOpenCreate}
                                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-wine px-4 py-2 text-xs font-extrabold text-white shadow-xs transition hover:bg-wine/90"
                                    >
                                        <Plus className="size-3.5" />
                                        <span>{t.addButton}</span>
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="absolute top-4.5 right-5 cursor-pointer rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>

                            <div className="custom-scrollbar max-h-[60vh] overflow-y-auto p-6">
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2 py-10 text-xs font-bold text-slate-400">
                                        <Loader2 className="size-4 animate-spin" />
                                        <span>{UI_TEXT.common.loading}</span>
                                    </div>
                                ) : types.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                                        <Tag className="size-8 opacity-40" />
                                        <p className="mt-2 text-xs font-medium">{UI_TEXT.common.noData}</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2.5">
                                        {types.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-2xs transition hover:border-slate-300"
                                            >
                                                <div className="flex min-w-0 flex-1 flex-col gap-1 pr-3">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="text-sm font-black text-slate-900">{item.name}</span>
                                                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-extrabold text-slate-700">
                                                            {item.code}
                                                        </span>
                                                        {item.isSystem && (
                                                            <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                                                {t.systemBadge}
                                                            </span>
                                                        )}
                                                        {!item.isActive && (
                                                            <span className="rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">
                                                                {t.hiddenBadge}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {item.description && (
                                                        <p className="line-clamp-1 text-xs font-medium text-slate-500">{item.description}</p>
                                                    )}
                                                </div>

                                                <div className="flex shrink-0 items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEdit(item)}
                                                        className="cursor-pointer rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900"
                                                        title={UI_TEXT.common.actions.edit}
                                                    >
                                                        <Edit2 className="size-3.5" />
                                                    </button>
                                                    {!item.isSystem && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(item)}
                                                            className="cursor-pointer rounded-xl border border-red-100 bg-red-50/50 p-2 text-red-500 shadow-2xs transition hover:bg-red-100 hover:text-red-700"
                                                            title={UI_TEXT.common.actions.delete}
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-wine">
                                        <Tag className="size-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-extrabold text-slate-900">{isEdit ? t.editTitle : t.createTitle}</h2>
                                        <p className="text-xs font-semibold text-slate-400">{isEdit ? t.editSubtitle : t.createSubtitle}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleBackToList}
                                    className="cursor-pointer rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
                                {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-600">{error}</div>}

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-extrabold text-slate-700">
                                        {t.codeLabel} {!isEdit && <span className="text-rose-500">{t.asterisk}</span>}
                                    </label>
                                    <input
                                        type="text"
                                        disabled={isEdit}
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder={t.placeholderCode}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 uppercase transition outline-none focus:border-wine focus:ring-1 focus:ring-wine disabled:bg-slate-100 disabled:text-slate-500"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-extrabold text-slate-700">
                                        {t.nameLabel} <span className="text-rose-500">{t.asterisk}</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder={t.placeholderName}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 transition outline-none focus:border-wine focus:ring-1 focus:ring-wine"
                                        autoFocus
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-extrabold text-slate-700">{t.descLabel}</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder={t.placeholderDesc}
                                        rows={3}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 transition outline-none focus:border-wine focus:ring-1 focus:ring-wine"
                                    />
                                </div>

                                <div className="mt-2 flex w-full items-center gap-3 border-t border-slate-100 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleBackToList}
                                        className="w-1/3 cursor-pointer justify-center rounded-full border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
                                    >
                                        {UI_TEXT.common.cancel}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting || !name.trim() || (!isEdit && !code.trim())}
                                        className="inline-flex w-2/3 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-wine px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-wine/90 disabled:opacity-50"
                                    >
                                        {submitting ? (
                                            <Loader2 className="size-3.5 animate-spin" />
                                        ) : isEdit ? (
                                            <Save className="size-3.5" />
                                        ) : (
                                            <Plus className="size-3.5" />
                                        )}
                                        <span>{isEdit ? UI_TEXT.common.save : t.createButton}</span>
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
