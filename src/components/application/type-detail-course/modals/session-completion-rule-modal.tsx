import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpen, CheckSquare, FileCode, Layers, Loader2, Plus, ShieldAlert, Square, Trash2, X } from "lucide-react";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { HttpError } from "@/lib/http-client";
import { completionRuleService } from "@/services/completion-rule.service";
import { coursewareService } from "@/services/courseware.service";
import { getHomeworkBySession } from "@/services/homework.service";
import { getLessonsBySession, getSessionById } from "@/services/material.service";
import { toast } from "@/services/toast.service";
import type {
    CompletionRuleSelectableItem,
    RuleGroupDraft,
    RuleIssue,
    RuleItemScopeMode,
    RuleOperator,
    SessionCompletionRuleModalProps,
} from "@/types/completion-rule.types";
import {
    buildRulePayload,
    buildSessionSelectableItems,
    createDefaultGroupDraft,
    getItemCategory,
    normalizeRuleFromApi,
    pruneMissingItems,
    validateDraftsForSubmit,
} from "@/utils/completion-rule.utils";

const T = UI_TEXT.sessionCompletionRuleModal;

function extractRuleIssues(error: unknown): RuleIssue[] {
    if (!(error instanceof HttpError) || !error.payload || typeof error.payload !== "object") {
        return [];
    }
    const issues = (error.payload as { issues?: unknown }).issues;
    return Array.isArray(issues) ? (issues as RuleIssue[]) : [];
}

function extractErrorMessages(error: unknown): string {
    if (!(error instanceof HttpError)) {
        return error instanceof Error ? error.message : T.toastSaveError;
    }
    const payload = error.payload as { message?: string | string[] } | undefined;
    const msg = payload?.message;
    if (Array.isArray(msg)) return msg.join(", ");
    if (typeof msg === "string") return msg;
    return error.message || T.toastSaveError;
}

