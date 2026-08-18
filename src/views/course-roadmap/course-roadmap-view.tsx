"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Layers, Tag as TagIcon } from "lucide-react";
import { BulkAssignBar } from "@/components/application/course-roadmap/bulk-assign-bar";
import { CareerAssignPanel } from "@/components/application/course-roadmap/career-assign-panel";
import { RoadmapColumn } from "@/components/application/course-roadmap/roadmap-column";
import { CareerTagManagerModal } from "@/components/application/modals/career-tag-manager-modal";
import { CourseCategoryManagerModal } from "@/components/application/modals/course-category-manager-modal";
import { Select } from "@/components/base/select/select";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { careerTagService } from "@/services/career-tag.service";
import { courseCategoryService } from "@/services/course-category.service";
import { assignCourseCategory, getSystemRoadmap, reorderCourses } from "@/services/course.service";
import { getSystemsList } from "@/services/system.service";
import { toast } from "@/services/toast.service";
import type { CategoryTarget, ReorderCourseItem, ReorderDirection, RoadmapColumnData } from "@/types/course-roadmap.types";

const uncategorizedColumnId = "__uncategorized__";
const countToken = "{count}";

export function CourseRoadmapView() {
    const queryClient = useQueryClient();
    const t = UI_TEXT.courseRoadmap;

    const [selectedSystemId, setSelectedSystemId] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
    const [activeCareerId, setActiveCareerId] = useState<string | null>(null);

    const { data: systems = [] } = useQuery({
        queryKey: ["systems"],
        queryFn: getSystemsList,
    });

    const { data: roadmap, isLoading: isRoadmapLoading } = useQuery({
        queryKey: ["staff-roadmap", selectedSystemId],
        queryFn: () => getSystemRoadmap(selectedSystemId),
        enabled: Boolean(selectedSystemId),
    });

    const { data: categories = [] } = useQuery({
        queryKey: ["course-categories"],
        queryFn: courseCategoryService.getAll,
    });

    const { data: careers = [] } = useQuery({
        queryKey: ["career-tags"],
        queryFn: careerTagService.getAll,
    });

    useEffect(() => {
        if (!selectedSystemId && systems.length > 0) {
            setSelectedSystemId(systems[0].id);
        }
    }, [systems, selectedSystemId]);

    const activeCategories = useMemo(
        () => [...categories].filter((category) => category.isActive).sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name)),
        [categories],
    );

    const columns = useMemo<RoadmapColumnData[]>(() => {
        if (!roadmap) return [];
        const categoryColumns: RoadmapColumnData[] = roadmap.categories.map((category) => ({
            id: category.categoryId,
            name: category.name,
            color: category.color,
            categoryId: category.categoryId,
            isUncategorized: false,
            courses: category.courses,
        }));
        if (roadmap.uncategorized.totalCourses > 0) {
            categoryColumns.push({
                id: uncategorizedColumnId,
                name: "",
                color: null,
                categoryId: null,
                isUncategorized: true,
                courses: roadmap.uncategorized.courses,
            });
        }
        return categoryColumns;
    }, [roadmap]);

    const moveMutation = useMutation({
        mutationFn: ({ courseIds, categoryId }: { courseIds: string[]; categoryId: CategoryTarget }) => assignCourseCategory(courseIds, categoryId),
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ["staff-roadmap"] });
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

    const reorderMutation = useMutation({
        mutationFn: (items: ReorderCourseItem[]) => reorderCourses(items),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["staff-roadmap"] });
        },
        onError: () => {
            toast.error(UI_TEXT.common.errorTitle, t.toastReorderError);
        },
    });

    const hideMutation = useMutation({
        mutationFn: (categoryId: string) => courseCategoryService.update(categoryId, { isActive: false }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["course-categories"] });
            queryClient.invalidateQueries({ queryKey: ["staff-roadmap"] });
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

    const handleReorder = (columnId: string, courseId: string, direction: ReorderDirection) => {
        const column = columns.find((item) => item.id === columnId);
        if (!column) return;
        const index = column.courses.findIndex((course) => course.courseId === courseId);
        if (index === -1) return;
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= column.courses.length) return;
        const reordered = [...column.courses];
        const moved = reordered[index];
        reordered[index] = reordered[targetIndex];
        reordered[targetIndex] = moved;
        const items = reordered.map((course, position) => ({ courseId: course.courseId, position }));
        reorderMutation.mutate(items);
    };

    const handleHideCategory = (categoryId: string) => {
        if (!confirm(t.confirmHideCategory)) return;
        hideMutation.mutate(categoryId);
    };

    const systemItems = systems.map((system) => ({ id: system.id, label: system.name }));

    return (
        <div className="flex w-full flex-1 flex-col gap-4 overflow-hidden">
            {/* Header */}
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="w-full sm:max-w-xs">
                    <Select
                        label={t.systemSelectorLabel}
                        placeholder={t.systemSelectorPlaceholder}
                        size="sm"
                        isClearable={false}
                        selectedKey={selectedSystemId || null}
                        items={systemItems}
                        onSelectionChange={(key) => key !== null && key !== undefined && setSelectedSystemId(String(key))}
                    >
                        {(item) => <Select.Item id={item.id} label={item.label} />}
                    </Select>
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

            {/* Body */}
            {!selectedSystemId ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                    <Layers className="size-10 text-slate-300" />
                    <p className="text-sm font-semibold text-slate-500">{t.noSystemSelected}</p>
                </div>
            ) : (
                <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
                    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                        {isRoadmapLoading ? (
                            <div className="flex flex-1 items-center justify-center gap-2 text-sm font-semibold text-slate-500">
                                <div className="size-6 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
                                <span>{t.loading}</span>
                            </div>
                        ) : !roadmap || roadmap.totalCourses === 0 ? (
                            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                                <Layers className="size-10 text-slate-300" />
                                <p className="text-sm font-semibold text-slate-500">{t.emptySystemRoadmap}</p>
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
                                        onReorder={handleReorder}
                                        onEditCategory={() => setIsCategoryModalOpen(true)}
                                        onHideCategory={handleHideCategory}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <CareerAssignPanel systemRoadmap={roadmap} careers={careers} activeCareerId={activeCareerId} onChangeCareer={setActiveCareerId} />
                </div>
            )}

            {/* Modals */}
            <CourseCategoryManagerModal isOpen={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen} />
            <CareerTagManagerModal isOpen={isTagManagerOpen} onOpenChange={setIsTagManagerOpen} />
        </div>
    );
}
