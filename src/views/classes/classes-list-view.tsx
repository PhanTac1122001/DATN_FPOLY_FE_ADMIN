"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Edit, Eye, Plus, Trash2 } from "lucide-react";
import type { Route } from "next";
import { ClassModal } from "@/components/application/modals/class-modal";
import { ConfirmModal } from "@/components/application/modals/confirm-modal";
import { SearchFilters } from "@/components/application/search-filters/search-filters";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { CLASS_FILTER_FIELDS } from "@/constants/class.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { useAppRouter } from "@/hooks/use-app-router";
import { deleteClass, getClassList } from "@/services/class.service";
import { toast } from "@/services/toast.service";
import type { ClassEntity } from "@/types/class.types";
import type { FilterState } from "@/types/filter.types";
import { getClassTypeLabel } from "@/utils/class.utils";

export function ClassesListView() {
    const router = useAppRouter();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [advancedFilterState, setAdvancedFilterState] = useState<FilterState>({
        conditions: [],
    });

    // Modal States
    const [isClassModalOpen, setIsClassModalOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState<ClassEntity | null>(null);

    // Queries
    const { data: classes = [], isLoading: isLoadingClasses } = useQuery({
        queryKey: ["classes"],
        queryFn: getClassList,
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: deleteClass,
        onSuccess: () => {
            toast.success(UI_TEXT.classes.toastSuccess, UI_TEXT.classes.toastDeleteSuccess);
            queryClient.invalidateQueries({ queryKey: ["classes"] });
            setIsDeleteOpen(false);
            setSelectedClass(null);
        },
        onError: (error: Error) => {
            toast.error(UI_TEXT.classes.toastError, error.message || UI_TEXT.classes.toastDeleteError);
        },
    });

    const handleOpenDetail = (cls: ClassEntity) => {
        router.push(`/classes/${cls.id}` as Route);
    };

    const handleOpenEdit = (cls: ClassEntity) => {
        setSelectedClass(cls);
        setIsClassModalOpen(true);
    };

    const handleOpenDelete = (cls: ClassEntity) => {
        setSelectedClass(cls);
        setIsDeleteOpen(true);
    };

    // Filtering logic
    const filteredClasses = classes.filter((cls) => {
        const matchesSearch = cls.name.toLowerCase().includes(search.toLowerCase()) || cls.classCode.toLowerCase().includes(search.toLowerCase());

        let matchesAdvanced = true;
        for (const condition of advancedFilterState.conditions) {
            if (!condition.fieldKey || condition.value === null || condition.value === "") continue;

            if (condition.fieldKey === "type") {
                if (cls.type !== condition.value) {
                    matchesAdvanced = false;
                    break;
                }
            }
        }

        return matchesSearch && matchesAdvanced;
    });

    return (
        <div className="flex min-h-0 w-full flex-1 flex-col gap-6 overflow-hidden">
            {/* Filter Bar & Table Area */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs">
                {/* Filters */}
                <div className="flex shrink-0 flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                        <SearchFilters
                            search={search}
                            onSearchChange={setSearch}
                            advancedFilterState={advancedFilterState}
                            setAdvancedFilterState={setAdvancedFilterState}
                            filterFields={CLASS_FILTER_FIELDS}
                            searchPlaceholder={UI_TEXT.classes.searchPlaceholder}
                        />
                    </div>

                    {/* Add Class Trigger */}
                    <Button
                        color="primary"
                        size="md"
                        onClick={() => {
                            setSelectedClass(null);
                            setIsClassModalOpen(true);
                        }}
                        className="gap-2 border-none bg-wine px-5 font-bold text-white shadow-md shadow-wine/20 hover:bg-wine-deep"
                        iconLeading={<Plus className="pointer-events-none size-5 shrink-0 transition-inherit-all" />}
                    >
                        {UI_TEXT.classes.addClass}
                    </Button>
                </div>

                {/* Table list */}
                <div className="flex-1 overflow-auto">
                    {isLoadingClasses ? (
                        <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-4">
                            <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
                            <p className="text-sm font-semibold text-slate-500">{UI_TEXT.classes.loading}</p>
                        </div>
                    ) : filteredClasses.length === 0 ? (
                        <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-2 p-8 text-center">
                            <AlertTriangle className="size-10 text-slate-300" />
                            <p className="text-base font-bold text-slate-800">{UI_TEXT.classes.noDataTitle}</p>
                            <p className="text-sm text-slate-500">{UI_TEXT.classes.noDataDesc}</p>
                        </div>
                    ) : (
                        <table className="w-full min-w-[1000px] table-auto border-collapse text-left text-sm text-ink">
                            <thead>
                                <tr className="sticky top-0 z-10 border-b border-line bg-slate-50 text-[11px] font-bold tracking-wider text-muted uppercase">
                                    <th className="w-12 px-6 py-4 text-center">{UI_TEXT.classes.thStt}</th>
                                    <th className="w-40 px-6 py-4">{UI_TEXT.classes.thClassCode}</th>
                                    <th className="px-6 py-4">{UI_TEXT.classes.thClassName}</th>
                                    <th className="w-32 px-6 py-4 text-center">{UI_TEXT.classes.thType}</th>
                                    <th className="w-32 px-6 py-4 text-center">{UI_TEXT.classes.thCourses}</th>
                                    <th className="sticky right-0 z-20 w-16 bg-slate-50 px-4 py-4 text-center whitespace-nowrap" />
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClasses.map((cls, index) => (
                                    <tr key={cls.id} className="group transition duration-150 hover:bg-slate-50">
                                        <td className="border-b border-line px-6 py-4 text-center font-semibold text-muted">{index + 1}</td>
                                        <td className="border-b border-line px-6 py-4 whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenDetail(cls)}
                                                className="cursor-pointer rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 transition duration-150 hover:bg-wine-soft hover:text-wine"
                                            >
                                                {cls.classCode}
                                            </button>
                                        </td>
                                        <td className="border-b border-line px-6 py-4 whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenDetail(cls)}
                                                className="cursor-pointer text-left text-[14.5px] font-bold text-ink transition duration-150 hover:text-wine"
                                            >
                                                {cls.name}
                                            </button>
                                        </td>
                                        <td className="border-b border-line px-6 py-4 text-center whitespace-nowrap">
                                            <Badge color="blue" size="sm">
                                                {getClassTypeLabel(cls.type)}
                                            </Badge>
                                        </td>
                                        <td className="border-b border-line px-6 py-4 text-center text-xs font-semibold text-muted">
                                            {cls.courseCount ?? cls.courseIds?.length ?? 0} {UI_TEXT.classes.coursesAssigned}
                                        </td>
                                        <td className="sticky right-0 z-20 border-b border-line bg-white px-4 py-4 text-center transition-colors group-hover:bg-slate-50">
                                            <div className="flex justify-center">
                                                <Dropdown.Root>
                                                    <Dropdown.DotsButton className="rounded-lg p-1.5 text-muted hover:bg-cream" />
                                                    <Dropdown.Popover className="z-50 w-48 rounded-xl border border-line bg-white shadow-xl ring-1 ring-line">
                                                        <Dropdown.Menu>
                                                            <Dropdown.Item
                                                                icon={Eye}
                                                                onAction={() => handleOpenDetail(cls)}
                                                                className={(state) =>
                                                                    "text-slate-700 [&_svg]:text-current " +
                                                                    (state.isFocused || state.isHovered ? "[&>div]:!bg-slate-100" : "")
                                                                }
                                                            >
                                                                <span>{UI_TEXT.classes.classDetail}</span>
                                                            </Dropdown.Item>
                                                            <Dropdown.Item
                                                                icon={Edit}
                                                                onAction={() => handleOpenEdit(cls)}
                                                                className={(state) =>
                                                                    "text-blue-600 [&_svg]:text-current " +
                                                                    (state.isFocused || state.isHovered ? "[&>div]:!bg-blue-50" : "")
                                                                }
                                                            >
                                                                <span>{UI_TEXT.classes.editClass}</span>
                                                            </Dropdown.Item>
                                                            <Dropdown.Separator className="my-1 bg-line" />
                                                            <Dropdown.Item
                                                                icon={Trash2}
                                                                onAction={() => handleOpenDelete(cls)}
                                                                className={(state) =>
                                                                    "text-red-600 [&_svg]:text-current " +
                                                                    (state.isFocused || state.isHovered ? "[&>div]:!bg-red-50" : "")
                                                                }
                                                            >
                                                                <span>{UI_TEXT.classes.deleteClass}</span>
                                                            </Dropdown.Item>
                                                        </Dropdown.Menu>
                                                    </Dropdown.Popover>
                                                </Dropdown.Root>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Class Add/Edit Modal */}
            <ClassModal
                isOpen={isClassModalOpen}
                onClose={() => {
                    setIsClassModalOpen(false);
                    setSelectedClass(null);
                }}
                classData={selectedClass}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={isDeleteOpen}
                onClose={() => {
                    setIsDeleteOpen(false);
                    setSelectedClass(null);
                }}
                onConfirm={() => selectedClass && deleteMutation.mutate(selectedClass.id)}
                title={UI_TEXT.classes.deleteConfirmTitle}
                message={UI_TEXT.classes.deleteConfirmDescription}
                confirmText={UI_TEXT.common.delete}
                cancelText={UI_TEXT.common.cancel}
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
