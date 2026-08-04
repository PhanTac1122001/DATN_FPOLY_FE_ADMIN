"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { ALL_CATEGORY_OPTION } from "@/constants/options.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { getCourseCategories, getCoursesList } from "@/services/course.service";
import type { AssignCourseModalProps } from "@/types/system.types";

export function AssignCourseModal({ isOpen, onOpenChange, systemName, onAssign }: AssignCourseModalProps) {
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORY_OPTION);
    const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
    const [isAssigning, setIsAssigning] = useState(false);

    // Fetch courses list from /courses
    const { data: courses = [], isLoading: isCoursesLoading } = useQuery({
        queryKey: ["courses"],
        queryFn: () => getCoursesList(),
        enabled: isOpen,
    });

    // Fetch dynamic categories list
    const { data: categories = [] } = useQuery({
        queryKey: ["course-categories"],
        queryFn: getCourseCategories,
        enabled: isOpen,
    });

    useEffect(() => {
        if (isOpen) {
            setSearch("");
            setSelectedCategory(ALL_CATEGORY_OPTION);
            setSelectedCourseIds([]);
        }
    }, [isOpen]);

    const handleToggleSelect = (id: string) => {
        setSelectedCourseIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    };

    const handleConfirmAssign = async () => {
        if (selectedCourseIds.length === 0) return;
        const selected = courses.filter((c) => selectedCourseIds.includes(c.id));
        setIsAssigning(true);
        try {
            await onAssign(selected);
            onOpenChange(false);
        } finally {
            setIsAssigning(false);
        }
    };

    const filteredCourses = courses.filter((c) => {
        const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === ALL_CATEGORY_OPTION || c.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <CustomModal.Root open={isOpen} onOpenChange={onOpenChange}>
            <CustomModal.Content className="w-full max-w-2xl overflow-hidden !rounded-[24px]">
                <Dialog className="flex flex-col outline-none">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-line px-6 py-4">
                        <div>
                            <h2 className="text-lg font-extrabold text-ink">{UI_TEXT.trainingSystem.assignCourseModal.title}</h2>
                            <p className="text-xs text-muted">
                                {UI_TEXT.trainingSystem.assignCourseModal.labelSystemPrefix}
                                <strong className="text-wine">{systemName}</strong>
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="cursor-pointer rounded-full p-1.5 text-muted transition hover:bg-slate-100 hover:text-ink"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    <div className="flex flex-col gap-4 p-6">
                        {/* Filter Bar */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="relative">
                                <Search className="absolute top-3 left-3.5 size-4 text-muted" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={UI_TEXT.trainingSystem.assignCourseModal.searchPlaceholder}
                                    className="w-full rounded-xl border border-line py-2 pr-4 pl-10 text-xs font-medium text-ink outline-none focus:border-wine"
                                />
                            </div>

                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full cursor-pointer rounded-xl border border-line bg-white px-3 py-2 text-xs font-bold text-ink outline-none focus:border-wine"
                            >
                                <option value={ALL_CATEGORY_OPTION}>{UI_TEXT.trainingSystem.assignCourseModal.allCategories}</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Courses Select Table */}
                        <div className="max-h-[350px] overflow-y-auto rounded-2xl border border-line bg-slate-50/50">
                            {isCoursesLoading ? (
                                <div className="p-8 text-center text-xs text-muted">{UI_TEXT.trainingSystem.assignCourseModal.loading}</div>
                            ) : filteredCourses.length === 0 ? (
                                <div className="p-8 text-center text-xs text-muted">{UI_TEXT.trainingSystem.assignCourseModal.noData}</div>
                            ) : (
                                <div className="divide-y divide-line">
                                    {filteredCourses.map((c) => {
                                        const isChecked = selectedCourseIds.includes(c.id);
                                        return (
                                            <div
                                                key={c.id}
                                                onClick={() => handleToggleSelect(c.id)}
                                                className={`flex cursor-pointer items-center justify-between p-3.5 transition hover:bg-white ${
                                                    isChecked ? "bg-wine/5" : ""
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => {}}
                                                        className="size-4 cursor-pointer rounded accent-wine"
                                                    />
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono text-xs font-bold text-wine">{c.code}</span>
                                                            <span className="text-xs font-bold text-ink">{c.title}</span>
                                                        </div>
                                                        <div className="mt-0.5 flex items-center gap-2">
                                                            <span className="rounded bg-slate-200/70 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                                                                {c.category || UI_TEXT.trainingSystem.assignCourseModal.uncategorized}
                                                            </span>
                                                            {c.rPointConfig?.enabled && (
                                                                <span className="text-[10px] font-medium text-amber-700">
                                                                    {"★ "}
                                                                    {c.rPointConfig.rPointValue} {UI_TEXT.trainingSystem.assignCourseModal.rPointUnit}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-line bg-slate-50/50 px-6 py-4">
                        <span className="text-xs font-semibold text-muted">
                            {UI_TEXT.trainingSystem.assignCourseModal.selectedPrefix}
                            <strong className="text-wine">{selectedCourseIds.length}</strong>
                            {UI_TEXT.trainingSystem.assignCourseModal.selectedSuffix}
                        </span>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => onOpenChange(false)}
                                className="cursor-pointer rounded-xl border border-line px-4 py-2 text-xs font-bold text-ink transition hover:bg-slate-100"
                            >
                                {UI_TEXT.trainingSystem.assignCourseModal.btnCancel}
                            </button>
                            <button
                                type="button"
                                disabled={selectedCourseIds.length === 0 || isAssigning}
                                onClick={handleConfirmAssign}
                                className="cursor-pointer rounded-xl bg-wine px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-wine/90 disabled:opacity-50"
                            >
                                {isAssigning ? UI_TEXT.trainingSystem.assignCourseModal.btnAssigning : UI_TEXT.trainingSystem.assignCourseModal.btnAssign}
                            </button>
                        </div>
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
