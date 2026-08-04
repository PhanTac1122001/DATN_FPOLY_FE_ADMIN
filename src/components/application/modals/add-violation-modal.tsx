"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ShieldAlert, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { COMMON_VIOLATIONS } from "@/constants/class.constants";
import { DEFAULT_PENALTY_POINTS, PENALTY_PRESETS } from "@/constants/options.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { addStudentViolation } from "@/services/auto-rpoint.service";
import { toast } from "@/services/toast.service";
import type { AddViolationModalProps } from "@/types/rpoint.types";

export function AddViolationModal({ isOpen, onClose, studentId, studentName, studentCode, courseId, classId, onSuccess }: AddViolationModalProps) {
    const [penaltyPoints, setPenaltyPoints] = useState<number>(DEFAULT_PENALTY_POINTS);
    const [reason, setReason] = useState<string>("");

    const violationMutation = useMutation({
        mutationFn: async () => {
            if (!studentId || !courseId) throw new Error(UI_TEXT.violationModal.errMissingInfo);
            if (penaltyPoints <= 0) throw new Error(UI_TEXT.violationModal.errInvalidPoints);
            await addStudentViolation({
                studentId,
                courseId,
                classId,
                penaltyPoints,
                description: reason.trim() || UI_TEXT.violationModal.defaultReason,
            });
        },
        onSuccess: () => {
            toast.success(
                UI_TEXT.violationModal.toastSuccessTitle,
                UI_TEXT.violationModal.toastSuccessDescPrefix +
                    penaltyPoints +
                    UI_TEXT.violationModal.toastSuccessDescMid +
                    studentName +
                    UI_TEXT.violationModal.toastSuccessDescSuffix,
            );
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
                        {/* Penalty Points Input Pills */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-slate-800">{UI_TEXT.violationModal.selectPenaltyLabel}</label>
                            <div className="flex items-center gap-2">
                                {PENALTY_PRESETS.map((pts) => (
                                    <button
                                        key={pts}
                                        type="button"
                                        onClick={() => setPenaltyPoints(pts)}
                                        className={`flex-1 cursor-pointer rounded-full border py-2.5 text-xs font-extrabold transition ${
                                            penaltyPoints === pts
                                                ? "border-2 border-rose-500 bg-rose-50 text-rose-800 shadow-2xs"
                                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                                        }`}
                                    >
                                        {"-"}
                                        {pts}
                                    </button>
                                ))}
                                <input
                                    type="number"
                                    min={1}
                                    max={50}
                                    value={penaltyPoints}
                                    onChange={(e) => setPenaltyPoints(Number(e.target.value) || 0)}
                                    className="w-20 rounded-full border border-slate-200 px-3 py-2.5 text-center text-xs font-black text-slate-800 outline-none focus:border-wine"
                                />
                            </div>
                        </div>

                        {/* Quick Common Violations */}
                        <div className="mt-1 flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-800">{UI_TEXT.violationModal.quickSelectLabel}</label>
                            <div className="flex flex-wrap gap-1.5">
                                {COMMON_VIOLATIONS.map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => setReason(item)}
                                        className="cursor-pointer rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-200"
                                    >
                                        {"+"} {item}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Reason Input */}
                        <div className="mt-1 flex flex-col gap-2">
                            <label className="text-xs font-bold text-slate-800">{UI_TEXT.violationModal.reasonLabel}</label>
                            <textarea
                                rows={2}
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
