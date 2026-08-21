"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, AlertTriangle, BookOpen, Plus, Trash2, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { ConfirmModal } from "@/components/application/modals/confirm-modal";
import { Button } from "@/components/base/buttons/button";
import { Select } from "@/components/base/select/select";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { LearningPathSourceEnum } from "@/constants/student.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { assignLearningPathCourse, getStaffCoursesList, getStudentLearningPath, unassignLearningPathCourse } from "@/services/student.service";
import { toast } from "@/services/toast.service";
import type { LearningPathItem, Student } from "@/types/student.types";

export function LearningPathModal({ isOpen, onClose, student }: { isOpen: boolean; onClose: () => void; student: Student | null }) {
    const queryClient = useQueryClient();
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [isRequired] = useState(true);
    const [deletingCourse, setDeletingCourse] = useState<{ id: string; title: string } | null>(null);

    const { data: learningPath = [], isLoading } = useQuery({
        queryKey: ["student-learning-path", student?.id],
        queryFn: () => getStudentLearningPath(student!.id),
        enabled: !!student && isOpen,
    });

    const { data: courses = [] } = useQuery({
        queryKey: ["staff-courses"],
        queryFn: getStaffCoursesList,
        enabled: isOpen,
    });

    const assignMutation = useMutation({
        mutationFn: () => assignLearningPathCourse(student!.id, { courseId: selectedCourseId, isRequired }),
        onSuccess: () => {
            toast.success(UI_TEXT.learningPathModal.toastAssignSuccessTitle, UI_TEXT.learningPathModal.toastAssignSuccessDesc);
            queryClient.invalidateQueries({ queryKey: ["student-learning-path", student?.id] });
            setSelectedCourseId("");
        },
        onError: (e: Error) => {
            toast.error(UI_TEXT.learningPathModal.toastAssignErrorTitle, e.message || UI_TEXT.learningPathModal.toastAssignErrorDesc);
        },
    });

    const unassignMutation = useMutation({
        mutationFn: (courseId: string) => unassignLearningPathCourse(student!.id, courseId),
        onSuccess: () => {
            toast.success(UI_TEXT.learningPathModal.toastDeleteSuccessTitle, UI_TEXT.learningPathModal.toastDeleteSuccessDesc);
            queryClient.invalidateQueries({ queryKey: ["student-learning-path", student?.id] });
        },
        onError: (e: Error) => {
            toast.error(UI_TEXT.learningPathModal.toastDeleteErrorTitle, e.message || UI_TEXT.learningPathModal.toastDeleteErrorDesc);
        },
    });

    const courseOptions = courses.map((crs) => ({
        id: crs.id,
        label: crs.courseCode ? `[${crs.courseCode}] ${crs.name}` : crs.name,
    }));

    if (!student) return null;

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="w-full max-w-3xl overflow-hidden !rounded-[24px]">
                <Dialog className="flex max-h-[90vh] flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl outline-none">
                    {/* Header */}
                    <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6 pt-6 pb-4">
                        <div>
                            <Heading slot="title" className="flex items-center gap-2 text-lg font-black text-slate-800">
                                <BookOpen className="size-5 text-wine" />
                                {UI_TEXT.learningPathModal.title}
                            </Heading>
                            <p className="mt-0.5 text-xs font-semibold text-slate-400">
                                {student.fullName} {"("}
                                {student.studentCode}
                                {")"}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={onClose} className="cursor-pointer rounded-lg p-1 transition hover:bg-slate-100">
                                <X className="size-5 text-slate-400" />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
                        {/* Assign Form */}
                        <div className="flex items-end gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                            <div className="flex min-w-[240px] flex-1 flex-col gap-1.5">
                                <Select
                                    label={UI_TEXT.learningPathModal.assignNewCourseLabel}
                                    placeholder={UI_TEXT.learningPathModal.selectCoursePlaceholder}
                                    items={courseOptions}
                                    selectedKey={selectedCourseId || null}
                                    onSelectionChange={(key) => setSelectedCourseId(key ? String(key) : "")}
                                >
                                    {(item) => (
                                        <Select.Item key={item.id} id={item.id}>
                                            {item.label}
                                        </Select.Item>
                                    )}
                                </Select>
                            </div>
                            <Button
                                size="md"
                                onClick={() => assignMutation.mutate()}
                                isLoading={assignMutation.isPending}
                                isDisabled={!selectedCourseId}
                                className="border-none bg-wine px-5 text-sm font-extrabold text-white shadow-md hover:bg-wine-deep"
                                iconLeading={<Plus className="size-4" />}
                            >
                                {UI_TEXT.learningPathModal.assignToPathBtn}
                            </Button>
                        </div>

                        {/* Current Learning Path List */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-black text-slate-800">
                                    {UI_TEXT.learningPathModal.courseListTitle}
                                    {learningPath.length}
                                    {")"}
                                </h4>
                                <span className="text-[11px] text-slate-400 italic">{UI_TEXT.learningPathModal.courseListSubtitle}</span>
                            </div>

                            {isLoading ? (
                                <div className="flex min-h-[150px] items-center justify-center">
                                    <div className="size-7 animate-spin rounded-full border-3 border-slate-200 border-t-wine" />
                                </div>
                            ) : learningPath.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 p-6 text-center">
                                    <AlertCircle className="size-8 text-slate-300" />
                                    <p className="text-xs font-bold text-slate-600">{UI_TEXT.learningPath.emptyTitle}</p>
                                    <p className="text-[11px] text-slate-400">{UI_TEXT.learningPath.syncHint}</p>
                                </div>
                            ) : (
                                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
                                    <table className="w-full border-collapse text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
                                                <th className="px-4 py-3">{UI_TEXT.learningPathModal.thStt}</th>
                                                <th className="px-4 py-3">{UI_TEXT.learningPathModal.thCourse}</th>
                                                <th className="px-4 py-3 text-center">{UI_TEXT.learningPathModal.thSource}</th>
                                                <th className="px-4 py-3 text-center">{UI_TEXT.learningPathModal.thCourseType}</th>
                                                <th className="px-4 py-3 text-center">{UI_TEXT.learningPathModal.thAction}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {learningPath.map((item: LearningPathItem, idx: number) => {
                                                const matchedCourse = courses.find((c) => c.id === item.courseId);
                                                const courseTitle = item.courseName || matchedCourse?.name || item.courseId;
                                                const courseCode = item.courseCode || matchedCourse?.courseCode;

                                                return (
                                                    <tr key={item.id || idx} className="border-b border-slate-50 text-xs hover:bg-slate-50/50">
                                                        <td className="px-4 py-3 font-mono text-slate-400">{idx + 1}</td>
                                                        <td className="px-4 py-3">
                                                            <div className="font-bold text-slate-800">{courseTitle}</div>
                                                            {courseCode && <div className="font-mono text-[10px] text-slate-400">{courseCode}</div>}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            {item.source === LearningPathSourceEnum.SYSTEM_SEED ? (
                                                                <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                                                                    {UI_TEXT.learningPathModal.sourceSystemSeed}
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex rounded-full border border-purple-100 bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                                                                    {UI_TEXT.learningPathModal.sourceManualAssign}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            {item.isRequired ? (
                                                                <span className="inline-flex rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                                                    {UI_TEXT.learningPathModal.typeRequired}
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                                                                    {UI_TEXT.learningPathModal.typeOptional}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <button
                                                                onClick={() => setDeletingCourse({ id: item.courseId, title: courseTitle })}
                                                                className="rounded p-1 text-red-500 transition hover:bg-red-50"
                                                                title={UI_TEXT.learningPathModal.toastDeleteSuccessDesc}
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </Dialog>
            </CustomModal.Content>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!deletingCourse}
                onClose={() => setDeletingCourse(null)}
                onConfirm={() => {
                    if (deletingCourse) {
                        unassignMutation.mutate(deletingCourse.id);
                        setDeletingCourse(null);
                    }
                }}
                title={UI_TEXT.learningPathModal.confirmUnassignTitle}
                message={
                    <span>
                        {UI_TEXT.learningPathModal.confirmUnassignPrefix}
                        <strong className="font-bold text-wine">{deletingCourse?.title}</strong>
                        {UI_TEXT.learningPathModal.confirmUnassignSuffix}
                    </span>
                }
                confirmText={unassignMutation.isPending ? UI_TEXT.learningPathModal.unassignPending : UI_TEXT.learningPathModal.btnUnassign}
                cancelText={UI_TEXT.common.cancel}
                variant="danger"
                isLoading={unassignMutation.isPending}
                icon={
                    <div className="flex size-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                        <AlertTriangle className="size-5" />
                    </div>
                }
            />
        </CustomModal.Root>
    );
}
