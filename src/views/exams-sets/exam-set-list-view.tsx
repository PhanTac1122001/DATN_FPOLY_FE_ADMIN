"use client";

import { useEffect, useState } from "react";
import { Calendar, Eye, Folder, Pencil, Plus, Trash2 } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { CreateQuizModal } from "@/components/application/modals/create-quiz-modal";
import { TablePagination } from "@/components/application/pagination/table-pagination";
import { SearchFilters } from "@/components/application/search-filters/search-filters";
import { EXAM_SETS_MOCK } from "@/constants/exam-set-mock.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { deleteQuiz, getQuizzes } from "@/services/quiz.service";
import { toast } from "@/services/toast.service";
import type { ExamSetMock } from "@/types/exam-set.types";
import { type QuizBackendEntity, mapBackendQuizToExamSet } from "@/types/quiz.types";

const defaultLimit = 10;

export function ExamSetListView() {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(defaultLimit);
    const [examSets, setExamSets] = useState<ExamSetMock[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedQuizForEdit, setSelectedQuizForEdit] = useState<ExamSetMock | null>(null);

    const fetchQuizzes = async () => {
        try {
            setIsLoading(true);
            const data = await getQuizzes();
            if (Array.isArray(data) && data.length > 0) {
                const mapped = data.map(mapBackendQuizToExamSet);
                setExamSets(mapped);
            } else {
                setExamSets(EXAM_SETS_MOCK);
            }
        } catch (error) {
            console.error("Error fetching quizzes:", error);
            setExamSets(EXAM_SETS_MOCK);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void fetchQuizzes();
    }, []);

    const handleDeleteQuiz = async (item: ExamSetMock) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa bộ đề "${item.name}" không?`)) {
            return;
        }

        try {
            await deleteQuiz(item.id);
            toast.success(UI_TEXT.examsSetsEl.title, `${UI_TEXT.examsSetsEl.toastQuizDeleted} "${item.name}"`);
            setExamSets((prev) => prev.filter((q) => q.id !== item.id));
        } catch (error) {
            console.error("Delete quiz error:", error);
            // If it's a mock item, still delete locally for demo
            setExamSets((prev) => prev.filter((q) => q.id !== item.id));
            toast.success(UI_TEXT.examsSetsEl.title, `${UI_TEXT.examsSetsEl.toastQuizDeleted} "${item.name}"`);
        }
    };

    const handleCreateClick = () => {
        setSelectedQuizForEdit(null);
        setIsCreateModalOpen(true);
    };

    const handleEditQuiz = (item: ExamSetMock) => {
        setSelectedQuizForEdit(item);
        setIsCreateModalOpen(true);
    };

    const handleModalSuccess = (quiz: QuizBackendEntity) => {
        const mapped = mapBackendQuizToExamSet(quiz);
        setExamSets((prev) => {
            const exists = prev.some((q) => q.id === mapped.id);
            if (exists) {
                return prev.map((q) => (q.id === mapped.id ? { ...q, name: mapped.name } : q));
            }
            return [mapped, ...prev];
        });
    };

    // Client-side search logic
    const filteredSets = examSets.filter((item) => {
        const query = search.toLowerCase();
        return item.name.toLowerCase().includes(query) || item.id.toLowerCase().includes(query);
    });

    // Pagination computations
    const total = filteredSets.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginatedSets = filteredSets.slice((page - 1) * limit, page * limit);

    const handleSearchChange = (val: string) => {
        setSearch(val);
        setPage(1);
    };

    return (
        <div className="flex min-h-0 w-full flex-1 flex-col gap-6 overflow-hidden">
            {/* Filter Bar & Table Area */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs">
                {/* Filters header */}
                <div className="flex shrink-0 flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                        <SearchFilters search={search} onSearchChange={handleSearchChange} searchPlaceholder={UI_TEXT.examsSetsEl.searchPlaceholder} />
                    </div>
                    <button
                        type="button"
                        onClick={handleCreateClick}
                        className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-wine px-5 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-wine/90 active:scale-95"
                    >
                        <Plus className="size-4.5" />
                        <span>{UI_TEXT.examsSetsEl.btnCreateQuiz}</span>
                    </button>
                </div>

                {/* Table list */}
                <div className="flex-1 overflow-auto">
                    {isLoading ? (
                        <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-4 p-8">
                            <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
                            <p className="text-sm font-semibold text-slate-500">{UI_TEXT.examsSetsEl.loading}</p>
                        </div>
                    ) : (
                        <table className="w-full min-w-[800px] table-auto border-collapse text-left text-sm text-slate-700">
                            <thead>
                                <tr className="sticky top-0 z-10 border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                                    <th className="w-16 px-6 py-4 text-center">{UI_TEXT.examsSetsEl.thStt}</th>
                                    <th className="px-6 py-4">{UI_TEXT.examsSetsEl.thName}</th>
                                    <th className="w-64 px-6 py-4 whitespace-nowrap">{UI_TEXT.examsSetsEl.thCreatedAt}</th>
                                    <th className="w-48 px-6 py-4 text-center whitespace-nowrap">{UI_TEXT.examsSetsEl.thActions}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedSets.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                                            {UI_TEXT.examsSetsEl.noData}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedSets.map((item, index) => (
                                        <tr key={item.id} className="group transition duration-150 hover:bg-slate-50/40">
                                            <td className="border-b border-slate-100 px-6 py-5 text-center font-bold text-slate-400">
                                                {(page - 1) * limit + index + 1}
                                            </td>
                                            <td className="border-b border-slate-100 px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
                                                        <Folder className="size-5 fill-red-100 text-red-500" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="leading-snug font-bold text-slate-900">{item.name}</span>
                                                        <span className="mt-0.5 text-[11.5px] font-semibold text-slate-400">
                                                            {item.questionCount}
                                                            {UI_TEXT.examsSetsEl.questionsCountSuffix}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="border-b border-slate-100 px-6 py-5">
                                                <div className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-500">
                                                    <Calendar className="size-4 text-slate-400" />
                                                    <span>{item.createdAt}</span>
                                                </div>
                                            </td>
                                            <td className="border-b border-slate-100 px-6 py-5">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <Link
                                                        href={`/exams-sets-el/${item.id}` as Route}
                                                        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition duration-200 hover:scale-105 hover:bg-indigo-600 hover:text-white"
                                                        title={UI_TEXT.examsSetsEl.viewDetails}
                                                    >
                                                        <Eye className="size-4" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEditQuiz(item)}
                                                        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition duration-200 hover:bg-emerald-600 hover:text-white"
                                                        title={UI_TEXT.examsSetsEl.editSet}
                                                    >
                                                        <Pencil className="size-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteQuiz(item)}
                                                        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-rose-50 text-rose-600 transition hover:bg-rose-600 hover:text-white"
                                                        title={UI_TEXT.examsSetsEl.deleteSet}
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
                    )}
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
                        className="shrink-0 border-t border-slate-100 px-6 py-4"
                    />
                )}
            </div>

            <CreateQuizModal
                isOpen={isCreateModalOpen}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setSelectedQuizForEdit(null);
                }}
                onSuccess={handleModalSuccess}
                initialData={selectedQuizForEdit}
            />
        </div>
    );
}
