"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { deleteStudentFromClass, enrollStudentInClass, getClassesList, getStudentClasses, updateStudentClass } from "@/services/student.service";
import { toast } from "@/services/toast.service";
import type { Student } from "@/types/student.types";

export function ClassEnrollmentsModal({ isOpen, onClose, student }: { isOpen: boolean; onClose: () => void; student: Student | null }) {
    const queryClient = useQueryClient();
    const [classId, setClassId] = useState("");
    const [status, setStatus] = useState("STUDYING");
    const [isActive, setIsActive] = useState(true);

    const { data: enrollments = [], isLoading } = useQuery({
        queryKey: ["student-enrollments", student?.id],
        queryFn: () => getStudentClasses(student!.id),
        enabled: !!student && isOpen,
    });

    const { data: classes = [] } = useQuery({
        queryKey: ["classes-list"],
        queryFn: getClassesList,
        enabled: isOpen,
    });

    const enrollMutation = useMutation({
        mutationFn: () =>
            enrollStudentInClass({
                studentId: student!.id,
                classId,
                status,
                isActive,
            }),
        onSuccess: () => {
            toast.success(UI_TEXT.classEnrollmentsModal.toastSuccessTitle, UI_TEXT.classEnrollmentsModal.toastEnrollSuccess);
            queryClient.invalidateQueries({ queryKey: ["student-enrollments", student?.id] });
            setClassId("");
        },
        onError: (e: Error) => {
            toast.error(UI_TEXT.classEnrollmentsModal.toastErrorTitle, e.message || UI_TEXT.classEnrollmentsModal.toastEnrollError);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, active, st }: { id: string; active: boolean; st: string }) => updateStudentClass(id, { isActive: active, status: st }),
        onSuccess: () => {
            toast.success(UI_TEXT.classEnrollmentsModal.toastSuccessTitle, UI_TEXT.classEnrollmentsModal.toastUpdateSuccess);
            queryClient.invalidateQueries({ queryKey: ["student-enrollments", student?.id] });
        },
        onError: () => {
            toast.error(UI_TEXT.classEnrollmentsModal.toastErrorTitle, UI_TEXT.classEnrollmentsModal.toastUpdateError);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteStudentFromClass,
        onSuccess: () => {
            toast.success(UI_TEXT.classEnrollmentsModal.toastSuccessTitle, UI_TEXT.classEnrollmentsModal.toastDeleteSuccess);
            queryClient.invalidateQueries({ queryKey: ["student-enrollments", student?.id] });
        },
        onError: () => {
            toast.error(UI_TEXT.classEnrollmentsModal.toastErrorTitle, UI_TEXT.classEnrollmentsModal.toastDeleteError);
        },
    });

    if (!student) return null;

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="w-full max-w-2xl overflow-hidden !rounded-[24px]">
                <Dialog className="flex max-h-[90vh] flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl outline-none">
                    <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6 pt-6 pb-4">
                        <div>
                            <Heading slot="title" className="text-lg font-black text-slate-800">
                                {UI_TEXT.classEnrollmentsModal.title}
                            </Heading>
                            <p className="mt-0.5 text-xs font-semibold text-slate-400">
                                {student.fullName} {"("}
                                {student.studentCode}
                                {")"}
                            </p>
                        </div>
                        <button onClick={onClose} className="cursor-pointer rounded-lg p-1 transition hover:bg-slate-100">
                            <X className="size-5 text-slate-400" />
                        </button>
                    </div>

                    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
                        {/* New enrollment Form */}
                        <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                            <div className="flex min-w-[200px] flex-1 flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase">{UI_TEXT.classEnrollmentsModal.selectClassLabel}</label>
                                <select
                                    value={classId}
                                    onChange={(e) => setClassId(e.target.value)}
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm focus:outline-none"
                                >
                                    <option value="">{UI_TEXT.classEnrollmentsModal.selectClassPlaceholder}</option>
                                    {classes.map((cls) => {
                                        const displayName = cls.className || cls.name || cls.classCode || cls.code || cls.id;
                                        return (
                                            <option key={cls.id} value={cls.id}>
                                                {displayName}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                            <div className="flex w-32 flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase">{UI_TEXT.classEnrollmentsModal.statusLabel}</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm focus:outline-none"
                                >
                                    <option value="STUDYING">{UI_TEXT.classEnrollmentsModal.statusStudying}</option>
                                    <option value="RESERVED">{UI_TEXT.classEnrollmentsModal.statusReserved}</option>
                                    <option value="DROPOFF">{UI_TEXT.classEnrollmentsModal.statusDropoff}</option>
                                </select>
                            </div>
                            <div className="flex h-9 items-center gap-2">
                                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} id="active-chk" />
                                <label htmlFor="active-chk" className="cursor-pointer text-xs font-bold text-slate-600">
                                    {UI_TEXT.classEnrollmentsModal.activeLabel}
                                </label>
                            </div>
                            <Button
                                onClick={() => enrollMutation.mutate()}
                                isLoading={enrollMutation.isPending}
                                isDisabled={!classId}
                                className="gap-1 border-none bg-wine py-1.5 text-white"
                                iconLeading={<Plus className="size-4" />}
                            >
                                {UI_TEXT.classEnrollmentsModal.enrollBtn}
                            </Button>
                        </div>

                        {/* List of current classes */}
                        <div className="flex flex-col gap-2">
                            <h4 className="text-sm font-black text-slate-700">{UI_TEXT.classEnrollmentsModal.currentClassesTitle}</h4>
                            {isLoading ? (
                                <div className="mx-auto my-4 size-6 animate-spin rounded-full border-2 border-slate-200 border-t-wine" />
                            ) : enrollments.length === 0 ? (
                                <p className="py-4 text-center text-xs text-slate-400 italic">{UI_TEXT.classEnrollmentsModal.emptyEnrollments}</p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {enrollments.map((en) => {
                                        const classIdObj = en.classId as unknown as Record<string, unknown> | string;
                                        const classIdStr =
                                            typeof classIdObj === "object" && classIdObj !== null
                                                ? ((classIdObj.id || classIdObj._id) as string)
                                                : (classIdObj as string);
                                        const classObjName =
                                            typeof classIdObj === "object" && classIdObj !== null
                                                ? ((classIdObj.className || classIdObj.name || classIdObj.classCode) as string)
                                                : null;
                                        const matchingClass = classes.find((c) => c.id === classIdStr);
                                        const classNameDisplay =
                                            classObjName ||
                                            matchingClass?.className ||
                                            matchingClass?.name ||
                                            matchingClass?.classCode ||
                                            (classIdStr
                                                ? `${UI_TEXT.classEnrollmentsModal.classIdPrefix} ${classIdStr}`
                                                : UI_TEXT.classEnrollmentsModal.unknownClass);

                                        return (
                                            <div
                                                key={en.id}
                                                className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50/50"
                                            >
                                                <div>
                                                    <span className="text-sm font-bold text-slate-800">{classNameDisplay}</span>
                                                    <div className="mt-0.5 font-mono text-[10px] text-slate-400">
                                                        {UI_TEXT.classEnrollmentsModal.enrolledDatePrefix}{" "}
                                                        {en.createdAt ? new Date(en.createdAt).toLocaleDateString() : "-"}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <select
                                                        value={en.status}
                                                        onChange={(e) => updateMutation.mutate({ id: en.id, active: en.isActive, st: e.target.value })}
                                                        className="rounded border border-slate-200 bg-white px-2 py-1 text-xs"
                                                    >
                                                        <option value="STUDYING">{UI_TEXT.classEnrollmentsModal.statusStudying}</option>
                                                        <option value="RESERVED">{UI_TEXT.classEnrollmentsModal.statusReserved}</option>
                                                        <option value="DROPOFF">{UI_TEXT.classEnrollmentsModal.statusDropoff}</option>
                                                    </select>
                                                    <input
                                                        type="checkbox"
                                                        checked={en.isActive}
                                                        onChange={(e) => updateMutation.mutate({ id: en.id, active: e.target.checked, st: en.status })}
                                                    />
                                                    <button onClick={() => deleteMutation.mutate(en.id)} className="rounded p-1.5 text-red-500 hover:bg-red-50">
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
