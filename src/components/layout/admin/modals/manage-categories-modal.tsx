"use client";

import { useEffect, useState } from "react";
import { Edit2, Loader2, Plus, Trash2, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { DEFAULT_CATEGORY_COLOR } from "@/constants/notification.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { notificationService } from "@/services/notification.service";
import { toast } from "@/services/toast.service";
import type { ManageCategoriesModalProps, NotificationCategory } from "@/types/notification.types";
import { CategoryFormModal } from "./category-form-modal";

export function ManageCategoriesModal({ isOpen, onClose, onSuccess }: ManageCategoriesModalProps) {
    const [categories, setCategories] = useState<NotificationCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Form modal state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<NotificationCategory | null>(null);

    const fetchCategories = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await notificationService.listCategories();
            const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
            setCategories(items);
        } catch (err) {
            console.error("Failed to list categories", err);
            setError(UI_TEXT.manageCategoriesModal?.errLoadCategories || "Không thể tải danh sách thể loại");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    const handleAddClick = () => {
        setSelectedCategory(null);
        setIsFormOpen(true);
    };

    const handleEditClick = (cat: NotificationCategory) => {
        setSelectedCategory(cat);
        setIsFormOpen(true);
    };

    const handleDelete = async (catCode: string) => {
        if (!confirm(`${UI_TEXT.manageCategoriesModal.confirmDeletePrefix}${catCode}${UI_TEXT.manageCategoriesModal.confirmDeleteSuffix}`)) return;
        try {
            setSubmitting(true);
            await notificationService.deleteCategory(catCode);
            toast.success(UI_TEXT.common.successTitle, UI_TEXT.manageCategoriesModal.toastDeleteSuccess);
            await fetchCategories();
            onSuccess();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : UI_TEXT.manageCategoriesModal.errDeleteFailed;
            setError(msg);
            toast.error(UI_TEXT.common.errorTitle, msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <CustomModal.Content className="w-full max-w-xl !overflow-hidden !rounded-[24px]">
                    <Dialog className="flex max-h-[90vh] w-full flex-col rounded-[24px] bg-white shadow-2xl outline-none">
                        {/* Header */}
                        <div className="relative flex items-center justify-between border-b border-slate-100 px-6 py-5">
                            <Heading slot="title" className="text-xl font-bold text-slate-900">
                                {UI_TEXT.manageCategoriesModal.modalTitle}
                            </Heading>
                            <button
                                type="button"
                                onClick={onClose}
                                className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                aria-label="Close"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="custom-scrollbar flex flex-1 flex-col gap-6 overflow-y-auto p-6">
                            {error && <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600">{error}</div>}

                            {/* List Categories */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold tracking-wider text-slate-700 uppercase">
                                        {UI_TEXT.manageCategoriesModal.categoryListPrefix}
                                        {categories.length}
                                        {UI_TEXT.manageCategoriesModal.categoryListSuffix}
                                    </h4>
                                    <Button
                                        color="primary"
                                        size="sm"
                                        onClick={handleAddClick}
                                        className="border-none bg-wine font-bold text-white hover:bg-wine-deep"
                                        iconLeading={<Plus className="size-4" />}
                                    >
                                        {UI_TEXT.manageCategoriesModal.addBtn}
                                    </Button>
                                </div>

                                {loading ? (
                                    <div className="flex items-center justify-center p-8 text-xs text-slate-400">
                                        <Loader2 className="mr-2 size-4 animate-spin" /> {UI_TEXT.manageCategoriesModal.loading}
                                    </div>
                                ) : categories.length === 0 ? (
                                    <div className="p-8 text-center text-xs text-slate-400">{UI_TEXT.manageCategoriesModal.empty}</div>
                                ) : (
                                    <div className="max-h-[60vh] divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200 bg-white">
                                        {categories.map((cat) => (
                                            <div key={cat.code} className="flex items-center justify-between p-3.5 transition-colors hover:bg-slate-50">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="size-4 shrink-0 rounded-full border border-slate-200"
                                                        style={{ backgroundColor: cat.tone && cat.tone.startsWith("#") ? cat.tone : DEFAULT_CATEGORY_COLOR }}
                                                        title={cat.tone}
                                                    />
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-slate-900">{cat.label}</span>
                                                            {cat.requiresTargetStudents && (
                                                                <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                                                                    {UI_TEXT.manageCategoriesModal.personalTag}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => handleEditClick(cat)}
                                                        className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                                        title={UI_TEXT.manageCategoriesModal.editTooltip}
                                                    >
                                                        <Edit2 className="size-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(cat.code)}
                                                        disabled={submitting}
                                                        className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                                        title={UI_TEXT.manageCategoriesModal.deleteTooltip}
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </Dialog>
                </CustomModal.Content>
            </CustomModal.Root>

            {/* Separate Form Modal for Add/Edit Category */}
            <CategoryFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={() => {
                    fetchCategories();
                    onSuccess();
                }}
                category={selectedCategory}
                categoriesCount={categories.length}
            />
        </>
    );
}
