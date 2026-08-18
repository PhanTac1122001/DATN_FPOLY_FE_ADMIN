"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Edit3, ExternalLink, FileText, Sparkles, X, XCircle } from "lucide-react";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { approveSessionAiFeedback, editSubmissionFeedback, getSessionStudentDetail } from "@/services/homework-completion.service";
import { toast } from "@/services/toast.service";
import { AiDecisionEnum, AiStatusEnum, type SessionStudentItem, type StudentHomeworkDetailViewProps } from "@/types/homework.types";

const defaultMaxScoreNum = 10;
const notFoundStatus = 404;

export function StudentHomeworkDetailView({
    studentId,
    studentName: _studentName,
    studentCode: _studentCode,
    sessionId,
    classId: _classId,
    courseId: _courseId,
    className,
    onBack,
}: StudentHomeworkDetailViewProps) {
    const queryClient = useQueryClient();

    // Modal state for editing submission feedback (API #5)
    const [editingSubmission, setEditingSubmission] = useState<{
        submissionId: string;
        title: string;
        aiSummary: string;
        aiScore: number | null;
        aiMaxScore: number;
        aiDecision: AiDecisionEnum | null;
    } | null>(null);

    const [formSummary, setFormSummary] = useState("");
    const [formScore, setFormScore] = useState<string>("");
    const [formMaxScore, setFormMaxScore] = useState<string>("10");
    const [formDecision, setFormDecision] = useState<AiDecisionEnum>(AiDecisionEnum.PASS);

    const openEditModal = (item: SessionStudentItem) => {
        if (!item.submissionId) return;
        setEditingSubmission({
            submissionId: item.submissionId,
            title: item.title,
            aiSummary: item.aiSummary || "",
            aiScore: item.aiScore,
            aiMaxScore: item.aiMaxScore || defaultMaxScoreNum,
            aiDecision: item.aiDecision,
        });
        setFormSummary(item.aiSummary || "");
        setFormScore(item.aiScore != null ? String(item.aiScore) : "");
        setFormMaxScore(item.aiMaxScore != null ? String(item.aiMaxScore) : String(defaultMaxScoreNum));
        setFormDecision(item.aiDecision === AiDecisionEnum.FAIL ? AiDecisionEnum.FAIL : AiDecisionEnum.PASS);
    };

    // Query Detail (API #4)
    const {
        data: detailData,
        isLoading,
        refetch,
    } = useQuery({
        queryKey: ["session-student-detail", sessionId, studentId],
        queryFn: () => getSessionStudentDetail(sessionId, studentId),
        enabled: !!sessionId && !!studentId,
    });

    const sessionInfo = detailData?.session;
    const studentInfo = detailData?.student;
    const completionInfo = detailData?.completion;
    const items = detailData?.items || [];

    // Mutation: Approve AI feedback for session + student (API #6)
    const approveAiMutation = useMutation({
        mutationFn: () => approveSessionAiFeedback(sessionId, studentId),
        onSuccess: () => {
            toast.success(UI_TEXT.homeworkReview.toastSuccessTitle, UI_TEXT.homeworkReview.toastSuccessApprove);
            refetch();
            queryClient.invalidateQueries({ queryKey: ["homework-completions"] });
            queryClient.invalidateQueries({ queryKey: ["class-rpoints-map"] });
            queryClient.invalidateQueries({ queryKey: ["course-class-statistics"] });
        },
        onError: (err: unknown) => {
            const errObj = err as Record<string, unknown>;
            const respObj = errObj?.response as Record<string, unknown> | undefined;
            const message =
                respObj?.status === notFoundStatus || errObj?.status === notFoundStatus
                    ? UI_TEXT.homeworkReview.toastErrorNotFound
                    : String(errObj?.message || UI_TEXT.homeworkReview.toastErrorApprove);
            toast.error(UI_TEXT.homeworkReview.toastErrorTitle, message);
        },
    });

    // Mutation: Edit Submission Feedback (API #5)
    const editFeedbackMutation = useMutation({
        mutationFn: () => {
            if (!editingSubmission) throw new Error("No submission selected");
            return editSubmissionFeedback(editingSubmission.submissionId, {
                aiSummary: formSummary,
                aiScore: formScore !== "" ? Number(formScore) : undefined,
                aiMaxScore: formMaxScore !== "" ? Number(formMaxScore) : defaultMaxScoreNum,
                aiDecision: formDecision,
            });
        },
        onSuccess: () => {
            toast.success(UI_TEXT.homeworkReview.toastSuccessTitle, UI_TEXT.homeworkReview.toastSuccessUpdate);
            setEditingSubmission(null);
            refetch();
            queryClient.invalidateQueries({ queryKey: ["homework-completions"] });
            queryClient.invalidateQueries({ queryKey: ["class-rpoints-map"] });
            queryClient.invalidateQueries({ queryKey: ["course-class-statistics"] });
        },
        onError: (err: Error) => {
            toast.error(UI_TEXT.homeworkReview.toastErrorTitle, err.message || UI_TEXT.homeworkReview.toastErrorUpdate);
        },
    });

    const getAiStatusBadge = (aiStatus: AiStatusEnum | null) => {
        switch (aiStatus) {
            case AiStatusEnum.COMPLETED:
                return <Badge color="success">{UI_TEXT.homeworkReview.badgeAiGraded}</Badge>;
            case AiStatusEnum.SKIPPED:
                return <Badge color="error">{UI_TEXT.homeworkReview.badgeAiLimitExhausted}</Badge>;
            case AiStatusEnum.RUNNING:
                return <Badge color="brand">{UI_TEXT.homeworkReview.badgeAiGrading}</Badge>;
            case AiStatusEnum.FAILED:
                return <Badge color="error">{UI_TEXT.homeworkReview.badgeAiError}</Badge>;
            case AiStatusEnum.PENDING:
                return <Badge color="warning">{UI_TEXT.homeworkReview.badgeAiPending}</Badge>;
            default:
                return <span className="text-xs font-medium text-slate-400">{UI_TEXT.homeworkReview.badgeAiNotGraded}</span>;
        }
    };

    return (
        <div className="flex w-full flex-1 flex-col gap-6">
            {/* Header & Back Button */}
            <div className="flex flex-col gap-4">
                <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 transition hover:text-emerald-700"
                >
                    <ArrowLeft className="size-4" />
                    <span>{UI_TEXT.homeworkReview.backToList}</span>
                </button>

                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900">
                            {`${UI_TEXT.homeworkReview.submissionDetailPrefix} — ${studentInfo?.fullName || _studentName}`}{" "}
                            <span className="font-mono text-base font-bold text-slate-400">{`(${studentInfo?.studentCode || _studentCode})`}</span>
                        </h2>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                            {sessionInfo?.name
                                ? `${UI_TEXT.homeworkReview.sessionPrefix} ${sessionInfo.name}`
                                : className
                                  ? `${UI_TEXT.homeworkReview.classPrefix} ${className}`
                                  : ""}
                            {studentInfo?.dob ? ` • ${UI_TEXT.homeworkReview.dobPrefix} ${new Date(studentInfo.dob).toLocaleDateString("vi-VN")}` : ""}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {completionInfo?.aiFeedbackApproved && (
                            <span className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                                <CheckCircle2 className="size-3.5" />
                                {UI_TEXT.homeworkReview.approvedAiBadge}
                            </span>
                        )}

                        <Button
                            size="md"
                            color="primary"
                            onClick={() => approveAiMutation.mutate()}
                            isLoading={approveAiMutation.isPending}
                            className="gap-2 border-none bg-emerald-600 font-bold text-white shadow-xs hover:bg-emerald-700"
                            iconLeading={<Sparkles className="size-4 text-emerald-200" />}
                        >
                            {UI_TEXT.homeworkReview.approveAllAiBtn}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Table (Screen 2: Items in Session) */}
            {isLoading ? (
                <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-white p-8">
                    <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
                    <p className="text-xs font-bold text-slate-500">{UI_TEXT.homeworkReview.loadingSubmissions}</p>
                </div>
            ) : items.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-8 text-center">
                    <FileText className="size-10 text-slate-300" />
                    <h4 className="text-base font-bold text-slate-800">{UI_TEXT.homeworkReview.noHomeworkInSession}</h4>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-xs">
                    <table className="w-full text-left text-sm whitespace-normal">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                                <th className="w-12 px-4 py-3.5 text-center">{"#"}</th>
                                <th className="w-64 px-4 py-3.5">{UI_TEXT.homeworkReview.thHomework}</th>
                                <th className="w-36 px-4 py-3.5 text-center">{UI_TEXT.homeworkReview.thGithubLink}</th>
                                <th className="min-w-[300px] px-4 py-3.5">{UI_TEXT.homeworkReview.thAiComment}</th>
                                <th className="w-40 px-4 py-3.5 text-center">{UI_TEXT.homeworkReview.thAiResult}</th>
                                <th className="w-32 px-4 py-3.5 text-center">{UI_TEXT.homeworkReview.thAiStatus}</th>
                                <th className="w-32 px-4 py-3.5 text-center">{UI_TEXT.homeworkReview.thSubmittedAt}</th>
                                <th className="w-32 px-4 py-3.5 text-center">{UI_TEXT.homeworkReview.thUpdatedAt}</th>
                                <th className="w-28 px-4 py-3.5 text-center">{UI_TEXT.homeworkReview.thActions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.map((item, idx) => {
                                const isCompletedAi = item.aiStatus === AiStatusEnum.COMPLETED;
                                const isPassed = item.aiDecision === AiDecisionEnum.PASS;
                                const isFailed = item.aiDecision === AiDecisionEnum.FAIL;

                                return (
                                    <tr key={item.homeworkId || idx} className="transition duration-150 hover:bg-slate-50/80">
                                        <td className="px-4 py-4 text-center font-bold text-slate-400">{idx + 1}</td>

                                        {/* Bài tập */}
                                        <td className="px-4 py-4">
                                            <p className="leading-snug font-bold text-slate-900">{item.title}</p>
                                        </td>

                                        {/* Link Github */}
                                        <td className="px-4 py-4 text-center">
                                            {item.githubUrl ? (
                                                <div className="flex flex-col items-center gap-1">
                                                    <a
                                                        href={item.githubUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline"
                                                    >
                                                        <span>{UI_TEXT.homeworkReview.githubLabel}</span>
                                                        <ExternalLink className="size-3" />
                                                    </a>
                                                    {item.branch && (
                                                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
                                                            {item.branch}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-300 italic">{UI_TEXT.homeworkReview.notSubmitted}</span>
                                            )}
                                        </td>

                                        {/* Nhận xét AI */}
                                        <td className="px-4 py-4">
                                            {item.aiSummary ? (
                                                <div className="max-h-36 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/90 p-2.5 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-slate-700">
                                                    {item.aiSummary}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">{UI_TEXT.homeworkReview.noCommentYet}</span>
                                            )}
                                        </td>

                                        {/* Kết quả AI */}
                                        <td className="px-4 py-4 text-center">
                                            {isCompletedAi ? (
                                                <div className="space-y-1">
                                                    {isPassed ? (
                                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                                                            <CheckCircle2 className="size-3.5" />
                                                            {UI_TEXT.homeworkReview.statusPassUpper}
                                                        </span>
                                                    ) : isFailed ? (
                                                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600">
                                                            <XCircle className="size-3.5" />
                                                            {UI_TEXT.homeworkReview.statusFailUpper}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">{"—"}</span>
                                                    )}
                                                    {item.aiScore != null && (
                                                        <div className="text-xs font-semibold text-slate-600">
                                                            {`${item.aiScore} / ${item.aiMaxScore || defaultMaxScoreNum}`}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-xs font-medium text-slate-400">{UI_TEXT.homeworkReview.badgeAiNotGraded}</span>
                                            )}
                                        </td>

                                        {/* Trạng thái AI */}
                                        <td className="px-4 py-4 text-center">{getAiStatusBadge(item.aiStatus)}</td>

                                        {/* Ngày nộp */}
                                        <td className="px-4 py-4 text-center text-xs font-medium text-slate-600">
                                            {item.submittedAt ? new Date(item.submittedAt).toLocaleString("vi-VN") : "—"}
                                        </td>

                                        {/* Cập nhật lúc */}
                                        <td className="px-4 py-4 text-center text-xs font-medium text-slate-600">
                                            {item.updatedAt ? new Date(item.updatedAt).toLocaleString("vi-VN") : "—"}
                                        </td>

                                        {/* Hành động */}
                                        <td className="px-4 py-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(item)}
                                                disabled={!item.submissionId}
                                                title={UI_TEXT.homeworkReview.editCommentTitle}
                                                aria-label={UI_TEXT.homeworkReview.editCommentTitle}
                                                className="inline-flex items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 p-2 text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                <Edit3 className="size-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Sửa nhận xét */}
            {editingSubmission && (
                <CustomModal.Root open={!!editingSubmission} onOpenChange={(open) => !open && setEditingSubmission(null)}>
                    <CustomModal.Content className="max-w-lg rounded-[24px] border-none bg-white p-6 shadow-2xl">
                        <Dialog className="flex flex-col gap-4 outline-none">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <h3 className="text-base font-extrabold text-slate-900">{UI_TEXT.homeworkReview.modalEditTitle}</h3>
                                    <p className="text-xs font-medium text-slate-500">{editingSubmission.title}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEditingSubmission(null)}
                                    title={UI_TEXT.common.cancel}
                                    aria-label={UI_TEXT.common.cancel}
                                    className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-slate-700">{UI_TEXT.homeworkReview.modalResultLabel}</label>
                                    <select
                                        value={formDecision}
                                        onChange={(e) => setFormDecision(e.target.value as AiDecisionEnum)}
                                        className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-800 focus:border-emerald-500 focus:outline-none"
                                    >
                                        <option value={AiDecisionEnum.PASS}>{UI_TEXT.homeworkReview.modalPassOption}</option>
                                        <option value={AiDecisionEnum.FAIL}>{UI_TEXT.homeworkReview.modalFailOption}</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block text-xs font-bold text-slate-700">{UI_TEXT.homeworkReview.modalScoreLabel}</label>
                                        <input
                                            type="number"
                                            value={formScore}
                                            onChange={(e) => setFormScore(e.target.value)}
                                            placeholder={UI_TEXT.homeworkReview.modalScorePlaceholder}
                                            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-bold text-slate-700">{UI_TEXT.homeworkReview.modalMaxScoreLabel}</label>
                                        <input
                                            type="number"
                                            value={formMaxScore}
                                            onChange={(e) => setFormMaxScore(e.target.value)}
                                            placeholder={UI_TEXT.homeworkReview.modalMaxScorePlaceholder}
                                            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-bold text-slate-700">{UI_TEXT.homeworkReview.modalSummaryLabel}</label>
                                    <textarea
                                        value={formSummary}
                                        onChange={(e) => setFormSummary(e.target.value)}
                                        placeholder={UI_TEXT.homeworkReview.modalSummaryPlaceholder}
                                        rows={5}
                                        className="w-full rounded-xl border border-slate-200 p-3 font-mono text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                                <Button size="sm" color="secondary" onClick={() => setEditingSubmission(null)}>
                                    {UI_TEXT.homeworkReview.modalCancelBtn}
                                </Button>
                                <Button
                                    size="sm"
                                    color="primary"
                                    onClick={() => editFeedbackMutation.mutate()}
                                    isLoading={editFeedbackMutation.isPending}
                                    className="border-none bg-emerald-600 font-bold text-white hover:bg-emerald-700"
                                >
                                    {UI_TEXT.homeworkReview.modalSaveBtn}
                                </Button>
                            </div>
                        </Dialog>
                    </CustomModal.Content>
                </CustomModal.Root>
            )}
        </div>
    );
}
