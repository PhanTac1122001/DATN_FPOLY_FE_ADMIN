"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import type { DeleteCourseModalProps } from "@/types/course.types";

export function DeleteCourseModal({ isOpen, onOpenChange, course, onConfirm }: DeleteCourseModalProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    if (!course) return null;

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await onConfirm(course.id);
            onOpenChange(false);
        } catch {
            // Handled by deleteMutation.onError toast
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <CustomModal.Root open={isOpen} onOpenChange={onOpenChange}>
            <CustomModal.Content className="w-full max-w-md overflow-hidden !rounded-[24px]">
                <Dialog className="flex flex-col outline-none">
                    <div className="flex items-center justify-between border-b border-line px-6 py-4">
                        <div className="flex items-center gap-2 font-bold text-rose-600">
                            <AlertTriangle className="size-5" />
                            <span>{UI_TEXT.deleteCourseModal.title}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="rounded-full p-1.5 text-muted transition hover:bg-slate-100 hover:text-ink"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    <div className="p-6">
                        <p className="text-sm leading-relaxed text-ink">
                            {UI_TEXT.deleteCourseModal.confirmPrefix}
                            <strong className="text-wine">{course.title}</strong> {`(${course.code}`}
                            {UI_TEXT.deleteCourseModal.confirmSuffix}
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-line bg-slate-50/50 px-6 py-4">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="cursor-pointer rounded-full border border-line px-5 py-2 text-sm font-bold text-ink transition hover:bg-slate-100"
                        >
                            {UI_TEXT.deleteCourseModal.cancelBtn}
                        </button>
                        <button
                            type="button"
                            disabled={isDeleting}
                            onClick={handleDelete}
                            className="cursor-pointer rounded-full bg-rose-600 px-6 py-2 text-sm font-bold text-white shadow-xs transition hover:bg-rose-700 disabled:opacity-50"
                        >
                            {isDeleting ? UI_TEXT.deleteCourseModal.deletingBtn : UI_TEXT.deleteCourseModal.confirmBtn}
                        </button>
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
