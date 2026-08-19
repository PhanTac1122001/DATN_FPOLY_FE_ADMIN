"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { AlertTriangle, Eye, Plus } from "lucide-react";
import { SystemModal } from "@/components/application/modals/system-modal";
import { TablePagination } from "@/components/application/pagination/table-pagination";
import { SearchFilters } from "@/components/application/search-filters/search-filters";
import { Button } from "@/components/base/buttons/button";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { getSystemsList } from "@/services/system.service";
import type { System } from "@/types/system.types";

const defaultLimit = 10;

export function SystemsView() {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(defaultLimit);

    // Modal States
    const [isSystemModalOpen, setIsSystemModalOpen] = useState(false);
    const [selectedSystem, setSelectedSystem] = useState<System | null>(null);

    // Fetch list
    const { data: systems = [], isLoading } = useQuery({
        queryKey: ["systems"],
        queryFn: getSystemsList,
    });

    const handleOpenEdit = (system: System) => {
        setSelectedSystem(system);
        setIsSystemModalOpen(true);
    };

    // Client-side search logic
    const filteredSystems = systems.filter((system) => {
        const matchQuery = search.toLowerCase();
        return (system.name && system.name.toLowerCase().includes(matchQuery)) || (system.systemCode && system.systemCode.toLowerCase().includes(matchQuery));
    });

    // Pagination computations
    const total = filteredSystems.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginatedSystems = filteredSystems.slice((page - 1) * limit, page * limit);

    // Reset page when search query changes
    const handleSearchChange = (val: string) => {
        setSearch(val);
        setPage(1);
    };

    const formatDate = (dateStr: string) => {
        try {
            return format(new Date(dateStr), "dd/MM/yyyy");
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="flex w-full flex-1 flex-col gap-6 overflow-hidden">
            {/* Toolbar */}
            <div className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <SearchFilters search={search} onSearchChange={handleSearchChange} searchPlaceholder={UI_TEXT.trainingSystem.searchPlaceholder} />

                <Button
                    color="primary"
                    size="md"
                    onClick={() => {
                        setSelectedSystem(null);
                        setIsSystemModalOpen(true);
                    }}
                    className="gap-2 border-none bg-wine px-5 font-bold text-white shadow-md shadow-wine/20 hover:bg-wine-deep"
                    iconLeading={<Plus className="size-5 shrink-0" />}
                >
                    {UI_TEXT.trainingSystem.addSystem}
                </Button>
            </div>

            {/* Table Area */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs">
                <div className="flex-1 overflow-auto">
                    {isLoading ? (
                        <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-4">
                            <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
                            <p className="text-sm font-semibold text-slate-500">{UI_TEXT.trainingSystem.loading}</p>
                        </div>
                    ) : filteredSystems.length === 0 ? (
                        <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-2 p-8 text-center">
                            <AlertTriangle className="size-10 text-slate-300" />
                            <p className="text-base font-bold text-slate-800">{UI_TEXT.trainingSystem.noDataTitle}</p>
                            <p className="text-sm text-slate-500">{UI_TEXT.trainingSystem.noDataDesc}</p>
                        </div>
                    ) : (
                        <table className="w-full min-w-[800px] table-auto border-collapse text-left text-sm text-slate-700">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-500 uppercase">
                                    <th className="w-16 px-6 py-4 text-center">{UI_TEXT.trainingSystem.thStt}</th>
                                    <th className="px-6 py-4">{UI_TEXT.trainingSystem.thName}</th>
                                    <th className="w-48 px-6 py-4 text-center">{UI_TEXT.trainingSystem.thCode}</th>
                                    <th className="w-48 px-6 py-4 text-center">{UI_TEXT.trainingSystem.thCreatedAt}</th>
                                    <th className="w-32 px-6 py-4 text-center">{UI_TEXT.trainingSystem.thActions}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedSystems.map((system, index) => (
                                    <tr key={system.id} className="group transition duration-150 hover:bg-slate-50/40">
                                        <td className="border-b border-slate-100 px-6 py-4 text-center font-semibold text-slate-400">
                                            {(page - 1) * limit + index + 1}
                                        </td>
                                        <td className="border-b border-slate-100 px-6 py-4 font-bold text-slate-900">{system.name}</td>
                                        <td className="border-b border-slate-100 px-6 py-4 text-center font-semibold text-slate-600">{system.systemCode}</td>
                                        <td className="border-b border-slate-100 px-6 py-4 text-center text-slate-500">{formatDate(system.createdAt)}</td>
                                        <td className="border-b border-slate-100 px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenEdit(system)}
                                                    className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-sky-50 text-sky-600 transition hover:bg-sky-600 hover:text-white"
                                                    title={UI_TEXT.trainingSystem.viewDetails}
                                                >
                                                    <Eye className="size-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                {!isLoading && filteredSystems.length > 0 && (
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

            {/* Modals */}
            <SystemModal
                isOpen={isSystemModalOpen}
                onClose={() => {
                    setIsSystemModalOpen(false);
                    setSelectedSystem(null);
                }}
                system={selectedSystem}
            />
        </div>
    );
}
