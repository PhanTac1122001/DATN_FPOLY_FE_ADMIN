"use client";

import { useState } from "react";
import { Calendar, Edit, Eye, Folder, Trash2 } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { TablePagination } from "@/components/application/pagination/table-pagination";
import { SearchFilters } from "@/components/application/search-filters/search-filters";
import { EXAM_SETS_MOCK } from "@/constants/exam-set-mock.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { toast } from "@/services/toast.service";

const defaultLimit = 10;

export function ExamSetListView() {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(defaultLimit);

    // Client-side search logic
    const filteredSets = EXAM_SETS_MOCK.filter((item) => {
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
        <div className="flex w-full flex-col gap-8">
            {/* Filter Bar & Table Area */}
            <div className="rounded-2xl border border-slate-100 bg-white shadow-xs">
                {/* Filters header */}
                <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                        <SearchFilters search={search} onSearchChange={handleSearchChange} searchPlaceholder={UI_TEXT.examsSetsEl.searchPlaceholder} />
                    </div>
                </div>

                {/* Table list */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] table-auto border-collapse text-left text-sm text-slate-700">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
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
                                                        {UI_TEXT.examsSetsEl.labelIdPrefix}
                                                        {item.id}
                                                        {UI_TEXT.examsSetsEl.separator}
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
                                            <div className="flex items-center justify-center gap-2">
                                                <Link
                                                    href={`/exams-sets-el/${item.id}` as Route}
                                                    className="inline-flex items-center justify-center rounded-lg border border-emerald-100 bg-white p-2 text-emerald-500 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/50 hover:text-emerald-600"
                                                    title={UI_TEXT.examsSetsEl.viewDetails}
                                                >
                                                    <Eye className="size-4" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => toast.success(UI_TEXT.examsSetsEl.editSet, `${UI_TEXT.examsSetsEl.editSet}: ${item.name}`)}
                                                    className="inline-flex items-center justify-center rounded-lg border border-sky-100 bg-white p-2 text-sky-500 shadow-sm transition hover:border-sky-200 hover:bg-sky-50/50 hover:text-sky-600"
                                                    title={UI_TEXT.examsSetsEl.editSet}
                                                >
                                                    <Edit className="size-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => toast.error(UI_TEXT.examsSetsEl.deleteSet, `${UI_TEXT.examsSetsEl.deleteSet}: ${item.name}`)}
                                                    className="inline-flex items-center justify-center rounded-lg border border-rose-100 bg-white p-2 text-rose-500 shadow-sm transition hover:border-rose-200 hover:bg-rose-50/50 hover:text-rose-600"
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
        </div>
    );
}
