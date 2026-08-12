/* eslint-disable no-restricted-syntax, @typescript-eslint/no-magic-numbers */
"use client";

import { useEffect, useState } from "react";
import { Check, CheckCircle2, Circle, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { TiptapEditor } from "@/components/base/editor";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { toast } from "@/services/toast.service";
import type { OptionMock, QuestionMock, QuestionModalProps } from "@/types/exam-set.types";
import { cx } from "@/utils/cx";

const defaultOptions = (): OptionMock[] => [
    { id: "o1", label: "A", text: "", isCorrect: true },
    { id: "o2", label: "B", text: "", isCorrect: false },
    { id: "o3", label: "C", text: "", isCorrect: false },
    { id: "o4", label: "D", text: "", isCorrect: false },
];

export function QuestionModal({ isOpen, onClose, onSave, question }: QuestionModalProps) {
    const [points, setPoints] = useState(10);
    const [explanation, setExplanation] = useState("");
    const [options, setOptions] = useState<OptionMock[]>(defaultOptions());
    const [isMulti, setIsMulti] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (question) {
                setPoints(question.points);
                setExplanation(question.explanation);

                // Ensure exactly 4 options
                const loadedOpts = [...question.options];
                while (loadedOpts.length < 4) {
                    const nextLabel = String.fromCharCode(65 + loadedOpts.length); // A, B, C, D
                    loadedOpts.push({
                        id: `o_new_${loadedOpts.length + 1}`,
                        label: nextLabel,
                        text: "",
                        isCorrect: false,
                    });
                }
                setOptions(loadedOpts);

                // Detect if it is multiple correct answers
                const correctCount = loadedOpts.filter((o) => o.isCorrect).length;
                setIsMulti(correctCount > 1);
            } else {
                setPoints(10);
                setExplanation("");
                setOptions(defaultOptions());
                setIsMulti(false);
            }
        }
    }, [isOpen, question]);

    const handleSelectCorrect = (index: number) => {
        setOptions((prev) => {
            const updated = prev.map((opt, i) => {
                if (isMulti) {
                    // Toggle correctness in multi-choice mode
                    return i === index ? { ...opt, isCorrect: !opt.isCorrect } : opt;
                } else {
                    // Single choice mode: only this one is correct
                    return { ...opt, isCorrect: i === index };
                }
            });
            return updated;
        });
    };

    const handleOptionTextChange = (index: number, val: string) => {
        setOptions((prev) => prev.map((opt, i) => (i === index ? { ...opt, text: val } : opt)));
    };

    const handleToggleMulti = (multi: boolean) => {
        setIsMulti(multi);
        if (!multi) {
            // Reverting to single choice mode: keep only the first correct option, others set to false
            setOptions((prev) => {
                let foundCorrect = false;
                return prev.map((opt) => {
                    if (opt.isCorrect) {
                        if (!foundCorrect) {
                            foundCorrect = true;
                            return opt;
                        }
                        return { ...opt, isCorrect: false };
                    }
                    return opt;
                });
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const plainText = explanation.replace(/<\/?[^>]+(>|$)/g, "").trim();
        if (!plainText) {
            toast.error(UI_TEXT.examsSetsEl.title, UI_TEXT.examsSetsEl.labelQuestionDesc);
            return;
        }

        const correctCount = options.filter((o) => o.isCorrect).length;
        if (correctCount === 0) {
            toast.error(UI_TEXT.examsSetsEl.title, UI_TEXT.examsSetsEl.labelAnswersList);
            return;
        }

        const questionText = plainText.length > 120 ? plainText.slice(0, 120) + "..." : plainText;

        const newQuestion: QuestionMock = {
            id: question?.id || `q_${Date.now()}`,
            text: questionText,
            explanation: explanation.trim(),
            points: Number(points) || 10,
            options: options.map((opt) => ({
                ...opt,
                text: opt.text.trim(),
            })),
        };

        onSave(newQuestion);
        toast.success(UI_TEXT.examsSetsEl.title, question ? UI_TEXT.examsSetsEl.toastQuestionUpdated : UI_TEXT.examsSetsEl.toastQuestionAdded);
        onClose();
    };

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="max-w-4xl !overflow-visible !rounded-[24px]">
                <Dialog className="flex max-h-[90vh] w-full flex-col rounded-[24px] bg-white shadow-2xl outline-none">
                    {/* Header */}
                    <div className="relative flex shrink-0 flex-col border-b border-slate-100 px-6 pt-6 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-full border border-rose-100 bg-rose-50/50">
                                <CheckCircle2 className="size-5 text-wine" />
                            </div>
                            <div className="flex flex-col">
                                <Heading slot="title" className="text-[16px] leading-snug font-extrabold text-slate-800">
                                    {question ? UI_TEXT.examsSetsEl.modalEditTitle : UI_TEXT.examsSetsEl.modalAddTitle}
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
                    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
                        <div className="custom-scrollbar flex flex-1 flex-col gap-5 overflow-y-auto p-6">
                            {/* Points Input Row */}
                            <div className="flex max-w-[200px] flex-col gap-1.5">
                                <label className="text-[12.5px] font-bold text-slate-700">{UI_TEXT.examsSetsEl.labelPoints}</label>
                                <input
                                    type="number"
                                    value={points}
                                    onChange={(e) => setPoints(Number(e.target.value))}
                                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-[13.5px] font-medium text-slate-800 focus:border-wine focus:ring-1 focus:ring-wine focus:outline-none"
                                    required
                                    min={1}
                                />
                            </div>

                            {/* Rich Editor Description */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12.5px] font-bold text-slate-700">{UI_TEXT.examsSetsEl.labelQuestionDesc}</label>
                                <TiptapEditor value={explanation} onChange={setExplanation} placeholder={UI_TEXT.examsSetsEl.placeholderQuestionDesc} />
                            </div>

                            {/* Answers List Section */}
                            <div className="flex flex-col gap-2.5">
                                <label className="text-[12.5px] font-bold text-slate-700">{UI_TEXT.examsSetsEl.labelAnswersList}</label>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {options.map((opt, index) => (
                                        <div
                                            key={opt.id}
                                            className={cx(
                                                "relative flex cursor-pointer flex-col gap-3.5 rounded-2xl border p-4.5 transition duration-150 focus-within:ring-1",
                                                opt.isCorrect
                                                    ? "border-emerald-500 bg-emerald-50/20 shadow-xs shadow-emerald-50 focus-within:border-emerald-500 focus-within:ring-emerald-500"
                                                    : "border-slate-200 bg-white focus-within:border-wine focus-within:ring-wine hover:border-slate-800",
                                            )}
                                            onClick={() => handleSelectCorrect(index)}
                                        >
                                            {/* Choice Card Header */}
                                            <div className="pointer-events-none flex items-center justify-between select-none">
                                                <div className="flex items-center gap-2">
                                                    <div className="relative flex items-center justify-center">
                                                        {opt.isCorrect ? (
                                                            <div
                                                                className={cx(
                                                                    "flex size-5 items-center justify-center bg-emerald-500 text-white",
                                                                    isMulti ? "rounded-md" : "rounded-full",
                                                                )}
                                                            >
                                                                <Check className="size-3.5 stroke-[3] text-white" />
                                                            </div>
                                                        ) : isMulti ? (
                                                            <div className="size-5 rounded-md border-2 border-slate-300 bg-white" />
                                                        ) : (
                                                            <Circle className="size-5 text-slate-400" />
                                                        )}
                                                    </div>
                                                </div>
                                                <span className={cx("text-xs font-bold", opt.isCorrect ? "text-emerald-700" : "text-slate-400")}>
                                                    {opt.isCorrect ? UI_TEXT.examsSetsEl.labelCorrect : UI_TEXT.examsSetsEl.labelIncorrect}
                                                </span>
                                            </div>

                                            {/* Choice Card Input */}
                                            <textarea
                                                rows={2}
                                                value={opt.text}
                                                onChange={(e) => handleOptionTextChange(index, e.target.value)}
                                                onClick={(e) => e.stopPropagation()} // Avoid triggering correct-selection click when typing
                                                placeholder={UI_TEXT.examsSetsEl.placeholderAnswer}
                                                className="w-full resize-none border-none bg-transparent p-0 text-[13px] leading-relaxed font-semibold text-slate-700 placeholder-slate-400 focus:outline-none"
                                                required
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer Controls & Actions */}
                        <div className="flex shrink-0 items-center justify-between border-t border-slate-100 bg-slate-50/20 px-6 py-4.5">
                            {/* Toggle switcher (Bottom Left) */}
                            <div className="flex items-center rounded-xl border border-slate-200/50 bg-slate-100/80 p-1">
                                <button
                                    type="button"
                                    onClick={() => handleToggleMulti(false)}
                                    className={cx(
                                        "rounded-lg px-4 py-2 text-xs font-bold whitespace-nowrap transition duration-150",
                                        !isMulti ? "bg-slate-700 text-white shadow-sm" : "text-slate-500 hover:text-slate-800",
                                    )}
                                >
                                    {UI_TEXT.examsSetsEl.btnSingleCorrect}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleToggleMulti(true)}
                                    className={cx(
                                        "rounded-lg px-4 py-2 text-xs font-bold whitespace-nowrap transition duration-150",
                                        isMulti ? "bg-slate-700 text-white shadow-sm" : "text-slate-500 hover:text-slate-800",
                                    )}
                                >
                                    {UI_TEXT.examsSetsEl.btnMultiCorrect}
                                </button>
                            </div>

                            {/* Cancel / Save actions (Bottom Right) */}
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                                >
                                    {UI_TEXT.examsSetsEl.btnCancel}
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-xl bg-wine px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-wine/10 transition hover:bg-wine-deep"
                                >
                                    {UI_TEXT.examsSetsEl.btnSave}
                                </button>
                            </div>
                        </div>
                    </form>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
