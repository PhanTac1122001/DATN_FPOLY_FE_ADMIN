"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { SEARCH_THRESHOLD_5 } from "@/constants/ui-components.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { getClassDetail } from "@/services/class.service";
import { createGroup, getStudentsInClass, updateGroup } from "@/services/group.service";
import { toast } from "@/services/toast.service";
import type { ClassCourseItem, ClassStudentItem, GroupModalProps, GroupStudent, GroupSubject } from "@/types/group.types";

export function GroupModal({ isOpen, onClose, classId, groupData, availableSubjects = [] }: GroupModalProps) {
    const queryClient = useQueryClient();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [studentSearch, setStudentSearch] = useState("");

    // Load students in class via class detail (includes assigned courses and students)
    const { data: classDetail, isLoading: isLoadingClassDetail } = useQuery({
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
    const { data: fetchedStudents = [], isLoading: isLoadingGroupStudents } = useQuery<GroupStudent[]>({
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

    const filteredStudents = useMemo(() => {
        if (!studentSearch.trim()) return studentsInClass;
        const q = studentSearch.toLowerCase();
        return studentsInClass.filter(
            (s) =>
                s.fullName.toLowerCase().includes(q) ||
                (s.studentCode && s.studentCode.toLowerCase().includes(q)) ||
                (s.email && s.email.toLowerCase().includes(q)),
        );
    }, [studentsInClass, studentSearch]);

    const isLoadingStudents = isLoadingGroupStudents && isLoadingClassDetail;

    useEffect(() => {
        if (isOpen) {
            if (groupData) {
                setTitle(groupData.title || "");
                setDescription(groupData.description || "");
                setSelectedSubjectIds(groupData.subjectIds || []);
                setSelectedStudentIds(groupData.studentIds || []);
            } else {
                setTitle("");
                setDescription("");
                setSelectedSubjectIds([]);
                setSelectedStudentIds([]);
            }
            setStudentSearch("");
        }
    }, [isOpen, groupData]);

    const mutation = useMutation({
        mutationFn: async () => {
            if (!title.trim()) {
                throw new Error(UI_TEXT.groupModal.errorTitleRequired);
            }
            if (groupData) {
                return updateGroup(groupData.id, {
                    title: title.trim(),
                    description: description.trim(),
                    subjectIds: selectedSubjectIds,
                    studentIds: selectedStudentIds,
                });
            }
            return createGroup({
                classId,
                title: title.trim(),
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

    const toggleStudent = (id: string) => {
        setSelectedStudentIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    };

    const selectAllStudents = () => {
        if (selectedStudentIds.length === studentsInClass.length) {
            setSelectedStudentIds([]);
        } else {
            setSelectedStudentIds(studentsInClass.map((s) => s.id));
        }
    };

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="max-w-3xl !overflow-visible !rounded-[24px]">
                <Dialog className="flex max-h-[90vh] w-full flex-col rounded-[24px] bg-white shadow-2xl outline-none">
                    {/* Header */}
                    <div className="relative flex flex-col border-b border-slate-100 px-6 pt-6 pb-4">
                        <Heading slot="title" className="text-xl font-bold text-slate-900">
                            {groupData ? UI_TEXT.groupModal.editTitle : UI_TEXT.groupModal.addTitle}
                        </Heading>
                        <p className="mt-1 text-xs text-slate-500">{groupData ? UI_TEXT.groupModal.editSubtitle : UI_TEXT.groupModal.addSubtitle}</p>
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute top-5 right-5 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            aria-label="Close"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Scrollable Form Body */}
                    <div className="custom-scrollbar flex flex-1 flex-col gap-5 overflow-y-auto p-6">
                        {/* Basic Info */}
                        <Input
                            label={
                                <span>
                                    {UI_TEXT.groupModal.labelTitle} <span className="font-bold text-red-500">{"*"}</span>
                                </span>
                            }
                            value={title}
                            onChange={(val) => setTitle(val)}
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
                                <div className="flex items-center gap-3">
                                    {studentsInClass.length > SEARCH_THRESHOLD_5 && (
                                        <div className="relative w-52">
                                            <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                value={studentSearch}
                                                onChange={(e) => setStudentSearch(e.target.value)}
                                                placeholder={UI_TEXT.groupModal.placeholderFilterStudent}
                                                className="w-full rounded-full border border-slate-200 bg-slate-50/50 py-1 pr-3 pl-8 text-xs text-slate-800 placeholder:text-slate-400 focus:border-wine focus:ring-1 focus:ring-wine focus:outline-none"
                                            />
                                        </div>
                                    )}
                                    {studentsInClass.length > 0 && (
                                        <button type="button" onClick={selectAllStudents} className="shrink-0 text-xs font-semibold text-wine hover:underline">
                                            {selectedStudentIds.length === studentsInClass.length
                                                ? UI_TEXT.groupModal.deselectAll
                                                : UI_TEXT.groupModal.selectAll}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {isLoadingStudents ? (
                                <p className="py-2 text-xs text-slate-400">{UI_TEXT.groupModal.loadingStudents}</p>
                            ) : filteredStudents.length === 0 ? (
                                <p className="py-2 text-xs text-slate-400 italic">{UI_TEXT.groupModal.noStudentsFound}</p>
                            ) : (
                                <div className="custom-scrollbar flex max-h-52 flex-col gap-1 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50/50 p-2">
                                    {filteredStudents.map((st) => {
                                        const isSelected = selectedStudentIds.includes(st.id);
                                        return (
                                            <div
                                                key={st.id}
                                                onClick={() => toggleStudent(st.id)}
                                                className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 transition ${
                                                    isSelected ? "bg-white shadow-xs" : "hover:bg-white/60"
                                                }`}
                                            >
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-900">{st.fullName}</p>
                                                    <p className="text-[11px] text-slate-500">
                                                        {st.studentCode || st.email || UI_TEXT.groupModal.noStudentCode}
                                                    </p>
                                                </div>
                                                <input type="checkbox" checked={isSelected} onChange={() => {}} className="size-4 accent-wine" />
                                            </div>
                                        );
                                    })}
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

                    {/* Footer */}
                    <div className="flex justify-end gap-3 rounded-b-[24px] border-t border-slate-100 bg-slate-50/60 p-4">
                        <Button type="button" color="secondary-gray" size="md" onClick={onClose} isDisabled={mutation.isPending}>
                            {UI_TEXT.groupModal.btnCancel}
                        </Button>
                        <Button
                            color="primary"
                            size="md"
                            type="button"
                            onClick={() => mutation.mutate()}
                            isLoading={mutation.isPending}
                            isDisabled={!title.trim()}
                            className="border-none bg-wine px-6 font-bold text-white hover:bg-wine-deep"
                        >
                            {groupData ? UI_TEXT.groupModal.btnUpdate : UI_TEXT.groupModal.btnCreate}
                        </Button>
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
