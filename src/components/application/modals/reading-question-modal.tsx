"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { TiptapEditor } from "@/components/base/editor";
import { CustomModal } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import type { ReadingQuestion, ReadingQuestionModalProps } from "@/types/material.types";

export function ReadingQuestionModal({ isOpen, onClose, onSave, question }: ReadingQuestionModalProps) {
    const [content, setContent] = useState("");
    const [answer, setAnswer] = useState("");

    useEffect(() => {
        if (isOpen) {
            if (question) {
                const qObj = question as unknown as Record<string, unknown>;
                setContent(question.content || (qObj.question as string) || (qObj.title as string) || (qObj.text as string) || "");
                setAnswer(question.answer || (qObj.answerText as string) || (qObj.solution as string) || "");
            } else {
                setContent("");
                setAnswer("");
            }
        }
    }, [isOpen, question]);

    const handleConfirm = () => {
        const trimmedContent = content.trim();
        const trimmedAnswer = answer.trim();
        onSave({
            id: question?.id,
            content: trimmedContent,
            answer: trimmedAnswer,
            ...(trimmedContent ? { question: trimmedContent } : {}),
        } as ReadingQuestion);
        onClose();
    };

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
            <CustomModal.Content className="flex max-h-[90vh] w-full max-w-2xl flex-col gap-5 overflow-hidden !rounded-[24px] p-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-base font-extrabold text-slate-800">
                        {question ? UI_TEXT.readingQuestionModal.editTitle : UI_TEXT.readingQuestionModal.addTitle}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                {/* Form Fields */}
                <div className="custom-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto pr-1">
                    {/* Question Content Field */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-800">{UI_TEXT.readingQuestionModal.questionLabel}</label>
                        <TiptapEditor
                            value={content}
                            onChange={setContent}
                            placeholder={UI_TEXT.readingQuestionModal.placeholder}
                            className="w-full rounded-xl border border-slate-200 bg-white shadow-xs"
                        />
                    </div>

                    {/* Answer Field */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-800">{UI_TEXT.readingQuestionModal.answerLabel}</label>
                        <TiptapEditor
                            value={answer}
                            onChange={setAnswer}
                            placeholder={UI_TEXT.readingQuestionModal.placeholder}
                            className="w-full rounded-xl border border-slate-200 bg-white shadow-xs"
                        />
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50 active:scale-[0.98]"
                    >
                        {UI_TEXT.readingQuestionModal.cancelBtn}
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        className="cursor-pointer rounded-xl bg-blue-600 px-6 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-700 active:scale-[0.98]"
                    >
                        {UI_TEXT.readingQuestionModal.confirmBtn}
                    </button>
                </div>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
