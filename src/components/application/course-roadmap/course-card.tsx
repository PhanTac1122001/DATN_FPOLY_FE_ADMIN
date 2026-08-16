"use client";

import { Tag } from "lucide-react";
import { Select } from "@/components/base/select/select";
import { UI_TEXT } from "@/constants/ui-text.constants";
import type { CategoryTarget, CourseCardProps } from "@/types/course-roadmap.types";

const removeGroupKey = "__remove_group__";

export function CourseCard({ course, activeCategories, isSelected, onToggleSelect, onMove, onEditTags }: CourseCardProps) {
    const t = UI_TEXT.courseRoadmap;

    const moveItems = [{ id: removeGroupKey, label: t.removeFromCategory }, ...activeCategories.map((category) => ({ id: category.id, label: category.name }))];

    const handleMoveSelection = (key: string | number | null) => {
        if (key === null || key === undefined) return;
        const target: CategoryTarget = key === removeGroupKey ? null : String(key);
        onMove(course.id, target);
    };

    const tags = course.careerTags ?? [];

    return (
        <div
            className={`flex flex-col gap-2.5 rounded-2xl border bg-white p-3.5 shadow-2xs transition ${
                isSelected ? "border-wine ring-1 ring-wine/30" : "border-slate-100 hover:border-slate-300"
            }`}
        >
            <div className="flex items-start gap-2.5">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(course.id)}
                    className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-slate-300 text-wine focus:ring-wine"
                    aria-label={course.title}
                />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="inline-flex w-fit items-center rounded-md border border-wine/10 bg-wine/5 px-2 py-0.5 font-mono text-[11px] font-bold text-wine">
                        {course.code}
                    </span>
                    <span className="text-sm font-bold text-slate-900">{course.title}</span>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
                {tags.length === 0 ? (
                    <span className="text-[11px] font-medium text-slate-400">{t.noTags}</span>
                ) : (
                    tags.map((tag) => (
                        <span key={tag.id} className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                            {tag.name}
                        </span>
                    ))
                )}
            </div>

            <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                    <Select
                        aria-label={t.moveCourseAction}
                        placeholder={t.moveCourseAction}
                        size="sm"
                        isClearable={false}
                        selectedKey={null}
                        items={moveItems}
                        onSelectionChange={handleMoveSelection}
                    >
                        {(item) => <Select.Item id={item.id} label={item.label} />}
                    </Select>
                </div>
                <button
                    type="button"
                    onClick={() => onEditTags(course)}
                    className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-2xs transition hover:bg-slate-50 hover:text-wine"
                    title={t.editTagsAction}
                >
                    <Tag className="size-4" />
                </button>
            </div>
        </div>
    );
}
