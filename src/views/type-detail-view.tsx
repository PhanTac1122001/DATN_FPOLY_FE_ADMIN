"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowUpDown, BookOpen, ChevronRight, Notebook, Search, X } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Heading } from "react-aria-components";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { getCoursesBySystem } from "@/services/material.service";
import { getSemestersBySpecialize, getSpecializesList, getSystemsList } from "@/services/system.service";
import type { CourseListModalProps, SemesterWithSpec, TypeDetailViewProps } from "@/types/type.types";

export function TypeDetailView({ id }: TypeDetailViewProps) {
    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [selectedSemester, setSelectedSemester] = useState<SemesterWithSpec | null>(null);

    // Combined query for full system details
    const { data: detail, isLoading } = useQuery({
        queryKey: ["system-detail", id],
        queryFn: async () => {
            const [systems, allSpecs] = await Promise.all([getSystemsList(), getSpecializesList()]);

            const system = systems.find((s) => s.id === id);
            if (!system) return null;

            const specs = allSpecs.filter((s) => s.systemId === id);

            const semestersWithSpec = await Promise.all(
                specs.map(async (spec) => {
                    const sems = await getSemestersBySpecialize(spec.id);
                    return sems.map((sem) => ({
                        ...sem,
                        specializeName: spec.name,
                    }));
                }),
            );

            const courses = await getCoursesBySystem(id);

            return {
                system,
                semesters: semestersWithSpec.flat(),
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

    const getBadgeColor = (priority: number) => {
        const colors: ("warning" | "orange" | "error" | "blue" | "success" | "purple" | "pink" | "indigo" | "brand")[] = [
            "warning",
            "orange",
            "error",
            "blue",
            "success",
            "purple",
            "pink",
            "indigo",
            "brand",
        ];
        return colors[priority % colors.length] || "gray";
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-100 bg-white p-8 shadow-xs">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
                    <p className="text-sm font-semibold text-slate-500">{UI_TEXT.trainingSystem.loading}</p>
                </div>
            </div>
        );
    }

    if (!detail || !detail.system) {
        return (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-white p-8 text-center">
                <p className="text-base font-bold text-slate-800">{UI_TEXT.trainingTypesEl.noData}</p>
                <Link href={"/type" as Route} className="mt-4 rounded-lg bg-wine px-4 py-2 text-sm font-semibold text-white transition hover:bg-wine-deep">
                    {UI_TEXT.errors.goHome}
                </Link>
            </div>
        );
    }

    // Filter semesters by search query
    const filteredSemesters = detail.semesters.filter((sem) => {
        return sem.name.toLowerCase().includes(search.toLowerCase());
    });

    // Sort semesters by name
    const sortedSemesters = [...filteredSemesters].sort((a, b) => {
        if (sortOrder === "asc") {
            return a.name.localeCompare(b.name);
        } else {
            return b.name.localeCompare(a.name);
        }
    });

    const toggleSort = () => {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    };

    // Filter courses assigned to this semester
    const getSemesterCourses = (sem: SemesterWithSpec) => {
        return detail.courses.filter((course) => sem.courseIds?.includes(course.id));
    };

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
                        <span className="mt-1.5 text-[15px] font-extrabold text-slate-800">{detail.system.systemCode}</span>
                    </div>
                    <div className="flex flex-col pt-4 md:pt-0 md:pl-6">
                        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{UI_TEXT.trainingTypesEl.labelName}</span>
                        <span className="mt-1.5 text-[15px] font-extrabold text-slate-800">{detail.system.name}</span>
                    </div>
                    <div className="flex flex-col pt-4 md:pt-0 md:pl-6">
                        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{UI_TEXT.trainingTypesEl.labelCreatedAt}</span>
                        <span className="mt-1.5 text-[15px] font-extrabold text-slate-800">{formatDate(detail.system.createdAt)}</span>
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
                                        <td className="border-b border-slate-100 px-6 py-5.5 font-bold text-slate-800">{detail.system.name}</td>
                                        <td className="border-b border-slate-100 px-6 py-5.5 font-medium text-slate-500">{sem.specializeName}</td>
                                        <td className="border-b border-slate-100 px-6 py-5.5">
                                            <Badge color={getBadgeColor(sem.priority)} size="sm">
                                                {sem.name}
                                            </Badge>
                                        </td>
                                        <td className="border-b border-slate-100 px-6 py-5.5">
                                            <div className="flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedSemester(sem)}
                                                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-wine bg-white px-3 py-1.5 text-xs font-bold text-wine shadow-xs transition hover:bg-wine/5"
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

            {/* Course List Modal */}
            {selectedSemester && (
                <CourseListModal
                    isOpen={!!selectedSemester}
                    onClose={() => setSelectedSemester(null)}
                    semesterName={`${selectedSemester.name} - ${selectedSemester.specializeName}`}
                    courses={getSemesterCourses(selectedSemester)}
                />
            )}
        </div>
    );
}

function CourseListModal({ isOpen, onClose, semesterName, courses }: CourseListModalProps) {
    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="w-full max-w-2xl !rounded-[24px]">
                <Dialog className="flex max-h-[80vh] flex-col overflow-hidden rounded-[24px] bg-white p-6 shadow-2xl outline-none">
                    {/* Header */}
                    <div className="flex shrink-0 items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                            <Heading slot="title" className="text-lg font-black text-slate-800">
                                {UI_TEXT.trainingTypesEl.modalTitle}
                            </Heading>
                            <p className="mt-0.5 text-xs font-semibold text-slate-400">{semesterName}</p>
                        </div>
                        <button onClick={onClose} className="cursor-pointer rounded-lg p-1 hover:bg-slate-100">
                            <X className="size-5 text-slate-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto py-4">
                        {courses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                                <BookOpen className="mb-2 size-10 text-slate-300" />
                                <p className="text-sm font-semibold">{UI_TEXT.trainingTypesEl.noCourses}</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {courses.map((course) => (
                                    <div key={course.id} className="flex items-start justify-between gap-4 py-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-slate-900">{course.name}</span>
                                                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 uppercase">
                                                    {course.courseCode}
                                                </span>
                                            </div>
                                            {course.description && <p className="mt-1 line-clamp-2 text-xs text-slate-500">{course.description}</p>}
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <span className="text-xs font-bold text-wine">
                                                {course.hour} {UI_TEXT.trainingTypesEl.hours}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex shrink-0 justify-end border-t border-slate-100 pt-4">
                        <Button color="secondary" size="md" onClick={onClose} className="border border-slate-200 font-bold">
                            {UI_TEXT.common.close}
                        </Button>
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
