"use client";

import { useEffect, useState } from "react";
import { FileText, Video, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { createLearningResource, updateLearningResource } from "@/services/learning-resource.service";
import { toast } from "@/services/toast.service";
import type { CreateEditResourceModalProps } from "@/types/learning-resource.types";

export function CreateEditResourceModal({ isOpen, classId, courseId, sessionId, resourceToEdit, onClose, onSuccess }: CreateEditResourceModalProps) {
    const isEdit = Boolean(resourceToEdit);
    const [videoUrl, setVideoUrl] = useState("");
    const [documentUrl, setDocumentUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (resourceToEdit) {
            setVideoUrl(resourceToEdit.videoUrl || "");
            setDocumentUrl(resourceToEdit.documentUrl || "");
        } else {
            setVideoUrl("");
            setDocumentUrl("");
        }
    }, [resourceToEdit, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!courseId || !sessionId) {
            toast.error(UI_TEXT.classResourcesModal.selectCourseSessionFirst);
            return;
        }
        if (!videoUrl.trim() && !documentUrl.trim()) {
            toast.error(UI_TEXT.classResourcesModal.enterAtLeastOneLink);
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = {
                courseId,
                sessionId,
                videoUrl: videoUrl.trim(),
                documentUrl: documentUrl.trim(),
            };

            if (isEdit && resourceToEdit) {
                await updateLearningResource(resourceToEdit._id, payload);
                toast.success(UI_TEXT.classResourcesModal.updateSuccess);
            } else {
                await createLearningResource(classId, payload);
                toast.success(UI_TEXT.classResourcesModal.createSuccess);
            }
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : UI_TEXT.classResourcesModal.genericError;
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="max-w-lg !overflow-visible !rounded-[24px]">
                <Dialog className="flex w-full flex-col rounded-[24px] bg-white shadow-2xl outline-none">
                    {/* Header */}
                    <div className="relative flex flex-col border-b border-slate-100 px-6 pt-6 pb-4">
                        <Heading slot="title" className="text-xl font-bold text-slate-900">
                            {isEdit ? UI_TEXT.classResourcesModal.editResourceTitle : UI_TEXT.classResourcesModal.createResourceTitle}
                        </Heading>
                        <p className="mt-1 text-xs text-slate-500">
                            {isEdit ? UI_TEXT.classResourcesModal.editSubtitle : UI_TEXT.classResourcesModal.createSubtitle}
                        </p>
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
                    <form onSubmit={handleSubmit} className="flex flex-col">
                        <div className="flex flex-col gap-5 p-6">
                            {/* Input 1: Video Record URL */}
                            <Input
                                label={
                                    <span className="flex w-full items-center justify-between gap-1.5 text-xs font-bold text-slate-700">
                                        <span className="flex items-center gap-1.5">
                                            <Video className="size-4 text-amber-600" />
                                            <span>{UI_TEXT.classResourcesModal.videoRecordLabel}</span>
                                        </span>
                                        <span className="text-[11px] font-normal text-slate-400">{UI_TEXT.classResourcesModal.optionalTag}</span>
                                    </span>
                                }
                                placeholder={UI_TEXT.classResourcesModal.videoPlaceholder}
                                type="url"
                                size="md"
                                value={videoUrl}
                                onChange={(val) => setVideoUrl(val)}
                            />

                            {/* Input 2: Document / Slide URL */}
                            <Input
                                label={
                                    <span className="flex w-full items-center justify-between gap-1.5 text-xs font-bold text-slate-700">
                                        <span className="flex items-center gap-1.5">
                                            <FileText className="size-4 text-blue-600" />
                                            <span>{UI_TEXT.classResourcesModal.docSlideLabel}</span>
                                        </span>
                                        <span className="text-[11px] font-normal text-slate-400">{UI_TEXT.classResourcesModal.optionalTag}</span>
                                    </span>
                                }
                                placeholder={UI_TEXT.classResourcesModal.docPlaceholder}
                                type="url"
                                size="md"
                                value={documentUrl}
                                onChange={(val) => setDocumentUrl(val)}
                            />
                        </div>

                        {/* Footer */}
                        <div className="flex w-full items-center justify-center gap-3 rounded-b-[24px] border-t border-slate-100 bg-slate-50/60 p-4">
                            <Button type="button" color="secondary-gray" size="md" onClick={onClose} isDisabled={isSubmitting} className="w-1/3 justify-center">
                                {UI_TEXT.classResourcesModal.btnCancel}
                            </Button>
                            <Button
                                color="primary"
                                size="md"
                                type="submit"
                                isLoading={isSubmitting}
                                className="w-2/3 justify-center border-none bg-wine font-bold text-white hover:bg-wine-deep"
                            >
                                {isEdit ? UI_TEXT.classResourcesModal.btnSaveEdit : UI_TEXT.classResourcesModal.btnSaveCreate}
                            </Button>
                        </div>
                    </form>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
