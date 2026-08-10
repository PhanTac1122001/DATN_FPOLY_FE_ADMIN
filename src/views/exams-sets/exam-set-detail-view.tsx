"use client";

import { useEffect, useState } from "react";
import { Award, Calendar, CheckCircle2, ChevronRight, Circle, Edit, FileText, Folder, HelpCircle, Info, Plus, Trash2 } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { EssayQuestionModal } from "@/components/application/modals/essay-question-modal";
import { QuestionModal } from "@/components/application/modals/question-modal";
import { Button } from "@/components/base/buttons/button";
import { EXAM_SETS_MOCK } from "@/constants/exam-set-mock.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { getQuizById, updateQuiz } from "@/services/quiz.service";
import { toast } from "@/services/toast.service";
import type { EssayQuestionMock, ExamSetDetailViewProps, ExamSetMock, QuestionMock } from "@/types/exam-set.types";
import { type QuizBackendEntity, mapBackendQuizToExamSet, mapUiQuestionsToBackendDtos } from "@/types/quiz.types";
import { cx } from "@/utils/cx";

export function ExamSetDetailView({ id }: ExamSetDetailViewProps) {
    const [selectedSet, setSelectedSet] = useState<ExamSetMock | null>(null);
    const [rawQuiz, setRawQuiz] = useState<QuizBackendEntity | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [activeTab, setActiveTab] = useState<"quiz" | "essay">("quiz");
    const [questions, setQuestions] = useState<QuestionMock[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState<QuestionMock | null>(null);

    const [essayQuestions, setEssayQuestions] = useState<EssayQuestionMock[]>([]);
    const [isEssayModalOpen, setIsEssayModalOpen] = useState(false);
    const [selectedEssayQuestion, setSelectedEssayQuestion] = useState<EssayQuestionMock | null>(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                setIsLoading(true);
                const quizData = await getQuizById(id);
                if (quizData && quizData.id) {
                    setRawQuiz(quizData);
                    const mapped = mapBackendQuizToExamSet(quizData);
                    setSelectedSet(mapped);
                    setQuestions(mapped.questions);
                } else {
                    const mock = EXAM_SETS_MOCK.find((item) => item.id === id);
                    if (mock) {
                        setSelectedSet(mock);
                        setQuestions(mock.questions);
                        setEssayQuestions(mock.essayQuestions || []);
                    }
                }
            } catch (error) {
                console.error("Error fetching quiz detail:", error);
                const mock = EXAM_SETS_MOCK.find((item) => item.id === id);
                if (mock) {
                    setSelectedSet(mock);
                    setQuestions(mock.questions);
                    setEssayQuestions(mock.essayQuestions || []);
                }
            } finally {
                setIsLoading(false);
            }
        };

        void fetchDetail();
    }, [id]);

    const syncQuestionsToBackend = async (newQuestions: QuestionMock[]) => {
        if (!rawQuiz) return;
        try {
            const dtoQuestions = mapUiQuestionsToBackendDtos(newQuestions);
            const updatedQuiz = await updateQuiz(rawQuiz.id, {
                questions: dtoQuestions,
            });
            if (updatedQuiz) {
                setRawQuiz(updatedQuiz);
                const mapped = mapBackendQuizToExamSet(updatedQuiz);
                setSelectedSet(mapped);
                setQuestions(mapped.questions);
            }
        } catch (error) {
            console.error("Sync questions error:", error);
            toast.error(UI_TEXT.examsSetsEl.title, UI_TEXT.examsSetsEl.toastSaveQuestionsError);
        }
    };

    const handleCreateQuestion = () => {
        setSelectedQuestion(null);
        setIsModalOpen(true);
    };

    const handleEditQuestion = (q: QuestionMock) => {
        setSelectedQuestion(q);
        setIsModalOpen(true);
    };

    const handleDeleteQuestion = async (qId: string) => {
        const updated = questions.filter((q) => q.id !== qId);
        setQuestions(updated);
        toast.success(UI_TEXT.examsSetsEl.title, UI_TEXT.examsSetsEl.deleteSet);

        if (rawQuiz) {
            await syncQuestionsToBackend(updated);
        }
    };

    const handleSaveQuestion = async (q: QuestionMock) => {
        let updated: QuestionMock[] = [];
        const exists = questions.some((item) => item.id === q.id);
        if (exists) {
            updated = questions.map((item) => (item.id === q.id ? q : item));
        } else {
            updated = [...questions, q];
        }
        setQuestions(updated);

        if (rawQuiz) {
            await syncQuestionsToBackend(updated);
        }
    };

    const handleCreateEssayQuestion = () => {
        setSelectedEssayQuestion(null);
        setIsEssayModalOpen(true);
    };

    const handleEditEssayQuestion = (q: EssayQuestionMock) => {
        setSelectedEssayQuestion(q);
        setIsEssayModalOpen(true);
    };

    const handleDeleteEssayQuestion = (qId: string) => {
        setEssayQuestions((prev) => prev.filter((q) => q.id !== qId));
        toast.success(UI_TEXT.examsSetsEl.title, UI_TEXT.examsSetsEl.toastEssayQuestionDeleted);
    };

    const handleSaveEssayQuestion = (q: EssayQuestionMock) => {
        setEssayQuestions((prev) => {
            const exists = prev.some((item) => item.id === q.id);
            if (exists) {
                return prev.map((item) => (item.id === q.id ? q : item));
            } else {
                return [...prev, q];
            }
        });
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-white p-8">
                <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
            </div>
        );
    }

    if (!selectedSet) {
        return (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-white p-8 text-center">
                <p className="text-base font-bold text-slate-800">{UI_TEXT.examsSetsEl.noData}</p>
                <Link
                    href={"/exams-sets-el" as Route}
                    className="mt-4 rounded-lg bg-wine px-4 py-2 text-sm font-semibold text-white transition hover:bg-wine-deep"
                >
                    {UI_TEXT.errors.goHome}
                </Link>
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col gap-6">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-500">
                <Link href={"/exams-sets-el" as Route} className="transition hover:text-wine">
                    {UI_TEXT.examsSetsEl.breadcrumbParent}
                </Link>
                <ChevronRight className="size-4 text-slate-400" />
                <Link href={"/exams-sets-el" as Route} className="transition hover:text-wine">
                    {UI_TEXT.examsSetsEl.breadcrumbTitle}
                </Link>
                <ChevronRight className="size-4 text-slate-400" />
                <span className="font-medium text-slate-400">{UI_TEXT.examsSetsEl.breadcrumbDetail}</span>
            </nav>

            {/* Header info cards */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
                <div className="grid grid-cols-1 gap-6 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-5 lg:divide-x">
                    {/* Tên bộ đề */}
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
                            <Folder className="size-5 fill-red-100 text-red-500" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{UI_TEXT.examsSetsEl.labelName}</span>
                            <span className="mt-1 max-w-[150px] truncate text-[13px] font-extrabold text-slate-800 xl:max-w-[180px]" title={selectedSet.name}>
                                {selectedSet.name}
                            </span>
                        </div>
                    </div>

                    {/* Mã bộ đề */}
                    <div className="flex items-center gap-3 pt-4 sm:pt-0 lg:pl-6">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                            <Info className="size-5 text-blue-500" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{UI_TEXT.examsSetsEl.labelCode}</span>
                            <span className="mt-1 text-[13px] font-extrabold text-slate-800">{selectedSet.id}</span>
                        </div>
                    </div>

                    {/* Thời gian tạo */}
                    <div className="flex items-center gap-3 pt-4 sm:pt-0 lg:pl-6">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                            <Calendar className="size-5 text-emerald-500" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{UI_TEXT.examsSetsEl.labelCreatedAt}</span>
                            <span className="mt-1 text-[13px] font-extrabold text-slate-800">{selectedSet.createdAt}</span>
                        </div>
                    </div>

                    {/* Số câu hỏi */}
                    <div className="flex items-center gap-3 pt-4 sm:pt-0 lg:pl-6">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-50">
                            <HelpCircle className="size-5 text-amber-500" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{UI_TEXT.examsSetsEl.labelQuestionCount}</span>
                            <span className="mt-1 text-[13px] font-extrabold text-slate-800">
                                {questions.length}
                                {UI_TEXT.examsSetsEl.questionsCountSuffix}
                            </span>
                        </div>
                    </div>

                    {/* Tổng điểm */}
                    <div className="flex items-center gap-3 pt-4 sm:pt-0 lg:pl-6">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-50">
                            <Award className="size-5 text-violet-500" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{UI_TEXT.examsSetsEl.labelTotalPoints}</span>
                            <span className="mt-1 text-[13px] font-extrabold text-slate-800">
                                {questions.reduce((sum, q) => sum + q.points, 0) + essayQuestions.reduce((sum, q) => sum + q.points, 0)}
                                {UI_TEXT.examsSetsEl.pointsSuffix}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs bar */}
            <div className="flex shrink-0 items-center gap-6 border-b border-slate-100">
                <button
                    onClick={() => setActiveTab("quiz")}
                    className={cx(
                        "flex items-center gap-2 border-b-2 px-1 py-3 text-[13.5px] font-bold transition duration-150",
                        activeTab === "quiz" ? "border-wine text-wine" : "border-transparent text-slate-400 hover:text-slate-600",
                    )}
                >
                    <CheckCircle2 className="size-4" />
                    <span>{UI_TEXT.examsSetsEl.tabQuiz}</span>
                </button>
                <button
                    onClick={() => setActiveTab("essay")}
                    className={cx(
                        "flex items-center gap-2 border-b-2 px-1 py-3 text-[13.5px] font-bold transition duration-150",
                        activeTab === "essay" ? "border-wine text-wine" : "border-transparent text-slate-400 hover:text-slate-600",
                    )}
                >
                    <FileText className="size-4" />
                    <span>{UI_TEXT.examsSetsEl.tabEssay}</span>
                </button>
            </div>

            {/* Tab content area */}
            <div className="rounded-2xl border border-slate-100 bg-white shadow-xs">
                {activeTab === "quiz" ? (
                    <div className="flex flex-col">
                        {/* Section Header */}
                        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                            <h3 className="text-[14.5px] font-bold text-slate-800">{UI_TEXT.examsSetsEl.questionsHeader}</h3>
                            <Button
                                color="primary"
                                size="md"
                                onClick={handleCreateQuestion}
                                className="gap-2 border-none bg-wine px-5 font-bold text-white shadow-md shadow-wine/20 hover:bg-wine-deep"
                                iconLeading={<Plus className="size-4 shrink-0" />}
                            >
                                {UI_TEXT.examsSetsEl.btnCreateQuestion}
                            </Button>
                        </div>

                        {/* Questions list */}
                        <div className="flex flex-col gap-6 p-6">
                            {questions.length === 0 ? (
                                <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 text-center text-slate-400">
                                    <HelpCircle className="size-8 text-slate-300" />
                                    <p className="text-sm font-semibold">{UI_TEXT.examsSetsEl.noData}</p>
                                </div>
                            ) : (
                                questions.map((q, index) => (
                                    <div key={q.id} className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
                                        {/* Question header row */}
                                        <div className="flex items-start justify-between gap-4">
                                            <h4 className="text-[14.5px] leading-snug font-bold text-slate-900">
                                                {index + 1}
                                                {UI_TEXT.examsSetsEl.dotSeparator}
                                                {q.text}
                                            </h4>
                                            <div className="flex shrink-0 items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditQuestion(q)}
                                                    className="inline-flex items-center justify-center rounded-lg border border-sky-100 bg-white p-2 text-sky-500 shadow-sm transition hover:border-sky-200 hover:bg-sky-50/50 hover:text-sky-600"
                                                    title={UI_TEXT.examsSetsEl.editSet}
                                                >
                                                    <Edit className="size-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteQuestion(q.id)}
                                                    className="inline-flex items-center justify-center rounded-lg border border-rose-100 bg-white p-2 text-rose-500 shadow-sm transition hover:border-rose-200 hover:bg-rose-50/50 hover:text-rose-600"
                                                    title={UI_TEXT.examsSetsEl.deleteSet}
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </button>
                                                <span className="rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1 text-xs font-bold text-slate-700">
                                                    {q.points}
                                                    {UI_TEXT.examsSetsEl.pointsSuffix}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Explanation box */}
                                        <div className="rounded-lg border border-slate-100 bg-slate-50/40 p-4 text-[13px] leading-relaxed font-medium text-slate-500">
                                            {q.explanation}
                                        </div>

                                        {/* Choices */}
                                        <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                                            {q.options.map((opt) => (
                                                <div
                                                    key={opt.id}
                                                    className={cx(
                                                        "flex items-center gap-2.5 rounded-xl p-3.5 text-xs transition duration-150",
                                                        opt.isCorrect
                                                            ? "border border-emerald-200 bg-emerald-50/30 font-semibold text-emerald-800"
                                                            : "border border-slate-200 bg-white font-medium text-slate-600",
                                                    )}
                                                >
                                                    {opt.isCorrect ? (
                                                        <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                                                    ) : (
                                                        <Circle className="size-4 shrink-0 text-slate-400" />
                                                    )}
                                                    <span>
                                                        {opt.label}
                                                        {UI_TEXT.examsSetsEl.dotSeparator}
                                                        {opt.text}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    /* Essay tab view */
                    <div className="flex flex-col">
                        {/* Section Header */}
                        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                            <h3 className="text-[14.5px] font-bold text-slate-800">{UI_TEXT.examsSetsEl.labelEssayQuestionsList}</h3>
                            <Button
                                color="primary"
                                size="md"
                                onClick={handleCreateEssayQuestion}
                                className="gap-2 border-none bg-wine px-5 font-bold text-white shadow-md shadow-wine/20 hover:bg-wine-deep"
                                iconLeading={<Plus className="size-4 shrink-0" />}
                            >
                                {UI_TEXT.examsSetsEl.btnCreateEssayQuestion}
                            </Button>
                        </div>

                        {/* Essay Questions list */}
                        <div className="flex flex-col gap-6 p-6">
                            {essayQuestions.length === 0 ? (
                                <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 text-center text-slate-400">
                                    <HelpCircle className="size-8 text-slate-300" />
                                    <p className="text-sm font-semibold">{UI_TEXT.examsSetsEl.labelNoEssayQuestions}</p>
                                </div>
                            ) : (
                                essayQuestions.map((q, index) => (
                                    <div key={q.id} className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
                                        {/* Question header row */}
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex flex-col gap-1">
                                                <h4 className="text-[14.5px] leading-snug font-bold text-slate-900">
                                                    {index + 1}
                                                    {UI_TEXT.examsSetsEl.dotSeparator}
                                                    {q.title}
                                                </h4>
                                                <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-400">
                                                    <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-600">{q.language}</span>
                                                    <span>{"•"}</span>
                                                    <span>
                                                        {UI_TEXT.examsSetsEl.labelFunctionNamePrefix}
                                                        {q.functionName}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditEssayQuestion(q)}
                                                    className="inline-flex items-center justify-center rounded-lg border border-sky-100 bg-white p-2 text-sky-500 shadow-sm transition hover:border-sky-200 hover:bg-sky-50/50 hover:text-sky-600"
                                                    title={UI_TEXT.examsSetsEl.tooltipEditQuestion}
                                                >
                                                    <Edit className="size-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteEssayQuestion(q.id)}
                                                    className="inline-flex items-center justify-center rounded-lg border border-rose-100 bg-white p-2 text-rose-500 shadow-sm transition hover:border-rose-200 hover:bg-rose-50/50 hover:text-rose-600"
                                                    title={UI_TEXT.examsSetsEl.tooltipDeleteQuestion}
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </button>
                                                <span className="rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1 text-xs font-bold text-slate-700">
                                                    {q.points}
                                                    {UI_TEXT.examsSetsEl.pointsSuffix}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Detail box */}
                                        <div
                                            className="prose max-w-none rounded-lg border border-slate-100 bg-slate-50/40 p-4 text-[13px] leading-relaxed font-medium text-slate-500"
                                            dangerouslySetInnerHTML={{ __html: q.detail }}
                                        />

                                        {/* Template Code Preview */}
                                        {q.templateCode && (
                                            <div className="overflow-x-auto rounded-lg bg-slate-900 p-4 font-mono text-xs whitespace-pre text-emerald-400">
                                                {q.templateCode}
                                            </div>
                                        )}

                                        {/* Test cases summary */}
                                        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                            {q.testCases
                                                .filter((tc) => tc.input || tc.output)
                                                .map((tc, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="rounded-xl border border-slate-100 bg-slate-50/20 p-3 text-[11px] font-semibold text-slate-500"
                                                    >
                                                        <span className="mb-1 block text-[10px] font-bold text-rose-600">
                                                            {UI_TEXT.examsSetsEl.labelTestCasePrefix}
                                                            {idx + 1}
                                                        </span>
                                                        <div className="truncate">
                                                            <span className="text-slate-400">{UI_TEXT.examsSetsEl.labelInputPrefix}</span>
                                                            {tc.input || UI_TEXT.examsSetsEl.labelNotAvailable}
                                                        </div>
                                                        <div className="truncate">
                                                            <span className="text-slate-400">{UI_TEXT.examsSetsEl.labelOutputPrefix}</span>
                                                            {tc.output || UI_TEXT.examsSetsEl.labelNotAvailable}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            <QuestionModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedQuestion(null);
                }}
                question={selectedQuestion}
                onSave={handleSaveQuestion}
            />

            <EssayQuestionModal
                isOpen={isEssayModalOpen}
                onClose={() => {
                    setIsEssayModalOpen(false);
                    setSelectedEssayQuestion(null);
                }}
                question={selectedEssayQuestion}
                onSave={handleSaveEssayQuestion}
            />
        </div>
    );
}
