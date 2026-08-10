"use client";

import { useState } from "react";
import { HelpCircle, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { DEFAULT_PASS_THRESHOLD } from "@/constants/quiz.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { createQuiz } from "@/services/quiz.service";
import { toast } from "@/services/toast.service";
import type { CreateQuizModalProps } from "@/types/quiz.types";

export function CreateQuizModal({ isOpen, onClose, onSuccess }: CreateQuizModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [passThreshold, setPassThreshold] = useState<number>(DEFAULT_PASS_THRESHOLD);
    const [courseId, setCourseId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error(UI_TEXT.examsSetsEl.title, UI_TEXT.examsSetsEl.toastEnterTitle);
            return;
        }

        try {
            setIsSubmitting(true);
            const created = await createQuiz({
                title: title.trim(),
                description: description.trim() || undefined,
                passThreshold: Number(passThreshold) || DEFAULT_PASS_THRESHOLD,
                courseId: courseId.trim() || undefined,
                questions: [],
            });

            toast.success(UI_TEXT.examsSetsEl.title, UI_TEXT.examsSetsEl.toastCreateSuccess);
            onSuccess(created);
            onClose();
            // Reset state
            setTitle("");
            setDescription("");
            setPassThreshold(DEFAULT_PASS_THRESHOLD);
            setCourseId("");
        } catch (error) {
            console.error("Create quiz error:", error);
            toast.error(UI_TEXT.examsSetsEl.title, UI_TEXT.examsSetsEl.toastCreateError);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="max-w-xl !rounded-[24px]">
                <Dialog className="flex flex-col rounded-[24px] bg-white shadow-2xl outline-none">
                    {/* Header */}
                    <div className="relative flex shrink-0 flex-col border-b border-slate-100 px-6 pt-6 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-full border border-rose-100 bg-rose-50/50">
                                <HelpCircle className="size-5 text-wine" />
                            </div>
                            <div className="flex flex-col">
                                <Heading slot="title" className="text-[16px] leading-snug font-extrabold text-slate-800">
                                    {UI_TEXT.examsSetsEl.createModalTitle}
                                </Heading>
                            </div>
                        </div>
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
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
                        {/* Title Input */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[12.5px] font-bold text-slate-700">
                                {UI_TEXT.examsSetsEl.labelName} <span className="text-rose-500">{UI_TEXT.examsSetsEl.asterisk}</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={UI_TEXT.examsSetsEl.placeholderName}
                                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-[13.5px] font-medium text-slate-800 focus:border-wine focus:ring-1 focus:ring-wine focus:outline-none"
                                required
                            />
                        </div>

                        {/* Description Input */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[12.5px] font-bold text-slate-700">{UI_TEXT.examsSetsEl.labelDesc}</label>
                            <textarea
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={UI_TEXT.examsSetsEl.placeholderDesc}
                                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-[13.5px] font-medium text-slate-800 focus:border-wine focus:ring-1 focus:ring-wine focus:outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {/* Pass Threshold */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12.5px] font-bold text-slate-700">{UI_TEXT.examsSetsEl.labelPassThreshold}</label>
                                <input
                                    type="number"
                                    value={passThreshold}
                                    onChange={(e) => setPassThreshold(Number(e.target.value))}
                                    min={0}
                                    max={100}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-[13.5px] font-medium text-slate-800 focus:border-wine focus:ring-1 focus:ring-wine focus:outline-none"
                                />
                            </div>

                            {/* Course ID (Optional) */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12.5px] font-bold text-slate-700">{UI_TEXT.examsSetsEl.labelCourseIdOptional}</label>
                                <input
                                    type="text"
                                    value={courseId}
                                    onChange={(e) => setCourseId(e.target.value)}
                                    placeholder={UI_TEXT.examsSetsEl.placeholderCourseId}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-[13.5px] font-medium text-slate-800 focus:border-wine focus:ring-1 focus:ring-wine focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Footer Controls */}
                        <div className="mt-4 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                            >
                                {UI_TEXT.common.cancel}
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="rounded-xl bg-wine px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-wine/10 transition hover:bg-wine-deep disabled:opacity-50"
                            >
                                {isSubmitting ? UI_TEXT.examsSetsEl.submitting : UI_TEXT.examsSetsEl.btnCreateQuiz}
                            </button>
                        </div>
                    </form>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
