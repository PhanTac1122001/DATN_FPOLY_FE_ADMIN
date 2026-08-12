"use client";
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { useEffect, useState } from "react";
import { CheckCircle2, Clock, HelpCircle, Layers, X } from "lucide-react";
import { Button } from "@/components/base/buttons/button";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { getSessionQuizById } from "@/services/session-quiz.service";
import {
    QuestionCategoryEnum,
    QuestionDifficultyEnum,
    QuestionTypeEnum,
    type QuizReviewModalProps,
    type SessionQuizItem,
    type SessionQuizQuestion,
} from "@/types/session-quiz.types";

export function QuizReviewModal({ isOpen, onClose, quizzes, selectedQuizId, onSelectQuiz }: QuizReviewModalProps) {
    const [activeQuizId, setActiveQuizId] = useState<string>(selectedQuizId || "");
    const [fullQuiz, setFullQuiz] = useState<SessionQuizItem | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (selectedQuizId) {
            setActiveQuizId(selectedQuizId);
        } else if (quizzes.length > 0) {
            setActiveQuizId(quizzes[0].id);
        }
    }, [selectedQuizId, quizzes]);

    useEffect(() => {
        if (!isOpen || !activeQuizId) return;

        async function loadQuizDetail() {
            try {
                setIsLoading(true);
                const quiz = await getSessionQuizById(activeQuizId);
                setFullQuiz(quiz);
            } catch (error) {
                console.error("Error loading quiz detail for review:", error);
                // Fallback to item in quizzes array if API fails
                const found = quizzes.find((q) => q.id === activeQuizId);
                setFullQuiz(found || null);
            } finally {
                setIsLoading(false);
            }
        }

        void loadQuizDetail();
    }, [isOpen, activeQuizId, quizzes]);

    const handleSelectQuiz = (quizId: string) => {
        setActiveQuizId(quizId);
        onSelectQuiz?.(quizId);
    };

    if (!isOpen) return null;

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="flex h-[85vh] max-h-[85vh] w-[92vw] max-w-6xl flex-col overflow-hidden rounded-2xl bg-white p-0 shadow-2xl">
                <Dialog className="flex h-full min-h-0 flex-col outline-none">
                    {/* Header */}
                    <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                                <HelpCircle className="size-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold text-slate-800">{UI_TEXT.quizReview.title}</h3>
                                <p className="text-xs font-medium text-slate-400">{UI_TEXT.quizReview.subtitle}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Quiz Selector Tabs / Dropdown */}
                    {quizzes.length > 0 && (
                        <div className="shrink-0 border-b border-slate-100 bg-slate-50/60 px-6 py-3">
                            <div className="flex scrollbar-none items-center gap-2 overflow-x-auto pb-1">
                                <span className="mr-1 flex shrink-0 items-center gap-1 text-xs font-bold text-slate-500">
                                    <Layers className="size-3.5" /> {UI_TEXT.quizReview.quizSetLabel}
                                </span>
                                {quizzes.map((q) => {
                                    const isSelected = q.id === activeQuizId;
                                    return (
                                        <button
                                            key={q.id}
                                            onClick={() => handleSelectQuiz(q.id)}
                                            className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                                                isSelected
                                                    ? "bg-purple-600 text-white shadow-xs"
                                                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-200"
                                            }`}
                                        >
                                            {q.title}
                                            {" ("}
                                            {q.questions?.length || q.questionCount || 0} {UI_TEXT.quizReview.questionsSuffix}
                                            {")"}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Main Content Area */}
                    <div className="min-h-0 flex-1 overflow-y-auto p-6">
                        {isLoading ? (
                            <div className="flex h-64 flex-col items-center justify-center gap-2 text-slate-400">
                                <span className="size-6 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
                                <span className="text-xs font-semibold">{UI_TEXT.quizReview.loadingText}</span>
                            </div>
                        ) : !fullQuiz ? (
                            <div className="flex h-64 items-center justify-center text-xs font-semibold text-slate-400">{UI_TEXT.quizReview.notFoundText}</div>
                        ) : (
                            <div className="flex flex-col gap-6">
                                {/* Quiz Metadata Header Card */}
                                <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-4">
                                    <h4 className="text-sm font-extrabold text-slate-800">{fullQuiz.title}</h4>
                                    {fullQuiz.description && <p className="mt-1 text-xs font-medium text-slate-500">{fullQuiz.description}</p>}

                                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
                                        <span className="flex items-center gap-1">
                                            <Clock className="size-3.5 text-purple-600" />
                                            {UI_TEXT.quizReview.durationLabel}{" "}
                                            <strong className="text-slate-800">
                                                {fullQuiz.durationMinutes || 15} {UI_TEXT.quizReview.minutesSuffix}
                                            </strong>
                                        </span>
                                        <span>{"•"}</span>
                                        <span>
                                            {UI_TEXT.quizReview.questionCountLabel}{" "}
                                            <strong className="text-slate-800">
                                                {fullQuiz.questions?.length || 0} {UI_TEXT.quizReview.questionsSuffix}
                                            </strong>
                                        </span>
                                        <span>{"•"}</span>
                                        <span>
                                            {UI_TEXT.quizReview.passThresholdLabel}{" "}
                                            <strong className="text-slate-800">
                                                {fullQuiz.passThreshold || 80}
                                                {"%"}
                                            </strong>
                                        </span>
                                    </div>
                                </div>

                                {/* Questions List */}
                                <div className="flex flex-col gap-5">
                                    {!fullQuiz.questions || fullQuiz.questions.length === 0 ? (
                                        <div className="p-8 text-center text-xs font-medium text-slate-400">{UI_TEXT.quizReview.emptyQuestionsText}</div>
                                    ) : (
                                        fullQuiz.questions.map((q: SessionQuizQuestion, qIdx: number) => (
                                            <div
                                                key={q._id || (q as { id?: string }).id || qIdx}
                                                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition hover:border-purple-100"
                                            >
                                                {/* Question Header */}
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-start gap-2.5">
                                                        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-xs font-extrabold text-purple-700">
                                                            {qIdx + 1}
                                                        </span>
                                                        <div>
                                                            <h5 className="text-sm leading-snug font-bold text-slate-800">{q.content}</h5>
                                                            <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                                                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                                                                    {q.type === QuestionTypeEnum.MULTIPLE_CHOICE
                                                                        ? UI_TEXT.quizReview.typeMultiple
                                                                        : UI_TEXT.quizReview.typeSingle}
                                                                </span>
                                                                {q.category && q.category !== QuestionCategoryEnum.NONE && (
                                                                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                                                                        {q.category === QuestionCategoryEnum.BAI_CU
                                                                            ? UI_TEXT.quizReview.categoryOld
                                                                            : UI_TEXT.quizReview.categoryNew}
                                                                    </span>
                                                                )}
                                                                {q.difficulty && (
                                                                    <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                                                        {q.difficulty === QuestionDifficultyEnum.EASY
                                                                            ? UI_TEXT.quizReview.difficultyEasy
                                                                            : q.difficulty === QuestionDifficultyEnum.MEDIUM
                                                                              ? UI_TEXT.quizReview.difficultyMedium
                                                                              : UI_TEXT.quizReview.difficultyHard}
                                                                    </span>
                                                                )}
                                                                {q.points !== undefined && (
                                                                    <span className="text-[11px] font-bold text-slate-400">
                                                                        {"("}
                                                                        {q.points}
                                                                        {UI_TEXT.quizReview.pointsSuffix}
                                                                        {")"}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Options List */}
                                                <div className="mt-4 grid grid-cols-1 gap-2.5">
                                                    {(q.options || []).map((opt, optIdx) => {
                                                        const isCorrect = opt.isCorrect;
                                                        const label = String.fromCharCode(65 + optIdx);

                                                        return (
                                                            <div
                                                                key={opt._id || (opt as { id?: string }).id || optIdx}
                                                                className={`flex flex-col rounded-xl border p-3 text-xs transition ${
                                                                    isCorrect
                                                                        ? "border-emerald-300 bg-emerald-50/70 font-semibold text-emerald-900"
                                                                        : "border-slate-100 bg-slate-50/50 text-slate-700"
                                                                }`}
                                                            >
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <span
                                                                            className={`flex size-5 items-center justify-center rounded-md text-[10px] font-extrabold ${
                                                                                isCorrect ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                                                                            }`}
                                                                        >
                                                                            {label}
                                                                        </span>
                                                                        <span>{opt.content}</span>
                                                                    </div>

                                                                    {isCorrect && (
                                                                        <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold text-emerald-700">
                                                                            <CheckCircle2 className="size-3.5 text-emerald-600" />
                                                                            {UI_TEXT.quizReview.correctAnswerBadge}
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {opt.explanation && (
                                                                    <p className="mt-1.5 pl-7 text-[11px] font-normal text-emerald-800 italic">
                                                                        {UI_TEXT.quizReview.explanationLabel} {opt.explanation}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex shrink-0 items-center justify-end border-t border-slate-100 bg-slate-50/50 px-6 py-3.5">
                        <Button color="secondary" size="md" onClick={onClose} className="px-5 font-bold">
                            {UI_TEXT.quizReview.closeBtn}
                        </Button>
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
