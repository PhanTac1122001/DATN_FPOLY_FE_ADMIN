"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { BlockTypeEnum } from "@/constants/application.constants";
import { FULL_PERCENT } from "@/constants/options.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { completionRuleService } from "@/services/completion-rule.service";
import { coursewareService } from "@/services/courseware.service";
import { getLessonDetails, updateLesson } from "@/services/material.service";
import { toast } from "@/services/toast.service";
import type { CoursewareBlockEntity, LessonCompletionRuleSectionProps } from "@/types/completion-rule.types";
import { isDefaultLessonRule } from "@/utils/completion-rule.utils";
import { extractErrorMessages } from "@/utils/http-error-message.utils";

export function LessonCompletionRuleSection({ lessonId, onRegisterSave }: LessonCompletionRuleSectionProps) {
    const [isExpanded, setIsExpanded] = useState(true);
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
                        title: UI_TEXT.lessonCompletionRuleSection.videoTitle,
                        isRequired: true,
                        completionCriteria: { minWatchPercent: 0, requireAllQuestionsCorrect: true },
                    });
                }

                const hasReadingBlock = loadedBlocks.some((b) => b.type.toUpperCase() === BlockTypeEnum.READING);
                if (!hasReadingBlock && (lessonDetails.reading || lessonDetails.pdf)) {
                    combinedBlocks.push({
                        id: "legacy-reading",
                        type: BlockTypeEnum.READING,
                        title: UI_TEXT.lessonCompletionRuleSection.readingTitle,
                        isRequired: true,
                        completionCriteria: { requireAllQuestionsAnswered: true },
                    });
                }

                const hasQuizBlock = loadedBlocks.some((b) => b.type.toUpperCase() === BlockTypeEnum.QUIZ);
                if (!hasQuizBlock && (lessonDetails.quizId || (lessonDetails as unknown as Record<string, unknown>).quiz)) {
                    combinedBlocks.push({
                        id: "legacy-quiz",
                        type: BlockTypeEnum.QUIZ,
                        title: UI_TEXT.lessonCompletionRuleSection.quizTitle,
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
        void loadData();
    }, [loadData]);

    const saveRule = useCallback(async () => {
        setSaving(true);
        try {
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

            await updateLesson(lessonId, { sequentialBlocks });

            const payload = { groups: [{ operator: "ALL" as const }] };
            await completionRuleService.setLessonRule(lessonId, payload);
            setIsCustomRule(false);
        } catch (error) {
            const msg = extractErrorMessages(error);
            toast.error(UI_TEXT.common.errorTitle, msg);
            throw error;
        } finally {
            setSaving(false);
        }
    }, [lessonId, blocks, criteriaMap, isRequiredMap, sequentialBlocks]);

    useEffect(() => {
        onRegisterSave?.(saveRule);
    }, [saveRule, onRegisterSave]);

    const handleResetToDefault = async () => {
        setSaving(true);
        try {
            const defaultPayload = { groups: [{ operator: "ALL" as const }] };
            await completionRuleService.setLessonRule(lessonId, defaultPayload);
            setIsCustomRule(false);
            toast.success(UI_TEXT.common.successTitle, UI_TEXT.lessonCompletionRuleSection.toastResetSuccess);
        } catch (error) {
            toast.error(UI_TEXT.common.errorTitle, extractErrorMessages(error));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
                <Loader2 className="size-5 animate-spin text-slate-400" />
                <span className="ml-2 text-sm font-medium text-slate-500">{UI_TEXT.lessonCompletionRuleSection.loading}</span>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs">
            {/* Header */}
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex cursor-pointer items-center justify-between border-b border-slate-100 p-4 hover:bg-slate-50/50"
            >
                <div className="flex items-center gap-2.5">
                    <ShieldCheck className="size-5 text-wine" />
                    <h3 className="text-base font-bold text-slate-900">{UI_TEXT.lessonCompletionRuleSection.title}</h3>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                        {UI_TEXT.lessonCompletionRuleSection.standardRuleBadge}
                    </span>
                </div>
                {isExpanded ? <ChevronDown className="size-4 text-slate-400" /> : <ChevronRight className="size-4 text-slate-400" />}
            </div>

            {/* Body */}
            {isExpanded && (
                <div className="space-y-4 p-4">
                    {/* Custom rule warning if present */}
                    {isCustomRule && (
                        <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                                <ShieldAlert className="size-4 text-amber-600" />
                                <span>{UI_TEXT.lessonCompletionRuleSection.customRuleTitle}</span>
                            </div>
                            <p className="text-xs text-amber-800">{UI_TEXT.lessonCompletionRuleSection.customRuleNotice}</p>
                            <button
                                type="button"
                                onClick={handleResetToDefault}
                                disabled={saving}
                                className="self-start rounded-lg bg-wine px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-wine/90 disabled:opacity-50"
                            >
                                {UI_TEXT.lessonCompletionRuleSection.resetToDefaultBtn}
                            </button>
                        </div>
                    )}

                    {/* Blocks list */}
                    {blocks.length === 0 ? (
                        <p className="text-sm font-medium text-slate-500 italic">{UI_TEXT.lessonCompletionRuleSection.empty}</p>
                    ) : (
                        <div className="space-y-3">
                            {blocks.map((block) => {
                                const criteria = criteriaMap[block.id] || {};
                                const isReq = isRequiredMap[block.id] !== false;
                                const bType = (block.type || "").toUpperCase();

                                return (
                                    <div key={block.id} className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-800">{block.title || block.id}</span>
                                            <label className="flex cursor-pointer items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isReq}
                                                    onChange={() => toggleBlockIsRequired(block.id)}
                                                    className="size-4 cursor-pointer rounded accent-wine"
                                                />
                                            </label>
                                        </div>

                                        {bType === BlockTypeEnum.VIDEO && (
                                            <div className="grid grid-cols-2 gap-3 pt-1">
                                                <div>
                                                    <label className="text-[11px] font-medium text-slate-600">
                                                        {UI_TEXT.lessonCompletionRuleSection.minWatchPercentLabel}
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={100}
                                                        value={typeof criteria.minWatchPercent === "number" ? criteria.minWatchPercent : 0}
                                                        onChange={(e) => updateBlockCriteria(block.id, "minWatchPercent", Number(e.target.value))}
                                                        className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs font-bold"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2 pt-4">
                                                    <input
                                                        type="checkbox"
                                                        id={`sec-req-qs-${block.id}`}
                                                        checked={criteria.requireAllQuestionsCorrect !== false}
                                                        onChange={(e) => updateBlockCriteria(block.id, "requireAllQuestionsCorrect", e.target.checked)}
                                                        className="size-3.5 rounded accent-wine"
                                                    />
                                                    <label htmlFor={`sec-req-qs-${block.id}`} className="text-xs font-medium text-slate-700">
                                                        {UI_TEXT.lessonCompletionRuleSection.requireAllQuestionsCorrectLabel}
                                                    </label>
                                                </div>
                                            </div>
                                        )}

                                        {bType === BlockTypeEnum.QUIZ && (
                                            <div className="grid grid-cols-2 gap-3 pt-1">
                                                <div>
                                                    <label className="text-[11px] font-medium text-slate-600">
                                                        {UI_TEXT.lessonCompletionRuleSection.minScorePercentLabel}
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={FULL_PERCENT}
                                                        value={typeof criteria.minScorePercent === "number" ? criteria.minScorePercent : FULL_PERCENT}
                                                        onChange={(e) => updateBlockCriteria(block.id, "minScorePercent", Number(e.target.value))}
                                                        className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs font-bold"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[11px] font-medium text-slate-600">
                                                        {UI_TEXT.lessonCompletionRuleSection.maxAttemptsLabel}
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        value={criteria.maxAttempts != null ? Number(criteria.maxAttempts) : ""}
                                                        onChange={(e) =>
                                                            updateBlockCriteria(block.id, "maxAttempts", e.target.value ? Number(e.target.value) : null)
                                                        }
                                                        className="mt-1 w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs font-bold"
                                                        placeholder={UI_TEXT.lessonCompletionRuleSection.unlimitedPlaceholder}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
