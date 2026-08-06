"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BookText, ChevronRight, Code2, FileText, X } from "lucide-react";
import { Button } from "@/components/base/buttons/button";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { coursewareService } from "@/services/courseware.service";
import { createHomework } from "@/services/homework.service";
import { toast } from "@/services/toast.service";
import { type AddLessonModalProps, SubmissionTypeEnum } from "@/types/courseware.types";
import { PracticeFormFields } from "../components/practice-form-fields";

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

    // Practice Form state
    const [practiceContent, setPracticeContent] = useState("");
    const [practiceSubmissionType, setPracticeSubmissionType] = useState<"LINK" | "FILE" | "TEXT">(SubmissionTypeEnum.LINK);
    const [resources, setResources] = useState<{ label: string; url: string }[]>([]);

    // Homework Form state
    const [homeworkTitle, setHomeworkTitle] = useState("");
    const [homeworkDescription, setHomeworkDescription] = useState("");
    const [homeworkCriteria, setHomeworkCriteria] = useState("");
    const [homeworkSampleLink, setHomeworkSampleLink] = useState("");

    useEffect(() => {
        if (isOpen) {
            setStep(mode === "edit" ? stepForm : stepChoose);
            setSelectedOption("lesson");
            setPracticeContent("");
            setPracticeSubmissionType(SubmissionTypeEnum.LINK);
            setResources([]);
            setHomeworkTitle("");
            setHomeworkDescription("");
            setHomeworkCriteria("");
            setHomeworkSampleLink("");
        }
    }, [isOpen, mode]);

    // Mutation for creating Practice
    const createPracticeMutation = useMutation({
        mutationFn: async () => {
            return coursewareService.createSessionBlock(sessionId, {
                type: "PRACTICE",
                title: "Bài thực hành cấp buổi",
                isRequired: true,
                payload: {
                    submissionType: practiceSubmissionType,
                    content: practiceContent.trim(),
                    resources: resources.filter((r) => r.url.trim() !== ""),
                },
                completionCriteria: {
                    requireSubmission: true,
                },
            });
        },
        onSuccess: () => {
            toast.success(UI_TEXT.courseClassModal.toastCreateSuccessTitle, UI_TEXT.addLessonModal.toastPracticeSuccess);
            queryClient.invalidateQueries({ queryKey: ["session-blocks", sessionId] });
            if (courseId) {
                queryClient.invalidateQueries({ queryKey: ["sessions", courseId] });
            }
            if (onSelectPractice) {
                onSelectPractice();
            }
            onOpenChange(false);
        },
        onError: () => {
            toast.error(UI_TEXT.courseClassModal.toastCreateErrorTitle, UI_TEXT.addLessonModal.toastPracticeError);
        },
    });

    // Mutation for creating Homework
    const createHomeworkMutation = useMutation({
        mutationFn: async () => {
            return createHomework({
                sessionId,
                courseId: courseId || "",
                title: homeworkTitle.trim(),
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
        setStep(stepForm);
    };

    const handleStep2Submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedOption === "lesson") {
            onSubmit(e);
        } else if (selectedOption === "practice") {
            createPracticeMutation.mutate();
        } else if (selectedOption === "homework") {
            createHomeworkMutation.mutate();
        }
    };

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
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-medium text-slate-600">{UI_TEXT.addLessonModal.lessonNameLabel}</label>
                                        <input
                                            type="text"
                                            value={lessonName}
                                            onChange={(e) => setLessonName(e.target.value)}
                                            placeholder={UI_TEXT.courseDetail.lessonNamePlaceholder}
                                            className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold focus:border-wine focus:outline-none"
                                            autoFocus
                                            required
                                        />
                                    </div>

                                    {/* Section Logic Qua Bài */}
                                    <div className="flex flex-col gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4">
                                        <div className="flex items-center gap-2 text-xs font-extrabold tracking-wider text-wine uppercase">
                                            <span>{UI_TEXT.addLessonModal.lessonRulesTitle}</span>
                                        </div>

                                        <div className="flex flex-col gap-2.5 pt-1">
                                            <label className="flex cursor-pointer items-center gap-3 text-xs font-bold text-slate-700">
                                                <input type="checkbox" defaultChecked={true} className="size-4 cursor-pointer rounded accent-wine" />
                                                <span>{UI_TEXT.addLessonModal.ruleRequireCompleteNext}</span>
                                            </label>

                                            <label className="flex cursor-pointer items-center gap-3 text-xs font-bold text-slate-700">
                                                <input type="checkbox" defaultChecked={true} className="size-4 cursor-pointer rounded accent-wine" />
                                                <span>{UI_TEXT.addLessonModal.ruleRequireDuration}</span>
                                            </label>

                                            <label className="flex cursor-pointer items-center gap-3 text-xs font-bold text-slate-700">
                                                <input type="checkbox" defaultChecked={false} className="size-4 cursor-pointer rounded accent-wine" />
                                                <span>{UI_TEXT.addLessonModal.ruleRequirePassScore}</span>
                                            </label>

                                            <label className="flex cursor-pointer items-center gap-3 text-xs font-bold text-slate-700">
                                                <input type="checkbox" defaultChecked={true} className="size-4 cursor-pointer rounded accent-wine" />
                                                <span>{UI_TEXT.addLessonModal.ruleAllowRetake}</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedOption === "practice" && (
                                <PracticeFormFields
                                    submissionType={practiceSubmissionType}
                                    setSubmissionType={setPracticeSubmissionType}
                                    content={practiceContent}
                                    setContent={setPracticeContent}
                                    resources={resources}
                                    setResources={setResources}
                                />
                            )}

                            {selectedOption === "homework" && (
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-medium text-slate-600">{UI_TEXT.addLessonModal.homeworkTitleLabel}</label>
                                        <input
                                            type="text"
                                            value={homeworkTitle}
                                            onChange={(e) => setHomeworkTitle(e.target.value)}
                                            placeholder={UI_TEXT.addLessonModal.homeworkTitlePlaceholder}
                                            className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold focus:border-wine focus:outline-none"
                                            required
                                            autoFocus
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-medium text-slate-600">{UI_TEXT.addLessonModal.homeworkDescLabel}</label>
                                        <textarea
                                            value={homeworkDescription}
                                            onChange={(e) => setHomeworkDescription(e.target.value)}
                                            placeholder={UI_TEXT.addLessonModal.homeworkDescPlaceholder}
                                            rows={3}
                                            className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold focus:border-wine focus:outline-none"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-medium text-slate-600">{UI_TEXT.addLessonModal.homeworkCriteriaLabel}</label>
                                        <input
                                            type="text"
                                            value={homeworkCriteria}
                                            onChange={(e) => setHomeworkCriteria(e.target.value)}
                                            placeholder={UI_TEXT.addLessonModal.homeworkCriteriaPlaceholder}
                                            className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold focus:border-wine focus:outline-none"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-medium text-slate-600">{UI_TEXT.addLessonModal.homeworkSampleLinkLabel}</label>
                                        <input
                                            type="url"
                                            value={homeworkSampleLink}
                                            onChange={(e) => setHomeworkSampleLink(e.target.value)}
                                            placeholder={UI_TEXT.addLessonModal.homeworkSampleLinkPlaceholder}
                                            className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold focus:border-wine focus:outline-none"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="mt-2 flex w-full items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => onOpenChange(false)}
                                    className="w-1/3 cursor-pointer rounded-full border border-slate-200 bg-slate-50 py-3 text-center text-sm font-bold text-slate-600 transition hover:bg-slate-100 active:scale-[0.98]"
                                >
                                    {UI_TEXT.addLessonModal.cancelBtn}
                                </button>
                                <Button
                                    type="submit"
                                    disabled={
                                        selectedOption === "lesson"
                                            ? isPending || !lessonName.trim()
                                            : selectedOption === "practice"
                                              ? createPracticeMutation.isPending
                                              : createHomeworkMutation.isPending || !homeworkTitle.trim()
                                    }
                                    className="hover:bg-wine-hover w-2/3 cursor-pointer rounded-full border-none bg-wine py-3 text-center text-sm font-black text-white transition active:scale-[0.98]"
                                >
                                    {selectedOption === "lesson"
                                        ? isPending
                                            ? UI_TEXT.addLessonModal.submittingText
                                            : mode === "edit"
                                              ? UI_TEXT.addLessonModal.saveBtn
                                              : UI_TEXT.courseDetail.confirmButton
                                        : selectedOption === "practice"
                                          ? createPracticeMutation.isPending
                                              ? UI_TEXT.addLessonModal.submittingText
                                              : UI_TEXT.addLessonModal.addPracticeBtn
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
