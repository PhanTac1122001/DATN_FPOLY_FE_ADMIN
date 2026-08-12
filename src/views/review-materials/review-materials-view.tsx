"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, CheckSquare, ClipboardList, Eye, FileText, FolderOpen, Loader2, RotateCcw, Search, Video, X, XCircle } from "lucide-react";
import { Heading } from "react-aria-components";
import { ReviewQuizModal, ReviewReadingModal, ReviewVideoModal } from "@/components/application/modals/review-material-detail-modals";
import { TablePagination } from "@/components/application/pagination/table-pagination";
import { Select } from "@/components/base/select/select";
import { AdminLayout } from "@/components/layout/admin/admin-layout";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { MATERIAL_STATUS, PAD_TWO_DIGITS } from "@/constants/options.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { useAppRouter } from "@/hooks/use-app-router";
import { useAuth } from "@/hooks/use-auth";
import { httpClient } from "@/lib/http-client";
import { getCoursesList } from "@/services/course.service";
import { reviewMaterialsService } from "@/services/review-materials.service";
import { getSemestersBySpecialize, getSpecializesList } from "@/services/system.service";
import { toast } from "@/services/toast.service";
import type { CourseItem } from "@/types/course.types";
import type {
    ReviewHomeworkItem,
    ReviewLessonItem,
    ReviewStats,
    ReviewSessionItem as SessionItem,
    ReviewTabType as TabType,
} from "@/types/review-materials.types";
import type { Specialize } from "@/types/system.types";
import { cx } from "@/utils/cx";
import { formatDateTime, formatUserName } from "@/utils/review-materials.utils";

