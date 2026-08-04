"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Star, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { BONUS_PRESETS, DEFAULT_BONUS_POINTS } from "@/constants/options.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { addStudentLearningBonus } from "@/services/auto-rpoint.service";
import { toast } from "@/services/toast.service";
import type { AddRpointBonusModalProps } from "@/types/rpoint.types";

export function AddRpointBonusModal({ isOpen, onClose, studentId, studentName, studentCode, courseId, classId, onSuccess }: AddRpointBonusModalProps) {
    const [bonusPoints, setBonusPoints] = useState<number>(DEFAULT_BONUS_POINTS);
    const [reason, setReason] = useState<string>("");

    const bonusMutation = useMutation({
        mutationFn: async () => {
            if (!studentId || !courseId) throw new Error(UI_TEXT.rpointBonusModal.errMissingInfo);
            if (bonusPoints <= 0) throw new Error(UI_TEXT.rpointBonusModal.errInvalidPoints);
            await addStudentLearningBonus({
                studentId,
                courseId,
                classId,
                bonusPoints,
                reason: reason.trim() || UI_TEXT.rpointBonusModal.defaultReason,
            });
        },
        onSuccess: () => {
            toast.success(
                UI_TEXT.rpointBonusModal.toastSuccessTitle,
                UI_TEXT.rpointBonusModal.toastSuccessDescPrefix +
                    bonusPoints +
                    UI_TEXT.rpointBonusModal.toastSuccessDescMid +
                    studentName +
                    UI_TEXT.rpointBonusModal.toastSuccessDescSuffix,
            );
            if (onSuccess) onSuccess();
            onClose();
            setReason("");
        },
        onError: (err: Error) => {
            toast.error(UI_TEXT.rpointBonusModal.toastErrorTitle, err.message || UI_TEXT.rpointBonusModal.toastErrorDefault);
        },
    });

    return (
        <CustomModal.Root open={isOpen} onOpenChange={onClose}>
            <CustomModal.Content className="max-w-[480px] rounded-[24px] border-none bg-white p-0 shadow-2xl">
                <Dialog className="flex flex-col outline-none">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 font-bold text-amber-600">
                                <Star className="size-5" />
                            </div>
                            <div>
                                <Heading slot="title" className="text-lg font-extrabold text-slate-900">
                                    {UI_TEXT.rpointBonusModal.title}
                                </Heading>
                                <p className="mt-0.5 text-xs font-medium text-slate-500">
                                    {UI_TEXT.rpointBonusModal.studentLabel}
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
                        {/* Points Input Pills */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-slate-800">{UI_TEXT.rpointBonusModal.selectBonusLabel}</label>
                            <div className="flex items-center gap-2">
                                {BONUS_PRESETS.map((pts) => (
                                    <button
                                        key={pts}
                                        type="button"
                                        onClick={() => setBonusPoints(pts)}
                                        className={`flex-1 cursor-pointer rounded-full border py-2.5 text-xs font-extrabold transition ${
                                            bonusPoints === pts
                                                ? "border-2 border-amber-500 bg-amber-50 text-amber-800 shadow-2xs"
                                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                                        }`}
                                    >
                                        {"+"}
                                        {pts}
                                    </button>
                                ))}
                                <input
                                    type="number"
                                    min={1}
                                    max={50}
                                    value={bonusPoints}
                                    onChange={(e) => setBonusPoints(Number(e.target.value) || 0)}
                                    className="w-20 rounded-full border border-slate-200 px-3 py-2.5 text-center text-xs font-black text-slate-800 outline-none focus:border-wine"
                                />
                            </div>
                        </div>

                        {/* Reason Input */}
                        <div className="mt-1 flex flex-col gap-2">
                            <label className="text-xs font-bold text-slate-800">{UI_TEXT.rpointBonusModal.reasonLabel}</label>
                            <textarea
                                rows={3}
                                placeholder={UI_TEXT.rpointBonusModal.reasonPlaceholder}
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
                            {UI_TEXT.rpointBonusModal.cancelBtn}
                        </Button>
                        <Button
                            type="button"
                            color="primary"
                            size="md"
                            onClick={() => bonusMutation.mutate()}
                            isLoading={bonusMutation.isPending}
                            className="w-2/3 justify-center rounded-full border-none bg-wine py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-wine-deep"
                        >
                            {UI_TEXT.rpointBonusModal.submitBtn}
                        </Button>
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
