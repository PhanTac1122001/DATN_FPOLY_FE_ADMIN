"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckSquare, Loader2, Plus, ShieldCheck, Square, Trash2, X } from "lucide-react";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { HttpError } from "@/lib/http-client";
import { completionRuleService } from "@/services/completion-rule.service";
import { coursewareService } from "@/services/courseware.service";
import { toast } from "@/services/toast.service";
import type {
    CompletionRuleSelectableItem,
    RuleGroupDraft,
    RuleIssue,
    RuleItemScopeMode,
    RuleOperator,
} from "@/types/completion-rule.types";
import {
    buildLessonSelectableItems,
    buildRulePayload,
    createDefaultGroupDraft,
    normalizeRuleFromApi,
    pruneMissingItems,
    validateDraftsForSubmit,
} from "@/utils/completion-rule.utils";

interface LessonCompletionRuleModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    lessonId: string;
    lessonName: string;
}

function extractRuleIssues(error: unknown): RuleIssue[] {
    if (!(error instanceof HttpError) || !error.payload || typeof error.payload !== "object") {
        return [];
    }
    const issues = (error.payload as { issues?: unknown }).issues;
    return Array.isArray(issues) ? (issues as RuleIssue[]) : [];
}

function extractErrorMessages(error: unknown): string {
    if (!(error instanceof HttpError)) {
        return error instanceof Error ? error.message : "Lỗi lưu điều kiện hoàn thành";
    }
    const payload = error.payload as { message?: string | string[] } | undefined;
    const msg = payload?.message;
    if (Array.isArray(msg)) return msg.join(", ");
    if (typeof msg === "string") return msg;
    return error.message || "Lỗi lưu điều kiện hoàn thành";
}

