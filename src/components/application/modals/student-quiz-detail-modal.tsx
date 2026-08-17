"use client";

import { CheckCircle2, Clock, User, X, XCircle } from "lucide-react";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { type StudentQuizDetailModalProps, StudentQuizStatusEnum } from "@/types/session-quiz.types";
import { formatSubmittedAt } from "@/utils/class.utils";

const asciiA = 65;

export function StudentQuizDetailModal({ isOpen, onClose, studentResult, activeQuiz, isClosed }: StudentQuizDetailModalProps) {
    if (!isOpen || !studentResult) return null;

    const questions = activeQuiz?.questions || [];
    const isSubmitted = studentResult.status === StudentQuizStatusEnum.SUBMITTED || isClosed;

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="flex h-[85vh] max-h-[85vh] w-[92vw] max-w-4xl flex-col overflow-hidden rounded-2xl bg-white p-0 shadow-2xl">
                <Dialog className="flex h-full min-h-0 flex-col outline-none">
                    {/* Modal Header */}
                    <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                                <User className="size-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold text-slate-800">
                                    {`${UI_TEXT.studentQuizDetailModal.titlePrefix}${studentResult.studentName || UI_TEXT.enrollStudentModal.defaultStudentLabel}`}
                                </h3>
                                <p className="text-xs font-medium text-slate-400">
                                    {`${UI_TEXT.studentQuizDetailModal.mssvPrefix}${studentResult.studentCode || "---"} ${UI_TEXT.studentQuizDetailModal.dobPrefix}`}
                                    {studentResult.dateOfBirth ? new Date(studentResult.dateOfBirth).toLocaleDateString("vi-VN") : "---"}
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Summary Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/60 px-6 py-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-500">{UI_TEXT.studentQuizDetailModal.statusLabel}</span>
                            {isSubmitted ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700">
                                    <span className="size-2 rounded-full bg-emerald-500" />
                                    {UI_TEXT.classQuizResultPage.statusSubmitted}
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-700">
                                    <span className="size-2 animate-pulse rounded-full bg-amber-500" />
                                    {`${UI_TEXT.classQuizResultPage.statusDoing} ${UI_TEXT.studentQuizDetailModal.realtimeSuffix}`}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5 font-semibold text-slate-600">
                                <span>{UI_TEXT.studentQuizDetailModal.scoreLabel}</span>
                                <span className="rounded-md bg-purple-100 px-2 py-0.5 font-mono font-extrabold text-purple-800">
                                    {studentResult.score !== undefined ? `${studentResult.score}/10` : "---"}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 font-semibold text-slate-600">
                                <span>{UI_TEXT.studentQuizDetailModal.correctAnswersLabel}</span>
                                <span className="font-bold text-emerald-700">
                                    {`${studentResult.correctAnswersCount || 0}/${studentResult.totalQuestionsCount || questions.length}`}
                                </span>
                            </div>
                            {studentResult.submittedAt && (
                                <div className="flex items-center gap-1 text-slate-500">
                                    <Clock className="size-3.5" />
                                    <span>{`${UI_TEXT.studentQuizDetailModal.submittedAtPrefix}${formatSubmittedAt(studentResult.submittedAt)}`}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Questions Body */}
                    <div className="min-h-0 flex-1 overflow-y-auto p-6">
                        {questions.length === 0 ? (
                            <div className="p-8 text-center text-sm text-slate-400">{UI_TEXT.studentQuizDetailModal.emptyQuestions}</div>
                        ) : (
                            <div className="flex flex-col gap-6">
                                {questions.map((q, qIdx) => {
                                    const qId = String(q.id || q._id || "");
                                    const studentAns = (studentResult.answers || []).find(
                                        (a: { questionId: string; selectedOptionIds: string[] }) => String(a.questionId) === qId,
                                    );
                                    const selectedOptionIds = studentAns?.selectedOptionIds || [];
                                    const correctOptionIds = (q.options || []).filter((o) => o.isCorrect).map((o) => String(o.id || o._id || ""));

                                    const isAnswered = selectedOptionIds.length > 0;
                                    const isQuestionCorrect =
                                        isAnswered &&
                                        correctOptionIds.length === selectedOptionIds.length &&
                                        correctOptionIds.every((id) => selectedOptionIds.includes(id));

                                    return (
                                        <div key={qId || qIdx} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs transition">
                                            {/* Question Header */}
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-start gap-2">
                                                    <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-extrabold text-slate-700">
                                                        {qIdx + 1}
                                                    </span>
                                                    <div className="text-sm font-bold text-slate-800">{q.content}</div>
                                                </div>
                                                <div>
                                                    {!isAnswered ? (
                                                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                                                            {UI_TEXT.studentQuizDetailModal.notAnswered}
                                                        </span>
                                                    ) : isQuestionCorrect ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-extrabold text-emerald-700">
                                                            <CheckCircle2 className="size-3.5 text-emerald-600" />
                                                            {UI_TEXT.studentQuizDetailModal.correct}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-extrabold text-rose-700">
                                                            <XCircle className="size-3.5 text-rose-600" />
                                                            {UI_TEXT.studentQuizDetailModal.incorrect}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Question Media */}
                                            {q.mediaUrl && (
                                                <div className="mt-3 overflow-hidden rounded-xl border border-slate-100">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={q.mediaUrl}
                                                        alt={UI_TEXT.studentQuizDetailModal.altQuestionMedia}
                                                        className="max-h-48 w-auto object-contain"
                                                    />
                                                </div>
                                            )}

                                            {/* Options List */}
                                            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                                                {(q.options || []).map((opt, optIdx) => {
                                                    const optId = String(opt.id || opt._id || "");
                                                    const isSelected = selectedOptionIds.includes(optId);
                                                    const isCorrectOpt = opt.isCorrect === true;

                                                    let optionStyle = "border-slate-200 bg-slate-50/50 text-slate-700";
                                                    if (isSelected && isCorrectOpt) {
                                                        optionStyle = "border-emerald-300 bg-emerald-50/80 text-emerald-900 font-semibold";
                                                    } else if (isSelected && !isCorrectOpt) {
                                                        optionStyle = "border-rose-300 bg-rose-50/80 text-rose-900 font-semibold";
                                                    } else if (!isSelected && isCorrectOpt) {
                                                        optionStyle = "border-emerald-200 bg-emerald-50/30 text-emerald-800";
                                                    }

                                                    return (
                                                        <div
                                                            key={optId || optIdx}
                                                            className={`flex items-center justify-between rounded-xl border p-3 text-xs transition ${optionStyle}`}
                                                        >
                                                            <div className="flex items-center gap-2.5">
                                                                <span className="font-mono font-bold text-slate-400">
                                                                    {`${String.fromCharCode(asciiA + optIdx)}.`}
                                                                </span>
                                                                <span>{opt.content}</span>
                                                            </div>
                                                            <div className="flex shrink-0 items-center gap-1.5">
                                                                {isSelected && (
                                                                    <span className="rounded-md bg-purple-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
                                                                        {UI_TEXT.studentQuizDetailModal.selectedByStudent}
                                                                    </span>
                                                                )}
                                                                {isCorrectOpt && (
                                                                    <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
                                                                        {UI_TEXT.studentQuizDetailModal.correctOption}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
