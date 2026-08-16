"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit2, Layers, Loader2, Plus, Trash2, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Toggle } from "@/components/base/toggle/toggle";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { COURSE_CATEGORY_COLOR_PRESETS, COURSE_CATEGORY_NEUTRAL_COLOR } from "@/constants/colors.constants";
import { HTTP_STATUS_CONFLICT } from "@/constants/http.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { HttpError } from "@/lib/http-client";
import { type CourseCategoryFormValues, courseCategoryFormDefaultValues, courseCategorySchema } from "@/schemas/course-category.schema";
import { courseCategoryService } from "@/services/course-category.service";
import { toast } from "@/services/toast.service";
import type { CourseCategory, CourseCategoryManagerModalProps } from "@/types/course-category.types";

export function CourseCategoryManagerModal({ isOpen, onOpenChange }: CourseCategoryManagerModalProps) {
    const queryClient = useQueryClient();
    const t = UI_TEXT.courseCategories;

    const [view, setView] = useState<"list" | "form">("list");
    const [editingCategory, setEditingCategory] = useState<CourseCategory | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const isEdit = !!editingCategory;

    const { data: categories, isLoading } = useQuery({
        queryKey: ["course-categories"],
        queryFn: courseCategoryService.getAll,
        enabled: isOpen,
    });

    const {
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CourseCategoryFormValues>({
        resolver: zodResolver(courseCategorySchema),
        defaultValues: courseCategoryFormDefaultValues,
    });

    const colorValue = watch("color");

    useEffect(() => {
        if (!isOpen) {
            setView("list");
            setEditingCategory(null);
            setDeletingId(null);
            reset(courseCategoryFormDefaultValues);
        }
    }, [isOpen, reset]);

    const handleBackToList = () => {
        setView("list");
        setEditingCategory(null);
        reset(courseCategoryFormDefaultValues);
    };

    const handleOpenCreate = () => {
        setEditingCategory(null);
        reset(courseCategoryFormDefaultValues);
        setView("form");
    };

    const handleOpenEdit = (category: CourseCategory) => {
        setEditingCategory(category);
        reset({
            name: category.name,
            description: category.description || "",
            color: category.color || "",
            icon: category.icon || "",
            priority: category.priority ?? 0,
            isActive: category.isActive,
        });
        setView("form");
    };

    const invalidateAfterMutation = () => {
        queryClient.invalidateQueries({ queryKey: ["course-categories"] });
        queryClient.invalidateQueries({ queryKey: ["courses"] });
    };

    const createMutation = useMutation({
        mutationFn: (data: CourseCategoryFormValues) =>
            courseCategoryService.create({
                name: data.name.trim(),
                description: data.description?.trim() || undefined,
                color: data.color || undefined,
                icon: data.icon?.trim() || undefined,
                priority: data.priority,
                isActive: data.isActive,
            }),
        onSuccess: () => {
            invalidateAfterMutation();
            toast.success(t.toastCreateSuccessTitle, t.toastCreateSuccessDesc);
            handleBackToList();
        },
        onError: (error: unknown) => {
            const errMsg = error instanceof Error ? error.message : t.toastSaveErrorDesc;
            toast.error(t.toastErrorTitle, errMsg);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: CourseCategoryFormValues }) =>
            courseCategoryService.update(id, {
                name: data.name.trim(),
                description: data.description?.trim() || undefined,
                color: data.color || undefined,
                icon: data.icon?.trim() || undefined,
                priority: data.priority,
                isActive: data.isActive,
            }),
        onSuccess: () => {
            invalidateAfterMutation();
            toast.success(t.toastUpdateSuccessTitle, t.toastUpdateSuccessDesc);
            handleBackToList();
        },
        onError: (error: unknown) => {
            const errMsg = error instanceof Error ? error.message : t.toastSaveErrorDesc;
            toast.error(t.toastErrorTitle, errMsg);
        },
    });

    const onSubmit = (data: CourseCategoryFormValues) => {
        if (isEdit && editingCategory) {
            updateMutation.mutate({ id: editingCategory.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleDelete = async (category: CourseCategory) => {
        if (!confirm(t.confirmDeleteMessage)) return;
        try {
            setDeletingId(category.id);
            await courseCategoryService.remove(category.id);
            invalidateAfterMutation();
            toast.success(t.toastDeleteSuccessTitle, t.toastDeleteSuccessDesc);
        } catch (error: unknown) {
            if (error instanceof HttpError && error.status === HTTP_STATUS_CONFLICT) {
                toast.error(t.toastErrorTitle, error.message);
            } else {
                const errMsg = error instanceof Error ? error.message : t.toastDeleteErrorDesc;
                toast.error(t.toastErrorTitle, errMsg);
            }
        } finally {
            setDeletingId(null);
        }
    };

    const isSubmitting = createMutation.isPending || updateMutation.isPending;
    const sortedCategories = useMemo(() => [...(categories || [])].sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name)), [categories]);

    return (
        <CustomModal.Root open={isOpen} onOpenChange={onOpenChange}>
            <CustomModal.Content className={`w-full overflow-hidden !rounded-[24px] ${view === "form" ? "max-w-md" : "max-w-2xl"}`}>
                <Dialog className="flex max-h-[85vh] flex-col outline-none">
                    {view === "list" ? (
                        <>
                            <div className="relative flex items-center justify-between border-b border-slate-100 px-6 py-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-wine">
                                        <Layers className="size-5" />
                                    </div>
                                    <div>
                                        <Heading slot="title" className="text-lg font-bold text-slate-900">
                                            {t.modalTitle}
                                        </Heading>
                                        <p className="text-xs font-medium text-slate-500">{t.modalSubtitle}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 pr-8">
                                    <button
                                        type="button"
                                        onClick={handleOpenCreate}
                                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-wine px-4 py-2 text-xs font-extrabold text-white shadow-xs transition hover:bg-wine/90"
                                    >
                                        <Plus className="size-3.5" />
                                        <span>{t.createBtn}</span>
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onOpenChange(false)}
                                    className="absolute top-4.5 right-5 cursor-pointer rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>

                            <div className="custom-scrollbar max-h-[60vh] overflow-y-auto p-6">
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-2 py-10 text-xs font-bold text-slate-400">
                                        <Loader2 className="size-4 animate-spin" />
                                        <span>{t.loading}</span>
                                    </div>
                                ) : sortedCategories.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                                        <Layers className="size-8 opacity-40" />
                                        <p className="mt-2 text-xs font-medium">{t.emptyList}</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2.5">
                                        {sortedCategories.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-2xs transition hover:border-slate-300"
                                            >
                                                <div className="flex min-w-0 flex-1 items-center gap-3 pr-3">
                                                    <span
                                                        className="size-4 shrink-0 rounded-md border border-slate-200"
                                                        style={{ backgroundColor: item.color || COURSE_CATEGORY_NEUTRAL_COLOR }}
                                                    />
                                                    <div className="flex min-w-0 flex-col gap-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="text-sm font-black text-slate-900">{item.name}</span>
                                                            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-extrabold text-slate-700">
                                                                {t.thPriority}
                                                                {": "}
                                                                {item.priority}
                                                            </span>
                                                            {item.isActive ? (
                                                                <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                                                    {t.statusActive}
                                                                </span>
                                                            ) : (
                                                                <span className="rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">
                                                                    {t.statusInactive}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {item.description && (
                                                            <p className="line-clamp-1 text-xs font-medium text-slate-500">{item.description}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex shrink-0 items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEdit(item)}
                                                        className="cursor-pointer rounded-xl border border-slate-200 bg-white p-2 text-slate-500 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900"
                                                        title={t.editTooltip}
                                                    >
                                                        <Edit2 className="size-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(item)}
                                                        disabled={deletingId === item.id}
                                                        className="cursor-pointer rounded-xl border border-red-100 bg-red-50/50 p-2 text-red-500 shadow-2xs transition hover:bg-red-100 hover:text-red-700 disabled:opacity-50"
                                                        title={t.deleteTooltip}
                                                    >
                                                        {deletingId === item.id ? (
                                                            <Loader2 className="size-3.5 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="size-3.5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-wine">
                                        <Layers className="size-5" />
                                    </div>
                                    <div>
                                        <Heading slot="title" className="text-base font-extrabold text-slate-900">
                                            {isEdit ? t.editTitle : t.createTitle}
                                        </Heading>
                                        <p className="text-xs font-semibold text-slate-400">{t.modalSubtitle}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleBackToList}
                                    className="cursor-pointer rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="custom-scrollbar flex max-h-[70vh] flex-col gap-4 overflow-y-auto p-6">
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            label={
                                                <span>
                                                    {t.fieldName} <span className="font-bold text-red-500">{"*"}</span>
                                                </span>
                                            }
                                            placeholder={t.fieldNamePlaceholder}
                                            hint={errors.name?.message}
                                            isInvalid={!!errors.name}
                                            value={field.value || ""}
                                            onChange={field.onChange}
                                            onBlur={field.onBlur}
                                            ref={field.ref}
                                        />
                                    )}
                                />

                                <Controller
                                    name="description"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            label={t.fieldDescription}
                                            placeholder={t.fieldDescriptionPlaceholder}
                                            hint={errors.description?.message}
                                            isInvalid={!!errors.description}
                                            value={field.value || ""}
                                            onChange={field.onChange}
                                            onBlur={field.onBlur}
                                            ref={field.ref}
                                        />
                                    )}
                                />

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-extrabold text-slate-700">{t.fieldColor}</label>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {COURSE_CATEGORY_COLOR_PRESETS.map((preset) => (
                                            <button
                                                key={preset}
                                                type="button"
                                                onClick={() => setValue("color", preset, { shouldValidate: true })}
                                                className={`size-6 cursor-pointer rounded-full transition ${
                                                    colorValue?.toUpperCase() === preset.toUpperCase()
                                                        ? "ring-2 ring-slate-900 ring-offset-2"
                                                        : "ring-1 ring-slate-200 ring-offset-1"
                                                }`}
                                                style={{ backgroundColor: preset }}
                                                aria-label={preset}
                                            />
                                        ))}
                                    </div>
                                    <Controller
                                        name="color"
                                        control={control}
                                        render={({ field }) => (
                                            <Input
                                                label=""
                                                placeholder={t.fieldColorPlaceholder}
                                                hint={errors.color?.message}
                                                isInvalid={!!errors.color}
                                                value={field.value || ""}
                                                onChange={field.onChange}
                                                onBlur={field.onBlur}
                                                ref={field.ref}
                                            />
                                        )}
                                    />
                                </div>

                                <Controller
                                    name="icon"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            label={t.fieldIcon}
                                            hint={errors.icon?.message || t.fieldIconHint}
                                            isInvalid={!!errors.icon}
                                            value={field.value || ""}
                                            onChange={field.onChange}
                                            onBlur={field.onBlur}
                                            ref={field.ref}
                                        />
                                    )}
                                />

                                <Controller
                                    name="priority"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            type="number"
                                            min={0}
                                            label={t.fieldPriority}
                                            hint={errors.priority?.message}
                                            isInvalid={!!errors.priority}
                                            value={String(field.value ?? 0)}
                                            onChange={(val) => field.onChange(val === "" ? 0 : Number(val))}
                                            onBlur={field.onBlur}
                                            ref={field.ref}
                                        />
                                    )}
                                />

                                <Controller
                                    name="isActive"
                                    control={control}
                                    render={({ field }) => <Toggle isSelected={field.value} onChange={field.onChange} label={t.fieldIsActive} />}
                                />

                                <div className="mt-2 flex w-full items-center gap-3 border-t border-slate-100 pt-4">
                                    <Button
                                        type="button"
                                        color="secondary"
                                        onClick={handleBackToList}
                                        isDisabled={isSubmitting}
                                        className="w-1/3 rounded-full border-slate-200 px-5 font-bold text-slate-600 hover:bg-slate-100"
                                    >
                                        {UI_TEXT.common.cancel}
                                    </Button>
                                    <Button
                                        type="submit"
                                        color="primary"
                                        isLoading={isSubmitting}
                                        className="w-2/3 rounded-full border-none bg-wine px-6 font-bold text-white shadow-xs hover:bg-wine/90"
                                    >
                                        {UI_TEXT.common.save}
                                    </Button>
                                </div>
                            </form>
                        </>
                    )}
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
