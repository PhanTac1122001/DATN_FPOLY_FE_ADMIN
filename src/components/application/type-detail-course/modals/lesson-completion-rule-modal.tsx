"use client";

import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckSquare, Loader2, ShieldAlert, ShieldCheck, X } from "lucide-react";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { BlockTypeEnum, CompletionModeEnum } from "@/constants/application.constants";
import { FULL_PERCENT } from "@/constants/options.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { completionRuleService } from "@/services/completion-rule.service";
import { coursewareService } from "@/services/courseware.service";
import { getLessonDetails, updateLesson } from "@/services/material.service";
import { toast } from "@/services/toast.service";
import type { CoursewareBlockEntity, LessonCompletionRuleModalProps } from "@/types/completion-rule.types";
import { isDefaultLessonRule } from "@/utils/completion-rule.utils";
import { extractErrorMessages } from "@/utils/http-error-message.utils";

export function LessonCompletionRuleModal({ isOpen, onOpenChange, lessonId, lessonTitle, lessonName: propsLessonName }: LessonCompletionRuleModalProps) {
    const lessonName = lessonTitle || propsLessonName || "";
    const queryClient = useQueryClient();
    const [blocks, setBlocks] = useState<CoursewareBlockEntity[]>([]);
    const [criteriaMap, setCriteriaMap] = useState<Record<string, Record<string, unknown>>>({});
    const [isRequiredMap, setIsRequiredMap] = useState<Record<string, boolean>>({});
    const [sequentialBlocks, setSequentialBlocks] = useState(false);
    const [isCustomRule, setIsCustomRule] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const updateBlockCriteria = (blockId: string, key: string, value: unknown) => {
        setCriteriaMap((prev) => ({
            ...prev,
            [blockId]: {
                ...(prev[blockId] || {}),
                [key]: value,
            },
        }));
    };

    const toggleBlockIsRequired = (blockId: string) => {
        setIsRequiredMap((prev) => ({
            ...prev,
            [blockId]: !prev[blockId],
        }));
    };

    const loadData = useCallback(async () => {
        if (!lessonId) return;
        setLoading(true);
        try {
            const [rule, loadedBlocks, lessonDetails] = await Promise.all([
                completionRuleService.getLessonRule(lessonId).catch(() => null),
                coursewareService.getLessonBlocks(lessonId).catch(() => []),
                getLessonDetails(lessonId).catch(() => null),
            ]);

            const combinedBlocks: CoursewareBlockEntity[] = [...loadedBlocks];

            if (lessonDetails) {
                const hasVideoBlock = loadedBlocks.some((b) => b.type.toUpperCase() === BlockTypeEnum.VIDEO);
                if (!hasVideoBlock && (lessonDetails.video || lessonDetails.videoUrl)) {
                    combinedBlocks.push({
                        id: "legacy-video",
                        type: BlockTypeEnum.VIDEO,
                        title: UI_TEXT.lessonCompletionRuleModal.videoTitle,
                        isRequired: true,
                        completionCriteria: { minWatchPercent: 0, requireAllQuestionsCorrect: true },
                    });
                }

                const hasReadingBlock = loadedBlocks.some((b) => b.type.toUpperCase() === BlockTypeEnum.READING);
                if (!hasReadingBlock && (lessonDetails.reading || lessonDetails.pdf)) {
                    combinedBlocks.push({
                        id: "legacy-reading",
                        type: BlockTypeEnum.READING,
                        title: UI_TEXT.lessonCompletionRuleModal.readingTitle,
                        isRequired: true,
                        completionCriteria: { requireAllQuestionsAnswered: true },
                    });
                }

                const hasQuizBlock = loadedBlocks.some((b) => b.type.toUpperCase() === BlockTypeEnum.QUIZ);
                if (!hasQuizBlock && (lessonDetails.quizId || (lessonDetails as unknown as Record<string, unknown>).quiz)) {
                    combinedBlocks.push({
                        id: "legacy-quiz",
                        type: BlockTypeEnum.QUIZ,
                        title: UI_TEXT.lessonCompletionRuleModal.quizTitle,
                        isRequired: true,
                        completionCriteria: { minScorePercent: 100, maxAttempts: null },
                    });
                }
            }

            setBlocks(combinedBlocks);
            setSequentialBlocks(!!lessonDetails?.sequentialBlocks);
            setIsCustomRule(!isDefaultLessonRule(rule));

            const initCriteria: Record<string, Record<string, unknown>> = {};
            const initRequired: Record<string, boolean> = {};

            combinedBlocks.forEach((block) => {
                initCriteria[block.id] = block.completionCriteria || {};
                initRequired[block.id] = block.isRequired !== false;
            });

            setCriteriaMap(initCriteria);
            setIsRequiredMap(initRequired);
        } catch (error) {
            toast.error(UI_TEXT.common.errorTitle, extractErrorMessages(error));
            setBlocks([]);
            setCriteriaMap({});
            setIsRequiredMap({});
        } finally {
            setLoading(false);
        }
    }, [lessonId]);

    useEffect(() => {
        if (isOpen && lessonId) {
            void loadData();
        }
    }, [isOpen, lessonId, loadData]);

    const handleResetToDefault = async () => {
        if (!lessonId) return;
        setSaving(true);
        try {
            const defaultPayload = { groups: [{ operator: "ALL" as const }] };
            await completionRuleService.setLessonRule(lessonId, defaultPayload);
            setIsCustomRule(false);
            toast.success(UI_TEXT.common.successTitle, UI_TEXT.lessonCompletionRuleModal.toastResetSuccess);
        } catch (error) {
            toast.error(UI_TEXT.common.errorTitle, extractErrorMessages(error));
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        if (!lessonId) return;
        setSaving(true);

        try {
            // 1. Save Level 1 criteria & isRequired for real blocks only
            const realBlocks = blocks.filter((b) => !b.id.startsWith("legacy-"));
            await Promise.all(
                realBlocks.map((block) => {
                    const criteria = criteriaMap[block.id];
                    const isRequired = isRequiredMap[block.id] !== false;
                    return coursewareService.updateBlock(block.id, {
                        isRequired,
                        completionCriteria: criteria,
                    });
                }),
            );

            // 2. Save sequentialBlocks setting on lesson
            await updateLesson(lessonId, { sequentialBlocks });

            // 3. Save Level 2 default rule
            const payload = { groups: [{ operator: "ALL" as const }] };
            await completionRuleService.setLessonRule(lessonId, payload);

            await queryClient.invalidateQueries({ queryKey: ["lessons"] });
            await queryClient.invalidateQueries({ queryKey: ["lesson-blocks"] });
            await queryClient.invalidateQueries({ queryKey: ["lesson-details-editor"] });
            await queryClient.invalidateQueries({ queryKey: ["sessions"] });
            await queryClient.invalidateQueries({ queryKey: ["session-blocks"] });

            toast.success(UI_TEXT.common.successTitle, UI_TEXT.lessonCompletionRuleModal.toastSaveSuccess);
            onOpenChange(false);
        } catch (error) {
            toast.error(UI_TEXT.common.errorTitle, extractErrorMessages(error));
        } finally {
            setSaving(false);
        }
    };

    return (
        <CustomModal.Root open={isOpen} onOpenChange={onOpenChange}>
            <CustomModal.Content className="w-full max-w-3xl !rounded-[24px]">
                <Dialog className="relative flex max-h-[85vh] flex-col gap-4 overflow-hidden rounded-[24px] bg-white p-6 shadow-2xl outline-none">
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="absolute top-4 right-4 cursor-pointer rounded-lg p-1 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
                    >
                        <X className="size-4" />
                    </button>

                    {/* Header */}
                    <div className="flex flex-col gap-1 border-b border-slate-100 pr-8 pb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-wine/10 text-wine">
                                <ShieldCheck className="size-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">{UI_TEXT.lessonCompletionRuleModal.modalTitle}</h3>
                        </div>
                        <p className="text-xs font-semibold text-slate-600">
                            {UI_TEXT.lessonCompletionRuleModal.modalSubtitlePrefix}
                            <strong className="font-extrabold text-wine">{lessonName}</strong>
                        </p>
                    </div>

                    {/* Body */}
                    <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pr-1">
                        {loading ? (
                            <div className="flex flex-1 items-center justify-center py-16 text-slate-400">
                                <Loader2 className="size-7 animate-spin text-wine" />
                                <span className="ml-2.5 text-sm font-medium text-slate-600">{UI_TEXT.lessonCompletionRuleModal.loading}</span>
                            </div>
                        ) : (
                            <>
                                {/* Level 2 Rule Banner (Custom rule warning if present) */}
                                {isCustomRule && (
                                    <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4.5 shadow-2xs">
                                        <div className="flex items-center gap-2 text-sm font-bold text-amber-900">
                                            <ShieldAlert className="size-5 shrink-0 text-amber-600" />
                                            <span>{UI_TEXT.lessonCompletionRuleModal.customRuleTitle}</span>
                                        </div>
                                        <p className="text-xs leading-relaxed font-medium text-amber-800">
                                            {UI_TEXT.lessonCompletionRuleModal.customRuleNotice}
                                        </p>
                                        <div className="pt-1">
                                            <button
                                                type="button"
                                                onClick={handleResetToDefault}
                                                disabled={saving}
                                                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-wine px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-wine/90 disabled:opacity-50"
                                            >
                                                {saving ? <Loader2 className="size-3.5 animate-spin" /> : <CheckSquare className="size-3.5" />}
                                                <span>{UI_TEXT.lessonCompletionRuleModal.resetBtnText}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Section 1: Block Level Criteria & isRequired */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-extrabold tracking-wider text-indigo-700 uppercase">
                                        {UI_TEXT.lessonCompletionRuleModal.level1Header}
                                    </h4>

                                    {blocks.length === 0 ? (
                                        <p className="py-6 text-center text-xs font-semibold text-slate-500 italic">
                                            {UI_TEXT.lessonCompletionRuleModal.empty}
                                        </p>
                                    ) : (
                                        <div className="space-y-3.5">
                                            {blocks.map((block) => {
                                                const criteria = criteriaMap[block.id] || {};
                                                const isReq = isRequiredMap[block.id] !== false;
                                                const bType = (block.type || "").toUpperCase();

                                                return (
                                                    <div key={block.id} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 shadow-2xs">
                                                        {/* Block Title & isRequired switch */}
                                                        <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                                                            <div className="flex min-w-0 items-center gap-2">
                                                                <span className="truncate text-sm font-extrabold text-slate-800">
                                                                    {block.title || block.id}
                                                                </span>
                                                            </div>
                                                            <label className="flex shrink-0 cursor-pointer items-center select-none">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isReq}
                                                                    onChange={() => toggleBlockIsRequired(block.id)}
                                                                    className="size-4.5 cursor-pointer rounded accent-wine"
                                                                />
                                                            </label>
                                                        </div>

                                                        {/* Specific criteria forms by block type */}
                                                        {bType === BlockTypeEnum.VIDEO && (
                                                            <div className="grid grid-cols-2 gap-4 pt-1">
                                                                <div>
                                                                    <label className="text-xs font-bold text-slate-700">
                                                                        {UI_TEXT.lessonCompletionRuleModal.minWatchPercentLabel}
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        min={0}
                                                                        max={100}
                                                                        value={typeof criteria.minWatchPercent === "number" ? criteria.minWatchPercent : 0}
                                                                        onChange={(e) =>
                                                                            updateBlockCriteria(block.id, "minWatchPercent", Number(e.target.value))
                                                                        }
                                                                        className="mt-1.5 w-full rounded-full border border-slate-300 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-800 shadow-2xs transition focus:border-wine focus:ring-2 focus:ring-wine/10 focus:outline-none"
                                                                    />
                                                                </div>
                                                                <div className="flex items-center gap-2 pt-6">
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`req-qs-${block.id}`}
                                                                        checked={criteria.requireAllQuestionsCorrect !== false}
                                                                        onChange={(e) =>
                                                                            updateBlockCriteria(block.id, "requireAllQuestionsCorrect", e.target.checked)
                                                                        }
                                                                        className="size-4 cursor-pointer rounded accent-wine"
                                                                    />
                                                                    <label
                                                                        htmlFor={`req-qs-${block.id}`}
                                                                        className="cursor-pointer text-xs font-bold text-slate-700 select-none"
                                                                    >
                                                                        {UI_TEXT.lessonCompletionRuleModal.requireAllQuestionsCorrectLabel}
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {bType === BlockTypeEnum.READING && (
                                                            <div className="flex flex-col gap-2.5 pt-1">
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`req-rd-${block.id}`}
                                                                        checked={criteria.requireAllQuestionsAnswered !== false}
                                                                        onChange={(e) =>
                                                                            updateBlockCriteria(block.id, "requireAllQuestionsAnswered", e.target.checked)
                                                                        }
                                                                        className="size-4 cursor-pointer rounded accent-wine"
                                                                    />
                                                                    <label
                                                                        htmlFor={`req-rd-${block.id}`}
                                                                        className="cursor-pointer text-xs font-bold text-slate-700 select-none"
                                                                    >
                                                                        {UI_TEXT.lessonCompletionRuleModal.requireAllQuestionsAnsweredLabel}
                                                                    </label>
                                                                </div>
                                                                <div className="flex items-center gap-2 opacity-60">
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`ai-rv-${block.id}`}
                                                                        disabled
                                                                        checked={false}
                                                                        className="size-4 cursor-not-allowed rounded"
                                                                    />
                                                                    <label
                                                                        htmlFor={`ai-rv-${block.id}`}
                                                                        className="cursor-not-allowed text-xs font-bold text-slate-500 select-none"
                                                                    >
                                                                        {UI_TEXT.lessonCompletionRuleModal.aiGradeLabel}
                                                                    </label>
                                                                    <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                                                                        {UI_TEXT.lessonCompletionRuleModal.notAvailableTag}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {bType === BlockTypeEnum.QUIZ && (
                                                            <div className="grid grid-cols-2 gap-4 pt-1">
                                                                <div>
                                                                    <label className="text-xs font-bold text-slate-700">
                                                                        {UI_TEXT.lessonCompletionRuleModal.minScorePercentLabel}
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        min={0}
                                                                        max={FULL_PERCENT}
                                                                        value={
                                                                            typeof criteria.minScorePercent === "number"
                                                                                ? criteria.minScorePercent
                                                                                : FULL_PERCENT
                                                                        }
                                                                        onChange={(e) =>
                                                                            updateBlockCriteria(block.id, "minScorePercent", Number(e.target.value))
                                                                        }
                                                                        className="mt-1.5 w-full rounded-full border border-slate-300 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-800 shadow-2xs transition focus:border-wine focus:ring-2 focus:ring-wine/10 focus:outline-none"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-xs font-bold text-slate-700">
                                                                        {UI_TEXT.lessonCompletionRuleModal.maxAttemptsLabel}
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        min={1}
                                                                        value={criteria.maxAttempts != null ? Number(criteria.maxAttempts) : ""}
                                                                        onChange={(e) =>
                                                                            updateBlockCriteria(
                                                                                block.id,
                                                                                "maxAttempts",
                                                                                e.target.value ? Number(e.target.value) : null,
                                                                            )
                                                                        }
                                                                        className="mt-1.5 w-full rounded-full border border-slate-300 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-800 shadow-2xs transition focus:border-wine focus:ring-2 focus:ring-wine/10 focus:outline-none"
                                                                        placeholder={UI_TEXT.lessonCompletionRuleModal.unlimitedPlaceholder}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}

                                                        {(bType === BlockTypeEnum.HOMEWORK || bType === BlockTypeEnum.PRACTICE) && (
                                                            <div className="flex items-center gap-2 pt-1">
                                                                <input
                                                                    type="checkbox"
                                                                    id={`req-sub-${block.id}`}
                                                                    checked={criteria.requireSubmission !== false}
                                                                    onChange={(e) => updateBlockCriteria(block.id, "requireSubmission", e.target.checked)}
                                                                    className="size-4 cursor-pointer rounded accent-wine"
                                                                />
                                                                <label
                                                                    htmlFor={`req-sub-${block.id}`}
                                                                    className="cursor-pointer text-xs font-bold text-slate-700 select-none"
                                                                >
                                                                    {UI_TEXT.lessonCompletionRuleModal.requireSubmissionLabel}
                                                                </label>
                                                            </div>
                                                        )}

                                                        {[BlockTypeEnum.FILE, BlockTypeEnum.LINK, BlockTypeEnum.EMBED, BlockTypeEnum.MINDMAP].includes(
                                                            bType as BlockTypeEnum,
                                                        ) && (
                                                            <div className="flex items-center gap-3 pt-1">
                                                                <label className="text-xs font-bold text-slate-700">
                                                                    {UI_TEXT.lessonCompletionRuleModal.completionModeLabel}
                                                                </label>
                                                                <select
                                                                    value={
                                                                        (criteria.mode as string) ||
                                                                        (bType === BlockTypeEnum.EMBED
                                                                            ? CompletionModeEnum.ACKNOWLEDGE
                                                                            : CompletionModeEnum.AUTO_ON_OPEN)
                                                                    }
                                                                    onChange={(e) => updateBlockCriteria(block.id, "mode", e.target.value)}
                                                                    className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-extrabold text-slate-800 shadow-2xs transition focus:border-wine focus:ring-2 focus:ring-wine/10 focus:outline-none"
                                                                >
                                                                    <option value={CompletionModeEnum.AUTO_ON_OPEN}>
                                                                        {UI_TEXT.lessonCompletionRuleModal.autoOnOpenOption}
                                                                    </option>
                                                                    <option value={CompletionModeEnum.ACKNOWLEDGE}>
                                                                        {UI_TEXT.lessonCompletionRuleModal.acknowledgeOption}
                                                                    </option>
                                                                </select>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="mt-2 flex w-full shrink-0 items-center gap-3 border-t border-slate-100 bg-white pt-4">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="w-1/3 cursor-pointer rounded-full border border-slate-200 bg-white py-3 text-center text-xs font-bold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
                        >
                            {UI_TEXT.lessonCompletionRuleModal.cancelBtn}
                        </button>
                        <button
                            type="button"
                            disabled={saving || loading}
                            onClick={handleSave}
                            className="hover:bg-wine-hover flex w-2/3 cursor-pointer items-center justify-center gap-2 rounded-full border-none bg-wine py-3 text-center text-xs font-black text-white shadow-sm transition active:scale-[0.98] disabled:opacity-50"
                        >
                            {saving && <Loader2 className="size-4 animate-spin" />}
                            <span>{UI_TEXT.lessonCompletionRuleModal.saveBtn}</span>
                        </button>
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