export function LessonCompletionRuleModal({
    isOpen,
    onOpenChange,
    lessonId,
    lessonName,
}: LessonCompletionRuleModalProps) {
    const [groups, setGroups] = useState<RuleGroupDraft[]>([createDefaultGroupDraft()]);
    const [selectables, setSelectables] = useState<CompletionRuleSelectableItem[]>([]);
    const [criteriaMap, setCriteriaMap] = useState<Record<string, Record<string, unknown>>>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [issues, setIssues] = useState<RuleIssue[]>([]);
    const [clientError, setClientError] = useState<string | null>(null);

    const availableKeys = useMemo(() => new Set(selectables.map((s) => s.key)), [selectables]);

    const updateBlockCriteria = (blockId: string, key: string, value: unknown) => {
        setCriteriaMap((prev) => ({
            ...prev,
            [blockId]: {
                ...(prev[blockId] || {}),
                [key]: value,
            },
        }));
        setClientError(null);
    };

    const loadData = useCallback(async () => {
        if (!lessonId) return;
        setLoading(true);
        setIssues([]);
        setClientError(null);
        try {
            const [rule, blocks] = await Promise.all([
                completionRuleService.getLessonRule(lessonId),
                coursewareService.getLessonBlocks(lessonId).catch(() => []),
            ]);
            const items = buildLessonSelectableItems(blocks);
            setSelectables(items);
            const initCriteria: Record<string, Record<string, unknown>> = {};
            items.forEach((item) => {
                initCriteria[item.id] = item.completionCriteria || {};
            });
            setCriteriaMap(initCriteria);
            setGroups(normalizeRuleFromApi(rule));
        } catch (error) {
            toast.error("Lỗi tải điều kiện hoàn thành", extractErrorMessages(error));
            setGroups([createDefaultGroupDraft()]);
            setSelectables([]);
            setCriteriaMap({});
        } finally {
            setLoading(false);
        }
    }, [lessonId]);

    useEffect(() => {
        if (isOpen && lessonId) {
            void loadData();
        }
    }, [isOpen, lessonId, loadData]);

    const updateGroup = (index: number, patch: Partial<RuleGroupDraft>) => {
        setGroups((prev) => prev.map((g, i) => (i === index ? { ...g, ...patch } : g)));
        setIssues([]);
        setClientError(null);
    };

    const toggleItem = (index: number, key: string) => {
        setGroups((prev) =>
            prev.map((g, i) => {
                if (i !== index) return g;
                const selected = g.selectedKeys.includes(key)
                    ? g.selectedKeys.filter((k) => k !== key)
                    : [...g.selectedKeys, key];
                return { ...g, selectedKeys: selected };
            })
        );
        setIssues([]);
        setClientError(null);
    };

    const handleSelectAll = (groupIndex: number) => {
        const allKeys = selectables.map((i) => i.key);
        setGroups((prev) =>
            prev.map((g, i) => (i === groupIndex ? { ...g, selectedKeys: Array.from(new Set([...g.selectedKeys, ...allKeys])) } : g))
        );
        setIssues([]);
        setClientError(null);
    };

    const handleDeselectAll = (groupIndex: number) => {
        setGroups((prev) => prev.map((g, i) => (i === groupIndex ? { ...g, selectedKeys: [] } : g)));
        setIssues([]);
        setClientError(null);
    };

    const handlePrune = () => {
        const { drafts, removedCount } = pruneMissingItems(groups, availableKeys);
        setGroups(drafts);
        if (removedCount > 0) {
            toast.success("Dọn dẹp thành công", `Đã xóa ${removedCount} mục không còn tồn tại`);
        } else {
            toast.success("Thông báo", "Không có mục nào không còn tồn tại");
        }
    };

    const handleSave = async () => {
        if (!lessonId) return;
        const valError = validateDraftsForSubmit(groups);
        if (valError) {
            setClientError(valError);
            return;
        }
        setClientError(null);
        setIssues([]);
        setSaving(true);

        try {
            // 1. Save Level 1 criteria for real content blocks
            await Promise.all(
                selectables.map((item) => {
                    const criteria = criteriaMap[item.id];
                    if (criteria && item.kind === "BLOCK") {
                        return coursewareService.updateBlock(item.id, { completionCriteria: criteria });
                    }
                    return Promise.resolve();
                })
            );

            // 2. Save Level 2 lesson completion rule via PUT /api/staff/lessons/{lessonId}/completion-rule
            const payload = buildRulePayload(groups);
            await completionRuleService.setLessonRule(lessonId, payload);
            toast.success("Thành công", "Đã cập nhật điều kiện hoàn thành bài học");
            onOpenChange(false);
        } catch (error) {
            const iss = extractRuleIssues(error);
            if (iss.length > 0) {
                setIssues(iss);
                toast.error("Lỗi lưu điều kiện hoàn thành", iss.map((i) => i.message).join(" · "));
            } else {
                toast.error("Lỗi lưu điều kiện hoàn thành", extractErrorMessages(error));
            }
        } finally {
            setSaving(false);
        }
    };

    const groupHasIssue = (groupIndex: number) => issues.some((i) => i.groupIndex === groupIndex && !i.itemKey);
    const itemHasIssue = (groupIndex: number, key: string) =>
        issues.some((i) => i.groupIndex === groupIndex && i.itemKey === key);

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
                    <div className="pr-8 flex flex-col gap-1">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-wine/10 text-wine">
                                <ShieldCheck className="size-5" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">
                                Điều kiện hoàn thành bài học
                            </h3>
                        </div>
                        <p className="text-xs font-semibold text-slate-600">
                            Bài học này được tính là hoàn thành khi — <strong className="text-wine font-extrabold">{lessonName}</strong>
                        </p>
                    </div>

                    {/* Body */}
                    <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
                        {loading ? (
                            <div className="flex flex-1 items-center justify-center py-16 text-slate-400">
                                <Loader2 className="size-7 animate-spin text-wine" />
                                <span className="ml-2.5 text-sm font-medium text-slate-600">Đang tải điều kiện hoàn thành...</span>
                            </div>
                        ) : (
                            <>
                                {clientError && (
                                    <div className="rounded-xl bg-red-50 p-3.5 text-xs font-semibold text-red-600 border border-red-200">
                                        {clientError}
                                    </div>
                                )}

                                {/* Section 1: Block Level Criteria */}
                                {selectables.length > 0 && (
                                    <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3.5 shadow-2xs">
                                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-wine">
                                            TẦNG 1 — ĐIỀU KIỆN HOÀN THÀNH TỪNG HỌC LIỆU
                                        </h4>
                                        <div className="space-y-3">
                                            {selectables.map((item) => {
                                                const criteria = criteriaMap[item.id] || {};
                                                const bType = (item.blockType || item.kind || "").toUpperCase();

                                                return (
                                                    <div key={item.key} className="rounded-xl border border-slate-150 bg-slate-50/60 p-3.5 space-y-2.5">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-extrabold text-slate-800">{item.label}</span>
                                                            <span className="rounded-md bg-slate-200/80 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
                                                                {bType}
                                                            </span>
                                                        </div>

                                                        {bType === "VIDEO" && (
                                                            <div className="grid grid-cols-2 gap-3 pt-1">
                                                                <div>
                                                                    <label className="text-[11px] font-semibold text-slate-600">Phải xem tối thiểu (%)</label>
                                                                    <input
                                                                        type="number"
                                                                        min={0}
                                                                        max={100}
                                                                        value={typeof criteria.minWatchPercent === "number" ? criteria.minWatchPercent : 0}
                                                                        onChange={(e) => updateBlockCriteria(item.id, "minWatchPercent", Number(e.target.value))}
                                                                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold focus:border-wine focus:outline-none bg-white"
                                                                    />
                                                                </div>
                                                                <div className="flex items-center gap-2 pt-4">
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`req-qs-${item.id}`}
                                                                        checked={criteria.requireAllQuestionsCorrect !== false}
                                                                        onChange={(e) => updateBlockCriteria(item.id, "requireAllQuestionsCorrect", e.target.checked)}
                                                                        className="size-4 accent-wine rounded"
                                                                    />
                                                                    <label htmlFor={`req-qs-${item.id}`} className="text-xs font-semibold text-slate-700 cursor-pointer">
                                                                        Đúng tất cả câu hỏi trong video
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {bType === "READING" && (
                                                            <div className="flex flex-col gap-2 pt-1">
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`req-rd-${item.id}`}
                                                                        checked={criteria.requireAllQuestionsAnswered !== false}
                                                                        onChange={(e) => updateBlockCriteria(item.id, "requireAllQuestionsAnswered", e.target.checked)}
                                                                        className="size-4 accent-wine rounded"
                                                                    />
                                                                    <label htmlFor={`req-rd-${item.id}`} className="text-xs font-semibold text-slate-700 cursor-pointer">
                                                                        Trả lời hết tất cả câu hỏi trong bài đọc
                                                                    </label>
                                                                </div>
                                                                <div className="flex items-center gap-2 opacity-60">
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`ai-rv-${item.id}`}
                                                                        disabled
                                                                        checked={false}
                                                                        className="size-4 rounded cursor-not-allowed"
                                                                    />
                                                                    <label htmlFor={`ai-rv-${item.id}`} className="text-xs font-semibold text-slate-500 cursor-not-allowed">
                                                                        Chấm bài đọc bằng AI
                                                                    </label>
                                                                    <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                                                                        Chưa khả dụng
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {bType === "QUIZ" && (
                                                            <div className="grid grid-cols-2 gap-3 pt-1">
                                                                <div>
                                                                    <label className="text-[11px] font-semibold text-slate-600">Điểm tối thiểu (%)</label>
                                                                    <input
                                                                        type="number"
                                                                        min={0}
                                                                        max={100}
                                                                        value={typeof criteria.minScorePercent === "number" ? criteria.minScorePercent : 100}
                                                                        onChange={(e) => updateBlockCriteria(item.id, "minScorePercent", Number(e.target.value))}
                                                                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold focus:border-wine focus:outline-none bg-white"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="text-[11px] font-semibold text-slate-600">Số lượt làm tối đa (trống = KH)</label>
                                                                    <input
                                                                        type="number"
                                                                        min={1}
                                                                        value={criteria.maxAttempts != null ? Number(criteria.maxAttempts) : ""}
                                                                        onChange={(e) => updateBlockCriteria(item.id, "maxAttempts", e.target.value ? Number(e.target.value) : null)}
                                                                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold focus:border-wine focus:outline-none bg-white"
                                                                        placeholder="Không giới hạn"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Section 2: Rule Groups */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-wine">
                                        TẦNG 2 — QUY TẮC HOÀN THÀNH BÀI HỌC
                                    </h4>

                                    {groups.map((group, index) => (
                                        <div
                                            key={index}
                                            className={`flex flex-col gap-3.5 rounded-2xl border p-4.5 ${
                                                groupHasIssue(index) ? "border-red-400 bg-red-50/40" : "border-slate-200 bg-slate-50/60"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-extrabold tracking-wider text-wine uppercase">
                                                    NHÓM {index + 1}
                                                </span>
                                                {groups.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setGroups((prev) => prev.filter((_, i) => i !== index))}
                                                        className="cursor-pointer p-1 text-red-400 hover:text-red-600"
                                                        title="Xóa nhóm"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Operator Selector */}
                                            <div className="flex flex-col gap-2.5 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
                                                <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">PHÉP TOÁN:</span>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {(["ALL", "ANY", "AT_LEAST_N"] as RuleOperator[]).map((op) => (
                                                        <button
                                                            key={op}
                                                            type="button"
                                                            onClick={() => updateGroup(index, { operator: op })}
                                                            className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold transition ${
                                                                group.operator === op
                                                                    ? "bg-wine text-white shadow-xs"
                                                                    : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                                                            }`}
                                                        >
                                                            {op === "ALL" ? "Tất cả" : op === "ANY" ? "Bất kỳ" : "Ít nhất N"}
                                                        </button>
                                                    ))}
                                                    {group.operator === "AT_LEAST_N" && (
                                                        <div className="flex items-center gap-1.5 pl-1">
                                                            <span className="text-xs font-bold text-slate-500">Số N:</span>
                                                            <input
                                                                type="number"
                                                                min={1}
                                                                value={group.n || 1}
                                                                onChange={(e) => updateGroup(index, { n: parseInt(e.target.value, 10) || 1 })}
                                                                className="w-16 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold outline-none focus:border-wine"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Scope Mode Selector */}
                                            <div className="flex flex-col gap-2.5 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
                                                <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">PHẠM VI MỤC:</span>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {[
                                                        { mode: "ALL_REQUIRED", label: "Tất cả mục bắt buộc trong bài" },
                                                        { mode: "CATEGORY", label: "Chọn học liệu cụ thể" },
                                                        { mode: "NONE", label: "Không điều kiện" },
                                                    ].map(({ mode, label }) => (
                                                        <button
                                                            key={mode}
                                                            type="button"
                                                            onClick={() => updateGroup(index, { scopeMode: mode as RuleItemScopeMode })}
                                                            className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold transition ${
                                                                group.scopeMode === mode
                                                                    ? "bg-wine text-white shadow-xs"
                                                                    : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                                                            }`}
                                                        >
                                                            {label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Checkbox list for CATEGORY mode */}
                                            {group.scopeMode === "CATEGORY" && (
                                                <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-bold text-slate-700">Danh sách học liệu bài học:</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-medium text-slate-500">
                                                                Đã chọn: {group.selectedKeys.length}/{selectables.length} mục
                                                            </span>
                                                            {selectables.length > 0 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        group.selectedKeys.length === selectables.length
                                                                            ? handleDeselectAll(index)
                                                                            : handleSelectAll(index)
                                                                    }
                                                                    className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200"
                                                                >
                                                                    {group.selectedKeys.length === selectables.length ? (
                                                                        <>
                                                                            <Square className="size-3 text-slate-500" />
                                                                            <span>Bỏ chọn</span>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <CheckSquare className="size-3 text-wine" />
                                                                            <span>Chọn tất cả</span>
                                                                        </>
                                                                    )}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {selectables.length === 0 ? (
                                                        <p className="text-xs italic text-slate-500">
                                                            Bài học chưa có học liệu nào. Hãy thêm học liệu vào bài trước.
                                                        </p>
                                                    ) : (
                                                        <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 space-y-1">
                                                            {selectables.map((item) => {
                                                                const isChecked = group.selectedKeys.includes(item.key);
                                                                return (
                                                                    <label
                                                                        key={item.key}
                                                                        className={`flex cursor-pointer items-center gap-2.5 rounded-lg p-2 text-xs font-medium transition ${
                                                                            itemHasIssue(index, item.key)
                                                                                ? "bg-red-50 text-red-700"
                                                                                : isChecked
                                                                                ? "bg-wine/5 border border-wine/20"
                                                                                : "hover:bg-slate-50"
                                                                        }`}
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isChecked}
                                                                            onChange={() => toggleItem(index, item.key)}
                                                                            className="accent-wine size-4 rounded cursor-pointer"
                                                                        />
                                                                        <span className="flex-1 font-semibold text-slate-800">{item.label}</span>
                                                                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                                                                            {item.blockType || item.kind}
                                                                        </span>
                                                                    </label>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Issues */}
                                            {issues
                                                .filter((i) => i.groupIndex === index)
                                                .map((issue, iIdx) => (
                                                    <p key={iIdx} className="text-xs font-semibold text-red-600">
                                                        {issue.message}
                                                    </p>
                                                ))}
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={() => setGroups((prev) => [...prev, createDefaultGroupDraft()])}
                                        className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border border-dashed border-slate-300 px-4.5 py-2 text-xs font-bold text-slate-600 hover:border-wine hover:text-wine"
                                    >
                                        <Plus className="size-4" />
                                        Thêm nhóm điều kiện
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 pt-3.5 bg-white">
                        <button
                            type="button"
                            onClick={handlePrune}
                            disabled={loading || saving}
                            className="cursor-pointer rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                        >
                            Dọn mục không còn tồn tại
                        </button>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => onOpenChange(false)}
                                className="cursor-pointer rounded-full border border-slate-200 px-5.5 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                disabled={saving || loading}
                                onClick={handleSave}
                                className="flex cursor-pointer items-center gap-2 rounded-full bg-wine px-6 py-2 text-sm font-bold text-white shadow-xs hover:bg-wine/90 disabled:opacity-50"
                            >
                                {saving && <Loader2 className="size-4 animate-spin" />}
                                Lưu điều kiện
                            </button>
                        </div>
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}

