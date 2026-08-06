"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Loader2, ShieldCheck } from "lucide-react";
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

interface LessonCompletionRuleSectionProps {
    lessonId: string;
    onIsDirtyChange?: (dirty: boolean) => void;
    onRegisterSave?: (saveFn: () => Promise<void>) => void;
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

export function LessonCompletionRuleSection({
    lessonId,
    onIsDirtyChange,
    onRegisterSave,
}: LessonCompletionRuleSectionProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [groups, setGroups] = useState<RuleGroupDraft[]>([createDefaultGroupDraft()]);
    const [initialGroups, setInitialGroups] = useState<RuleGroupDraft[]>([createDefaultGroupDraft()]);
    const [selectables, setSelectables] = useState<CompletionRuleSelectableItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [issues, setIssues] = useState<RuleIssue[]>([]);
    const [clientError, setClientError] = useState<string | null>(null);

    const availableKeys = useMemo(() => new Set(selectables.map((s) => s.key)), [selectables]);

    const isDirty = useMemo(
        () => JSON.stringify(groups) !== JSON.stringify(initialGroups),
        [groups, initialGroups]
    );

    useEffect(() => {
        onIsDirtyChange?.(isDirty);
    }, [isDirty, onIsDirtyChange]);

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
            const normalized = normalizeRuleFromApi(rule);
            setGroups(normalized);
            setInitialGroups(normalized);
        } catch (error) {
            toast.error("Lỗi tải điều kiện hoàn thành", extractErrorMessages(error));
            const def = [createDefaultGroupDraft()];
            setGroups(def);
            setInitialGroups(def);
            setSelectables([]);
        } finally {
            setLoading(false);
        }
    }, [lessonId]);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const saveRule = useCallback(async () => {
        const valError = validateDraftsForSubmit(groups);
        if (valError) {
            setClientError(valError);
            throw new Error(valError);
        }
        setClientError(null);
        setIssues([]);

        const payload = buildRulePayload(groups);
        try {
            await completionRuleService.setLessonRule(lessonId, payload);
            setInitialGroups(groups);
        } catch (error) {
            const iss = extractRuleIssues(error);
            setIssues(iss);
            const msg = extractErrorMessages(error);
            toast.error("Lỗi lưu điều kiện hoàn thành bài", msg);
            throw error;
        }
    }, [lessonId, groups]);

    useEffect(() => {
        onRegisterSave?.(saveRule);
    }, [saveRule, onRegisterSave]);

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

    const handlePrune = () => {
        const { drafts, removedCount } = pruneMissingItems(groups, availableKeys);
        setGroups(drafts);
        if (removedCount > 0) {
            toast.success("Dọn dẹp thành công", `Đã xóa ${removedCount} mục không còn tồn tại`);
        } else {
            toast.success("Thông báo", "Không có mục nào không còn tồn tại");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
                <Loader2 className="size-5 animate-spin text-slate-400" />
                <span className="ml-2 text-sm font-medium text-slate-500">Đang tải điều kiện hoàn thành bài...</span>
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
                    <h3 className="text-base font-bold text-slate-900">Điều kiện hoàn thành bài học</h3>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                        {groups.length} nhóm quy tắc
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {selectables.length > 0 && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handlePrune();
                            }}
                            className="text-xs font-bold text-slate-500 hover:text-slate-700"
                        >
                            Dọn mục không còn tồn tại
                        </button>
                    )}
                    {isExpanded ? <ChevronDown className="size-4 text-slate-400" /> : <ChevronRight className="size-4 text-slate-400" />}
                </div>
            </div>

            {/* Body */}
            {isExpanded && (
                <div className="space-y-4 p-4">
                    {clientError && (
                        <div className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-200">
                            {clientError}
                        </div>
                    )}

                    {selectables.length === 0 ? (
                        <p className="text-sm font-medium text-slate-500 italic">
                            Bài học này chưa có học liệu nào. Thêm học liệu vào bài để cấu hình điều kiện cụ thể.
                        </p>
                    ) : (
                        groups.map((group, index) => (
                            <div key={index} className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                        NHÓM {index + 1}
                                    </span>
                                    {groups.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => setGroups((prev) => prev.filter((_, i) => i !== index))}
                                            className="text-xs font-bold text-red-600 hover:underline"
                                        >
                                            Xóa nhóm
                                        </button>
                                    )}
                                </div>

                                {/* Operator selector */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-slate-600">Phép toán:</span>
                                    {(["ALL", "ANY", "AT_LEAST_N"] as RuleOperator[]).map((op) => (
                                        <button
                                            key={op}
                                            type="button"
                                            onClick={() => updateGroup(index, { operator: op })}
                                            className={`rounded-md px-2.5 py-1 text-xs font-bold transition ${
                                                group.operator === op
                                                    ? "bg-wine text-white"
                                                    : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                                            }`}
                                        >
                                            {op === "ALL" ? "Tất cả" : op === "ANY" ? "Bất kỳ" : "Ít nhất N"}
                                        </button>
                                    ))}
                                    {group.operator === "AT_LEAST_N" && (
                                        <input
                                            type="number"
                                            min={1}
                                            value={group.n || 1}
                                            onChange={(e) => updateGroup(index, { n: parseInt(e.target.value, 10) || 1 })}
                                            className="w-16 rounded-md border border-slate-300 px-2 py-0.5 text-xs font-bold text-slate-800"
                                        />
                                    )}
                                </div>

                                {/* Scope Mode selector */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-slate-600">Phạm vi mục:</span>
                                    {[
                                        { mode: "ALL_REQUIRED", label: "Tất cả mục bắt buộc" },
                                        { mode: "CATEGORY", label: "Chọn cụ thể" },
                                        { mode: "NONE", label: "Không điều kiện" },
                                    ].map(({ mode, label }) => (
                                        <button
                                            key={mode}
                                            type="button"
                                            onClick={() => updateGroup(index, { scopeMode: mode as RuleItemScopeMode })}
                                            className={`rounded-md px-2.5 py-1 text-xs font-bold transition ${
                                                group.scopeMode === mode
                                                    ? "bg-slate-800 text-white"
                                                    : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>

                                {/* Items Checkbox list for CATEGORY */}
                                {group.scopeMode === "CATEGORY" && (
                                    <div className="space-y-1.5 pt-1">
                                        <span className="text-xs font-semibold text-slate-700">Chọn học liệu trong bài:</span>
                                        <div className="max-h-48 overflow-y-auto rounded-md border border-slate-200 bg-white p-2 space-y-1">
                                            {selectables.map((item) => (
                                                <label
                                                    key={item.key}
                                                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs hover:bg-slate-50"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={group.selectedKeys.includes(item.key)}
                                                        onChange={() => toggleItem(index, item.key)}
                                                        className="accent-wine size-3.5"
                                                    />
                                                    <span className="font-semibold text-slate-800">{item.label}</span>
                                                    <span className="text-slate-400">({item.blockType})</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Server Issues */}
                                {issues
                                    .filter((i) => i.groupIndex === index)
                                    .map((issue, iIdx) => (
                                        <p key={iIdx} className="text-xs font-semibold text-red-600">
                                            {issue.message}
                                        </p>
                                    ))}
                            </div>
                        ))
                    )}

                    <button
                        type="button"
                        onClick={() => setGroups((prev) => [...prev, createDefaultGroupDraft()])}
                        className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-md border border-dashed border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-wine hover:text-wine"
                    >
                        + Thêm nhóm điều kiện
                    </button>
                </div>
            )}
        </div>
    );
}
