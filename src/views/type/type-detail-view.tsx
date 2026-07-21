"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowUpDown, Eye, Search } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/application/breadcrumb";
import { Button } from "@/components/base/buttons/button";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { getCoursesBySystem } from "@/services/material.service";
import { getSystemsList } from "@/services/system.service";
import type { TypeDetailViewProps } from "@/types/type.types";

export function TypeDetailView({ id }: TypeDetailViewProps) {
    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    // Query for system and its courses
    const { data: detail, isLoading } = useQuery({
        queryKey: ["system-courses-detail", id],
        queryFn: async () => {
            const systems = await getSystemsList();
            const system = systems.find((s) => s.id === id);
            if (!system) return null;

            const courses = await getCoursesBySystem(id);

            return {
                system,
                courses,
            };
        },
    });

    const formatDate = (dateStr: string) => {
        try {
            return format(new Date(dateStr), "dd/MM/yyyy");
        } catch {
            return dateStr;
        }
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

    if (!detail || !detail.system) {
        return (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 rounded-2xl border border-line bg-white p-8 text-center">
                <p className="text-base font-bold text-ink">{UI_TEXT.trainingTypesEl.noData}</p>
                <Link href={"/type" as Route} className="mt-4 rounded-lg bg-wine px-4 py-2 text-sm font-semibold text-white transition hover:bg-wine-deep">
                    {UI_TEXT.errors.goHome}
                </Link>
            </div>
        );
    }

    // Filter courses by search query
    const filteredCourses = detail.courses.filter((course) => {
        const query = search.toLowerCase();
        return course.name.toLowerCase().includes(query) || course.courseCode.toLowerCase().includes(query);
    });

    // Sort courses by name
    const sortedCourses = [...filteredCourses].sort((a, b) => {
        if (sortOrder === "asc") {
            return a.name.localeCompare(b.name);
        } else {
            return b.name.localeCompare(a.name);
        }
    });

    const toggleSort = () => {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    };

    return (
        <div className="flex w-full flex-col gap-6">
            {/* Breadcrumb */}
            <Breadcrumb items={[{ label: UI_TEXT.trainingTypesEl.breadcrumbTitle, href: "/type" }, { label: detail.system.name }]} />

            {/* Header info card */}
            <div className="rounded-2xl border border-line bg-white p-6 shadow-xs">
                <div className="grid grid-cols-1 gap-6 divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold tracking-wider text-muted uppercase">{UI_TEXT.trainingTypesEl.labelCode}</span>
                        <span className="mt-1.5 text-[15px] font-extrabold text-ink">{detail.system.systemCode}</span>
                    </div>
                    <div className="flex flex-col border-line pt-4 md:pt-0 md:pl-6">
                        <span className="text-[10px] font-bold tracking-wider text-muted uppercase">{UI_TEXT.trainingTypesEl.labelName}</span>
                        <span className="mt-1.5 text-[15px] font-extrabold text-ink">{detail.system.name}</span>
                    </div>
                    <div className="flex flex-col border-line pt-4 md:pt-0 md:pl-6">
                        <span className="text-[10px] font-bold tracking-wider text-muted uppercase">{UI_TEXT.trainingTypesEl.labelCreatedAt}</span>
                        <span className="mt-1.5 text-[15px] font-extrabold text-ink">{formatDate(detail.system.createdAt)}</span>
                    </div>
                </div>
            </div>

            {/* Table & Filters Card */}
            <div className="rounded-2xl border border-line bg-white shadow-xs">
                {/* Search / Sort filters bar */}
                <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative max-w-md flex-1">
                        <span className="absolute inset-y-0 left-3.5 flex items-center text-muted">
                            <Search className="size-4.5" />
                        </span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={UI_TEXT.trainingTypesEl.searchCoursesPlaceholder}
                            className="w-full rounded-xl border border-line bg-cream/20 py-2.5 pr-4 pl-10 text-[13.5px] font-medium text-ink placeholder-muted transition focus:border-wine focus:bg-white focus:ring-1 focus:ring-wine focus:outline-none"
                        />
                    </div>

                    <Button
                        color="secondary"
                        size="md"
                        onClick={toggleSort}
                        className="gap-2 border border-line bg-white px-4 font-bold text-ink hover:bg-cream"
                        iconLeading={<ArrowUpDown className="size-4 text-muted" />}
                    >
                        {UI_TEXT.trainingTypesEl.btnSort}
                    </Button>
                </div>

                {/* Courses Table */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] table-auto border-collapse text-left text-sm text-ink">
                        <thead>
                            <tr className="border-b border-line bg-slate-50/50 text-[11px] font-bold tracking-wider text-muted uppercase">
                                <th className="w-16 px-6 py-4 text-center">{UI_TEXT.trainingTypesEl.thId}</th>
                                <th className="w-48 px-6 py-4">{UI_TEXT.trainingTypesEl.thCourseCode}</th>
                                <th className="px-6 py-4">{UI_TEXT.trainingTypesEl.thCourseName}</th>
                                <th className="w-36 px-6 py-4 text-center">{UI_TEXT.trainingTypesEl.thHours}</th>
                                <th className="px-6 py-4">{UI_TEXT.trainingTypesEl.thDescription}</th>
                                <th className="w-24 px-6 py-4 text-center">{UI_TEXT.staff.thActions}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedCourses.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-muted">
                                        {UI_TEXT.trainingTypesEl.noCoursesData}
                                    </td>
                                </tr>
                            ) : (
                                sortedCourses.map((course, index) => (
                                    <tr key={course.id} className="group transition duration-150 hover:bg-slate-50/40">
                                        <td className="border-b border-line px-6 py-5.5 text-center font-bold text-muted">{index + 1}</td>
                                        <td className="border-b border-line px-6 py-5.5 font-bold text-ink uppercase">{course.courseCode}</td>
                                        <td className="border-b border-line px-6 py-5.5 font-bold text-ink">{course.name}</td>
                                        <td className="border-b border-line px-6 py-5.5 text-center font-bold whitespace-nowrap text-wine">
                                            {course.hour} {UI_TEXT.trainingTypesEl.hours}
                                        </td>
                                        <td className="max-w-xs truncate border-b border-line px-6 py-5.5 font-medium text-muted" title={course.description}>
                                            {course.description || "-"}
                                        </td>
                                        <td className="border-b border-line px-6 py-5.5 text-center">
                                            <Link
                                                href={`/type/${detail.system.id}/${course.id}` as Route}
                                                className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md bg-wine/10 text-wine shadow-xs transition-all duration-200 hover:scale-105 hover:bg-wine hover:text-white hover:shadow-md hover:shadow-wine/20 active:scale-95"
                                                title={UI_TEXT.trainingTypesEl.viewDetails}
                                            >
                                                <Eye className="size-4.5" />
                                            </Link>
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
