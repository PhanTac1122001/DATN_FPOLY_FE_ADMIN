"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Award, BookOpen, Edit, FileSpreadsheet, Layers, Mail, MapPin, Phone, Plus, Trash2 } from "lucide-react";
import { ClassEnrollmentsModal } from "@/components/application/modals/class-enrollments-modal";
import { ConfirmModal } from "@/components/application/modals/confirm-modal";
import { ExcelImportModal } from "@/components/application/modals/excel-import-modal";
import { LearningPathModal } from "@/components/application/modals/learning-path-modal";
import { StudentFormModal } from "@/components/application/modals/student-form-modal";
import { StudentTranscriptModal } from "@/components/application/modals/student-transcript-modal";
import { TablePagination } from "@/components/application/pagination/table-pagination";
import { SearchFilters } from "@/components/application/search-filters/search-filters";
import { Avatar } from "@/components/base/avatar/avatar";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import { DEFAULT_PAGE_SIZE } from "@/constants/options.constants";
import { STUDENT_LOCATION_OPTIONS, STUDENT_STATUS_OPTIONS } from "@/constants/student.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { deleteStudent, getStudentsList } from "@/services/student.service";
import { getSystemsList } from "@/services/system.service";
import { toast } from "@/services/toast.service";
import type { FilterFieldDefinition, FilterState } from "@/types/filter.types";
import { FilterFieldType } from "@/types/filter.types";
import type { Student } from "@/types/student.types";
import { StudentStatusEnum } from "@/types/student.types";
import { getInitials } from "@/utils/string.utils";

