"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Download, Eye, HelpCircle, RotateCcw, Users, XCircle } from "lucide-react";
import { Breadcrumb } from "@/components/application/breadcrumb";
import { SearchFilters } from "@/components/application/search-filters/search-filters";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Select } from "@/components/base/select/select";
import { ALL_FILTER } from "@/constants/application.constants";
import { HOMEWORK_REVIEW_FILTER_FIELDS, UNGRADED_FILTER_KEY } from "@/constants/class.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { getClassDetail } from "@/services/class.service";
import { getCompletionsBySession, getSessionsByCourseId, markSessionCompletion } from "@/services/homework-completion.service";
import { toast } from "@/services/toast.service";
import type { FilterState } from "@/types/filter.types";
import { type ClassHomeworkReviewViewProps, HomeworkStatusEnum } from "@/types/homework.types";
import { extractCourseMongoId, isValidMongoId } from "@/utils/class.utils";
import { StudentHomeworkDetailView } from "@/views/classes/student-homework-detail-view";

export function ClassHomeworkReviewView({ classId }: ClassHomeworkReviewViewProps) {
    const queryClient = useQueryClient();
    const [selectedCourseId, setSelectedCourseId] = useState<string>("");
    const [selectedSessionId, setSelectedSessionId] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [statusFilter] = useState<string>(ALL_FILTER);
    const [advancedFilterState, setAdvancedFilterState] = useState<FilterState>({
        conditions: [],
    });

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

        let matchesAdvanced = true;
        for (const condition of advancedFilterState.conditions) {
            if (!condition.fieldKey || condition.value === null || condition.value === "") continue;

            if (condition.fieldKey === "status") {
                const condVal = condition.value;
                const effectiveStatus = item.status || UNGRADED_FILTER_KEY;

                if (Array.isArray(condVal)) {
                    if (condVal.length > 0 && !condVal.includes(effectiveStatus)) {
                        matchesAdvanced = false;
                        break;
                    }
                } else if (condVal === UNGRADED_FILTER_KEY) {
                    if (item.status) {
                        matchesAdvanced = false;
                        break;
                    }
                } else if (item.status !== condVal) {
                    matchesAdvanced = false;
                    break;
                }
            }
        }

        if (!matchesAdvanced) return false;

        if (statusFilter === ALL_FILTER) return true;
        if (statusFilter === UNGRADED_FILTER_KEY) return !item.status;
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
                        color="primary"
                        onClick={handleExportExcel}
                        isDisabled={filteredCompletions.length === 0}
                        className="gap-2 !bg-emerald-600 font-bold !text-white shadow-2xs hover:!bg-emerald-700 disabled:opacity-50"
                        iconLeading={<Download className="size-4 text-white" />}
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
                <SearchFilters
                    search={searchQuery}
                    onSearchChange={setSearchQuery}
                    advancedFilterState={advancedFilterState}
                    setAdvancedFilterState={setAdvancedFilterState}
                    filterFields={HOMEWORK_REVIEW_FILTER_FIELDS}
                    searchPlaceholder={UI_TEXT.classHomeworkReview.filterSearchPlaceholder}
                />
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
                                <th className="w-12 px-6 py-4 text-center">{"#"}</th>
                                <th className="px-6 py-4">{UI_TEXT.homeworkReview.thFullName}</th>
                                <th className="px-6 py-4">{UI_TEXT.homeworkReview.thStudentCode}</th>
                                <th className="px-6 py-4 text-center">{UI_TEXT.homeworkReview.thDob}</th>
                                <th className="px-6 py-4 text-center">{UI_TEXT.homeworkReview.thSubmissionCount}</th>
                                <th className="px-6 py-4 text-center">{UI_TEXT.homeworkReview.thStatus}</th>
                                <th className="px-6 py-4 text-center">{UI_TEXT.homeworkReview.thUpdatedAt}</th>
                                <th className="px-6 py-4 text-center">{UI_TEXT.homeworkReview.thActions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                            {filteredCompletions.map((item, idx) => {
                                const stId = item.studentId || item.student?.id || "";
                                const stName = item.student?.fullName || UI_TEXT.enrollStudentModal.defaultStudentLabel;
                                const stCode = item.student?.studentCode || item.student?.email || "-";
                                const dob = item.student?.dob ? new Date(item.student.dob).toLocaleDateString("vi-VN") : "—";
                                const submittedCount = item.submittedCount ?? item.submissionCount ?? 0;
                                const currentStatus = item.status;

                                return (
                                    <tr key={stId || idx} className="group transition duration-150 hover:bg-slate-50">
                                        <td className="px-6 py-4 text-center font-semibold text-slate-400">{idx + 1}</td>

                                        {/* Họ tên */}
                                        <td className="px-6 py-4 text-[14.5px] font-bold text-slate-900">{stName}</td>

                                        {/* MSSV */}
                                        <td className="px-6 py-4 font-mono text-[13px] font-medium text-slate-700">{stCode}</td>

                                        {/* Ngày sinh */}
                                        <td className="px-6 py-4 text-center text-xs font-semibold text-slate-500">{dob}</td>

                                        {/* Số bài nộp */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center">
                                                <Badge
                                                    color={submittedCount > 0 ? "brand" : "gray"}
                                                    className="font-mono text-xs font-bold"
                                                >{`${submittedCount} ${UI_TEXT.homeworkReview.submissionsSuffix}`}</Badge>
                                            </div>
                                        </td>

                                        {/* Dropdown Trạng thái */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="mx-auto w-[165px]">
                                                <Select
                                                    size="sm"
                                                    isClearable={false}
                                                    isDisabled={markSessionMutation.isPending}
                                                    selectedKey={
                                                        currentStatus === HomeworkStatusEnum.COMPLETED
                                                            ? HomeworkStatusEnum.COMPLETED
                                                            : currentStatus === HomeworkStatusEnum.NOT_COMPLETED
                                                              ? HomeworkStatusEnum.NOT_COMPLETED
                                                              : HomeworkStatusEnum.PENDING_TEACHER
                                                    }
                                                    onSelectionChange={(key) => {
                                                        const val = String(key || "") as
                                                            | HomeworkStatusEnum.COMPLETED
                                                            | HomeworkStatusEnum.NOT_COMPLETED
                                                            | HomeworkStatusEnum.PENDING_TEACHER;
                                                        if (val) {
                                                            markSessionMutation.mutate({ studentId: stId, status: val });
                                                        }
                                                    }}
                                                    triggerClassName={`!rounded-full border !px-3 !py-0.5 *:!py-0.5 *:!px-0 *:!w-full *:!justify-between !h-7 !min-h-0 text-xs font-extrabold shadow-2xs [&_p]:!text-inherit [&_svg]:!text-inherit ${
                                                        currentStatus === HomeworkStatusEnum.COMPLETED
                                                            ? "!border-success-200 !bg-success-50 !text-success-700 hover:!bg-success-100"
                                                            : currentStatus === HomeworkStatusEnum.NOT_COMPLETED
                                                              ? "!border-error-200 !bg-error-50 !text-error-600 hover:!bg-error-100"
                                                              : "!border-warning-200 !bg-warning-50 !text-warning-700 hover:!bg-warning-100"
                                                    }`}
                                                    items={[
                                                        { id: HomeworkStatusEnum.PENDING_TEACHER, label: UI_TEXT.homeworkReview.tableHeaderUngraded },
                                                        { id: HomeworkStatusEnum.COMPLETED, label: UI_TEXT.classHomeworkReview.filterCompleted },
                                                        { id: HomeworkStatusEnum.NOT_COMPLETED, label: UI_TEXT.classHomeworkReview.filterNotCompleted },
                                                    ]}
                                                >
                                                    {(item) => (
                                                        <Select.Item
                                                            id={item.id}
                                                            label={item.label}
                                                            className={`!text-xs !font-bold ${
                                                                item.id === HomeworkStatusEnum.COMPLETED
                                                                    ? "text-success-700"
                                                                    : item.id === HomeworkStatusEnum.NOT_COMPLETED
                                                                      ? "text-error-600"
                                                                      : "text-warning-700"
                                                            }`}
                                                        >
                                                            {item.label}
                                                        </Select.Item>
                                                    )}
                                                </Select>
                                            </div>
                                        </td>

                                        {/* Ngày cập nhật */}
                                        <td className="px-6 py-4 text-center font-mono text-xs text-slate-500">
                                            {item.updatedAt ? new Date(item.updatedAt).toLocaleString("vi-VN") : "—"}
                                        </td>

                                        {/* Hành động */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center">
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
                                                    className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition duration-200 hover:bg-indigo-600 hover:text-white"
                                                    title={UI_TEXT.homeworkReview.actionDetail}
                                                >
                                                    <Eye className="size-4" />
                                                </button>
                                            </div>
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
