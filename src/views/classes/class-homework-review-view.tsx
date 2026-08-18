"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Download, Eye, Filter, HelpCircle, RotateCcw, Search, Sparkles, Users, XCircle } from "lucide-react";
import { Breadcrumb } from "@/components/application/breadcrumb";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Select } from "@/components/base/select/select";
import { ALL_FILTER } from "@/constants/application.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { getClassDetail } from "@/services/class.service";
import { getCompletionsBySession, getSessionsByCourseId, markSessionCompletion } from "@/services/homework-completion.service";
import { toast } from "@/services/toast.service";
import { type ClassHomeworkReviewViewProps, HomeworkStatusEnum } from "@/types/homework.types";
import { extractCourseMongoId, isValidMongoId } from "@/utils/class.utils";
import { StudentHomeworkDetailView } from "@/views/classes/student-homework-detail-view";

const ungradedFilterKey = "UNGRADED";

export function ClassHomeworkReviewView({ classId }: ClassHomeworkReviewViewProps) {
    const queryClient = useQueryClient();
    const [selectedCourseId, setSelectedCourseId] = useState<string>("");
    const [selectedSessionId, setSelectedSessionId] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>(ALL_FILTER);

    // Full-page view state for student detail
    const [selectedStudent, setSelectedStudent] = useState<{ id: string; name: string; code: string; sessionId: string } | null>(null);

    // Query Class Details
    const { data: classInfo, isLoading: isLoadingClass } = useQuery({
        queryKey: ["class-detail", classId],
        queryFn: () => getClassDetail(classId),
        enabled: !!classId,
    });

    const coursesAssigned = classInfo?.courses || classInfo?.coursesAssigned || [];
    const courseOptions = (coursesAssigned as Array<Record<string, unknown>>).map((c) => {
        const mongoId = extractCourseMongoId(c);
        const rawCourse = typeof c.courseId === "object" && c.courseId !== null ? (c.courseId as Record<string, unknown>) : null;
        const courseName = String(rawCourse?.name || c.courseName || c.name || mongoId);
        const courseCode = String(rawCourse?.courseCode || c.courseCode || "");
        const label = courseCode ? `${courseCode} - ${courseName}` : courseName;
        return {
            id: mongoId,
            label,
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

    const sessionOptions = sessions.map((s: Record<string, unknown>) => {
        const sId = String(s.id || s._id || "");
        const pos = s.position != null ? String(s.position) : "";
        const nameStr = String(s.name || "");
        return {
            id: sId,
            label: pos ? `Buổi ${pos}: ${nameStr}` : nameStr,
        };
    });

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

    const activeSession = sessions.find((s: Record<string, unknown>) => String(s.id || s._id || "") === selectedSessionId) as
        Record<string, unknown> | undefined;
    const maxAi = activeSession?.maxAiGradeAttempts != null ? Number(activeSession.maxAiGradeAttempts) : undefined;

    // Query Homework Completions (roster) for selected session & class
    const { data: completions = [], isLoading: isLoadingCompletions } = useQuery({
        queryKey: ["homework-completions", selectedSessionId, classId],
        queryFn: () => getCompletionsBySession(selectedSessionId, classId),
        enabled: !!selectedSessionId && !!classId,
    });

    // Mutation for marking session status per student (API #2)
    const markSessionMutation = useMutation({
        mutationFn: ({
            studentId,
            status,
        }: {
            studentId: string;
            status: HomeworkStatusEnum.COMPLETED | HomeworkStatusEnum.NOT_COMPLETED | HomeworkStatusEnum.PENDING_TEACHER;
        }) =>
            markSessionCompletion({
                studentId,
                sessionId: selectedSessionId,
                classId,
                status,
            }),
        onSuccess: () => {
            toast.success(UI_TEXT.homeworkReview.toastSuccessTitle, UI_TEXT.homeworkReview.toastSuccessUpdate);
            queryClient.invalidateQueries({ queryKey: ["homework-completions"] });
            queryClient.invalidateQueries({ queryKey: ["class-rpoints-map"] });
            queryClient.invalidateQueries({ queryKey: ["course-class-statistics"] });
            queryClient.invalidateQueries({ queryKey: ["student-rpoint-detail"] });
            queryClient.invalidateQueries({ queryKey: ["class-detail"] });
        },
        onError: (err: Error) => {
            toast.error(UI_TEXT.homeworkReview.toastErrorTitle, err.message || UI_TEXT.homeworkReview.toastErrorUpdate);
        },
    });

    // Calculated KPI metrics
    const totalCompletions = completions.length;
    const completedCount = completions.filter((c) => c.status === HomeworkStatusEnum.COMPLETED).length;
    const notCompletedCount = completions.filter((c) => c.status === HomeworkStatusEnum.NOT_COMPLETED).length;
    const pendingCount = completions.filter(
        (c) => !c.status || c.status === HomeworkStatusEnum.PENDING_AI || c.status === HomeworkStatusEnum.PENDING_TEACHER,
    ).length;

    // Filtered completions roster list
    const filteredCompletions = completions.filter((item) => {
        const stName = item.student?.fullName || "";
        const stCode = item.student?.studentCode || item.student?.email || "";
        const matchesSearch =
            !searchQuery || stName.toLowerCase().includes(searchQuery.toLowerCase()) || stCode.toLowerCase().includes(searchQuery.toLowerCase());

        if (!matchesSearch) return false;

        if (statusFilter === ALL_FILTER) return true;
        if (statusFilter === ungradedFilterKey) return !item.status;
        return item.status === statusFilter;
    });

    // Client-side Excel export
    const handleExportExcel = () => {
        if (!filteredCompletions.length) return;
        const headers = ["STT", "Họ và tên", "MSSV", "Ngày sinh", "Số bài nộp", "Trạng thái", "Ngày cập nhật"];
        const rows = filteredCompletions.map((item, idx) => {
            const name = item.student?.fullName || "";
            const code = item.student?.studentCode || item.student?.email || "";
            const dob = item.student?.dob ? new Date(item.student.dob).toLocaleDateString("vi-VN") : "—";
            const submitted = item.submittedCount ?? item.submissionCount ?? 0;
            const status =
                item.status === HomeworkStatusEnum.COMPLETED
                    ? "HOÀN THÀNH"
                    : item.status === HomeworkStatusEnum.NOT_COMPLETED
                      ? "CHƯA HOÀN THÀNH"
                      : "Chưa chấm";
            const updated = item.updatedAt ? new Date(item.updatedAt).toLocaleString("vi-VN") : "—";
            return [idx + 1, `"${name}"`, `"${code}"`, `"${dob}"`, submitted, `"${status}"`, `"${updated}"`].join(",");
        });

        const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const sessionName = activeSession?.name || selectedSessionId;
        link.setAttribute("download", `BTVN_Session_${sessionName}_Roster.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (selectedStudent) {
        return (
            <StudentHomeworkDetailView
                studentId={selectedStudent.id}
                studentName={selectedStudent.name}
                studentCode={selectedStudent.code}
                sessionId={selectedStudent.sessionId}
                classId={classId}
                courseId={selectedCourseId}
                className={classInfo?.name}
                onBack={() => setSelectedStudent(null)}
            />
        );
    }

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

                    <Button
                        size="md"
                        color="secondary"
                        onClick={handleExportExcel}
                        isDisabled={filteredCompletions.length === 0}
                        className="gap-2 font-bold shadow-2xs"
                        iconLeading={<Download className="size-4 text-slate-600" />}
                    >
                        {UI_TEXT.homeworkReview.exportExcelBtn}
                    </Button>
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
                                    <Select.Item key={item.id} id={item.id} label={item.label}>
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
                                    <Select.Item key={item.id} id={item.id} label={item.label}>
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
                        <span className="text-xs font-semibold text-slate-500">{UI_TEXT.homeworkReview.cardTotalStudentsTitle}</span>
                        <strong className="mt-1 block text-2xl font-extrabold text-slate-900">{totalCompletions}</strong>
                        <span className="text-[11px] text-slate-400">{UI_TEXT.homeworkReview.cardTotalStudentsSubtitle}</span>
                    </div>
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <Users className="size-5" />
                    </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
                    <div>
                        <span className="text-xs font-semibold text-slate-500">{UI_TEXT.homeworkReview.cardPendingTitle}</span>
                        <strong className="mt-1 block text-2xl font-extrabold text-amber-600">{pendingCount}</strong>
                        <span className="text-[11px] text-slate-400">{UI_TEXT.homeworkReview.cardPendingSubtitle}</span>
                    </div>
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                        <RotateCcw className="size-5" />
                    </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
                    <div>
                        <span className="text-xs font-semibold text-slate-500">{UI_TEXT.homeworkReview.cardNotCompletedTitle}</span>
                        <strong className="mt-1 block text-2xl font-extrabold text-rose-600">{notCompletedCount}</strong>
                        <span className="text-[11px] text-slate-400">{UI_TEXT.homeworkReview.cardNotCompletedSubtitle}</span>
                    </div>
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                        <XCircle className="size-5" />
                    </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
                    <div>
                        <span className="text-xs font-semibold text-slate-500">{UI_TEXT.homeworkReview.cardCompletedTitle}</span>
                        <strong className="mt-1 block text-2xl font-extrabold text-emerald-600">{completedCount}</strong>
                        <span className="text-[11px] text-slate-400">{UI_TEXT.homeworkReview.cardCompletedSubtitle}</span>
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
                        <option value={ungradedFilterKey}>{UI_TEXT.homeworkReview.tableHeaderUngraded}</option>
                        <option value={HomeworkStatusEnum.COMPLETED}>{UI_TEXT.classHomeworkReview.filterCompleted}</option>
                        <option value={HomeworkStatusEnum.NOT_COMPLETED}>{UI_TEXT.classHomeworkReview.filterNotCompleted}</option>
                    </select>
                </div>
            </div>

            {/* Main Table Roster */}
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
                                <th className="px-4 py-3.5">{UI_TEXT.homeworkReview.thFullName}</th>
                                <th className="px-4 py-3.5">{UI_TEXT.homeworkReview.thStudentCode}</th>
                                <th className="px-4 py-3.5 text-center">{UI_TEXT.homeworkReview.thDob}</th>
                                <th className="px-4 py-3.5 text-center">{UI_TEXT.homeworkReview.thSubmissionCount}</th>
                                <th className="px-4 py-3.5 text-center">{UI_TEXT.homeworkReview.thStatus}</th>
                                <th className="px-4 py-3.5 text-center">{UI_TEXT.homeworkReview.thUpdatedAt}</th>
                                <th className="px-4 py-3.5 text-center">{UI_TEXT.homeworkReview.thActions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredCompletions.map((item, idx) => {
                                const stId = item.studentId || item.student?.id || "";
                                const stName = item.student?.fullName || UI_TEXT.enrollStudentModal.defaultStudentLabel;
                                const stCode = item.student?.studentCode || item.student?.email || "-";
                                const dob = item.student?.dob ? new Date(item.student.dob).toLocaleDateString("vi-VN") : "—";
                                const submittedCount = item.submittedCount ?? item.submissionCount ?? 0;
                                const currentStatus = item.status;

                                return (
                                    <tr key={stId || idx} className="transition duration-150 hover:bg-slate-50/80">
                                        <td className="px-4 py-3.5 text-center font-semibold text-slate-400">{idx + 1}</td>

                                        {/* Họ tên */}
                                        <td className="px-4 py-3.5">
                                            <p className="font-bold text-slate-900">{stName}</p>
                                        </td>

                                        {/* MSSV */}
                                        <td className="px-4 py-3.5">
                                            <span className="font-mono text-xs text-slate-600">{stCode}</span>
                                        </td>

                                        {/* Ngày sinh */}
                                        <td className="px-4 py-3.5 text-center text-xs text-slate-600">{dob}</td>

                                        {/* Số bài nộp */}
                                        <td className="px-4 py-3.5 text-center">
                                            <Badge
                                                color={submittedCount > 0 ? "brand" : "gray"}
                                            >{`${submittedCount} ${UI_TEXT.homeworkReview.submissionsSuffix}`}</Badge>
                                        </td>

                                        {/* Dropdown Trạng thái */}
                                        <td className="px-4 py-3.5 text-center">
                                            <select
                                                value={
                                                    currentStatus === HomeworkStatusEnum.COMPLETED
                                                        ? HomeworkStatusEnum.COMPLETED
                                                        : currentStatus === HomeworkStatusEnum.NOT_COMPLETED
                                                          ? HomeworkStatusEnum.NOT_COMPLETED
                                                          : HomeworkStatusEnum.PENDING_TEACHER
                                                }
                                                onChange={(e) => {
                                                    const val = e.target.value as
                                                        HomeworkStatusEnum.COMPLETED | HomeworkStatusEnum.NOT_COMPLETED | HomeworkStatusEnum.PENDING_TEACHER;
                                                    if (val) {
                                                        markSessionMutation.mutate({ studentId: stId, status: val });
                                                    }
                                                }}
                                                disabled={markSessionMutation.isPending}
                                                className={`rounded-xl border px-3 py-1.5 text-xs font-bold shadow-2xs focus:outline-none ${
                                                    currentStatus === HomeworkStatusEnum.COMPLETED
                                                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                        : currentStatus === HomeworkStatusEnum.NOT_COMPLETED
                                                          ? "border-rose-200 bg-rose-50 text-rose-700"
                                                          : "border-amber-200 bg-amber-50 text-amber-800"
                                                }`}
                                            >
                                                <option value={HomeworkStatusEnum.PENDING_TEACHER}>{UI_TEXT.homeworkReview.tableHeaderUngraded}</option>
                                                <option value={HomeworkStatusEnum.COMPLETED}>{UI_TEXT.homeworkReview.statusCompletedUpper}</option>
                                                <option value={HomeworkStatusEnum.NOT_COMPLETED}>{UI_TEXT.homeworkReview.statusNotCompletedUpper}</option>
                                            </select>
                                        </td>

                                        {/* Ngày cập nhật */}
                                        <td className="px-4 py-3.5 text-center text-xs font-medium text-slate-500">
                                            {item.updatedAt ? new Date(item.updatedAt).toLocaleString("vi-VN") : "—"}
                                        </td>

                                        {/* Hành động */}
                                        <td className="px-4 py-3.5 text-center">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedStudent({
                                                        id: stId,
                                                        sessionId: selectedSessionId,
                                                        name: stName,
                                                        code: stCode,
                                                    });
                                                }}
                                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-emerald-700"
                                            >
                                                <Eye className="size-3.5 text-slate-500" />
                                                <span>{UI_TEXT.homeworkReview.actionDetail}</span>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