export function ReviewMaterialsView() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useAppRouter();

    const [activeTab, setActiveTab] = useState<TabType>("lessons");

    // Cascading filters state
    const [specializes, setSpecializes] = useState<Specialize[]>([]);
    const [selectedSpecializeId, setSelectedSpecializeId] = useState<string>("");

    const [courses, setCourses] = useState<CourseItem[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string>("");

    const [sessions, setSessions] = useState<SessionItem[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string>("");

    // Search and Status filters
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");

    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const pageSize = 10;

    // Data state
    const [stats, setStats] = useState<ReviewStats>({
        pendingCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
        totalCount: 0,
    });

    const [lessons, setLessons] = useState<ReviewLessonItem[]>([]);
    const [homework, setHomework] = useState<ReviewHomeworkItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Selected items for bulk operations
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

    // Specific detail modals state matching screenshot designs
    const [videoModalItem, setVideoModalItem] = useState<ReviewLessonItem | null>(null);
    const [readingModalItem, setReadingModalItem] = useState<ReviewLessonItem | null>(null);
    const [quizModalItem, setQuizModalItem] = useState<ReviewLessonItem | null>(null);
    const [selectedHomeworkModal, setSelectedHomeworkModal] = useState<ReviewHomeworkItem | null>(null);

    useEffect(() => {
        if (!isAuthLoading && !user) {
            router.replace("/login");
        }
    }, [user, isAuthLoading, router]);

    // Fetch Specializations
    useEffect(() => {
        getSpecializesList()
            .then((data) => setSpecializes(data || []))
            .catch(() => toast.error(UI_TEXT.reviewMaterials.toastErrorTitle, UI_TEXT.reviewMaterials.toastSpecializeError));
    }, []);

    // Fetch Courses when Specialization changes
    useEffect(() => {
        if (!selectedSpecializeId) {
            setCourses([]);
            setSelectedCourseId("");
            setSessions([]);
            setSelectedSessionId("");
            return;
        }

        Promise.all([getSemestersBySpecialize(selectedSpecializeId).catch(() => []), getCoursesList().catch(() => [])])
            .then(([semesters, allCourses]) => {
                const validCourseIds = new Set<string>();
                (semesters || []).forEach((sem) => {
                    (sem.courseIds || []).forEach((id) => validCourseIds.add(id));
                });

                const filteredCourses = validCourseIds.size > 0 ? allCourses.filter((c) => validCourseIds.has(c.id)) : allCourses;

                setCourses(filteredCourses);
                setSelectedCourseId("");
                setSessions([]);
                setSelectedSessionId("");
            })
            .catch(() => {
                setCourses([]);
                setSelectedCourseId("");
                toast.error(UI_TEXT.reviewMaterials.toastErrorTitle, UI_TEXT.reviewMaterials.toastCourseError);
            });
    }, [selectedSpecializeId]);

    // Fetch Sessions when Course changes
    useEffect(() => {
        if (!selectedCourseId) {
            setSessions([]);
            setSelectedSessionId("");
            return;
        }

        httpClient<SessionItem[] | { data?: SessionItem[] }>(`/staff/sessions/course/${selectedCourseId}`)
            .then((res) => {
                const data: SessionItem[] = Array.isArray(res) ? res : res?.data || [];
                setSessions(data);
                setSelectedSessionId("");
            })
            .catch(() => {
                setSessions([]);
                setSelectedSessionId("");
            });
    }, [selectedCourseId]);

    // Reset selection & page when filters change
    useEffect(() => {
        setSelectedIds([]);
        setCurrentPage(1);
    }, [activeTab, selectedSessionId, selectedStatus, searchQuery]);

    // Fetch Materials Data
    const fetchData = useCallback(async () => {
        if (!selectedSessionId) {
            setLessons([]);
            setHomework([]);
            setStats({ pendingCount: 0, approvedCount: 0, rejectedCount: 0, totalCount: 0 });
            return;
        }

        setIsLoading(true);
        let statusParam: number | undefined = undefined;
        if (selectedStatus === "pending") statusParam = MATERIAL_STATUS.PENDING;
        else if (selectedStatus === "approved") statusParam = MATERIAL_STATUS.APPROVED;
        else if (selectedStatus === "rejected") statusParam = MATERIAL_STATUS.REJECTED;

        const query = {
            sessionId: selectedSessionId,
            status: statusParam,
            search: searchQuery.trim() || undefined,
        };

        try {
            if (activeTab === "lessons" || activeTab === "tests") {
                const res = await reviewMaterialsService.getLessons(query);
                setLessons(res.items || []);
                setStats(res.stats || { pendingCount: 0, approvedCount: 0, rejectedCount: 0, totalCount: 0 });
            } else {
                const res = await reviewMaterialsService.getHomework(query);
                setHomework(res.items || []);
                setStats(res.stats || { pendingCount: 0, approvedCount: 0, rejectedCount: 0, totalCount: 0 });
            }
        } catch {
            toast.error(UI_TEXT.reviewMaterials.toastErrorTitle, UI_TEXT.reviewMaterials.toastFetchError);
        } finally {
            setIsLoading(false);
        }
    }, [selectedSessionId, activeTab, selectedStatus, searchQuery]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Reset Filters
    const handleResetFilters = () => {
        setSelectedSpecializeId("");
        setSelectedCourseId("");
        setSelectedSessionId("");
        setCourses([]);
        setSessions([]);
        setSelectedStatus("all");
        setSearchQuery("");
    };

    // Single Actions
    const handleApproveSingle = async (id: string) => {
        setIsActionLoading(true);
        try {
            if (activeTab === "lessons" || activeTab === "tests") {
                await reviewMaterialsService.approveLesson(id);
            } else {
                await reviewMaterialsService.approveHomework(id);
            }
            toast.success(UI_TEXT.reviewMaterials.toastSuccessTitle, UI_TEXT.reviewMaterials.toastApproveSuccess);
            fetchData();
        } catch {
            toast.error(UI_TEXT.reviewMaterials.toastErrorTitle, UI_TEXT.reviewMaterials.toastApproveError);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleRejectSingle = async (id: string) => {
        setIsActionLoading(true);
        try {
            if (activeTab === "lessons" || activeTab === "tests") {
                await reviewMaterialsService.rejectLesson(id);
            } else {
                await reviewMaterialsService.rejectHomework(id);
            }
            toast.success(UI_TEXT.reviewMaterials.toastSuccessTitle, UI_TEXT.reviewMaterials.toastRejectSuccess);
            fetchData();
        } catch {
            toast.error(UI_TEXT.reviewMaterials.toastErrorTitle, UI_TEXT.reviewMaterials.toastRejectError);
        } finally {
            setIsActionLoading(false);
        }
    };

    // Bulk Actions
    const handleBulkApprove = async () => {
        if (selectedIds.length === 0) return;
        setIsActionLoading(true);
        try {
            if (activeTab === "lessons" || activeTab === "tests") {
                await reviewMaterialsService.bulkApproveLessons(selectedIds);
            } else {
                await reviewMaterialsService.bulkApproveHomework(selectedIds);
            }
            toast.success(
                UI_TEXT.reviewMaterials.toastSuccessTitle,
                `${UI_TEXT.reviewMaterials.toastBulkApproveSuccessPrefix}${selectedIds.length}${UI_TEXT.reviewMaterials.toastBulkApproveSuccessSuffix}`,
            );
            setSelectedIds([]);
            fetchData();
        } catch {
            toast.error(UI_TEXT.reviewMaterials.toastErrorTitle, UI_TEXT.reviewMaterials.toastBulkApproveError);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleBulkReject = async () => {
        if (selectedIds.length === 0) return;
        setIsActionLoading(true);
        try {
            if (activeTab === "lessons" || activeTab === "tests") {
                await reviewMaterialsService.bulkRejectLessons(selectedIds);
            } else {
                await reviewMaterialsService.bulkRejectHomework(selectedIds);
            }
            toast.success(
                UI_TEXT.reviewMaterials.toastSuccessTitle,
                `${UI_TEXT.reviewMaterials.toastBulkRejectSuccessPrefix}${selectedIds.length}${UI_TEXT.reviewMaterials.toastBulkRejectSuccessSuffix}`,
            );
            setSelectedIds([]);
            fetchData();
        } catch {
            toast.error(UI_TEXT.reviewMaterials.toastErrorTitle, UI_TEXT.reviewMaterials.toastBulkRejectError);
        } finally {
            setIsActionLoading(false);
        }
    };

    // Pagination & List calculation
    const currentList = activeTab === "homework" ? homework : lessons;

    const totalItems = currentList.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const validCurrentPage = Math.min(currentPage, totalPages);
    const startIdx = (validCurrentPage - 1) * pageSize;
    const endIdx = Math.min(startIdx + pageSize, totalItems);
    const paginatedList = currentList.slice(startIdx, endIdx);

    const isAllSelected = paginatedList.length > 0 && paginatedList.every((item) => selectedIds.includes(item.id));

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds((prev) => prev.filter((id) => !paginatedList.some((item) => item.id === id)));
        } else {
            const newIds = new Set([...selectedIds, ...paginatedList.map((item) => item.id)]);
            setSelectedIds(Array.from(newIds));
        }
    };

    const toggleSelectItem = (id: string) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    };

    // Active specialize, course and session names
    const activeSpecialize = specializes.find((s) => s.id === selectedSpecializeId);
    const activeCourse = courses.find((c) => c.id === selectedCourseId);
    const activeSession = sessions.find((s) => s.id === selectedSessionId);

    const activeSpecializeName = activeSpecialize ? activeSpecialize.name : "-- Hệ đào tạo --";
    const activeCourseName = activeCourse ? activeCourse.title : "-- Môn học --";

    const activeSessionName = activeSession ? activeSession.name : "-- Session --";

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return UI_TEXT.reviewMaterials.notUpdatedText;
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return UI_TEXT.reviewMaterials.notUpdatedText;
        const hours = String(d.getHours()).padStart(PAD_TWO_DIGITS, "0");
        const mins = String(d.getMinutes()).padStart(PAD_TWO_DIGITS, "0");
        const secs = String(d.getSeconds()).padStart(PAD_TWO_DIGITS, "0");
        const date = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
        return `${hours}:${mins}:${secs} ${date}`;
    };

    if (isAuthLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-cream">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <AdminLayout title={UI_TEXT.reviewMaterials.title} subtitle={UI_TEXT.reviewMaterials.subtitle}>
            <div className="flex min-h-0 w-full flex-1 flex-col gap-6">
                {/* Tabs Navigation */}
                <div className="flex gap-6 border-b border-slate-200">
                    <button
                        type="button"
                        onClick={() => setActiveTab("lessons")}
                        className={cx(
                            "flex cursor-pointer items-center gap-2 border-b-2 px-2 py-3 text-sm font-semibold transition duration-150",
                            activeTab === "lessons" ? "border-wine font-bold text-wine" : "border-transparent text-slate-500 hover:text-wine-bright",
                        )}
                    >
                        <Video className="size-4" />
                        <span>{UI_TEXT.reviewMaterials.tabLessons}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("homework")}
                        className={cx(
                            "flex cursor-pointer items-center gap-2 border-b-2 px-2 py-3 text-sm font-semibold transition duration-150",
                            activeTab === "homework" ? "border-wine font-bold text-wine" : "border-transparent text-slate-500 hover:text-wine-bright",
                        )}
                    >
                        <FileText className="size-4" />
                        <span>{UI_TEXT.reviewMaterials.tabHomework}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("tests")}
                        className={cx(
                            "flex cursor-pointer items-center gap-2 border-b-2 px-2 py-3 text-sm font-semibold transition duration-150",
                            activeTab === "tests" ? "border-wine font-bold text-wine" : "border-transparent text-slate-500 hover:text-wine-bright",
                        )}
                    >
                        <ClipboardList className="size-4" />
                        <span>{UI_TEXT.reviewMaterials.modalQuizTitle}</span>
                    </button>
                </div>

                {/* Soft Tinted Stats Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div
                        className={cx(
                            "relative cursor-pointer overflow-hidden rounded-2xl border p-4.5 transition-all duration-200",
                            selectedStatus === "all"
                                ? "border-indigo-400 bg-indigo-100/80 shadow-xs ring-2 ring-indigo-400/30"
                                : "border-indigo-200/70 bg-indigo-50/70 hover:border-indigo-300 hover:bg-indigo-100/50",
                        )}
                        onClick={() => setSelectedStatus("all")}
                    >
                        <div className="absolute top-4 right-4 flex size-7 items-center justify-center rounded-full bg-indigo-100/90 text-indigo-600">
                            <FolderOpen className="size-4 text-indigo-600" />
                        </div>
                        <div className="text-[11px] font-bold tracking-wider text-indigo-700 uppercase">{UI_TEXT.reviewMaterials.statTotal}</div>
                        <div className="mt-1.5 text-3xl leading-none font-extrabold text-indigo-900">{stats.totalCount}</div>
                        <div className="mt-1.5 text-xs font-medium text-indigo-600/90">{UI_TEXT.reviewMaterials.filterStatusAll}</div>
                    </div>

                    <div
                        className={cx(
                            "relative cursor-pointer overflow-hidden rounded-2xl border p-4.5 transition-all duration-200",
                            selectedStatus === "pending"
                                ? "border-amber-400 bg-amber-100/80 shadow-xs ring-2 ring-amber-400/30"
                                : "border-amber-200/70 bg-amber-50/70 hover:border-amber-300 hover:bg-amber-100/50",
                        )}
                        onClick={() => setSelectedStatus("pending")}
                    >
                        <div className="text-[11px] font-bold tracking-wider text-amber-700 uppercase">{UI_TEXT.reviewMaterials.statPending}</div>
                        <div className="mt-1.5 text-3xl leading-none font-extrabold text-amber-900">{stats.pendingCount}</div>
                        <div className="mt-1.5 text-xs font-medium text-amber-600/90">{UI_TEXT.reviewMaterials.filterStatusPending}</div>
                    </div>

                    <div
                        className={cx(
                            "relative cursor-pointer overflow-hidden rounded-2xl border p-4.5 transition-all duration-200",
                            selectedStatus === "approved"
                                ? "border-emerald-400 bg-emerald-100/80 shadow-xs ring-2 ring-emerald-400/30"
                                : "border-emerald-200/70 bg-emerald-50/70 hover:border-emerald-300 hover:bg-emerald-100/50",
                        )}
                        onClick={() => setSelectedStatus("approved")}
                    >
                        <div className="absolute top-4 right-4 flex size-7 items-center justify-center rounded-full bg-emerald-100/90 text-emerald-600">
                            <CheckCircle2 className="size-4 text-emerald-600" />
                        </div>
                        <div className="text-[11px] font-bold tracking-wider text-emerald-700 uppercase">{UI_TEXT.reviewMaterials.statApproved}</div>
                        <div className="mt-1.5 text-3xl leading-none font-extrabold text-emerald-900">{stats.approvedCount}</div>
                        <div className="mt-1.5 text-xs font-medium text-emerald-600/90">{UI_TEXT.reviewMaterials.filterStatusApproved}</div>
                    </div>

                    <div
                        className={cx(
                            "relative cursor-pointer overflow-hidden rounded-2xl border p-4.5 transition-all duration-200",
                            selectedStatus === "rejected"
                                ? "border-rose-400 bg-rose-100/80 shadow-xs ring-2 ring-rose-400/30"
                                : "border-rose-200/70 bg-rose-50/70 hover:border-rose-300 hover:bg-rose-100/50",
                        )}
                        onClick={() => setSelectedStatus("rejected")}
                    >
                        <div className="absolute top-4 right-4 flex size-7 items-center justify-center rounded-full bg-rose-100/90 text-rose-600">
                            <XCircle className="size-4 text-rose-600" />
                        </div>
                        <div className="text-[11px] font-bold tracking-wider text-rose-700 uppercase">{UI_TEXT.reviewMaterials.statRejected}</div>
                        <div className="mt-1.5 text-3xl leading-none font-extrabold text-rose-900">{stats.rejectedCount}</div>
                        <div className="mt-1.5 text-xs font-medium text-rose-600/90">{UI_TEXT.reviewMaterials.filterStatusRejected}</div>
                    </div>
                </div>

                {/* Main Unified Table Card with Integrated Filters Header */}
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs">
                    {/* Filters Header inside Card */}
                    <div className="border-b border-slate-100 bg-slate-50/40 p-5">
                        <div className="flex flex-col gap-4">
                            {/* Dependent Selects Row */}
                            <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-3">
                                <Select.ComboBox
                                    label={UI_TEXT.reviewMaterials.systemLabel}
                                    placeholder={UI_TEXT.reviewMaterials.filterSpecializePlaceholder}
                                    size="sm"
                                    items={specializes.map((spec) => ({ id: spec.id, label: spec.name }))}
                                    selectedKey={selectedSpecializeId || null}
                                    onSelectionChange={(key) => {
                                        const specId = key ? String(key) : "";
                                        setSelectedSpecializeId(specId);
                                        setSelectedStatus("all");
                                        if (!specId) {
                                            setCourses([]);
                                            setSelectedCourseId("");
                                            setSessions([]);
                                            setSelectedSessionId("");
                                        }
                                    }}
                                >
                                    {(item) => <Select.Item key={item.id} id={item.id} label={item.label} textValue={item.label} />}
                                </Select.ComboBox>

                                <Select.ComboBox
                                    label={UI_TEXT.reviewMaterials.subjectLabel}
                                    placeholder={
                                        !selectedSpecializeId
                                            ? UI_TEXT.reviewMaterials.filterSpecializePlaceholder
                                            : UI_TEXT.reviewMaterials.filterCoursePlaceholder
                                    }
                                    size="sm"
                                    items={courses.map((c) => ({ id: c.id, label: c.title }))}
                                    selectedKey={selectedCourseId || null}
                                    onSelectionChange={(key) => {
                                        const courseId = key ? String(key) : "";
                                        setSelectedCourseId(courseId);
                                        setSelectedStatus("all");
                                        if (!courseId) {
                                            setSessions([]);
                                            setSelectedSessionId("");
                                        }
                                    }}
                                    isDisabled={!selectedSpecializeId || courses.length === 0}
                                >
                                    {(item) => <Select.Item key={item.id} id={item.id} label={item.label} textValue={item.label} />}
                                </Select.ComboBox>

                                <Select.ComboBox
                                    label={UI_TEXT.reviewMaterials.sessionLabel}
                                    placeholder={
                                        !selectedCourseId ? UI_TEXT.reviewMaterials.filterCoursePlaceholder : UI_TEXT.reviewMaterials.filterSessionPlaceholder
                                    }
                                    size="sm"
                                    items={sessions.map((s) => ({ id: s.id, label: s.name }))}
                                    selectedKey={selectedSessionId || null}
                                    onSelectionChange={(key) => {
                                        setSelectedSessionId(key ? String(key) : "");
                                        setSelectedStatus("all");
                                    }}
                                    isDisabled={!selectedCourseId || sessions.length === 0}
                                >
                                    {(item) => <Select.Item key={item.id} id={item.id} label={item.label} textValue={item.label} />}
                                </Select.ComboBox>
                            </div>

                            {/* Search & Bulk Actions Row */}
                            <div className="flex flex-col justify-between gap-3 pt-1 sm:flex-row sm:items-center">
                                <div className="flex items-center gap-2.5">
                                    <div className="relative w-64 sm:w-80">
                                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder={UI_TEXT.reviewMaterials.filterSearchPlaceholder}
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="h-9 w-full rounded-full border border-slate-200 bg-white pr-4 pl-9 text-xs text-slate-900 placeholder-slate-400 transition-all outline-none focus:border-wine focus:ring-1 focus:ring-wine"
                                        />
                                    </div>
                                    <button
                                        onClick={handleResetFilters}
                                        className="inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold whitespace-nowrap text-slate-700 transition-colors hover:bg-slate-50"
                                    >
                                        <RotateCcw className="size-3.5" />
                                        {UI_TEXT.reviewMaterials.btnResetFilters}
                                    </button>
                                </div>

                                {/* Bulk Actions Bar on Right (Clean Light Design) */}
                                {selectedIds.length > 0 && (
                                    <div className="flex shrink-0 items-center gap-2.5 animate-in fade-in">
                                        <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                                            <CheckSquare className="size-3.5 text-wine" />
                                            {UI_TEXT.reviewMaterials.selectedCountPrefix}
                                            <strong className="font-extrabold text-wine">{selectedIds.length}</strong>
                                            {UI_TEXT.reviewMaterials.selectedCountSuffix}
                                        </span>
                                        <button
                                            onClick={handleBulkApprove}
                                            disabled={isActionLoading}
                                            className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-bold whitespace-nowrap text-white shadow-xs transition-colors hover:bg-emerald-700 disabled:opacity-50"
                                        >
                                            <CheckCircle2 className="size-3.5" />
                                            {UI_TEXT.reviewMaterials.btnBulkApprove}
                                        </button>
                                        <button
                                            onClick={handleBulkReject}
                                            disabled={isActionLoading}
                                            className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-full bg-rose-600 px-3.5 py-1.5 text-xs font-bold whitespace-nowrap text-white shadow-xs transition-colors hover:bg-rose-700 disabled:opacity-50"
                                        >
                                            <XCircle className="size-3.5" />
                                            {UI_TEXT.reviewMaterials.btnBulkReject}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Table Data Container */}
                    <div className="w-full flex-1 overflow-x-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center p-12 text-sm font-semibold text-slate-500">
                                <Loader2 className="mr-2 size-6 animate-spin text-wine" />
                                {UI_TEXT.reviewMaterials.loadingList}
                            </div>
                        ) : !selectedSessionId ? (
                            <div className="p-12 text-center text-sm font-medium text-slate-500">{UI_TEXT.reviewMaterials.selectPrompt}</div>
                        ) : currentList.length === 0 ? (
                            <div className="p-12 text-center text-sm font-semibold text-slate-400">{UI_TEXT.reviewMaterials.noFilteredData}</div>
                        ) : (
                            <table className="w-full border-collapse text-left text-sm text-slate-700">
                                <thead>
                                    {activeTab === "homework" ? (
                                        <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                                            <th className="w-12 px-6 py-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isAllSelected}
                                                    onChange={toggleSelectAll}
                                                    className="size-4 cursor-pointer rounded border-slate-300 accent-wine"
                                                />
                                            </th>
                                            <th className="px-6 py-4 font-bold">{UI_TEXT.reviewMaterials.thHomeworkName}</th>
                                            <th className="px-6 py-4 font-bold">{UI_TEXT.reviewMaterials.thHomeworkDescription}</th>
                                            <th className="px-6 py-4 font-bold">{UI_TEXT.reviewMaterials.thCreatedAt}</th>
                                            <th className="px-6 py-4 font-bold">{UI_TEXT.reviewMaterials.thUpdatedAt}</th>
                                            <th className="px-6 py-4 text-center font-bold">{UI_TEXT.reviewMaterials.thStatus}</th>
                                            <th className="w-[160px] px-6 py-4 text-center font-bold">{UI_TEXT.reviewMaterials.thAction}</th>
                                        </tr>
                                    ) : (
                                        <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                                            <th className="w-12 px-6 py-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isAllSelected}
                                                    onChange={toggleSelectAll}
                                                    className="size-4 cursor-pointer rounded border-slate-300 accent-wine"
                                                />
                                            </th>
                                            <th className="px-6 py-4 font-bold">{UI_TEXT.reviewMaterials.thLessonName}</th>
                                            <th className="px-6 py-4 font-bold">{UI_TEXT.reviewMaterials.thCourseName}</th>
                                            <th className="px-6 py-4 font-bold">{UI_TEXT.reviewMaterials.thSessionName}</th>
                                            <th className="px-6 py-4 text-center font-bold">{UI_TEXT.reviewMaterials.thVideo}</th>
                                            <th className="px-6 py-4 text-center font-bold">{UI_TEXT.reviewMaterials.thReading}</th>
                                            <th className="px-6 py-4 text-center font-bold">{UI_TEXT.reviewMaterials.thQuiz}</th>
                                            <th className="px-6 py-4 font-bold">{UI_TEXT.reviewMaterials.thUpdatedAt}</th>
                                            <th className="px-6 py-4 text-center font-bold">{UI_TEXT.reviewMaterials.thStatus}</th>
                                            <th className="w-[160px] px-6 py-4 text-center font-bold">{UI_TEXT.reviewMaterials.thAction}</th>
                                        </tr>
                                    )}
                                </thead>
                                <tbody>
                                    {activeTab === "homework"
                                        ? paginatedList.map((rawItem) => {
                                              const item = rawItem as ReviewHomeworkItem;
                                              const isChecked = selectedIds.includes(item.id);

                                              return (
                                                  <tr key={item.id} className="group border-b border-slate-100 transition duration-150 hover:bg-slate-50">
                                                      <td className="px-6 py-4 text-center">
                                                          <input
                                                              type="checkbox"
                                                              checked={isChecked}
                                                              onChange={() => toggleSelectItem(item.id)}
                                                              className="size-4 cursor-pointer rounded border-slate-300 accent-wine"
                                                          />
                                                      </td>
                                                      <td className="px-6 py-4 text-[14.5px] leading-snug font-bold text-slate-900">{item.title}</td>
                                                      <td className="max-w-[280px] px-6 py-4 text-[13px] font-medium text-slate-600">
                                                          <span className="line-clamp-1 block truncate" title={item.description}>
                                                              {item.description || "---"}
                                                          </span>
                                                      </td>
                                                      <td className="px-6 py-4 text-[13px] font-medium whitespace-nowrap text-slate-500">
                                                          {formatDateTime(item.createdAt)}
                                                      </td>
                                                      <td className="px-6 py-4 text-[13px] font-medium whitespace-nowrap text-slate-500">
                                                          {formatDateTime(item.updatedAt)}
                                                      </td>
                                                      <td className="px-6 py-4 text-center">
                                                          {item.status === MATERIAL_STATUS.APPROVED ? (
                                                              <span className="inline-flex items-center rounded-full border border-emerald-200/60 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold whitespace-nowrap text-emerald-700">
                                                                  {UI_TEXT.reviewMaterials.statusApproved}
                                                              </span>
                                                          ) : item.status === MATERIAL_STATUS.REJECTED ? (
                                                              <span className="inline-flex items-center rounded-full border border-rose-200/60 bg-rose-50 px-2.5 py-0.5 text-xs font-bold whitespace-nowrap text-rose-700">
                                                                  {UI_TEXT.reviewMaterials.statusRejected}
                                                              </span>
                                                          ) : (
                                                              <span className="inline-flex items-center rounded-full border border-amber-200/60 bg-amber-50 px-2.5 py-0.5 text-xs font-bold whitespace-nowrap text-amber-700">
                                                                  {UI_TEXT.reviewMaterials.statusPending}
                                                              </span>
                                                          )}
                                                      </td>
                                                      <td className="px-6 py-4 text-center whitespace-nowrap">
                                                          <div className="flex items-center justify-center gap-1.5">
                                                              <button
                                                                  type="button"
                                                                  onClick={() => setSelectedHomeworkModal(item)}
                                                                  className="inline-flex cursor-pointer items-center justify-center rounded-full border border-sky-200/60 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-600 transition-colors hover:bg-sky-600 hover:text-white"
                                                              >
                                                                  {UI_TEXT.reviewMaterials.btnDetail}
                                                              </button>
                                                              {item.status !== MATERIAL_STATUS.APPROVED && (
                                                                  <button
                                                                      type="button"
                                                                      onClick={() => handleApproveSingle(item.id)}
                                                                      disabled={isActionLoading}
                                                                      title={UI_TEXT.reviewMaterials.btnApprove}
                                                                      className="inline-flex size-7 cursor-pointer items-center justify-center rounded-full border border-emerald-200/60 bg-emerald-50 text-emerald-600 transition duration-200 hover:bg-emerald-600 hover:text-white disabled:opacity-50"
                                                                  >
                                                                      <CheckCircle2 className="size-4" />
                                                                  </button>
                                                              )}
                                                              {item.status !== MATERIAL_STATUS.REJECTED && (
                                                                  <button
                                                                      type="button"
                                                                      onClick={() => handleRejectSingle(item.id)}
                                                                      disabled={isActionLoading}
                                                                      title={UI_TEXT.reviewMaterials.btnReject}
                                                                      className="inline-flex size-7 cursor-pointer items-center justify-center rounded-full border border-rose-200/60 bg-rose-50 text-rose-600 transition duration-200 hover:bg-rose-600 hover:text-white disabled:opacity-50"
                                                                  >
                                                                      <XCircle className="size-4" />
                                                                  </button>
                                                              )}
                                                          </div>
                                                      </td>
                                                  </tr>
                                              );
                                          })
                                        : paginatedList.map((rawItem) => {
                                              const item = rawItem as ReviewLessonItem;
                                              const isChecked = selectedIds.includes(item.id);
                                              const authorName = formatUserName(item.author || item.createdBy);
                                              const updaterName = formatUserName(item.updatedBy, authorName);

                                              const hasVideo = !!(item.videoUrl || item.video?.url);
                                              const hasReading = !!(item.reading || item.pdf);
                                              const hasQuiz = !!item.quizId;

                                              return (
                                                  <tr key={item.id} className="group border-b border-slate-100 transition duration-150 hover:bg-slate-50">
                                                      <td className="px-6 py-4 text-center">
                                                          <input
                                                              type="checkbox"
                                                              checked={isChecked}
                                                              onChange={() => toggleSelectItem(item.id)}
                                                              className="size-4 cursor-pointer rounded border-slate-300 accent-wine"
                                                          />
                                                      </td>
                                                      <td className="px-6 py-4">
                                                          <div className="text-[14.5px] leading-snug font-bold text-slate-900">{item.name}</div>
                                                          <div className="mt-0.5 text-[13px] font-medium text-slate-500">
                                                              {UI_TEXT.reviewMaterials.byAuthorPrefix}
                                                              <strong className="font-semibold text-slate-700">{authorName}</strong>
                                                              {UI_TEXT.reviewMaterials.byUpdaterPrefix}
                                                              {updaterName}
                                                          </div>
                                                      </td>
                                                      <td className="px-6 py-4 text-[13px] font-medium text-slate-700">{activeCourseName}</td>
                                                      <td className="px-6 py-4 text-[13px] font-medium text-slate-700">{activeSessionName}</td>
                                                      {/* Video Cell */}
                                                      <td className="px-6 py-4 text-center">
                                                          {hasVideo ? (
                                                              <button
                                                                  onClick={() => setVideoModalItem(item)}
                                                                  className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-sky-200/60 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 transition-colors hover:bg-sky-100"
                                                              >
                                                                  <Video className="size-3.5" />
                                                                  <span>{UI_TEXT.reviewMaterials.thVideo}</span>
                                                              </button>
                                                          ) : (
                                                              <span className="text-[13px] text-slate-400">{"-"}</span>
                                                          )}
                                                      </td>
                                                      {/* Reading Cell */}
                                                      <td className="px-6 py-4 text-center">
                                                          {hasReading ? (
                                                              <button
                                                                  onClick={() => setReadingModalItem(item)}
                                                                  className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-purple-200/60 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 transition-colors hover:bg-purple-100"
                                                              >
                                                                  <FileText className="size-3.5" />
                                                                  <span>{UI_TEXT.reviewMaterials.docPrefix}</span>
                                                              </button>
                                                          ) : (
                                                              <span className="text-[13px] text-slate-400">{UI_TEXT.reviewMaterials.contentTypeNone}</span>
                                                          )}
                                                      </td>
                                                      {/* Quiz Cell */}
                                                      <td className="px-6 py-4 text-center">
                                                          {hasQuiz ? (
                                                              <button
                                                                  onClick={() => setQuizModalItem(item)}
                                                                  className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-indigo-200/60 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
                                                              >
                                                                  <ClipboardList className="size-3.5" />
                                                                  <span>{UI_TEXT.reviewMaterials.contentTypeQuiz}</span>
                                                              </button>
                                                          ) : (
                                                              <span className="text-[13px] text-slate-400">{UI_TEXT.reviewMaterials.contentTypeNone}</span>
                                                          )}
                                                      </td>
                                                      <td className="px-6 py-4 text-[13px] font-medium whitespace-nowrap text-slate-500">
                                                          {formatDate(item.updatedAt || item.createdAt)}
                                                      </td>
                                                      <td className="px-6 py-4 text-center">
                                                          {item.approvalStatus === MATERIAL_STATUS.APPROVED ? (
                                                              <span className="inline-flex items-center rounded-full border border-emerald-200/60 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold whitespace-nowrap text-emerald-700">
                                                                  {UI_TEXT.reviewMaterials.statusApproved}
                                                              </span>
                                                          ) : item.approvalStatus === MATERIAL_STATUS.REJECTED ? (
                                                              <span className="inline-flex items-center rounded-full border border-rose-200/60 bg-rose-50 px-2.5 py-0.5 text-xs font-bold whitespace-nowrap text-rose-700">
                                                                  {UI_TEXT.reviewMaterials.statusRejected}
                                                              </span>
                                                          ) : (
                                                              <span className="inline-flex items-center rounded-full border border-amber-200/60 bg-amber-50 px-2.5 py-0.5 text-xs font-bold whitespace-nowrap text-amber-700">
                                                                  {UI_TEXT.reviewMaterials.statusPending}
                                                              </span>
                                                          )}
                                                      </td>
                                                      <td className="p-3.5 text-center whitespace-nowrap">
                                                          <div className="flex items-center justify-center gap-1.5">
                                                              <button
                                                                  type="button"
                                                                  onClick={() => {
                                                                      if (hasVideo) setVideoModalItem(item);
                                                                      else if (hasReading) setReadingModalItem(item);
                                                                      else if (hasQuiz) setQuizModalItem(item);
                                                                      else setVideoModalItem(item);
                                                                  }}
                                                                  title={UI_TEXT.reviewMaterials.btnDetail}
                                                                  className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-sky-50 text-sky-600 transition duration-200 hover:bg-sky-600 hover:text-white"
                                                              >
                                                                  <Eye className="size-4" />
                                                              </button>
                                                              {item.approvalStatus !== MATERIAL_STATUS.APPROVED && (
                                                                  <button
                                                                      type="button"
                                                                      onClick={() => handleApproveSingle(item.id)}
                                                                      disabled={isActionLoading}
                                                                      title={UI_TEXT.reviewMaterials.btnApprove}
                                                                      className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition duration-200 hover:bg-emerald-600 hover:text-white disabled:opacity-50"
                                                                  >
                                                                      <CheckCircle2 className="size-4" />
                                                                  </button>
                                                              )}
                                                              {item.approvalStatus !== MATERIAL_STATUS.REJECTED && (
                                                                  <button
                                                                      type="button"
                                                                      onClick={() => handleRejectSingle(item.id)}
                                                                      disabled={isActionLoading}
                                                                      title={UI_TEXT.reviewMaterials.btnReject}
                                                                      className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-rose-50 text-rose-600 transition duration-200 hover:bg-rose-600 hover:text-white disabled:opacity-50"
                                                                  >
                                                                      <XCircle className="size-4" />
                                                                  </button>
                                                              )}
                                                          </div>
                                                      </td>
                                                  </tr>
                                              );
                                          })}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Pagination Footer */}
                    {totalItems > 0 && (
                        <TablePagination
                            total={totalItems}
                            page={validCurrentPage}
                            totalPages={totalPages}
                            limit={pageSize}
                            onPageChange={(p) => setCurrentPage(p)}
                            onLimitChange={() => {}}
                            className="border-t border-slate-100 p-4"
                        />
                    )}
                </div>

                {/* Specific Review Detail Modals matching screenshots */}
                <ReviewVideoModal
                    isOpen={!!videoModalItem}
                    onClose={() => setVideoModalItem(null)}
                    lessonItem={videoModalItem}
                    sessionName={activeSessionName}
                />

                <ReviewReadingModal
                    isOpen={!!readingModalItem}
                    onClose={() => setReadingModalItem(null)}
                    lessonItem={readingModalItem}
                    sessionName={activeSessionName}
                />

                <ReviewQuizModal isOpen={!!quizModalItem} onClose={() => setQuizModalItem(null)} lessonItem={quizModalItem} sessionName={activeSessionName} />

                {selectedHomeworkModal && (
                    <CustomModal.Root open={!!selectedHomeworkModal} onOpenChange={(open) => !open && setSelectedHomeworkModal(null)}>
                        <CustomModal.Content className="max-w-xl !rounded-[24px]">
                            <Dialog className="flex flex-col gap-4 overflow-hidden rounded-[24px] bg-white p-6 shadow-2xl outline-none">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <Heading slot="title" className="text-lg font-bold text-slate-900">
                                        {UI_TEXT.reviewMaterials.modalHomeworkTitle}
                                    </Heading>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedHomeworkModal(null)}
                                        className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                    >
                                        <X className="size-5" />
                                    </button>
                                </div>
                                <div className="flex flex-col gap-4 text-sm text-slate-700">
                                    <div>
                                        <span className="mb-1 block text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                                            {UI_TEXT.reviewMaterials.thHomeworkName}
                                        </span>
                                        <p className="text-base leading-snug font-bold text-slate-900">{selectedHomeworkModal.title}</p>
                                    </div>
                                    <div>
                                        <span className="mb-1 block text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                                            {UI_TEXT.reviewMaterials.descriptionLabel}
                                        </span>
                                        <div className="max-h-[220px] overflow-y-auto rounded-xl border border-slate-200/80 bg-slate-50 p-3.5 text-sm leading-relaxed whitespace-pre-wrap text-slate-700">
                                            {selectedHomeworkModal.description || UI_TEXT.reviewMaterials.noDescription}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 text-xs">
                                        <div>
                                            <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                                {UI_TEXT.reviewMaterials.systemLabel}
                                            </span>
                                            <span className="mt-0.5 block text-xs font-semibold text-slate-800">{activeSpecializeName}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                                {UI_TEXT.reviewMaterials.subjectLabel}
                                            </span>
                                            <span className="mt-0.5 block text-xs font-semibold text-slate-800">{activeCourseName}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                                {UI_TEXT.reviewMaterials.sessionLabel}
                                            </span>
                                            <span className="mt-0.5 block text-xs font-semibold text-slate-800">{activeSessionName}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                                {UI_TEXT.reviewMaterials.approvalStatusLabel}
                                            </span>
                                            <span className="mt-0.5 inline-block text-xs font-bold">
                                                {selectedHomeworkModal.status === MATERIAL_STATUS.APPROVED ? (
                                                    <span className="text-emerald-600">{UI_TEXT.reviewMaterials.statusApproved}</span>
                                                ) : selectedHomeworkModal.status === MATERIAL_STATUS.REJECTED ? (
                                                    <span className="text-rose-600">{UI_TEXT.reviewMaterials.statusRejected}</span>
                                                ) : (
                                                    <span className="text-amber-600">{UI_TEXT.reviewMaterials.statusPending}</span>
                                                )}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                                {UI_TEXT.reviewMaterials.authorLabel}
                                            </span>
                                            <span className="mt-0.5 block text-xs font-semibold text-slate-800">
                                                {formatUserName(
                                                    selectedHomeworkModal.author || selectedHomeworkModal.createdBy,
                                                    UI_TEXT.reviewMaterials.defaultAuthor,
                                                )}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                                {UI_TEXT.reviewMaterials.updaterLabel}
                                            </span>
                                            <span className="mt-0.5 block text-xs font-semibold text-slate-800">
                                                {formatUserName(
                                                    selectedHomeworkModal.updatedBy,
                                                    formatUserName(
                                                        selectedHomeworkModal.author || selectedHomeworkModal.createdBy,
                                                        UI_TEXT.reviewMaterials.defaultAuthor,
                                                    ),
                                                )}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                                {UI_TEXT.reviewMaterials.createdAtLabel}
                                            </span>
                                            <span className="mt-0.5 block text-xs font-semibold text-slate-800">
                                                {formatDateTime(selectedHomeworkModal.createdAt)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                                {UI_TEXT.reviewMaterials.updatedAtLabel}
                                            </span>
                                            <span className="mt-0.5 block text-xs font-semibold text-slate-800">
                                                {formatDateTime(selectedHomeworkModal.updatedAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Dialog>
                        </CustomModal.Content>
                    </CustomModal.Root>
                )}
            </div>
        </AdminLayout>
    );
}
