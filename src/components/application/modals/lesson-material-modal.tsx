"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Book, CheckCircle2, ChevronDown, ChevronRight, Circle, Eye, File, FileText, Film, HelpCircle, Plus, Search, Trash2, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { ConfirmModal } from "@/components/application/modals/confirm-modal";
import { Button } from "@/components/base/buttons/button";
import { TiptapEditor } from "@/components/base/editor";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { configureLessonReading, configureLessonVideo, getLessonDetails, getQuizzesList, linkLessonQuiz } from "@/services/material.service";
import { toast } from "@/services/toast.service";
import { type EmbeddedOption, type EmbeddedQuestion, EmbeddedQuestionTypeEnum, type Lesson, type Quiz } from "@/types/material.types";
import { PreviewPlayer } from "./preview-player";

const maxOptionsCount = 6;
const minOptionsCount = 2;
const minSpaceAboveForDropdown = 185;
const dropdownTopOffset = 38;
const minSpaceAboveForQuizDropdown = 250;
const modalBottomOffset = 6;
const quizDropdownTopOffset = 42;

export function LessonMaterialModal({
    isOpen,
    onClose,
    lesson,
    initialTab = "video",
}: {
    isOpen: boolean;
    onClose: () => void;
    lesson: Lesson;
    initialTab?: "video" | "reading" | "quiz" | "preview";
}) {
    const [activeTab, setActiveTab] = useState<"video" | "reading" | "quiz" | "preview">(initialTab);
    const [localLesson, setLocalLesson] = useState<Lesson>(lesson);

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
        }
    }, [isOpen, initialTab]);

    const { data: updatedLesson } = useQuery({
        queryKey: ["lesson-details", lesson.id],
        queryFn: () => getLessonDetails(lesson.id),
        enabled: isOpen,
    });

    useEffect(() => {
        if (updatedLesson) setLocalLesson(updatedLesson);
    }, [updatedLesson]);

    const { data: quizzes = [] } = useQuery({
        queryKey: ["quizzes-list"],
        queryFn: getQuizzesList,
        enabled: isOpen && activeTab === "quiz",
    });

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="w-full max-w-3xl !rounded-[24px]">
                <Dialog className="flex max-h-[90vh] flex-col overflow-hidden rounded-[24px] bg-white p-6 shadow-2xl outline-none">
                    {/* Header */}
                    <div className="flex shrink-0 items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                            <Heading slot="title" className="text-lg font-black text-slate-800">
                                {UI_TEXT.learningMaterials.modalTitle}
                            </Heading>
                            <p className="mt-0.5 text-xs font-semibold text-slate-400">{localLesson.name}</p>
                        </div>
                        <button onClick={onClose} className="cursor-pointer rounded-lg p-1 hover:bg-slate-100">
                            <X className="size-5 text-slate-400" />
                        </button>
                    </div>

                    {/* Tabs navigation */}
                    <div className="mt-3 flex shrink-0 border-b border-slate-100">
                        <button
                            onClick={() => setActiveTab("video")}
                            className={`flex cursor-pointer items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
                                activeTab === "video" ? "border-wine text-wine" : "border-transparent text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            <Film className="size-4" />
                            {UI_TEXT.lessonMaterialModal.tabVideo}
                        </button>
                        <button
                            onClick={() => setActiveTab("quiz")}
                            className={`flex cursor-pointer items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
                                activeTab === "quiz" ? "border-wine text-wine" : "border-transparent text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            <HelpCircle className="size-4" />
                            {UI_TEXT.lessonMaterialModal.tabQuiz}
                        </button>
                        <button
                            onClick={() => setActiveTab("reading")}
                            className={`flex cursor-pointer items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
                                activeTab === "reading" ? "border-wine text-wine" : "border-transparent text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            <Book className="size-4" />
                            {UI_TEXT.lessonMaterialModal.tabReading}
                        </button>
                        <button
                            onClick={() => setActiveTab("preview")}
                            className={`ml-auto flex cursor-pointer items-center gap-1.5 rounded-t-lg border-b-2 bg-slate-50 px-4 py-2.5 text-xs font-bold transition hover:bg-slate-100 ${
                                activeTab === "preview" ? "border-wine bg-wine/5 text-wine" : "border-transparent text-slate-600"
                            }`}
                        >
                            <Eye className="size-4" />
                            {UI_TEXT.learningMaterials.tabPreview}
                        </button>
                    </div>

                    {/* Content panel */}
                    <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto py-4">
                        {activeTab === "video" && <VideoConfigTab lesson={localLesson} onSave={setLocalLesson} />}
                        {activeTab === "reading" && <ReadingConfigTab lesson={localLesson} onSave={setLocalLesson} />}
                        {activeTab === "quiz" && <QuizConfigTab lesson={localLesson} quizzes={quizzes} onSave={setLocalLesson} />}
                        {activeTab === "preview" && (
                            <PreviewPlayer
                                lesson={localLesson}
                                initialSubTab={initialTab === "video" || initialTab === "reading" || initialTab === "quiz" ? initialTab : undefined}
                            />
                        )}
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}

function VideoConfigTab({ lesson, onSave }: { lesson: Lesson; onSave: (l: Lesson) => void }) {
    const [url, setUrl] = useState(lesson.video?.url || "");
    const [duration, setDuration] = useState(lesson.video?.durationTime || 0);
    const [file, setFile] = useState<File | null>(null);

    // Simple Embedded Question creator state
    const [questions, setQuestions] = useState<EmbeddedQuestion[]>(lesson.video?.questions || []);
    const [expandedQuestionIndices, setExpandedQuestionIndices] = useState<number[]>([0]);
    const [deleteQuestionIndex, setDeleteQuestionIndex] = useState<number | null>(null);

    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        setQuestions(lesson.video?.questions || []);
        setSubmitted(false);
    }, [lesson.video?.questions, lesson.id]);

    const videoMutation = useMutation({
        mutationFn: () => {
            const fd = new FormData();
            if (file) fd.append("file", file);
            if (url) fd.append("url", url);
            fd.append("durationTime", String(duration));
            fd.append("questions", JSON.stringify(questions));

            return configureLessonVideo(lesson.id, fd);
        },
        onSuccess: (data) => {
            toast.success(UI_TEXT.lessonMaterialModal.toastSaveSuccess, UI_TEXT.lessonMaterialModal.toastUpdateVideoSuccess);
            onSave(data);
        },
        onError: () => {
            toast.error(UI_TEXT.lessonMaterialModal.toastSaveError, UI_TEXT.lessonMaterialModal.toastSaveVideoError);
        },
    });

    const addQuestion = () => {
        const newQuestions: EmbeddedQuestion[] = [
            ...questions,
            {
                content: "",
                type: EmbeddedQuestionTypeEnum.SINGLE_CHOICE,
                timeInVideo: 0,
                points: 1,
                options: [
                    { content: "", isCorrect: true },
                    { content: "", isCorrect: false },
                ],
            },
        ];
        setQuestions(newQuestions);
        setExpandedQuestionIndices([...expandedQuestionIndices, newQuestions.length - 1]);
    };

    const toggleQuestionExpand = (idx: number) => {
        if (expandedQuestionIndices.includes(idx)) {
            setExpandedQuestionIndices(expandedQuestionIndices.filter((i) => i !== idx));
        } else {
            setExpandedQuestionIndices([...expandedQuestionIndices, idx]);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">{UI_TEXT.lessonMaterialModal.labelUploadVideoFile}</label>
                <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-xs" />
            </div>

            <div className="my-1 text-center text-xs font-bold text-slate-300 uppercase">{UI_TEXT.lessonMaterialModal.orSeparator}</div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">{UI_TEXT.lessonMaterialModal.labelDirectVideoUrl}</label>
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder={UI_TEXT.lessonMaterialModal.placeholderVideoUrl}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-wine focus:outline-none"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">{UI_TEXT.lessonMaterialModal.durationLabel}</label>
                <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    placeholder={UI_TEXT.lessonMaterialModal.placeholderDuration}
                    className="w-32 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs focus:border-wine focus:outline-none"
                />
            </div>

            {/* Video Questions form array */}
            <div className="mt-2 border-t border-slate-100 pt-4">
                <div className="mb-3 flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">{UI_TEXT.lessonMaterialModal.embeddedQuestionsTitle}</label>
                    <button
                        type="button"
                        onClick={addQuestion}
                        className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[9px] font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 active:scale-[0.98]"
                    >
                        {UI_TEXT.lessonMaterialModal.addEmbeddedQuestionBtn}
                    </button>
                </div>

                <div className="flex flex-col gap-3">
                    {questions.map((q, idx) => {
                        const isExpanded = expandedQuestionIndices.includes(idx);
                        return (
                            <div key={idx} className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/20 transition-all duration-200">
                                {/* Header */}
                                <div
                                    onClick={() => toggleQuestionExpand(idx)}
                                    className="flex cursor-pointer items-center justify-between bg-slate-50/40 p-3.5 transition duration-150 select-none hover:bg-slate-50/80"
                                >
                                    <div className="flex min-w-0 flex-1 items-center gap-2">
                                        {isExpanded ? (
                                            <ChevronDown className="size-4 shrink-0 text-slate-400" />
                                        ) : (
                                            <ChevronRight className="size-4 shrink-0 text-slate-400" />
                                        )}
                                        <span className="shrink-0 text-xs font-bold text-slate-700">
                                            {UI_TEXT.lessonMaterialModal.embeddedQuestionLabel} {idx + 1}
                                        </span>
                                        <span className="truncate text-[10px] font-semibold text-slate-400">
                                            {UI_TEXT.lessonMaterialModal.timePointPrefix} {q.timeInVideo}
                                            {UI_TEXT.lessonMaterialModal.secondsSuffix} {q.content ? `- ${q.content}` : ""}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteQuestionIndex(idx);
                                        }}
                                        className="cursor-pointer rounded p-1 text-slate-400 transition hover:text-red-500"
                                        title={UI_TEXT.lessonMaterialModal.deleteEmbeddedQuestion}
                                    >
                                        <Trash2 className="size-3.5" />
                                    </button>
                                </div>

                                {/* Body */}
                                {isExpanded && (
                                    <div className="flex flex-col gap-3 border-t border-slate-100/60 p-3.5 pt-3">
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="col-span-2 flex flex-col gap-1.5">
                                                <label className="text-xs font-bold text-slate-700">
                                                    {UI_TEXT.lessonMaterialModal.questionContentLabel} <span className="text-red-500">{"*"}</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={q.content}
                                                    onChange={(e) => {
                                                        const copy = [...questions];
                                                        copy[idx].content = e.target.value;
                                                        setQuestions(copy);
                                                    }}
                                                    placeholder={UI_TEXT.lessonMaterialModal.placeholderQuestionContent}
                                                    className={`w-full rounded-full border bg-white px-4 py-2 text-xs font-semibold text-slate-800 transition duration-150 focus:ring-2 focus:outline-none ${
                                                        submitted && !(q.content || "").trim()
                                                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                                                            : "border-slate-200 focus:border-wine focus:ring-wine/10"
                                                    }`}
                                                />
                                                {submitted && !(q.content || "").trim() && (
                                                    <p className="mt-0.5 text-[11px] font-medium text-red-500">{UI_TEXT.common.fieldRequired}</p>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-bold text-slate-700">
                                                    {UI_TEXT.lessonMaterialModal.timePointLabel} <span className="text-red-500">{"*"}</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    value={q.timeInVideo}
                                                    onChange={(e) => {
                                                        const copy = [...questions];
                                                        let val = e.target.value;
                                                        if (val.length > 1 && val.startsWith("0")) {
                                                            val = val.replace(/^0+/, "");
                                                        }
                                                        copy[idx].timeInVideo = val === "" ? 0 : Number(val);
                                                        setQuestions(copy);
                                                    }}
                                                    onFocus={(e) => e.target.select()}
                                                    className={`w-full rounded-full border bg-white px-4 py-2 text-xs font-semibold text-slate-800 transition duration-150 focus:ring-2 focus:outline-none ${
                                                        submitted && (q.timeInVideo === undefined || q.timeInVideo === null || q.timeInVideo < 0)
                                                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                                                            : "border-slate-200 focus:border-wine focus:ring-wine/10"
                                                    }`}
                                                />
                                                {submitted && (q.timeInVideo === undefined || q.timeInVideo === null || q.timeInVideo < 0) && (
                                                    <p className="mt-0.5 text-[11px] font-medium text-red-500">{UI_TEXT.common.invalidTime}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-2 flex flex-col gap-2.5">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-bold text-slate-700">{UI_TEXT.lessonMaterialModal.optionsListLabel}</label>
                                                {(q.options?.length ?? 0) < maxOptionsCount && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const copy = [...questions];
                                                            const targetOptions = copy[idx].options ? [...copy[idx].options] : [];
                                                            targetOptions.push({ content: "", isCorrect: false });
                                                            copy[idx] = { ...copy[idx], options: targetOptions };
                                                            setQuestions(copy);
                                                        }}
                                                        className="flex cursor-pointer items-center gap-1 rounded-lg border border-slate-100 bg-slate-50 px-2 py-1 text-[9px] font-bold text-blue-600 transition hover:bg-slate-100 hover:text-blue-700"
                                                    >
                                                        <Plus className="size-3 text-blue-600" />
                                                        <span>{UI_TEXT.lessonMaterialModal.addOptionBtn}</span>
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                {(q.options || []).map((opt: EmbeddedOption, optIdx: number) => {
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
                                                                    onClick={() => {
                                                                        const copy = [...questions];
                                                                        const targetOptions = (copy[idx].options || []).map((o, oIdx) => ({
                                                                            ...o,
                                                                            isCorrect: oIdx === optIdx,
                                                                        }));
                                                                        copy[idx] = { ...copy[idx], options: targetOptions };
                                                                        setQuestions(copy);
                                                                    }}
                                                                    className="flex cursor-pointer items-center gap-1.5"
                                                                >
                                                                    {isCorrect ? (
                                                                        <CheckCircle2 className="size-4 fill-emerald-100 text-emerald-600" />
                                                                    ) : (
                                                                        <Circle className="size-4 text-slate-400" />
                                                                    )}
                                                                    <span
                                                                        className={`text-[11px] font-bold ${isCorrect ? "text-emerald-600" : "text-slate-400"}`}
                                                                    >
                                                                        {isCorrect
                                                                            ? UI_TEXT.lessonMaterialModal.optionCorrect
                                                                            : UI_TEXT.lessonMaterialModal.optionIncorrect}
                                                                    </span>
                                                                </button>
                                                                {(q.options?.length ?? 0) > minOptionsCount && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const copy = [...questions];
                                                                            const targetOptions = (copy[idx].options || []).filter(
                                                                                (_, oIdx) => oIdx !== optIdx,
                                                                            );
                                                                            if (isCorrect && targetOptions.length > 0) {
                                                                                targetOptions[0] = { ...targetOptions[0], isCorrect: true };
                                                                            }
                                                                            copy[idx] = { ...copy[idx], options: targetOptions };
                                                                            setQuestions(copy);
                                                                        }}
                                                                        className="cursor-pointer p-0.5 text-slate-400 transition hover:text-red-500"
                                                                        title={UI_TEXT.lessonMaterialModal.deleteOption}
                                                                    >
                                                                        <Trash2 className="size-3.5" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                                <input
                                                                    type="text"
                                                                    value={opt.content}
                                                                    onChange={(e) => {
                                                                        const copy = [...questions];
                                                                        const targetOptions = (copy[idx].options || []).map((o, oIdx) =>
                                                                            oIdx === optIdx ? { ...o, content: e.target.value } : o,
                                                                        );
                                                                        copy[idx] = { ...copy[idx], options: targetOptions };
                                                                        setQuestions(copy);
                                                                    }}
                                                                    placeholder={UI_TEXT.lessonMaterialModal.placeholderOptionText}
                                                                    className={`w-full rounded-full border bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 transition duration-150 focus:ring-2 focus:outline-none ${
                                                                        submitted && !(opt.content || "").trim()
                                                                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                                                                            : "border-slate-200 focus:border-wine focus:ring-wine/10"
                                                                    }`}
                                                                />
                                                                {submitted && !(opt.content || "").trim() && (
                                                                    <p className="px-1 text-[10px] font-medium text-red-500">{UI_TEXT.common.fieldRequired}</p>
                                                                )}
                                                            </div>
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
                </div>
            </div>

            <div className="mt-2 flex justify-end border-t border-slate-100 pt-4">
                <Button
                    onClick={() => {
                        setSubmitted(true);
                        const hasInvalidQuestion = questions.some((q) => {
                            const isQContentEmpty = !(q.content || "").trim();
                            const isTimeInv = q.timeInVideo === undefined || q.timeInVideo === null || q.timeInVideo < 0;
                            const isOptEmpty = (q.options || []).some((o) => !(o.content || "").trim());
                            return isQContentEmpty || isTimeInv || isOptEmpty;
                        });
                        if (hasInvalidQuestion) {
                            toast.error(UI_TEXT.lessonMaterialModal.toastSaveError, UI_TEXT.learningMaterials.invalidEmbeddedQuestions);
                            return;
                        }
                        videoMutation.mutate();
                    }}
                    isLoading={videoMutation.isPending}
                    className="border-none bg-wine py-1.5 text-xs font-bold text-white"
                >
                    {UI_TEXT.lessonMaterialModal.saveVideoBtn}
                </Button>
            </div>

            {/* Confirm Delete Question Modal */}
            <ConfirmModal
                isOpen={deleteQuestionIndex !== null}
                onClose={() => setDeleteQuestionIndex(null)}
                onConfirm={() => {
                    if (deleteQuestionIndex !== null) {
                        const copy = [...questions];
                        copy.splice(deleteQuestionIndex, 1);
                        setQuestions(copy);
                        setExpandedQuestionIndices((prev) => prev.filter((i) => i !== deleteQuestionIndex).map((i) => (i > deleteQuestionIndex ? i - 1 : i)));
                        setDeleteQuestionIndex(null);
                    }
                }}
                title={UI_TEXT.lessonMaterialModal.confirmDeleteTitle}
                message={UI_TEXT.lessonMaterialModal.confirmDeleteQuestionMsg}
                confirmText={UI_TEXT.lessonMaterialModal.deleteBtn}
                cancelText={UI_TEXT.common.cancel}
                variant="danger"
            />
        </div>
    );
}

function ReadingConfigTab({ lesson, onSave }: { lesson: Lesson; onSave: (l: Lesson) => void }) {
    const [content, setContent] = useState(lesson.reading?.content || "");
    const [file, setFile] = useState<File | null>(null);
    const [questions, _setQuestions] = useState<EmbeddedQuestion[]>(lesson.reading?.questions || []);
    const [readingType, setReadingType] = useState<"pdf" | "text" | "">("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [openDirection, setOpenDirection] = useState<"up" | "down">("down");
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (file || lesson.reading?.pdf) {
            setReadingType("pdf");
        } else if (content) {
            setReadingType("text");
        } else {
            setReadingType("");
        }
    }, [file, content, lesson.reading?.pdf]);

    const updateCoords = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.top,
                left: rect.left,
                width: rect.width,
            });

            const scrollParent = containerRef.current.closest(".overflow-y-auto") || document.documentElement;
            const parentRect = scrollParent.getBoundingClientRect();
            const spaceBelow = parentRect.bottom - rect.bottom;
            const spaceAbove = rect.top - parentRect.top;
            if (spaceBelow < minSpaceAboveForDropdown && spaceAbove > spaceBelow) {
                setOpenDirection("up");
            } else {
                setOpenDirection("down");
            }
        }
    };

    useEffect(() => {
        if (!isDropdownOpen) return;

        updateCoords();

        const handleScroll = (event: Event) => {
            const target = event.target as Node;
            if (dropdownRef.current && dropdownRef.current.contains(target)) {
                return;
            }

            if (containerRef.current && !containerRef.current.contains(target)) {
                setIsDropdownOpen(false);
            } else {
                updateCoords();
            }
        };

        window.addEventListener("scroll", handleScroll, true);
        window.addEventListener("resize", updateCoords);
        return () => {
            window.removeEventListener("scroll", handleScroll, true);
            window.removeEventListener("resize", updateCoords);
        };
    }, [isDropdownOpen]);

    const readingMutation = useMutation({
        mutationFn: () => {
            const fd = new FormData();
            if (file) fd.append("file", file);
            fd.append("content", content);
            fd.append("questions", JSON.stringify(questions));

            return configureLessonReading(lesson.id, fd);
        },
        onSuccess: (data) => {
            toast.success(UI_TEXT.lessonMaterialModal.toastSaveSuccess, UI_TEXT.lessonMaterialModal.toastUpdateReadingSuccess);
            onSave(data);
        },
        onError: () => {
            toast.error(UI_TEXT.lessonMaterialModal.toastSaveError, UI_TEXT.lessonMaterialModal.toastSaveReadingError);
        },
    });

    return (
        <div className="flex flex-col gap-4">
            <div className="relative flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">{UI_TEXT.lessonMaterialModal.tabReading}</label>
                    {readingType !== "" && (
                        <button
                            type="button"
                            onClick={() => {
                                setFile(null);
                                setContent("");
                                setReadingType("");
                            }}
                            className="cursor-pointer text-xs font-bold text-red-500 transition hover:text-red-700"
                        >
                            {UI_TEXT.lessonMaterialModal.deleteReadingBtn}
                        </button>
                    )}
                </div>

                {readingType === "pdf" && (file || lesson.reading?.pdf) ? (
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                        <div className="flex items-center gap-2.5">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                                <FileText className="size-4" />
                            </span>
                            <div className="flex flex-col">
                                <span className="line-clamp-1 text-xs font-bold text-slate-800">
                                    {file ? file.name : lesson.reading?.pdf ? lesson.reading.pdf.split("/").pop() : UI_TEXT.lessonMaterialModal.pdfMaterialFile}
                                </span>
                                <span className="text-[10px] font-semibold text-slate-400">{UI_TEXT.lessonMaterialModal.pdfFileLabel}</span>
                            </div>
                        </div>
                    </div>
                ) : readingType === "text" ? (
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-1.5">
                            <TiptapEditor
                                value={content}
                                onChange={setContent}
                                placeholder={UI_TEXT.lessonMaterialModal.placeholderArticleContent}
                                className="w-full overflow-hidden rounded-lg border border-slate-200 bg-white"
                            />
                        </div>
                    </div>
                ) : (
                    <div ref={containerRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="shadow-xxs flex w-full cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition duration-150 hover:border-slate-300"
                        >
                            <span>{UI_TEXT.lessonMaterialModal.selectFileBtn}</span>
                            <ChevronDown className={`size-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                        </button>

                        {isDropdownOpen &&
                            typeof document !== "undefined" &&
                            createPortal(
                                <>
                                    <div className="fixed inset-0 z-[9998] cursor-default" onClick={() => setIsDropdownOpen(false)} />
                                    <div
                                        ref={dropdownRef}
                                        style={{
                                            position: "fixed",
                                            left: `${coords.left}px`,
                                            width: `${coords.width}px`,
                                            zIndex: 9999,
                                            ...(openDirection === "up"
                                                ? { bottom: `${window.innerHeight - coords.top + modalBottomOffset}px` }
                                                : { top: `${coords.top + dropdownTopOffset}px` }),
                                        }}
                                        className="animate-fadeIn flex flex-col gap-0.5 rounded-xl border border-slate-100 bg-white p-1 shadow-md"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setReadingType("pdf");
                                                setIsDropdownOpen(false);
                                                fileInputRef.current?.click();
                                            }}
                                            className="relative z-30 flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-xs font-bold transition hover:bg-slate-50"
                                        >
                                            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white">
                                                <FileText className="size-3.5" />
                                            </span>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800">{UI_TEXT.lessonMaterialModal.uploadPdfLabel}</span>
                                                <span className="text-[10px] font-semibold text-slate-400">
                                                    {UI_TEXT.lessonMaterialModal.uploadPdfSublabel}
                                                </span>
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setReadingType("text");
                                                setIsDropdownOpen(false);
                                            }}
                                            className="relative z-30 flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-xs font-bold transition hover:bg-slate-50"
                                        >
                                            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white">
                                                <File className="size-3.5" />
                                            </span>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-800">{UI_TEXT.lessonMaterialModal.articleContentLabel}</span>
                                                <span className="text-[10px] font-semibold text-slate-400">
                                                    {UI_TEXT.lessonMaterialModal.articleContentSublabel}
                                                </span>
                                            </div>
                                        </button>
                                    </div>
                                </>,
                                document.body,
                            )}
                    </div>
                )}
            </div>

            {/* Hidden file input for automatic selection dialog */}
            <input
                type="file"
                ref={fileInputRef}
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                    const selectedFile = e.target.files?.[0] || null;
                    setFile(selectedFile);
                    if (selectedFile) {
                        setReadingType("pdf");
                    }
                }}
            />

            <div className="mt-2 flex justify-end border-t border-slate-100 pt-4">
                <Button
                    onClick={() => readingMutation.mutate()}
                    isLoading={readingMutation.isPending}
                    className="border-none bg-wine py-1.5 text-xs font-bold text-white"
                >
                    {UI_TEXT.lessonMaterialModal.saveReadingBtn}
                </Button>
            </div>
        </div>
    );
}