function getItemBadgeDetails(item: CompletionRuleSelectableItem): { badge: string; badgeClass: string } {
    if (item.kind === "LESSON") {
        return { badge: "Lesson", badgeClass: "bg-blue-50 text-blue-700 border border-blue-200" };
    }
    const type = (item.blockType || "").toUpperCase();
    const label = (item.label || "").toUpperCase();
    if (type === "MINDMAP" || label.includes("MINDMAP")) {
        return { badge: "Mindmap", badgeClass: "bg-pink-50 text-pink-700 border border-pink-200" };
    }
    if (type === "SRS" || label.includes("SRS")) {
        return { badge: "SRS", badgeClass: "bg-indigo-50 text-indigo-700 border border-indigo-200" };
    }
    if (type === "MINI_PROJECT" || label.includes("MINI PROJECT") || label.includes("MINIPROJECT")) {
        return { badge: "Mini Project", badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200" };
    }
    if (type === "PDF" || label.includes("PDF")) {
        return { badge: "PDF", badgeClass: "bg-rose-50 text-rose-700 border border-rose-200" };
    }
    if (type === "ENTRANCE_QUIZ" || item.id === "session_entrance_quiz" || label.includes("ĐẦU VÀO")) {
        return { badge: "Quiz đầu vào", badgeClass: "bg-amber-50 text-amber-700 border border-amber-200" };
    }
    if (type === "PRACTICE" || type === "ASSIGNMENT" || label.includes("THỰC HÀNH")) {
        return { badge: "Bài tập thực hành", badgeClass: "bg-purple-50 text-purple-700 border border-purple-200" };
    }
    if (type === "HOMEWORK" || type === "EXERCISE" || label.includes("BÀI TẬP")) {
        return { badge: "Bài tập về nhà", badgeClass: "bg-violet-50 text-violet-700 border border-violet-200" };
    }
    return { badge: item.label || "Học liệu", badgeClass: "bg-amber-50 text-amber-700 border border-amber-200" };
}

export function SessionCompletionRuleModal({
    isOpen,
    onOpenChange,
    sessionId,
    sessionName,
    sessions,
    onBackToSessionSelect,
}: SessionCompletionRuleModalProps) {
    const [groups, setGroups] = useState<RuleGroupDraft[]>([createDefaultGroupDraft()]);
    const [selectables, setSelectables] = useState<CompletionRuleSelectableItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [issues, setIssues] = useState<RuleIssue[]>([]);
    const [clientError, setClientError] = useState<string | null>(null);

    const activeSessionName = useMemo(() => {
        if (sessions && sessionId) {
            const found = sessions.find((s) => s.id === sessionId);
            if (found) return found.name;
        }
        return sessionName;
    }, [sessions, sessionId, sessionName]);

    const availableKeys = useMemo(() => new Set(selectables.map((s) => s.key)), [selectables]);
    const hasLessons = selectables.some((s) => s.kind === "LESSON");

    const load = useCallback(async () => {
        if (!sessionId) return;
        setLoading(true);
        setIssues([]);
        setClientError(null);
        try {
            const [rule, blocks, lessons, sessionData] = await Promise.all([
                completionRuleService.getSessionRule(sessionId),
                coursewareService.getSessionBlocks(sessionId).catch(() => []),
                getLessonsBySession(sessionId).catch(() => []),
                getSessionById(sessionId).catch(() => null),
            ]);
            const items = buildSessionSelectableItems(
                blocks,
                (lessons || []).map((l: { id: string; name?: string }) => ({
                    id: String(l.id),
                    name: l.name,
                })),
                sessionData,
            );
            setSelectables(items);
            setGroups(normalizeRuleFromApi(rule));
        } catch (error) {
            toast.error(T.toastLoadErrorTitle, extractErrorMessages(error));
            setGroups([createDefaultGroupDraft()]);
            setSelectables([]);
        } finally {
            setLoading(false);
        }
    }, [sessionId]);

    useEffect(() => {
        if (isOpen && sessionId) {
            void load();
        }
    }, [isOpen, sessionId, load]);

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
            }),
        );
        setIssues([]);
        setClientError(null);
    };

    const handleSelectAllCategory = (groupIndex: number, categoryItems: CompletionRuleSelectableItem[]) => {
        const catKeys = categoryItems.map((i) => i.key);
        setGroups((prev) =>
            prev.map((g, i) => {
                if (i !== groupIndex) return g;
                const newKeys = Array.from(new Set([...g.selectedKeys, ...catKeys]));
                return { ...g, selectedKeys: newKeys };
            }),
        );
    };

    const handleDeselectAllCategory = (groupIndex: number, categoryItems: CompletionRuleSelectableItem[]) => {
        const catKeys = new Set(categoryItems.map((i) => i.key));
        setGroups((prev) =>
            prev.map((g, i) => {
                if (i !== groupIndex) return g;
                const newKeys = g.selectedKeys.filter((k) => !catKeys.has(k));
                return { ...g, selectedKeys: newKeys };
            }),
        );
    };

    const handlePrune = () => {
        const { drafts, removedCount } = pruneMissingItems(groups, availableKeys);
        setGroups(drafts);
        if (removedCount > 0) {
            toast.success(T.toastPruneTitle, T.toastPruneSuccess.replace("{count}", String(removedCount)));
        } else {
            toast.success(T.toastPruneTitle, T.toastPruneNone);
        }
    };

    const handleSave = async () => {
        const targetId = sessionId;
        if (!targetId) return;

        const validationError = validateDraftsForSubmit(groups);
        if (validationError) {
            setClientError(validationError);
            return;
        }
        setSaving(true);
        setIssues([]);
        setClientError(null);
        try {
            const payload = buildRulePayload(groups);
            const saved = await completionRuleService.setSessionRule(targetId, payload);
            setGroups(normalizeRuleFromApi(saved));
            toast.success(T.toastSaveSuccessTitle, T.toastSaveSuccess);
            onOpenChange(false);
        } catch (error) {
            const ruleIssues = extractRuleIssues(error);
            if (ruleIssues.length > 0) {
                setIssues(ruleIssues);
                toast.error(T.toastSaveErrorTitle, ruleIssues.map((i) => i.message).join(" · "));
            } else {
                toast.error(T.toastSaveErrorTitle, extractErrorMessages(error));
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

                    <div className="pr-8 flex flex-col gap-1.5">
                        <div className="flex items-center gap-2.5">
                            {onBackToSessionSelect && (
                                <button
                                    type="button"
                                    onClick={onBackToSessionSelect}
                                    className="flex size-8 cursor-pointer items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                                    title="Quay lại danh sách buổi học"
                                >
                                    <ArrowLeft className="size-4.5" />
                                </button>
                            )}
                            <ShieldAlert className="size-6 text-wine" />
                            <h3 className="text-lg font-bold text-slate-900">{T.title}</h3>
                        </div>
                        <p className="text-sm font-semibold text-slate-600">
                            {T.subtitle}
                            {activeSessionName ? ` — ${activeSessionName}` : ""}
                        </p>
                        <p className="text-xs leading-relaxed text-slate-500">{T.hint}</p>
                    </div>

                    {loading ? (
                        <div className="flex flex-1 items-center justify-center py-16 text-slate-400">
                            <Loader2 className="size-7 animate-spin" />
                        </div>
                    ) : (
                        <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
                            {!hasLessons && (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800">
                                    {T.noLessonsHint}
                                </div>
                            )}

                            {groups.map((group, index) => (
                                <div
                                    key={index}
                                    className={`flex flex-col gap-3.5 rounded-2xl border p-4.5 ${groupHasIssue(index) ? "border-red-400 bg-red-50/40" : "border-slate-200 bg-slate-50/60"
                                        }`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-sm font-extrabold tracking-wider text-wine uppercase">
                                            {T.groupLabel.replace("{n}", String(index + 1))}
                                        </span>
                                        {groups.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => setGroups((prev) => prev.filter((_, i) => i !== index))}
                                                className="cursor-pointer p-1.5 text-red-400 hover:text-red-600"
                                                title={T.removeGroupBtn}
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        )}
                                    </div>
                                    {/* Box 1: Phép toán */}
                                    <div className="flex flex-col gap-2.5 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
                                        <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">{T.operatorLabel}</span>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {(["ALL", "ANY", "AT_LEAST_N"] as RuleOperator[]).map((op) => (
                                                <button
                                                    key={op}
                                                    type="button"
                                                    onClick={() => updateGroup(index, { operator: op })}
                                                    className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-bold transition ${group.operator === op
                                                            ? "bg-wine text-white shadow-xs"
                                                            : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                                                        }`}
                                                >
                                                    {op === "ALL" ? T.operatorAll : op === "ANY" ? T.operatorAny : T.operatorAtLeastN}
                                                </button>
                                            ))}
                                            {group.operator === "AT_LEAST_N" && (
                                                <div className="flex items-center gap-1.5 pl-1">
                                                    <span className="text-xs font-bold text-slate-500">Số lượng:</span>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        value={group.n ?? 1}
                                                        onChange={(e) => updateGroup(index, { n: Number(e.target.value) || 1 })}
                                                        className="w-16 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-sm font-bold outline-none focus:border-wine"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                     {/* Box 2: Phạm vi mục */}
                                    <div className="flex flex-col gap-2.5 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
                                        <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">{T.scopeLabel}</span>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {(
                                                [
                                                    ["ALL_REQUIRED", T.scopeAllRequired],
                                                    ["CATEGORY", "Chọn mục cụ thể"],
                                                    ["NONE", T.scopeNone],
                                                ] as [RuleItemScopeMode, string][]
                                            ).map(([mode, label]) => (
                                                <button
                                                    key={mode}
                                                    type="button"
                                                    onClick={() => {
                                                        updateGroup(index, { scopeMode: mode });
                                                    }}
                                                    className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-bold transition ${group.scopeMode === mode
                                                            ? "bg-wine text-white shadow-xs"
                                                            : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                                                        }`}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Item list when CATEGORY mode is selected */}
                                    {group.scopeMode === "CATEGORY" && (
                                        <div className="flex flex-col gap-3.5 rounded-2xl border border-slate-200 bg-white p-4">
                                            {/* Session Header Card */}
                                            {activeSessionName && (
                                                <div className="flex items-center justify-between rounded-xl bg-slate-100/70 px-3.5 py-2.5">
                                                    <span className="text-xs font-extrabold text-slate-800">
                                                        📌 Buổi học: <span className="text-wine">{activeSessionName}</span>
                                                    </span>
                                                    <span className="text-xs font-bold text-slate-500">
                                                        Đã chọn: {group.selectedKeys.length}/{selectables.length} mục
                                                    </span>
                                                </div>
                                            )}

                                            {selectables.length === 0 ? (
                                                <p className="text-sm text-slate-400">{T.emptySelectables}</p>
                                            ) : (
                                                ([
                                                    {
                                                        kind: "LESSON",
                                                        title: "Bài học (Lessons)",
                                                        icon: BookOpen,
                                                        headerBg: "bg-blue-50/60 text-blue-900",
                                                    },
                                                    {
                                                        kind: "BLOCK",
                                                        title: "Học liệu cấp buổi (Session Blocks)",
                                                        icon: Layers,
                                                        headerBg: "bg-purple-50/60 text-purple-900",
                                                    },
                                                ] as const).map(({ kind: catKind, title: catTitle, icon: CatIcon, headerBg }) => {
                                                    const sectionItems = selectables.filter((item) => item.kind === catKind);
                                                    if (sectionItems.length === 0) return null;
                                                    const selectedCount = sectionItems.filter((i) => group.selectedKeys.includes(i.key)).length;
                                                    const isAllSelected = selectedCount === sectionItems.length && sectionItems.length > 0;

                                                    return (
                                                        <div key={catKind} className="flex flex-col rounded-xl border border-slate-100 overflow-hidden">
                                                            <div className={`flex items-center justify-between px-3.5 py-2.5 ${headerBg}`}>
                                                                <div className="flex items-center gap-2">
                                                                    <CatIcon className="size-4.5 opacity-80" />
                                                                    <span className="text-sm font-bold">
                                                                        {catTitle} ({selectedCount}/{sectionItems.length})
                                                                    </span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        isAllSelected
                                                                            ? handleDeselectAllCategory(index, sectionItems)
                                                                            : handleSelectAllCategory(index, sectionItems)
                                                                    }
                                                                    className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-white/90 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-white shadow-2xs"
                                                                >
                                                                    {isAllSelected ? (
                                                                        <>
                                                                            <Square className="size-3.5 text-slate-500" />
                                                                            <span>Bỏ chọn</span>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <CheckSquare className="size-3.5 text-wine" />
                                                                            <span>Chọn tất cả</span>
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>
                                                            <div className="flex flex-col divide-y divide-slate-50 p-1 bg-white">
                                                                {sectionItems.map((item) => {
                                                                    const { badge, badgeClass } = getItemBadgeDetails(item);
                                                                    return (
                                                                        <label
                                                                            key={item.key}
                                                                            className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${itemHasIssue(index, item.key)
                                                                                    ? "bg-red-50 text-red-700"
                                                                                    : "text-slate-700 hover:bg-slate-50"
                                                                                }`}
                                                                        >
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={group.selectedKeys.includes(item.key)}
                                                                                onChange={() => toggleItem(index, item.key)}
                                                                                className="accent-wine size-4"
                                                                            />
                                                                            <span className={`rounded-md px-2.5 py-0.5 text-xs font-bold ${badgeClass}`}>
                                                                                {badge}
                                                                            </span>
                                                                            <span className="flex-1 font-semibold text-slate-800">{item.label}</span>
                                                                            {group.selectedKeys.includes(item.key) && (
                                                                                <span className="text-xs font-bold text-wine">{T.requiredBadge}</span>
                                                                            )}
                                                                        </label>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    )}

                                    {issues
                                        .filter((i) => i.groupIndex === index)
                                        .map((issue, issueIdx) => (
                                            <p key={issueIdx} className="text-xs font-semibold text-red-600">
                                                {issue.message}
                                            </p>
                                        ))}
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={() => setGroups((prev) => [...prev, createDefaultGroupDraft()])}
                                className="inline-flex cursor-pointer items-center justify-center gap-1.5 self-start rounded-full border border-dashed border-slate-300 px-4.5 py-2 text-sm font-bold text-slate-600 hover:border-wine hover:text-wine"
                            >
                                <Plus className="size-4" />
                                {T.addGroupBtn}
                            </button>

                            {clientError && <p className="text-xs font-semibold text-red-600">{clientError}</p>}
                        </div>
                    )}

                    <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 pt-3.5">
                        <button
                            type="button"
                            onClick={handlePrune}
                            disabled={loading || saving}
                            className="cursor-pointer rounded-full border border-slate-200 px-5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                        >
                            {T.pruneBtn}
                        </button>
                        <div className="flex items-center gap-2.5">
                            <button
                                type="button"
                                onClick={() => onOpenChange(false)}
                                className="cursor-pointer rounded-full border border-slate-200 px-5.5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
                            >
                                {T.cancelBtn}
                            </button>
                            <button
                                type="button"
                                onClick={() => void handleSave()}
                                disabled={loading || saving}
                                className="cursor-pointer rounded-full bg-wine px-6.5 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-wine/90 disabled:opacity-50"
                            >
                                {saving ? T.savingText : T.saveBtn}
                            </button>
                        </div>
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
