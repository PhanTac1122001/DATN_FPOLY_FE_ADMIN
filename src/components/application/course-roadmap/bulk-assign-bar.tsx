"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/base/buttons/button";
import { Select } from "@/components/base/select/select";
import { UI_TEXT } from "@/constants/ui-text.constants";
import type { BulkAssignBarProps, CategoryTarget } from "@/types/course-roadmap.types";

const removeGroupKey = "__remove_group__";

export function BulkAssignBar({ selectedCount, activeCategories, isApplying, onApply, onClear }: BulkAssignBarProps) {
    const t = UI_TEXT.courseRoadmap;
    const [targetKey, setTargetKey] = useState<string | null>(null);

    const targetItems = [
        { id: removeGroupKey, label: t.removeFromCategory },
        ...activeCategories.map((category) => ({ id: category.id, label: category.name })),
    ];

    const handleApply = () => {
        if (targetKey === null) return;
        const target: CategoryTarget = targetKey === removeGroupKey ? null : targetKey;
        onApply(target);
    };

    return (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-wine/20 bg-wine/5 px-4 py-3 shadow-xs">
            <span className="text-sm font-bold text-slate-800">
                {t.selectedCountPrefix} <span className="text-wine">{selectedCount}</span> {t.selectedCountSuffix}
            </span>
            <div className="min-w-[220px] flex-1 sm:max-w-xs">
                <Select
                    aria-label={t.targetCategoryPlaceholder}
                    placeholder={t.targetCategoryPlaceholder}
                    size="sm"
                    isClearable={false}
                    selectedKey={targetKey}
                    items={targetItems}
                    onSelectionChange={(key) => setTargetKey(key === null || key === undefined ? null : String(key))}
                >
                    {(item) => <Select.Item id={item.id} label={item.label} />}
                </Select>
            </div>
            <Button
                type="button"
                color="primary"
                size="md"
                isDisabled={targetKey === null}
                isLoading={isApplying}
                onClick={handleApply}
                className="border-none bg-wine font-bold text-white shadow-xs hover:bg-wine/90"
            >
                {t.applyBtn}
            </Button>
            <button
                type="button"
                onClick={onClear}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
                <X className="size-4" />
                <span>{t.clearSelectionBtn}</span>
            </button>
        </div>
    );
}
