"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/base/buttons/button";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { BlockTypeEnum } from "@/constants/application.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { coursewareService } from "@/services/courseware.service";
import { toast } from "@/services/toast.service";
import { PracticeFormModalProps, SubmissionTypeEnum } from "@/types/courseware.types";
import { isValidUrl } from "@/utils/url.utils";
import { PracticeFormFields } from "../components/practice-form-fields";

export function PracticeFormModal({
    mode = "create",
    isOpen,
    onOpenChange,
    sessionId,
    courseId,
    sessionName,
    initialData,
    onSuccess,
    onBack,
}: PracticeFormModalProps) {
    const queryClient = useQueryClient();

    const [submitted, setSubmitted] = useState(false);
    const [practiceTitle, setPracticeTitle] = useState<string>("");
    const [submissionType, setSubmissionType] = useState<"LINK" | "FILE" | "TEXT">(SubmissionTypeEnum.LINK);
    const [content, setContent] = useState("");
    const [resources, setResources] = useState<{ label: string; url: string }[]>([]);

    useEffect(() => {
        if (isOpen) {
            setSubmitted(false);
            if (initialData) {
                setPracticeTitle(initialData.title || UI_TEXT.addLessonModal.defaultPracticeTitle);
                const payload = initialData.payload || {};
                setSubmissionType((payload.submissionType as "LINK" | "FILE" | "TEXT") || SubmissionTypeEnum.LINK);
                setContent((payload.content as string) || "");
                const rawRes = payload.resources as Array<{ label?: string; url?: string }> | undefined;
                setResources(rawRes ? rawRes.map((r) => ({ label: r.label || "", url: r.url || "" })) : []);
            } else {
                setPracticeTitle("");
                setSubmissionType(SubmissionTypeEnum.LINK);
                setContent("");
                setResources([]);
            }
        }
    }, [isOpen, initialData]);

    const saveMutation = useMutation({
        mutationFn: async () => {
            const cleanResources = resources.filter((r) => r.url.trim() !== "");
            const payload = {
                submissionType,
                content: content.trim(),
                resources: cleanResources,
            };

            if (mode === "edit" && initialData) {
                return coursewareService.updateBlock(initialData.id, {
                    title: practiceTitle.trim() || UI_TEXT.addLessonModal.defaultPracticeTitle,
                    isRequired: true,
                    payload,
                });
            } else {
                return coursewareService.createSessionBlock(sessionId, {
                    type: BlockTypeEnum.PRACTICE,
                    title: practiceTitle.trim() || UI_TEXT.addLessonModal.defaultPracticeTitle,
                    isRequired: true,
                    payload,
                    completionCriteria: {
                        requireSubmission: true,
                    },
                });
            }
        },
        onSuccess: () => {
            toast.success(
                UI_TEXT.courseClassModal.toastCreateSuccessTitle,
                mode === "edit" ? UI_TEXT.practiceEditor.toastUpdateSuccess : UI_TEXT.addLessonModal.toastPracticeSuccess,
            );
            queryClient.invalidateQueries({ queryKey: ["session-blocks", sessionId] });
            if (courseId) {
                queryClient.invalidateQueries({ queryKey: ["sessions", courseId] });
            }
            if (onSuccess) {
                onSuccess();
            }
            onOpenChange(false);
        },
        onError: () => {
            toast.error(
                UI_TEXT.courseClassModal.toastCreateErrorTitle,
                mode === "edit" ? UI_TEXT.addLessonModal.toastPracticeError : UI_TEXT.addLessonModal.toastPracticeError,
            );
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        const hasInvalidResource = resources.some((r) => r.url.trim() !== "" && !isValidUrl(r.url.trim()));
        if (!practiceTitle.trim() || !content.trim() || hasInvalidResource) return;
        saveMutation.mutate();
    };

    return (
        <CustomModal.Root open={isOpen} onOpenChange={onOpenChange}>
            <CustomModal.Content className="w-full max-w-3xl !rounded-[28px]">
                <Dialog className="custom-scrollbar relative flex max-h-[90vh] flex-col gap-6 overflow-y-auto rounded-[28px] bg-white p-7 shadow-2xl outline-none sm:p-8">
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="absolute top-5 right-5 z-10 cursor-pointer rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                        <X className="size-5" />
                    </button>

                    <form onSubmit={handleSubmit} className="animate-fadeIn flex flex-col gap-5">
                        {/* Shared Header */}
                        <div className="relative flex flex-col items-center gap-1 border-b border-slate-100 pb-5 text-center">
                            {onBack && (
                                <button
                                    type="button"
                                    onClick={onBack}
                                    className="absolute top-0 left-0 z-10 shrink-0 cursor-pointer rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                    title={UI_TEXT.addLessonModal.backTooltip}
                                >
                                    <ArrowLeft className="size-5" />
                                </button>
                            )}
                            <h3 className="text-xl font-extrabold text-slate-800">
                                {mode === "edit" ? UI_TEXT.practiceEditor.editModalTitle : UI_TEXT.addLessonModal.addPracticeTitle}
                            </h3>
                            <p className="mt-0.5 text-xs font-medium text-slate-400">
                                {UI_TEXT.addLessonModal.addPracticeSubPrefix}
                                <strong>{sessionName || "Session"}</strong>
                            </p>
                        </div>

                        {/* Shared Form Fields */}
                        <PracticeFormFields
                            practiceTitle={practiceTitle}
                            setPracticeTitle={setPracticeTitle}
                            submissionType={submissionType}
                            setSubmissionType={setSubmissionType}
                            content={content}
                            setContent={setContent}
                            resources={resources}
                            setResources={setResources}
                            submitted={submitted}
                        />

                        {/* Shared Footer Buttons */}
                        <div className="mt-2 flex w-full items-center gap-3 border-t border-slate-100 pt-4">
                            <button
                                type="button"
                                onClick={() => onOpenChange(false)}
                                className="w-1/3 cursor-pointer rounded-full border border-slate-200 bg-white py-2.5 text-center text-xs font-bold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
                            >
                                {UI_TEXT.addLessonModal.cancelBtn}
                            </button>
                            <Button
                                type="submit"
                                isLoading={saveMutation.isPending}
                                disabled={saveMutation.isPending}
                                className="hover:bg-wine-hover w-2/3 cursor-pointer rounded-full border-none bg-wine py-2.5 text-center text-xs font-black text-white shadow-sm transition active:scale-[0.98]"
                            >
                                {mode === "edit" ? UI_TEXT.practiceEditor.saveBtn : UI_TEXT.addLessonModal.addPracticeBtn}
                            </Button>
                        </div>
                    </form>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
