"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Heading } from "react-aria-components";
import { DatePicker } from "@/components/application/date-picker/date-picker";
import { Button } from "@/components/base/buttons/button";
import { Select } from "@/components/base/select/select";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { assignCourseToClass, updateCourseClass } from "@/services/class.service";
import { getStaffList } from "@/services/staff.service";
import { getStaffCoursesList } from "@/services/student.service";
import { toast } from "@/services/toast.service";
import { type CourseClassModalProps, CourseClassStatusEnum } from "@/types/class.types";
import type { StaffCourseOption } from "@/types/student.types";

const dateIsoLength = 10;

export function CourseClassModal({ isOpen, onClose, classId, courseClassData }: CourseClassModalProps) {
    const queryClient = useQueryClient();
    const isEditMode = !!courseClassData;

    const [courseId, setCourseId] = useState("");
    const [teacherId, setTeacherId] = useState("");
    const [taId, setTaId] = useState("");
    const [status, setStatus] = useState<string>(CourseClassStatusEnum.STUDYING);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Reset or populate form state when opening modal
    useEffect(() => {
        if (courseClassData) {
            setCourseId(courseClassData.courseId?.id || "");
            setTeacherId(courseClassData.teacherId?.id || "");
            setTaId(courseClassData.taId?.id || "");
            setStatus(courseClassData.status || CourseClassStatusEnum.STUDYING);
            setStartDate(courseClassData.startDate ? courseClassData.startDate.slice(0, dateIsoLength) : "");
            setEndDate(courseClassData.endDate ? courseClassData.endDate.slice(0, dateIsoLength) : "");
        } else {
            setCourseId("");
            setTeacherId("");
            setTaId("");
            setStatus(CourseClassStatusEnum.STUDYING);
            setStartDate("");
            setEndDate("");
        }
    }, [courseClassData, isOpen]);

    // Automatically compute status based on startDate and endDate
    useEffect(() => {
        if (!startDate && !endDate) return;

        const todayStr = new Date().toISOString().slice(0, dateIsoLength);

        if (startDate && startDate > todayStr) {
            setStatus(CourseClassStatusEnum.PENDING);
        } else if (endDate && endDate < todayStr) {
            setStatus(CourseClassStatusEnum.FINISHED);
        } else {
            setStatus(CourseClassStatusEnum.STUDYING);
        }
    }, [startDate, endDate]);

    // Query available courses
    const { data: courses = [] } = useQuery({
        queryKey: ["staff-courses"],
        queryFn: getStaffCoursesList,
        enabled: isOpen,
    });

    // Query available staff members (for Teacher & TA selection)
    const { data: staffList = [] } = useQuery({
        queryKey: ["staff-list"],
        queryFn: getStaffList,
        enabled: isOpen,
    });

    const createMutation = useMutation({
        mutationFn: () =>
            assignCourseToClass({
                classId,
                courseId,
                teacherId,
                taId: taId || undefined,
                status,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
            }),
        onSuccess: () => {
            toast.success(UI_TEXT.courseClassModal.toastCreateSuccessTitle, UI_TEXT.courseClassModal.toastCreateSuccessDesc);
            queryClient.invalidateQueries({ queryKey: ["class-detail", classId] });
            onClose();
        },
        onError: (err: Error) => {
            toast.error(UI_TEXT.courseClassModal.toastCreateErrorTitle, err.message || UI_TEXT.courseClassModal.toastCreateErrorDefault);
        },
    });

    const updateMutation = useMutation({
        mutationFn: () =>
            updateCourseClass(courseClassData!.id, {
                teacherId: teacherId || undefined,
                taId: taId || undefined,
                status,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
            }),
        onSuccess: () => {
            toast.success(UI_TEXT.courseClassModal.toastUpdateSuccessTitle, UI_TEXT.courseClassModal.toastUpdateSuccessDesc);
            queryClient.invalidateQueries({ queryKey: ["class-detail", classId] });
            onClose();
        },
        onError: (err: Error) => {
            toast.error(UI_TEXT.courseClassModal.toastUpdateErrorTitle, err.message || UI_TEXT.courseClassModal.toastUpdateErrorDefault);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditMode) {
            updateMutation.mutate();
        } else {
            if (!courseId || !teacherId) {
                toast.error(UI_TEXT.courseClassModal.toastCreateErrorTitle, UI_TEXT.courseClassModal.toastValidationError);
                return;
            }
            createMutation.mutate();
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    const courseOptions = courses.map((c: StaffCourseOption) => ({
        id: c.id,
        label: c.name,
        supportingText: c.courseCode ? `(${c.courseCode})` : undefined,
    }));

    const staffOptions = staffList.map((s) => ({
        id: s.id,
        label: s.fullName,
        supportingText: s.email ? `(${s.email})` : undefined,
    }));

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="max-w-lg !rounded-[24px]">
                <Dialog className="flex flex-col rounded-[24px] bg-white shadow-2xl outline-none">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                        <Heading slot="title" className="text-lg font-bold text-slate-900">
                            {isEditMode ? UI_TEXT.courseClassModal.editTitle : UI_TEXT.courseClassModal.createTitle}
                        </Heading>
                        <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Body Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
                        {/* Course Select */}
                        <Select.ComboBox
                            label={UI_TEXT.courseClassModal.courseLabel}
                            placeholder={UI_TEXT.courseClassModal.coursePlaceholder}
                            items={courseOptions}
                            selectedKey={courseId || null}
                            onSelectionChange={(key) => setCourseId(key ? String(key) : "")}
                            isDisabled={isEditMode}
                        >
                            {(item) => (
                                <Select.Item key={item.id} id={item.id} label={item.label} supportingText={item.supportingText} textValue={item.label} />
                            )}
                        </Select.ComboBox>

                        {/* Teacher Main Select */}
                        <Select.ComboBox
                            label={UI_TEXT.courseClassModal.teacherLabel}
                            placeholder={UI_TEXT.courseClassModal.teacherPlaceholder}
                            items={staffOptions}
                            selectedKey={teacherId || null}
                            onSelectionChange={(key) => setTeacherId(key ? String(key) : "")}
                        >
                            {(item) => (
                                <Select.Item key={item.id} id={item.id} label={item.label} supportingText={item.supportingText} textValue={item.label} />
                            )}
                        </Select.ComboBox>

                        {/* TA Select */}
                        <Select.ComboBox
                            label={UI_TEXT.courseClassModal.taLabel}
                            placeholder={UI_TEXT.courseClassModal.taPlaceholder}
                            items={staffOptions}
                            selectedKey={taId || null}
                            onSelectionChange={(key) => setTaId(key ? String(key) : "")}
                            isClearable
                        >
                            {(item) => (
                                <Select.Item key={item.id} id={item.id} label={item.label} supportingText={item.supportingText} textValue={item.label} />
                            )}
                        </Select.ComboBox>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-3">
                            <DatePicker
                                label={UI_TEXT.courseClassModal.startDateLabel}
                                placeholder={UI_TEXT.courseClassModal.datePlaceholder}
                                value={startDate}
                                onChange={(val) => setStartDate(val ? String(val) : "")}
                            />
                            <DatePicker
                                label={UI_TEXT.courseClassModal.endDateLabel}
                                placeholder={UI_TEXT.courseClassModal.datePlaceholder}
                                value={endDate}
                                onChange={(val) => setEndDate(val ? String(val) : "")}
                            />
                        </div>

                        {/* Footer buttons */}
                        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
                            <Button type="button" color="secondary" size="md" onClick={onClose} className="col-span-1 w-full justify-center">
                                {UI_TEXT.courseClassModal.cancelBtn}
                            </Button>
                            <Button
                                type="submit"
                                color="primary"
                                size="md"
                                isLoading={isPending}
                                className="col-span-2 w-full justify-center border-none bg-wine text-white"
                            >
                                {isEditMode ? UI_TEXT.courseClassModal.saveBtn : UI_TEXT.courseClassModal.assignBtn}
                            </Button>
                        </div>
                    </form>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
