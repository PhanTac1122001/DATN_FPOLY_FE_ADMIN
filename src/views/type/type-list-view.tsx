"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { TablePagination } from "@/components/application/pagination/table-pagination";
import { SearchFilters } from "@/components/application/search-filters/search-filters";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { getSpecializesList, getSystemsList } from "@/services/system.service";

const defaultLimit = 10;

export function TypeListView() {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(defaultLimit);

    // Fetch systems
    const { data: systems = [], isLoading: isSystemsLoading } = useQuery({
        queryKey: ["systems"],
        queryFn: getSystemsList,
    });

    // Fetch specializes
    const { data: specializes = [], isLoading: isSpecsLoading } = useQuery({
        queryKey: ["specializes"],
        queryFn: getSpecializesList,
    });

    const isLoading = isSystemsLoading || isSpecsLoading;

    // Date formatting helper
    const formatDate = (dateStr: string) => {
        try {
            return format(new Date(dateStr), "dd/MM/yyyy");
        } catch {
            return dateStr;
        }
    };

    // Map systems with their specializes
    const mappedTypes = systems.map((system) => {
        const systemSpecs = specializes.filter((spec) => spec.systemId === system.id);
        const majors = systemSpecs.map((spec) => spec.name).join(", ");
        return {
            id: system.id,
            name: system.name,
            code: system.systemCode,
            majors: majors || "Chuyên ngành chung",
            createdAt: formatDate(system.createdAt),
        };
    });

    // Client-side search logic
    const filteredTypes = mappedTypes.filter((item) => {
        const query = search.toLowerCase();
        return item.name.toLowerCase().includes(query) || item.code.toLowerCase().includes(query) || item.majors.toLowerCase().includes(query);
    });

    // Pagination computations
    const total = filteredTypes.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginatedTypes = filteredTypes.slice((page - 1) * limit, page * limit);

    const handleSearchChange = (val: string) => {
        setSearch(val);
        setPage(1);
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-line bg-white p-8 shadow-xs">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
                    <p className="text-sm font-semibold text-muted">{UI_TEXT.trainingSystem.loading}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col gap-8">
            {/* Filter Bar & Table Area */}
            <div className="rounded-2xl border border-line bg-white shadow-xs">
                {/* Filters header */}
                <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                        <SearchFilters search={search} onSearchChange={handleSearchChange} searchPlaceholder={UI_TEXT.trainingTypesEl.searchPlaceholder} />
                    </div>
                </div>

                {/* Table list */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] table-auto border-collapse text-left text-sm text-ink">
                        <thead>
                            <tr className="border-b border-line bg-slate-50/50 text-[11px] font-bold tracking-wider text-muted uppercase">
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
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted">
                                        {UI_TEXT.trainingTypesEl.noData}
                                    </td>
                                </tr>
                            ) : (
                                paginatedTypes.map((item, index) => (
                                    <tr key={item.id} className="group transition duration-150 hover:bg-slate-50/40">
                                        <td className="border-b border-line px-6 py-5.5 text-center font-bold text-muted">{(page - 1) * limit + index + 1}</td>
                                        <td className="border-b border-line px-6 py-5.5 font-bold text-ink">{item.name}</td>
                                        <td className="border-b border-line px-6 py-5.5 font-medium text-muted">{item.majors}</td>
                                        <td className="border-b border-line px-6 py-5.5 text-center font-medium whitespace-nowrap text-muted">
                                            {item.createdAt}
                                        </td>
                                        <td className="border-b border-line px-6 py-5.5">
                                            <div className="flex items-center justify-center">
                                                <Link
                                                    href={`/type/${item.id}` as Route}
                                                    className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md bg-wine/10 text-wine shadow-xs transition-all duration-200 hover:scale-105 hover:bg-wine hover:text-white hover:shadow-md hover:shadow-wine/20 active:scale-95"
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
                        className="shrink-0 border-t border-line px-6 py-4"
                    />
                )}
            </div>
        </div>
    );
}
