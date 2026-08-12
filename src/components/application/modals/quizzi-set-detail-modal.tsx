"use client";
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Award, Check, CheckCircle2, Clock, HelpCircle, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import type { QuizziSetDetailModalProps } from "@/types/session-quiz.types";

export function QuizziSetDetailModal({ isOpen, onClose, quizziSet }: QuizziSetDetailModalProps) {
    if (!quizziSet) return null;

    const questions = quizziSet.questions || [];

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="w-full max-w-4xl !rounded-[24px]">
                <Dialog className="flex max-h-[90vh] flex-col gap-4 overflow-hidden rounded-[24px] bg-white p-6 shadow-2xl outline-none">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <Heading slot="title" className="text-lg leading-snug font-bold text-slate-900">
                            {UI_TEXT.quizziSetDetail.titlePrefix}
                            {quizziSet.title}
                        </Heading>
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Metadata summary bar */}
                    <div className="grid grid-cols-2 gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs sm:grid-cols-4">
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                                <HelpCircle className="size-4" />
                            </div>
                            <div>
                                <span className="block text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                                    {UI_TEXT.quizziSetDetail.totalQuestionsLabel}
                                </span>
                                <span className="text-sm font-bold text-slate-800">
                                    {questions.length} {UI_TEXT.quizziSetDetail.questionsSuffix}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                                <Clock className="size-4" />
                            </div>
                            <div>
                                <span className="block text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                                    {UI_TEXT.quizziSetDetail.durationLabel}
                                </span>
                                <span className="text-sm font-bold text-slate-800">
                                    {quizziSet.durationMinutes
                                        ? quizziSet.durationMinutes + " " + UI_TEXT.quizziSetsPage.durationUnit
                                        : UI_TEXT.quizziSetDetail.noDurationLimit}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                                <Award className="size-4" />
                            </div>
                            <div>
                                <span className="block text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                                    {UI_TEXT.quizziSetDetail.passThresholdLabel}
                                </span>
                                <span className="text-sm font-bold text-slate-800">{quizziSet.passThreshold ? `${quizziSet.passThreshold}%` : "---"}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                                <CheckCircle2 className="size-4" />
                            </div>
                            <div>
                                <span className="block text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                                    {UI_TEXT.quizziSetDetail.assignedSessionsLabel}
                                </span>
                                <span className="text-sm font-bold text-slate-800">
                                    {(quizziSet.sessionIds || []).length} {UI_TEXT.quizziSetDetail.sessionSuffix}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Questions List */}
                    <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
                        {quizziSet.description && (
                            <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-3 text-xs text-slate-600">
                                <strong className="font-bold text-purple-900">{UI_TEXT.quizziSetDetail.descriptionLabel} </strong>
                                {quizziSet.description}
                            </div>
                        )}

                        {questions.length === 0 ? (
                            <div className="p-8 text-center text-sm font-semibold text-slate-400">{UI_TEXT.quizziSetDetail.emptyQuestionsText}</div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {questions.map((q, qIdx) => (
                                    <div key={q._id || qIdx} className="flex flex-col gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                                        {/* Question header line */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex flex-1 items-center gap-2.5">
                                                <span className="inline-flex shrink-0 items-center justify-center rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-extrabold text-white">
                                                    {UI_TEXT.quizziSetDetail.questionPrefix}
                                                    {qIdx + 1}
                                                </span>
                                                <h5 className="text-sm leading-snug font-bold text-slate-900">{q.content}</h5>
                                            </div>
                                            <span className="shrink-0 rounded-lg bg-amber-500 px-2.5 py-1 text-xs font-extrabold text-white shadow-xs">
                                                {q.points || 10} {UI_TEXT.quizziSetDetail.pointsSuffix}
                                            </span>
                                        </div>

                                        {/* Options list */}
                                        <div className="flex flex-col gap-2 border-t border-slate-100 pt-1 text-xs">
                                            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                                {UI_TEXT.quizziSetDetail.optionsHeader}
                                            </span>
                                            <div className="mt-1 flex flex-col gap-2.5 pl-1">
                                                {(() => {
                                                    const isMulti = (q.options || []).filter((o) => o.isCorrect).length > 1;
                                                    return q.options?.map((opt, optIdx) => {
                                                        const labelLetter = String.fromCharCode(65 + optIdx);
                                                        const isCorrect = !!opt.isCorrect;

                                                        return (
                                                            <div
                                                                key={optIdx}
                                                                className={`flex items-center gap-2.5 rounded-xl border p-2.5 transition-colors ${
                                                                    isCorrect
                                                                        ? "border-emerald-200 bg-emerald-50/60 font-semibold text-slate-900"
                                                                        : "border-slate-100 bg-slate-50/50 text-slate-700"
                                                                }`}
                                                            >
                                                                <div
                                                                    className={`flex size-4.5 shrink-0 items-center justify-center border-2 ${
                                                                        isMulti ? "rounded-md" : "rounded-full"
                                                                    } ${
                                                                        isCorrect ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white"
                                                                    }`}
                                                                >
                                                                    {isCorrect &&
                                                                        (isMulti ? (
                                                                            <Check className="size-3 stroke-[3] text-white" />
                                                                        ) : (
                                                                            <div className="size-1.5 rounded-full bg-white" />
                                                                        ))}
                                                                </div>
                                                                <span className="flex-1 text-xs font-medium">
                                                                    <strong className="mr-1 font-bold text-slate-900">
                                                                        {labelLetter}
                                                                        {"."}
                                                                    </strong>{" "}
                                                                    {opt.content}
                                                                </span>
                                                                {isCorrect && (
                                                                    <span className="rounded-md bg-emerald-600 px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap text-white shadow-xs">
                                                                        {UI_TEXT.quizziSetDetail.correctAnswerBadge}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    });
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
