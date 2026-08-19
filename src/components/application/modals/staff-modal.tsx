"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { Heading } from "react-aria-components";
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

    const [systemSearchTerm, setSystemSearchTerm] = useState("");

    const filteredSystemOptions = systemOptions.filter((opt) => opt.label.toLowerCase().includes(systemSearchTerm.toLowerCase()));

    const roleOptions = [
        { id: RoleEnum.ADMIN, label: UI_TEXT.staff.roleAdmin },
        { id: RoleEnum.MANAGER, label: UI_TEXT.staff.roleManager },
        { id: RoleEnum.TEACHER, label: UI_TEXT.staff.roleTeacher },
        { id: RoleEnum.TEACHER_ASSISTANT, label: UI_TEXT.staff.roleTeacherAssistant },
        { id: RoleEnum.ASSISTANT, label: UI_TEXT.staff.roleAssistant },
    ];

    const {
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
            setSystemSearchTerm("");
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
            <CustomModal.Content className="max-w-4xl !overflow-visible !rounded-[24px]">
                <Dialog className="flex max-h-[90vh] w-full flex-col rounded-[24px] bg-white shadow-2xl outline-none">
                    {/* Header */}
                    <div className="relative flex flex-col border-b border-slate-100 px-6 pt-6 pb-4">
                        <Heading slot="title" className="text-xl font-bold text-slate-900">
                            {staff ? UI_TEXT.staff.editTitle : UI_TEXT.staff.addTitle}
                        </Heading>
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
                                <Controller
                                    name="fullName"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            label={
                                                <span>
                                                    {UI_TEXT.staff.labelFullName.replace(" *", "")} <span className="font-bold text-red-500">{"*"}</span>
                                                </span>
                                            }
                                            placeholder={UI_TEXT.staff.placeholderFullName}
                                            hint={errors.fullName?.message}
                                            isInvalid={!!errors.fullName}
                                            value={field.value || ""}
                                            onChange={(val) => {
                                                field.onChange(val);
                                                clearErrors("fullName");
                                            }}
                                            onBlur={field.onBlur}
                                            ref={field.ref}
                                        />
                                    )}
                                />

                                <Controller
                                    name="email"
                                    control={control}
                                    render={({ field }) => (
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
                                            value={field.value || ""}
                                            onChange={(val) => {
                                                field.onChange(val);
                                                clearErrors("email");
                                            }}
                                            onBlur={field.onBlur}
                                            ref={field.ref}
                                        />
                                    )}
                                />
                            </div>

                            {/* Số điện thoại & Địa chỉ cùng hàng */}
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <Controller
                                    name="phone"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            label={
                                                <span>
                                                    {UI_TEXT.staff.labelPhone.replace(" *", "")} <span className="font-bold text-red-500">{"*"}</span>
                                                </span>
                                            }
                                            placeholder={UI_TEXT.staff.placeholderPhone}
                                            hint={errors.phone?.message}
                                            isInvalid={!!errors.phone}
                                            value={field.value || ""}
                                            onChange={(val) => {
                                                field.onChange(val);
                                                clearErrors("phone");
                                            }}
                                            onBlur={field.onBlur}
                                            ref={field.ref}
                                        />
                                    )}
                                />

                                <Controller
                                    name="address"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            label={
                                                <span>
                                                    {UI_TEXT.staff.labelAddress.replace(" *", "")} <span className="font-bold text-red-500">{"*"}</span>
                                                </span>
                                            }
                                            placeholder={UI_TEXT.staff.placeholderAddress}
                                            hint={errors.address?.message}
                                            isInvalid={!!errors.address}
                                            value={field.value || ""}
                                            onChange={(val) => {
                                                field.onChange(val);
                                                clearErrors("address");
                                            }}
                                            onBlur={field.onBlur}
                                            ref={field.ref}
                                        />
                                    )}
                                />
                            </div>

                            {/* Mật khẩu & Giới tính cùng hàng */}
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <Controller
                                    name="password"
                                    control={control}
                                    render={({ field }) => (
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
                                            value={field.value || ""}
                                            onChange={(val) => {
                                                field.onChange(val);
                                                clearErrors("password");
                                            }}
                                            onBlur={field.onBlur}
                                            ref={field.ref}
                                        />
                                    )}
                                />

                                {/* Gender Select */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-slate-700">{UI_TEXT.staff.labelGender}</label>
                                    <Controller
                                        name="gender"
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                aria-label={UI_TEXT.staff.labelGender}
                                                selectedKey={field.value || null}
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
                                            aria-label={UI_TEXT.staff.labelRoles.replace(" *", "")}
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
                                <Controller
                                    name="systemIds"
                                    control={control}
                                    render={({ field }) => {
                                        const selectedValues = field.value || [];
                                        return (
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-sm font-semibold text-slate-700">{UI_TEXT.staff.labelSystems}</label>
                                                    {selectedValues.length > 0 && (
                                                        <span className="text-xs font-semibold text-wine">
                                                            {UI_TEXT.staff.selectedCountPrefix}
                                                            {selectedValues.length}
                                                            {UI_TEXT.staff.selectedCountSuffix}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Selected tags bar (1 horizontal scrollable row) */}
                                                {selectedValues.length > 0 && (
                                                    <div className="custom-scrollbar flex flex-nowrap items-center gap-1.5 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2">
                                                        {selectedValues.map((sysId: string) => {
                                                            const sysOpt = systemOptions.find((s) => s.id === sysId);
                                                            if (!sysOpt) return null;
                                                            return (
                                                                <div
                                                                    key={sysId}
                                                                    className="flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-slate-700"
                                                                >
                                                                    <span>{sysOpt.label}</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            field.onChange(selectedValues.filter((id: string) => id !== sysId));
                                                                        }}
                                                                        className="ml-0.5 rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-red-500"
                                                                    >
                                                                        <X className="size-3" />
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {/* Search & Always-visible Scrollable Checkbox List */}
                                                <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50">
                                                    {/* Search input */}
                                                    <div className="border-b border-slate-200 bg-white p-2">
                                                        <div className="relative flex items-center">
                                                            <Search className="absolute left-3 size-3.5 text-slate-400" />
                                                            <input
                                                                type="text"
                                                                placeholder={UI_TEXT.staff.searchSystemPlaceholder}
                                                                value={systemSearchTerm}
                                                                onChange={(e) => setSystemSearchTerm(e.target.value)}
                                                                className="w-full rounded-full border border-slate-200 bg-slate-50/50 py-1.5 pr-3 pl-8 text-xs text-slate-800 placeholder:text-slate-400 focus:border-wine focus:bg-white focus:outline-none"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Checkbox list */}
                                                    <div className="custom-scrollbar flex max-h-[160px] flex-col gap-1 overflow-y-auto p-2">
                                                        {filteredSystemOptions.length === 0 ? (
                                                            <p className="py-3 text-center text-xs text-slate-400">{UI_TEXT.staff.noSystemsFound}</p>
                                                        ) : (
                                                            filteredSystemOptions.map((opt) => {
                                                                const isChecked = selectedValues.includes(opt.id);
                                                                return (
                                                                    <label
                                                                        key={opt.id}
                                                                        className={`flex cursor-pointer items-start gap-2.5 rounded-xl p-2 transition ${
                                                                            isChecked ? "bg-wine/5 font-bold text-wine" : "text-slate-700 hover:bg-slate-100/70"
                                                                        }`}
                                                                    >
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isChecked}
                                                                            onChange={() => {
                                                                                const newValue = isChecked
                                                                                    ? selectedValues.filter((k: string) => k !== opt.id)
                                                                                    : [...selectedValues, opt.id];
                                                                                field.onChange(newValue);
                                                                            }}
                                                                            className="mt-0.5 size-4 rounded border-slate-300 accent-wine focus:ring-wine"
                                                                        />
                                                                        <span className="text-xs leading-tight">{opt.label}</span>
                                                                    </label>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }}
                                />
                                {errors.systemIds && <p className="text-xs font-medium text-red-500">{errors.systemIds.message}</p>}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex w-full items-center justify-center gap-3 rounded-b-[24px] border-t border-slate-100 bg-slate-50/60 p-4">
                            <Button type="button" color="secondary-gray" size="md" onClick={onClose} isDisabled={isPending} className="w-1/3 justify-center">
                                {UI_TEXT.staff.btnCancel}
                            </Button>
                            <Button
                                color="primary"
                                size="md"
                                type="submit"
                                isLoading={isPending}
                                className="w-2/3 justify-center border-none bg-wine font-bold text-white hover:bg-wine-deep"
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