function SearchableQuizSelect({ value, onChange, quizzes }: { value: string; onChange: (val: string) => void; quizzes: Quiz[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [openDirection, setOpenDirection] = useState<"up" | "down">("down");
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const updateCoords = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.top,
                left: rect.left,
                width: rect.width,
            });

            const scrollParent = containerRef.current.closest(".overflow-y-auto") || document.documentElement;
            const parentRect = scrollParent.getBoundingClientRect();
            const spaceBelow = parentRect.bottom - rect.bottom;
            const spaceAbove = rect.top - parentRect.top;
            if (spaceBelow < minSpaceAboveForQuizDropdown && spaceAbove > spaceBelow) {
                setOpenDirection("up");
            } else {
                setOpenDirection("down");
            }
        }
    };

    useEffect(() => {
        if (!isOpen) return;

        updateCoords();

        const handleScroll = (event: Event) => {
            const target = event.target as Node;
            if (dropdownRef.current && dropdownRef.current.contains(target)) {
                return;
            }

            if (containerRef.current && !containerRef.current.contains(target)) {
                setIsOpen(false);
                setSearchTerm("");
            } else {
                updateCoords();
            }
        };

        window.addEventListener("scroll", handleScroll, true);
        window.addEventListener("resize", updateCoords);
        return () => {
            window.removeEventListener("scroll", handleScroll, true);
            window.removeEventListener("resize", updateCoords);
        };
    }, [isOpen]);

    const selectedQuiz = quizzes.find((q) => q.id === value);
    const selectedTitle = selectedQuiz
        ? selectedQuiz.title || `${UI_TEXT.lessonMaterialModal.quizSetPrefix} ${selectedQuiz.id}`
        : UI_TEXT.lessonMaterialModal.placeholderSelectQuiz;

    const filteredQuizzes = quizzes.filter((q) => {
        const title = (q.title || "").toLowerCase();
        const id = (q.id || "").toLowerCase();
        const search = searchTerm.toLowerCase();
        return title.includes(search) || id.includes(search);
    });

    return (
        <div ref={containerRef} className="relative w-full">
            {/* Search Input styled as Select Box */}
            <div className="shadow-xxs relative flex w-full items-center rounded-xl border border-slate-200 bg-white transition duration-150 focus-within:border-slate-300">
                <Search className="pointer-events-none absolute left-3 size-4 text-slate-400" />
                <input
                    ref={inputRef}
                    type="text"
                    className={`w-full bg-transparent py-2.5 pr-9 pl-9 text-xs font-bold placeholder-slate-400 focus:outline-none ${
                        !isOpen && value ? "text-slate-900" : "text-slate-700"
                    }`}
                    placeholder={isOpen ? UI_TEXT.lessonMaterialModal.placeholderSearchQuiz : value ? "" : UI_TEXT.lessonMaterialModal.placeholderSelectQuiz}
                    value={isOpen ? searchTerm : value ? selectedTitle : ""}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                    }}
                    onFocus={() => {
                        setIsOpen(true);
                        setSearchTerm("");
                    }}
                />
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (isOpen) {
                            setIsOpen(false);
                        } else {
                            inputRef.current?.focus();
                        }
                    }}
                    className="absolute right-3 flex cursor-pointer items-center justify-center rounded p-0.5 hover:bg-slate-50"
                >
                    <ChevronDown className={`size-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </button>
            </div>

            {/* Dropdown panel */}
            {isOpen &&
                typeof document !== "undefined" &&
                createPortal(
                    <>
                        {/* Transparent backdrop to click outside */}
                        <div
                            className="fixed inset-0 z-[9998] cursor-default"
                            onClick={() => {
                                setIsOpen(false);
                                setSearchTerm("");
                            }}
                        />
                        <div
                            ref={dropdownRef}
                            style={{
                                position: "fixed",
                                left: `${coords.left}px`,
                                width: `${coords.width}px`,
                                zIndex: 9999,
                                ...(openDirection === "up"
                                    ? { bottom: `${window.innerHeight - coords.top + modalBottomOffset}px` }
                                    : { top: `${coords.top + quizDropdownTopOffset}px` }),
                            }}
                            className="animate-fadeIn flex flex-col gap-0.5 rounded-xl border border-slate-100 bg-white p-1 shadow-lg"
                        >
                            {/* List items */}
                            <div className="custom-scrollbar-gray flex max-h-56 flex-col gap-0.5 overflow-y-auto pr-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        onChange("");
                                        setIsOpen(false);
                                        setSearchTerm("");
                                    }}
                                    className="flex w-full cursor-pointer items-center rounded-lg px-3 py-2 text-left text-xs font-bold text-red-500 transition hover:bg-red-50"
                                >
                                    {UI_TEXT.lessonMaterialModal.noQuizOption}
                                </button>

                                {filteredQuizzes.length > 0 ? (
                                    filteredQuizzes.map((q) => {
                                        const isSelected = q.id === value;
                                        return (
                                            <button
                                                key={q.id}
                                                type="button"
                                                onClick={() => {
                                                    onChange(q.id);
                                                    setIsOpen(false);
                                                    setSearchTerm("");
                                                }}
                                                className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition ${
                                                    isSelected ? "bg-wine/5 font-bold text-wine" : "font-semibold text-slate-700 hover:bg-slate-50"
                                                }`}
                                            >
                                                <span className="truncate">{q.title || `${UI_TEXT.lessonMaterialModal.quizSetPrefix} ${q.id}`}</span>
                                                {isSelected && <span className="ml-2 size-1.5 shrink-0 rounded-full bg-wine" />}
                                            </button>
                                        );
                                    })
                                ) : (
                                    <div className="py-4 text-center text-[11px] font-semibold text-slate-400">{UI_TEXT.lessonMaterialModal.noQuizFound}</div>
                                )}
                            </div>
                        </div>
                    </>,
                    document.body,
                )}
        </div>
    );
}

