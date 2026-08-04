"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { User, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { TablePagination } from "@/components/application/pagination/table-pagination";
import { SearchFilters } from "@/components/application/search-filters/search-filters";
import { Button } from "@/components/base/buttons/button";
import { Select } from "@/components/base/select/select";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { DEFAULT_PAGE_SIZE } from "@/constants/options.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { deleteStudentFromClass, enrollStudentInClass, getClassDetail, updateStudentClass } from "@/services/class.service";
import { getStudentsList } from "@/services/student.service";
import { toast } from "@/services/toast.service";
import type { EnrollStudentModalProps } from "@/types/class.types";
import type { FilterFieldDefinition, FilterState } from "@/types/filter.types";
import { FilterFieldType } from "@/types/filter.types";
import type { Student } from "@/types/student.types";
import { cx } from "@/utils/cx";

export function EnrollStudentModal({ isOpen, onClose, classId, enrollmentData }: EnrollStudentModalProps) {
    const queryClient = useQueryClient();
    const isEditMode = !!enrollmentData;

    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [status, setStatus] = useState("STUDYING");
    const [isActive, setIsActive] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [advancedFilterState, setAdvancedFilterState] = useState<FilterState>({
        conditions: [],
    });

    const studentFilterFields = useMemo<FilterFieldDefinition[]>(
        () => [
            {
                key: "studentCode",
                label: UI_TEXT.enrollStudentModal.thStudentCode,
                type: FilterFieldType.STRING,
            },
        ],
        [],
    );

    const studentCodeFilterValue = (function () {
        const cond = advancedFilterState.conditions.find((c) => c.fieldKey === "studentCode");
        return cond?.value != null ? String(cond.value).trim() : "";
    })();

    // Query current class detail to pre-select already enrolled students
    const { data: classDetail } = useQuery({
        queryKey: ["class-detail", classId],
        queryFn: () => getClassDetail(classId),
        enabled: isOpen && !!classId && !isEditMode,
    });

    const enrolledStudents = useMemo(() => classDetail?.students || [], [classDetail?.students]);
    const enrolledStudentIdsStr = useMemo(() => {
        return enrolledStudents
            .map((s) => {
                const stObj = s.student as unknown as Record<string, unknown>;
                if (stObj && typeof stObj === "object") return stObj.id || stObj._id || "";
                if (typeof s.student === "string") return s.student;
                return "";
            })
            .filter(Boolean)
            .join(",");
    }, [enrolledStudents]);

    const enrolledStudentIds = useMemo(() => {
        return enrolledStudentIdsStr ? enrolledStudentIdsStr.split(",") : [];
    }, [enrolledStudentIdsStr]);

    const handleClose = () => {
        setSearchQuery("");
        setAdvancedFilterState({ conditions: [] });
        setPage(1);
        onClose();
    };

    useEffect(() => {
        if (isOpen) {
            if (enrollmentData) {
                const sId = enrollmentData.student?.id || ((enrollmentData.student as unknown as Record<string, unknown>)?._id as string | undefined);
                setSelectedStudentIds(sId ? [sId] : []);
                setStatus(enrollmentData.status || "STUDYING");
                setIsActive(enrollmentData.isActive !== false);
            } else {
                setSelectedStudentIds(enrolledStudentIdsStr ? enrolledStudentIdsStr.split(",") : []);
                setStatus("STUDYING");
                setIsActive(true);
                setSearchQuery("");
                setAdvancedFilterState({ conditions: [] });
                setPage(1);
            }
        } else {
            setSearchQuery("");
            setAdvancedFilterState({ conditions: [] });
            setPage(1);
        }
    }, [enrollmentData, isOpen, enrolledStudentIdsStr]);

    // Query students list for enrollment selection (only Đang học status)
    const { data: studentsRes, isLoading: isLoadingStudents } = useQuery({
        queryKey: ["students-search-list", searchQuery, studentCodeFilterValue, page, pageSize],
        queryFn: () =>
            getStudentsList({
                name: searchQuery || undefined,
                studentCode: studentCodeFilterValue || undefined,
                studentStatusSearch: "ĐANG HỌC",
                page,
                pageSize,
            }),
        enabled: isOpen && !isEditMode,
    });

    // Handle various response data structures from backend
    const rawData = (studentsRes as unknown as Record<string, unknown>)?.data ?? studentsRes;
    let allFetchedStudents: Student[] = [];
    let totalStudents = 0;

    if (Array.isArray(rawData)) {
        allFetchedStudents = rawData;
        totalStudents = rawData.length;
    } else if (rawData && typeof rawData === "object") {
        allFetchedStudents = Array.isArray((rawData as Record<string, unknown>).items)
            ? ((rawData as Record<string, unknown>).items as Student[])
            : Array.isArray((rawData as Record<string, unknown>).students)
              ? ((rawData as Record<string, unknown>).students as Student[])
              : Array.isArray((rawData as Record<string, unknown>).data)
                ? ((rawData as Record<string, unknown>).data as Student[])
                : [];
        totalStudents =
            typeof (rawData as Record<string, unknown>).total === "number"
                ? ((rawData as Record<string, unknown>).total as number)
                : typeof (rawData as Record<string, unknown>).totalItems === "number"
                  ? ((rawData as Record<string, unknown>).totalItems as number)
                  : allFetchedStudents.length;
    }

    // Client-side filtering: only display students with "Đang học" status
    const filteredStudents = allFetchedStudents.filter((st) => {
        const stStatus = String((st as unknown as Record<string, unknown>).status || "").toUpperCase();
        if (stStatus && !stStatus.includes("ĐANG HỌC") && !stStatus.includes("DANG HOC") && stStatus !== `STUDYING` && stStatus !== `ACTIVE`) {
            return false;
        }

        if (searchQuery) {
            const name = String(st.fullName || "").toLowerCase();
            if (!name.includes(searchQuery.toLowerCase().trim())) {
                return false;
            }
        }

        let matchesAdvanced = true;
        for (const condition of advancedFilterState.conditions) {
            if (!condition.fieldKey || condition.value === null || condition.value === "") continue;
            if (condition.fieldKey === "studentCode") {
                const val = String(condition.value).toLowerCase();
                const code = String(st.studentCode || (st as unknown as Record<string, unknown>).code || "").toLowerCase();
                if (!code.includes(val)) {
                    matchesAdvanced = false;
                    break;
                }
            }
        }
        return matchesAdvanced;
    });

    const isClientPaginated = filteredStudents.length > pageSize && totalStudents === allFetchedStudents.length;
    const paginatedStudents = isClientPaginated ? filteredStudents.slice((page - 1) * pageSize, page * pageSize) : filteredStudents;

    const displayTotal = filteredStudents.length !== allFetchedStudents.length ? filteredStudents.length : totalStudents;
    const totalPages = Math.max(1, Math.ceil(displayTotal / pageSize));

    // Multi-select toggle helpers
    const currentPageIds = paginatedStudents.map((s) => s.id);
    const isAllPageSelected = currentPageIds.length > 0 && currentPageIds.every((id) => selectedStudentIds.includes(id));

    const toggleSelectAllPage = () => {
        if (isAllPageSelected) {
            setSelectedStudentIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
        } else {
            setSelectedStudentIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
        }
    };

    const toggleSelectStudent = (id: string) => {
        setSelectedStudentIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    };

    // Enroll / Update Class Roster Mutation
    const enrollMutation = useMutation({
        mutationFn: async () => {
            const newStudentIds = selectedStudentIds.filter((id) => !enrolledStudentIds.includes(id));
            const removedStudentEmbeds = enrolledStudents.filter((s) => {
                const sId = (s.student?.id ||
                    (s.student as unknown as Record<string, unknown>)?._id ||
                    (typeof s.student === "string" ? s.student : "")) as string;
                return sId && !selectedStudentIds.includes(sId);
            });

            const tasks: Promise<unknown>[] = [];

            newStudentIds.forEach((id) => {
                tasks.push(
                    enrollStudentInClass({
                        classId,
                        studentId: id,
                        status,
                        isActive,
                    }),
                );
            });

            removedStudentEmbeds.forEach((s) => {
                if (s.enrollmentId) {
                    tasks.push(deleteStudentFromClass(s.enrollmentId));
                }
            });

            if (tasks.length === 0) return;
            return Promise.all(tasks);
        },
        onSuccess: () => {
            toast.success(UI_TEXT.classes.toastSuccess, UI_TEXT.enrollStudentModal.toastEnrollSuccess);
            queryClient.invalidateQueries({ queryKey: ["class-detail", classId] });
            onClose();
        },
        onError: (err: Error) => {
            toast.error(UI_TEXT.classes.toastError, err.message || UI_TEXT.enrollStudentModal.toastEnrollError);
        },
    });

    const updateMutation = useMutation({
        mutationFn: () =>
            updateStudentClass(enrollmentData!.enrollmentId, {
                status,
                isActive,
            }),
        onSuccess: () => {
            toast.success(UI_TEXT.classes.toastSuccess, UI_TEXT.enrollStudentModal.toastUpdateSuccess);
            queryClient.invalidateQueries({ queryKey: ["class-detail", classId] });
            onClose();
        },
        onError: (err: Error) => {
            toast.error(UI_TEXT.classes.toastError, err.message || UI_TEXT.enrollStudentModal.toastUpdateError);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditMode) {
            updateMutation.mutate();
        } else {
            if (selectedStudentIds.length === 0) {
                toast.error(UI_TEXT.classes.toastError, UI_TEXT.enrollStudentModal.toastNoStudentSelected);
                return;
            }
            enrollMutation.mutate();
        }
    };

    const isPending = enrollMutation.isPending || updateMutation.isPending;

    const statusOptions = [
        { id: `STUDYING`, label: UI_TEXT.enrollStudentModal.statusStudying },
        { id: `RESERVED`, label: UI_TEXT.enrollStudentModal.statusReserved },
        { id: `DROPOFF`, label: UI_TEXT.enrollStudentModal.statusDropoff },
    ];

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <CustomModal.Content className={cx(isEditMode ? "max-w-lg" : "max-w-4xl", "!rounded-[24px]")}>
                <Dialog className="flex flex-col rounded-[24px] bg-white shadow-2xl outline-none">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                        <Heading slot="title" className="text-xl font-bold text-slate-900">
                            {isEditMode
                                ? `${UI_TEXT.enrollStudentModal.updateStudentTitle} ${enrollmentData.student?.fullName || UI_TEXT.enrollStudentModal.defaultStudentLabel}`
                                : UI_TEXT.enrollStudentModal.selectStudentTitle}
                        </Heading>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Body Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
                        {!isEditMode ? (
                            <>
                                {/* Search & Filter Bar */}
                                <div className="flex shrink-0 flex-col gap-4 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                                        <SearchFilters
                                            search={searchQuery}
                                            onSearchChange={(val) => {
                                                setSearchQuery(val);
                                                setPage(1);
                                            }}
                                            advancedFilterState={advancedFilterState}
                                            setAdvancedFilterState={(st) => {
                                                setAdvancedFilterState(st);
                                                setPage(1);
                                            }}
                                            filterFields={studentFilterFields}
                                            searchPlaceholder="Tìm kiếm sinh viên theo tên..."
                                        />
                                    </div>

                                    {/* Selection Counter */}
                                    <div className="text-sm font-semibold whitespace-nowrap text-slate-600">
                                        {"("}
                                        {selectedStudentIds.length} {UI_TEXT.enrollStudentModal.studentsSelectedSuffix}
                                    </div>
                                </div>

                                {/* Students Table */}
                                <div className="custom-scrollbar max-h-[420px] min-h-[320px] overflow-x-auto rounded-2xl border border-line bg-white shadow-xs">
                                    <table className="w-full table-auto border-collapse text-left text-sm text-ink">
                                        <thead>
                                            <tr className="sticky top-0 z-10 border-b border-line bg-slate-50 text-[11px] font-bold tracking-wider text-muted uppercase">
                                                <th className="w-12 px-4 py-3 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={isAllPageSelected}
                                                        onChange={toggleSelectAllPage}
                                                        className="size-4 cursor-pointer rounded border-slate-300 text-wine accent-wine focus:ring-wine"
                                                        title={UI_TEXT.enrollStudentModal.selectAllOnPage}
                                                    />
                                                </th>
                                                <th className="px-4 py-3 text-center">{UI_TEXT.classDetail.thStt}</th>
                                                <th className="px-4 py-3 text-center">{UI_TEXT.enrollStudentModal.thAvatar}</th>
                                                <th className="px-4 py-3">{UI_TEXT.enrollStudentModal.thStudentName}</th>
                                                <th className="px-4 py-3">{UI_TEXT.enrollStudentModal.thStudentCode}</th>
                                                <th className="px-4 py-3">{UI_TEXT.enrollStudentModal.thEmail}</th>
                                                <th className="px-4 py-3">{UI_TEXT.enrollStudentModal.thDob}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {isLoadingStudents ? (
                                                <tr>
                                                    <td colSpan={7} className="p-12 text-center text-sm text-slate-400 italic">
                                                        {UI_TEXT.enrollStudentModal.loadingStudents}
                                                    </td>
                                                </tr>
                                            ) : paginatedStudents.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="p-12 text-center text-sm text-slate-400 italic">
                                                        {UI_TEXT.enrollStudentModal.noStudentsFound}
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedStudents.map((st, index) => {
                                                    const isSelected = selectedStudentIds.includes(st.id);
                                                    const rowNumber = (page - 1) * pageSize + index + 1;
                                                    return (
                                                        <tr
                                                            key={st.id}
                                                            onClick={() => toggleSelectStudent(st.id)}
                                                            className={cx(
                                                                "group cursor-pointer transition duration-150 hover:bg-slate-50",
                                                                isSelected && "border-l-4 border-l-wine bg-slate-50/90",
                                                            )}
                                                        >
                                                            <td className="border-b border-line px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => toggleSelectStudent(st.id)}
                                                                    className="size-4 cursor-pointer rounded border-slate-300 text-wine accent-wine focus:ring-wine"
                                                                />
                                                            </td>
                                                            <td className="border-b border-line px-4 py-3 text-center text-xs font-semibold text-muted">
                                                                {rowNumber}
                                                            </td>
                                                            <td className="border-b border-line px-4 py-3 text-center">
                                                                <div className="mx-auto flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                                                    <User className="size-4" />
                                                                </div>
                                                            </td>
                                                            <td className="border-b border-line px-4 py-3 font-bold text-ink">{st.fullName}</td>
                                                            <td className="border-b border-line px-4 py-3 text-xs font-semibold text-slate-700">
                                                                {st.studentCode || "—"}
                                                            </td>
                                                            <td className="border-b border-line px-4 py-3 text-xs text-muted">{st.email}</td>
                                                            <td className="border-b border-line px-4 py-3 text-xs text-muted">
                                                                {st.dateOfBirth ? new Date(st.dateOfBirth).toLocaleDateString("vi-VN") : "—"}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Table Pagination Footer */}
                                <TablePagination
                                    total={displayTotal}
                                    page={page}
                                    totalPages={totalPages}
                                    limit={pageSize}
                                    onPageChange={(p) => setPage(p)}
                                    onLimitChange={(l) => {
                                        setPageSize(l);
                                        setPage(1);
                                    }}
                                    className="border-t border-slate-100 pt-3"
                                />
                            </>
                        ) : (
                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                <p className="text-sm font-bold text-slate-900">{enrollmentData.student?.fullName}</p>
                                <p className="text-xs text-slate-500">
                                    {UI_TEXT.enrollStudentModal.studentCodeLabel} {enrollmentData.student?.studentCode || "-"}{" "}
                                    {UI_TEXT.enrollStudentModal.emailLabel} {enrollmentData.student?.email}
                                </p>
                            </div>
                        )}

                        {/* Edit mode options or additional status selection */}
                        {isEditMode && (
                            <>
                                <Select
                                    label={UI_TEXT.enrollStudentModal.studyStatusLabel}
                                    placeholder={UI_TEXT.enrollStudentModal.selectStatusPlaceholder}
                                    items={statusOptions}
                                    selectedKey={status}
                                    onSelectionChange={(key) => setStatus(key ? String(key) : "STUDYING")}
                                >
                                    {(item) => (
                                        <Select.Item key={item.id} id={item.id}>
                                            {item.label}
                                        </Select.Item>
                                    )}
                                </Select>

                                <div className="flex items-center gap-2.5 pt-1">
                                    <input
                                        type="checkbox"
                                        id="is-active-student-chk"
                                        checked={isActive}
                                        onChange={(e) => setIsActive(e.target.checked)}
                                        className="size-4 rounded border-slate-300 text-wine focus:ring-wine"
                                    />
                                    <label htmlFor="is-active-student-chk" className="cursor-pointer text-sm font-semibold text-slate-700">
                                        {UI_TEXT.enrollStudentModal.activeInClass}
                                    </label>
                                </div>
                            </>
                        )}

                        {/* Footer buttons - Full Width (Cancel 1/3, Confirm 2/3) */}
                        <div className="mt-4 flex w-full items-center justify-between gap-3 border-t border-slate-100 pt-4">
                            <Button
                                type="button"
                                color="secondary"
                                size="md"
                                onClick={handleClose}
                                className="w-1/3 justify-center rounded-full border-slate-200 py-2.5 text-xs font-bold"
                            >
                                {UI_TEXT.enrollStudentModal.cancel}
                            </Button>
                            <Button
                                type="submit"
                                color="primary"
                                size="md"
                                isLoading={isPending}
                                className="w-2/3 justify-center rounded-full border-none bg-wine py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-wine-deep"
                            >
                                {isEditMode ? UI_TEXT.enrollStudentModal.saveChanges : UI_TEXT.enrollStudentModal.confirm}
                            </Button>
                        </div>
                    </form>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
