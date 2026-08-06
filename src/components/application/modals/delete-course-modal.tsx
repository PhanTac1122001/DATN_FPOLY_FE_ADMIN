"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { ConfirmModal } from "@/components/application/modals/confirm-modal";
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
        <ConfirmModal
            isOpen={isOpen}
            onClose={() => onOpenChange(false)}
            onConfirm={handleDelete}
            title={UI_TEXT.deleteCourseModal.title}
            message={
                <>
                    {UI_TEXT.deleteCourseModal.confirmPrefix}
                    <strong className="font-bold text-wine">{course.title}</strong> {`(${course.code})`}
                    {UI_TEXT.deleteCourseModal.confirmSuffix}
                </>
            }
            confirmText={isDeleting ? UI_TEXT.deleteCourseModal.deletingBtn : UI_TEXT.deleteCourseModal.confirmBtn}
            cancelText={UI_TEXT.deleteCourseModal.cancelBtn}
            variant="danger"
            isLoading={isDeleting}
            icon={
                <div className="flex size-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                    <AlertTriangle className="size-5" />
                </div>
            }
        />
    );
}
