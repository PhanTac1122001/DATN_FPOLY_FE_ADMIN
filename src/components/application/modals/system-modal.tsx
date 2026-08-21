"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Plus, Trash2, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { type Control, Controller, type FieldErrors, type UseFormClearErrors, useFieldArray, useForm } from "react-hook-form";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { type SystemSchemaType, systemSchema } from "@/schemas/system.schema";
import {
    createSemester,
    createSpecialize,
    createSystem,
    deleteSemester,
    deleteSpecialize,
    getSemestersBySpecialize,
    getSpecializesList,
    updateSemester,
    updateSpecialize,
    updateSystem,
} from "@/services/system.service";
import { toast } from "@/services/toast.service";
import type { SystemModalProps } from "@/types/system.types";
import { cx } from "@/utils/cx";

export function SystemModal({ isOpen, onClose, system }: SystemModalProps) {
    const queryClient = useQueryClient();
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [initialData, setInitialData] = useState<{
        specializes: {
            id: string;
            name: string;
            semesters: { id: string; name: string }[];
        }[];
    } | null>(null);

    const {
        handleSubmit,
        control,
        reset,
        clearErrors,
        formState: { errors },
    } = useForm<SystemSchemaType>({
        resolver: zodResolver(systemSchema),
        defaultValues: {
            code: "",
            name: "",
            specializes: [],
        },
    });

    const {
        fields: specializeFields,
        append: appendSpecialize,
        remove: removeSpecialize,
    } = useFieldArray({
        control,
        name: "specializes",
    });

    useEffect(() => {
        const loadSystemDetails = async () => {
            if (!system || !isOpen) return;
            setIsLoadingDetails(true);
            try {
                // Fetch all specializes
                const allSpecs = await getSpecializesList();
                const filteredSpecs = allSpecs.filter((s) => s.systemId === system.id);

                // Fetch semesters for each specialize
                const specsWithSemesters = await Promise.all(
                    filteredSpecs.map(async (spec) => {
                        const sems = await getSemestersBySpecialize(spec.id);
                        return {
                            id: spec.id,
                            name: spec.name,
                            isSemestersVisible: true,
                            semesters: sems.map((sem) => ({
                                id: sem.id,
                                name: sem.name,
                            })),
                        };
                    }),
                );

                const data = {
                    code: system.systemCode,
                    name: system.name,
                    specializes: specsWithSemesters,
                };
                reset(data);
                setInitialData({ specializes: specsWithSemesters });
            } catch (error) {
                console.error("Failed to load system details:", error);
                toast.error(UI_TEXT.trainingSystem.toastError, UI_TEXT.trainingSystem.toastDetailsErrorDesc);
            } finally {
                setIsLoadingDetails(false);
            }
        };

        if (isOpen) {
            if (system) {
                loadSystemDetails();
            } else {
                reset({
                    code: "",
                    name: "",
                    specializes: [],
                });
                setInitialData(null);
            }
        }
    }, [isOpen, system, reset]);

    const createMutation = useMutation({
        mutationFn: async (data: SystemSchemaType) => {
            // 1. Create System
            const createdSystem = await createSystem({
                code: data.code,
                name: data.name,
            });

            // 2. Create nested specializations and semesters
            if (data.specializes && data.specializes.length > 0) {
                await Promise.all(
                    data.specializes.map(async (spec) => {
                        const createdSpec = await createSpecialize({
                            name: spec.name,
                            systemId: createdSystem.id,
                        });

                        if (spec.semesters && spec.semesters.length > 0) {
                            await Promise.all(
                                spec.semesters.map(async (sem, semIndex) => {
                                    await createSemester({
                                        name: sem.name,
                                        priority: semIndex,
                                        specializeId: createdSpec.id,
                                    });
                                }),
                            );
                        }
                    }),
                );
            }
            return createdSystem;
        },
        onSuccess: () => {
            toast.success(UI_TEXT.trainingSystem.toastSuccess, UI_TEXT.trainingSystem.toastAddSuccess);
            queryClient.invalidateQueries({ queryKey: ["systems"] });
            onClose();
        },
        onError: (error: Error) => {
            toast.error(UI_TEXT.trainingSystem.toastError, error.message || UI_TEXT.trainingSystem.toastAddError);
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: SystemSchemaType }) => {
            // 1. Update System
            const updatedSystem = await updateSystem(id, {
                code: data.code,
                name: data.name,
            });

            // 2. Sync Specializations
            const submittedSpecs = data.specializes || [];
            const initialSpecs = initialData?.specializes || [];

            // A. Deletions
            const specsToDelete = initialSpecs.filter((initSpec) => !submittedSpecs.some((subSpec) => subSpec.id === initSpec.id));

            await Promise.all(
                specsToDelete.map(async (spec) => {
                    // Delete all semesters under this specialization first
                    const semesters = await getSemestersBySpecialize(spec.id);
                    await Promise.all(semesters.map((sem) => deleteSemester(sem.id)));
                    // Then delete the specialization
                    await deleteSpecialize(spec.id);
                }),
            );

            // B. Additions and Updates
            await Promise.all(
                submittedSpecs.map(async (spec) => {
                    if (!spec.id) {
                        // Create new specialization
                        const createdSpec = await createSpecialize({
                            name: spec.name,
                            systemId: id,
                        });

                        // Create its semesters
                        if (spec.semesters && spec.semesters.length > 0) {
                            await Promise.all(
                                spec.semesters.map(async (sem, semIndex) => {
                                    await createSemester({
                                        name: sem.name,
                                        priority: semIndex,
                                        specializeId: createdSpec.id,
                                    });
                                }),
                            );
                        }
                    } else {
                        const specId = spec.id;
                        // Update specialization if name changed
                        const initialSpec = initialSpecs.find((s) => s.id === specId);
                        if (initialSpec && spec.name !== initialSpec.name) {
                            await updateSpecialize(specId, { name: spec.name });
                        }

                        // Sync Semesters for this specialization
                        const submittedSems = spec.semesters || [];
                        const initialSems = initialSpec?.semesters || [];

                        // Deletions
                        const semsToDelete = initialSems.filter((initSem) => !submittedSems.some((subSem) => subSem.id === initSem.id));
                        await Promise.all(semsToDelete.map((sem) => deleteSemester(sem.id)));

                        // Additions and Updates
                        await Promise.all(
                            submittedSems.map(async (sem, semIndex) => {
                                if (!sem.id) {
                                    await createSemester({
                                        name: sem.name,
                                        priority: semIndex,
                                        specializeId: specId,
                                    });
                                } else {
                                    const initialSem = initialSems.find((x) => x.id === sem.id);
                                    if (initialSem && sem.name !== initialSem.name) {
                                        await updateSemester(sem.id, { name: sem.name });
                                    }
                                }
                            }),
                        );
                    }
                }),
            );

            return updatedSystem;
        },
        onSuccess: () => {
            toast.success(UI_TEXT.trainingSystem.toastSuccess, UI_TEXT.trainingSystem.toastUpdateSuccess);
            queryClient.invalidateQueries({ queryKey: ["systems"] });
            onClose();
        },
        onError: (error: Error) => {
            toast.error(UI_TEXT.trainingSystem.toastError, error.message || UI_TEXT.trainingSystem.toastUpdateError);
        },
    });

    const onSubmit = (data: SystemSchemaType) => {
        if (system) {
            updateMutation.mutate({ id: system.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="w-full max-w-2xl !rounded-[24px]">
                <Dialog className="flex max-h-[90vh] w-full flex-col rounded-[24px] bg-white shadow-2xl outline-none">
                    {/* Header */}
                    <div className="relative flex flex-col border-b border-slate-100 px-6 pt-6 pb-4">
                        <Heading slot="title" className="text-xl font-bold text-slate-900">
                            {system ? UI_TEXT.trainingSystem.editTitle : UI_TEXT.trainingSystem.addTitle}
                        </Heading>
                        <p className="mt-1 text-xs text-slate-500">{system ? UI_TEXT.trainingSystem.editSubtitle : UI_TEXT.trainingSystem.addSubtitle}</p>
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute top-5 right-5 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            aria-label="Close"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Form Body */}
                    <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
                        {isLoadingDetails ? (
                            <div className="flex min-h-[300px] flex-1 flex-col items-center justify-center gap-4">
                                <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
                                <p className="text-sm font-semibold text-slate-500">{UI_TEXT.trainingSystem.loadingDetails}</p>
                            </div>
                        ) : (
                            <div className="custom-scrollbar flex flex-1 flex-col gap-5 overflow-y-auto p-6">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <Controller
                                        name="name"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                label={
                                                    <span>
                                                        {UI_TEXT.trainingSystem.labelName.replace(" *", "")}{" "}
                                                        <span className="font-bold text-red-500">{"*"}</span>
                                                    </span>
                                                }
                                                placeholder={UI_TEXT.trainingSystem.placeholderName}
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

                                    <Controller
                                        name="code"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                label={
                                                    <span>
                                                        {UI_TEXT.trainingSystem.labelCode.replace(" *", "")}{" "}
                                                        <span className="font-bold text-red-500">{"*"}</span>
                                                    </span>
                                                }
                                                placeholder={UI_TEXT.trainingSystem.placeholderCode}
                                                hint={errors.code?.message}
                                                isInvalid={!!errors.code}
                                                value={field.value || ""}
                                                onChange={(val) => {
                                                    field.onChange(val);
                                                    clearErrors("code");
                                                }}
                                                onBlur={field.onBlur}
                                                ref={field.ref}
                                            />
                                        )}
                                    />
                                </div>

                                <div className="flex flex-col gap-2.5">
                                    <div className="flex shrink-0 items-center justify-between">
                                        <span className="text-sm font-bold text-slate-700">{UI_TEXT.trainingSystem.labelMajorsAndSemesters}</span>
                                        <button
                                            type="button"
                                            onClick={() => appendSpecialize({ name: "", semesters: [] })}
                                            className="flex cursor-pointer items-center gap-1.5 text-xs font-bold text-blue-600 transition hover:text-blue-700"
                                        >
                                            <Plus className="size-4" />
                                            <span>{UI_TEXT.trainingSystem.btnAddMajor}</span>
                                        </button>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        {specializeFields.map((field, specIndex) => (
                                            <SpecializeCard
                                                key={field.id}
                                                specIndex={specIndex}
                                                control={control}
                                                errors={errors}
                                                clearErrors={clearErrors}
                                                removeSpecialize={removeSpecialize}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Footer Actions */}
                        <div className="grid w-full grid-cols-3 gap-3 rounded-b-[24px] border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                            <Button
                                type="button"
                                color="secondary"
                                onClick={onClose}
                                isDisabled={isPending}
                                className="col-span-1 justify-center rounded-full border-slate-200 font-semibold text-slate-700 hover:bg-slate-100"
                            >
                                {UI_TEXT.trainingSystem.btnCancel}
                            </Button>
                            <Button
                                type="submit"
                                color="primary"
                                isLoading={isPending}
                                className="col-span-2 justify-center rounded-full border-none bg-wine font-bold text-white shadow-md shadow-wine/10 hover:bg-wine-deep"
                            >
                                {system ? UI_TEXT.trainingSystem.btnUpdate : UI_TEXT.trainingSystem.btnSave}
                            </Button>
                        </div>
                    </form>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}

function SpecializeCard({
    specIndex,
    control,
    errors,
    clearErrors,
    removeSpecialize,
}: {
    specIndex: number;
    control: Control<SystemSchemaType>;
    errors: FieldErrors<SystemSchemaType>;
    clearErrors: UseFormClearErrors<SystemSchemaType>;
    removeSpecialize: (index: number) => void;
}) {
    const [isSemestersVisible, setIsSemestersVisible] = useState(true);

    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50/10 p-4.5">
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">{`${UI_TEXT.trainingSystem.labelMajorIndexPrefix} ${specIndex + 1}`}</span>
                <button
                    type="button"
                    onClick={() => setIsSemestersVisible(!isSemestersVisible)}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                    <span>{isSemestersVisible ? UI_TEXT.trainingSystem.btnHideSemesters : UI_TEXT.trainingSystem.btnShowSemesters}</span>
                    <ChevronDown className={cx("size-3.5 transition-transform", isSemestersVisible && "rotate-180")} />
                </button>
            </div>

            {/* Input name and delete major */}
            <div className="flex items-center gap-2">
                <Controller
                    name={`specializes.${specIndex}.name`}
                    control={control}
                    render={({ field }) => (
                        <Input
                            label=""
                            placeholder={UI_TEXT.trainingSystem.placeholderMajorName}
                            hint={errors.specializes?.[specIndex]?.name?.message}
                            isInvalid={!!errors.specializes?.[specIndex]?.name}
                            value={field.value || ""}
                            onChange={(val) => {
                                field.onChange(val);
                                clearErrors(`specializes.${specIndex}.name`);
                            }}
                            onBlur={field.onBlur}
                            ref={field.ref}
                            className="flex-1"
                        />
                    )}
                />
                <button
                    type="button"
                    onClick={() => removeSpecialize(specIndex)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-100 bg-white p-2 text-red-500 transition hover:border-red-200 hover:bg-red-50"
                    title={UI_TEXT.trainingSystem.deleteMajorTooltip}
                >
                    <Trash2 className="size-4" />
                </button>
            </div>

            {/* Semesters list */}
            {isSemestersVisible && <NestedSemesters specIndex={specIndex} control={control} errors={errors} clearErrors={clearErrors} />}
        </div>
    );
}

function NestedSemesters({
    specIndex,
    control,
    errors,
    clearErrors,
}: {
    specIndex: number;
    control: Control<SystemSchemaType>;
    errors: FieldErrors<SystemSchemaType>;
    clearErrors: UseFormClearErrors<SystemSchemaType>;
}) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `specializes.${specIndex}.semesters`,
    });

    return (
        <div className="flex flex-col gap-3">
            {fields.map((field, semIndex) => (
                <div key={field.id} className="ml-4 flex items-center gap-2 border-l border-slate-200 pl-4">
                    <Controller
                        name={`specializes.${specIndex}.semesters.${semIndex}.name`}
                        control={control}
                        render={({ field: semField }) => (
                            <Input
                                label=""
                                placeholder={UI_TEXT.trainingSystem.placeholderSemesterName}
                                hint={errors.specializes?.[specIndex]?.semesters?.[semIndex]?.name?.message}
                                isInvalid={!!errors.specializes?.[specIndex]?.semesters?.[semIndex]?.name}
                                value={semField.value || ""}
                                onChange={(val) => {
                                    semField.onChange(val);
                                    clearErrors(`specializes.${specIndex}.semesters.${semIndex}.name`);
                                }}
                                onBlur={semField.onBlur}
                                ref={semField.ref}
                                className="flex-1"
                            />
                        )}
                    />
                    <button
                        type="button"
                        onClick={() => remove(semIndex)}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-100 bg-white p-2 text-red-500 transition hover:border-red-200 hover:bg-red-50"
                        title={UI_TEXT.trainingSystem.deleteSemesterTooltip}
                    >
                        <Trash2 className="size-4" />
                    </button>
                </div>
            ))}
            <button
                type="button"
                onClick={() => append({ name: "" })}
                className="ml-8 flex w-fit items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
                <Plus className="size-3.5 text-slate-500" />
                <span>{UI_TEXT.trainingSystem.btnAddSemester}</span>
            </button>
        </div>
    );
}
