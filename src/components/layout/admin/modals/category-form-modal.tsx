"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { DEFAULT_CATEGORY_COLOR } from "@/constants/notification.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { notificationService } from "@/services/notification.service";
import { toast } from "@/services/toast.service";
import type { CategoryFormModalProps } from "@/types/notification.types";

export function CategoryFormModal({ isOpen, onClose, onSuccess, category, categoriesCount = 0 }: CategoryFormModalProps) {
    const isEditing = Boolean(category);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [code, setCode] = useState("");
    const [label, setLabel] = useState("");
    const [tone, setTone] = useState(DEFAULT_CATEGORY_COLOR);
    const [requiresTargetStudents, setRequiresTargetStudents] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setError("");
            if (category) {
                setCode(category.code);
                setLabel(category.label);
                setTone(category.tone && category.tone.startsWith("#") ? category.tone : DEFAULT_CATEGORY_COLOR);
                setRequiresTargetStudents(category.requiresTargetStudents || false);
            } else {
                setCode("");
                setLabel("");
                setTone(DEFAULT_CATEGORY_COLOR);
                setRequiresTargetStudents(false);
            }
        }
    }, [isOpen, category]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!code.trim() || !label.trim()) {
            setError(UI_TEXT.manageCategoriesModal.errCodeAndLabelRequired);
            return;
        }

        try {
            setSubmitting(true);
            const autoSortOrder = isEditing ? (category?.sortOrder ?? 1) : categoriesCount + 1;

            if (isEditing && category) {
                await notificationService.updateCategory(category.code, {
                    label: label.trim(),
                    sortOrder: autoSortOrder,
                    tone: tone.trim() || DEFAULT_CATEGORY_COLOR,
                    requiresTargetStudents,
                });
                toast.success(UI_TEXT.common.successTitle, UI_TEXT.manageCategoriesModal.toastUpdateSuccess);
            } else {
                await notificationService.createCategory({
                    code: code.trim().toUpperCase(),
                    label: label.trim(),
                    sortOrder: autoSortOrder,
                    tone: tone.trim() || DEFAULT_CATEGORY_COLOR,
                    requiresTargetStudents,
                });
                toast.success(UI_TEXT.common.successTitle, UI_TEXT.manageCategoriesModal.toastCreateSuccess);
            }
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : UI_TEXT.manageCategoriesModal.errSaveFailed;
            setError(msg);
            toast.error(UI_TEXT.common.errorTitle, msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="w-full max-w-lg !overflow-hidden !rounded-[24px]">
                <Dialog className="flex max-h-[90vh] w-full flex-col rounded-[24px] bg-white shadow-2xl outline-none">
                    <div className="relative flex items-center justify-between border-b border-slate-100 px-6 py-5">
                        <Heading slot="title" className="text-xl font-bold text-slate-900">
                            {isEditing
                                ? `${UI_TEXT.manageCategoriesModal.editCategoryPrefix}${category?.code}`
                                : UI_TEXT.manageCategoriesModal.addNewTypeHeader}
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

                    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                        <div className="custom-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto p-6">
                            {error && <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600">{error}</div>}

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Input
                                    label={
                                        <span>
                                            {UI_TEXT.manageCategoriesModal.categoryCodeLabel} <span className="font-bold text-red-500">{"*"}</span>
                                        </span>
                                    }
                                    isDisabled={isEditing}
                                    value={code}
                                    onChange={(val: string) => setCode(val)}
                                    placeholder={UI_TEXT.manageCategoriesModal.codePlaceholder}
                                />

                                <Input
                                    label={
                                        <span>
                                            {UI_TEXT.manageCategoriesModal.displayLabelLabel} <span className="font-bold text-red-500">{"*"}</span>
                                        </span>
                                    }
                                    value={label}
                                    onChange={(val: string) => setLabel(val)}
                                    placeholder={UI_TEXT.manageCategoriesModal.displayLabelPlaceholder}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-slate-700">{UI_TEXT.manageCategoriesModal.displayColorLabel}</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={tone.startsWith("#") ? tone : DEFAULT_CATEGORY_COLOR}
                                        onChange={(e) => setTone(e.target.value)}
                                        className="size-10 cursor-pointer rounded-xl border border-slate-200 bg-white p-1"
                                    />
                                    <Input
                                        value={tone}
                                        onChange={(val: string) => setTone(val)}
                                        placeholder={DEFAULT_CATEGORY_COLOR}
                                        className="flex-1 font-mono"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={requiresTargetStudents}
                                        onChange={(e) => setRequiresTargetStudents(e.target.checked)}
                                        className="size-4 rounded border-slate-300 accent-wine"
                                    />
                                    {UI_TEXT.manageCategoriesModal.requireStudentsCheckboxLabel}
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                            <Button
                                color="secondary"
                                size="sm"
                                type="button"
                                onClick={onClose}
                                className="col-span-1 w-full justify-center font-semibold text-slate-700"
                            >
                                {UI_TEXT.common.cancel}
                            </Button>
                            <Button
                                color="primary"
                                size="sm"
                                type="submit"
                                isLoading={submitting}
                                className="col-span-2 w-full justify-center border-none bg-wine font-bold text-white hover:bg-wine-deep"
                                iconLeading={!submitting && !isEditing ? <Plus className="size-4" /> : undefined}
                            >
                                {isEditing ? UI_TEXT.manageCategoriesModal.updateBtn : UI_TEXT.manageCategoriesModal.addBtn}
                            </Button>
                        </div>
                    </form>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
