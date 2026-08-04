"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Heading } from "react-aria-components";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { type ClassSchemaType, classSchema } from "@/schemas/class.schema";
import { createClass, updateClass } from "@/services/class.service";
import { toast } from "@/services/toast.service";
import { type ClassModalProps, ClassTypeEnum } from "@/types/class.types";

export function ClassModal({ isOpen, onClose, classData }: ClassModalProps) {
    const queryClient = useQueryClient();

    const typeOptions = [
        { id: ClassTypeEnum.FULLTIME, label: UI_TEXT.classes.classTypeFulltime },
        { id: ClassTypeEnum.PARTTIME, label: UI_TEXT.classes.classTypeParttime },
        { id: ClassTypeEnum.ONLINE, label: UI_TEXT.classes.classTypeOnline },
    ];

    const {
        handleSubmit,
        control,
        reset,
        clearErrors,
        formState: { errors },
    } = useForm<ClassSchemaType>({
        resolver: zodResolver(classSchema),
        defaultValues: {
            name: "",
            classCode: "",
            type: ClassTypeEnum.FULLTIME,
        },
    });

    useEffect(() => {
        if (isOpen) {
            if (classData) {
                reset({
                    name: classData.name,
                    classCode: classData.classCode,
                    type: classData.type || ClassTypeEnum.FULLTIME,
                });
            } else {
                reset({
                    name: "",
                    classCode: "",
                    type: ClassTypeEnum.FULLTIME,
                });
            }
        }
    }, [isOpen, classData, reset]);

    const createMutation = useMutation({
        mutationFn: createClass,
        onSuccess: () => {
            toast.success(UI_TEXT.classes.toastSuccess, UI_TEXT.classes.toastCreateSuccess);
            queryClient.invalidateQueries({ queryKey: ["classes"] });
            onClose();
        },
        onError: (error: Error) => {
            toast.error(UI_TEXT.classes.toastError, error.message || UI_TEXT.classes.toastCreateError);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: ClassSchemaType }) => updateClass(id, data),
        onSuccess: () => {
            toast.success(UI_TEXT.classes.toastSuccess, UI_TEXT.classes.toastUpdateSuccess);
            queryClient.invalidateQueries({ queryKey: ["classes"] });
            onClose();
        },
        onError: (error: Error) => {
            toast.error(UI_TEXT.classes.toastError, error.message || UI_TEXT.classes.toastUpdateError);
        },
    });

    const onSubmit = (data: ClassSchemaType) => {
        if (classData) {
            updateMutation.mutate({ id: classData.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="max-w-xl !overflow-visible !rounded-[24px]">
                <Dialog className="flex max-h-[90vh] w-full flex-col rounded-[24px] bg-white shadow-2xl outline-none">
                    {/* Header */}
                    <div className="relative flex flex-col border-b border-slate-100 px-6 pt-6 pb-4">
                        <Heading slot="title" className="text-xl font-bold text-slate-900">
                            {classData ? UI_TEXT.classes.editClass : UI_TEXT.classes.addClass}
                        </Heading>
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute top-5 right-5 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            aria-label={UI_TEXT.common.close}
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Form Body */}
                    <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
                        <div className="custom-scrollbar flex flex-1 flex-col gap-5 overflow-y-auto p-6">
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <Controller
                                    name="classCode"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            label={UI_TEXT.classes.labelClassCodeRequired}
                                            placeholder={UI_TEXT.classes.placeholderClassCode}
                                            hint={errors.classCode?.message}
                                            isInvalid={!!errors.classCode}
                                            value={field.value || ""}
                                            onChange={(val) => {
                                                field.onChange(val);
                                                clearErrors("classCode");
                                            }}
                                            onBlur={field.onBlur}
                                            ref={field.ref}
                                        />
                                    )}
                                />

                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            label={UI_TEXT.classes.labelClassNameRequired}
                                            placeholder={UI_TEXT.classes.placeholderClassName}
                                            hint={errors.name?.message}
                                            isInvalid={!!errors.name}
                                            value={field.value || ""}
                                            onChange={(val) => {
                                                field.onChange(val);
                                                clearErrors("name");
                                            }}
                                            onBlur={field.onBlur}
                                            ref={field.ref}
                                        />
                                    )}
                                />
                            </div>

                            <Controller
                                name="type"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        label={UI_TEXT.classes.thType}
                                        placeholder={UI_TEXT.classes.placeholderSelectType}
                                        items={typeOptions}
                                        selectedKey={field.value || ""}
                                        onSelectionChange={(key) => {
                                            field.onChange(key);
                                            clearErrors("type");
                                        }}
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

                        {/* Footer */}
                        <div className="flex w-full items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
                            <Button
                                type="button"
                                color="secondary"
                                size="md"
                                onClick={onClose}
                                disabled={isPending}
                                className="w-1/3 justify-center rounded-full border-slate-200 py-2.5 text-xs font-bold"
                            >
                                {UI_TEXT.common.cancel}
                            </Button>
                            <Button
                                type="submit"
                                color="primary"
                                size="md"
                                isLoading={isPending}
                                className="w-2/3 justify-center rounded-full border-none bg-wine py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-wine-deep"
                            >
                                {UI_TEXT.common.save}
                            </Button>
                        </div>
                    </form>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
