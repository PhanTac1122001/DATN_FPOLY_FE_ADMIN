"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Award, BookOpen, Edit, Plus, Search, Trash2, Users } from "lucide-react";
import { AssignGroupHomeworkModal } from "@/components/application/modals/assign-group-homework-modal";
import { GroupModal } from "@/components/application/modals/group-modal";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { deleteGroup, getGroups } from "@/services/group.service";
import { toast } from "@/services/toast.service";
import type { ClassGroupsTabProps, Group, GroupSubject } from "@/types/group.types";

export function ClassGroupsTab({ classId, initialGroups, availableSubjects = [] }: ClassGroupsTabProps) {
    const queryClient = useQueryClient();

    const [search, setSearch] = useState("");
    const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("");

    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<Group | null>(null);

    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [assignTargetGroup, setAssignTargetGroup] = useState<Group | null>(null);

    const allFilterSubjects = useMemo(() => {
        const map = new Map<string, GroupSubject>();
        availableSubjects.forEach((s) => {
            if (s.id) map.set(s.id, s);
        });
        return Array.from(map.values());
    }, [availableSubjects]);

    // Fetch groups
    const { data: groupsData, isLoading } = useQuery({
        queryKey: ["class-groups", classId, search],
        queryFn: () =>
            getGroups({
                classId,
                search: search || undefined,
            }),
        enabled: !!classId,
        placeholderData: initialGroups ? { items: initialGroups, total: initialGroups.length } : undefined,
    });

    const groups = useMemo(() => {
        const rawGroups = groupsData?.items || [];
        if (!selectedSubjectFilter) return rawGroups;
        return rawGroups.filter((g) => g.subjectIds?.includes(selectedSubjectFilter) || g.subjects?.some((s) => s.id === selectedSubjectFilter));
    }, [groupsData?.items, selectedSubjectFilter]);

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteGroup(id),
        onSuccess: () => {
            toast.success(UI_TEXT.classGroupsTab.toastSuccessTitle, UI_TEXT.classGroupsTab.toastDeleteSuccess);
            queryClient.invalidateQueries({ queryKey: ["class-groups"] });
            queryClient.invalidateQueries({ queryKey: ["class-detail", classId] });
        },
        onError: (err: Error) => {
            toast.error(UI_TEXT.classGroupsTab.toastErrorTitle, err?.message || UI_TEXT.classGroupsTab.toastDeleteError);
        },
    });

    const handleCreateNew = () => {
        setEditingGroup(null);
        setIsGroupModalOpen(true);
    };

    const handleEdit = (groupItem: Group) => {
        setEditingGroup(groupItem);
        setIsGroupModalOpen(true);
    };

    const handleDelete = (groupItem: Group) => {
        if (confirm(`${UI_TEXT.classGroupsTab.deleteConfirmPrefix}${groupItem.title}${UI_TEXT.classGroupsTab.deleteConfirmSuffix}`)) {
            deleteMutation.mutate(groupItem.id);
        }
    };

    const handleAssignHomework = (groupItem: Group) => {
        setAssignTargetGroup(groupItem);
        setIsAssignModalOpen(true);
    };

    const subjectFilterItems = useMemo(() => {
        return [{ id: "", label: UI_TEXT.classGroupsTab.allSubjectsFilter }, ...allFilterSubjects.map((sub) => ({ id: sub.id, label: sub.name }))];
    }, [allFilterSubjects]);

    return (
        <div className="space-y-4">
            {/* Header Toolbar */}
            <div className="flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-1 items-center gap-3">
                    {/* Search Input */}
                    <div className="w-full max-w-sm">
                        <Input
                            value={search}
                            onChange={(val) => setSearch(val)}
                            placeholder={UI_TEXT.classGroupsTab.searchPlaceholder}
                            icon={Search}
                            size="sm"
                        />
                    </div>

                    {/* Filter by Subject */}
                    <div className="w-56">
                        <Select
                            aria-label={UI_TEXT.classGroupsTab.allSubjectsFilter}
                            selectedKey={selectedSubjectFilter || null}
                            onSelectionChange={(key) => setSelectedSubjectFilter((key as string) || "")}
                            items={subjectFilterItems}
                            size="sm"
                            placeholder={UI_TEXT.classGroupsTab.allSubjectsFilter}
                        >
                            {(item) => <Select.Item id={item.id} label={item.label} />}
                        </Select>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleCreateNew}
                    className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-wine px-5 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-wine/90 active:scale-95"
                >
                    <Plus className="size-4.5" />
                    <span>{UI_TEXT.classGroupsTab.btnAddGroup}</span>
                </button>
            </div>

            {/* Groups Table / List */}
            {isLoading ? (
                <div className="p-8 text-center text-sm text-gray-500">{UI_TEXT.classGroupsTab.loadingGroups}</div>
            ) : groups.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
                    <Users className="mx-auto mb-2 size-10 text-gray-400" />
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{UI_TEXT.classGroupsTab.emptyTitle}</p>
                    <p className="mt-1 mb-4 text-xs text-gray-500">{UI_TEXT.classGroupsTab.emptyDesc}</p>
                    <button
                        type="button"
                        onClick={handleCreateNew}
                        className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-wine px-5 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-wine/90 active:scale-95"
                    >
                        <Plus className="size-4.5" />
                        <span>{UI_TEXT.classGroupsTab.btnCreateFirstGroup}</span>
                    </button>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 uppercase dark:border-gray-800 dark:bg-gray-800/50">
                            <tr>
                                <th className="px-4 py-3">{UI_TEXT.classGroupsTab.thGroupTitle}</th>
                                <th className="px-4 py-3">{UI_TEXT.classGroupsTab.thSubjects}</th>
                                <th className="px-4 py-3">{UI_TEXT.classGroupsTab.thMembers}</th>
                                <th className="px-4 py-3 text-right">{UI_TEXT.classGroupsTab.thActions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {groups.map((groupItem) => (
                                <tr key={groupItem.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                                    <td className="px-4 py-3.5 align-middle">
                                        <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100">
                                            <Users className="size-4 shrink-0 text-brand-600" />
                                            {groupItem.title}
                                        </div>
                                    </td>

                                    <td className="px-4 py-3.5 align-middle">
                                        {groupItem.subjects && groupItem.subjects.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {groupItem.subjects.map((s) => (
                                                    <span
                                                        key={s.id}
                                                        className="inline-flex items-center gap-1 rounded border border-brand-200 bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300"
                                                    >
                                                        <BookOpen className="size-3" />
                                                        {s.name}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">{UI_TEXT.classGroupsTab.noSubjectsAssigned}</span>
                                        )}
                                    </td>

                                    <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                            {groupItem.studentsCount || groupItem.studentIds?.length || 0} {UI_TEXT.classGroupsTab.studentsSuffix}
                                        </span>
                                    </td>

                                    <td className="px-4 py-3.5 text-right align-middle whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                size="sm"
                                                color="secondary"
                                                onClick={() => handleAssignHomework(groupItem)}
                                                iconLeading={<Award className="size-3.5 text-amber-500" />}
                                            >
                                                {UI_TEXT.classGroupsTab.btnAssignHomework}
                                            </Button>

                                            <button
                                                onClick={() => handleEdit(groupItem)}
                                                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-brand-600 dark:hover:bg-gray-800"
                                                title={UI_TEXT.classGroupsTab.tooltipEditGroup}
                                            >
                                                <Edit className="size-4" />
                                            </button>

                                            <button
                                                onClick={() => handleDelete(groupItem)}
                                                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-800"
                                                title={UI_TEXT.classGroupsTab.tooltipDeleteGroup}
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modals */}
            <GroupModal
                isOpen={isGroupModalOpen}
                onClose={() => setIsGroupModalOpen(false)}
                classId={classId}
                groupData={editingGroup}
                availableSubjects={allFilterSubjects}
            />

            <AssignGroupHomeworkModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                group={assignTargetGroup}
                availableSubjects={allFilterSubjects}
            />
        </div>
    );
}
