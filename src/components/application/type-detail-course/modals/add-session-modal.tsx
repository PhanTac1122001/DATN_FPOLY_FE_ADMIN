"use client";

import { useState } from "react";
import { BookText, FileText, HelpCircle, Play, Plus, ShieldAlert, X } from "lucide-react";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { DEFAULT_PASS_SCORE } from "@/constants/options.constants";
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

                        {/* Scrollable Form Content */}
                        <div className="custom-scrollbar flex max-h-[500px] flex-col gap-6 overflow-y-auto pr-3">
                            {/* Section 1: General Info */}
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

                            {/* Section 2: Logic Qua Bài (Session Pass Rules) */}
                            <div className="flex flex-col gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4">
                                <div className="flex items-center gap-2 text-xs font-extrabold tracking-wider text-wine uppercase">
                                    <ShieldAlert className="size-4" />
                                    <span>{UI_TEXT.addSessionModal.passRulesTitle}</span>
                                </div>

                                <div className="flex flex-col gap-2.5 pt-1">
                                    <label className="flex cursor-pointer items-center gap-3 text-xs font-bold text-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={fields.requireSequential ?? true}
                                            onChange={(e) => setFields((prev) => ({ ...prev, requireSequential: e.target.checked }))}
                                            className="size-4 cursor-pointer rounded accent-wine"
                                        />
                                        <span>{UI_TEXT.addSessionModal.requireSequentialLabel}</span>
                                    </label>

                                    <label className="flex cursor-pointer items-center gap-3 text-xs font-bold text-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={fields.requireAllLessons ?? true}
                                            onChange={(e) => setFields((prev) => ({ ...prev, requireAllLessons: e.target.checked }))}
                                            className="size-4 cursor-pointer rounded accent-wine"
                                        />
                                        <span>{UI_TEXT.addSessionModal.requireAllLessonsLabel}</span>
                                    </label>

                                    <div className="flex flex-col gap-2">
                                        <label className="flex cursor-pointer items-center gap-3 text-xs font-bold text-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={fields.requireMinPassScore ?? false}
                                                onChange={(e) => setFields((prev) => ({ ...prev, requireMinPassScore: e.target.checked }))}
                                                className="size-4 cursor-pointer rounded accent-wine"
                                            />
                                            <span>{UI_TEXT.addSessionModal.requireMinPassScoreLabel}</span>
                                        </label>

                                        {fields.requireMinPassScore && (
                                            <div className="ml-7 flex items-center gap-2">
                                                <span className="text-xs font-medium text-slate-500">{UI_TEXT.addSessionModal.passScoreLabel}</span>
                                                <input
                                                    type="number"
                                                    step="0.5"
                                                    min={0}
                                                    max={10}
                                                    value={fields.minPassScoreValue ?? DEFAULT_PASS_SCORE}
                                                    onChange={(e) => setFields((prev) => ({ ...prev, minPassScoreValue: Number(e.target.value) }))}
                                                    className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-ink outline-none focus:border-wine"
                                                />
                                                <span className="text-xs text-slate-400">{UI_TEXT.addSessionModal.passScoreMaxSuffix}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
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

            {/* Add Session Type Modal */}
            <AddSessionTypeModal isOpen={isAddTypeModalOpen} onOpenChange={setIsAddTypeModalOpen} onAddType={handleAddType} />
        </CustomModal.Root>
    );
}
