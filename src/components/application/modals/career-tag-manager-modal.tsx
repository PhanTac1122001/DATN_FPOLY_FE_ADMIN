"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Edit2, Loader2, Plus, Tag, Trash2, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { HTTP_STATUS_CONFLICT } from "@/constants/http.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { HttpError } from "@/lib/http-client";
import { careerTagService } from "@/services/career-tag.service";
import { toast } from "@/services/toast.service";
import type { CareerTag, CareerTagManagerModalProps } from "@/types/career-tag.types";

export function CareerTagManagerModal({ isOpen, onOpenChange }: CareerTagManagerModalProps) {
    const queryClient = useQueryClient();
    const t = UI_TEXT.careerTags;

    const [newName, setNewName] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const { data: tags, isLoading } = useQuery({
        queryKey: ["career-tags"],
        queryFn: careerTagService.getAll,
        enabled: isOpen,
    });

    useEffect(() => {
        if (!isOpen) {
            setNewName("");
            setEditingId(null);
            setEditingName("");
            setDeletingId(null);
        }
    }, [isOpen]);

    const invalidateAfterMutation = () => {
        queryClient.invalidateQueries({ queryKey: ["career-tags"] });
        queryClient.invalidateQueries({ queryKey: ["courses"] });
    };

    const createMutation = useMutation({
        mutationFn: (name: string) => careerTagService.create({ name }),
        onSuccess: () => {
            invalidateAfterMutation();
            toast.success(t.toastCreateSuccessTitle, t.toastCreateSuccessDesc);
            setNewName("");
        },
        onError: (error: unknown) => {
            const errMsg = error instanceof Error ? error.message : t.toastSaveErrorDesc;
            toast.error(t.toastErrorTitle, errMsg);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, name }: { id: string; name: string }) => careerTagService.update(id, { name }),
        onSuccess: () => {
            invalidateAfterMutation();
            toast.success(t.toastUpdateSuccessTitle, t.toastUpdateSuccessDesc);
            setEditingId(null);
            setEditingName("");
        },
        onError: (error: unknown) => {
            const errMsg = error instanceof Error ? error.message : t.toastSaveErrorDesc;
            toast.error(t.toastErrorTitle, errMsg);
        },
    });

    const isDuplicateName = (name: string, excludeId?: string) =>
        (tags || []).some((tag) => tag.id !== excludeId && tag.name.trim().toLowerCase() === name.toLowerCase());

    const handleAdd = () => {
        const trimmed = newName.trim();
        if (!trimmed) {
            toast.error(t.toastErrorTitle, t.nameRequiredError);
            return;
        }
        if (isDuplicateName(trimmed)) {
            toast.error(t.toastErrorTitle, t.toastSaveErrorDesc);
            return;
        }
        createMutation.mutate(trimmed);
    };

    const handleStartEdit = (tag: CareerTag) => {
        setEditingId(tag.id);
        setEditingName(tag.name);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditingName("");
    };

    const handleSaveEdit = () => {
        if (!editingId) return;
        const trimmed = editingName.trim();
        if (!trimmed) {
            toast.error(t.toastErrorTitle, t.nameRequiredError);
            return;
        }
        if (isDuplicateName(trimmed, editingId)) {
            toast.error(t.toastErrorTitle, t.toastSaveErrorDesc);
            return;
        }
        updateMutation.mutate({ id: editingId, name: trimmed });
    };

    const handleDelete = async (tag: CareerTag) => {
        if (!confirm(t.confirmDeleteMessage)) return;
        try {
            setDeletingId(tag.id);
            await careerTagService.remove(tag.id);
            invalidateAfterMutation();
            toast.success(t.toastDeleteSuccessTitle, t.toastDeleteSuccessDesc);
        } catch (error: unknown) {
            if (error instanceof HttpError && error.status === HTTP_STATUS_CONFLICT) {
                toast.error(t.toastErrorTitle, error.message);
            } else {
                const errMsg = error instanceof Error ? error.message : t.toastDeleteErrorDesc;
                toast.error(t.toastErrorTitle, errMsg);
            }
        } finally {
            setDeletingId(null);
        }
    };

    const isAdding = createMutation.isPending;
    const isSavingEdit = updateMutation.isPending;

    return (
        <CustomModal.Root open={isOpen} onOpenChange={onOpenChange}>
            <CustomModal.Content className="w-full max-w-lg overflow-hidden !rounded-[24px]">
                <Dialog className="flex max-h-[85vh] flex-col outline-none">
                    <div className="relative flex items-center justify-between border-b border-slate-100 px-6 py-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-wine">
                                <Tag className="size-5" />
                            </div>
                            <div>
                                <Heading slot="title" className="text-lg font-bold text-slate-900">
                                    {t.modalTitle}
                                </Heading>
                                <p className="text-xs font-medium text-slate-500">{t.modalSubtitle}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="absolute top-4.5 right-5 cursor-pointer rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    <div className="flex items-end gap-2 border-b border-slate-100 px-6 py-4">
                        <div className="flex-1">
                            <Input label="" placeholder={t.addPlaceholder} value={newName} onChange={setNewName} />
                        </div>
                        <Button
                            type="button"
                            color="primary"
                            onClick={handleAdd}
                            isLoading={isAdding}
                            iconLeading={Plus}
                            className="rounded-full border-none bg-wine px-4 font-bold text-white shadow-xs hover:bg-wine/90"
                        >
                            {t.addBtn}
                        </Button>
                    </div>

                    <div className="custom-scrollbar max-h-[60vh] overflow-y-auto p-6">
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2 py-10 text-xs font-bold text-slate-400">
                                <Loader2 className="size-4 animate-spin" />
                                <span>{t.loading}</span>
                            </div>
                        ) : (tags || []).length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                                <Tag className="size-8 opacity-40" />
                                <p className="mt-2 text-xs font-medium">{t.emptyList}</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2.5">
                                {(tags || []).map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-2xs transition hover:border-slate-300"
                                    >
                                        {editingId === item.id ? (
                                            <>
                                                <div className="min-w-0 flex-1">
                                                    <Input label="" value={editingName} onChange={setEditingName} />
                                                </div>
                                                <div className="flex shrink-0 items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={handleSaveEdit}
                                                        disabled={isSavingEdit}
                                                        className="cursor-pointer rounded-xl border border-emerald-100 bg-emerald-50/50 p-2 text-emerald-600 shadow-2xs transition hover:bg-emerald-100 disabled:opacity-50"
                                                        title={UI_TEXT.common.save}
                                                    >
                                                        {isSavingEdit ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleCancelEdit}
                                                        disabled={isSavingEdit}
                                                        className="cursor-pointer rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
                                                        title={UI_TEXT.common.cancel}
                                                    >
                                                        <X className="size-3.5" />
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <span className="min-w-0 flex-1 truncate text-sm font-black text-slate-900">{item.name}</span>
                                                <div className="flex shrink-0 items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStartEdit(item)}
                                                        className="cursor-pointer rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900"
                                                        title={t.editTooltip}
                                                    >
                                                        <Edit2 className="size-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(item)}
                                                        disabled={deletingId === item.id}
                                                        className="cursor-pointer rounded-xl border border-red-100 bg-red-50/50 p-2 text-red-500 shadow-2xs transition hover:bg-red-100 hover:text-red-700 disabled:opacity-50"
                                                        title={t.deleteTooltip}
                                                    >
                                                        {deletingId === item.id ? (
                                                            <Loader2 className="size-3.5 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="size-3.5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
