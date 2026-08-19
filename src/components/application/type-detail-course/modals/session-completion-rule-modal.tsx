import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, CheckSquare, ChevronRight, Layers, Loader2, Map, Plus, ShieldAlert, X } from "lucide-react";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { BlockTypeEnum } from "@/constants/application.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { completionRuleService } from "@/services/completion-rule.service";
import { coursewareService } from "@/services/courseware.service";
import { getLessonsBySession } from "@/services/material.service";
import { toast } from "@/services/toast.service";
import type { CoursewareBlockEntity, RuleGroupDraft, SessionCompletionRuleModalProps } from "@/types/completion-rule.types";
import { RuleOperatorEnum } from "@/types/completion-rule.types";
import { createDefaultGroupDraft, normalizeRuleFromApi } from "@/utils/completion-rule.utils";
import { extractErrorMessages } from "@/utils/http-error-message.utils";
import { LessonSelectModal } from "./lesson-select-modal";

const t = UI_TEXT.sessionCompletionRuleModal;

export function SessionCompletionRuleModal({
    isOpen,
    onOpenChange,
    sessionId,
    sessionName,
    sessions,
    onBackToSessionSelect,
    onSelectLessonForRule,
}: SessionCompletionRuleModalProps) {
    const queryClient = useQueryClient();
    const [isCustomRule, setIsCustomRule] = useState(false);
    const [_groups, setGroups] = useState<RuleGroupDraft[]>([createDefaultGroupDraft()]);
    const [blocks, setBlocks] = useState<CoursewareBlockEntity[]>([]);
    const [initialBlocks, setInitialBlocks] = useState<CoursewareBlockEntity[]>([]);
    const [lessons, setLessons] = useState<Array<{ id: string; name: string }>>([]);
    const [isLessonSelectModalOpen, setIsLessonSelectModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const activeSessionName = useMemo(() => {
        if (sessions && sessionId) {
            const found = sessions.find((s) => s.id === sessionId);
            if (found) return found.name;
        }
        return sessionName;
    }, [sessions, sessionId, sessionName]);

    const mindmapSubmissionBlock = useMemo(() => blocks.find((b) => b.type === BlockTypeEnum.MINDMAP_SUBMISSION), [blocks]);

    const practiceBlocks = useMemo(
        () => blocks.filter((b) => b.type === BlockTypeEnum.PRACTICE || b.type === BlockTypeEnum.ASSIGNMENT || b.type === BlockTypeEnum.HOMEWORK),
        [blocks],
    );

    const load = useCallback(async () => {
        if (!sessionId) return;
        setLoading(true);
        try {
            const [rule, sessionBlocks, sessionLessons] = await Promise.all([
                completionRuleService.getSessionRule(sessionId).catch(() => null),
                coursewareService.getSessionBlocks(sessionId).catch(() => []),
                getLessonsBySession(sessionId).catch(() => []),
            ]);
            setBlocks(sessionBlocks);
            setInitialBlocks(sessionBlocks);
            setLessons(sessionLessons);

            const isCustom = Boolean(
                rule &&
                rule.groups &&
                (rule.groups.length > 1 ||
                    (rule.groups.length === 1 &&
                        (rule.groups[0].operator !== RuleOperatorEnum.ALL || (rule.groups[0].items && rule.groups[0].items.length > 0)))),
            );
            setIsCustomRule(isCustom);
            setGroups(normalizeRuleFromApi(rule));
        } catch (error) {
            toast.error(t.toastLoadErrorTitle, extractErrorMessages(error));
            setIsCustomRule(false);
            setGroups([createDefaultGroupDraft()]);
            setBlocks([]);
            setInitialBlocks([]);
            setLessons([]);
        } finally {
            setLoading(false);
        }
    }, [sessionId]);

    useEffect(() => {
        if (isOpen && sessionId) {
            void load();
        }
    }, [isOpen, sessionId, load]);

    const handleResetToDefault = async () => {
        if (!sessionId) return;
        setSaving(true);
        try {
            const defaultPayload = { groups: [{ operator: "ALL" as const }] };
            const saved = await completionRuleService.setSessionRule(sessionId, defaultPayload);
            setIsCustomRule(false);
            setGroups(normalizeRuleFromApi(saved));
            toast.success(UI_TEXT.common.successTitle, t.toastResetSuccess);
        } catch (error) {
            toast.error(t.toastSaveErrorTitle, extractErrorMessages(error));
        } finally {
            setSaving(false);
        }
    };

    const handleToggleBlockRequired = (blockId: string, currentIsRequired: boolean) => {
        setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, isRequired: !currentIsRequired } : b)));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const modifiedBlocks = blocks.filter((b) => {
                const init = initialBlocks.find((ib) => ib.id === b.id);
                return init ? init.isRequired !== b.isRequired : true;
            });

            if (modifiedBlocks.length > 0) {
                await Promise.all(modifiedBlocks.map((b) => coursewareService.updateBlock(b.id, { isRequired: b.isRequired })));
            }

            queryClient.invalidateQueries({ queryKey: ["session-blocks"] });
            queryClient.invalidateQueries({ queryKey: ["sessions"] });
            queryClient.invalidateQueries({ queryKey: ["session-rule"] });

            toast.success(UI_TEXT.common.successTitle, t.toastSaveSuccess || "Đã lưu điều kiện hoàn thành buổi thành công");
            onOpenChange(false);
        } catch (error) {
            toast.error(UI_TEXT.common.errorTitle, extractErrorMessages(error));
        } finally {
            setSaving(false);
        }
    };

    const _handleDeleteBlock = async (blockId: string) => {
        try {
            await coursewareService.deleteBlock(blockId);
            setBlocks((prev) => prev.filter((b) => b.id !== blockId));
            toast.success(UI_TEXT.common.successTitle, t.toastDeleteSuccess);
        } catch (error) {
            toast.error(UI_TEXT.common.errorTitle, extractErrorMessages(error));
        }
    };

    const handleCreateMindmapSubmissionBlock = async () => {
        if (!sessionId) return;
        try {
            const newBlock = await coursewareService.createSessionBlock(sessionId, {
                type: BlockTypeEnum.MINDMAP_SUBMISSION,
                title: t.mindmapBlockTitle,
                isRequired: true,
                payload: {},
            });
            setBlocks((prev) => [...prev, newBlock]);
            toast.success(UI_TEXT.common.successTitle, t.toastCreateMindmapSuccess);
        } catch (error) {
            toast.error(t.toastCreateMindmapErrorTitle, extractErrorMessages(error));
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

                    <div className="flex flex-col gap-1.5 border-b border-slate-100 pr-8 pb-4">
                        <div className="flex items-center gap-2.5">
                            {onBackToSessionSelect && (
                                <button
                                    type="button"
                                    onClick={onBackToSessionSelect}
                                    className="flex size-8 cursor-pointer items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                                    title={t.backToSessionListTooltip}
                                >
                                    <ArrowLeft className="size-4.5" />
                                </button>
                            )}
                            <ShieldAlert className="size-6 text-wine" />
                            <h3 className="text-lg font-bold text-slate-900">{t.title}</h3>
                        </div>
                        <p className="text-sm font-semibold text-slate-600">
                            {t.subtitle}
                            {activeSessionName ? ` — ${activeSessionName}` : ""}
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex flex-1 items-center justify-center py-16 text-slate-400">
                            <Loader2 className="size-7 animate-spin" />
                        </div>
                    ) : (
                        <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pr-1">
                            {isCustomRule ? (
                                <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-5">
                                    <div className="flex items-center gap-2 text-sm font-bold text-amber-900">
                                        <ShieldAlert className="size-5 shrink-0 text-amber-600" />
                                        <span>{t.customRuleTitle}</span>
                                    </div>
                                    <p className="text-xs leading-relaxed font-medium text-amber-800">{t.customRuleNotice}</p>
                                    <div className="pt-1">
                                        <button
                                            type="button"
                                            onClick={handleResetToDefault}
                                            disabled={saving}
                                            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-wine px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-wine/90 disabled:opacity-50"
                                        >
                                            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <CheckSquare className="size-3.5" />}
                                            <span>{t.resetToDefaultBtn}</span>
                                        </button>
                                    </div>
                                </div>
                            ) : null}

                            {/* Section 1: Cổng nộp Mindmap cấp buổi */}
                            <div className="flex flex-col gap-3 rounded-2xl border border-pink-200 bg-pink-50/40 p-4.5">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 text-sm font-bold text-pink-950">
                                        <Map className="size-4 shrink-0 text-pink-600" />
                                        <span>{t.mindmapSectionTitle}</span>
                                    </div>
                                    {mindmapSubmissionBlock ? (
                                        <span
                                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                                mindmapSubmissionBlock.isRequired
                                                    ? "border border-red-200 bg-red-50 text-red-700"
                                                    : "border border-slate-200 bg-slate-100 text-slate-600"
                                            }`}
                                        >
                                            {mindmapSubmissionBlock.isRequired ? t.mindmapRequiredBadge : t.mindmapOptionalBadge}
                                        </span>
                                    ) : (
                                        <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                                            {t.mindmapNotCreatedBadge}
                                        </span>
                                    )}
                                </div>

                                {mindmapSubmissionBlock ? (
                                    <div className="flex items-center justify-between gap-3 pt-1">
                                        <p className="text-xs font-medium text-slate-600">{t.mindmapNoticeActive}</p>
                                        <label className="flex shrink-0 cursor-pointer items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900">
                                            <input
                                                type="checkbox"
                                                checked={mindmapSubmissionBlock.isRequired}
                                                onChange={() => handleToggleBlockRequired(mindmapSubmissionBlock.id, mindmapSubmissionBlock.isRequired)}
                                                className="size-4 cursor-pointer rounded accent-wine"
                                            />
                                            <span>{t.required}</span>
                                        </label>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between gap-3 pt-1">
                                        <p className="text-xs font-medium text-slate-500">{t.mindmapNoticeInactive}</p>
                                        <button
                                            type="button"
                                            onClick={handleCreateMindmapSubmissionBlock}
                                            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-pink-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-pink-700"
                                        >
                                            <Plus className="size-3.5" />
                                            <span>{t.mindmapEnableBtn}</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Section 2: Học liệu Bài tập thực hành cấp buổi */}
                            <div className="flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50/40 p-4.5">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 text-sm font-bold text-blue-950">
                                        <Layers className="size-4 shrink-0 text-blue-600" />
                                        <span>{t.practiceSectionTitle}</span>
                                    </div>
                                </div>

                                {practiceBlocks.length === 0 ? (
                                    <p className="py-1 text-xs text-slate-500 italic">{t.noPracticeEmpty}</p>
                                ) : (
                                    <div className="flex flex-col gap-2 pt-1">
                                        {practiceBlocks.map((b) => (
                                            <div
                                                key={b.id}
                                                className="flex items-center justify-between rounded-xl border border-blue-100 bg-white p-3 text-xs font-semibold text-slate-800 shadow-2xs"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <span className="font-extrabold text-slate-900">{b.title}</span>
                                                    {b.isRequired ? (
                                                        <span className="rounded-md border border-red-100 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">
                                                            {t.practiceRequiredBadge}
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                                                            {t.practiceOptionalBadge}
                                                        </span>
                                                    )}
                                                </div>

                                                <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900">
                                                    <input
                                                        type="checkbox"
                                                        checked={b.isRequired}
                                                        onChange={() => handleToggleBlockRequired(b.id, b.isRequired)}
                                                        className="size-4 cursor-pointer rounded accent-wine"
                                                    />
                                                    <span>{t.required}</span>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Section 3: Cấu hình điều kiện từng bài học (Lesson) */}
                            <div className="flex flex-col gap-3 rounded-2xl border border-purple-200 bg-purple-50/40 p-4.5">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 text-sm font-bold text-purple-950">
                                        <BookOpen className="size-4 shrink-0 text-purple-600" />
                                        <span>{t.lessonSectionTitle}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsLessonSelectModalOpen(true)}
                                        className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-extrabold text-white shadow-xs transition hover:bg-purple-700"
                                    >
                                        <span>{t.configureLessonRuleBtn}</span>
                                        <ChevronRight className="size-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-2 flex w-full shrink-0 items-center gap-3 border-t border-slate-100 bg-white pt-4">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="w-1/3 cursor-pointer rounded-full border border-slate-200 bg-white py-3 text-center text-xs font-bold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
                        >
                            {t.cancelBtn}
                        </button>
                        <button
                            type="button"
                            disabled={loading || saving}
                            onClick={handleSave}
                            className="hover:bg-wine-hover flex w-2/3 cursor-pointer items-center justify-center gap-2 rounded-full border-none bg-wine py-3 text-center text-xs font-black text-white shadow-sm transition active:scale-[0.98] disabled:opacity-50"
                        >
                            {saving && <Loader2 className="size-4 animate-spin" />}
                            <span>{t.saveDefaultBtn}</span>
                        </button>
                    </div>
                </Dialog>
            </CustomModal.Content>

            <LessonSelectModal
                isOpen={isLessonSelectModalOpen}
                onOpenChange={setIsLessonSelectModalOpen}
                sessionName={activeSessionName}
                lessons={lessons}
                onSelectLesson={(lesson) => {
                    setIsLessonSelectModalOpen(false);
                    onOpenChange(false);
                    onSelectLessonForRule?.({ id: lesson.id, name: lesson.name });
                }}
            />
        </CustomModal.Root>
    );
}
