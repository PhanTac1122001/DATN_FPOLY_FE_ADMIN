"use client";

import { useEffect, useState } from "react";
import { Clock, Edit, HelpCircle, Plus, Trash2 } from "lucide-react";
import { CreateQuizziSetModal } from "@/components/application/modals/create-quizzi-set-modal";
import { TablePagination } from "@/components/application/pagination/table-pagination";
import { SearchFilters } from "@/components/application/search-filters/search-filters";
import { Button } from "@/components/base/buttons/button";
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
            toast.success("Xóa bộ đề", `Đã xóa bộ đề "${item.title}"`);
            fetchQuizziSets();
        } catch (error) {
            console.error("Delete session quiz error:", error);
            toast.error("Xóa bộ đề", "Lỗi khi xóa bộ đề");
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
                            <SearchFilters search={search} onSearchChange={(val) => { setSearch(val); setPage(1); }} searchPlaceholder="Tìm kiếm tiêu đề quizzi..." />
                        </div>
                        <Button color="primary" size="md" onClick={handleCreateNew} className="!bg-purple-600 hover:!bg-purple-700">
                            <Plus className="mr-2 size-4" />
                            Tạo quizzi set mới
                        </Button>
                    </div>

                    {/* Table */}
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                <tr>
                                    <th className="px-5 py-4">Tiêu đề Quizzi Set</th>
                                    <th className="px-5 py-4">Số Sessions</th>
                                    <th className="px-5 py-4">Số câu hỏi</th>
                                    <th className="px-5 py-4">Thời gian</th>
                                    <th className="px-5 py-4">Ngày tạo</th>
                                    <th className="px-5 py-4 text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-400">
                                            Đang tải danh sách...
                                        </td>
                                    </tr>
                                ) : quizziSets.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-400">
                                            Chưa có bộ đề Quizzi nào được tạo.
                                        </td>
                                    </tr>
                                ) : (
                                    quizziSets.map((item) => (
                                        <tr key={item.id} className="transition hover:bg-slate-50/50">
                                            <td className="px-5 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800">{item.title}</span>
                                                    {item.description && <span className="text-[11px] text-slate-400 line-clamp-1">{item.description}</span>}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-bold text-purple-700">
                                                    {(item.sessionIds || []).length} Sessions
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5 text-slate-700">
                                                    <HelpCircle className="size-3.5 text-slate-400" />
                                                    <span>{item.questionCount || (item.questions || []).length} câu</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5 text-slate-700">
                                                    <Clock className="size-3.5 text-slate-400" />
                                                    <span>{item.durationMinutes ? `${item.durationMinutes} phút` : "Không giới hạn"}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-slate-500">
                                                {item.createdAt ? new Date(item.createdAt).toLocaleDateString("vi-VN") : "---"}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-purple-50 hover:text-purple-600"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit className="size-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item)}
                                                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                                                        title="Xóa"
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
                            onLimitChange={(l: number) => { setLimit(l); setPage(1); }}
                        />
                    </div>
                )}
            </div>

            {/* Modal */}
            <CreateQuizziSetModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleSuccess}
                editQuiz={editingQuiz}
            />
        </div>
    );
}
