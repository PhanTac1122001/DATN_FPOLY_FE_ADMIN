"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BookText, ChevronRight, Code2, FileText, X } from "lucide-react";
import { Button } from "@/components/base/buttons/button";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { HOMEWORK_DIFFICULTY_LEVELS } from "@/constants/ui-components.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { createHomework } from "@/services/homework.service";
import { toast } from "@/services/toast.service";
import { type AddLessonModalProps } from "@/types/courseware.types";
import { HomeworkDifficultyEnum, type HomeworkDifficultyLevel } from "@/types/group.types";
import { PracticeFormModal } from "./practice-form-modal";

const stepChoose = 1;
const stepForm = 2;

export function AddLessonModal({
    mode = "create",
    isOpen,
    onOpenChange,
    sessionId,
    courseId,
    sessionName,
    lessonName,
    setLessonName,
    onSubmit,
    onSelectPractice,
    onSelectHomework,
    isPending,
}: AddLessonModalProps) {
    const queryClient = useQueryClient();
    const [step, setStep] = useState<typeof stepChoose | typeof stepForm>(mode === "edit" ? stepForm : stepChoose);
    const [selectedOption, setSelectedOption] = useState<"lesson" | "practice" | "homework">("lesson");
    const [submitted, setSubmitted] = useState(false);

    // Homework Form state
    const [homeworkTitle, setHomeworkTitle] = useState("");
    const [homeworkDifficultyLevel, setHomeworkDifficultyLevel] = useState<HomeworkDifficultyLevel>(HomeworkDifficultyEnum.MEDIUM);
    const [homeworkDescription, setHomeworkDescription] = useState("");
    const [homeworkCriteria, setHomeworkCriteria] = useState("");
    const [homeworkSampleLink, setHomeworkSampleLink] = useState("");

    useEffect(() => {
        if (isOpen) {
            setStep(mode === "edit" ? stepForm : stepChoose);
            setSelectedOption("lesson");
            setSubmitted(false);
            setHomeworkTitle("");
            setHomeworkDifficultyLevel(HomeworkDifficultyEnum.MEDIUM);
            setHomeworkDescription("");
            setHomeworkCriteria("");
            setHomeworkSampleLink("");
        }
    }, [isOpen, mode]);

    // Mutation for creating Homework
    const createHomeworkMutation = useMutation({
        mutationFn: async () => {
            return createHomework({
                sessionId,
                courseId: courseId || "",
                title: homeworkTitle.trim(),
                difficultyLevel: homeworkDifficultyLevel,
                description: homeworkDescription.trim(),
                gradingCriteria: homeworkCriteria.trim() || undefined,
                sampleLink: homeworkSampleLink.trim() || undefined,
            });
        },
        onSuccess: () => {
            toast.success(UI_TEXT.courseClassModal.toastCreateSuccessTitle, UI_TEXT.addLessonModal.toastHomeworkSuccess);
            queryClient.invalidateQueries({ queryKey: ["homeworks", sessionId] });
            if (onSelectHomework) {
                onSelectHomework();
            }
            onOpenChange(false);
        },
        onError: () => {
            toast.error(UI_TEXT.courseClassModal.toastCreateErrorTitle, UI_TEXT.addLessonModal.toastHomeworkError);
        },
    });

    const handleSelectAndContinue = (option: "lesson" | "practice" | "homework") => {
        setSelectedOption(option);
        setSubmitted(false);
        setStep(stepForm);
    };

    const handleStep2Submit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        if (selectedOption === "lesson") {
            if (!lessonName.trim()) return;
            onSubmit(e);
        } else if (selectedOption === "homework") {
            if (!homeworkTitle.trim()) return;
            createHomeworkMutation.mutate();
        }
    };

    if (isOpen && selectedOption === "practice" && step === stepForm && mode !== "edit") {
        return (
            <PracticeFormModal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                sessionId={sessionId}
                courseId={courseId}
                sessionName={sessionName}
                onSuccess={onSelectPractice}
                onBack={() => setStep(stepChoose)}
            />
        );
    }

    return (
        <CustomModal.Root open={isOpen} onOpenChange={onOpenChange}>
            <CustomModal.Content className="w-full max-w-3xl !rounded-[28px]">
                <Dialog className="custom-scrollbar relative flex max-h-[90vh] flex-col gap-6 overflow-y-auto rounded-[28px] bg-white p-7 shadow-2xl outline-none sm:p-8">
                    {(step === 1 || mode === "edit") && (
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="absolute top-5 right-5 z-10 cursor-pointer rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                        >
                            <X className="size-5" />
                        </button>
                    )}

                    {step === 1 && mode !== "edit" ? (
                        /* STEP 1: Choose Content Type - Stacked Horizontal Layout matching Screenshot */
                        <div className="flex flex-col gap-5">
                            <div className="border-b border-slate-100 pb-3 text-center">
                                <h3 className="text-xl font-extrabold text-slate-800">{UI_TEXT.addLessonModal.modalTitle}</h3>
                                <p className="mt-1 text-xs font-medium text-slate-400 sm:text-sm">
                                    {UI_TEXT.addLessonModal.modalDescPrefix}
                                    <strong>{sessionName}</strong>
                                </p>
                            </div>

                            {/* Stacked Options */}
                            <div className="my-1 flex flex-col gap-3.5">
                                {/* Option 1: Bài học */}
                                <button
                                    type="button"
                                    onClick={() => handleSelectAndContinue("lesson")}
                                    className="group flex w-full cursor-pointer items-center justify-between rounded-2xl border border-slate-200/90 p-4.5 text-left shadow-xs transition-all duration-200 hover:border-wine/60 hover:bg-wine/5 sm:p-5"
                                >
                                    <div className="flex min-w-0 items-center gap-4">
                                        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-25 text-blue-300 transition duration-200 group-hover:scale-105">
                                            <BookText className="size-6" />
                                        </div>
                                        <div className="flex min-w-0 flex-col">
                                            <span className="text-sm font-extrabold text-slate-800 transition group-hover:text-wine">
                                                {UI_TEXT.addLessonModal.lessonOptionTitle}
                                            </span>
                                            <span className="truncate text-xs font-medium text-slate-400">{UI_TEXT.addLessonModal.lessonOptionDesc}</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="ml-2 size-5 shrink-0 text-slate-300 transition duration-200 group-hover:translate-x-1 group-hover:text-wine" />
                                </button>

                                {/* Option 2: Bài tập thực hành */}
                                <button
                                    type="button"
                                    onClick={() => handleSelectAndContinue("practice")}
                                    className="group flex w-full cursor-pointer items-center justify-between rounded-2xl border border-slate-200/90 p-4.5 text-left shadow-xs transition-all duration-200 hover:border-wine/60 hover:bg-wine/5 sm:p-5"
                                >
                                    <div className="flex min-w-0 items-center gap-4">
                                        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-500 transition duration-200 group-hover:scale-105">
                                            <FileText className="size-6" />
                                        </div>
                                        <div className="flex min-w-0 flex-col">
                                            <span className="text-sm font-extrabold text-slate-800 transition group-hover:text-wine">
                                                {UI_TEXT.addLessonModal.practiceOptionTitle}
                                            </span>
                                            <span className="truncate text-xs font-medium text-slate-400">{UI_TEXT.addLessonModal.practiceOptionDesc}</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="ml-2 size-5 shrink-0 text-slate-300 transition duration-200 group-hover:translate-x-1 group-hover:text-wine" />
                                </button>

                                {/* Option 3: Bài tập về nhà */}
                                <button
                                    type="button"
                                    onClick={() => handleSelectAndContinue("homework")}
                                    className="group flex w-full cursor-pointer items-center justify-between rounded-2xl border border-slate-200/90 p-4.5 text-left shadow-xs transition-all duration-200 hover:border-wine/60 hover:bg-wine/5 sm:p-5"
                                >
                                    <div className="flex min-w-0 items-center gap-4">
                                        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-500 transition duration-200 group-hover:scale-105">
                                            <Code2 className="size-6" />
                                        </div>
                                        <div className="flex min-w-0 flex-col">
                                            <span className="text-sm font-extrabold text-slate-800 transition group-hover:text-wine">
                                                {UI_TEXT.addLessonModal.homeworkOptionTitle}
                                            </span>
                                            <span className="truncate text-xs font-medium text-slate-400">{UI_TEXT.addLessonModal.homeworkOptionDesc}</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="ml-2 size-5 shrink-0 text-slate-300 transition duration-200 group-hover:translate-x-1 group-hover:text-wine" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* STEP 2: Configure selected Option */
                        <form onSubmit={handleStep2Submit} className="animate-fadeIn flex flex-col gap-5">
                            {/* Shared Step 2 Header */}
                            <div className="relative flex flex-col items-center gap-1 border-b border-slate-100 pb-5 text-center">
                                {mode !== "edit" && (
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="absolute top-0 left-0 z-10 shrink-0 cursor-pointer rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                        title={UI_TEXT.addLessonModal.backTooltip}
                                    >
                                        <ArrowLeft className="size-5" />
                                    </button>
                                )}
                                <h3 className="text-xl font-extrabold text-slate-800">
                                    {selectedOption === "lesson" &&
                                        (mode === "edit" ? UI_TEXT.addLessonModal.editLessonTitle : UI_TEXT.addLessonModal.addLessonTitle)}
                                    {selectedOption === "practice" && UI_TEXT.addLessonModal.addPracticeTitle}
                                    {selectedOption === "homework" && UI_TEXT.addLessonModal.addHomeworkTitle}
                                </h3>
                                <p className="mt-0.5 text-xs font-medium text-slate-400">
                                    {selectedOption === "lesson" &&
                                        (mode === "edit" ? (
                                            <>
                                                {UI_TEXT.addLessonModal.editLessonSubPrefix}
                                                <strong>{sessionName}</strong>
                                            </>
                                        ) : (
                                            <>
                                                {UI_TEXT.addLessonModal.addLessonSubPrefix}
                                                <strong>{sessionName}</strong>
                                            </>
                                        ))}
                                    {selectedOption === "practice" && (
                                        <>
                                            {UI_TEXT.addLessonModal.addPracticeSubPrefix}
                                            <strong>{sessionName}</strong>
                                        </>
                                    )}
                                    {selectedOption === "homework" && (
                                        <>
                                            {UI_TEXT.addLessonModal.addHomeworkSubPrefix}
                                            <strong>{sessionName}</strong>
                                        </>
                                    )}
                                </p>
                            </div>

                            {selectedOption === "lesson" && (
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-slate-700">
                                            {UI_TEXT.addLessonModal.lessonNameLabel} <span className="text-red-500">{"*"}</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={lessonName}
                                            onChange={(e) => setLessonName(e.target.value)}
                                            placeholder={UI_TEXT.courseDetail.lessonNamePlaceholder}
                                            className={`w-full rounded-full border bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:outline-none ${
                                                submitted && !lessonName.trim()
                                                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                                                    : "border-slate-200 focus:border-wine focus:ring-wine/10"
                                            }`}
                                            autoFocus
                                        />
                                        {submitted && !lessonName.trim() && (
                                            <p className="mt-0.5 text-[11px] font-medium text-red-500">{UI_TEXT.common.fieldRequired}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedOption === "homework" && (
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-slate-700">
                                            {UI_TEXT.addLessonModal.homeworkTitleLabel} <span className="text-red-500">{"*"}</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={homeworkTitle}
                                            onChange={(e) => setHomeworkTitle(e.target.value)}
                                            placeholder={UI_TEXT.addLessonModal.homeworkTitlePlaceholder}
                                            className={`w-full rounded-full border bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:outline-none ${
                                                submitted && !homeworkTitle.trim()
                                                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                                                    : "border-slate-200 focus:border-wine focus:ring-wine/10"
                                            }`}
                                            autoFocus
                                        />
                                        {submitted && !homeworkTitle.trim() && (
                                            <p className="mt-0.5 text-[11px] font-medium text-red-500">{UI_TEXT.common.fieldRequired}</p>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-slate-700">
                                            {UI_TEXT.homeworkEditor.difficultyLevelLabel}
                                        </label>
                                        <div className="flex flex-wrap items-center gap-2">
                                            {HOMEWORK_DIFFICULTY_LEVELS.map((lvl) => {
                                                const isSelected = homeworkDifficultyLevel === lvl.id;
                                                return (
                                                    <button
                                                        key={lvl.id}
                                                        type="button"
                                                        onClick={() => setHomeworkDifficultyLevel(lvl.id)}
                                                        className={`cursor-pointer rounded-full border px-3.5 py-1 text-xs font-bold transition-all ${
                                                            isSelected
                                                                ? `${lvl.badgeColor} ring-2 ring-wine/20 shadow-sm`
                                                                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                                                        }`}
                                                    >
                                                        {lvl.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-slate-700">{UI_TEXT.addLessonModal.homeworkDescLabel}</label>
                                        <textarea
                                            value={homeworkDescription}
                                            onChange={(e) => setHomeworkDescription(e.target.value)}
                                            placeholder={UI_TEXT.addLessonModal.homeworkDescPlaceholder}
                                            rows={3}
                                            className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 focus:border-wine focus:ring-2 focus:ring-wine/10 focus:outline-none"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-slate-700">{UI_TEXT.addLessonModal.homeworkCriteriaLabel}</label>
                                        <input
                                            type="text"
                                            value={homeworkCriteria}
                                            onChange={(e) => setHomeworkCriteria(e.target.value)}
                                            placeholder={UI_TEXT.addLessonModal.homeworkCriteriaPlaceholder}
                                            className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 focus:border-wine focus:ring-2 focus:ring-wine/10 focus:outline-none"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-slate-700">{UI_TEXT.addLessonModal.homeworkSampleLinkLabel}</label>
                                        <input
                                            type="url"
                                            value={homeworkSampleLink}
                                            onChange={(e) => setHomeworkSampleLink(e.target.value)}
                                            placeholder={UI_TEXT.addLessonModal.homeworkSampleLinkPlaceholder}
                                            className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 focus:border-wine focus:ring-2 focus:ring-wine/10 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            )}

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
                                    disabled={selectedOption === "lesson" ? isPending : createHomeworkMutation.isPending}
                                    className="hover:bg-wine-hover w-2/3 cursor-pointer rounded-full border-none bg-wine py-2.5 text-center text-xs font-black text-white shadow-sm transition active:scale-[0.98]"
                                >
                                    {selectedOption === "lesson"
                                        ? isPending
                                            ? UI_TEXT.addLessonModal.submittingText
                                            : mode === "edit"
                                              ? UI_TEXT.addLessonModal.saveBtn
                                              : UI_TEXT.courseDetail.confirmButton
                                        : createHomeworkMutation.isPending
                                          ? UI_TEXT.addLessonModal.submittingText
                                          : UI_TEXT.addLessonModal.addHomeworkBtn}
                                </Button>
                            </div>
                        </form>
                    )}
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
