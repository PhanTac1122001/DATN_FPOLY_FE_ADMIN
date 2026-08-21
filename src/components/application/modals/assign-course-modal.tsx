"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
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
            <CustomModal.Content className="w-full max-w-2xl !rounded-[24px]">
                <Dialog className="flex max-h-[90vh] w-full flex-col rounded-[24px] bg-white shadow-2xl outline-none">
                    {/* Header */}
                    <div className="relative flex flex-col border-b border-slate-100 px-6 pt-6 pb-4">
                        <Heading slot="title" className="text-xl font-bold text-slate-900">
                            {UI_TEXT.trainingSystem.assignCourseModal.title}
                        </Heading>
                        <p className="mt-1 text-xs text-slate-500">
                            {UI_TEXT.trainingSystem.assignCourseModal.labelSystemPrefix} <strong className="font-bold text-purple-700">{systemName}</strong>
                        </p>
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="absolute top-5 right-5 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            aria-label="Close"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Scrollable Body */}
                    <div className="custom-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto p-6">
                        {/* Filter Bar */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <Input
                                icon={Search}
                                value={search}
                                onChange={(val) => setSearch(val)}
                                placeholder={UI_TEXT.trainingSystem.assignCourseModal.searchPlaceholder}
                                size="sm"
                            />

                            <Select
                                aria-label={UI_TEXT.trainingSystem.assignCourseModal.allCategories}
                                selectedKey={selectedCategory}
                                onSelectionChange={(key) => setSelectedCategory((key as string) || ALL_CATEGORY_OPTION)}
                                items={[
                                    { id: ALL_CATEGORY_OPTION, label: UI_TEXT.trainingSystem.assignCourseModal.allCategories },
                                    ...categories.map((cat) => ({ id: cat, label: cat })),
                                ]}
                                size="sm"
                                isClearable={false}
                            >
                                {(item) => <Select.Item id={item.id} label={item.label} />}
                            </Select>
                        </div>

                        {/* Courses Select Table */}
                        <div className="max-h-[350px] overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/50">
                            {isCoursesLoading ? (
                                <div className="p-8 text-center text-xs text-slate-500">{UI_TEXT.trainingSystem.assignCourseModal.loading}</div>
                            ) : filteredCourses.length === 0 ? (
                                <div className="p-8 text-center text-xs text-slate-500">{UI_TEXT.trainingSystem.assignCourseModal.noData}</div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {filteredCourses.map((c) => {
                                        const isChecked = selectedCourseIds.includes(c.id);
                                        return (
                                            <div
                                                key={c.id}
                                                onClick={() => handleToggleSelect(c.id)}
                                                className={`flex cursor-pointer items-center justify-between p-3.5 transition hover:bg-white ${
                                                    isChecked ? "bg-purple-50/60" : ""
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => {}}
                                                        className="size-4 cursor-pointer rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                                    />
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono text-xs font-bold text-purple-700">{c.code}</span>
                                                            <span className="text-xs font-bold text-slate-800">{c.title}</span>
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
                    <div className="flex items-center justify-between rounded-b-[24px] border-t border-slate-100 bg-slate-50/60 p-4">
                        <span className="text-xs font-semibold text-slate-600">
                            {UI_TEXT.trainingSystem.assignCourseModal.selectedPrefix}{" "}
                            <strong className="font-bold text-purple-600">{selectedCourseIds.length}</strong>{" "}
                            {UI_TEXT.trainingSystem.assignCourseModal.selectedSuffix}
                        </span>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => onOpenChange(false)}
                                disabled={isAssigning}
                                className="cursor-pointer justify-center rounded-full border border-slate-200 bg-white px-5 py-2 text-center text-xs font-bold text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {UI_TEXT.trainingSystem.assignCourseModal.btnCancel}
                            </button>
                            <Button
                                color="primary"
                                size="md"
                                type="button"
                                isDisabled={selectedCourseIds.length === 0}
                                isLoading={isAssigning}
                                onClick={handleConfirmAssign}
                                className="border-none bg-purple-600 font-bold text-white hover:bg-purple-700"
                            >
                                {isAssigning ? UI_TEXT.trainingSystem.assignCourseModal.btnAssigning : UI_TEXT.trainingSystem.assignCourseModal.btnAssign}
                            </Button>
                        </div>
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
