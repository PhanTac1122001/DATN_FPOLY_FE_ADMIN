"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Award, BookOpen, Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import { AssignGroupHomeworkModal } from "@/components/application/modals/assign-group-homework-modal";
import { ConfirmModal } from "@/components/application/modals/confirm-modal";
import { GroupModal } from "@/components/application/modals/group-modal";
import { Input } from "@/components/base/input/input";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { deleteGroup, getGroups } from "@/services/group.service";
import { toast } from "@/services/toast.service";
import type { ClassGroupsTabProps, Group, GroupSubject } from "@/types/group.types";

export function ClassGroupsTab({ classId, initialGroups, availableSubjects = [] }: ClassGroupsTabProps) {
    const queryClient = useQueryClient();

    const [search, setSearch] = useState("");

    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<Group | null>(null);

    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [assignTargetGroup, setAssignTargetGroup] = useState<Group | null>(null);

    const [groupToDelete, setGroupToDelete] = useState<Group | null>(null);

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

    const groups = groupsData?.items || [];
    const hasSearchFilter = Boolean(search.trim());

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteGroup(id),
        onSuccess: () => {
            toast.success(UI_TEXT.classGroupsTab.toastSuccessTitle, UI_TEXT.classGroupsTab.toastDeleteSuccess);
            queryClient.invalidateQueries({ queryKey: ["class-groups"] });
            queryClient.invalidateQueries({ queryKey: ["class-detail", classId] });
            setGroupToDelete(null);
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
        setGroupToDelete(groupItem);
    };

    const handleAssignHomework = (groupItem: Group) => {
        setAssignTargetGroup(groupItem);
        setIsAssignModalOpen(true);
    };

    return (
        <div className="flex min-h-0 w-full flex-1 flex-col gap-6">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-xs">
                {/* Header Toolbar */}
                <div className="flex flex-col gap-4 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="w-full max-w-sm">
                        <Input
                            value={search}
                            onChange={(val) => setSearch(val)}
                            placeholder={UI_TEXT.classGroupsTab.searchPlaceholder}
                            icon={Search}
                            size="sm"
                        />
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
                <div className="flex-1 overflow-auto">
                    {isLoading ? (
                        <div className="px-6 py-12 text-center text-sm text-muted">{UI_TEXT.classGroupsTab.loadingGroups}</div>
                    ) : groups.length === 0 ? (
                        <div className="p-12 text-center">
                            <Users className="mx-auto mb-2 size-10 text-slate-300" />
                            <p className="text-sm font-bold text-slate-800">
                                {hasSearchFilter ? UI_TEXT.classGroupsTab.noSearchResultsTitle : UI_TEXT.classGroupsTab.emptyTitle}
                            </p>
                            <p className="mt-1 mb-4 text-xs text-slate-500">
                                {hasSearchFilter ? UI_TEXT.classGroupsTab.noSearchResultsDesc : UI_TEXT.classGroupsTab.emptyDesc}
                            </p>
                            {!hasSearchFilter && (
                                <button
                                    type="button"
                                    onClick={handleCreateNew}
                                    className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-wine px-5 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-wine/90 active:scale-95"
                                >
                                    <Plus className="size-4.5" />
                                    <span>{UI_TEXT.classGroupsTab.btnCreateFirstGroup}</span>
                                </button>
                            )}
                        </div>
                    ) : (
                        <table className="w-full min-w-[650px] table-auto border-collapse text-left text-sm text-ink">
                            <thead>
                                <tr className="border-b border-line bg-slate-50/50 text-[11px] font-bold tracking-wider text-muted uppercase">
                                    <th className="w-16 px-6 py-4 text-center">{UI_TEXT.classGroupsTab.thStt}</th>
                                    <th className="px-6 py-4">{UI_TEXT.classGroupsTab.thGroupTitle}</th>
                                    <th className="px-6 py-4">{UI_TEXT.classGroupsTab.thSubjects}</th>
                                    <th className="w-40 px-6 py-4 text-center">{UI_TEXT.classGroupsTab.thMembers}</th>
                                    <th className="w-48 px-6 py-4 text-center">{UI_TEXT.classGroupsTab.thActions}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groups.map((groupItem, index) => (
                                    <tr key={groupItem.id} className="group transition duration-150 hover:bg-slate-50/80">
                                        <td className="border-b border-line px-6 py-4 text-center font-bold text-slate-400 group-last:border-b-0">
                                            {index + 1}
                                        </td>
                                        <td className="border-b border-line px-6 py-4 group-last:border-b-0">
                                            <div className="flex items-center gap-2.5 text-sm font-bold text-slate-900">
                                                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-wine/10 bg-wine/5 text-wine">
                                                    <Users className="size-4.5" />
                                                </div>
                                                <span>{groupItem.title}</span>
                                            </div>
                                        </td>

                                        <td className="border-b border-line px-6 py-4 group-last:border-b-0">
                                            {groupItem.subjects && groupItem.subjects.length > 0 ? (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {groupItem.subjects.map((s) => (
                                                        <span
                                                            key={s.id}
                                                            className="inline-flex items-center gap-1 rounded-lg border border-wine/10 bg-wine/5 px-2.5 py-1 text-xs font-semibold text-wine"
                                                        >
                                                            <BookOpen className="size-3.5" />
                                                            {s.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">{UI_TEXT.classGroupsTab.noSubjectsAssigned}</span>
                                            )}
                                        </td>

                                        <td className="border-b border-line px-6 py-4 text-center whitespace-nowrap group-last:border-b-0">
                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 shadow-2xs">
                                                <Users className="size-3.5 text-slate-400" />
                                                {groupItem.studentsCount || groupItem.studentIds?.length || 0} {UI_TEXT.classGroupsTab.studentsSuffix}
                                            </span>
                                        </td>

                                        <td className="border-b border-line px-6 py-4 text-center group-last:border-b-0">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => handleAssignHomework(groupItem)}
                                                    className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-amber-50 text-amber-700 transition duration-200 hover:bg-amber-500 hover:text-white"
                                                    title={UI_TEXT.classGroupsTab.btnAssignHomework}
                                                >
                                                    <Award className="size-4" />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleEdit(groupItem)}
                                                    className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition duration-200 hover:bg-emerald-600 hover:text-white"
                                                    title={UI_TEXT.classGroupsTab.tooltipEditGroup}
                                                >
                                                    <Pencil className="size-4" />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(groupItem)}
                                                    className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-rose-50 text-rose-600 transition hover:bg-rose-600 hover:text-white"
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
                    )}
                </div>
            </div>

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

            <ConfirmModal
                isOpen={!!groupToDelete}
                onClose={() => setGroupToDelete(null)}
                onConfirm={() => groupToDelete && deleteMutation.mutate(groupToDelete.id)}
                title={UI_TEXT.classGroupsTab.deleteConfirmTitle}
                message={`${UI_TEXT.classGroupsTab.deleteConfirmPrefix}${groupToDelete?.title || ""}${UI_TEXT.classGroupsTab.deleteConfirmSuffix}`}
                confirmText={UI_TEXT.classGroupsTab.deleteConfirmBtn}
                cancelText={UI_TEXT.common.cancel}
                variant="danger"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
