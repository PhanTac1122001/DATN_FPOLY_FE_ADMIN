"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { TablePagination } from "@/components/application/pagination/table-pagination";
import { SearchFilters } from "@/components/application/search-filters/search-filters";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { getSystemsList, getSpecializesList } from "@/services/system.service";

const defaultLimit = 10;

export function TypeListView() {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(defaultLimit);

    // Fetch systems and specializes from services
    const { data: systems = [], isLoading: isLoadingSystems } = useQuery({
        queryKey: ["systems"],
        queryFn: getSystemsList,
    });

    const { data: specializes = [], isLoading: isLoadingSpecs } = useQuery({
        queryKey: ["specializes"],
        queryFn: getSpecializesList,
    });

    const isLoading = isLoadingSystems || isLoadingSpecs;

    const formatDate = (dateStr: string) => {
        try {
            return format(new Date(dateStr), "dd/MM/yyyy");
        } catch {
            return dateStr;
        }
    };

    // Map systems with their mapped majors/specializes names
    const mappedTypes = systems.map((system) => {
        const systemSpecs = specializes.filter((spec) => spec.systemId === system.id);
        const majors = systemSpecs.map((spec) => spec.name).join(", ");
        return {
            id: system.id,
            name: system.name,
            majors: majors || "-",
            createdAt: formatDate(system.createdAt),
        };
    });

    // Client-side search logic
    const filteredTypes = mappedTypes.filter((item) => {
        const query = search.toLowerCase();
        return (
            (item.name && item.name.toLowerCase().includes(query)) ||
            (item.majors && item.majors.toLowerCase().includes(query))
        );
    });

    // Pagination computations
    const total = filteredTypes.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginatedTypes = filteredTypes.slice((page - 1) * limit, page * limit);

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
                        <SearchFilters
                            search={search}
                            onSearchChange={handleSearchChange}
                            searchPlaceholder={UI_TEXT.trainingTypesEl.searchPlaceholder}
                        />
                    </div>
                </div>

                {/* Table list */}
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="flex min-h-[300px] h-full flex-col items-center justify-center gap-4 py-12">
                            <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
                            <p className="text-sm font-semibold text-slate-500">{UI_TEXT.common.loading}</p>
                        </div>
                    ) : (
                        <table className="w-full min-w-[800px] table-auto border-collapse text-left text-sm text-slate-700">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                                    <th className="w-16 px-6 py-4 text-center">{UI_TEXT.trainingTypesEl.thStt}</th>
                                    <th className="px-6 py-4">{UI_TEXT.trainingTypesEl.thName}</th>
                                    <th className="px-6 py-4">{UI_TEXT.trainingTypesEl.thMajors}</th>
                                    <th className="w-48 px-6 py-4 text-center whitespace-nowrap">{UI_TEXT.trainingTypesEl.thCreatedAt}</th>
                                    <th className="w-32 px-6 py-4 text-center whitespace-nowrap">{UI_TEXT.trainingTypesEl.thActions}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedTypes.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                            {UI_TEXT.trainingTypesEl.noData}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedTypes.map((item, index) => (
                                        <tr key={item.id} className="group transition duration-150 hover:bg-slate-50/40">
                                            <td className="border-b border-slate-100 px-6 py-5.5 text-center font-bold text-slate-800">
                                                {(page - 1) * limit + index + 1}
                                            </td>
                                            <td className="border-b border-slate-100 px-6 py-5.5 font-bold text-slate-900">{item.name}</td>
                                            <td className="border-b border-slate-100 px-6 py-5.5 font-medium text-slate-500">{item.majors}</td>
                                            <td className="border-b border-slate-100 px-6 py-5.5 text-center font-medium whitespace-nowrap text-slate-500">
                                                {item.createdAt}
                                            </td>
                                            <td className="border-b border-slate-100 px-6 py-5.5">
                                                <div className="flex items-center justify-center">
                                                    <Link
                                                        href={`/type/${item.id}` as Route}
                                                        className="inline-flex items-center justify-center rounded-lg border border-sky-100 bg-white p-2 text-sky-500 shadow-sm transition hover:border-sky-200 hover:bg-sky-50/50 hover:text-sky-600"
                                                        title={UI_TEXT.trainingTypesEl.viewDetails}
                                                    >
                                                        <Eye className="size-4.5" />
                                                    </Link>
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
                {!isLoading && total > 0 && (
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

