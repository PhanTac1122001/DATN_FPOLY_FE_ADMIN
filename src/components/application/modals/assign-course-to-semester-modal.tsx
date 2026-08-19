"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { assignCourseToSemesters } from "@/services/course.service";
import { getAllSemesters, getSpecializesList } from "@/services/system.service";
import { toast } from "@/services/toast.service";
import type { AssignCourseToSemesterModalProps } from "@/types/course.types";
import type { Semester, Specialize } from "@/types/system.types";

export function AssignCourseToSemesterModal({ isOpen, onOpenChange, course, onSuccess }: AssignCourseToSemesterModalProps) {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [selectedSemesterIds, setSelectedSemesterIds] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch all semesters
    const { data: rawSemesters, isLoading: isSemestersLoading } = useQuery({
        queryKey: ["semesters"],
        queryFn: getAllSemesters,
        enabled: isOpen,
    });
    const semesters = useMemo(() => rawSemesters ?? [], [rawSemesters]);

    // Fetch all specializations
    const { data: rawSpecializations, isLoading: isSpecsLoading } = useQuery({
        queryKey: ["specializes"],
        queryFn: getSpecializesList,
        enabled: isOpen,
    });
    const specializations = useMemo(() => rawSpecializations ?? [], [rawSpecializations]);

    const isLoading = isSemestersLoading || isSpecsLoading;
    const courseId = course?.id;

    // Reset search when modal opens
    useEffect(() => {
        if (isOpen) {
            setSearch("");
        }
    }, [isOpen]);

    // Initialize selected semesters when rawSemesters or courseId is available
    useEffect(() => {
        if (isOpen && courseId && rawSemesters) {
            const initialAssigned = rawSemesters.filter((sem) => Array.isArray(sem.courseIds) && sem.courseIds.includes(courseId)).map((sem) => sem.id);
            setSelectedSemesterIds(initialAssigned);
        }
    }, [isOpen, courseId, rawSemesters]);

    // Group semesters by specialization
    const groupedSemesters = useMemo(() => {
        const query = search.trim().toLowerCase();

        // Create map of specialization ID to semesters
        const specMap = new Map<string, { spec: Specialize | null; semesters: Semester[] }>();

        // Register known specializations
        specializations.forEach((spec) => {
            specMap.set(spec.id, { spec, semesters: [] });
        });

        // Add fallback group for unassigned specialization
        const unassignedKey = "unassigned";
        specMap.set(unassignedKey, { spec: null, semesters: [] });

        // Distribute semesters into groups
        semesters.forEach((sem) => {
            const key = sem.specializeId && specMap.has(sem.specializeId) ? sem.specializeId : unassignedKey;
            specMap.get(key)!.semesters.push(sem);
        });

        // Filter groups and semesters by search query
        const result: Array<{ specName: string; specId: string; semesters: Semester[] }> = [];

        specMap.forEach((group, specId) => {
            if (group.semesters.length === 0) return;

            const specName = group.spec ? group.spec.name : UI_TEXT.coursesPage.assignCourseToSemesterModal.unassignedSpecialization;

            const matchingSemesters = group.semesters.filter((sem) => {
                if (!query) return true;
                return sem.name.toLowerCase().includes(query) || specName.toLowerCase().includes(query);
            });

            if (matchingSemesters.length > 0) {
                // Sort semesters by priority/name
                matchingSemesters.sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));
                result.push({
                    specId,
                    specName,
                    semesters: matchingSemesters,
                });
            }
        });

        return result;
    }, [semesters, specializations, search]);

    const handleToggleSemester = (id: string) => {
        setSelectedSemesterIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    };

    const handleToggleGroup = (groupSemesters: Semester[]) => {
        const groupIds = groupSemesters.map((s) => s.id);
        const allSelected = groupIds.every((id) => selectedSemesterIds.includes(id));

        if (allSelected) {
            setSelectedSemesterIds((prev) => prev.filter((id) => !groupIds.includes(id)));
        } else {
            setSelectedSemesterIds((prev) => Array.from(new Set([...prev, ...groupIds])));
        }
    };

    const handleConfirmSave = async () => {
        if (!course) return;

        setIsSaving(true);
        try {
            await assignCourseToSemesters(course.id, selectedSemesterIds);
            toast.success(UI_TEXT.common.successTitle, UI_TEXT.coursesPage.assignCourseToSemesterModal.toastAssignSuccess);
            queryClient.invalidateQueries({ queryKey: ["courses"] });
            queryClient.invalidateQueries({ queryKey: ["semesters"] });
            onSuccess?.();
            onOpenChange(false);
        } catch (error) {
            toast.error(UI_TEXT.common.errorTitle, error instanceof Error ? error.message : UI_TEXT.coursesPage.assignCourseToSemesterModal.toastAssignError);
        } finally {
            setIsSaving(false);
        }
    };

    const modalText = UI_TEXT.coursesPage.assignCourseToSemesterModal;

    return (
        <CustomModal.Root open={isOpen} onOpenChange={onOpenChange}>
            <CustomModal.Content className="w-full max-w-2xl !rounded-[24px]">
                <Dialog className="flex h-[90vh] max-h-[90vh] w-full flex-col rounded-[24px] bg-white shadow-2xl outline-none">
                    {/* Header */}
                    <div className="relative flex shrink-0 flex-col border-b border-slate-100 px-6 pt-6 pb-4">
                        <Heading slot="title" className="text-xl font-bold text-slate-900">
                            {modalText.title}
                        </Heading>
                        {course && (
                            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                <span>{modalText.labelCoursePrefix}</span>
                                <span className="rounded bg-wine/10 px-2 py-0.5 font-mono text-[11px] font-bold text-wine">{course.code}</span>
                                <strong className="font-bold text-slate-800">{course.title}</strong>
                            </p>
                        )}
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="absolute top-5 right-5 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            aria-label="Close"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-6">
                        {/* Search Filter */}
                        <div className="shrink-0">
                            <Input icon={Search} value={search} onChange={(val) => setSearch(val)} placeholder={modalText.searchPlaceholder} size="sm" />
                        </div>

                        {/* Semesters Selection List */}
                        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/50 p-2">
                            {isLoading ? (
                                <div className="p-8 text-center text-xs text-slate-500">{modalText.loading}</div>
                            ) : groupedSemesters.length === 0 ? (
                                <div className="p-8 text-center text-xs text-slate-500">{modalText.noData}</div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {groupedSemesters.map((group) => {
                                        const isAllGroupSelected = group.semesters.every((sem) => selectedSemesterIds.includes(sem.id));

                                        return (
                                            <div key={group.specId} className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-2xs">
                                                {/* Group Header */}
                                                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-100/70 px-4 py-2.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-slate-800">{group.specName}</span>
                                                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                                            {group.semesters.length} {modalText.semestersCountSuffix}
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleGroup(group.semesters)}
                                                        className="cursor-pointer text-[11px] font-semibold text-wine hover:underline"
                                                    >
                                                        {isAllGroupSelected ? modalText.deselectAll : modalText.selectAll}
                                                    </button>
                                                </div>

                                                {/* Semesters in Group */}
                                                <div className="divide-y divide-slate-100">
                                                    {group.semesters.map((sem) => {
                                                        const isChecked = selectedSemesterIds.includes(sem.id);
                                                        return (
                                                            <div
                                                                key={sem.id}
                                                                onClick={() => handleToggleSemester(sem.id)}
                                                                className={`flex cursor-pointer items-center justify-between px-4 py-3 transition hover:bg-purple-50/40 ${
                                                                    isChecked ? "bg-purple-50/70" : ""
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isChecked}
                                                                        onChange={() => {}}
                                                                        className="size-4 cursor-pointer rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                                                    />
                                                                    <span className="text-xs font-bold text-slate-800">{sem.name}</span>
                                                                </div>
                                                                {isChecked && (
                                                                    <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-700">
                                                                        {modalText.assignedBadge}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex w-full shrink-0 items-center gap-3 rounded-b-[24px] border-t border-slate-100 bg-slate-50/60 p-4">
                        <Button
                            type="button"
                            color="secondary-gray"
                            size="md"
                            onClick={() => onOpenChange(false)}
                            isDisabled={isSaving}
                            className="w-1/3 justify-center text-center font-bold"
                        >
                            {modalText.btnCancel}
                        </Button>
                        <Button
                            color="primary"
                            size="md"
                            type="button"
                            isLoading={isSaving}
                            onClick={handleConfirmSave}
                            className="w-2/3 justify-center border-none bg-wine text-center font-bold text-white hover:bg-wine/90"
                        >
                            {isSaving ? modalText.btnSaving : modalText.btnSave}
                        </Button>
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
