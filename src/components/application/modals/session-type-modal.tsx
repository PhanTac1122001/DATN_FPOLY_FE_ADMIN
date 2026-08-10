"use client";

import { useEffect, useState } from "react";
import { Edit2, Loader2, Plus, Tag, Trash2, X } from "lucide-react";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { sessionTypeService } from "@/services/session-type.service";
import { toast } from "@/services/toast.service";
import type { SessionType, SessionTypeModalProps } from "@/types/session-type.types";
import { SessionTypeFormModal } from "./session-type-form-modal";

export function SessionTypeModal({ isOpen, onClose, onChanged }: SessionTypeModalProps) {
    const [types, setTypes] = useState<SessionType[]>([]);
    const [loading, setLoading] = useState(false);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingType, setEditingType] = useState<SessionType | null>(null);

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
        if (isOpen) {
            loadTypes();
        }
    }, [isOpen]);

    const handleOpenCreate = () => {
        setEditingType(null);
        setIsFormOpen(true);
    };

    const handleOpenEdit = (type: SessionType) => {
        setEditingType(type);
        setIsFormOpen(true);
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

    const t = UI_TEXT.sessionTypes;

    return (
        <>
            <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <CustomModal.Content className="w-full max-w-2xl overflow-hidden !rounded-[24px]">
                    <Dialog className="flex max-h-[85vh] flex-col outline-none">
                        {/* Header */}
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

                        {/* List Area */}
                        <div className="custom-scrollbar min-h-[300px] flex-1 overflow-y-auto p-6">
                            {loading ? (
                                <div className="flex h-48 items-center justify-center gap-2 text-xs font-bold text-slate-400">
                                    <Loader2 className="size-4 animate-spin" />
                                    <span>{UI_TEXT.common.loading}</span>
                                </div>
                            ) : types.length === 0 ? (
                                <div className="flex h-48 flex-col items-center justify-center text-slate-400">
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
                                                {item.description && <p className="line-clamp-1 text-xs font-medium text-slate-500">{item.description}</p>}
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
                    </Dialog>
                </CustomModal.Content>
            </CustomModal.Root>

            {/* Sub-modal for Add/Edit */}
            <SessionTypeFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={() => {
                    loadTypes();
                    onChanged?.();
                }}
                editingType={editingType}
            />
        </>
    );
}