function QuizConfigTab({ lesson, quizzes, onSave }: { lesson: Lesson; quizzes: Quiz[]; onSave: (l: Lesson) => void }) {
    const [quizId, setQuizId] = useState(lesson.quizId || "");

    const quizMutation = useMutation({
        mutationFn: () => linkLessonQuiz(lesson.id, quizId),
        onSuccess: (data) => {
            toast.success(UI_TEXT.lessonMaterialModal.toastSaveSuccess, UI_TEXT.lessonMaterialModal.toastLinkQuizSuccess);
            onSave(data);
        },
        onError: () => {
            toast.error(UI_TEXT.lessonMaterialModal.toastSaveError, UI_TEXT.lessonMaterialModal.toastLinkQuizError);
        },
    });

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-800">{UI_TEXT.lessonMaterialModal.selectQuizLabel}</label>
                <SearchableQuizSelect value={quizId} onChange={setQuizId} quizzes={quizzes} />
            </div>

            <div className="mt-1 flex justify-end border-t border-slate-100 pt-3">
                <Button
                    onClick={() => quizMutation.mutate()}
                    isLoading={quizMutation.isPending}
                    className="border-none bg-wine py-1.5 text-xs font-bold text-white"
                >
                    {UI_TEXT.lessonMaterialModal.saveQuizBtn}
                </Button>
            </div>
        </div>
    );
}
