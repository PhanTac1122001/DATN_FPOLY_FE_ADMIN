"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Heading } from "react-aria-components";
import { Controller, useForm } from "react-hook-form";
import { DatePicker } from "@/components/application/date-picker/date-picker";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH, STUDENT_STATUS_OPTIONS, StudentLocationEnum } from "@/constants/student.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { createStudent, updateStudent } from "@/services/student.service";
import { toast } from "@/services/toast.service";
import { type Student, type StudentFormValues, StudentStatusEnum } from "@/types/student.types";
import type { System } from "@/types/system.types";

export function StudentFormModal({ isOpen, onClose, student, systems }: { isOpen: boolean; onClose: () => void; student?: Student | null; systems: System[] }) {
    const queryClient = useQueryClient();
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    const { control, handleSubmit, reset } = useForm<StudentFormValues>({
        defaultValues: {
            fullName: "",
            email: "",
            phone: "",
            location: StudentLocationEnum.HN,
            dateOfBirth: "",
            studentCode: "",
            password: "",
            status: StudentStatusEnum.DANG_HOC,
            systemId: "",
            lockedUntil: "",
            systemIds: [] as string[],
        },
    });

    useEffect(() => {
        if (student && isOpen) {
            reset({
                fullName: student.fullName || "",
                email: student.email || "",
                phone: student.phone || "",
                location: student.location || StudentLocationEnum.HN,
                dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split("T")[0] : "",
                studentCode: student.studentCode || "",
                password: "",
                status: student.status || StudentStatusEnum.DANG_HOC,
                systemId: student.systemIds?.[0] || "",
                lockedUntil: student.lockedUntil ? student.lockedUntil.split("T")[0] : "",
                systemIds: student.systemIds || [],
            });
            setAvatarFile(null);
        } else if (isOpen) {
            reset({
                fullName: "",
                email: "",
                phone: "",
                location: StudentLocationEnum.HN,
                dateOfBirth: "",
                studentCode: "",
                password: "",
                status: StudentStatusEnum.DANG_HOC,
                systemId: (systems[0]?.id as string) || "",
                lockedUntil: "",
                systemIds: (systems[0]?.id as string) ? [systems[0].id as string] : [],
            });
            setAvatarFile(null);
        }
    }, [student, isOpen, reset, systems]);

    const submitMutation = useMutation({
        mutationFn: async (data: StudentFormValues) => {
            if (student) {
                const fd = new FormData();
                if (avatarFile) fd.append("avatar", avatarFile);
                if (data.fullName) fd.append("fullName", data.fullName);
                if (data.email) fd.append("email", data.email);
                if (data.phone) fd.append("phone", data.phone);
                if (data.location) fd.append("location", data.location);
                if (data.dateOfBirth) fd.append("dateOfBirth", data.dateOfBirth);
                if (data.studentCode) fd.append("studentCode", data.studentCode);
                if (data.status) fd.append("status", data.status);
                if (data.lockedUntil) fd.append("lockedUntil", data.lockedUntil);
                if (data.password) fd.append("password", data.password);

                const sysIds =
                    data.systemIds && Array.isArray(data.systemIds) && data.systemIds.length > 0 ? data.systemIds : data.systemId ? [data.systemId] : [];
                sysIds.forEach((id: string) => fd.append("systemIds[]", id));

                return updateStudent(student.id, fd);
            } else {
                return createStudent({
                    fullName: data.fullName,
                    email: data.email,
                    phone: data.phone,
                    location: data.location,
                    dateOfBirth: data.dateOfBirth,
                    systemId: data.systemId || data.systemIds?.[0],
                    studentCode: data.studentCode || undefined,
                    password: data.password || undefined,
                });
            }
        },
        onSuccess: () => {
            toast.success(
                UI_TEXT.studentFormModal.toastSuccessTitle,
                student ? UI_TEXT.studentFormModal.toastUpdateSuccess : UI_TEXT.studentFormModal.toastCreateSuccess,
            );
            queryClient.invalidateQueries({ queryKey: ["students-list"] });
            queryClient.invalidateQueries({ queryKey: ["students-report"] });
            onClose();
        },
        onError: (e: Error) => {
            toast.error(UI_TEXT.studentFormModal.toastErrorTitle, e.message || UI_TEXT.studentFormModal.toastSaveError);
        },
    });

    const locationOptions = [
        { id: StudentLocationEnum.HN, label: UI_TEXT.studentFormModal.locationHn },
        { id: StudentLocationEnum.HCM, label: UI_TEXT.studentFormModal.locationHcm },
    ];

    const systemOptions = systems.map((sys) => ({
        id: sys.id,
        label: sys.name,
    }));

    const studentStatusOptions = STUDENT_STATUS_OPTIONS;

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="w-full max-w-2xl overflow-hidden !rounded-[24px]">
                <Dialog className="flex max-h-[90vh] flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl outline-none">
                    {/* Fixed Modal Header */}
                    <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6 pt-6 pb-4">
                        <Heading slot="title" className="text-lg font-black text-slate-800">
                            {student ? UI_TEXT.studentFormModal.titleEdit : UI_TEXT.studentFormModal.titleCreate}
                        </Heading>
                        <button onClick={onClose} className="cursor-pointer rounded-lg p-1 transition hover:bg-slate-100">
                            <X className="size-5 text-slate-400" />
                        </button>
                    </div>

                    {/* Modal Form */}
                    <form onSubmit={handleSubmit((d) => submitMutation.mutate(d))} className="flex min-h-0 flex-1 flex-col overflow-hidden">
                        {/* Scrollable Body */}
                        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
                            {student && (
                                <div className="flex flex-col gap-1.5 rounded-xl border border-slate-100 bg-slate-50 p-3">
                                    <label className="text-xs font-bold text-slate-600 uppercase">{UI_TEXT.studentFormModal.avatarLabel}</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                                        className="cursor-pointer text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-wine file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white hover:file:bg-wine-deep"
                                    />
                                </div>
                            )}

                            <Controller
                                name="fullName"
                                control={control}
                                rules={{ required: UI_TEXT.studentFormModal.errFullNameRequired }}
                                render={({ field, fieldState }) => (
                                    <Input
                                        label={
                                            <span>
                                                {UI_TEXT.studentFormModal.fullNameLabel}{" "}
                                                <span className="font-bold text-red-500">{UI_TEXT.studentFormModal.asterisk}</span>
                                            </span>
                                        }
                                        placeholder={UI_TEXT.studentFormModal.placeholderFullName}
                                        value={field.value}
                                        onChange={field.onChange}
                                        isInvalid={!!fieldState.error}
                                        hint={fieldState.error?.message}
                                    />
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Controller
                                    name="email"
                                    control={control}
                                    rules={{ required: UI_TEXT.studentFormModal.errEmailRequired }}
                                    render={({ field, fieldState }) => (
                                        <Input
                                            label={
                                                <span>
                                                    {UI_TEXT.studentFormModal.emailLabel}{" "}
                                                    <span className="font-bold text-red-500">{UI_TEXT.studentFormModal.asterisk}</span>
                                                </span>
                                            }
                                            placeholder={UI_TEXT.studentFormModal.placeholderEmail}
                                            value={field.value}
                                            onChange={field.onChange}
                                            isInvalid={!!fieldState.error}
                                            hint={fieldState.error?.message}
                                        />
                                    )}
                                />
                                <Controller
                                    name="phone"
                                    control={control}
                                    rules={{ required: UI_TEXT.studentFormModal.errPhoneRequired }}
                                    render={({ field, fieldState }) => (
                                        <Input
                                            label={
                                                <span>
                                                    {UI_TEXT.studentFormModal.phoneLabel}{" "}
                                                    <span className="font-bold text-red-500">{UI_TEXT.studentFormModal.asterisk}</span>
                                                </span>
                                            }
                                            placeholder={UI_TEXT.studentFormModal.placeholderPhone}
                                            value={field.value}
                                            onChange={field.onChange}
                                            isInvalid={!!fieldState.error}
                                            hint={fieldState.error?.message}
                                        />
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Controller
                                    name="dateOfBirth"
                                    control={control}
                                    rules={{ required: UI_TEXT.studentFormModal.errDobRequired }}
                                    render={({ field, fieldState }) => (
                                        <div className="flex flex-col gap-1">
                                            <DatePicker
                                                label={
                                                    <span>
                                                        {UI_TEXT.studentFormModal.dobLabel}{" "}
                                                        <span className="font-bold text-red-500">{UI_TEXT.studentFormModal.asterisk}</span>
                                                    </span>
                                                }
                                                placeholder={UI_TEXT.common.datePlaceholder}
                                                value={field.value || ""}
                                                onChange={(val) => field.onChange(val ? String(val) : "")}
                                            />
                                            {fieldState.error && <span className="text-xs font-medium text-red-500">{fieldState.error.message}</span>}
                                        </div>
                                    )}
                                />
                                <Controller
                                    name="location"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            label={UI_TEXT.studentFormModal.labelTrainingLocation}
                                            placeholder={UI_TEXT.studentFormModal.placeholderLocation}
                                            items={locationOptions}
                                            selectedKey={field.value}
                                            onSelectionChange={field.onChange}
                                        >
                                            {(item) => (
                                                <Select.Item key={item.id} id={item.id}>
                                                    {item.label}
                                                </Select.Item>
                                            )}
                                        </Select>
                                    )}
                                />
                            </div>

                            {!student ? (
                                /* CREATE STUDENT FIELDS */
                                <>
                                    <div className="grid grid-cols-1 gap-4">
                                        <Controller
                                            name="systemId"
                                            control={control}
                                            rules={{ required: UI_TEXT.studentFormModal.errDefaultSystemRequired }}
                                            render={({ field }) => (
                                                <Select
                                                    label={UI_TEXT.excelImportModal.defaultSystemLabel}
                                                    placeholder={UI_TEXT.excelImportModal.selectSystemPlaceholder}
                                                    items={systemOptions}
                                                    selectedKey={field.value}
                                                    onSelectionChange={field.onChange}
                                                >
                                                    {(item) => (
                                                        <Select.Item key={item.id} id={item.id}>
                                                            {item.label}
                                                        </Select.Item>
                                                    )}
                                                </Select>
                                            )}
                                        />
                                    </div>
                                </>
                            ) : (
                                /* EDIT STUDENT MULTI-SYSTEM SELECT */
                                <Controller
                                    name="systemIds"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase">
                                                {UI_TEXT.studentFormModal.linkedSystemLabel}{" "}
                                                <span className="font-bold text-red-500">{UI_TEXT.studentFormModal.asterisk}</span>
                                            </label>
                                            <div className="flex max-h-36 flex-col gap-1.5 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                                                {systems.map((sys) => (
                                                    <label
                                                        key={sys.id}
                                                        className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={field.value.includes(sys.id)}
                                                            onChange={(e) => {
                                                                const val = e.target.checked
                                                                    ? [...field.value, sys.id]
                                                                    : field.value.filter((id) => id !== sys.id);
                                                                field.onChange(val);
                                                            }}
                                                            className="size-4 rounded text-wine focus:ring-wine"
                                                        />
                                                        {sys.name} {UI_TEXT.studentFormModal.openParen}
                                                        {sys.systemCode}
                                                        {UI_TEXT.studentFormModal.closeParen}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                />
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <Controller
                                    name="studentCode"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            label={UI_TEXT.studentFormModal.labelStudentCodeOptional}
                                            placeholder={UI_TEXT.studentFormModal.placeholderAutoStudentCode}
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                                <Controller
                                    name="password"
                                    control={control}
                                    rules={{
                                        validate: (val) => {
                                            if (val && (val.length < MIN_PASSWORD_LENGTH || val.length > MAX_PASSWORD_LENGTH)) {
                                                return UI_TEXT.studentFormModal.validationPasswordLength;
                                            }
                                            return true;
                                        },
                                    }}
                                    render={({ field, fieldState }) => (
                                        <Input
                                            type="password"
                                            label={
                                                student
                                                    ? UI_TEXT.studentFormModal.labelResetPasswordOptional
                                                    : UI_TEXT.studentFormModal.labelInitialPasswordOptional
                                            }
                                            placeholder={
                                                student
                                                    ? UI_TEXT.studentFormModal.placeholderChangePassword
                                                    : UI_TEXT.studentFormModal.placeholderDefaultPassword
                                            }
                                            value={field.value}
                                            onChange={field.onChange}
                                            isInvalid={!!fieldState.error}
                                            hint={fieldState.error?.message}
                                        />
                                    )}
                                />
                            </div>

                            {student && (
                                <div className="grid grid-cols-2 gap-4">
                                    <Controller
                                        name="status"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                label={UI_TEXT.studentFormModal.labelStudyStatusRequired}
                                                placeholder={UI_TEXT.studentFormModal.placeholderStatus}
                                                items={studentStatusOptions}
                                                selectedKey={field.value}
                                                onSelectionChange={field.onChange}
                                            >
                                                {(item) => (
                                                    <Select.Item key={item.id} id={item.id}>
                                                        {item.label}
                                                    </Select.Item>
                                                )}
                                            </Select>
                                        )}
                                    />
                                    <Controller
                                        name="lockedUntil"
                                        control={control}
                                        render={({ field }) => (
                                            <DatePicker
                                                label={UI_TEXT.studentFormModal.labelLockAccountUntil}
                                                placeholder={UI_TEXT.common.datePlaceholder}
                                                value={field.value || ""}
                                                onChange={(val) => field.onChange(val ? String(val) : "")}
                                            />
                                        )}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Fixed Modal Footer */}
                        <div className="flex w-full shrink-0 items-center gap-3 border-t border-slate-100 bg-white px-6 py-4">
                            <Button color="secondary" type="button" onClick={onClose} className="w-1/3 justify-center">
                                {UI_TEXT.studentFormModal.cancelBtn}
                            </Button>
                            <Button
                                color="primary"
                                type="submit"
                                isLoading={submitMutation.isPending}
                                className="w-2/3 justify-center border-none bg-wine text-white hover:bg-wine-deep"
                            >
                                {student ? UI_TEXT.studentFormModal.saveBtnEdit : UI_TEXT.studentFormModal.saveBtnCreate}
                            </Button>
                        </div>
                    </form>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
