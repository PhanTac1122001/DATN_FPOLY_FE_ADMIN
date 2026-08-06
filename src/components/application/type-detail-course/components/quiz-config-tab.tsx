"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookText, CheckCircle2, CheckSquare, ChevronDown, ChevronRight, Circle, Plus, Trash2 } from "lucide-react";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { getQuizDetails, updateQuiz } from "@/services/material.service";
import { toast } from "@/services/toast.service";
import { QuestionTypeEnum, type QuizConfigTabProps, type QuizOptionItem, type QuizQuestion as QuizQuestionItem } from "@/types/courseware.types";
import { SelectQuizModal } from "../modals/select-quiz-modal";

const maxQuizOptionsLimit = 6;
const minQuizOptionsLimit = 2;

export function QuizConfigTab({
    quizId,
    setQuizId,
    quizzes,
    onDelete: _onDelete,
    onQuestionsDirtyChange,
    onRegisterSave,
    onRegisterOpenModal,
}: QuizConfigTabProps) {
    const queryClient = useQueryClient();
    const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
    const [tempQuizId, setTempQuizId] = useState(quizId);
    const [modalSearchTerm, setModalSearchTerm] = useState("");
    const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);
    const [localQuestions, setLocalQuestions] = useState<QuizQuestionItem[]>([]);

    const selectedQuiz = quizzes.find((q) => q.id === quizId);

    const { data: quizDetails, isLoading: isLoadingQuiz } = useQuery({
        queryKey: ["quiz-details", quizId],
        queryFn: () => getQuizDetails(quizId),
        enabled: !!quizId,
    });

    const normalizeQuestions = (qs: QuizQuestionItem[]) =>
        (qs || []).map((q) => ({
            content: q.content || "",
            type: q.type || QuestionTypeEnum.SINGLE_CHOICE,
            points: Number(q.points || 1),
            options: (q.options || []).map((o) => ({
                content: o.content || "",
                isCorrect: !!o.isCorrect,
            })),
        }));

    const [initialQuestionsStr, setInitialQuestionsStr] = useState<string | null>(null);

    useEffect(() => {
        setTempQuizId(quizId);
    }, [quizId]);

    useEffect(() => {
        if (quizDetails) {
            const normalized = normalizeQuestions(quizDetails.questions || []);
            setLocalQuestions(JSON.parse(JSON.stringify(normalized)));
            setInitialQuestionsStr(JSON.stringify(normalized));
        } else {
            setLocalQuestions([]);
            setInitialQuestionsStr(null);
        }
    }, [quizDetails]);

    const isDirty = initialQuestionsStr !== null && JSON.stringify(normalizeQuestions(localQuestions)) !== initialQuestionsStr;

    const saveQuizMutation = useMutation({
        mutationFn: (updatedQuestions: QuizQuestionItem[]) => updateQuiz(quizId, { questions: updatedQuestions }),
        onSuccess: () => {
            toast.success(UI_TEXT.courseClassModal.toastCreateSuccessTitle, UI_TEXT.quizConfigTab.toastSaveSuccess);
            queryClient.invalidateQueries({ queryKey: ["quiz-details", quizId] });
        },
        onError: () => {
            toast.error(UI_TEXT.courseClassModal.toastCreateErrorTitle, UI_TEXT.quizConfigTab.toastSaveError);
        },
    });

    useEffect(() => {
        if (onQuestionsDirtyChange) {
            onQuestionsDirtyChange(isDirty);
        }
    }, [isDirty, onQuestionsDirtyChange]);

    useEffect(() => {
        if (onRegisterOpenModal) {
            onRegisterOpenModal(() => {
                setTempQuizId(quizId);
                setModalSearchTerm("");
                setIsSelectModalOpen(true);
            });
        }
    }, [onRegisterOpenModal, quizId]);

    useEffect(() => {
        if (onRegisterSave) {
            onRegisterSave(async () => {
                const updated = normalizeQuestions(localQuestions);
                await saveQuizMutation.mutateAsync(updated);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onRegisterSave, localQuestions]);

    const toggleQuestion = (idx: number) => {
        setExpandedQuestions((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]));
    };

    const handleQuestionContentChange = (qIdx: number, val: string) => {
        setLocalQuestions((prev) => {
            const next = [...prev];
            next[qIdx] = { ...next[qIdx], content: val };
            return next;
        });
    };

    const handleQuestionTypeChange = (qIdx: number, val: QuestionTypeEnum) => {
        setLocalQuestions((prev) => {
            const next = [...prev];
            const currentQ = next[qIdx];
            if (val === QuestionTypeEnum.SINGLE_CHOICE) {
                // Keep only first correct option
                let foundCorrect = false;
                const newOptions = (currentQ.options || []).map((opt) => {
                    if (opt.isCorrect && !foundCorrect) {
                        foundCorrect = true;
                        return opt;
                    }
                    return { ...opt, isCorrect: false };
                });
                if (!foundCorrect && newOptions.length > 0) {
                    newOptions[0].isCorrect = true;
                }
                next[qIdx] = { ...currentQ, type: val, options: newOptions };
            } else {
                next[qIdx] = { ...currentQ, type: val };
            }
            return next;
        });
    };

    const handleQuestionPointsChange = (qIdx: number, val: number) => {
        setLocalQuestions((prev) => {
            const next = [...prev];
            next[qIdx] = { ...next[qIdx], points: val };
            return next;
        });
    };

    const handleOptionContentChange = (qIdx: number, optIdx: number, val: string) => {
        setLocalQuestions((prev) => {
            const next = [...prev];
            const currentQ = next[qIdx];
            const newOpts = [...(currentQ.options || [])];
            newOpts[optIdx] = { ...newOpts[optIdx], content: val };
            next[qIdx] = { ...currentQ, options: newOpts };
            return next;
        });
    };

    const handleOptionToggleCorrect = (qIdx: number, optIdx: number) => {
        setLocalQuestions((prev) => {
            const next = [...prev];
            const currentQ = next[qIdx];
            const isSingle = currentQ.type === QuestionTypeEnum.SINGLE_CHOICE || !currentQ.type;
            const newOpts = (currentQ.options || []).map((opt, i) => {
                if (isSingle) {
                    return { ...opt, isCorrect: i === optIdx };
                } else {
                    if (i === optIdx) {
                        return { ...opt, isCorrect: !opt.isCorrect };
                    }
                    return opt;
                }
            });
            next[qIdx] = { ...currentQ, options: newOpts };
            return next;
        });
    };

    const handleAddOption = (qIdx: number) => {
        setLocalQuestions((prev) => {
            const next = [...prev];
            const currentQ = next[qIdx];
            const newOpts = [...(currentQ.options || []), { content: "", isCorrect: false }];
            next[qIdx] = { ...currentQ, options: newOpts };
            return next;
        });
    };

    const handleRemoveOption = (qIdx: number, optIdx: number) => {
        setLocalQuestions((prev) => {
            const next = [...prev];
            const currentQ = next[qIdx];
            const newOpts = (currentQ.options || []).filter((_, i) => i !== optIdx);
            next[qIdx] = { ...currentQ, options: newOpts };
            return next;
        });
    };

    const handleAddQuestion = () => {
        setLocalQuestions((prev) => {
            const newQ: QuizQuestionItem = {
                content: "",
                type: QuestionTypeEnum.SINGLE_CHOICE,
                points: 1,
                options: [
                    { content: "", isCorrect: true },
                    { content: "", isCorrect: false },
                ],
            };
            const next = [...prev, newQ];
            setExpandedQuestions((exp) => [...exp, next.length - 1]);
            return next;
        });
    };

    const handleRemoveQuestion = (qIdx: number) => {
        setLocalQuestions((prev) => prev.filter((_, i) => i !== qIdx));
        setExpandedQuestions((prev) => prev.filter((i) => i !== qIdx).map((i) => (i > qIdx ? i - 1 : i)));
    };

    return (
        <div className="flex h-full min-h-0 flex-1 flex-col justify-between gap-4">
            <div className="flex flex-col gap-3">
                {quizId !== "" && selectedQuiz ? (
                    <div className="flex flex-col gap-3">
                        <div className="border-b border-slate-100 pb-3">
                            <label className="text-sm font-medium text-slate-500">{UI_TEXT.learningMaterials.linkedQuizLabel}</label>
                        </div>
                        <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 shadow-xs">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-wine/10 text-wine">
                                <BookText className="size-5" />
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                <h4 className="truncate text-sm font-bold text-slate-900">
                                    {String((selectedQuiz as Record<string, unknown>).title || (selectedQuiz as Record<string, unknown>).name || "")}
                                </h4>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-medium text-slate-400">
                                        {String(
                                            (selectedQuiz as Record<string, unknown>).questionsCount ||
                                            ((selectedQuiz as Record<string, unknown>).questions as unknown[])?.length ||
                                            0,
                                        )}{" "}
                                        {UI_TEXT.learningMaterials.questionsCountLabel}
                                    </span>
                                    <span className="text-slate-300">{"•"}</span>
                                    <span className="text-xs font-medium text-slate-400">{UI_TEXT.learningMaterials.linkedQuizSub}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Centered Empty State View for Quiz */
                    <div className="animate-fadeIn flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/30 p-8 py-14 text-center">
                        <div className="flex size-16 items-center justify-center rounded-full border-2 border-dashed border-slate-200 bg-white text-slate-400">
                            <BookText className="size-6 text-slate-400" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h4 className="text-sm font-black text-slate-800">{UI_TEXT.learningMaterials.emptyQuizTitle}</h4>
                            <p className="max-w-[320px] text-xs leading-relaxed font-medium text-slate-400">{UI_TEXT.learningMaterials.emptyQuizDesc}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setTempQuizId("");
                                setModalSearchTerm("");
                                setIsSelectModalOpen(true);
                            }}
                            className="hover:bg-wine-hover flex cursor-pointer items-center gap-1.5 rounded-xl bg-wine px-6 py-2 text-xs font-black text-white transition duration-150 active:scale-[0.98]"
                        >
                            {UI_TEXT.learningMaterials.addQuizButton}
                        </button>
                    </div>
                )}
            </div>

            {quizId !== "" && (
                <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4">
                    <div className="mb-3 flex items-center justify-between">
                        <label className="text-sm font-bold text-slate-700">{UI_TEXT.quizConfigTab.questionDetailTitle}</label>
                        {quizDetails?.questions && (
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                                {localQuestions.length}{" "}
                                {UI_TEXT.quizConfigTab.questionsCountSuffix}
                            </span>
                        )}
                    </div>

                    {isLoadingQuiz ? (
                        <div className="flex justify-center py-6">
                            <div className="size-5 animate-spin rounded-full border-2 border-slate-200 border-t-wine" />
                        </div>
                    ) : localQuestions.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {localQuestions.map((q, idx) => {
                                const isExpanded = expandedQuestions.includes(idx);
                                const displayType =
                                    q.type === QuestionTypeEnum.SINGLE_CHOICE
                                        ? UI_TEXT.quizConfigTab.singleChoiceDisplay
                                        : UI_TEXT.quizConfigTab.multipleChoiceDisplay;

                                return (
                                    <div
                                        key={idx}
                                        className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xs transition-all duration-150"
                                    >
                                        {/* Header */}
                                        <div
                                            onClick={() => toggleQuestion(idx)}
                                            className="flex cursor-pointer items-center justify-between bg-slate-50/50 p-3.5 transition duration-150 select-none hover:bg-slate-50"
                                        >
                                            <div className="flex min-w-0 flex-1 items-center gap-2">
                                                {isExpanded ? (
                                                    <ChevronDown className="size-4 shrink-0 text-slate-400" />
                                                ) : (
                                                    <ChevronRight className="size-4 shrink-0 text-slate-400" />
                                                )}
                                                <span className="shrink-0 text-xs font-bold text-slate-700">
                                                    {UI_TEXT.videoConfigTab.questionIndex}
                                                    {idx + 1}
                                                </span>
                                                <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                                                    {displayType}
                                                </span>
                                                <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                                                    {q.points}
                                                    {UI_TEXT.quizConfigTab.pointsSuffix}
                                                </span>
                                                <span className="ml-1 truncate text-xs font-semibold text-slate-600">
                                                    {q.content || UI_TEXT.quizConfigTab.emptyQuestionContent}
                                                </span>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveQuestion(idx);
                                                    }}
                                                    className="cursor-pointer p-1 text-red-500 transition hover:text-red-600"
                                                    title={UI_TEXT.quizConfigTab.deleteQuestionTooltip}
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Body */}
                                        {isExpanded && (
                                            <div className="flex flex-col gap-3 border-t border-slate-100/60 bg-slate-50/10 p-3.5 pt-3">
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-xs font-bold text-slate-700">
                                                        {UI_TEXT.quizConfigTab.questionContentLabel}
                                                    </label>
                                                    <textarea
                                                        value={q.content}
                                                        onChange={(e) => handleQuestionContentChange(idx, e.target.value)}
                                                        placeholder={UI_TEXT.quizConfigTab.questionContentPlaceholder}
                                                        rows={2}
                                                        className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 shadow-2xs transition duration-150 focus:border-wine focus:ring-2 focus:ring-wine/10 focus:outline-none"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="flex flex-col gap-1.5">
                                                        <label className="text-xs font-bold text-slate-700">
                                                            {UI_TEXT.quizConfigTab.questionTypeLabel}
                                                        </label>
                                                        <div className="flex h-[42px] w-full items-center gap-1 rounded-full border border-slate-200/80 bg-slate-100/90 p-1 shadow-inner">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleQuestionTypeChange(idx, QuestionTypeEnum.SINGLE_CHOICE)}
                                                                className={`flex h-full flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full text-xs font-bold transition-all duration-150 ${
                                                                    q.type === QuestionTypeEnum.SINGLE_CHOICE || !q.type
                                                                        ? "bg-wine text-white shadow-xs"
                                                                        : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
                                                                }`}
                                                            >
                                                                <CheckCircle2
                                                                    className={`size-3.5 ${q.type === QuestionTypeEnum.SINGLE_CHOICE || !q.type ? "text-white" : "text-slate-400"}`}
                                                                />
                                                                <span>{UI_TEXT.quizConfigTab.singleChoiceBtn}</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleQuestionTypeChange(idx, QuestionTypeEnum.MULTIPLE_CHOICE)}
                                                                className={`flex h-full flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full text-xs font-bold transition-all duration-150 ${
                                                                    q.type === QuestionTypeEnum.MULTIPLE_CHOICE
                                                                        ? "bg-wine text-white shadow-xs"
                                                                        : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
                                                                }`}
                                                            >
                                                                <CheckSquare
                                                                    className={`size-3.5 ${q.type === QuestionTypeEnum.MULTIPLE_CHOICE ? "text-white" : "text-slate-400"}`}
                                                                />
                                                                <span>{UI_TEXT.quizConfigTab.multipleChoiceBtn}</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-1.5">
                                                        <label className="text-xs font-bold text-slate-700">{UI_TEXT.quizConfigTab.pointsLabel}</label>
                                                        <input
                                                            type="number"
                                                            value={q.points}
                                                            onChange={(e) => handleQuestionPointsChange(idx, Number(e.target.value))}
                                                            className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-2xs transition duration-150 focus:border-wine focus:ring-2 focus:ring-wine/10 focus:outline-none"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mt-1 flex flex-col gap-2.5">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-xs font-bold text-slate-700">{UI_TEXT.quizConfigTab.optionsListTitle}</label>
                                                        {(!q.options || q.options.length < maxQuizOptionsLimit) && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleAddOption(idx)}
                                                                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-wine transition hover:bg-slate-100 hover:text-wine-hover"
                                                            >
                                                                <Plus className="size-3.5 text-wine" />
                                                                <span>{UI_TEXT.quizConfigTab.addOptionBtn}</span>
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                                        {(q.options || []).map((opt: QuizOptionItem, optIdx: number) => {
                                                            const isCorrect = opt.isCorrect;
                                                            return (
                                                                <div
                                                                    key={optIdx}
                                                                    className={`relative flex flex-col gap-2.5 rounded-2xl border bg-white p-3.5 transition duration-150 ${
                                                                        isCorrect ? "border-emerald-500 bg-emerald-50/10" : "border-slate-200"
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleOptionToggleCorrect(idx, optIdx)}
                                                                            className="flex cursor-pointer items-center justify-center"
                                                                        >
                                                                            {isCorrect ? (
                                                                                <CheckCircle2 className="size-4 fill-emerald-100 text-emerald-600" />
                                                                            ) : (
                                                                                <Circle className="size-4 text-slate-400" />
                                                                            )}
                                                                        </button>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span
                                                                                className={`text-xs font-bold ${isCorrect ? "text-emerald-600" : "text-slate-400"}`}
                                                                            >
                                                                                {isCorrect
                                                                                    ? UI_TEXT.quizConfigTab.correctText
                                                                                    : UI_TEXT.quizConfigTab.incorrectText}
                                                                            </span>
                                                                            {(q.options || []).length > minQuizOptionsLimit && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleRemoveOption(idx, optIdx)}
                                                                                    className="cursor-pointer p-0.5 text-red-500 transition hover:text-red-600"
                                                                                    title={UI_TEXT.quizConfigTab.deleteOptionTooltip}
                                                                                >
                                                                                    <Trash2 className="size-3.5" />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <input
                                                                        type="text"
                                                                        value={opt.content}
                                                                        onChange={(e) => handleOptionContentChange(idx, optIdx, e.target.value)}
                                                                        placeholder={`${UI_TEXT.quizConfigTab.optionContentPlaceholderPrefix}${optIdx + 1}...`}
                                                                        className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-2xs transition duration-150 focus:border-wine focus:ring-2 focus:ring-wine/10 focus:outline-none"
                                                                    />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            <div className="mt-2 flex justify-center">
                                <button
                                    type="button"
                                    onClick={handleAddQuestion}
                                    className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border border-dashed border-slate-200 bg-slate-50/50 px-6 py-2.5 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 active:scale-[0.98]"
                                >
                                    <Plus className="size-4" />
                                    <span>{UI_TEXT.quizConfigTab.addNewQuestionBtn}</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6">
                            <span className="text-xs font-semibold text-slate-400">{UI_TEXT.quizConfigTab.emptyQuizQuestionsText}</span>
                            <button
                                type="button"
                                onClick={handleAddQuestion}
                                className="hover:bg-wine-hover flex cursor-pointer items-center gap-1.5 rounded-full bg-wine px-5 py-2 text-[10px] font-black text-white transition active:scale-[0.98]"
                            >
                                <Plus className="size-3" />
                                <span>{UI_TEXT.quizConfigTab.addFirstQuestionBtn}</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Modal Select Quiz */}
            <SelectQuizModal
                isOpen={isSelectModalOpen}
                onOpenChange={setIsSelectModalOpen}
                searchTerm={modalSearchTerm}
                setSearchTerm={setModalSearchTerm}
                quizzes={quizzes as unknown as Parameters<typeof SelectQuizModal>[0]["quizzes"]}
                tempQuizId={tempQuizId}
                setTempQuizId={setTempQuizId}
                onConfirm={() => {
                    setQuizId(tempQuizId);
                    setIsSelectModalOpen(false);
                }}
            />
        </div>
    );
}
