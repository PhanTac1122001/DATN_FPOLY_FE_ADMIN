import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckSquare, Layers, Loader2, Map, Plus, ShieldAlert, Trash2, X } from "lucide-react";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { HttpError } from "@/lib/http-client";
import { completionRuleService } from "@/services/completion-rule.service";
import { coursewareService } from "@/services/courseware.service";
import { toast } from "@/services/toast.service";
import type { CoursewareBlockEntity, RuleGroupDraft, RuleIssue, SessionCompletionRuleModalProps } from "@/types/completion-rule.types";
import { createDefaultGroupDraft, normalizeRuleFromApi } from "@/utils/completion-rule.utils";
import { PracticeFormFields } from "../components/practice-form-fields";

const T = UI_TEXT.sessionCompletionRuleModal;

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

export function SessionCompletionRuleModal({
    isOpen,
    onOpenChange,
    sessionId,
    sessionName,
    sessions,
    onBackToSessionSelect,
}: SessionCompletionRuleModalProps) {
    const [isCustomRule, setIsCustomRule] = useState(false);
    const [groups, setGroups] = useState<RuleGroupDraft[]>([createDefaultGroupDraft()]);
    const [blocks, setBlocks] = useState<CoursewareBlockEntity[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form state for creating new PRACTICE block
    const [isAddPracticeOpen, setIsAddPracticeOpen] = useState(false);
    const [practiceTitle, setPracticeTitle] = useState("");
    const [submissionType, setSubmissionType] = useState<"LINK" | "FILE" | "TEXT">("LINK");
    const [practiceContent, setPracticeContent] = useState("");
    const [isPracticeRequired, setIsPracticeRequired] = useState(true);
    const [requireSubmission, setRequireSubmission] = useState(true);
    const [isCreatingBlock, setIsCreatingBlock] = useState(false);

    const activeSessionName = useMemo(() => {
        if (sessions && sessionId) {
            const found = sessions.find((s) => s.id === sessionId);
            if (found) return found.name;
        }
        return sessionName;
    }, [sessions, sessionId, sessionName]);

    const mindmapSubmissionBlock = useMemo(() => blocks.find((b) => b.type === "MINDMAP_SUBMISSION"), [blocks]);

    const practiceBlocks = useMemo(() => blocks.filter((b) => b.type === "PRACTICE" || b.type === "ASSIGNMENT"), [blocks]);

    const load = useCallback(async () => {
        if (!sessionId) return;
        setLoading(true);
        try {
            const [rule, sessionBlocks] = await Promise.all([
                completionRuleService.getSessionRule(sessionId).catch(() => null),
                coursewareService.getSessionBlocks(sessionId).catch(() => []),
            ]);
            setBlocks(sessionBlocks);

            const isCustom = Boolean(
                rule &&
                rule.groups &&
                (rule.groups.length > 1 ||
                    (rule.groups.length === 1 &&
                        (rule.groups[0].operator !== "ALL" || (rule.groups[0].items && rule.groups[0].items.length > 0)))),
            );
            setIsCustomRule(isCustom);
            setGroups(normalizeRuleFromApi(rule));
        } catch (error) {
            toast.error(T.toastLoadErrorTitle, extractErrorMessages(error));
            setIsCustomRule(false);
            setGroups([createDefaultGroupDraft()]);
            setBlocks([]);
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
            toast.success("Thành công", "Đã đưa điều kiện hoàn thành buổi về mặc định");
        } catch (error) {
            toast.error(T.toastSaveErrorTitle, extractErrorMessages(error));
        } finally {
            setSaving(false);
        }
    };

    const handleToggleBlockRequired = async (blockId: string, currentIsRequired: boolean) => {
        try {
            await coursewareService.updateBlock(blockId, { isRequired: !currentIsRequired });
            setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, isRequired: !currentIsRequired } : b)));
            toast.success("Thành công", "Đã cập nhật tính bắt buộc của học liệu");
        } catch (error) {
            toast.error("Lỗi", extractErrorMessages(error));
        }
    };

    const handleDeleteBlock = async (blockId: string) => {
        try {
            await coursewareService.deleteBlock(blockId);
            setBlocks((prev) => prev.filter((b) => b.id !== blockId));
            toast.success("Thành công", "Đã xóa học liệu khỏi buổi học");
        } catch (error) {
            toast.error("Lỗi", extractErrorMessages(error));
        }
    };

    const handleCreateMindmapSubmissionBlock = async () => {
        if (!sessionId) return;
        try {
            const newBlock = await coursewareService.createSessionBlock(sessionId, {
                type: "MINDMAP_SUBMISSION",
                title: "Cổng nộp Mindmap buổi học",
                isRequired: true,
                payload: {},
            });
            setBlocks((prev) => [...prev, newBlock]);
            toast.success("Thành công", "Đã tạo cổng nộp Mindmap (MINDMAP_SUBMISSION) cho buổi học");
        } catch (error) {
            toast.error("Lỗi tạo cổng Mindmap", extractErrorMessages(error));
        }
    };

    const handleCreatePracticeBlock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sessionId) return;
        setIsCreatingBlock(true);
        try {
            const newBlock = await coursewareService.createSessionBlock(sessionId, {
                type: "PRACTICE",
                title: practiceTitle.trim() || "Bài thực hành cấp buổi",
                isRequired: isPracticeRequired,
                payload: {
                    content: practiceContent.trim(),
                    submissionType,
                },
                completionCriteria: {
                    requireSubmission,
                },
            });
            setBlocks((prev) => [...prev, newBlock]);
            toast.success("Thành công", "Đã thêm Bài thực hành cấp buổi");
            setIsAddPracticeOpen(false);
            setPracticeTitle("");
            setPracticeContent("");
            setIsPracticeRequired(true);
            setRequireSubmission(true);
        } catch (error) {
            toast.error("Lỗi tạo bài thực hành", extractErrorMessages(error));
        } finally {
            setIsCreatingBlock(false);
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

                    <div className="pr-8 flex flex-col gap-1.5 border-b border-slate-100 pb-4">
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
                                        <span>Buổi này đang dùng điều kiện tùy chỉnh</span>
                                    </div>
                                    <p className="text-xs font-medium leading-relaxed text-amber-800">
                                        Buổi học này có cấu hình điều kiện nâng cao. Theo quy ước chuẩn của hệ thống, sinh viên cần hoàn thành{" "}
                                        <strong>toàn bộ bài học (Lesson)</strong> trong buổi và các học liệu cấp buổi bắt buộc (isRequired).
                                    </p>
                                    <div className="pt-1">
                                        <button
                                            type="button"
                                            onClick={handleResetToDefault}
                                            disabled={saving}
                                            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-wine px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-wine/90 disabled:opacity-50"
                                        >
                                            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <CheckSquare className="size-3.5" />}
                                            <span>Đưa về mặc định (Hoàn thành tất cả)</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4.5">
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                                        <CheckSquare className="size-5 shrink-0 text-wine" />
                                        <span>Quy ước mặc định: Hoàn thành toàn bộ nội dung trong buổi</span>
                                    </div>
                                    <div className="flex flex-col gap-2 text-xs font-semibold text-slate-700">
                                        <div className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-white p-3 shadow-2xs">
                                            <span className="font-bold text-wine">1.</span>
                                            <span className="leading-relaxed">
                                                Tất cả <strong>bài học (Lesson)</strong> thuộc buổi này mặc định đều <strong>bắt buộc</strong>{" "}
                                                phải hoàn thành.
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-white p-3 shadow-2xs">
                                            <span className="font-bold text-wine">2.</span>
                                            <span className="leading-relaxed">
                                                Quản lý tính bắt buộc của các <strong>Học liệu cấp buổi (Mindmap, Bài thực hành)</strong> ở các phần
                                                bên dưới.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Section 1: Cổng nộp Mindmap cấp buổi */}
                            <div className="flex flex-col gap-3 rounded-2xl border border-pink-200 bg-pink-50/40 p-4.5">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 text-pink-950 font-bold text-sm">
                                        <Map className="size-4 text-pink-600 shrink-0" />
                                        <span>Cổng nộp Mindmap cấp buổi (MINDMAP_SUBMISSION)</span>
                                    </div>
                                    {mindmapSubmissionBlock ? (
                                        <span
                                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${mindmapSubmissionBlock.isRequired
                                                    ? "bg-red-50 text-red-700 border border-red-200"
                                                    : "bg-slate-100 text-slate-600 border border-slate-200"
                                                }`}
                                        >
                                            {mindmapSubmissionBlock.isRequired ? "Bắt buộc nộp bài" : "Tùy chọn nộp bài"}
                                        </span>
                                    ) : (
                                        <span className="rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold">
                                            Chưa bật cổng nộp
                                        </span>
                                    )}
                                </div>

                                {mindmapSubmissionBlock ? (
                                    <div className="flex items-center justify-between gap-3 pt-1">
                                        <p className="text-xs font-medium text-slate-600">
                                            Yêu cầu sinh viên phải hoàn thành bài vẽ Mindmap riêng để chốt hoàn thành buổi học.
                                        </p>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleToggleBlockRequired(mindmapSubmissionBlock.id, mindmapSubmissionBlock.isRequired)
                                                }
                                                className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50"
                                            >
                                                {mindmapSubmissionBlock.isRequired ? "Bỏ bắt buộc" : "Đặt làm bắt buộc"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteBlock(mindmapSubmissionBlock.id)}
                                                className="cursor-pointer rounded-xl border border-red-200 bg-red-50 p-1.5 text-red-600 hover:bg-red-100"
                                                title="Xóa cổng nộp Mindmap"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between gap-3 pt-1">
                                        <p className="text-xs font-medium text-slate-500">
                                            Chưa có cổng nộp Mindmap. Bấm tạo cổng để bắt buộc sinh viên nộp bài vẽ Mindmap.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleCreateMindmapSubmissionBlock}
                                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-pink-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-pink-700 shrink-0"
                                        >
                                            <Plus className="size-3.5" />
                                            <span>Bật cổng nộp Mindmap</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Section 2: Học liệu Bài tập thực hành cấp buổi */}
                            <div className="flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50/40 p-4.5">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 text-blue-950 font-bold text-sm">
                                        <Layers className="size-4 text-blue-600 shrink-0" />
                                        <span>Bài tập thực hành cấp buổi (Block PRACTICE)</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddPracticeOpen((prev) => !prev)}
                                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-wine px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-wine/90"
                                    >
                                        <Plus className="size-3.5" />
                                        <span>{isAddPracticeOpen ? "Đóng form" : "Thêm bài thực hành"}</span>
                                    </button>
                                </div>

                                {isAddPracticeOpen && (
                                    <form
                                        onSubmit={handleCreatePracticeBlock}
                                        className="flex flex-col gap-4 rounded-xl border border-blue-200 bg-white p-4 text-xs shadow-2xs"
                                    >
                                        <div className="flex flex-col gap-1.5">
                                            <label className="font-bold text-slate-700">Tên bài thực hành cấp buổi</label>
                                            <input
                                                type="text"
                                                value={practiceTitle}
                                                onChange={(e) => setPracticeTitle(e.target.value)}
                                                placeholder="Nhập tên bài thực hành..."
                                                className="w-full rounded-full border border-slate-200 px-4 py-2 font-medium focus:border-wine focus:outline-none"
                                                required
                                            />
                                        </div>

                                        <PracticeFormFields
                                            submissionType={submissionType}
                                            setSubmissionType={setSubmissionType}
                                            content={practiceContent}
                                            setContent={setPracticeContent}
                                            resources={[]}
                                            setResources={() => { }}
                                        />

                                        <div className="flex flex-col gap-2 rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                                            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                                                <input
                                                    type="checkbox"
                                                    checked={isPracticeRequired}
                                                    onChange={(e) => setIsPracticeRequired(e.target.checked)}
                                                    className="accent-wine size-4"
                                                />
                                                <span>Bắt buộc hoàn thành bài tập này để chốt buổi (isRequired)</span>
                                            </label>

                                            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                                                <input
                                                    type="checkbox"
                                                    checked={requireSubmission}
                                                    onChange={(e) => setRequireSubmission(e.target.checked)}
                                                    className="accent-wine size-4"
                                                />
                                                <span>Yêu cầu sinh viên bắt buộc nộp bài làm (requireSubmission)</span>
                                            </label>
                                        </div>

                                        <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                                            <button
                                                type="button"
                                                onClick={() => setIsAddPracticeOpen(false)}
                                                className="rounded-full border border-slate-200 px-4 py-1.5 font-bold text-slate-600 hover:bg-slate-50"
                                            >
                                                Hủy
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isCreatingBlock}
                                                className="rounded-full bg-wine px-5 py-1.5 font-bold text-white shadow-xs hover:bg-wine/90 disabled:opacity-50"
                                            >
                                                {isCreatingBlock ? "Đang lưu..." : "Lưu bài thực hành"}
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {practiceBlocks.length === 0 ? (
                                    <p className="text-xs text-slate-500 italic py-1">Chưa có Bài thực hành cấp buổi nào trong buổi này.</p>
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
                                                        <span className="rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600 border border-red-100">
                                                            Bắt buộc buổi
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                                                            Tùy chọn
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleBlockRequired(b.id, b.isRequired)}
                                                        className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100"
                                                    >
                                                        {b.isRequired ? "Bỏ bắt buộc" : "Đặt làm bắt buộc"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteBlock(b.id)}
                                                        className="cursor-pointer rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-600 hover:bg-red-100"
                                                        title="Xóa bài thực hành"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 pt-3.5">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="cursor-pointer rounded-full border border-slate-200 px-5.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                        >
                            {T.cancelBtn}
                        </button>
                        <button
                            type="button"
                            onClick={handleResetToDefault}
                            disabled={loading || saving}
                            className="cursor-pointer rounded-full bg-wine px-6.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-wine/90 disabled:opacity-50"
                        >
                            {saving ? T.savingText : "Lưu điều kiện mặc định"}
                        </button>
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
