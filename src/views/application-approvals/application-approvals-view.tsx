"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Eye, FileText, FolderOpen, RotateCcw, XCircle } from "lucide-react";
import { ApplicationDetailModal } from "@/components/application/modals/application-detail-modal";
import { SearchFilters } from "@/components/application/search-filters/search-filters";
import { Select } from "@/components/base/select/select";
import { AdminLayout } from "@/components/layout/admin/admin-layout";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { useAuth } from "@/hooks/use-auth";
import { applicationApprovalService } from "@/services/application-approval.service";
import { getCoursesList } from "@/services/course.service";
import { toast } from "@/services/toast.service";
import { type ApplicationItem, type ApplicationStats, ApplicationStatusEnum, ApplicationTypeEnum, ExamTypeEnum } from "@/types/application-approval.types";
import { cx } from "@/utils/cx";

export function ApplicationApprovalsView() {
    const { isLoading: isAuthLoading } = useAuth();

    // Active Category Tab state
    const [activeTab, setActiveTab] = useState<ApplicationTypeEnum>(ApplicationTypeEnum.ALL);

    // Filter states
    const [selectedStatus, setSelectedStatus] = useState<ApplicationStatusEnum>(ApplicationStatusEnum.ALL);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedSemester, setSelectedSemester] = useState<string>("");
    const [selectedCourse, setSelectedCourse] = useState<string>("");

    // Data & Stats states
    const [applications, setApplications] = useState<ApplicationItem[]>([]);
    const [coursesList, setCoursesList] = useState<{ id: string; label: string }[]>([]);
    const [stats, setStats] = useState<ApplicationStats>({
        totalCount: 0,
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Modal states
    const [selectedDetailItem, setSelectedDetailItem] = useState<ApplicationItem | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState<number>(1);
    const pageSize = 10;

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [data, statsData] = await Promise.all([
                applicationApprovalService.getApplications({
                    type: activeTab,
                    status: selectedStatus,
                    search: searchQuery,
                    semesterId: selectedSemester || undefined,
                    courseId: selectedCourse || undefined,
                }),
                applicationApprovalService.getStats(),
            ]);
            setApplications(data.items);
            setStats(statsData);
        } catch {
            toast.error(UI_TEXT.common.errorTitle || "Lỗi", UI_TEXT.applicationApprovals.toastFetchError);
        } finally {
            setIsLoading(false);
        }
    }, [activeTab, selectedStatus, searchQuery, selectedSemester, selectedCourse]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        void getCoursesList()
            .then((list) => {
                if (Array.isArray(list) && list.length > 0) {
                    setCoursesList(list.map((c) => ({ id: c.id, label: c.title })));
                }
            })
            .catch(() => {});
    }, []);

    const courseOptions =
        coursesList.length > 0
            ? coursesList
            : Array.from(new Set(applications.map((item) => item.courseName).filter(Boolean))).map((name) => ({ id: name!, label: name! }));

    const handleResetFilters = () => {
        setActiveTab(ApplicationTypeEnum.ALL);
        setSelectedStatus(ApplicationStatusEnum.ALL);
        setSearchQuery("");
        setSelectedSemester("");
        setSelectedCourse("");
        setCurrentPage(1);
    };

    const handleApproveSingle = async (id: string) => {
        try {
            await applicationApprovalService.approveApplication(id);
            toast.success(UI_TEXT.common.successTitle || "Thành công", UI_TEXT.applicationApprovals.toastApproveSuccess);
            fetchData();
        } catch {
            toast.error(UI_TEXT.common.errorTitle || "Lỗi", UI_TEXT.applicationApprovals.toastFetchError);
        }
    };

    const handleRejectSingle = async (id: string, reason: string) => {
        try {
            await applicationApprovalService.rejectApplication(id, reason);
            toast.success(UI_TEXT.common.successTitle || "Thành công", UI_TEXT.applicationApprovals.toastRejectSuccess);
            fetchData();
        } catch {
            toast.error(UI_TEXT.common.errorTitle || "Lỗi", UI_TEXT.applicationApprovals.toastFetchError);
        }
    };

    // Pagination calculation
    const totalItems = applications.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const validCurrentPage = Math.min(currentPage, totalPages);
    const startIdx = (validCurrentPage - 1) * pageSize;
    const paginatedList = applications.slice(startIdx, startIdx + pageSize);

    if (isAuthLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
            </div>
        );
    }

    return (
        <AdminLayout title={UI_TEXT.applicationApprovals.title} subtitle={UI_TEXT.applicationApprovals.subtitle} disableScroll={true}>
            <div className="flex min-h-0 w-full flex-1 flex-col gap-6">
                {/* Soft Tinted Stats Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div
                        onClick={() => setSelectedStatus(ApplicationStatusEnum.ALL)}
                        className={cx(
                            "relative cursor-pointer overflow-hidden rounded-2xl border p-4.5 transition-all duration-200",
                            selectedStatus === ApplicationStatusEnum.ALL
                                ? "border-indigo-400 bg-indigo-100/80 shadow-xs ring-2 ring-indigo-400/30"
                                : "border-indigo-200/70 bg-indigo-50/70 hover:border-indigo-300 hover:bg-indigo-100/50",
                        )}
                    >
                        <div className="absolute top-4 right-4 flex size-7 items-center justify-center rounded-full bg-indigo-100/90 text-indigo-600">
                            <FolderOpen className="size-4 text-indigo-600" />
                        </div>
                        <div className="text-[11px] font-bold tracking-wider text-indigo-700 uppercase">{UI_TEXT.applicationApprovals.statsAll}</div>
                        <div className="mt-1.5 text-3xl leading-none font-extrabold text-indigo-900">{stats.totalCount}</div>
                        <div className="mt-1.5 text-xs font-medium text-indigo-600/90">{UI_TEXT.applicationApprovals.statsAllDesc}</div>
                    </div>

                    <div
                        onClick={() => setSelectedStatus(ApplicationStatusEnum.PENDING)}
                        className={cx(
                            "relative cursor-pointer overflow-hidden rounded-2xl border p-4.5 transition-all duration-200",
                            selectedStatus === ApplicationStatusEnum.PENDING
                                ? "border-amber-400 bg-amber-100/80 shadow-xs ring-2 ring-amber-400/30"
                                : "border-amber-200/70 bg-amber-50/70 hover:border-amber-300 hover:bg-amber-100/50",
                        )}
                    >
                        <div className="text-[11px] font-bold tracking-wider text-amber-700 uppercase">{UI_TEXT.applicationApprovals.statsPending}</div>
                        <div className="mt-1.5 text-3xl leading-none font-extrabold text-amber-900">{stats.pendingCount}</div>
                        <div className="mt-1.5 text-xs font-medium text-amber-600/90">{UI_TEXT.applicationApprovals.statsPendingDesc}</div>
                    </div>

                    <div
                        onClick={() => setSelectedStatus(ApplicationStatusEnum.APPROVED)}
                        className={cx(
                            "relative cursor-pointer overflow-hidden rounded-2xl border p-4.5 transition-all duration-200",
                            selectedStatus === ApplicationStatusEnum.APPROVED
                                ? "border-emerald-400 bg-emerald-100/80 shadow-xs ring-2 ring-emerald-400/30"
                                : "border-emerald-200/70 bg-emerald-50/70 hover:border-emerald-300 hover:bg-emerald-100/50",
                        )}
                    >
                        <div className="absolute top-4 right-4 flex size-7 items-center justify-center rounded-full bg-emerald-100/90 text-emerald-600">
                            <CheckCircle2 className="size-4 text-emerald-600" />
                        </div>
                        <div className="text-[11px] font-bold tracking-wider text-emerald-700 uppercase">{UI_TEXT.applicationApprovals.statsApproved}</div>
                        <div className="mt-1.5 text-3xl leading-none font-extrabold text-emerald-900">{stats.approvedCount}</div>
                        <div className="mt-1.5 text-xs font-medium text-emerald-600/90">{UI_TEXT.applicationApprovals.statsApprovedDesc}</div>
                    </div>

                    <div
                        onClick={() => setSelectedStatus(ApplicationStatusEnum.REJECTED)}
                        className={cx(
                            "relative cursor-pointer overflow-hidden rounded-2xl border p-4.5 transition-all duration-200",
                            selectedStatus === ApplicationStatusEnum.REJECTED
                                ? "border-rose-400 bg-rose-100/80 shadow-xs ring-2 ring-rose-400/30"
                                : "border-rose-200/70 bg-rose-50/70 hover:border-rose-300 hover:bg-rose-100/50",
                        )}
                    >
                        <div className="absolute top-4 right-4 flex size-7 items-center justify-center rounded-full bg-rose-100/90 text-rose-600">
                            <XCircle className="size-4 text-rose-600" />
                        </div>
                        <div className="text-[11px] font-bold tracking-wider text-rose-700 uppercase">{UI_TEXT.applicationApprovals.statsRejected}</div>
                        <div className="mt-1.5 text-3xl leading-none font-extrabold text-rose-900">{stats.rejectedCount}</div>
                        <div className="mt-1.5 text-xs font-medium text-rose-600/90">{UI_TEXT.applicationApprovals.statsRejectedDesc}</div>
                    </div>
                </div>

                {/* Main Content Card with Integrated Tabs and Filters */}
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs">
                    {/* Category Tabs */}
                    <div className="custom-scrollbar flex gap-2 overflow-x-auto border-b border-slate-100 bg-slate-50/30 px-4 pt-3">
                        {[
                            { key: ApplicationTypeEnum.ALL, label: UI_TEXT.applicationApprovals.tabAll },
                            { key: ApplicationTypeEnum.RE_EXAM, label: UI_TEXT.applicationApprovals.tabReExam },
                            { key: ApplicationTypeEnum.RE_GRADE, label: UI_TEXT.applicationApprovals.tabReGradeOnline },
                            { key: ApplicationTypeEnum.RE_GRADE_DOC, label: UI_TEXT.applicationApprovals.tabReGradeDoc },
                            { key: ApplicationTypeEnum.LEAVE_LONG_TERM, label: UI_TEXT.applicationApprovals.tabLeaveLongTerm },
                            { key: ApplicationTypeEnum.TUITION_DELAY, label: UI_TEXT.applicationApprovals.tabTuitionDelay },
                            { key: ApplicationTypeEnum.ACADEMIC_RESERVE, label: UI_TEXT.applicationApprovals.tabAcademicReserve },
                            { key: ApplicationTypeEnum.EXAM_POSTPONE, label: UI_TEXT.applicationApprovals.tabExamPostpone },
                            { key: ApplicationTypeEnum.RE_LEARN, label: UI_TEXT.applicationApprovals.tabReLearn },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => {
                                    setActiveTab(tab.key);
                                    setCurrentPage(1);
                                }}
                                className={cx(
                                    "flex shrink-0 cursor-pointer items-center rounded-t-xl border-b-2 px-3.5 py-2.5 text-xs font-bold whitespace-nowrap transition duration-150",
                                    activeTab === tab.key
                                        ? "border-wine bg-white text-wine shadow-xs"
                                        : "border-transparent text-slate-500 hover:text-wine-bright",
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Filters Bar */}
                    <div className="border-b border-slate-100 bg-white p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-1 flex-wrap items-center gap-3">
                                <SearchFilters
                                    search={searchQuery}
                                    onSearchChange={(val) => {
                                        setSearchQuery(val);
                                        setCurrentPage(1);
                                    }}
                                    searchPlaceholder={UI_TEXT.applicationApprovals.filterSearchPlaceholder}
                                />

                                {/* Course Select */}
                                <div className="w-56 sm:w-64">
                                    <Select.ComboBox
                                        aria-label={UI_TEXT.applicationApprovals.thCourseSemester}
                                        selectedKey={selectedCourse || null}
                                        onSelectionChange={(key) => {
                                            setSelectedCourse(key ? String(key) : "");
                                            setCurrentPage(1);
                                        }}
                                        items={courseOptions}
                                        size="sm"
                                        placeholder={UI_TEXT.applicationApprovals.allCoursesOption}
                                    >
                                        {(item) => <Select.Item key={item.id} id={item.id} label={item.label} textValue={item.label} />}
                                    </Select.ComboBox>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                                >
                                    <RotateCcw className="size-3.5" />
                                    {UI_TEXT.applicationApprovals.btnResetFilters}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table Data */}
                    <div className="custom-scrollbar w-full flex-1 overflow-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center p-12 text-xs font-semibold text-slate-500">
                                <div className="mr-2 size-5 animate-spin rounded-full border-2 border-slate-200 border-t-wine" />
                                {UI_TEXT.applicationApprovals.loadingList}
                            </div>
                        ) : paginatedList.length === 0 ? (
                            <div className="p-12 text-center text-xs font-semibold text-slate-400">{UI_TEXT.applicationApprovals.noData}</div>
                        ) : (
                            <table className="w-full border-collapse text-left text-xs text-slate-700">
                                <thead>
                                    <tr className="sticky top-0 z-10 border-b border-slate-100 bg-slate-50 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                                        <th className="px-5 py-3.5 font-bold whitespace-nowrap">{UI_TEXT.applicationApprovals.thCode}</th>
                                        <th className="px-5 py-3.5 font-bold whitespace-nowrap">{UI_TEXT.applicationApprovals.thStudent}</th>
                                        <th className="px-5 py-3.5 font-bold whitespace-nowrap">{UI_TEXT.applicationApprovals.thType}</th>
                                        <th className="px-5 py-3.5 font-bold whitespace-nowrap">{UI_TEXT.applicationApprovals.thCourseSemester}</th>
                                        <th className="px-5 py-3.5 font-bold whitespace-nowrap">{UI_TEXT.applicationApprovals.thSubmittedAt}</th>
                                        <th className="px-5 py-3.5 text-center font-bold whitespace-nowrap">{UI_TEXT.applicationApprovals.thStatus}</th>
                                        <th className="w-[140px] px-5 py-3.5 text-center font-bold whitespace-nowrap">
                                            {UI_TEXT.applicationApprovals.thAction}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedList.map((item) => (
                                        <tr key={item.id} className="group border-b border-slate-100 transition duration-150 hover:bg-slate-50/80">
                                            <td className="px-5 py-3.5 font-extrabold whitespace-nowrap text-slate-900">
                                                <span className="inline-block rounded-lg bg-slate-100 px-2 py-1 font-mono text-[11.5px] whitespace-nowrap text-slate-800">
                                                    {item.code}
                                                </span>
                                            </td>
                                            <td className="max-w-[200px] px-5 py-3.5">
                                                <div className="truncate text-[13.5px] font-bold text-slate-900" title={item.student.fullName}>
                                                    {item.student.fullName}
                                                </div>
                                                <div
                                                    className="truncate text-[11px] font-medium text-slate-500"
                                                    title={`${UI_TEXT.applicationApprovals.studentCodePrefix} ${item.student.studentCode}${item.student.className ? ` | ${item.student.className}` : ""}`}
                                                >
                                                    {UI_TEXT.applicationApprovals.studentCodePrefix}{" "}
                                                    <strong className="text-slate-700">{item.student.studentCode}</strong>
                                                    {item.student.className ? ` | ${item.student.className}` : ""}
                                                </div>
                                            </td>
                                            <td className="max-w-[180px] px-5 py-3.5">
                                                <span
                                                    className="inline-flex max-w-full truncate rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700"
                                                    title={item.typeName}
                                                >
                                                    {item.typeName}
                                                </span>
                                                {item.examType && (
                                                    <span className="mt-1 block truncate text-[11px] font-semibold text-slate-500">
                                                        {item.examType === ExamTypeEnum.RE_TAKE
                                                            ? UI_TEXT.applicationApprovals.examReTake
                                                            : UI_TEXT.applicationApprovals.examSupplementary}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="max-w-[220px] px-5 py-3.5">
                                                <div className="truncate font-bold text-slate-800" title={item.courseName || "---"}>
                                                    {item.courseName || "---"}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                <div className="text-[11.5px] font-medium text-slate-600">
                                                    {new Date(item.submittedAt).toLocaleDateString("vi-VN")}
                                                </div>
                                                {item.attachmentName && (
                                                    <a
                                                        href={item.attachmentUrl || "#"}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="mt-0.5 inline-flex max-w-[160px] items-center gap-1 text-[11px] font-bold text-wine hover:underline"
                                                        title={item.attachmentName}
                                                    >
                                                        <FileText className="size-3 shrink-0" />
                                                        <span className="truncate">{item.attachmentName}</span>
                                                    </a>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 text-center whitespace-nowrap">
                                                {item.status === ApplicationStatusEnum.APPROVED ? (
                                                    <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold whitespace-nowrap text-emerald-700">
                                                        {UI_TEXT.applicationApprovals.statusApproved}
                                                    </span>
                                                ) : item.status === ApplicationStatusEnum.REJECTED ? (
                                                    <span className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-bold whitespace-nowrap text-rose-700">
                                                        {UI_TEXT.applicationApprovals.statusRejected}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-bold whitespace-nowrap text-amber-700">
                                                        {UI_TEXT.applicationApprovals.statusPending}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedDetailItem(item)}
                                                        title={UI_TEXT.applicationApprovals.detailModalTitle}
                                                        className="inline-flex size-7 cursor-pointer items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-600 transition hover:bg-sky-600 hover:text-white"
                                                    >
                                                        <Eye className="size-3.5" />
                                                    </button>
                                                    {item.status === ApplicationStatusEnum.PENDING && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleApproveSingle(item.id)}
                                                                title={UI_TEXT.applicationApprovals.quickApprove}
                                                                className="inline-flex size-7 cursor-pointer items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 transition hover:bg-emerald-600 hover:text-white"
                                                            >
                                                                <CheckCircle2 className="size-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedDetailItem(item)}
                                                                title={UI_TEXT.applicationApprovals.quickReject}
                                                                className="inline-flex size-7 cursor-pointer items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-600 hover:text-white"
                                                            >
                                                                <XCircle className="size-3.5" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Application Detail Modal */}
            <ApplicationDetailModal
                item={selectedDetailItem}
                isOpen={!!selectedDetailItem}
                onClose={() => setSelectedDetailItem(null)}
                onApprove={handleApproveSingle}
                onReject={handleRejectSingle}
            />
        </AdminLayout>
    );
}
