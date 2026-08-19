"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserPlus, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { SelectGroupStudentModal } from "@/components/application/modals/select-group-student-modal";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { getClassDetail } from "@/services/class.service";
import { createGroup, getStudentsInClass, updateGroup } from "@/services/group.service";
import { toast } from "@/services/toast.service";
import type { ClassCourseItem, ClassStudentItem, GroupModalProps, GroupStudent, GroupSubject } from "@/types/group.types";

export function GroupModal({ isOpen, onClose, classId, groupData, availableSubjects = [] }: GroupModalProps) {
    const queryClient = useQueryClient();

    const [title, setTitle] = useState("");
    const [titleError, setTitleError] = useState<string | null>(null);
    const [description, setDescription] = useState("");
    const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [isSelectStudentModalOpen, setIsSelectStudentModalOpen] = useState(false);

    // Load students in class via class detail (includes assigned courses and students)
    const { data: classDetail } = useQuery({
        queryKey: ["class-detail", classId],
        queryFn: () => getClassDetail(classId),
        enabled: isOpen && !!classId,
    });

    // Only include assigned subjects of the current class
    const allSubjects = useMemo(() => {
        const map = new Map<string, GroupSubject>();
        availableSubjects.forEach((s) => {
            if (s.id) map.set(s.id, s);
        });
        if (classDetail?.courses) {
            (classDetail.courses as ClassCourseItem[]).forEach((c) => {
                const courseIdObj = typeof c.courseId === "object" ? c.courseId : null;
                const id = courseIdObj?.id || courseIdObj?._id || (typeof c.courseId === "string" ? c.courseId : c.id);
                if (id && !map.has(id)) {
                    map.set(id, {
                        id,
                        name: courseIdObj?.name || c.courseName || UI_TEXT.groupModal.defaultSubjectName,
                        courseCode: courseIdObj?.courseCode || c.courseCode || "",
                    });
                }
            });
        }
        return Array.from(map.values());
    }, [availableSubjects, classDetail]);

    const subjectSelectItems = useMemo(() => {
        return allSubjects.map((sub) => ({
            id: sub.id,
            label: `${sub.name}${sub.courseCode ? ` (${sub.courseCode})` : ""}`,
        }));
    }, [allSubjects]);

    // Load students in class via group service
    const { data: fetchedStudents = [] } = useQuery<GroupStudent[]>({
        queryKey: ["class-students-for-group", classId],
        queryFn: () => getStudentsInClass(classId),
        enabled: isOpen && !!classId,
    });

    // Merge student roster from both sources
    const studentsInClass = useMemo(() => {
        const map = new Map<string, GroupStudent>();
        fetchedStudents.forEach((s) => {
            if (s.id) map.set(s.id, s);
        });
        if (classDetail?.students) {
            (classDetail.students as ClassStudentItem[]).forEach((item) => {
                const st = item.student || item;
                const stId = st.id || st._id;
                if (stId && !map.has(stId)) {
                    map.set(stId, {
                        id: stId,
                        fullName: st.fullName || UI_TEXT.groupModal.defaultStudentName,
                        studentCode: st.studentCode,
                        email: st.email,
                    });
                }
            });
        }
        return Array.from(map.values());
    }, [fetchedStudents, classDetail]);

    useEffect(() => {
        if (isOpen) {
            setTitleError(null);
            if (groupData) {
                setTitle(groupData.title || "");
                setDescription(groupData.description || "");
                setSelectedSubjectIds(groupData.subjectIds || []);
                setSelectedStudentIds(groupData.studentIds || []);
            } else {
                setTitle("");
                setDescription("");
                setSelectedSubjectIds([]);
            }
        }
    }, [isOpen, groupData]);

    const mutation = useMutation({
        mutationFn: async () => {
            const trimmedTitle = title.trim();
            if (!trimmedTitle) {
                setTitleError(UI_TEXT.groupModal.errorTitleRequired);
                throw new Error(UI_TEXT.groupModal.errorTitleRequired);
            }
            if (groupData) {
                return updateGroup(groupData.id, {
                    title: trimmedTitle,
                    description: description.trim(),
                    subjectIds: selectedSubjectIds,
                    studentIds: selectedStudentIds,
                });
            }
            return createGroup({
                classId,
                title: trimmedTitle,
                description: description.trim(),
                subjectIds: selectedSubjectIds,
                studentIds: selectedStudentIds,
            });
        },
        onSuccess: () => {
            toast.success(UI_TEXT.groupModal.toastSuccess, groupData ? UI_TEXT.groupModal.toastUpdateSuccess : UI_TEXT.groupModal.toastCreateSuccess);
            queryClient.invalidateQueries({ queryKey: ["class-groups"] });
            queryClient.invalidateQueries({ queryKey: ["class-detail", classId] });
            onClose();
        },
        onError: (error: Error) => {
            toast.error(UI_TEXT.groupModal.toastError, error?.message || UI_TEXT.groupModal.toastDefaultError);
        },
    });

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="max-w-3xl !overflow-visible !rounded-[24px]">
                <Dialog className="flex max-h-[90vh] w-full flex-col rounded-[24px] bg-white shadow-2xl outline-none">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                        <Heading slot="title" className="text-xl font-bold text-slate-900">
                            {groupData ? UI_TEXT.groupModal.editTitle : UI_TEXT.groupModal.addTitle}
                        </Heading>
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            aria-label="Close"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Scrollable Form Body */}
                    <div className="custom-scrollbar flex flex-1 flex-col gap-5 overflow-y-auto p-6">
                        {/* Basic Info */}
                        <Input
                            label={UI_TEXT.groupModal.labelTitle}
                            isRequired
                            isInvalid={!!titleError}
                            hint={titleError || undefined}
                            value={title}
                            onChange={(val) => {
                                setTitle(val);
                                if (val.trim()) {
                                    setTitleError(null);
                                }
                            }}
                            onBlur={() => {
                                if (!title.trim()) {
                                    setTitleError(UI_TEXT.groupModal.errorTitleRequired);
                                }
                            }}
                            placeholder={UI_TEXT.groupModal.placeholderTitle}
                        />

                        {/* Subject Selection Dropdown */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-700">
                                {UI_TEXT.groupModal.labelSubjects}{" "}
                                <span className="font-normal text-slate-500">
                                    {"("}
                                    {UI_TEXT.groupModal.selectedSubjectPrefix} {selectedSubjectIds.length}
                                    {")"}
                                </span>
                            </label>
                            <Select.MultiComboBox
                                aria-label={UI_TEXT.groupModal.labelSubjects}
                                placeholder={UI_TEXT.groupModal.placeholderFilterSubject || "Chọn môn học..."}
                                selectedKeys={selectedSubjectIds}
                                onSelectionChange={(keys) => setSelectedSubjectIds((keys as string[]) || [])}
                                items={subjectSelectItems}
                                size="sm"
                            />
                        </div>

                        {/* Student Selection Roster */}
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-slate-700">
                                    {UI_TEXT.groupModal.labelStudents}{" "}
                                    <span className="font-normal text-slate-500">
                                        {"("}
                                        {selectedStudentIds.length}
                                        {"/"}
                                        {studentsInClass.length}
                                        {")"}
                                    </span>
                                </label>
                                <Button
                                    type="button"
                                    color="secondary"
                                    size="sm"
                                    onClick={() => setIsSelectStudentModalOpen(true)}
                                    className="gap-2 rounded-full border border-wine/20 bg-wine/5 px-4 py-1.5 font-bold text-wine shadow-2xs hover:bg-wine/10"
                                    iconLeading={<UserPlus className="size-4 text-wine" />}
                                >
                                    {UI_TEXT.groupModal.btnSelectStudentsPrefix}
                                    {selectedStudentIds.length}
                                    {")"}
                                </Button>
                            </div>

                            {selectedStudentIds.length > 0 && (
                                <div className="custom-scrollbar max-h-36 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/50 p-3">
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedStudentIds.map((id) => {
                                            const st = studentsInClass.find((s) => s.id === id);
                                            if (!st) return null;
                                            return (
                                                <span
                                                    key={id}
                                                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-800 shadow-2xs"
                                                >
                                                    <span>{st.fullName}</span>
                                                    {st.studentCode && (
                                                        <span className="font-mono text-[10px] text-slate-400">
                                                            {"("}
                                                            {st.studentCode}
                                                            {")"}
                                                        </span>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedStudentIds((prev) => prev.filter((i) => i !== id))}
                                                        className="cursor-pointer rounded-full p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                                        title={UI_TEXT.groupModal.tooltipRemoveStudent}
                                                    >
                                                        <X className="size-3" />
                                                    </button>
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description - Moved to the bottom */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-slate-700">{UI_TEXT.groupModal.labelDescription}</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={UI_TEXT.groupModal.placeholderDescription}
                                rows={2}
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-wine focus:ring-1 focus:ring-wine focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Footer buttons - Full Width (Cancel 1/3, Confirm 2/3) */}
                    <div className="flex w-full items-center justify-between gap-3 rounded-b-[24px] border-t border-slate-100 bg-slate-50/60 p-4">
                        <Button
                            type="button"
                            color="secondary"
                            size="md"
                            onClick={onClose}
                            isDisabled={mutation.isPending}
                            className="w-1/3 justify-center rounded-full border-slate-200 py-2.5 text-xs font-bold"
                        >
                            {UI_TEXT.groupModal.btnCancel}
                        </Button>
                        <Button
                            color="primary"
                            size="md"
                            type="button"
                            onClick={() => {
                                if (!title.trim()) {
                                    setTitleError(UI_TEXT.groupModal.errorTitleRequired);
                                    toast.error(UI_TEXT.groupModal.toastError, UI_TEXT.groupModal.errorTitleRequired);
                                    return;
                                }
                                setTitleError(null);
                                mutation.mutate();
                            }}
                            isLoading={mutation.isPending}
                            className="w-2/3 justify-center rounded-full border-none bg-wine py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-wine-deep"
                        >
                            {groupData ? UI_TEXT.groupModal.btnUpdate : UI_TEXT.groupModal.btnCreate}
                        </Button>
                    </div>
                </Dialog>
            </CustomModal.Content>

            {/* Select Student Modal */}
            <SelectGroupStudentModal
                isOpen={isSelectStudentModalOpen}
                onClose={() => setIsSelectStudentModalOpen(false)}
                students={studentsInClass}
                initialSelectedIds={selectedStudentIds}
                onConfirm={(ids) => setSelectedStudentIds(ids)}
            />
        </CustomModal.Root>
    );
}
