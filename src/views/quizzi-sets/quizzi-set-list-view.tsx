"use client";

import { useEffect, useState } from "react";
import { Clock, Eye, HelpCircle, Pencil, Plus, Trash2 } from "lucide-react";
import { CreateQuizziSetModal } from "@/components/application/modals/create-quizzi-set-modal";
import { QuizziSetDetailModal } from "@/components/application/modals/quizzi-set-detail-modal";
import { TablePagination } from "@/components/application/pagination/table-pagination";
import { SearchFilters } from "@/components/application/search-filters/search-filters";
import { Button } from "@/components/base/buttons/button";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { deleteSessionQuiz, getSessionQuizzes } from "@/services/session-quiz.service";
import { toast } from "@/services/toast.service";
import type { SessionQuizItem } from "@/types/session-quiz.types";

const defaultLimit = 10;

export function QuizziSetListView() {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(defaultLimit);
    const [quizziSets, setQuizziSets] = useState<SessionQuizItem[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState<SessionQuizItem | null>(null);
    const [viewingQuiz, setViewingQuiz] = useState<SessionQuizItem | null>(null);

    const fetchQuizziSets = async () => {
        try {
            setIsLoading(true);
            const data = await getSessionQuizzes({ search, page, limit });
            setQuizziSets(data.items || []);
            setTotal(data.total || 0);
        } catch (error) {
            console.error("Error fetching quizzi sets:", error);
            setQuizziSets([]);
            setTotal(0);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void fetchQuizziSets();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, page, limit]);

    const handleCreateNew = () => {
        setEditingQuiz(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item: SessionQuizItem) => {
        setEditingQuiz(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (item: SessionQuizItem) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa bộ đề Quizzi "${item.title}" không?`)) {
            return;
        }

        try {
            await deleteSessionQuiz(item.id);
            toast.success(UI_TEXT.quizziSetsPage.toastDeleteSuccessTitle, `${UI_TEXT.quizziSetsPage.toastDeleteSuccessDesc} "${item.title}"`);
            fetchQuizziSets();
        } catch (error) {
            console.error("Delete session quiz error:", error);
            toast.error(UI_TEXT.quizziSetsPage.toastDeleteErrorTitle, UI_TEXT.quizziSetsPage.toastDeleteErrorDesc);
        }
    };

    const handleSuccess = () => {
        fetchQuizziSets();
    };

    const totalPages = Math.ceil(total / limit) || 1;

    return (
        <div className="flex min-h-0 w-full flex-1 flex-col gap-6">
            <div className="flex min-h-0 flex-1 flex-col justify-between rounded-2xl border border-slate-100 bg-white shadow-xs">
                <div>
                    {/* Header controls */}
                    <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                            <SearchFilters
                                search={search}
                                onSearchChange={(val) => {
                                    setSearch(val);
                                    setPage(1);
                                }}
                                searchPlaceholder={UI_TEXT.quizziSetsPage.searchPlaceholder}
                            />
                        </div>
                        <Button color="primary" size="md" onClick={handleCreateNew} className="shrink-0 !bg-purple-600 whitespace-nowrap hover:!bg-purple-700">
                            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                                <Plus className="size-4 shrink-0 text-white" />
                                <span className="whitespace-nowrap">{UI_TEXT.quizziSetsPage.createBtn}</span>
                            </span>
                        </Button>
                    </div>

                    {/* Table */}
                    <div className="w-full overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm text-slate-700">
                            <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                                <tr>
                                    <th className="px-6 py-4 font-bold">{UI_TEXT.quizziSetsPage.tableHeaderTitle}</th>
                                    <th className="px-6 py-4 font-bold">{UI_TEXT.quizziSetsPage.tableHeaderSessionsCount}</th>
                                    <th className="px-6 py-4 font-bold">{UI_TEXT.quizziSetsPage.tableHeaderQuestionsCount}</th>
                                    <th className="px-6 py-4 font-bold">{UI_TEXT.quizziSetsPage.tableHeaderDuration}</th>
                                    <th className="px-6 py-4 font-bold">{UI_TEXT.quizziSetsPage.tableHeaderCreatedAt}</th>
                                    <th className="px-6 py-4 text-right font-bold">{UI_TEXT.quizziSetsPage.tableHeaderActions}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-400">
                                            {UI_TEXT.quizziSetsPage.loading}
                                        </td>
                                    </tr>
                                ) : quizziSets.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-400">
                                            {UI_TEXT.quizziSetsPage.emptyData}
                                        </td>
                                    </tr>
                                ) : (
                                    quizziSets.map((item) => (
                                        <tr key={item.id} className="group border-b border-slate-100 transition duration-150 hover:bg-slate-50">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[14.5px] leading-snug font-bold text-slate-900">{item.title}</span>
                                                    {item.description && (
                                                        <span className="mt-0.5 line-clamp-1 text-[13px] font-medium text-slate-500">{item.description}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700">
                                                    {(item.sessionIds || []).length} {UI_TEXT.quizziSetsPage.sessionsCountLabel}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-[13px] font-medium text-slate-700">
                                                    <HelpCircle className="size-3.5 text-slate-400" />
                                                    <span>
                                                        {item.questionCount || (item.questions || []).length} {UI_TEXT.quizziSetsPage.questionsCountSuffix}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-[13px] font-medium text-slate-700">
                                                    <Clock className="size-3.5 text-slate-400" />
                                                    <span>
                                                        {item.durationMinutes
                                                            ? `${item.durationMinutes} ${UI_TEXT.quizziSetsPage.durationUnit}`
                                                            : UI_TEXT.quizziSetsPage.unlimitedTime}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-[13px] font-medium whitespace-nowrap text-slate-500">
                                                {item.createdAt ? new Date(item.createdAt).toLocaleDateString("vi-VN") : "---"}
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => setViewingQuiz(item)}
                                                        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-sky-50 text-sky-600 transition duration-200 hover:scale-105 hover:bg-sky-600 hover:text-white"
                                                        title={UI_TEXT.quizziSetsPage.viewDetailsBtn}
                                                    >
                                                        <Eye className="size-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEdit(item)}
                                                        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition duration-200 hover:bg-emerald-600 hover:text-white"
                                                        title={UI_TEXT.quizziSetsPage.editBtn}
                                                    >
                                                        <Pencil className="size-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(item)}
                                                        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-rose-50 text-rose-600 transition duration-200 hover:bg-rose-600 hover:text-white"
                                                        title={UI_TEXT.quizziSetsPage.deleteBtn}
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
                </div>

                {/* Pagination */}
                {total > 0 && (
                    <div className="border-t border-slate-100 p-4">
                        <TablePagination
                            page={page}
                            totalPages={totalPages}
                            total={total}
                            limit={limit}
                            onPageChange={setPage}
                            onLimitChange={(l: number) => {
                                setLimit(l);
                                setPage(1);
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Modals */}
            <CreateQuizziSetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleSuccess} editQuiz={editingQuiz} />

            <QuizziSetDetailModal isOpen={!!viewingQuiz} onClose={() => setViewingQuiz(null)} quizziSet={viewingQuiz} />
        </div>
    );
}
