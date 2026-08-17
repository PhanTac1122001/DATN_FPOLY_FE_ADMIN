"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Tag, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { MultiComboBox } from "@/components/base/select/multi-combobox";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { careerTagService } from "@/services/career-tag.service";
import { updateCourse } from "@/services/course.service";
import { toast } from "@/services/toast.service";
import type { CourseTagsPopoverProps } from "@/types/course-roadmap.types";

export function CourseTagsPopover({ course, isOpen, onOpenChange }: CourseTagsPopoverProps) {
    const queryClient = useQueryClient();
    const t = UI_TEXT.courseRoadmap;

    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

    const { data: tags = [] } = useQuery({
        queryKey: ["career-tags"],
        queryFn: careerTagService.getAll,
        enabled: isOpen,
    });

    useEffect(() => {
        if (isOpen && course) {
            setSelectedKeys(course.careerTagIds ?? []);
        }
    }, [isOpen, course]);

    const saveMutation = useMutation({
        mutationFn: (careerTagIds: string[]) => {
            if (!course) throw new Error(t.toastTagsErrorDesc);
            return updateCourse(course.id, { careerTagIds });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["courses"] });
            toast.success(t.toastTagsSuccessTitle, t.toastTagsSuccessDesc);
            onOpenChange(false);
        },
        onError: (error: unknown) => {
            const errMsg = error instanceof Error ? error.message : t.toastTagsErrorDesc;
            toast.error(t.toastTagsErrorTitle, errMsg);
        },
    });

    const tagItems = tags.map((tag) => ({ id: tag.id, label: tag.name }));

    return (
        <CustomModal.Root open={isOpen} onOpenChange={onOpenChange}>
            <CustomModal.Content className="w-full max-w-md overflow-visible !rounded-[24px]">
                <Dialog className="flex flex-col outline-none">
                    <div className="relative flex items-center justify-between border-b border-slate-100 px-6 py-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-wine">
                                <Tag className="size-5" />
                            </div>
                            <div>
                                <Heading slot="title" className="text-base font-extrabold text-slate-900">
                                    {t.tagsModalTitle}
                                </Heading>
                                <p className="line-clamp-1 text-xs font-medium text-slate-500">{course ? course.title : t.tagsModalSubtitle}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="cursor-pointer rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    <div className="flex flex-col gap-4 p-6">
                        <MultiComboBox
                            label={t.tagsModalTitle}
                            placeholder={t.tagsPlaceholder}
                            items={tagItems}
                            selectedKeys={selectedKeys}
                            onSelectionChange={setSelectedKeys}
                            size="md"
                        />

                        <div className="flex w-full items-center gap-3 border-t border-slate-100 pt-4">
                            <Button
                                type="button"
                                color="secondary"
                                onClick={() => onOpenChange(false)}
                                isDisabled={saveMutation.isPending}
                                className="w-1/3 rounded-full border-slate-200 px-5 font-bold text-slate-600 hover:bg-slate-100"
                            >
                                {UI_TEXT.common.cancel}
                            </Button>
                            <Button
                                type="button"
                                color="primary"
                                isLoading={saveMutation.isPending}
                                onClick={() => saveMutation.mutate(selectedKeys)}
                                className="w-2/3 rounded-full border-none bg-wine px-6 font-bold text-white shadow-xs hover:bg-wine/90"
                            >
                                {UI_TEXT.common.save}
                            </Button>
                        </div>
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
