"use client";

import { useState } from "react";
import { BookText, FileText, HelpCircle, Play, Plus, X } from "lucide-react";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import type { AddSessionModalProps, SessionTypeOption } from "@/types/courseware.types";
import { SessionTypeEnum } from "@/types/material.types";
import { AddSessionTypeModal } from "./add-session-type-modal";

export function AddSessionModal({ isOpen, onOpenChange, fields, setFields, onSubmit, isPending }: AddSessionModalProps) {
    const [availableTypes, setAvailableTypes] = useState<SessionTypeOption[]>([
        { id: SessionTypeEnum.LY_THUYET, label: UI_TEXT.addSessionModal.sessionTypeTheory },
        { id: SessionTypeEnum.THUC_HANH, label: UI_TEXT.addSessionModal.sessionTypePractice },
        { id: SessionTypeEnum.BAI_TAP, label: UI_TEXT.addSessionModal.sessionTypeExercise },
        { id: SessionTypeEnum.KIEM_TRA, label: UI_TEXT.addSessionModal.sessionTypeQuiz },
    ]);

    const [isAddTypeModalOpen, setIsAddTypeModalOpen] = useState(false);

    const handleAddType = (newLabel: string) => {
        const newId = `TYPE_${Date.now()}`;
        const newOption: SessionTypeOption = { id: newId, label: newLabel };

        setAvailableTypes((prev) => [...prev, newOption]);
        setFields((prev) => ({ ...prev, type: newId }));
    };

    return (
        <CustomModal.Root open={isOpen} onOpenChange={onOpenChange}>
            <CustomModal.Content className="w-full max-w-3xl !rounded-[20px]">
                <Dialog className="relative flex flex-col gap-4 rounded-[20px] bg-white p-6 shadow-2xl outline-none">
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="absolute top-4 right-4 cursor-pointer rounded-lg p-1 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
                    >
                        <X className="size-4" />
                    </button>
                    <form onSubmit={onSubmit} className="flex flex-col gap-4">
                        <div>
                            <h3 className="text-sm font-black text-slate-800">{UI_TEXT.courseDetail.addSessionTitle}</h3>
                            <p className="mt-0.5 text-[11px] font-medium text-slate-400">{UI_TEXT.courseDetail.addSessionDescription}</p>
                        </div>

                        <div className="custom-scrollbar flex max-h-[500px] flex-col gap-6 overflow-y-auto pr-3">
                            <div className="flex flex-col gap-4">
                                <h4 className="border-b border-slate-100 pb-1.5 text-[11px] font-extrabold tracking-wider text-wine uppercase">
                                    {UI_TEXT.courseDetail.sessionTabGeneral}
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 flex flex-col gap-1.5">
                                        <label className="text-xs font-medium text-slate-500 uppercase">{UI_TEXT.courseDetail.sessionNameLabel}</label>
                                        <input
                                            type="text"
                                            value={fields.name}
                                            onChange={(e) => setFields((prev) => ({ ...prev, name: e.target.value }))}
                                            placeholder={UI_TEXT.courseDetail.sessionNamePlaceholder}
                                            className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold focus:border-wine focus:outline-none"
                                            autoFocus
                                            required
                                        />
                                    </div>
                                    <div className="col-span-2 flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-medium text-slate-500 uppercase">{UI_TEXT.addSessionModal.sessionTypeLabel}</label>
                                            <button
                                                type="button"
                                                onClick={() => setIsAddTypeModalOpen(true)}
                                                className="inline-flex cursor-pointer items-center gap-1 text-xs font-bold text-wine transition hover:underline"
                                            >
                                                <Plus className="size-3.5" />
                                                <span>{UI_TEXT.addSessionModal.addNewTypeBtn}</span>
                                            </button>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5">
                                            {availableTypes.map((t) => {
                                                const isSelected = (fields.type || SessionTypeEnum.LY_THUYET) === t.id;
                                                return (
                                                    <button
                                                        key={t.id}
                                                        type="button"
                                                        onClick={() => setFields((prev) => ({ ...prev, type: t.id }))}
                                                        className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                                                            isSelected
                                                                ? "border-wine bg-wine text-white shadow-xs"
                                                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                                                        }`}
                                                    >
                                                        {t.id === SessionTypeEnum.LY_THUYET && <BookText className="size-3.5" />}
                                                        {t.id === SessionTypeEnum.THUC_HANH && <Play className="size-3.5" />}
                                                        {t.id === SessionTypeEnum.BAI_TAP && <FileText className="size-3.5" />}
                                                        {t.id === SessionTypeEnum.KIEM_TRA && <HelpCircle className="size-3.5" />}
                                                        <span>{t.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-3">
                            <button
                                type="button"
                                onClick={() => onOpenChange(false)}
                                className="cursor-pointer rounded-full border border-slate-200 px-5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                            >
                                {UI_TEXT.addSessionModal.cancelBtn}
                            </button>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="cursor-pointer rounded-full bg-wine px-6 py-2 text-xs font-bold text-white shadow-xs hover:bg-wine/90 disabled:opacity-50"
                            >
                                {isPending ? UI_TEXT.addSessionModal.submittingText : UI_TEXT.addSessionModal.submitText}
                            </button>
                        </div>
                    </form>
                </Dialog>
            </CustomModal.Content>

            <AddSessionTypeModal isOpen={isAddTypeModalOpen} onOpenChange={setIsAddTypeModalOpen} onAddType={handleAddType} />
        </CustomModal.Root>
    );
}
