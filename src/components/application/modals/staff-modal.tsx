"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { type StaffSchemaType, staffSchema } from "@/schemas/staff.schema";
import { createStaff, getSystemsList, updateStaff } from "@/services/staff.service";
import { toast } from "@/services/toast.service";
import { GenderEnum, RoleEnum, type StaffModalProps, StatusEnum } from "@/types/staff.types";
import { registerInput } from "@/utils/form.utils";

export function StaffModal({ isOpen, onClose, staff }: StaffModalProps) {
    const queryClient = useQueryClient();

    // Fetch systems list for checkboxes
    const { data: systems = [] } = useQuery({
        queryKey: ["systems"],
        queryFn: getSystemsList,
        enabled: isOpen, // Only fetch when modal is open
    });

    const systemOptions = systems.map((sys) => ({
        id: sys.id,
        label: sys.name ? `${sys.systemCode} (${sys.name})` : sys.systemCode,
    }));

    const roleOptions = [
        { id: RoleEnum.ADMIN, label: UI_TEXT.staff.roleAdmin },
        { id: RoleEnum.MANAGER, label: UI_TEXT.staff.roleManager },
        { id: RoleEnum.TEACHER, label: UI_TEXT.staff.roleTeacher },
        { id: RoleEnum.TEACHER_ASSISTANT, label: UI_TEXT.staff.roleTeacherAssistant },
        { id: RoleEnum.ASSISTANT, label: UI_TEXT.staff.roleAssistant },
    ];

    const {
        register,
        handleSubmit,
        control,
        reset,
        clearErrors,
        formState: { errors },
    } = useForm<StaffSchemaType>({
        resolver: zodResolver(staffSchema),
        defaultValues: {
            fullName: "",
            email: "",
            phone: "",
            address: "",
            password: "",
            gender: undefined as unknown as GenderEnum,
            status: StatusEnum.ACTIVE,
            whitelist: false,
            systemIds: [],
            roles: [],
        },
    });

    // Reset form when modal opens/closes or selected staff changes
    useEffect(() => {
        if (isOpen) {
            if (staff) {
                reset({
                    fullName: staff.fullName,
                    email: staff.email,
                    phone: staff.phone || "",
                    address: staff.address || "",
                    password: "", // Password is optional on edit
                    gender: staff.gender,
                    status: staff.status,
                    whitelist: staff.whitelist || false,
                    systemIds: staff.systemIds || [],
                    roles: staff.roles.map((r) => r.name),
                });
            } else {
                reset({
                    fullName: "",
                    email: "",
                    phone: "",
                    address: "",
                    password: "",
                    gender: undefined as unknown as GenderEnum,
                    status: StatusEnum.ACTIVE,
                    whitelist: false,
                    systemIds: [],
                    roles: [],
                });
            }
        }
    }, [isOpen, staff, reset]);

    const createMutation = useMutation({
        mutationFn: createStaff,
        onSuccess: () => {
            toast.success(UI_TEXT.staff.toastSuccess, UI_TEXT.staff.toastAddSuccess);
            queryClient.invalidateQueries({ queryKey: ["staff"] });
            onClose();
        },
        onError: (error: Error) => {
            toast.error(UI_TEXT.staff.toastError, error.message || UI_TEXT.staff.toastAddError);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<StaffSchemaType> }) => {
            // Remove empty password so it is not sent if not changed
            const submitData = { ...data };
            if (!submitData.password) {
                delete submitData.password;
            }
            return updateStaff(id, submitData);
        },
        onSuccess: () => {
            toast.success(UI_TEXT.staff.toastSuccess, UI_TEXT.staff.toastUpdateSuccess);
            queryClient.invalidateQueries({ queryKey: ["staff"] });
            onClose();
        },
        onError: (error: Error) => {
            toast.error(UI_TEXT.staff.toastError, error.message || UI_TEXT.staff.toastUpdateError);
        },
    });

    const onSubmit = (data: StaffSchemaType) => {
        if (staff) {
            updateMutation.mutate({ id: staff.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="max-w-2xl !overflow-visible !rounded-[24px]">
                <Dialog className="flex max-h-[90vh] w-full flex-col rounded-[24px] bg-white shadow-2xl outline-none">
                    {/* Header */}
                    <div className="relative flex flex-col border-b border-slate-100 px-6 pt-6 pb-4">
                        <h2 className="text-xl font-bold text-slate-900">{staff ? UI_TEXT.staff.editTitle : UI_TEXT.staff.addTitle}</h2>
                        <p className="mt-1 text-xs text-slate-500">{staff ? UI_TEXT.staff.editSubtitle : UI_TEXT.staff.addSubtitle}</p>
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
                    <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
                        <div className="custom-scrollbar flex flex-1 flex-col gap-5 overflow-y-auto p-6">
                            {/* Họ tên & Email cùng hàng */}
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <Input
                                    label={
                                        <span>
                                            {UI_TEXT.staff.labelFullName.replace(" *", "")} <span className="font-bold text-red-500">{"*"}</span>
                                        </span>
                                    }
                                    placeholder={UI_TEXT.staff.placeholderFullName}
                                    hint={errors.fullName?.message}
                                    isInvalid={!!errors.fullName}
                                    {...registerInput(register("fullName", { onChange: () => clearErrors("fullName") }))}
                                />

                                <Input
                                    label={
                                        <span>
                                            {UI_TEXT.staff.labelEmail.replace(" *", "")} <span className="font-bold text-red-500">{"*"}</span>
                                        </span>
                                    }
                                    placeholder={UI_TEXT.staff.placeholderEmail}
                                    type="email"
                                    hint={errors.email?.message}
                                    isInvalid={!!errors.email}
                                    {...registerInput(register("email", { onChange: () => clearErrors("email") }))}
                                />
                            </div>

                            {/* Số điện thoại & Địa chỉ cùng hàng */}
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <Input
                                    label={
                                        <span>
                                            {UI_TEXT.staff.labelPhone.replace(" *", "")} <span className="font-bold text-red-500">{"*"}</span>
                                        </span>
                                    }
                                    placeholder={UI_TEXT.staff.placeholderPhone}
                                    hint={errors.phone?.message}
                                    isInvalid={!!errors.phone}
                                    {...registerInput(register("phone", { onChange: () => clearErrors("phone") }))}
                                />

                                <Input
                                    label={
                                        <span>
                                            {UI_TEXT.staff.labelAddress.replace(" *", "")} <span className="font-bold text-red-500">{"*"}</span>
                                        </span>
                                    }
                                    placeholder={UI_TEXT.staff.placeholderAddress}
                                    hint={errors.address?.message}
                                    isInvalid={!!errors.address}
                                    {...registerInput(register("address", { onChange: () => clearErrors("address") }))}
                                />
                            </div>

                            {/* Mật khẩu & Giới tính cùng hàng */}
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <Input
                                    label={
                                        staff ? (
                                            UI_TEXT.staff.labelPasswordEdit
                                        ) : (
                                            <span>
                                                {UI_TEXT.staff.labelPassword.replace(" *", "")} <span className="font-bold text-red-500">{"*"}</span>
                                            </span>
                                        )
                                    }
                                    placeholder={staff ? UI_TEXT.staff.placeholderPasswordEdit : UI_TEXT.staff.placeholderPassword}
                                    type="password"
                                    hint={errors.password?.message}
                                    isInvalid={!!errors.password}
                                    {...registerInput(register("password", { onChange: () => clearErrors("password") }))}
                                />

                                {/* Gender Select */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-slate-700">{UI_TEXT.staff.labelGender}</label>
                                    <Controller
                                        name="gender"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                selectedKey={field.value}
                                                onSelectionChange={(key) => {
                                                    field.onChange(key as GenderEnum);
                                                    clearErrors("gender");
                                                }}
                                                items={[
                                                    { id: GenderEnum.MALE, label: UI_TEXT.staff.genderMale },
                                                    { id: GenderEnum.FEMALE, label: UI_TEXT.staff.genderFemale },
                                                    { id: GenderEnum.OTHER, label: UI_TEXT.staff.genderOther },
                                                ]}
                                                size="sm"
                                                placeholder={UI_TEXT.staff.placeholderGender}
                                                isInvalid={!!errors.gender}
                                                hint={errors.gender?.message}
                                            >
                                                {(item) => <Select.Item id={item.id} label={item.label} />}
                                            </Select>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Roles Selection */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-slate-700">
                                    {UI_TEXT.staff.labelRoles.replace(" *", "")} <span className="font-bold text-red-500">{"*"}</span>
                                </label>
                                <Controller
                                    name="roles"
                                    control={control}
                                    render={({ field }) => (
                                        <Select.MultiComboBox
                                            placeholder={UI_TEXT.staff.placeholderRoles}
                                            selectedKeys={field.value || []}
                                            onSelectionChange={(keys) => {
                                                field.onChange(keys);
                                                clearErrors("roles");
                                            }}
                                            items={roleOptions}
                                            size="sm"
                                            isInvalid={!!errors.roles}
                                        />
                                    )}
                                />
                                {errors.roles && <p className="text-xs font-medium text-red-500">{errors.roles.message}</p>}
                            </div>

                            {/* Systems Selection */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-slate-700">{UI_TEXT.staff.labelSystems}</label>
                                <Controller
                                    name="systemIds"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="custom-scrollbar flex max-h-[160px] flex-col gap-2 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50/50 p-3">
                                            {systemOptions.length === 0 ? (
                                                <p className="py-2 text-center text-xs text-slate-400">{UI_TEXT.staff.loadingSystems}</p>
                                            ) : (
                                                systemOptions.map((opt) => {
                                                    const isChecked = field.value?.includes(opt.id);
                                                    return (
                                                        <label key={opt.id} className="flex cursor-pointer items-start gap-2.5 py-0.5 text-sm text-slate-700">
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={() => {
                                                                    const newValue = isChecked
                                                                        ? field.value.filter((k) => k !== opt.id)
                                                                        : [...(field.value || []), opt.id];
                                                                    field.onChange(newValue);
                                                                }}
                                                                className="mt-0.5 size-4 accent-wine"
                                                            />
                                                            <span className="leading-tight">{opt.label}</span>
                                                        </label>
                                                    );
                                                })
                                            )}
                                        </div>
                                    )}
                                />
                            </div>

                            {/* Whitelist (Bypass OTP) Toggle */}
                            <div className="mt-2 mb-2 flex items-center justify-between border-t border-slate-100 pt-4">
                                <div>
                                    <label className="text-sm font-bold text-slate-800">{UI_TEXT.staff.labelWhitelist}</label>
                                    <p className="mt-0.5 text-[11.5px] leading-normal text-slate-500">{UI_TEXT.staff.descWhitelist}</p>
                                </div>
                                <Controller
                                    name="whitelist"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            type="checkbox"
                                            checked={field.value}
                                            onChange={(e) => field.onChange(e.target.checked)}
                                            className="size-5 cursor-pointer accent-wine"
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 rounded-b-[24px] border-t border-slate-100 bg-slate-50/60 p-4">
                            <Button type="button" color="secondary-gray" size="md" onPress={onClose} isDisabled={isPending}>
                                {UI_TEXT.staff.btnCancel}
                            </Button>
                            <Button
                                color="primary"
                                size="md"
                                type="submit"
                                isLoading={isPending}
                                className="border-none bg-wine px-6 font-bold text-white hover:bg-wine-deep"
                            >
                                {staff ? UI_TEXT.staff.btnUpdate : UI_TEXT.staff.btnSave}
                            </Button>
                        </div>
                    </form>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
