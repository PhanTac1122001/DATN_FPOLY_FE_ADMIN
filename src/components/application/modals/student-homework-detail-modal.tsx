"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ExternalLink, FileText, GitBranch, ShieldAlert, Sparkles, X, XCircle } from "lucide-react";
import { Heading } from "react-aria-components";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { approveCompletionFeedback, getCompletionDetail, getCompletionSubmissions, gradeCompletion } from "@/services/homework-completion.service";
import { toast } from "@/services/toast.service";
import { AiDecisionEnum, AiStatusEnum, HomeworkStatusEnum, type StudentHomeworkDetailModalProps } from "@/types/homework.types";
import { cx } from "@/utils/cx";

export function StudentHomeworkDetailModal({ isOpen, onClose, completionId, onSuccess }: StudentHomeworkDetailModalProps) {
    const queryClient = useQueryClient();
    const [teacherNote, setTeacherNote] = useState("");
    const [activeTab, setActiveTab] = useState<"detail" | "history">("detail");

    const { data: detail, isLoading: isLoadingDetail } = useQuery({
        queryKey: ["homework-completion-detail", completionId],
        queryFn: () => getCompletionDetail(completionId),
        enabled: isOpen && !!completionId,
    });

    const { data: submissions = [], isLoading: isLoadingSubmissions } = useQuery({
        queryKey: ["homework-completion-submissions", completionId],
        queryFn: () => getCompletionSubmissions(completionId),
        enabled: isOpen && !!completionId,
    });

    const approveMutation = useMutation({
        mutationFn: () => approveCompletionFeedback(completionId),
        onSuccess: () => {
            toast.success(UI_TEXT.studentHomeworkDetailModal.toastSuccess, UI_TEXT.studentHomeworkDetailModal.toastApproveSuccess);
            queryClient.invalidateQueries({ queryKey: ["homework-completion-detail", completionId] });
            queryClient.invalidateQueries({ queryKey: ["homework-completions"] });
            if (onSuccess) onSuccess();
        },
        onError: (err: Error) => {
            toast.error(UI_TEXT.studentHomeworkDetailModal.toastError, err.message || UI_TEXT.studentHomeworkDetailModal.toastApproveError);
        },
    });

    const gradeMutation = useMutation({
        mutationFn: (status: HomeworkStatusEnum.COMPLETED | HomeworkStatusEnum.NOT_COMPLETED) => gradeCompletion(completionId, { status, teacherNote }),
        onSuccess: (_, status) => {
            toast.success(
                UI_TEXT.studentHomeworkDetailModal.toastSuccess,
                status === HomeworkStatusEnum.COMPLETED
                    ? UI_TEXT.studentHomeworkDetailModal.toastGradeCompletedSuccess
                    : UI_TEXT.studentHomeworkDetailModal.toastGradeNotCompletedSuccess,
            );
            queryClient.invalidateQueries({ queryKey: ["homework-completion-detail", completionId] });
            queryClient.invalidateQueries({ queryKey: ["homework-completions"] });
            if (onSuccess) onSuccess();
        },
        onError: (err: Error) => {
            toast.error(UI_TEXT.studentHomeworkDetailModal.toastError, err.message || UI_TEXT.studentHomeworkDetailModal.toastGradeError);
        },
    });

    if (!isOpen) return null;

    const studentName = detail?.student?.fullName || UI_TEXT.enrollStudentModal.defaultStudentLabel;
    const studentCode = detail?.student?.studentCode || "-";
    const status = detail?.status || HomeworkStatusEnum.PENDING_TEACHER;

    const getStatusBadge = (st: string) => {
        switch (st) {
            case HomeworkStatusEnum.COMPLETED:
                return <Badge color="success">{UI_TEXT.studentHomeworkDetailModal.badgeCompleted}</Badge>;
            case HomeworkStatusEnum.NOT_COMPLETED:
                return <Badge color="error">{UI_TEXT.studentHomeworkDetailModal.badgeNotCompleted}</Badge>;
            case HomeworkStatusEnum.PENDING_AI:
                return <Badge color="warning">{UI_TEXT.studentHomeworkDetailModal.badgePendingAi}</Badge>;
            case HomeworkStatusEnum.PENDING_TEACHER:
                return <Badge color="brand">{UI_TEXT.studentHomeworkDetailModal.badgePendingTeacher}</Badge>;
            default:
                return <Badge color="gray">{st}</Badge>;
        }
    };

    const getAiStatusBadge = (aiSt?: string) => {
        switch (aiSt) {
            case AiStatusEnum.COMPLETED:
                return <Badge color="success">{UI_TEXT.studentHomeworkDetailModal.badgeAiCompleted}</Badge>;
            case AiStatusEnum.SKIPPED:
                return <Badge color="error">{UI_TEXT.studentHomeworkDetailModal.badgeAiSkipped}</Badge>;
            case AiStatusEnum.RUNNING:
                return <Badge color="brand">{UI_TEXT.studentHomeworkDetailModal.badgeAiRunning}</Badge>;
            case AiStatusEnum.FAILED:
                return <Badge color="error">{UI_TEXT.studentHomeworkDetailModal.badgeAiFailed}</Badge>;
            case AiStatusEnum.PENDING:
                return <Badge color="warning">{UI_TEXT.studentHomeworkDetailModal.badgeAiPending}</Badge>;
            default:
                return <Badge color="gray">{aiSt || "—"}</Badge>;
        }
    };

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="max-w-3xl rounded-[24px] border-none bg-white p-0 shadow-2xl">
                <Dialog className="flex max-h-[85vh] flex-col outline-none">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-600">
                                <FileText className="size-5" />
                            </div>
                            <div>
                                <Heading slot="title" className="text-lg font-extrabold text-slate-900">
                                    {UI_TEXT.studentHomeworkDetailModal.modalTitle}
                                </Heading>
                                <p className="mt-0.5 text-xs font-medium text-slate-500">
                                    {UI_TEXT.studentHomeworkDetailModal.studentLabel} <strong className="font-bold text-slate-900">{studentName}</strong>{" "}
                                    {`(${studentCode})`}
                                </p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            color="tertiary"
                            size="sm"
                            onClick={onClose}
                            className="size-8 rounded-full p-0 text-slate-400 hover:bg-slate-100"
                        >
                            <X className="size-4" />
                        </Button>
                    </div>

                    {/* Sub-tabs header */}
                    <div className="flex border-b border-slate-100 px-6">
                        <button
                            type="button"
                            onClick={() => setActiveTab("detail")}
                            className={cx(
                                "border-b-2 px-4 py-2.5 text-xs font-bold transition",
                                activeTab === "detail" ? "border-emerald-600 text-emerald-700" : "border-transparent text-slate-500 hover:text-slate-700",
                            )}
                        >
                            {UI_TEXT.studentHomeworkDetailModal.tabDetail}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("history")}
                            className={cx(
                                "border-b-2 px-4 py-2.5 text-xs font-bold transition",
                                activeTab === "history" ? "border-emerald-600 text-emerald-700" : "border-transparent text-slate-500 hover:text-slate-700",
                            )}
                        >
                            {`${UI_TEXT.studentHomeworkDetailModal.tabHistoryPrefix}${submissions.length}${UI_TEXT.studentHomeworkDetailModal.tabHistorySuffix}`}
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="flex-1 space-y-6 overflow-y-auto p-6">
                        {isLoadingDetail ? (
                            <div className="flex h-48 items-center justify-center">
                                <div className="size-6 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
                            </div>
                        ) : activeTab === "detail" ? (
                            <>
                                {/* Status Overview Card */}
                                <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-500">{UI_TEXT.studentHomeworkDetailModal.generalStatusLabel}</span>
                                            {getStatusBadge(status)}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-500">{UI_TEXT.studentHomeworkDetailModal.aiStatusLabel}</span>
                                            {getAiStatusBadge(detail?.aiStatus)}
                                        </div>
                                    </div>

                                    {detail?.lastGithubUrl && (
                                        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 text-xs">
                                            <div className="flex items-center gap-2 truncate text-slate-700">
                                                <GitBranch className="size-4 shrink-0 text-slate-400" />
                                                <span className="font-semibold">{detail.lastGithubUrl}</span>
                                                {detail.lastBranch && (
                                                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">{`[${detail.lastBranch}]`}</span>
                                                )}
                                            </div>
                                            <a
                                                href={detail.lastGithubUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex shrink-0 items-center gap-1 font-bold text-emerald-600 hover:underline"
                                            >
                                                <span>{UI_TEXT.studentHomeworkDetailModal.githubBtn}</span>
                                                <ExternalLink className="size-3.5" />
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* AI Feedback Section */}
                                <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="size-4 text-purple-600" />
                                            <h4 className="text-sm font-bold text-slate-900">{UI_TEXT.studentHomeworkDetailModal.aiReportTitle}</h4>
                                        </div>
                                        {detail?.aiDecision && (
                                            <Badge color={detail.aiDecision === AiDecisionEnum.PASS ? "success" : "error"}>
                                                {`${UI_TEXT.studentHomeworkDetailModal.aiDecisionLabel} ${detail.aiDecision}`}
                                            </Badge>
                                        )}
                                    </div>

                                    {detail?.aiStatus === AiStatusEnum.SKIPPED ? (
                                        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                                            <ShieldAlert className="size-5 shrink-0 text-amber-600" />
                                            <div>
                                                <p className="font-bold">{UI_TEXT.studentHomeworkDetailModal.aiExceededTitle}</p>
                                                <p className="text-amber-700">{UI_TEXT.studentHomeworkDetailModal.aiExceededDesc}</p>
                                            </div>
                                        </div>
                                    ) : detail?.aiReport || detail?.aiSummary ? (
                                        <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-slate-800">
                                            {detail.aiReport || detail.aiSummary}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">{UI_TEXT.studentHomeworkDetailModal.noAiResult}</p>
                                    )}

                                    {/* Approve feedback action */}
                                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                                        <div className="text-xs">
                                            <span className="text-slate-500">{UI_TEXT.studentHomeworkDetailModal.visibilityLabel}</span>
                                            {detail?.isFeedbackApproved ? (
                                                <span className="font-bold text-emerald-600">{UI_TEXT.studentHomeworkDetailModal.visibilityApproved}</span>
                                            ) : (
                                                <span className="font-bold text-amber-600">{UI_TEXT.studentHomeworkDetailModal.visibilityHidden}</span>
                                            )}
                                        </div>

                                        {!detail?.isFeedbackApproved && (
                                            <Button
                                                size="sm"
                                                color="secondary"
                                                onClick={() => approveMutation.mutate()}
                                                isLoading={approveMutation.isPending}
                                                className="border-emerald-200 bg-emerald-50 font-bold text-emerald-700 hover:bg-emerald-100"
                                            >
                                                {UI_TEXT.studentHomeworkDetailModal.approveFeedbackBtn}
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Teacher Grading Section */}
                                <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
                                    <h4 className="text-sm font-bold text-slate-900">{UI_TEXT.studentHomeworkDetailModal.teacherSectionTitle}</h4>

                                    <div>
                                        <label className="mb-1 block text-xs font-semibold text-slate-600">
                                            {UI_TEXT.studentHomeworkDetailModal.teacherNoteLabel}
                                        </label>
                                        <textarea
                                            value={teacherNote}
                                            onChange={(e) => setTeacherNote(e.target.value)}
                                            placeholder={detail?.teacherNote || UI_TEXT.studentHomeworkDetailModal.teacherNotePlaceholder}
                                            rows={3}
                                            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                                        />
                                    </div>

                                    <div className="flex items-center justify-end gap-2 pt-2">
                                        <Button
                                            size="sm"
                                            color="secondary"
                                            onClick={() => gradeMutation.mutate(HomeworkStatusEnum.NOT_COMPLETED)}
                                            isLoading={gradeMutation.isPending}
                                            className="gap-1 border-rose-200 bg-rose-50 font-bold text-rose-700 hover:bg-rose-100"
                                            iconLeading={<XCircle className="size-4 text-rose-600" />}
                                        >
                                            {UI_TEXT.studentHomeworkDetailModal.gradeNotCompletedBtn}
                                        </Button>
                                        <Button
                                            size="sm"
                                            color="primary"
                                            onClick={() => gradeMutation.mutate(HomeworkStatusEnum.COMPLETED)}
                                            isLoading={gradeMutation.isPending}
                                            className="gap-1 border-none bg-emerald-600 font-bold text-white hover:bg-emerald-700"
                                            iconLeading={<CheckCircle2 className="size-4" />}
                                        >
                                            {UI_TEXT.studentHomeworkDetailModal.gradeCompletedBtn}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Submissions History Tab */
                            <div className="space-y-3">
                                {isLoadingSubmissions ? (
                                    <div className="flex h-32 items-center justify-center">
                                        <div className="size-6 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
                                    </div>
                                ) : submissions.length === 0 ? (
                                    <p className="py-6 text-center text-xs text-slate-400 italic">{UI_TEXT.studentHomeworkDetailModal.emptySubmissions}</p>
                                ) : (
                                    submissions.map((sub) => (
                                        <div key={sub.id} className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-extrabold text-slate-900">{`${UI_TEXT.studentHomeworkDetailModal.attemptTitlePrefix}${sub.attemptNo}`}</span>
                                                    {getAiStatusBadge(sub.aiStatus)}
                                                    {sub.aiDecision && (
                                                        <Badge color={sub.aiDecision === AiDecisionEnum.PASS ? "success" : "error"}>{sub.aiDecision}</Badge>
                                                    )}
                                                </div>
                                                <span className="text-[11px] text-slate-400">
                                                    {sub.submittedAt || sub.createdAt ? new Date(sub.submittedAt || sub.createdAt!).toLocaleString() : "—"}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 truncate text-slate-700">
                                                <GitBranch className="size-3.5 shrink-0 text-slate-400" />
                                                <a href={sub.githubUrl} target="_blank" rel="noreferrer" className="truncate text-emerald-600 hover:underline">
                                                    {sub.githubUrl}
                                                </a>
                                                {sub.branch && <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px]">{`[${sub.branch}]`}</span>}
                                            </div>

                                            {sub.aiStatus === AiStatusEnum.SKIPPED && (
                                                <div className="rounded border border-amber-200 bg-amber-50 p-1.5 text-[11px] font-semibold text-amber-700">
                                                    {UI_TEXT.studentHomeworkDetailModal.aiOverLimitWarning}
                                                </div>
                                            )}

                                            {sub.aiReport && (
                                                <details className="mt-1">
                                                    <summary className="cursor-pointer font-semibold text-purple-700 hover:underline">
                                                        {`${UI_TEXT.studentHomeworkDetailModal.viewAiReportBtnPrefix}${sub.attemptNo}${UI_TEXT.studentHomeworkDetailModal.viewAiReportBtnSuffix}`}
                                                    </summary>
                                                    <div className="mt-1 max-h-40 overflow-y-auto rounded border border-slate-200 bg-white p-2 font-mono text-[11px] whitespace-pre-wrap">
                                                        {sub.aiReport}
                                                    </div>
                                                </details>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
