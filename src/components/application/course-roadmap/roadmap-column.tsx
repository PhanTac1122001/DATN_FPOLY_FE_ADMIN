"use client";

import { Dropdown } from "@/components/base/dropdown/dropdown";
import { COURSE_CATEGORY_NEUTRAL_COLOR } from "@/constants/colors.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import type { RoadmapColumnProps } from "@/types/course-roadmap.types";
import { CourseCard } from "./course-card";

export function RoadmapColumn({
    column,
    activeCategories,
    selectedIds,
    onToggleSelect,
    onMove,
    onReorder,
    onEditCategory,
    onHideCategory,
}: RoadmapColumnProps) {
    const t = UI_TEXT.courseRoadmap;
    const { categoryId, isUncategorized, courses } = column;
    const dotColor = column.color || COURSE_CATEGORY_NEUTRAL_COLOR;
    const columnName = isUncategorized ? t.uncategorizedColumn : column.name;
    const lastIndex = courses.length - 1;

    return (
        <div className="flex w-80 shrink-0 flex-col rounded-3xl border border-slate-100 bg-slate-50/60">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3.5">
                <div className="flex min-w-0 items-center gap-2.5">
                    <span className="size-3.5 shrink-0 rounded-md border border-slate-200" style={{ backgroundColor: dotColor }} />
                    <span className="truncate text-sm font-black text-slate-900">{columnName}</span>
                    <span className="shrink-0 rounded-full bg-slate-200/70 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                        {courses.length} {t.courseCountSuffix}
                    </span>
                </div>
                {!isUncategorized && categoryId && (
                    <Dropdown.Root>
                        <Dropdown.DotsButton className="p-1.5" />
                        <Dropdown.Popover>
                            <Dropdown.Menu>
                                <Dropdown.Item label={t.columnMenuEdit} onAction={() => onEditCategory(categoryId)} />
                                <Dropdown.Item label={t.columnMenuHide} onAction={() => onHideCategory(categoryId)} />
                            </Dropdown.Menu>
                        </Dropdown.Popover>
                    </Dropdown.Root>
                )}
            </div>

            <div className="custom-scrollbar flex flex-1 flex-col gap-2.5 overflow-y-auto p-3">
                {courses.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center px-4 py-10 text-center text-xs font-medium text-slate-400">{t.emptyColumn}</div>
                ) : (
                    courses.map((course, index) => (
                        <CourseCard
                            key={course.courseId}
                            course={course}
                            activeCategories={activeCategories}
                            isSelected={selectedIds.has(course.courseId)}
                            isFirst={index === 0}
                            isLast={index === lastIndex}
                            onToggleSelect={onToggleSelect}
                            onMove={onMove}
                            onMoveUp={(courseId) => onReorder(column.id, courseId, "up")}
                            onMoveDown={(courseId) => onReorder(column.id, courseId, "down")}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
