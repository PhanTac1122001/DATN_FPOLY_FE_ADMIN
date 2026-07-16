# Training Types API Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the backend API endpoints for Systems, Specializations, Semesters, and Courses into `TypeListView` and `TypeDetailView` to replace the static mock data.

**Architecture:** Use `@tanstack/react-query` to fetch training systems, specializations, semesters, and courses, mapping them dynamically to fit the display components. Add a Course List Modal to view courses in a semester.

**Tech Stack:** React, React Query, Next.js, Lucide Icons, date-fns, TailwindCSS.

## Global Constraints
- Exact path names and structures
- Follow established UI layout patterns (borders, shadows, typography)
- Fetch data from actual APIs via `system.service.ts` and `material.service.ts`

---

### Task 1: Update TypeListView with Real API Integration

**Files:**
- Modify: [type-list-view.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/views/type-list-view.tsx)

**Interfaces:**
- Consumes: `getSystemsList` and `getSpecializesList` from `@/services/system.service`
- Produces: A dynamically loaded and searchable grid of Systems and their associated specializations.

- [ ] **Step 1: Modify `src/views/type-list-view.tsx`**
  Replace mock data imports and filtering logic with `useQuery` hooks. Combine systems and specializations to resolve the majors list dynamically.

```tsx
"use client";

import { useState } from "react";
import { Eye, AlertTriangle } from "lucide-react";
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
        return (
            item.name.toLowerCase().includes(query) ||
            item.code.toLowerCase().includes(query) ||
            item.majors.toLowerCase().includes(query)
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

    if (isLoading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center bg-white rounded-2xl border border-slate-100 p-8 shadow-xs">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
                    <p className="text-sm font-semibold text-slate-500">{UI_TEXT.trainingSystem.loading || "Đang tải dữ liệu..."}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col gap-8">
            <div className="rounded-2xl border border-slate-100 bg-white shadow-xs">
                <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                        <SearchFilters search={search} onSearchChange={handleSearchChange} searchPlaceholder={UI_TEXT.trainingTypesEl.searchPlaceholder} />
                    </div>
                </div>

                <div className="overflow-x-auto">
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
                </div>

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
```

- [ ] **Step 2: Verify compiling and formatting**
Ensure there are no build errors.

---

### Task 2: Update TypeDetailView with Real API Integration & Course Modal

**Files:**
- Modify: [type-detail-view.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/views/type-detail-view.tsx)

**Interfaces:**
- Consumes:
  - `getSystemsList`, `getSpecializesList`, and `getSemestersBySpecialize` from `@/services/system.service`
  - `getCoursesBySystem` from `@/services/material.service`
- Produces: Detailed view of a system, dynamic semester badge styling, and a modal showing actual courses for a selected semester.

- [ ] **Step 1: Modify `src/views/type-detail-view.tsx`**
Update the file to include a combined details query fetching system info, parent specialization, semesters, and courses. Render `CourseListModal` upon clicking "Danh sách môn học".

```tsx
"use client";

import { useState } from "react";
import { ArrowUpDown, ChevronRight, Notebook, Search, X, BookOpen } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { Heading } from "react-aria-components";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { getSystemsList, getSpecializesList, getSemestersBySpecialize } from "@/services/system.service";
import { getCoursesBySystem } from "@/services/material.service";
import type { TypeDetailViewProps } from "@/types/type.types";

export function TypeDetailView({ id }: TypeDetailViewProps) {
    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [selectedSemester, setSelectedSemester] = useState<any | null>(null);

    // Combined query for full system details
    const { data: detail, isLoading } = useQuery({
        queryKey: ["system-detail", id],
        queryFn: async () => {
            const [systems, allSpecs] = await Promise.all([
                getSystemsList(),
                getSpecializesList(),
            ]);

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
                })
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
            "warning", "orange", "error", "blue", "success", "purple", "pink", "indigo", "brand"
        ];
        return colors[priority % colors.length] || "gray";
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center bg-white rounded-2xl border border-slate-100 p-8 shadow-xs">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
                    <p className="text-sm font-semibold text-slate-500">{UI_TEXT.trainingSystem.loading || "Đang tải dữ liệu..."}</p>
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
    const getSemesterCourses = (sem: any) => {
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
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-wine bg-white px-3 py-1.5 text-xs font-bold text-wine shadow-xs transition hover:bg-wine/5 cursor-pointer"
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

interface CourseListModalProps {
    isOpen: boolean;
    onClose: () => void;
    semesterName: string;
    courses: any[];
}

function CourseListModal({ isOpen, onClose, semesterName, courses }: CourseListModalProps) {
    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="max-w-2xl !rounded-[24px] w-full">
                <Dialog className="bg-white p-6 rounded-[24px] flex flex-col max-h-[80vh] outline-none shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100 shrink-0">
                        <div>
                            <Heading slot="title" className="text-lg font-black text-slate-800">Danh sách môn học</Heading>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5">{semesterName}</p>
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer">
                            <X className="size-5 text-slate-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto py-4 min-h-0 custom-scrollbar">
                        {courses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
                                <BookOpen className="size-10 text-slate-300 mb-2" />
                                <p className="text-sm font-semibold">Không có môn học nào trong kỳ học này</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {courses.map((course) => (
                                    <div key={course.id} className="py-3 flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-slate-900">{course.name}</span>
                                                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 uppercase">{course.courseCode}</span>
                                            </div>
                                            {course.description && (
                                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{course.description}</p>
                                            )}
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="text-xs font-bold text-wine">{course.hour} giờ</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end pt-4 border-t border-slate-100 shrink-0">
                        <Button color="secondary" size="md" onClick={onClose} className="font-bold border border-slate-200">
                            Đóng
                        </Button>
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
```

- [ ] **Step 2: Verify compile correctness**
Verify that all packages and types are correct.

---