export function UsersView() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [advancedFilterState, setAdvancedFilterState] = useState<FilterState>({
        conditions: [],
    });
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

    // Modal States
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [isExcelOpen, setIsExcelOpen] = useState(false);
    const [isEnrollOpen, setIsEnrollOpen] = useState(false);
    const [isLearningPathOpen, setIsLearningPathOpen] = useState(false);
    const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [activeStudent, setActiveStudent] = useState<Student | null>(null);

    // Extract search / filter values for API query
    const systemFilterValue = useMemo(() => {
        const cond = advancedFilterState.conditions.find((c) => c.fieldKey === "systemId");
        return cond?.value != null ? String(cond.value) : "";
    }, [advancedFilterState]);

    const statusFilterValue = useMemo(() => {
        const cond = advancedFilterState.conditions.find((c) => c.fieldKey === "status");
        return cond?.value != null ? String(cond.value) : "";
    }, [advancedFilterState]);

    // Queries
    const { data: systems = [] } = useQuery({
        queryKey: ["systems"],
        queryFn: getSystemsList,
    });

    const { data: studentsData, isLoading } = useQuery({
        queryKey: ["students-list", search, systemFilterValue, statusFilterValue, page, pageSize],
        queryFn: () =>
            getStudentsList({
                page,
                pageSize,
                name: search || undefined,
                systemId: systemFilterValue || undefined,
                studentStatusSearch: statusFilterValue || undefined,
            }),
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: deleteStudent,
        onSuccess: () => {
            toast.success(UI_TEXT.studentsPage.toastDeleteSuccessTitle, UI_TEXT.studentsPage.toastDeleteSuccessDesc);
            queryClient.invalidateQueries({ queryKey: ["students-list"] });
            queryClient.invalidateQueries({ queryKey: ["students-report"] });
            setIsDeleteOpen(false);
            setActiveStudent(null);
        },
        onError: (err: Error) => {
            toast.error(UI_TEXT.studentsPage.toastDeleteErrorTitle, err.message || UI_TEXT.studentsPage.toastDeleteErrorDefault);
        },
    });

    const handleOpenDelete = (student: Student) => {
        setActiveStudent(student);
        setIsDeleteOpen(true);
    };

    // Filter fields configuration
    const studentFilterFields: FilterFieldDefinition[] = useMemo(
        () => [
            {
                key: "systemId",
                label: UI_TEXT.studentsPage.thSystem,
                type: FilterFieldType.ENUM,
                options: systems.map((sys) => ({
                    id: sys.id,
                    label: sys.name || sys.systemCode,
                })),
            },
            {
                key: "status",
                label: UI_TEXT.studentsPage.thStatus,
                type: FilterFieldType.ENUM,
                options: STUDENT_STATUS_OPTIONS,
            },
            {
                key: "location",
                label: UI_TEXT.studentsPage.thLocation,
                type: FilterFieldType.ENUM,
                options: STUDENT_LOCATION_OPTIONS,
            },
        ],
        [systems],
    );

    const items = studentsData?.items || [];
    const total = studentsData?.total || 0;
    const totalPages = Math.ceil(total / pageSize) || 1;

    const getSystemCodes = (systemIds?: string[]) => {
        if (!systemIds || systemIds.length === 0) return UI_TEXT.studentsPage.noSystem;
        return systemIds
            .map((id) => systems.find((sys) => sys.id === id)?.systemCode || systems.find((sys) => sys.id === id)?.name || id)
            .filter(Boolean)
            .join(", ");
    };

    const getStatusBadgeColor = (st: string) => {
        switch (st) {
            case StudentStatusEnum.DANG_HOC:
                return "success";
            case StudentStatusEnum.BAO_LUU:
            case StudentStatusEnum.CHO_BAO_LUU:
                return "warning";
            case StudentStatusEnum.BO_HOC:
            case StudentStatusEnum.DINH_CHI:
                return "error";
            case StudentStatusEnum.TOT_NGHIEP:
            case StudentStatusEnum.TOT_NGHIEP_SOM:
                return "brand";
            default:
                return "gray";
        }
    };

    return (
        <div className="flex min-h-0 w-full flex-1 flex-col gap-6 overflow-hidden">
            {/* Filter Bar & Table Container */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs">
                {/* Search & Action Toolbar */}
                <div className="flex shrink-0 flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                        <SearchFilters
                            search={search}
                            onSearchChange={(val) => {
                                setSearch(val);
                                setPage(1);
                            }}
                            advancedFilterState={advancedFilterState}
                            setAdvancedFilterState={(st) => {
                                setAdvancedFilterState(st);
                                setPage(1);
                            }}
                            filterFields={studentFilterFields}
                            searchPlaceholder={UI_TEXT.studentsPage.searchPlaceholder}
                        />
                    </div>

                    <div className="flex items-center gap-3.5">
                        <Button
                            color="primary"
                            size="md"
                            onClick={() => setIsExcelOpen(true)}
                            className="gap-2 border-none bg-emerald-600 px-4 font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700"
                            iconLeading={<FileSpreadsheet className="size-4 text-white" />}
                        >
                            {UI_TEXT.studentsPage.btnImportExcel}
                        </Button>
                        <Button
                            color="primary"
                            size="md"
                            onClick={() => {
                                setActiveStudent(null);
                                setIsStudentModalOpen(true);
                            }}
                            className="gap-2 border-none bg-wine px-5 font-bold text-white shadow-md shadow-wine/20 hover:bg-wine-deep"
                            iconLeading={<Plus className="pointer-events-none size-5 shrink-0" />}
                        >
                            {UI_TEXT.studentsPage.btnAddStudent}
                        </Button>
                    </div>
                </div>

                {/* Table List */}
                <div className="flex-1 overflow-auto">
                    {isLoading ? (
                        <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-4">
                            <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
                            <p className="text-sm font-semibold text-slate-500">{UI_TEXT.studentsPage.loading}</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-2 p-8 text-center">
                            <AlertTriangle className="size-10 text-slate-300" />
                            <p className="text-base font-bold text-slate-800">{UI_TEXT.studentsPage.noDataTitle}</p>
                            <p className="text-sm text-slate-500">{UI_TEXT.studentsPage.noDataDesc}</p>
                        </div>
                    ) : (
                        <table className="w-full min-w-[1000px] table-auto border-collapse text-left text-sm text-ink">
                            <thead>
                                <tr className="sticky top-0 z-10 border-b border-line bg-slate-50 text-[11px] font-bold tracking-wider text-muted uppercase">
                                    <th className="w-12 px-6 py-4 text-center">{UI_TEXT.studentsPage.thStt}</th>
                                    <th className="px-6 py-4">{UI_TEXT.studentsPage.thStudent}</th>
                                    <th className="px-6 py-4">{UI_TEXT.studentsPage.thContact}</th>
                                    <th className="w-24 px-6 py-4 text-center whitespace-nowrap">{UI_TEXT.studentsPage.thLocation}</th>
                                    <th className="px-6 py-4 whitespace-nowrap">{UI_TEXT.studentsPage.thSystem}</th>
                                    <th className="w-28 px-6 py-4 text-center whitespace-nowrap">{UI_TEXT.studentsPage.thStatus}</th>
                                    <th className="sticky right-0 z-20 w-16 bg-slate-50 px-4 py-4 text-center whitespace-nowrap" />
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((stu, index) => (
                                    <tr key={stu.id} className="group transition duration-150 hover:bg-slate-50">
                                        <td className="border-b border-line px-6 py-4 text-center font-semibold text-muted">
                                            {(page - 1) * pageSize + index + 1}
                                        </td>
                                        <td className="border-b border-line px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <Avatar
                                                    size="md"
                                                    src={stu.avatar || undefined}
                                                    initials={getInitials(stu.fullName || stu.email)}
                                                    alt={stu.fullName}
                                                    className="shrink-0 bg-indigo-600 font-extrabold !text-white [&_span]:!text-white"
                                                />
                                                <div>
                                                    <div className="text-[14.5px] font-bold text-ink">{stu.fullName}</div>
                                                    <div className="font-mono text-[12px] text-muted">{stu.studentCode || "-"}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="border-b border-line px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-[13px] font-medium text-ink">
                                                <Phone className="size-3.5 shrink-0 text-muted" />
                                                <span>{stu.phone || UI_TEXT.studentsPage.noPhone}</span>
                                            </div>
                                            <div className="mt-1 flex items-center gap-1.5 text-[13px] font-medium text-muted">
                                                <Mail className="size-3.5 shrink-0 text-muted" />
                                                <span className="max-w-[160px] truncate xl:max-w-[200px]" title={stu.email}>
                                                    {stu.email}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="border-b border-line px-6 py-4 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-1 text-[13px] font-semibold text-slate-700">
                                                <MapPin className="size-3.5 shrink-0 text-muted" />
                                                <span>{stu.location || "-"}</span>
                                            </div>
                                        </td>
                                        <td className="border-b border-line px-6 py-4 whitespace-nowrap">
                                            {stu.systemIds && stu.systemIds.length > 0 ? (
                                                <div className="max-w-[140px] truncate xl:max-w-[180px]">
                                                    <Tooltip
                                                        placement="top start"
                                                        title={
                                                            <div className="flex flex-col gap-1 py-0.5 text-left">
                                                                {stu.systemIds.map((id) => {
                                                                    const sys = systems.find((s) => s.id === id);
                                                                    return (
                                                                        <div key={id} className="whitespace-nowrap">
                                                                            {sys?.name ? `${sys.name} (${sys.systemCode})` : id}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        }
                                                    >
                                                        <TooltipTrigger className="block max-w-full cursor-pointer truncate text-[13px] font-semibold text-ink">
                                                            {getSystemCodes(stu.systemIds)}
                                                        </TooltipTrigger>
                                                    </Tooltip>
                                                </div>
                                            ) : (
                                                <div className="text-[13px] font-semibold text-muted">{UI_TEXT.studentsPage.noSystem}</div>
                                            )}
                                        </td>
                                        <td className="border-b border-line px-6 py-4 text-center whitespace-nowrap">
                                            <Badge color={getStatusBadgeColor(stu.status)} size="sm">
                                                {stu.status}
                                            </Badge>
                                        </td>
                                        <td className="sticky right-0 z-20 border-b border-line bg-white px-4 py-4 text-center transition-colors group-hover:bg-slate-50">
                                            <div className="flex justify-center">
                                                <Dropdown.Root>
                                                    <Dropdown.DotsButton className="rounded-lg p-1.5 text-muted hover:bg-cream" />
                                                    <Dropdown.Popover className="z-50 w-52 rounded-xl border border-line bg-white shadow-xl ring-1 ring-line">
                                                        <Dropdown.Menu>
                                                            <Dropdown.Item
                                                                icon={Edit}
                                                                onAction={() => {
                                                                    setActiveStudent(stu);
                                                                    setIsStudentModalOpen(true);
                                                                }}
                                                                className={(state) =>
                                                                    "text-blue-600 [&_svg]:text-current " +
                                                                    (state.isFocused || state.isHovered ? "[&>div]:!bg-blue-50" : "")
                                                                }
                                                            >
                                                                <span>{UI_TEXT.studentsPage.actionEdit}</span>
                                                            </Dropdown.Item>
                                                            <Dropdown.Item
                                                                icon={Layers}
                                                                onAction={() => {
                                                                    setActiveStudent(stu);
                                                                    setIsEnrollOpen(true);
                                                                }}
                                                                className={(state) =>
                                                                    "text-emerald-600 [&_svg]:text-current " +
                                                                    (state.isFocused || state.isHovered ? "[&>div]:!bg-emerald-50" : "")
                                                                }
                                                            >
                                                                <span>{UI_TEXT.studentsPage.actionClasses}</span>
                                                            </Dropdown.Item>
                                                            <Dropdown.Item
                                                                icon={BookOpen}
                                                                onAction={() => {
                                                                    setActiveStudent(stu);
                                                                    setIsLearningPathOpen(true);
                                                                }}
                                                                className={(state) =>
                                                                    "text-indigo-600 [&_svg]:text-current " +
                                                                    (state.isFocused || state.isHovered ? "[&>div]:!bg-indigo-50" : "")
                                                                }
                                                            >
                                                                <span>{UI_TEXT.studentsPage.actionLearningPath}</span>
                                                            </Dropdown.Item>
                                                            <Dropdown.Item
                                                                icon={Award}
                                                                onAction={() => {
                                                                    setActiveStudent(stu);
                                                                    setIsTranscriptOpen(true);
                                                                }}
                                                                className={(state) =>
                                                                    "text-amber-600 [&_svg]:text-current " +
                                                                    (state.isFocused || state.isHovered ? "[&>div]:!bg-amber-50" : "")
                                                                }
                                                            >
                                                                <span>{UI_TEXT.studentsPage.actionTranscript}</span>
                                                            </Dropdown.Item>
                                                            <Dropdown.Separator className="my-1 bg-line" />
                                                            <Dropdown.Item
                                                                icon={Trash2}
                                                                onAction={() => handleOpenDelete(stu)}
                                                                className={(state) =>
                                                                    "text-red-600 [&_svg]:text-current " +
                                                                    (state.isFocused || state.isHovered ? "[&>div]:!bg-red-50" : "")
                                                                }
                                                            >
                                                                <span>{UI_TEXT.studentsPage.actionDelete}</span>
                                                            </Dropdown.Item>
                                                        </Dropdown.Menu>
                                                    </Dropdown.Popover>
                                                </Dropdown.Root>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {total > 0 && (
                    <TablePagination
                        total={total}
                        page={page}
                        totalPages={totalPages}
                        limit={pageSize}
                        onPageChange={setPage}
                        onLimitChange={(lim) => {
                            setPageSize(lim);
                            setPage(1);
                        }}
                        className="shrink-0 border-t border-slate-100 px-6 py-4"
                    />
                )}
            </div>

            {/* Modals */}
            <StudentFormModal
                isOpen={isStudentModalOpen}
                onClose={() => {
                    setIsStudentModalOpen(false);
                    setActiveStudent(null);
                }}
                student={activeStudent}
                systems={systems}
            />

            <ExcelImportModal isOpen={isExcelOpen} onClose={() => setIsExcelOpen(false)} systems={systems} />

            <ClassEnrollmentsModal
                isOpen={isEnrollOpen}
                onClose={() => {
                    setIsEnrollOpen(false);
                    setActiveStudent(null);
                }}
                student={activeStudent}
            />

            <LearningPathModal
                isOpen={isLearningPathOpen}
                onClose={() => {
                    setIsLearningPathOpen(false);
                    setActiveStudent(null);
                }}
                student={activeStudent}
            />

            <StudentTranscriptModal
                isOpen={isTranscriptOpen}
                onClose={() => {
                    setIsTranscriptOpen(false);
                    setActiveStudent(null);
                }}
                student={activeStudent}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={isDeleteOpen}
                onClose={() => {
                    setIsDeleteOpen(false);
                    setActiveStudent(null);
                }}
                onConfirm={() => {
                    if (activeStudent) {
                        deleteMutation.mutate(activeStudent.id);
                    }
                }}
                title={UI_TEXT.studentsPage.confirmDeleteTitle}
                message={
                    UI_TEXT.studentsPage.confirmDeleteMessagePrefix +
                    (activeStudent?.fullName || "") +
                    UI_TEXT.studentsPage.confirmDeleteMessageMid +
                    (activeStudent?.email || "") +
                    UI_TEXT.studentsPage.confirmDeleteMessageSuffix
                }
                confirmText={UI_TEXT.studentsPage.confirmDeleteConfirmBtn}
                cancelText={UI_TEXT.studentsPage.confirmDeleteCancelBtn}
                variant="danger"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
