"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Layers, Tag as TagIcon } from "lucide-react";
import { BulkAssignBar } from "@/components/application/course-roadmap/bulk-assign-bar";
import { CourseTagsPopover } from "@/components/application/course-roadmap/course-tags-popover";
import { RoadmapColumn } from "@/components/application/course-roadmap/roadmap-column";
import { CareerTagManagerModal } from "@/components/application/modals/career-tag-manager-modal";
import { CourseCategoryManagerModal } from "@/components/application/modals/course-category-manager-modal";
import { SearchFilters } from "@/components/application/search-filters/search-filters";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { courseCategoryService } from "@/services/course-category.service";
import { assignCourseCategory, getCoursesList } from "@/services/course.service";
import { toast } from "@/services/toast.service";
import type { CategoryTarget, RoadmapColumnData } from "@/types/course-roadmap.types";
import type { CourseItem } from "@/types/course.types";

const uncategorizedColumnId = "__uncategorized__";
const countToken = "{count}";

export function CourseRoadmapView() {
    const queryClient = useQueryClient();
    const t = UI_TEXT.courseRoadmap;

    const [search, setSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
    const [tagsCourse, setTagsCourse] = useState<CourseItem | null>(null);

    const { data: categories = [] } = useQuery({
        queryKey: ["course-categories"],
        queryFn: courseCategoryService.getAll,
    });

    const { data: courses = [], isLoading } = useQuery({
        queryKey: ["courses", search],
        queryFn: () => getCoursesList(search),
    });

    const activeCategories = useMemo(
        () => [...categories].filter((category) => category.isActive).sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name)),
        [categories],
    );

    const columns = useMemo<RoadmapColumnData[]>(() => {
        const activeIds = new Set(activeCategories.map((category) => category.id));
        const categorized: RoadmapColumnData[] = activeCategories.map((category) => ({
            id: category.id,
            category,
            isUncategorized: false,
            courses: courses.filter((course) => course.categoryId === category.id),
        }));
        const uncategorizedCourses = courses.filter((course) => !course.categoryId || !activeIds.has(course.categoryId));
        return [...categorized, { id: uncategorizedColumnId, category: null, isUncategorized: true, courses: uncategorizedCourses }];
    }, [activeCategories, courses]);

    const moveMutation = useMutation({
        mutationFn: ({ courseIds, categoryId }: { courseIds: string[]; categoryId: CategoryTarget }) => assignCourseCategory(courseIds, categoryId),
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ["courses"] });
            const count = result?.updated ?? 0;
            if (count > 0) {
                toast.success(t.toastAssignSuccessTitle, t.toastAssignSuccessDesc.replace(countToken, String(count)));
            } else {
                toast.success(t.toastAssignSuccessTitle, t.toastAssignSuccessNeutral);
            }
        },
        onError: (error: unknown) => {
            const errMsg = error instanceof Error ? error.message : t.toastAssignErrorDesc;
            toast.error(t.toastAssignErrorTitle, errMsg);
        },
    });

    const hideMutation = useMutation({
        mutationFn: (categoryId: string) => courseCategoryService.update(categoryId, { isActive: false }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["course-categories"] });
            queryClient.invalidateQueries({ queryKey: ["courses"] });
            toast.success(t.toastHideSuccessTitle, t.toastHideSuccessDesc);
        },
        onError: (error: unknown) => {
            const errMsg = error instanceof Error ? error.message : t.toastHideErrorDesc;
            toast.error(t.toastHideErrorTitle, errMsg);
        },
    });

    const handleToggleSelect = (courseId: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(courseId)) {
                next.delete(courseId);
            } else {
                next.add(courseId);
            }
            return next;
        });
    };

    const handleMoveSingle = (courseId: string, categoryId: CategoryTarget) => {
        moveMutation.mutate({ courseIds: [courseId], categoryId });
    };

    const handleBulkApply = (categoryId: CategoryTarget) => {
        const ids = Array.from(selectedIds);
        if (ids.length === 0) return;
        moveMutation.mutate({ courseIds: ids, categoryId }, { onSuccess: () => setSelectedIds(new Set()) });
    };

    const handleEditTags = (course: CourseItem) => {
        setTagsCourse(course);
    };

    return (
        <div className="flex w-full flex-1 flex-col gap-4 overflow-hidden">
            {/* Toolbar */}
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="w-full sm:max-w-sm">
                    <SearchFilters search={search} onSearchChange={setSearch} searchPlaceholder={t.searchPlaceholder} />
                </div>
                <div className="flex shrink-0 items-center gap-2.5">
                    <button
                        type="button"
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-xs transition hover:border-slate-300 hover:bg-slate-50"
                    >
                        <Layers className="size-4" />
                        <span>{t.manageCategoriesBtn}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsTagManagerOpen(true)}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-xs transition hover:border-slate-300 hover:bg-slate-50"
                    >
                        <TagIcon className="size-4" />
                        <span>{t.manageTagsBtn}</span>
                    </button>
                </div>
            </div>

            {/* Bulk assign bar */}
            {selectedIds.size > 0 && (
                <BulkAssignBar
                    selectedCount={selectedIds.size}
                    activeCategories={activeCategories}
                    isApplying={moveMutation.isPending}
                    onApply={handleBulkApply}
                    onClear={() => setSelectedIds(new Set())}
                />
            )}

            {/* Board */}
            {isLoading ? (
                <div className="flex flex-1 items-center justify-center gap-2 text-sm font-semibold text-slate-500">
                    <div className="size-6 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
                    <span>{t.loading}</span>
                </div>
            ) : courses.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                    <Layers className="size-10 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-500">{t.emptyBoard}</p>
                </div>
            ) : (
                <div className="custom-scrollbar flex min-h-0 flex-1 gap-4 overflow-x-auto pb-2">
                    {columns.map((column) => (
                        <RoadmapColumn
                            key={column.id}
                            column={column}
                            activeCategories={activeCategories}
                            selectedIds={selectedIds}
                            onToggleSelect={handleToggleSelect}
                            onMove={handleMoveSingle}
                            onEditTags={handleEditTags}
                            onEditCategory={() => setIsCategoryModalOpen(true)}
                            onHideCategory={(categoryId) => hideMutation.mutate(categoryId)}
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            <CourseCategoryManagerModal isOpen={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen} />
            <CareerTagManagerModal isOpen={isTagManagerOpen} onOpenChange={setIsTagManagerOpen} />
            <CourseTagsPopover
                course={tagsCourse}
                isOpen={!!tagsCourse}
                onOpenChange={(open) => {
                    if (!open) setTagsCourse(null);
                }}
            />
        </div>
    );
}
