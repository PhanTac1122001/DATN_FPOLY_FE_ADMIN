"use client";

import { useEffect, useRef, useState } from "react";
import { BookText, FileText, HelpCircle, Play, ShieldAlert, Tag, Trash2 } from "lucide-react";
import { DEFAULT_PASS_SCORE } from "@/constants/options.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { sessionTypeService } from "@/services/session-type.service";
import type { SessionFormProps, SessionTypeOption } from "@/types/courseware.types";
import { SessionTypeEnum } from "@/types/material.types";

export function SessionForm({
    mode,
    fields,
    setFields,
    onSubmit,
    onDelete,
    isPending: _isPending,
    onRegisterSave,
    isDirty,
    onOpenManageTypes,
}: SessionFormProps) {
    const formRef = useRef<HTMLFormElement>(null);

    // Dynamic Session Types list
    const [availableTypes, setAvailableTypes] = useState<SessionTypeOption[]>([
        { id: SessionTypeEnum.LY_THUYET, label: UI_TEXT.addSessionModal.sessionTypeTheory },
        { id: SessionTypeEnum.THUC_HANH, label: UI_TEXT.addSessionModal.sessionTypePractice },
        { id: SessionTypeEnum.BAI_TAP, label: UI_TEXT.addSessionModal.sessionTypeExercise },
        { id: SessionTypeEnum.KIEM_TRA, label: UI_TEXT.addSessionModal.sessionTypeQuiz },
    ]);

    useEffect(() => {
        sessionTypeService
            .getAll(true)
            .then((data) => {
                if (data && data.length > 0) {
                    const mapped: SessionTypeOption[] = data
                        .filter((t) => t.isActive)
                        .map((t) => ({
                            id: t.code || t.id,
                            label: t.name,
                        }));
                    if (mapped.length > 0) {
                        setAvailableTypes(mapped);
                    }
                }
            })
            .catch((err) => {
                console.warn("Could not load backend session types, using default types:", err);
            });
    }, []);

    useEffect(() => {
        if (onRegisterSave) {
            onRegisterSave(() => {
                if (formRef.current) {
                    formRef.current.requestSubmit();
                }
            });
        }
    }, [onRegisterSave]);

    const title = mode === "create" ? UI_TEXT.courseDetail.addSessionTitle : UI_TEXT.courseDetail.editSessionTitle;
    const description = mode === "create" ? UI_TEXT.courseDetail.addSessionDescription : UI_TEXT.courseDetail.editSessionDescription;

    return (
        <div className="relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl bg-white p-6 shadow-xs">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 pb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-800">{title}</h3>
                        {isDirty && (
                            <span className="animate-pulse rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-600">
                                {UI_TEXT.sessionForm.unSavedBadge}
                            </span>
                        )}
                    </div>
                    <p className="mt-0.5 text-sm font-medium text-slate-400">{description}</p>
                </div>
                {mode === "edit" && onDelete && (
                    <button
                        type="button"
                        onClick={onDelete}
                        className="flex cursor-pointer items-center gap-1.5 p-2 text-red-500 transition hover:text-red-600"
                        title={UI_TEXT.sessionForm.deleteChapterTooltip}
                    >
                        <Trash2 className="size-4" />
                    </button>
                )}
            </div>

            {/* Scrollable Form Content */}
            <form ref={formRef} onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col justify-between gap-4">
                <div className="custom-scrollbar flex flex-1 flex-col gap-6 overflow-y-auto pr-2">
                    {/* Section 1: General Info */}
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-slate-500">{UI_TEXT.courseDetail.sessionNameLabel}</label>
                                <input
                                    type="text"
                                    value={fields.name}
                                    onChange={(e) => setFields((prev) => ({ ...prev, name: e.target.value }))}
                                    placeholder={UI_TEXT.courseDetail.sessionNamePlaceholder}
                                    className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium focus:border-wine focus:outline-none"
                                    autoFocus
                                    required
                                />
                            </div>

                            {/* Dynamic Session Types selection & Creation Modal */}
                            <div className="col-span-2 flex flex-col gap-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-slate-500">{UI_TEXT.courseDetail.sessionTypeLabel}</label>
                                    {onOpenManageTypes && (
                                        <button
                                            type="button"
                                            onClick={onOpenManageTypes}
                                            className="inline-flex cursor-pointer items-center gap-1 text-xs font-bold text-wine transition hover:underline"
                                        >
                                            <Tag className="size-3.5" />
                                            <span>{UI_TEXT.sessionForm.manageTypesBtn}</span>
                                        </button>
                                    )}
                                </div>

                                <div className="flex w-full flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-1.5">
                                    {availableTypes.map((t) => {
                                        const isSelected = (fields.type || SessionTypeEnum.LY_THUYET) === t.id;
                                        return (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => setFields((prev) => ({ ...prev, type: t.id }))}
                                                className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-150 ${
                                                    isSelected
                                                        ? "bg-wine text-white shadow-xs"
                                                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900"
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

                            <div className="col-span-2 flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-slate-500">{UI_TEXT.courseDetail.sessionDescLabel}</label>
                                <textarea
                                    value={fields.description || ""}
                                    onChange={(e) => setFields((prev) => ({ ...prev, description: e.target.value }))}
                                    placeholder={UI_TEXT.courseDetail.sessionDescPlaceholder}
                                    rows={4}
                                    className="min-h-[100px] w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium focus:border-wine focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Logic Qua Bài (Session Rules) */}
                    <div className="flex flex-col gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4">
                        <div className="flex items-center gap-2 text-xs font-extrabold tracking-wider text-wine uppercase">
                            <ShieldAlert className="size-4" />
                            <span>{UI_TEXT.sessionForm.passRulesTitle}</span>
                        </div>

                        <div className="flex flex-col gap-2.5 pt-1">
                            <label className="flex cursor-pointer items-center gap-3 text-xs font-bold text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={fields.requireSequential ?? true}
                                    onChange={(e) => setFields((prev) => ({ ...prev, requireSequential: e.target.checked }))}
                                    className="size-4 cursor-pointer rounded accent-wine"
                                />
                                <span>{UI_TEXT.sessionForm.requireSequentialLabel}</span>
                            </label>

                            <label className="flex cursor-pointer items-center gap-3 text-xs font-bold text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={fields.requireAllLessons ?? true}
                                    onChange={(e) => setFields((prev) => ({ ...prev, requireAllLessons: e.target.checked }))}
                                    className="size-4 cursor-pointer rounded accent-wine"
                                />
                                <span>{UI_TEXT.sessionForm.requireAllLessonsLabel}</span>
                            </label>

                            <div className="flex flex-col gap-2">
                                <label className="flex cursor-pointer items-center gap-3 text-xs font-bold text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={fields.requireMinPassScore ?? false}
                                        onChange={(e) => setFields((prev) => ({ ...prev, requireMinPassScore: e.target.checked }))}
                                        className="size-4 cursor-pointer rounded accent-wine"
                                    />
                                    <span>{UI_TEXT.sessionForm.requireMinPassScoreLabel}</span>
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

                    {/* Section 3: Standard Resources */}
                    <div className="flex flex-col gap-4">
                        <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase">{UI_TEXT.sessionForm.standardResourcesTitle}</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 flex flex-col gap-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-slate-500">{UI_TEXT.courseDetail.sessionMindmapLabel}</label>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-sm font-medium text-slate-400">{UI_TEXT.courseDetail.sessionShowMindmapLabel}</span>
                                        <input
                                            type="checkbox"
                                            checked={!!fields.isShowMindmap}
                                            onChange={(e) => setFields((prev) => ({ ...prev, isShowMindmap: e.target.checked }))}
                                            className="size-3.5 cursor-pointer rounded border-slate-300 text-wine accent-wine"
                                        />
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    value={fields.mindmap || ""}
                                    onChange={(e) => setFields((prev) => ({ ...prev, mindmap: e.target.value }))}
                                    placeholder={UI_TEXT.courseDetail.sessionMindmapPlaceholder}
                                    className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium focus:border-wine focus:outline-none"
                                />
                            </div>

                            <div className="col-span-1 flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-slate-500">{UI_TEXT.courseDetail.sessionSrsLabel}</label>
                                <input
                                    type="text"
                                    value={fields.srs || ""}
                                    onChange={(e) => setFields((prev) => ({ ...prev, srs: e.target.value }))}
                                    placeholder={UI_TEXT.courseDetail.sessionSrsPlaceholder}
                                    className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium focus:border-wine focus:outline-none"
                                />
                            </div>

                            <div className="col-span-1 flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-slate-500">{UI_TEXT.courseDetail.sessionPdfLabel}</label>
                                <input
                                    type="text"
                                    value={fields.pdf || ""}
                                    onChange={(e) => setFields((prev) => ({ ...prev, pdf: e.target.value }))}
                                    placeholder={UI_TEXT.courseDetail.sessionPdfPlaceholder}
                                    className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium focus:border-wine focus:outline-none"
                                />
                            </div>

                            <div className="col-span-1 flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-slate-500">{UI_TEXT.courseDetail.sessionMiniProjectLabel}</label>
                                <input
                                    type="text"
                                    value={fields.miniProject || ""}
                                    onChange={(e) => setFields((prev) => ({ ...prev, miniProject: e.target.value }))}
                                    placeholder={UI_TEXT.courseDetail.sessionMiniProjectPlaceholder}
                                    className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium focus:border-wine focus:outline-none"
                                />
                            </div>

                            <div className="col-span-1 flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-slate-500">{UI_TEXT.courseDetail.sessionEntranceQuizLabel}</label>
                                <input
                                    type="text"
                                    value={fields.practiceEntranceQuiz || ""}
                                    onChange={(e) => setFields((prev) => ({ ...prev, practiceEntranceQuiz: e.target.value }))}
                                    placeholder={UI_TEXT.courseDetail.sessionEntranceQuizPlaceholder}
                                    className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium focus:border-wine focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
