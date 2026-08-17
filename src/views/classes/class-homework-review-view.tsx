"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Eye, FileText, Filter, HelpCircle, RotateCcw, Search, ShieldAlert, Sparkles, UserCheck, Users } from "lucide-react";
import { Breadcrumb } from "@/components/application/breadcrumb";
import { StudentHomeworkDetailModal } from "@/components/application/modals/student-homework-detail-modal";
import { Badge } from "@/components/base/badges/badges";
import { Select } from "@/components/base/select/select";
import { ALL_FILTER } from "@/constants/application.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { getClassDetail } from "@/services/class.service";
import { approveCompletionFeedback, getCompletionsBySession, getSessionsByCourseId, gradeCompletion } from "@/services/homework-completion.service";
import { toast } from "@/services/toast.service";
import { AiDecisionEnum, AiStatusEnum, type ClassHomeworkReviewViewProps, HomeworkStatusEnum } from "@/types/homework.types";
import { extractCourseMongoId, isValidMongoId } from "@/utils/class.utils";

export function ClassHomeworkReviewView({ classId }: ClassHomeworkReviewViewProps) {
    const queryClient = useQueryClient();
    const [selectedCourseId, setSelectedCourseId] = useState<string>("");
    const [selectedSessionId, setSelectedSessionId] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>(ALL_FILTER);

    // Modal state for detail view
    const [selectedCompletionId, setSelectedCompletionId] = useState<string | null>(null);

    // Query Class Details
    const { data: classInfo, isLoading: isLoadingClass } = useQuery({
        queryKey: ["class-detail", classId],
        queryFn: () => getClassDetail(classId),
        enabled: !!classId,
    });

    const coursesAssigned = classInfo?.coursesAssigned || [];
    const courseOptions = coursesAssigned.map((c) => {
        const mongoId = extractCourseMongoId(c);
        return {
            id: mongoId,
            label: c.courseName || mongoId,
        };
    });

    // Default select first course when loaded
    useEffect(() => {
        if (!selectedCourseId && courseOptions.length > 0) {
            setSelectedCourseId(courseOptions[0].id);
        }
    }, [courseOptions, selectedCourseId]);

    // Query Sessions by selected course
    const { data: sessions = [], isLoading: isLoadingSessions } = useQuery({
        queryKey: ["course-sessions", selectedCourseId],
        queryFn: () => getSessionsByCourseId(selectedCourseId),
        enabled: !!selectedCourseId && isValidMongoId(selectedCourseId),
    });

    const sessionOptions = sessions.map((s) => ({
        id: s.id,
        label: s.position ? `Buổi ${s.position}: ${s.name}` : s.name,
    }));

    // Default select first session when sessions loaded
    useEffect(() => {
        if (sessionOptions.length > 0) {
            const exists = sessionOptions.some((so) => so.id === selectedSessionId);
            if (!selectedSessionId || !exists) {
                setSelectedSessionId(sessionOptions[0].id);
            }
        } else {
            setSelectedSessionId("");
        }
    }, [sessionOptions, selectedSessionId]);

    const activeSession = sessions.find((s) => s.id === selectedSessionId);
    const maxAi = activeSession?.maxAiGradeAttempts;

    // Query Homework Completions for selected session & class
    const { data: completions = [], isLoading: isLoadingCompletions } = useQuery({
        queryKey: ["homework-completions", selectedSessionId, classId],
        queryFn: () => getCompletionsBySession(selectedSessionId, classId),
        enabled: !!selectedSessionId && !!classId,
    });

    // Mutations for quick actions
    const approveFeedbackMutation = useMutation({
        mutationFn: (completionId: string) => approveCompletionFeedback(completionId),
        onSuccess: () => {
            toast.success(UI_TEXT.classHomeworkReview.toastSuccess, UI_TEXT.studentHomeworkDetailModal.toastApproveSuccess);
            queryClient.invalidateQueries({ queryKey: ["homework-completions", selectedSessionId, classId] });
        },
        onError: (err: Error) => {
            toast.error(UI_TEXT.classHomeworkReview.toastError, err.message || UI_TEXT.studentHomeworkDetailModal.toastApproveError);
        },
    });

    const gradeMutation = useMutation({
        mutationFn: ({ completionId, status }: { completionId: string; status: HomeworkStatusEnum.COMPLETED | HomeworkStatusEnum.NOT_COMPLETED }) =>
            gradeCompletion(completionId, { status }),
        onSuccess: (_, variables) => {
            toast.success(
                UI_TEXT.classHomeworkReview.toastSuccess,
                variables.status === HomeworkStatusEnum.COMPLETED
                    ? UI_TEXT.studentHomeworkDetailModal.toastGradeCompletedSuccess
                    : UI_TEXT.studentHomeworkDetailModal.toastGradeNotCompletedSuccess,
            );
            queryClient.invalidateQueries({ queryKey: ["homework-completions", selectedSessionId, classId] });
        },
        onError: (err: Error) => {
            toast.error(UI_TEXT.classHomeworkReview.toastError, err.message || UI_TEXT.studentHomeworkDetailModal.toastGradeError);
        },
    });

    // Calculated KPI metrics
    const totalCompletions = completions.length;
    const pendingAiCount = completions.filter((c) => c.status === HomeworkStatusEnum.PENDING_AI).length;
    const pendingTeacherCount = completions.filter((c) => c.status === HomeworkStatusEnum.PENDING_TEACHER).length;
    const completedCount = completions.filter((c) => c.status === HomeworkStatusEnum.COMPLETED).length;

    // Filtered completions list
    const filteredCompletions = completions.filter((item) => {
        const matchesSearch =
            !searchQuery ||
            item.student?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.student?.studentCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.homework?.title?.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (statusFilter === ALL_FILTER) return true;
        if (statusFilter === AiStatusEnum.SKIPPED) return item.aiStatus === AiStatusEnum.SKIPPED;
        return item.status === statusFilter;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case HomeworkStatusEnum.COMPLETED:
                return <Badge color="success">{UI_TEXT.classHomeworkReview.badgeCompleted}</Badge>;
            case HomeworkStatusEnum.NOT_COMPLETED:
                return <Badge color="error">{UI_TEXT.classHomeworkReview.badgeNotCompleted}</Badge>;
            case HomeworkStatusEnum.PENDING_AI:
                return <Badge color="warning">{UI_TEXT.classHomeworkReview.badgePendingAi}</Badge>;
            case HomeworkStatusEnum.PENDING_TEACHER:
                return <Badge color="brand">{UI_TEXT.classHomeworkReview.badgePendingTeacher}</Badge>;
            default:
                return <Badge color="gray">{status}</Badge>;
        }
    };

    const getAiStatusBadge = (aiStatus?: string) => {
        switch (aiStatus) {
            case AiStatusEnum.COMPLETED:
                return <Badge color="success">{UI_TEXT.classHomeworkReview.badgeAiCompleted}</Badge>;
            case AiStatusEnum.SKIPPED:
                return <Badge color="error">{UI_TEXT.classHomeworkReview.badgeAiSkipped}</Badge>;
            case AiStatusEnum.RUNNING:
                return <Badge color="brand">{UI_TEXT.classHomeworkReview.badgeAiRunning}</Badge>;
            case AiStatusEnum.FAILED:
                return <Badge color="error">{UI_TEXT.classHomeworkReview.badgeAiFailed}</Badge>;
            case AiStatusEnum.PENDING:
                return <Badge color="warning">{UI_TEXT.classHomeworkReview.badgeAiPending}</Badge>;
            default:
                return <Badge color="gray">{aiStatus || "—"}</Badge>;
        }
    };

    return (
        <div className="flex w-full flex-1 flex-col gap-6">
            {/* Header & Breadcrumb */}
            <div className="flex flex-col gap-3">
                <Breadcrumb
                    items={[
                        { label: UI_TEXT.classes.breadcrumbRoot, href: "/classes" },
                        { label: classInfo?.name || UI_TEXT.classDetail.title, href: `/classes/${classId}` },
                        { label: UI_TEXT.classHomeworkReview.headerTitle },
                    ]}
                />
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900">{`${UI_TEXT.classHomeworkReview.headerTitle} — ${classInfo?.name || UI_TEXT.classes.defaultClassName}`}</h2>
                        <p className="mt-0.5 text-xs text-slate-500">{UI_TEXT.classHomeworkReview.headerSubtitle}</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Course Select */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-600">{UI_TEXT.classHomeworkReview.courseLabel}</span>
                        <div className="w-64">
                            <Select
                                aria-label={UI_TEXT.classHomeworkReview.courseLabel}
                                placeholder={courseOptions.length === 0 ? UI_TEXT.classDetail.noAssignedCourses : UI_TEXT.classHomeworkReview.courseLabel}
                                items={courseOptions}
                                selectedKey={selectedCourseId}
                                onSelectionChange={(key) => setSelectedCourseId(String(key || ""))}
                                isClearable={false}
                                triggerClassName="!rounded-full border-slate-200 bg-white text-xs font-bold shadow-2xs"
                            >
                                {(item) => (
                                    <Select.Item key={item.id} id={item.id}>
                                        {item.label}
                                    </Select.Item>
                                )}
                            </Select>
                        </div>
                    </div>

                    {/* Session Select */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-600">{UI_TEXT.classHomeworkReview.sessionLabel}</span>
                        <div className="w-64">
                            <Select
                                aria-label={UI_TEXT.classHomeworkReview.sessionLabel}
                                placeholder={sessionOptions.length === 0 ? UI_TEXT.classHomeworkReview.sessionLabel : UI_TEXT.classHomeworkReview.sessionLabel}
                                items={sessionOptions}
                                selectedKey={selectedSessionId}
                                onSelectionChange={(key) => setSelectedSessionId(String(key || ""))}
                                isClearable={false}
                                triggerClassName="!rounded-full border-slate-200 bg-white text-xs font-bold shadow-2xs"
                            >
                                {(item) => (
                                    <Select.Item key={item.id} id={item.id}>
                                        {item.label}
                                    </Select.Item>
                                )}
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Session AI Attempt Config Info */}
                {selectedSessionId && (
                    <div className="flex items-center gap-2 rounded-xl border border-purple-100 bg-purple-50/70 px-3.5 py-2 text-xs text-purple-900">
                        <Sparkles className="size-4 shrink-0 text-purple-600" />
                        <span>
                            {UI_TEXT.classHomeworkReview.aiLimitConfigTitle}{" "}
                            <strong className="font-extrabold text-purple-700">
                                {maxAi != null
                                    ? `${UI_TEXT.classHomeworkReview.maxAttemptsLabel} ${maxAi} ${UI_TEXT.classHomeworkReview.timesLabel}`
                                    : UI_TEXT.classHomeworkReview.unlimitedLabel}
                            </strong>
                        </span>
                    </div>
                )}
            </div>

            {/* 4 KPI Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
                    <div>
                        <span className="text-xs font-semibold text-slate-500">{UI_TEXT.classHomeworkReview.statTotalTitle}</span>
                        <strong className="mt-1 block text-2xl font-extrabold text-slate-900">{totalCompletions}</strong>
                        <span className="text-[11px] text-slate-400">{UI_TEXT.classHomeworkReview.statTotalSub}</span>
                    </div>
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <FileText className="size-5" />
                    </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
                    <div>
                        <span className="text-xs font-semibold text-slate-500">{UI_TEXT.classHomeworkReview.statPendingAiTitle}</span>
                        <strong className="mt-1 block text-2xl font-extrabold text-amber-600">{pendingAiCount}</strong>
                        <span className="text-[11px] text-slate-400">{UI_TEXT.classHomeworkReview.statPendingAiSub}</span>
                    </div>
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                        <RotateCcw className="size-5" />
                    </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
                    <div>
                        <span className="text-xs font-semibold text-slate-500">{UI_TEXT.classHomeworkReview.statPendingTeacherTitle}</span>
                        <strong className="mt-1 block text-2xl font-extrabold text-brand-600">{pendingTeacherCount}</strong>
                        <span className="text-[11px] text-slate-400">{UI_TEXT.classHomeworkReview.statPendingTeacherSub}</span>
                    </div>
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                        <UserCheck className="size-5" />
                    </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
                    <div>
                        <span className="text-xs font-semibold text-slate-500">{UI_TEXT.classHomeworkReview.statCompletedTitle}</span>
                        <strong className="mt-1 block text-2xl font-extrabold text-emerald-600">{completedCount}</strong>
                        <span className="text-[11px] text-slate-400">{UI_TEXT.classHomeworkReview.statCompletedSub}</span>
                    </div>
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                        <CheckCircle2 className="size-5" />
                    </div>
                </div>
            </div>

            {/* Table Search & Status Filter */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative min-w-[240px] flex-1">
                    <Search className="absolute top-2.5 left-3 size-4 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={UI_TEXT.classHomeworkReview.filterSearchPlaceholder}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-4 pl-9 text-xs text-slate-800 placeholder-slate-400 shadow-2xs focus:border-emerald-500 focus:outline-none"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Filter className="size-3.5 text-slate-400" />
                    <span className="text-xs font-bold text-slate-500">{UI_TEXT.classHomeworkReview.filterStatusLabel}</span>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs focus:outline-none"
                    >
                        <option value={ALL_FILTER}>{UI_TEXT.classHomeworkReview.filterAll}</option>
                        <option value={HomeworkStatusEnum.PENDING_AI}>{UI_TEXT.classHomeworkReview.filterPendingAi}</option>
                        <option value={HomeworkStatusEnum.PENDING_TEACHER}>{UI_TEXT.classHomeworkReview.filterPendingTeacher}</option>
                        <option value={AiStatusEnum.SKIPPED}>{UI_TEXT.classHomeworkReview.filterSkipped}</option>
                        <option value={HomeworkStatusEnum.COMPLETED}>{UI_TEXT.classHomeworkReview.filterCompleted}</option>
                        <option value={HomeworkStatusEnum.NOT_COMPLETED}>{UI_TEXT.classHomeworkReview.filterNotCompleted}</option>
                    </select>
                </div>
            </div>

            {/* Main Table */}
            {isLoadingClass || isLoadingSessions || isLoadingCompletions ? (
                <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-white p-8">
                    <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
                    <p className="text-xs font-bold text-slate-500">{UI_TEXT.classDetail.loading}</p>
                </div>
            ) : !selectedSessionId ? (
                <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-8 text-center">
                    <HelpCircle className="size-10 text-slate-300" />
                    <h4 className="text-base font-bold text-slate-800">{UI_TEXT.classHomeworkReview.headerTitle}</h4>
                    <p className="text-xs text-slate-500">{UI_TEXT.classHomeworkReview.headerSubtitle}</p>
                </div>
            ) : filteredCompletions.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-8 text-center">
                    <Users className="size-10 text-slate-300" />
                    <h4 className="text-base font-bold text-slate-800">{UI_TEXT.classHomeworkReview.emptyCompletions}</h4>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-xs">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                                <th className="w-12 px-4 py-3.5 text-center">{"#"}</th>
                                <th className="px-4 py-3.5">{UI_TEXT.classHomeworkReview.thStudent}</th>
                                <th className="px-4 py-3.5">{UI_TEXT.classHomeworkReview.thSession}</th>
                                <th className="px-4 py-3.5 text-center">{UI_TEXT.classHomeworkReview.thSubmissions}</th>
                                <th className="px-4 py-3.5 text-center">{UI_TEXT.classHomeworkReview.thStatus}</th>
                                <th className="px-4 py-3.5 text-center">{UI_TEXT.classHomeworkReview.thAiResult}</th>
                                <th className="px-4 py-3.5 text-center">{UI_TEXT.studentHomeworkDetailModal.aiDecisionLabel}</th>
                                <th className="px-4 py-3.5 text-center">{UI_TEXT.studentHomeworkDetailModal.visibilityLabel}</th>
                                <th className="px-4 py-3.5 text-center">{UI_TEXT.classHomeworkReview.thAction}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredCompletions.map((item, idx) => {
                                const stName = item.student?.fullName || UI_TEXT.enrollStudentModal.defaultStudentLabel;
                                const stCode = item.student?.studentCode || "-";
                                const hwTitle = item.homework?.title || UI_TEXT.classDetail.featureCards.homeworkTitle;
                                const isSkipped = item.aiStatus === AiStatusEnum.SKIPPED;

                                return (
                                    <tr key={item.id} className="transition duration-150 hover:bg-slate-50/80">
                                        <td className="px-4 py-3.5 text-center font-semibold text-slate-400">{idx + 1}</td>

                                        {/* Student Info */}
                                        <td className="px-4 py-3.5">
                                            <div>
                                                <p className="font-bold text-slate-900">{stName}</p>
                                                <p className="font-mono text-xs text-slate-400">{stCode}</p>
                                            </div>
                                        </td>

                                        {/* Homework Title */}
                                        <td className="px-4 py-3.5">
                                            <p className="max-w-xs truncate font-semibold text-slate-800" title={hwTitle}>
                                                {hwTitle}
                                            </p>
                                        </td>

                                        {/* Submission count / Last attempt */}
                                        <td className="px-4 py-3.5 text-center">
                                            <span className="font-bold text-slate-700">{`${UI_TEXT.classHomeworkReview.attemptPrefix}${item.lastAttemptNo || item.submissionCount || 1}`}</span>
                                        </td>

                                        {/* Completion Status */}
                                        <td className="px-4 py-3.5 text-center">{getStatusBadge(item.status)}</td>

                                        {/* AI Status */}
                                        <td className="px-4 py-3.5 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                {getAiStatusBadge(item.aiStatus)}
                                                {isSkipped && (
                                                    <span className="flex items-center gap-1 rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                                                        <ShieldAlert className="size-3 shrink-0" />
                                                        {UI_TEXT.classHomeworkReview.badgeAiSkipped}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* AI Decision */}
                                        <td className="px-4 py-3.5 text-center">
                                            {item.aiDecision ? (
                                                <Badge color={item.aiDecision === AiDecisionEnum.PASS ? "success" : "error"} size="sm" className="font-bold">
                                                    {item.aiDecision}
                                                </Badge>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">{"—"}</span>
                                            )}
                                        </td>

                                        {/* Feedback Approved */}
                                        <td className="px-4 py-3.5 text-center">
                                            {item.isFeedbackApproved ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                                                    <CheckCircle2 className="size-3.5" />
                                                    {UI_TEXT.studentHomeworkDetailModal.visibilityApproved}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                                                    {UI_TEXT.studentHomeworkDetailModal.visibilityHidden}
                                                </span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-3.5 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedCompletionId(item.id)}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50"
                                                >
                                                    <Eye className="size-3.5 text-slate-500" />
                                                    <span>{UI_TEXT.classHomeworkReview.viewDetailBtn}</span>
                                                </button>

                                                {!item.isFeedbackApproved && (
                                                    <button
                                                        type="button"
                                                        onClick={() => approveFeedbackMutation.mutate(item.id)}
                                                        disabled={approveFeedbackMutation.isPending}
                                                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-xs font-bold text-emerald-700 shadow-2xs transition hover:bg-emerald-100"
                                                    >
                                                        <Sparkles className="size-3.5 text-emerald-600" />
                                                        <span>{UI_TEXT.studentHomeworkDetailModal.approveFeedbackBtn}</span>
                                                    </button>
                                                )}

                                                {item.status !== HomeworkStatusEnum.COMPLETED && (
                                                    <button
                                                        type="button"
                                                        onClick={() => gradeMutation.mutate({ completionId: item.id, status: HomeworkStatusEnum.COMPLETED })}
                                                        disabled={gradeMutation.isPending}
                                                        className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2 py-1.5 text-xs font-bold text-blue-700 shadow-2xs transition hover:bg-blue-100"
                                                    >
                                                        <CheckCircle2 className="size-3.5 text-blue-600" />
                                                        <span>{UI_TEXT.studentHomeworkDetailModal.badgeCompleted}</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Student Homework Detail Modal */}
            {selectedCompletionId && (
                <StudentHomeworkDetailModal isOpen={!!selectedCompletionId} onClose={() => setSelectedCompletionId(null)} completionId={selectedCompletionId} />
            )}
        </div>
    );
}
