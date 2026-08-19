"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { AlertTriangle, Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmModal } from "@/components/application/modals/confirm-modal";
import { ProcessDocumentModal } from "@/components/application/modals/process-document-modal";
import { TablePagination } from "@/components/application/pagination/table-pagination";
import { SearchFilters } from "@/components/application/search-filters/search-filters";
import { DEFAULT_INITIAL_LIMIT, DEFAULT_INITIAL_PAGE, DEFAULT_SEARCH_DEBOUNCE_MS } from "@/constants/table.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { deleteProcessDocument, getProcessDocuments } from "@/services/chatbot.service";
import { getSystemsList } from "@/services/system.service";
import { toast } from "@/services/toast.service";
import type { ProcessDocument } from "@/types/chatbot.types";

export function ProcessDocumentsView() {
    const t = UI_TEXT.chatbot;
    const queryClient = useQueryClient();

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(DEFAULT_INITIAL_PAGE);
    const [limit, setLimit] = useState(DEFAULT_INITIAL_LIMIT);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selected, setSelected] = useState<ProcessDocument | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<ProcessDocument | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(DEFAULT_INITIAL_PAGE);
        }, DEFAULT_SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading } = useQuery({
        queryKey: ["chatbot-process-documents", debouncedSearch, page, limit],
        queryFn: () => getProcessDocuments({ search: debouncedSearch, page, limit }),
    });

    // Map hệ id -> mã để hiển thị phạm vi áp dụng của mỗi quy trình.
    const { data: systems = [] } = useQuery({ queryKey: ["systems"], queryFn: getSystemsList });
    const systemCodeById = new Map(systems.map((sys) => [sys.id, sys.systemCode]));

    const items = data?.items ?? [];
    const total = data?.total ?? 0;
    const totalPages = Math.ceil(total / limit) || 1;

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ["chatbot-process-documents"] });

    const openCreate = () => {
        setSelected(null);
        setIsModalOpen(true);
    };

    const openEdit = (doc: ProcessDocument) => {
        setSelected(doc);
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            setIsDeleting(true);
            await deleteProcessDocument(deleteTarget._id);
            toast.success(UI_TEXT.common.successTitle, t.toastDeleteDocSuccess);
            setDeleteTarget(null);
            invalidate();
        } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : UI_TEXT.common.genericError;
            toast.error(UI_TEXT.common.errorTitle, errMsg);
        } finally {
            setIsDeleting(false);
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "";
        try {
            return format(new Date(dateStr), "dd/MM/yyyy");
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="flex w-full flex-1 flex-col gap-6 overflow-hidden">
            <div className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <SearchFilters search={search} onSearchChange={setSearch} searchPlaceholder={t.searchDocPlaceholder} />
                <button
                    type="button"
                    onClick={openCreate}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-wine px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-wine/20 transition hover:bg-wine-deep"
                >
                    <Plus className="size-5 shrink-0" />
                    {t.addDocument}
                </button>
            </div>

            <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs">
                <div className="flex-1 overflow-auto">
                    {isLoading ? (
                        <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-4">
                            <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
                            <p className="text-sm font-semibold text-slate-500">{t.loading}</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-2 p-8 text-center">
                            <AlertTriangle className="size-10 text-slate-300" />
                            <p className="text-base font-bold text-slate-800">{t.noDataTitle}</p>
                            <p className="text-sm text-slate-500">{t.noDocDesc}</p>
                        </div>
                    ) : (
                        <table className="w-full min-w-[880px] table-auto border-collapse text-left text-sm text-slate-700">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-500 uppercase">
                                    <th className="w-16 px-6 py-4 text-center">{t.thStt}</th>
                                    <th className="w-40 px-6 py-4">{t.thCode}</th>
                                    <th className="px-6 py-4">{t.thTitle}</th>
                                    <th className="w-44 px-6 py-4">{t.thSystems}</th>
                                    <th className="w-32 px-6 py-4 text-center">{t.thActive}</th>
                                    <th className="w-36 px-6 py-4 text-center">{t.thUpdatedAt}</th>
                                    <th className="w-40 px-6 py-4 text-center">{t.thActions}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((doc, index) => (
                                    <tr key={doc._id} className="group transition duration-150 hover:bg-slate-50/40">
                                        <td className="border-b border-slate-100 px-6 py-4 text-center font-semibold text-slate-400">
                                            {(page - 1) * limit + index + 1}
                                        </td>
                                        <td className="border-b border-slate-100 px-6 py-4 font-bold text-slate-600 uppercase">{doc.code}</td>
                                        <td className="border-b border-slate-100 px-6 py-4 font-bold text-slate-900">{doc.title}</td>
                                        <td className="border-b border-slate-100 px-6 py-4">
                                            {doc.systemIds && doc.systemIds.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {doc.systemIds.map((id) => (
                                                        <span
                                                            key={id}
                                                            className="inline-flex rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-wine uppercase"
                                                        >
                                                            {systemCodeById.get(id) ?? id}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                                                    {t.systemsShared}
                                                </span>
                                            )}
                                        </td>
                                        <td className="border-b border-slate-100 px-6 py-4 text-center">
                                            {doc.isActive ? (
                                                <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
                                                    {t.active}
                                                </span>
                                            ) : (
                                                <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                                                    {t.inactive}
                                                </span>
                                            )}
                                        </td>
                                        <td className="border-b border-slate-100 px-6 py-4 text-center text-slate-500">{formatDate(doc.updatedAt)}</td>
                                        <td className="border-b border-slate-100 px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEdit(doc)}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                                                >
                                                    <Pencil className="size-3.5" />
                                                    {t.edit}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteTarget(doc)}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                    {t.delete}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                {!isLoading && items.length > 0 && (
                    <TablePagination
                        total={total}
                        page={page}
                        totalPages={totalPages}
                        limit={limit}
                        onPageChange={setPage}
                        onLimitChange={(l) => {
                            setLimit(l);
                            setPage(DEFAULT_INITIAL_PAGE);
                        }}
                        className="shrink-0 border-t border-slate-100 px-6 py-4"
                    />
                )}
            </div>

            <ProcessDocumentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={invalidate} editingDocument={selected} />
            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title={t.deleteDocTitle}
                message={t.deleteDocMessage}
                confirmText={t.confirmDelete}
                cancelText={UI_TEXT.common.cancel}
                variant="danger"
                isLoading={isDeleting}
                icon={<Trash2 className="size-6 text-red-500" />}
            />
        </div>
    );
}
