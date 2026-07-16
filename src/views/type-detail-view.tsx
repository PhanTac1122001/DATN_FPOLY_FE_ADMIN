"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowUpDown, ChevronRight, Notebook, Search } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { getSemestersBySpecialize, getSpecializesList, getSystemsList } from "@/services/system.service";
import { toast } from "@/services/toast.service";
import type { TypeDetailViewProps } from "@/types/type.types";
import { getBadgeColorForSemester } from "@/utils/badge.utils";

export function TypeDetailView({ id }: TypeDetailViewProps) {
    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    // Load all nested details: System, its Specializes, and Semesters per Specialize
    const { data: systemDetails, isLoading } = useQuery({
        queryKey: ["system-details", id],
        queryFn: async () => {
            const systems = await getSystemsList();
            const system = systems.find((s) => s.id === id);
            if (!system) return null;

            const allSpecs = await getSpecializesList();
            const filteredSpecs = allSpecs.filter((s) => s.systemId === id);

            const specsWithSemesters = await Promise.all(
                filteredSpecs.map(async (spec) => {
                    const sems = await getSemestersBySpecialize(spec.id);
                    return {
                        id: spec.id,
                        name: spec.name,
                        semesters: sems.map((sem) => ({
                            id: sem.id,
                            name: sem.name,
                        })),
                    };
                }),
            );

            return {
                ...system,
                specializes: specsWithSemesters,
            };
        },
    });

    const toggleSort = () => {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    };

    const formatDate = (dateStr: string) => {
        try {
            return format(new Date(dateStr), "dd/MM/yyyy");
        } catch {
            return dateStr;
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-2xl border border-slate-100 bg-white p-8">
                <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
                <p className="text-sm font-semibold text-slate-500">{UI_TEXT.common.loading}</p>
            </div>
        );
    }

    if (!systemDetails) {
        return (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-white p-8 text-center">
                <p className="text-base font-bold text-slate-800">{UI_TEXT.trainingTypesEl.noData}</p>
                <Link href={"/type" as Route} className="mt-4 rounded-lg bg-wine px-4 py-2 text-sm font-semibold text-white transition hover:bg-wine-deep">
                    {UI_TEXT.errors.goHome}
                </Link>
            </div>
        );
    }

    // Flat list of semesters for search and sort
    const semestersList = systemDetails.specializes.flatMap((spec) =>
        spec.semesters.map((sem) => ({
            id: sem.id,
            semesterName: sem.name,
            specializeName: spec.name,
            badgeColor: getBadgeColorForSemester(sem.name),
        })),
    );

    // Filter semesters by search query
    const filteredSemesters = semestersList.filter((sem) => {
        return sem.semesterName.toLowerCase().includes(search.toLowerCase()) || sem.specializeName.toLowerCase().includes(search.toLowerCase());
    });

    // Sort semesters by name
    const sortedSemesters = [...filteredSemesters].sort((a, b) => {
        if (sortOrder === "asc") {
            return a.semesterName.localeCompare(b.semesterName);
        } else {
            return b.semesterName.localeCompare(a.semesterName);
        }
    });

    return (
        <div className="flex w-full flex-col gap-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-500">
                <Link href={"/type" as Route} className="transition hover:text-wine">
                    {UI_TEXT.trainingTypesEl.breadcrumbParent}
                </Link>
                <ChevronRight className="size-4 text-slate-400" />
                <Link href={"/type" as Route} className="transition hover:text-wine">
                    {UI_TEXT.trainingTypesEl.breadcrumbTitle}
                </Link>
                <ChevronRight className="size-4 text-slate-400" />
                <span className="font-medium text-slate-400">{UI_TEXT.trainingTypesEl.breadcrumbDetail}</span>
            </nav>

            {/* Header info card */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
                <div className="grid grid-cols-1 gap-6 divide-y divide-slate-100 md:grid-cols-3 md:divide-x md:divide-y-0">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{UI_TEXT.trainingTypesEl.labelCode}</span>
                        <span className="mt-1.5 text-[15px] font-extrabold text-slate-800">{systemDetails.systemCode}</span>
                    </div>
                    <div className="flex flex-col pt-4 md:pt-0 md:pl-6">
                        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{UI_TEXT.trainingTypesEl.labelName}</span>
                        <span className="mt-1.5 text-[15px] font-extrabold text-slate-800">{systemDetails.name}</span>
                    </div>
                    <div className="flex flex-col pt-4 md:pt-0 md:pl-6">
                        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{UI_TEXT.trainingTypesEl.labelCreatedAt}</span>
                        <span className="mt-1.5 text-[15px] font-extrabold text-slate-800">{formatDate(systemDetails.createdAt)}</span>
                    </div>
                </div>
            </div>

            {/* Table & Filters Card */}
            <div className="rounded-2xl border border-slate-100 bg-white shadow-xs">
                {/* Search / Sort filters bar */}
                <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative max-w-md flex-1">
                        <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                            <Search className="size-4.5" />
                        </span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={UI_TEXT.trainingTypesEl.searchSemestersPlaceholder}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/20 py-2.5 pr-4 pl-10 text-[13.5px] font-medium text-slate-800 placeholder-slate-400 transition focus:border-wine focus:bg-white focus:ring-1 focus:ring-wine focus:outline-none"
                        />
                    </div>

                    <Button
                        color="secondary"
                        size="md"
                        onClick={toggleSort}
                        className="gap-2 border border-slate-200 bg-white px-4 font-bold text-slate-700 hover:bg-slate-50"
                        iconLeading={<ArrowUpDown className="size-4 text-slate-500" />}
                    >
                        {UI_TEXT.trainingTypesEl.btnSort}
                    </Button>
                </div>

                {/* Semesters Table */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] table-auto border-collapse text-left text-sm text-slate-700">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                                <th className="w-16 px-6 py-4 text-center">{UI_TEXT.trainingTypesEl.thId}</th>
                                <th className="px-6 py-4">{UI_TEXT.trainingTypesEl.breadcrumbTitle}</th>
                                <th className="px-6 py-4">{UI_TEXT.trainingTypesEl.thMajors}</th>
                                <th className="px-6 py-4">{UI_TEXT.trainingTypesEl.thSemester}</th>
                                <th className="w-48 px-6 py-4 text-center whitespace-nowrap">{UI_TEXT.trainingTypesEl.thActions}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedSemesters.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                        {UI_TEXT.trainingTypesEl.noData}
                                    </td>
                                </tr>
                            ) : (
                                sortedSemesters.map((sem, index) => (
                                    <tr key={sem.id} className="group transition duration-150 hover:bg-slate-50/40">
                                        <td className="border-b border-slate-100 px-6 py-5.5 text-center font-bold text-slate-400">{index + 1}</td>
                                        <td className="border-b border-slate-100 px-6 py-5.5 font-bold text-slate-800">{systemDetails.name}</td>
                                        <td className="border-b border-slate-100 px-6 py-5.5 font-medium text-slate-500">{sem.specializeName}</td>
                                        <td className="border-b border-slate-100 px-6 py-5.5">
                                            <Badge color={sem.badgeColor} size="sm">
                                                {sem.semesterName}
                                            </Badge>
                                        </td>
                                        <td className="border-b border-slate-100 px-6 py-5.5">
                                            <div className="flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        toast.success(
                                                            UI_TEXT.trainingTypesEl.btnSubjectList,
                                                            `${UI_TEXT.trainingTypesEl.toastViewing}${sem.semesterName} - ${systemDetails.name}`,
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-wine bg-white px-3 py-1.5 text-xs font-bold text-wine shadow-xs transition hover:bg-wine/5"
                                                >
                                                    <Notebook className="size-3.5" />
                                                    <span>{UI_TEXT.trainingTypesEl.btnSubjectList}</span>
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
        </div>
    );
}
