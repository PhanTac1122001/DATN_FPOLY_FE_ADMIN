"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { Input } from "@/components/base/input/input";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import {
    addCourseCategory,
    deleteCourseCategory,
    getCourseCategories,
    updateCourseCategory,
} from "@/services/course.service";
import { toast } from "@/services/toast.service";
import type { CategoryManagementModalProps } from "@/types/course.types";

export function CategoryManagementModal({
    isOpen,
    onOpenChange,
    onSelectCategory,
    selectedCategory,
}: CategoryManagementModalProps) {
    const queryClient = useQueryClient();
    const [newCategoryInput, setNewCategoryInput] = useState("");
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [editingValue, setEditingValue] = useState("");
    const [deletingCategory, setDeletingCategory] = useState<string | null>(null);

    const { data: categories = [], isLoading } = useQuery({
        queryKey: ["course-categories"],
        queryFn: getCourseCategories,
        enabled: isOpen,
    });

    const addCategoryMutation = useMutation({
        mutationFn: addCourseCategory,
        onSuccess: (addedName) => {
            queryClient.invalidateQueries({ queryKey: ["course-categories"] });
            toast.success(UI_TEXT.common.successTitle, UI_TEXT.categoryManagementModal.toastAddSuccess);
            setNewCategoryInput("");
            if (onSelectCategory && addedName) {
                onSelectCategory(addedName);
            }
        },
        onError: (error: Error) => {
            toast.error(UI_TEXT.common.errorTitle, error.message || UI_TEXT.categoryManagementModal.toastAddError);
        },
    });

    const updateCategoryMutation = useMutation({
        mutationFn: ({ oldName, newName }: { oldName: string; newName: string }) =>
            updateCourseCategory(oldName, newName),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["course-categories"] });
            queryClient.invalidateQueries({ queryKey: ["courses"] });
            toast.success(UI_TEXT.common.successTitle, UI_TEXT.categoryManagementModal.toastUpdateSuccess);
            setEditingCategory(null);
            setEditingValue("");
            if (onSelectCategory && selectedCategory === variables.oldName) {
                onSelectCategory(variables.newName);
            }
        },
        onError: (error: Error) => {
            toast.error(UI_TEXT.common.errorTitle, error.message || UI_TEXT.categoryManagementModal.toastUpdateError);
        },
    });

    const deleteCategoryMutation = useMutation({
        mutationFn: deleteCourseCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["course-categories"] });
            queryClient.invalidateQueries({ queryKey: ["courses"] });
            toast.success(UI_TEXT.common.successTitle, UI_TEXT.categoryManagementModal.toastDeleteSuccess);
            setDeletingCategory(null);
        },
        onError: (error: Error) => {
            toast.error(UI_TEXT.common.errorTitle, error.message || UI_TEXT.categoryManagementModal.toastDeleteError);
        },
    });

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newCategoryInput.trim();
        if (!trimmed) return;
        if (categories.includes(trimmed)) {
            toast.error(UI_TEXT.common.errorTitle, UI_TEXT.categoryManagementModal.toastExistsError);
            return;
        }
        await addCategoryMutation.mutateAsync(trimmed);
    };

    const handleStartEdit = (cat: string) => {
        setEditingCategory(cat);
        setEditingValue(cat);
    };

    const handleSaveEdit = async (oldName: string) => {
        const trimmed = editingValue.trim();
        if (!trimmed) return;
        if (trimmed === oldName) {
            setEditingCategory(null);
            return;
        }
        await updateCategoryMutation.mutateAsync({ oldName, newName: trimmed });
    };

    const handleConfirmDelete = async (cat: string) => {
        await deleteCategoryMutation.mutateAsync(cat);
    };

    const handleSelect = (cat: string) => {
        if (onSelectCategory) {
            onSelectCategory(cat);
            onOpenChange(false);
        }
    };

    return (
        <CustomModal.Root open={isOpen} onOpenChange={onOpenChange}>
            <CustomModal.Content className="w-full max-w-2xl overflow-hidden !rounded-[24px]">
                <Dialog className="flex flex-col outline-none">
                    {/* Header */}
                    <div className="relative flex flex-col border-b border-slate-100 px-6 pt-6 pb-4">
                        <Heading slot="title" className="text-xl font-bold text-slate-900">
                            {UI_TEXT.categoryManagementModal.modalTitle}
                        </Heading>
                        <p className="mt-1 text-xs text-slate-500">
                            {UI_TEXT.categoryManagementModal.modalSubtitle}
                        </p>
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="absolute top-5 right-5 cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            aria-label="Close"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    <div className="flex max-h-[70vh] flex-col gap-5 overflow-y-auto p-6">
                        {/* Add category form */}
                        <form onSubmit={handleAdd} className="flex items-center gap-2">
                            <Input
                                placeholder={UI_TEXT.categoryManagementModal.inputPlaceholder}
                                value={newCategoryInput}
                                onChange={(val) => setNewCategoryInput(val)}
                                className="flex-1"
                            />
                            <button
                                type="submit"
                                disabled={!newCategoryInput.trim() || addCategoryMutation.isPending}
                                className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-wine px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-wine/90 disabled:opacity-50"
                            >
                                <Plus className="size-4" />
                                <span>{UI_TEXT.categoryManagementModal.addBtn}</span>
                            </button>
                        </form>

                        {/* List categories */}
                        <div className="flex flex-col gap-2 pt-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                {UI_TEXT.categoryManagementModal.listHeaderPrefix}{categories.length}{UI_TEXT.categoryManagementModal.listHeaderSuffix}
                            </h4>

                            {isLoading ? (
                                <div className="py-8 text-center text-sm text-slate-400">{UI_TEXT.categoryManagementModal.loading}</div>
                            ) : categories.length === 0 ? (
                                <div className="py-8 text-center text-sm text-slate-400">{UI_TEXT.categoryManagementModal.empty}</div>
                            ) : (
                                <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50/50">
                                    {categories.map((cat) => {
                                        const isSelected = selectedCategory === cat;
                                        return (
                                            <div
                                                key={cat}
                                                className={`flex items-center justify-between p-3.5 transition ${isSelected ? "bg-wine/5" : "hover:bg-white"}`}
                                            >
                                                {editingCategory === cat ? (
                                                    <div className="flex flex-1 items-center gap-2 pr-2">
                                                        <input
                                                            type="text"
                                                            value={editingValue}
                                                            onChange={(e) => setEditingValue(e.target.value)}
                                                            className="flex-1 rounded-xl border border-wine bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-wine/20"
                                                            autoFocus
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSaveEdit(cat)}
                                                            disabled={updateCategoryMutation.isPending}
                                                            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition hover:bg-emerald-600 hover:text-white"
                                                            title={UI_TEXT.categoryManagementModal.saveTooltip}
                                                        >
                                                            <Check className="size-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingCategory(null)}
                                                            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
                                                            title={UI_TEXT.categoryManagementModal.cancelTooltip}
                                                        >
                                                            <X className="size-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex items-center gap-3 pr-4">
                                                            <span className="text-sm font-bold text-slate-800">{cat}</span>
                                                            {isSelected && (
                                                                <span className="inline-flex items-center rounded-full bg-wine/10 px-2.5 py-0.5 text-[11px] font-bold text-wine">
                                                                    {UI_TEXT.categoryManagementModal.selectedBadge}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {deletingCategory === cat ? (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs text-rose-600 font-semibold">{UI_TEXT.categoryManagementModal.confirmDeleteText}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleConfirmDelete(cat)}
                                                                    disabled={deleteCategoryMutation.isPending}
                                                                    className="rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white shadow-xs transition hover:bg-rose-700 disabled:opacity-50"
                                                                >
                                                                    {UI_TEXT.categoryManagementModal.deleteBtn}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setDeletingCategory(null)}
                                                                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50"
                                                                >
                                                                    {UI_TEXT.categoryManagementModal.cancelBtn}
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                {onSelectCategory && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleSelect(cat)}
                                                                        className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold transition ${isSelected ? "bg-wine text-white shadow-xs" : "border border-wine/30 text-wine hover:bg-wine hover:text-white"}`}
                                                                    >
                                                                        {isSelected ? UI_TEXT.categoryManagementModal.selectedBtn : UI_TEXT.categoryManagementModal.selectBtn}
                                                                    </button>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleStartEdit(cat)}
                                                                    className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-slate-400 transition hover:bg-amber-50 hover:text-amber-600"
                                                                    title={UI_TEXT.categoryManagementModal.editTooltip}
                                                                >
                                                                    <Pencil className="size-4" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setDeletingCategory(cat)}
                                                                    className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                                                                    title={UI_TEXT.categoryManagementModal.deleteTooltip}
                                                                >
                                                                    <Trash2 className="size-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>


                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
