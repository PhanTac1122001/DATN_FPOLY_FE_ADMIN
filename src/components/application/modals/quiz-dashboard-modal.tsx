"use client";
import { BarChart3, CheckCircle2, Clock, Users, X } from "lucide-react";
import { Button } from "@/components/base/buttons/button";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { type QuizDashboardModalProps, QuizSessionStatusEnum, StudentQuizStatusEnum } from "@/types/session-quiz.types";
import { formatDateTime } from "@/utils/class.utils";

const defaultTotalQuestions = 10;
const maxQuizScore = 10;
const defaultDurationMinutes = 15;
const percentageFactor = 100;
const goodScoreThreshold = 80;
const passScoreThreshold = 50;

export function QuizDashboardModal({
    isOpen,
    onClose,
    results,
    activeQuiz,
    isClosed,
    sessionInfo,
    history,
    selectedSessionId,
    onSelectAttempt,
}: QuizDashboardModalProps) {
    if (!isOpen) return null;

    const totalStudents = results.length;
    const submittedCount = results.filter((r) => r.status === StudentQuizStatusEnum.SUBMITTED || isClosed).length;
    const doingCount = isClosed ? 0 : totalStudents - submittedCount;

    const totalQuestions = activeQuiz?.questions?.length || results[0]?.totalQuestionsCount || defaultTotalQuestions;

    const totalCorrectSum = results.reduce((acc, r) => acc + (r.correctAnswersCount || 0), 0);
    const avgCorrect = totalStudents > 0 ? (totalCorrectSum / totalStudents).toFixed(1) : "0";

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="flex h-[85vh] max-h-[85vh] w-[92vw] max-w-6xl flex-col overflow-hidden rounded-2xl bg-white p-0 shadow-2xl">
                <Dialog className="flex h-full min-h-0 flex-col outline-none">
                    {/* Header */}
                    <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                                <BarChart3 className="size-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-extrabold text-slate-800">{UI_TEXT.quizDashboard.title}</h3>
                                <p className="text-xs font-medium text-slate-400">{UI_TEXT.quizDashboard.subtitle}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="min-h-0 flex-1 overflow-y-auto p-6">
                        <div className="flex flex-col gap-6">
                            {/* Session attempt history bar */}
                            {history && history.length > 0 && (
                                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-slate-600">{UI_TEXT.quizDashboard.attemptSelectLabel}</span>
                                        <select
                                            value={selectedSessionId || ""}
                                            onChange={(e) => onSelectAttempt?.(e.target.value)}
                                            className="h-9 rounded-xl border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 shadow-xs outline-none focus:border-purple-500"
                                        >
                                            {history.map((h) => (
                                                <option key={h.id || h._id} value={h.id || h._id}>
                                                    {`${UI_TEXT.quizDashboard.attemptPrefix}${h.attempt || 1} (${formatDateTime(h.startedAt)} ${h.status === QuizSessionStatusEnum.ACTIVE ? UI_TEXT.quizDashboard.statusOpen : `${UI_TEXT.quizDashboard.statusClosedPrefix}${formatDateTime(h.stoppedAt)}`})`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-emerald-700">
                                            <span className="size-2 rounded-full bg-emerald-500" />
                                            {UI_TEXT.quizDashboard.openedLabel} <strong>{formatDateTime(sessionInfo?.startedAt)}</strong>
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1 text-rose-700">
                                            <span className="size-2 rounded-full bg-rose-500" />
                                            {UI_TEXT.quizDashboard.closedLabel}{" "}
                                            <strong>
                                                {sessionInfo?.stoppedAt
                                                    ? formatDateTime(sessionInfo.stoppedAt)
                                                    : isClosed
                                                      ? UI_TEXT.quizDashboard.statusClosed
                                                      : UI_TEXT.quizDashboard.statusActive}
                                            </strong>
                                        </span>
                                    </div>
                                </div>
                            )}
                            {/* Key Performance Indicators (KPIs) */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                        <Users className="size-4 text-indigo-500" />
                                        {UI_TEXT.quizDashboard.totalStudentsLabel}
                                    </div>
                                    <div className="mt-2 flex items-baseline gap-2">
                                        <span className="text-2xl font-black text-slate-800">{totalStudents}</span>
                                        <span className="text-xs font-semibold text-slate-400">{UI_TEXT.quizDashboard.studentsSuffix}</span>
                                    </div>
                                    <div className="mt-1 flex items-center gap-2 text-[11px] font-medium text-slate-500">
                                        <span className="font-bold text-emerald-600">
                                            {submittedCount} {isClosed ? UI_TEXT.quizDashboard.statusSubmitted : UI_TEXT.quizDashboard.statusSubmittedActive}
                                        </span>
                                        {!isClosed && (
                                            <>
                                                <span>{"•"}</span>
                                                <span className="font-bold text-amber-600">
                                                    {doingCount} {UI_TEXT.quizDashboard.statusDoing}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4">
                                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                                        <CheckCircle2 className="size-4 text-emerald-600" />
                                        {UI_TEXT.quizDashboard.avgCorrectLabel}
                                    </div>
                                    <div className="mt-2 flex items-baseline gap-2">
                                        <span className="text-2xl font-black text-emerald-900">{avgCorrect}</span>
                                        <span className="text-xs font-semibold text-emerald-700">
                                            {"/ "}
                                            {totalQuestions} {UI_TEXT.quizDashboard.questionsSuffix}
                                        </span>
                                    </div>
                                    <div className="mt-1 text-[11px] font-medium text-emerald-700">
                                        {UI_TEXT.quizDashboard.avgScoreLabel}{" "}
                                        <strong className="font-bold">
                                            {totalQuestions > 0 ? ((Number(avgCorrect) / totalQuestions) * maxQuizScore).toFixed(1) : 0}
                                            {"/10"}
                                        </strong>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-purple-100 bg-purple-50/30 p-4">
                                    <div className="flex items-center gap-2 text-xs font-bold text-purple-700">
                                        <Clock className="size-4 text-purple-600" />
                                        {UI_TEXT.quizDashboard.durationLabel}
                                    </div>
                                    <div className="mt-2 flex items-baseline gap-2">
                                        <span className="text-2xl font-black text-purple-900">{activeQuiz?.durationMinutes || defaultDurationMinutes}</span>
                                        <span className="text-xs font-semibold text-purple-700">{UI_TEXT.quizDashboard.minutesSuffix}</span>
                                    </div>
                                    <div className="mt-1 text-[11px] font-medium text-purple-700">
                                        {UI_TEXT.quizDashboard.totalQuestionsLabel}{" "}
                                        <strong className="font-bold">
                                            {totalQuestions} {UI_TEXT.quizDashboard.questionsSuffix}
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Student Results Table */}
                            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs">
                                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-3">
                                    <h4 className="text-xs font-extrabold tracking-wider text-slate-600 uppercase">{UI_TEXT.quizDashboard.tableTitle}</h4>
                                    <span className="text-xs font-bold text-slate-400">
                                        {results.length} {UI_TEXT.quizDashboard.studentsSuffix}
                                    </span>
                                </div>

                                {results.length === 0 ? (
                                    <div className="p-12 text-center text-xs font-medium text-slate-400">{UI_TEXT.quizDashboard.noData}</div>
                                ) : (
                                    <div className="w-full overflow-x-auto">
                                        <table className="w-full text-left text-xs text-slate-600">
                                            <thead className="border-b border-slate-100 bg-slate-50/30 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                                                <tr>
                                                    <th className="px-5 py-3 text-center whitespace-nowrap">{UI_TEXT.quizDashboard.thStt}</th>
                                                    <th className="px-5 py-3 whitespace-nowrap">{UI_TEXT.quizDashboard.thMssv}</th>
                                                    <th className="px-5 py-3 whitespace-nowrap">{UI_TEXT.quizDashboard.thName}</th>
                                                    <th className="px-5 py-3 text-center whitespace-nowrap">{UI_TEXT.quizDashboard.thStatus}</th>
                                                    <th className="px-5 py-3 text-center whitespace-nowrap">{UI_TEXT.quizDashboard.thCorrectAnswers}</th>
                                                    <th className="px-5 py-3 text-center whitespace-nowrap">{UI_TEXT.quizDashboard.thScore}</th>
                                                    <th className="px-5 py-3 whitespace-nowrap">{UI_TEXT.quizDashboard.thProgress}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 font-medium">
                                                {results.map((item, idx) => {
                                                    const correct = item.correctAnswersCount ?? 0;
                                                    const qTotal = item.totalQuestionsCount || totalQuestions;
                                                    const percentage = qTotal > 0 ? Math.round((correct / qTotal) * percentageFactor) : 0;
                                                    const isCompleted = item.status === StudentQuizStatusEnum.SUBMITTED || isClosed;

                                                    return (
                                                        <tr key={item.id || item._id || idx} className="transition hover:bg-slate-50/50">
                                                            <td className="px-5 py-3.5 text-center font-bold whitespace-nowrap text-slate-400">{idx + 1}</td>
                                                            <td className="px-5 py-3.5 font-bold whitespace-nowrap text-slate-800">
                                                                {item.studentCode || "---"}
                                                            </td>
                                                            <td className="px-5 py-3.5 font-bold whitespace-nowrap text-slate-800">
                                                                {item.studentName || UI_TEXT.enrollStudentModal.defaultStudentLabel}
                                                            </td>
                                                            <td className="px-5 py-3.5 text-center whitespace-nowrap">
                                                                {isCompleted ? (
                                                                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap text-emerald-700">
                                                                        {UI_TEXT.quizDashboard.completedText}
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap text-amber-700">
                                                                        {UI_TEXT.quizDashboard.doingText}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-5 py-3.5 text-center whitespace-nowrap">
                                                                <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-extrabold whitespace-nowrap text-emerald-700">
                                                                    <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
                                                                    {correct}
                                                                    {" / "}
                                                                    {qTotal} {UI_TEXT.quizDashboard.questionsSuffix}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-3.5 text-center whitespace-nowrap">
                                                                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-extrabold whitespace-nowrap text-purple-700">
                                                                    {item.score !== undefined ? `${item.score}/10` : "---"}
                                                                </span>
                                                            </td>
                                                            <td className="min-w-48 px-5 py-3.5 whitespace-nowrap">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                                                                        <div
                                                                            className={`h-full rounded-full transition-all duration-300 ${
                                                                                percentage >= goodScoreThreshold
                                                                                    ? "bg-emerald-500"
                                                                                    : percentage >= passScoreThreshold
                                                                                      ? "bg-amber-500"
                                                                                      : "bg-rose-500"
                                                                            }`}
                                                                            style={{ width: `${percentage}%` }}
                                                                        />
                                                                    </div>
                                                                    <span className="w-9 text-right text-[11px] font-bold text-slate-500">
                                                                        {percentage}
                                                                        {"%"}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex shrink-0 items-center justify-end border-t border-slate-100 bg-slate-50/50 px-6 py-3.5">
                        <Button color="secondary" size="md" onClick={onClose} className="px-5 font-bold">
                            {UI_TEXT.quizDashboard.closeBtn}
                        </Button>
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
