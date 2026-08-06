"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowUpDown, Eye, Plus, Search } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/application/breadcrumb";
import { AssignCourseModal } from "@/components/application/modals/assign-course-modal";
import { Button } from "@/components/base/buttons/button";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { getCoursesBySystem } from "@/services/material.service";
import { getSystemsList } from "@/services/system.service";
import type { CourseItem } from "@/types/course.types";
import type { SystemCourseItem, TypeDetailViewProps } from "@/types/type.types";

export function TypeDetailView({ id }: TypeDetailViewProps) {
    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [assignedLocalCourses, setAssignedLocalCourses] = useState<SystemCourseItem[]>([]);

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

    const handleAssignCourses = async (selected: CourseItem[]) => {
        const mapped = selected.map((item, idx) => ({
            id: item.id,
            courseCode: item.code,
            name: item.title,
            hour: 40,
            category: item.category,
            description: item.description,
            isVisible: true,
            position: (detail?.courses.length || 0) + idx + 1,
        }));
        setAssignedLocalCourses((prev) => [...prev, ...mapped]);
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
                <Link href={"/type" as Route} className="mt-4 rounded-full bg-wine px-5 py-2 text-sm font-semibold text-white transition hover:bg-wine-deep">
                    {UI_TEXT.errors.goHome}
                </Link>
            </div>
        );
    }

    const allCourses = [...(detail.courses as SystemCourseItem[]), ...assignedLocalCourses];

    // Filter courses by search query
    const filteredCourses = allCourses.filter((course) => {
        const query = search.toLowerCase();
        return (
            course.name.toLowerCase().includes(query) ||
            course.courseCode.toLowerCase().includes(query) ||
            (course.category && course.category.toLowerCase().includes(query))
        );
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
        <div className="flex min-h-0 w-full flex-1 flex-col gap-6">
            {/* Breadcrumb */}
            <Breadcrumb items={[{ label: UI_TEXT.trainingTypesEl.breadcrumbTitle, href: "/type" }, { label: detail.system.name }]} />

            {/* Header info card */}
            <div className="rounded-3xl border border-line bg-white p-6 shadow-xs">
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
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-xs">
                {/* Search / Sort filters bar */}
                <div className="flex flex-col gap-4 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative max-w-md flex-1">
                        <span className="absolute inset-y-0 left-3.5 flex items-center text-muted">
                            <Search className="size-4.5" />
                        </span>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={UI_TEXT.trainingTypesEl.searchCoursesPlaceholder}
                            className="w-full rounded-full border border-line bg-cream/20 py-2.5 pr-4 pl-10 text-[13.5px] font-medium text-ink placeholder-muted transition focus:border-wine focus:bg-white focus:ring-1 focus:ring-wine focus:outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            color="secondary"
                            size="md"
                            onClick={toggleSort}
                            className="gap-2 rounded-full border border-line bg-white px-4 font-bold text-ink hover:bg-cream"
                            iconLeading={<ArrowUpDown className="size-4 text-muted" />}
                        >
                            {UI_TEXT.trainingTypesEl.btnSort}
                        </Button>

                        <button
                            type="button"
                            onClick={() => setIsAssignOpen(true)}
                            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-wine px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-wine/90 active:scale-95"
                        >
                            <Plus className="size-4" />
                            <span>{UI_TEXT.trainingSystem.assignCourseModal.btnAssign}</span>
                        </button>
                    </div>
                </div>

                {/* Courses Table */}
                <div className="flex-1 overflow-auto">
                    <table className="w-full min-w-[850px] table-auto border-collapse text-left text-sm text-ink">
                        <thead>
                            <tr className="border-b border-line bg-slate-50/50 text-[11px] font-bold tracking-wider text-muted uppercase">
                                <th className="w-16 px-6 py-4 text-center">{UI_TEXT.trainingTypesEl.thId}</th>
                                <th className="w-36 px-6 py-4">{UI_TEXT.trainingTypesEl.thCourseCode}</th>
                                <th className="px-6 py-4">{UI_TEXT.trainingTypesEl.thCourseName}</th>
                                <th className="w-52 px-6 py-4 whitespace-nowrap">{UI_TEXT.trainingTypesEl.thCategory}</th>
                                <th className="w-32 px-6 py-4 text-center">{UI_TEXT.trainingTypesEl.thHours}</th>
                                <th className="px-6 py-4">{UI_TEXT.trainingTypesEl.thDescription}</th>
                                <th className="sticky right-0 z-20 w-16 bg-slate-50 px-4 py-4 text-center whitespace-nowrap"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedCourses.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-muted">
                                        {UI_TEXT.trainingTypesEl.noCoursesData}
                                    </td>
                                </tr>
                            ) : (
                                sortedCourses.map((course, index) => (
                                    <tr key={course.id} className="group transition duration-150 hover:bg-slate-50">
                                        <td className="border-b border-line px-6 py-4 text-center font-bold text-muted group-last:border-b-0">{index + 1}</td>
                                        <td className="border-b border-line px-6 py-4 font-mono font-bold text-wine uppercase group-last:border-b-0">
                                            {course.courseCode}
                                        </td>
                                        <td className="border-b border-line px-6 py-4 font-bold text-ink group-last:border-b-0">{course.name}</td>
                                        <td className="border-b border-line px-6 py-4 whitespace-nowrap group-last:border-b-0">
                                            <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-slate-700">
                                                {course.category || UI_TEXT.trainingTypesEl.defaultCategory}
                                            </span>
                                        </td>
                                        <td className="border-b border-line px-6 py-4 text-center font-bold whitespace-nowrap text-wine group-last:border-b-0">
                                            {course.hour} {UI_TEXT.trainingTypesEl.hours}
                                        </td>
                                        <td
                                            className="max-w-xs truncate border-b border-line px-6 py-4 font-medium text-muted group-last:border-b-0"
                                            title={course.description}
                                        >
                                            {course.description || "-"}
                                        </td>
                                        <td className="sticky right-0 z-20 border-b border-line bg-white px-4 py-4 text-center transition-colors group-last:border-b-0 group-hover:bg-slate-50">
                                            <Link
                                                href={`/elearning/${course.id}` as Route}
                                                className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-wine/10 text-wine shadow-xs transition-all duration-200 hover:scale-105 hover:bg-wine hover:text-white hover:shadow-md hover:shadow-wine/20 active:scale-95"
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

            {/* Modal Gán môn học vào Hệ */}
            <AssignCourseModal isOpen={isAssignOpen} onOpenChange={setIsAssignOpen} systemName={detail.system.name} onAssign={handleAssignCourses} />
        </div>
    );
}
