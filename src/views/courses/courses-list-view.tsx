"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Award, Calculator, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { CourseFormModal } from "@/components/application/modals/course-form-modal";
import { CourseRpointConfigModal } from "@/components/application/modals/course-rpoint-config-modal";
import { DeleteCourseModal } from "@/components/application/modals/delete-course-modal";
import { TablePagination } from "@/components/application/pagination/table-pagination";
import { SearchFilters } from "@/components/application/search-filters/search-filters";
import { DEFAULT_OPTIONS_LIMIT } from "@/constants/options.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { createCourse, deleteCourse, getCoursesList, updateCourse } from "@/services/course.service";
import { toast } from "@/services/toast.service";
import type { CourseItem, CreateCoursePayload } from "@/types/course.types";

export function CoursesListView() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(DEFAULT_OPTIONS_LIMIT);

    // Modals state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<CourseItem | null>(null);
    const [rpointCourse, setRpointCourse] = useState<CourseItem | null>(null);

    const { data: courses = [], isLoading } = useQuery({
        queryKey: ["courses", search],
        queryFn: () => getCoursesList(search),
    });

    const createMutation = useMutation({
        mutationFn: createCourse,
        onSuccess: () => {
            toast.success("Thành công", "Tạo môn học mới thành công");
            queryClient.invalidateQueries({ queryKey: ["courses"] });
        },
        onError: (error: Error) => {
            toast.error("Lỗi", error.message || "Không thể tạo môn học");
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: CreateCoursePayload }) => updateCourse(id, payload),
        onSuccess: () => {
            toast.success("Thành công", "Cập nhật môn học thành công");
            queryClient.invalidateQueries({ queryKey: ["courses"] });
        },
        onError: (error: Error) => {
            toast.error("Lỗi", error.message || "Không thể cập nhật môn học");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCourse,
        onSuccess: () => {
            toast.success("Thành công", "Xóa môn học thành công");
            queryClient.invalidateQueries({ queryKey: ["courses"] });
        },
        onError: (error: Error) => {
            toast.error("Lỗi", error.message || "Không thể xóa môn học");
        },
    });

    const handleSearchChange = (val: string) => {
        setSearch(val);
        setPage(1);
    };

    const handleCreateClick = () => {
        setSelectedCourse(null);
        setIsFormOpen(true);
    };

    const handleEditClick = (course: CourseItem) => {
        setSelectedCourse(course);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (course: CourseItem) => {
        setCourseToDelete(course);
        setIsDeleteOpen(true);
    };

    const handleFormSubmit = async (payload: CreateCoursePayload) => {
        if (selectedCourse) {
            await updateMutation.mutateAsync({ id: selectedCourse.id, payload });
        } else {
            await createMutation.mutateAsync(payload);
        }
    };

    const handleConfirmDelete = async (id: string) => {
        await deleteMutation.mutateAsync(id);
    };

    const total = courses.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginatedCourses = courses.slice((page - 1) * limit, page * limit);

    return (
        <div className="flex min-h-0 w-full flex-1 flex-col gap-6">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-xs">
                {/* Header Actions & Filter */}
                <div className="flex flex-col gap-4 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <SearchFilters search={search} onSearchChange={handleSearchChange} searchPlaceholder={UI_TEXT.coursesPage.searchPlaceholder} />
                    <button
                        type="button"
                        onClick={handleCreateClick}
                        className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-wine px-5 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-wine/90 active:scale-95"
                    >
                        <Plus className="size-4.5" />
                        <span>{UI_TEXT.coursesPage.addCourse}</span>
                    </button>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto">
                    <table className="w-full min-w-[850px] table-auto border-collapse text-left text-sm text-ink">
                        <thead>
                            <tr className="border-b border-line bg-slate-50/50 text-[11px] font-bold tracking-wider text-muted uppercase">
                                <th className="w-16 px-6 py-4 text-center">{UI_TEXT.coursesPage.thStt}</th>
                                <th className="w-32 px-6 py-4">{UI_TEXT.coursesPage.thCode}</th>
                                <th className="px-6 py-4">{UI_TEXT.coursesPage.thTitle}</th>
                                <th className="px-6 py-4">{UI_TEXT.coursesPage.thFormula}</th>
                                <th className="w-44 px-6 py-4 text-center">{UI_TEXT.coursesPage.thActions}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted">
                                        {UI_TEXT.coursesPage.loading}
                                    </td>
                                </tr>
                            ) : paginatedCourses.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted">
                                        {UI_TEXT.coursesPage.noDataTitle}
                                    </td>
                                </tr>
                            ) : (
                                paginatedCourses.map((item, index) => (
                                    <tr key={item.id} className="group transition duration-150 hover:bg-slate-50">
                                        <td className="border-b border-line px-6 py-4 text-center font-bold text-muted group-last:border-b-0">
                                            {(page - 1) * limit + index + 1}
                                        </td>
                                        <td className="border-b border-line px-6 py-4 font-mono font-bold text-wine group-last:border-b-0">{item.code}</td>
                                        <td className="border-b border-line px-6 py-4 font-bold text-ink group-last:border-b-0">
                                            <div>{item.title}</div>
                                            {item.description && <div className="mt-0.5 text-xs font-normal text-muted">{item.description}</div>}
                                        </td>
                                        <td className="border-b border-line px-6 py-4 group-last:border-b-0">
                                            {item.gradingFormula.useCustomFormula !== false ? (
                                                <div className="flex items-center gap-2 text-xs font-medium text-muted">
                                                    <Calculator className="size-3.5 text-wine shrink-0" />
                                                    <span>
                                                        {UI_TEXT.coursesPage.formulaCc}
                                                        {item.gradingFormula.attendanceWeight}
                                                        {UI_TEXT.coursesPage.formulaQuiz}
                                                        {item.gradingFormula.quizWeight}
                                                        {UI_TEXT.coursesPage.formulaExam}
                                                        {item.gradingFormula.examWeight}
                                                        {UI_TEXT.coursesPage.formulaPass}
                                                        {item.gradingFormula.passScore}
                                                        {UI_TEXT.coursesPage.formulaSuffix}
                                                    </span>
                                                </div>
                                            ) : item.category ? (
                                                <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                                                    <Calculator className="size-3.5 text-wine shrink-0" />
                                                    <span>{item.category}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs font-medium text-muted">{UI_TEXT.coursesPage.notEnabled}</span>
                                            )}
                                        </td>
                                        <td className="border-b border-line px-6 py-4 text-center group-last:border-b-0">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <Link
                                                    href={`/elearning/${item.id}` as Route}
                                                    className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-wine/10 text-wine transition duration-200 hover:scale-105 hover:bg-wine hover:text-white"
                                                    title={UI_TEXT.coursesPage.elearningTooltip}
                                                >
                                                    <Eye className="size-4" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => setRpointCourse(item)}
                                                    className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-amber-50 text-amber-700 transition duration-200 hover:bg-amber-500 hover:text-white"
                                                    title={UI_TEXT.coursesPage.rpointConfigTooltip}
                                                >
                                                    <Award className="size-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditClick(item)}
                                                    className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-amber-50 text-amber-600 transition duration-200 hover:bg-amber-500 hover:text-white"
                                                    title={UI_TEXT.coursesPage.btnEdit}
                                                >
                                                    <Pencil className="size-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteClick(item)}
                                                    className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-rose-50 text-rose-600 transition hover:bg-rose-600 hover:text-white"
                                                    title={UI_TEXT.coursesPage.btnDelete}
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {total > 0 && (
                    <TablePagination
                        total={total}
                        page={page}
                        totalPages={totalPages}
                        limit={limit}
                        onPageChange={(p) => setPage(p)}
                        onLimitChange={(l) => {
                            setLimit(l);
                            setPage(1);
                        }}
                        className="shrink-0 border-t border-line px-6 py-3.5"
                    />
                )}
            </div>

            {/* Modals */}
            <CourseFormModal isOpen={isFormOpen} onOpenChange={setIsFormOpen} initialData={selectedCourse} onSubmit={handleFormSubmit} />

            <CourseRpointConfigModal
                isOpen={!!rpointCourse}
                onOpenChange={(open) => {
                    if (!open) setRpointCourse(null);
                }}
                courseId={rpointCourse?.id || ""}
                courseTitle={rpointCourse?.title || ""}
            />

            <DeleteCourseModal isOpen={isDeleteOpen} onOpenChange={setIsDeleteOpen} course={courseToDelete} onConfirm={handleConfirmDelete} />
        </div>
    );
}

