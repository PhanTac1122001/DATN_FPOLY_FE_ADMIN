"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldAlert, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { Select } from "@/components/base/select/select";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { COMMON_VIOLATIONS } from "@/constants/class.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { addStudentViolation } from "@/services/auto-rpoint.service";
import { toast } from "@/services/toast.service";
import type { AddViolationModalProps } from "@/types/rpoint.types";

const violationOptions = COMMON_VIOLATIONS.map((item) => ({
    id: item,
    label: item,
}));

export function AddViolationModal({ isOpen, onClose, studentId, studentName, studentCode, courseId, classId, onSuccess }: AddViolationModalProps) {
    const queryClient = useQueryClient();
    const [reason, setReason] = useState<string>("");

    const violationMutation = useMutation({
        mutationFn: async () => {
            if (!studentId || !courseId) throw new Error(UI_TEXT.violationModal.errMissingInfo);
            await addStudentViolation({
                studentId,
                courseId,
                classId,
                description: reason.trim() || UI_TEXT.violationModal.defaultReason,
            });
        },
        onSuccess: () => {
            toast.success(UI_TEXT.violationModal.toastSuccessTitle, `${UI_TEXT.violationModal.toastSuccessDescStudentPrefix}${studentName}`);
            queryClient.invalidateQueries({ queryKey: ["class-rpoints-map"] });
            queryClient.invalidateQueries({ queryKey: ["student-rpoint-detail"] });
            queryClient.invalidateQueries({ queryKey: ["course-class-statistics"] });
            queryClient.invalidateQueries({ queryKey: ["class-detail"] });
            if (onSuccess) onSuccess();
            onClose();
            setReason("");
        },
        onError: (err: Error) => {
            toast.error(UI_TEXT.violationModal.toastErrorTitle, err.message || UI_TEXT.violationModal.toastErrorDefault);
        },
    });

    return (
        <CustomModal.Root open={isOpen} onOpenChange={onClose}>
            <CustomModal.Content className="max-w-[520px] rounded-[24px] border-none bg-white p-0 shadow-2xl">
                <Dialog className="flex flex-col outline-none">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 font-bold text-rose-600">
                                <ShieldAlert className="size-5" />
                            </div>
                            <div>
                                <Heading slot="title" className="text-lg font-extrabold text-slate-900">
                                    {UI_TEXT.violationModal.title}
                                </Heading>
                                <p className="mt-0.5 text-xs font-medium text-slate-500">
                                    {UI_TEXT.violationModal.studentLabel}
                                    {": "} <strong className="font-extrabold text-slate-900">{studentName}</strong> {"("}
                                    {studentCode}
                                    {")"}
                                </p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            color="tertiary"
                            size="sm"
                            onClick={onClose}
                            iconLeading={<X className="size-5" />}
                            aria-label={UI_TEXT.common.close}
                            className="rounded-full !p-1.5 text-slate-400 hover:text-slate-600"
                        />
                    </div>

                    {/* Form Body */}
                    <div className="flex flex-col gap-4 px-6 py-5">
                        {/* Select Component for Quick Violation Reason */}
                        <Select
                            label={UI_TEXT.violationModal.quickSelectLabel}
                            placeholder={UI_TEXT.violationModal.placeholderSelectViolation}
                            items={violationOptions}
                            selectedKey={reason || null}
                            onSelectionChange={(key) => {
                                if (key) setReason(String(key));
                            }}
                        >
                            {(item) => <Select.Item id={item.id}>{item.label}</Select.Item>}
                        </Select>

                        {/* Detailed Reason Textarea */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-slate-800">{UI_TEXT.violationModal.reasonLabel}</label>
                            <textarea
                                rows={3}
                                placeholder={UI_TEXT.violationModal.reasonPlaceholder}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 p-3.5 text-xs font-semibold text-slate-800 outline-none focus:border-wine focus:ring-1 focus:ring-wine"
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex w-full items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
                        <Button
                            type="button"
                            color="secondary"
                            size="md"
                            onClick={onClose}
                            className="w-1/3 justify-center rounded-full border-slate-200 py-2.5 text-xs font-bold"
                        >
                            {UI_TEXT.violationModal.cancelBtn}
                        </Button>
                        <Button
                            type="button"
                            color="primary"
                            size="md"
                            onClick={() => violationMutation.mutate()}
                            isLoading={violationMutation.isPending}
                            className="w-2/3 justify-center rounded-full border-none bg-rose-600 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-rose-700"
                        >
                            {UI_TEXT.violationModal.submitBtn}
                        </Button>
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
