"use client";

import { useEffect, useRef, useState } from "react";
import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, HelpCircle, Plus, Repeat } from "lucide-react";
import { ConfirmModal } from "@/components/application/modals/confirm-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import {
    configureLessonReading,
    configureLessonReadingHtml,
    configureLessonVideo,
    deleteLessonReading,
    deleteLessonVideo,
    getLessonDetails,
    linkLessonQuiz,
} from "@/services/material.service";
import { toast } from "@/services/toast.service";
import type { Lesson, LessonEditorWrapperProps, ReadingQuestion } from "@/types/material.types";
import { QuizConfigTab } from "./quiz-config-tab";
import { ReadingConfigTab } from "./reading-config-tab";
import { VideoConfigTab } from "./video-config-tab";
import type { VideoQuestion } from "./video-config-tab";

export function LessonEditorWrapper({ lessonId, quizzes, activeTab, onRegisterSave, onIsSavingChange, onIsDirtyChange }: LessonEditorWrapperProps) {
    const queryClient = useQueryClient();
    const [localLesson, setLocalLesson] = useState<Lesson | null>(null);

    // Lifted Form States
    const [videoUrl, setVideoUrl] = useState("");
    const [videoDuration, setVideoDuration] = useState(0);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoQuestions, setVideoQuestions] = useState<VideoQuestion[]>([]);

    const [readingContent, setReadingContent] = useState("");
    const [readingFile, setReadingFile] = useState<File | null>(null);
    const [readingHtmlFiles, setReadingHtmlFiles] = useState<File[]>([]);
    const [readingPdfUrl, setReadingPdfUrl] = useState("");
    const [readingQuestions, setReadingQuestions] = useState<ReadingQuestion[]>([]);
    const [isPdfDeleted, setIsPdfDeleted] = useState(false);
    const [readingVersion, setReadingVersion] = useState(0);
    const [readingSubTab, setReadingSubTab] = useState<"document" | "questions">("document");

    const [quizId, setQuizId] = useState("");
    const [isQuizQuestionsDirty, setIsQuizQuestionsDirty] = useState(false);
    const quizSaveRef = useRef<(() => Promise<unknown>) | null>(null);
    const openVideoModalRef = useRef<(() => void) | null>(null);
    const openReadingModalRef = useRef<(() => void) | null>(null);
    const openQuizModalRef = useRef<(() => void) | null>(null);
    const openAddQuestionModalRef = useRef<(() => void) | null>(null);

    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<"video" | "reading" | "quiz" | null>(null);

    const triggerDelete = (target: "video" | "reading" | "quiz") => {
        setDeleteTarget(target);
        setIsConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            if (deleteTarget === "video") {
                const updated = await deleteLessonVideo(lessonId);
                setLocalLesson(updated);
                setVideoUrl("");
                setVideoFile(null);
                setVideoDuration(0);
                setVideoQuestions([]);
                toast.success(UI_TEXT.learningMaterials.toastSuccessTitle, UI_TEXT.learningMaterials.toastDeleteVideoSuccess);
            } else if (deleteTarget === "reading") {
                const updated = await deleteLessonReading(lessonId);
                setLocalLesson({ ...updated, pdf: "", reading: null });
                setReadingContent("");
                setReadingFile(null);
                setReadingHtmlFiles([]);
                setReadingPdfUrl("");
                setReadingQuestions([]);
                setIsPdfDeleted(true);
                setReadingVersion((prev) => prev + 1);
                toast.success(UI_TEXT.learningMaterials.toastSuccessTitle, UI_TEXT.learningMaterials.toastDeleteReadingSuccess);
            } else if (deleteTarget === "quiz") {
                const updated = await linkLessonQuiz(lessonId, "");
                setLocalLesson(updated);
                setQuizId("");
                toast.success(UI_TEXT.learningMaterials.toastSuccessTitle, UI_TEXT.learningMaterials.toastUnlinkQuizSuccess);
            }
            await queryClient.invalidateQueries({ queryKey: ["lesson-details-editor", lessonId] });
            if (localLesson?.sessionId) {
                queryClient.invalidateQueries({ queryKey: ["lessons", localLesson.sessionId] });
            }
        } catch (error) {
            toast.error(UI_TEXT.learningMaterials.toastErrorTitle, UI_TEXT.learningMaterials.toastDeleteError);
            console.error(error);
        } finally {
            setDeleteTarget(null);
            setIsConfirmDeleteOpen(false);
        }
    };

    const { data: lessonDetails, isLoading } = useQuery({
        queryKey: ["lesson-details-editor", lessonId],
        queryFn: () => getLessonDetails(lessonId),
        enabled: !!lessonId,
    });

    const resetFormToLessonDetails = (details: Lesson | null) => {
        if (!details) return;
        setLocalLesson(details);
        setVideoUrl(details.video?.url || details.videoUrl || "");
        setVideoDuration(details.video?.durationTime || 0);

        const rawVideoQs = details.video?.questions || [];
        const loadedVideoQs: VideoQuestion[] = rawVideoQs.map((q) => ({
            content: q.content,
            type: q.type,
            timeInVideo: q.timeInVideo || 0,
            points: q.points,
            options: (q.options || []).map((o) => ({
                content: o.content,
                isCorrect: o.isCorrect,
            })),
        }));
        setVideoQuestions(loadedVideoQs);

        setReadingContent((details.reading?.content || (details.reading as unknown as Record<string, Record<string, unknown>>)?._doc?.content || "") as string);
        setQuizId(details.quizId || "");
        setVideoFile(null);
        setReadingFile(null);
        setReadingHtmlFiles([]);
        setReadingPdfUrl(details.reading?.pdf || details.pdf || "");

        const rawReadingQs = details.reading?.questions || [];
        const loadedReadingQs: ReadingQuestion[] = rawReadingQs.map((q) => {
            const qObj = q as unknown as Record<string, unknown>;
            const opts = Array.isArray(qObj.options) ? qObj.options : [];
            const firstOpt = opts[0] as Record<string, unknown> | undefined;
            const contentText = String(qObj.question || qObj.content || "");
            const answerText = String(qObj.answer || firstOpt?.content || "");
            return {
                id: String(qObj.id || qObj._id || ""),
                question: contentText,
                answer: answerText,
                content: contentText,
            };
        });
        setReadingQuestions(loadedReadingQs);

        setIsPdfDeleted(false);
        setReadingVersion((prev) => prev + 1);
        setIsQuizQuestionsDirty(false);
        setSubmitted(false);
    };

    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (lessonDetails) {
            resetFormToLessonDetails(lessonDetails);
        }
    }, [lessonDetails, lessonId]);

    const [isSaving, setIsSaving] = useState(false);
    const handleSaveAllRef = useRef<(() => Promise<void>) | null>(null);

    // Dirty checks for Lesson tabs
    const initialVideoUrl = lessonDetails?.video?.url || lessonDetails?.videoUrl || "";
    const initialVideoQuestions: VideoQuestion[] = useMemo(() => {
        const raw = lessonDetails?.video?.questions || [];
        return raw.map((q) => ({
            content: q.content,
            type: q.type,
            timeInVideo: q.timeInVideo || 0,
            points: q.points,
            options: (q.options || []).map((o) => ({
                content: o.content,
                isCorrect: o.isCorrect,
            })),
        }));
    }, [lessonDetails?.video?.questions]);

    const normalizeVideoQuestions = (qs: unknown[]) =>
        (qs || []).map((q) => {
            const qObj = q as Record<string, unknown>;
            return {
                content: String(qObj.content || "").trim(),
                type: String(qObj.type || "SINGLE_CHOICE"),
                timeInVideo: Number(qObj.timeInVideo || 0),
                points: Number(qObj.points || 1),
                options: (Array.isArray(qObj.options) ? qObj.options : []).map((o: unknown) => {
                    const oObj = o as Record<string, unknown>;
                    return {
                        content: String(oObj.content || "").trim(),
                        isCorrect: !!oObj.isCorrect,
                    };
                }),
            };
        });

    const isVideoDirty =
        (videoUrl || "").trim() !== (initialVideoUrl || "").trim() ||
        videoFile !== null ||
        JSON.stringify(normalizeVideoQuestions(videoQuestions)) !== JSON.stringify(normalizeVideoQuestions(initialVideoQuestions));

    const initialPdfUrl = lessonDetails?.reading?.pdf || lessonDetails?.pdf || "";
    const initialHtmlUrl = lessonDetails?.reading?.htmlUrl || "";
    const initialReadingContent = (lessonDetails?.reading?.content ||
        (lessonDetails?.reading as unknown as Record<string, Record<string, unknown>>)?._doc?.content ||
        "") as string;

    const isReadingContentDirty = (() => {
        const current = (readingContent || "").trim();
        const initial = (initialReadingContent || "").trim();
        if (current === initial) return false;

        const normalize = (str: string) =>
            str
                .replace(/<[^>]*>/g, " ")
                .replace(/&nbsp;/g, " ")
                .replace(/[*_#`~>[\]()!]/g, " ")
                .replace(/\s+/g, " ")
                .trim();

        return normalize(current) !== normalize(initial);
    })();

    const hasMediaBeenDeleted =
        (!!initialPdfUrl || !!initialHtmlUrl) && isPdfDeleted && !readingFile && !readingContent && !readingPdfUrl && readingHtmlFiles.length === 0;

    const initialReadingQuestions: ReadingQuestion[] = useMemo(() => {
        const raw = lessonDetails?.reading?.questions || [];
        return raw.map((q) => {
            const qObj = q as unknown as Record<string, unknown>;
            const opts = Array.isArray(qObj.options) ? qObj.options : [];
            const firstOpt = opts[0] as Record<string, unknown> | undefined;
            const contentText = String(qObj.question || qObj.content || "");
            const answerText = String(qObj.answer || firstOpt?.content || "");
            return {
                id: String(qObj.id || qObj._id || ""),
                question: contentText,
                answer: answerText,
                content: contentText,
            };
        });
    }, [lessonDetails?.reading?.questions]);
    const isReadingQuestionsDirty = JSON.stringify(readingQuestions) !== JSON.stringify(initialReadingQuestions);

    const isReadingDirty =
        isReadingContentDirty ||
        readingFile !== null ||
        readingHtmlFiles.length > 0 ||
        (readingPdfUrl || "").trim() !== (initialPdfUrl || "").trim() ||
        hasMediaBeenDeleted ||
        isReadingQuestionsDirty;

    const isQuizLinkDirty = (quizId || "").trim() !== (lessonDetails?.quizId || "").trim();
    const isQuizDirty = isQuizLinkDirty || isQuizQuestionsDirty;

    const isCurrentTabDirty = (activeTab === "video" && isVideoDirty) || (activeTab === "reading" && isReadingDirty) || (activeTab === "quiz" && isQuizDirty);

    useEffect(() => {
        onIsDirtyChange?.(isCurrentTabDirty);
    }, [isCurrentTabDirty, onIsDirtyChange]);

    const handleSaveAll = useCallback(async () => {
        setSubmitted(true);
        setIsSaving(true);
        try {
            // Check embedded video questions validation
            if (activeTab === "video") {
                const hasInvalidVideoQuestion = videoQuestions.some((q) => {
                    const isQContentEmpty = !(q.content || "").trim();
                    const isTimeInv = q.timeInVideo === undefined || q.timeInVideo === null || q.timeInVideo < 0;
                    const isOptEmpty = (q.options || []).some((o) => !(o.content || "").trim());
                    return isQContentEmpty || isTimeInv || isOptEmpty;
                });

                if (hasInvalidVideoQuestion) {
                    toast.error(UI_TEXT.learningMaterials.toastErrorTitle, UI_TEXT.learningMaterials.invalidEmbeddedQuestions);
                    setIsSaving(false);
                    return;
                }
            }

            const promises = [];

            // 1. Check if video info is dirty
            if (isVideoDirty) {
                const videoFd = new FormData();
                if (videoFile) videoFd.append("file", videoFile);
                videoFd.append("url", videoUrl || "");
                videoFd.append("durationTime", String(videoDuration));
                videoFd.append("questions", JSON.stringify(videoQuestions));
                promises.push(configureLessonVideo(lessonId, videoFd));
            }

            // 2. Check if reading is dirty
            if (isReadingDirty) {
                const formattedReadingQuestions = (readingQuestions || []).map((q: unknown) => {
                    const qObj = q as Record<string, unknown>;
                    const textVal = String(qObj.content || qObj.question || qObj.title || qObj.text || qObj.questionText || "");
                    const ansVal = String(qObj.answer || qObj.answerText || qObj.solution || qObj.explanation || "");
                    const options =
                        Array.isArray(qObj.options) && qObj.options.length > 0 ? qObj.options : ansVal ? [{ content: ansVal, isCorrect: true }] : [];
                    return {
                        ...(qObj.id ? { id: String(qObj.id) } : {}),
                        ...(qObj._id ? { _id: String(qObj._id) } : {}),
                        content: textVal,
                        question: textVal,
                        answer: ansVal,
                        type: qObj.type || "SINGLE_CHOICE",
                        points: qObj.points ?? 1,
                        options,
                    };
                });

                if (readingHtmlFiles.length > 0) {
                    const htmlFd = new FormData();
                    readingHtmlFiles.forEach((file) => htmlFd.append("files", file));
                    const htmlContentToSend = readingContent?.trim() || "Tài liệu HTML";
                    htmlFd.append("content", htmlContentToSend);
                    htmlFd.append("questions", JSON.stringify(formattedReadingQuestions));
                    promises.push(configureLessonReadingHtml(lessonId, htmlFd));
                } else {
                    const readingFd = new FormData();
                    if (readingFile) {
                        readingFd.append("file", readingFile);
                    } else if (readingPdfUrl) {
                        readingFd.append("pdf", readingPdfUrl);
                    } else {
                        readingFd.append("pdf", "");
                    }
                    const contentToSend = readingContent?.trim() || (readingFile ? readingFile.name : readingPdfUrl ? "Tài liệu PDF" : "Tài liệu bài đọc");
                    readingFd.append("content", contentToSend);
                    readingFd.append("questions", JSON.stringify(formattedReadingQuestions));
                    promises.push(configureLessonReading(lessonId, readingFd));
                }
            }

            // 3. Check if quiz is dirty
            if (isQuizLinkDirty) {
                promises.push(linkLessonQuiz(lessonId, quizId));
            }

            if (quizSaveRef.current && isQuizQuestionsDirty) {
                promises.push(quizSaveRef.current());
            }

            if (promises.length === 0) {
                toast.success(UI_TEXT.learningMaterials.toastSuccessTitle, UI_TEXT.learningMaterials.toastNoChangesToSave);
                setIsSaving(false);
                return;
            }

            await Promise.all(promises);

            // Invalidate React Query cache for this lesson and session
            await queryClient.invalidateQueries({
                queryKey: ["lesson-details-editor", lessonId],
            });

            // Fetch fresh lesson details directly from backend
            const freshDetails = await getLessonDetails(lessonId);
            if (freshDetails) {
                queryClient.setQueryData(["lesson-details-editor", lessonId], freshDetails);
                resetFormToLessonDetails(freshDetails);
            }

            const activeSessionId = localLesson?.sessionId || freshDetails?.sessionId;
            if (activeSessionId) {
                await queryClient.invalidateQueries({ queryKey: ["lessons", activeSessionId] });
            }
            if (isQuizQuestionsDirty && quizId) {
                await queryClient.invalidateQueries({ queryKey: ["quiz-details", quizId] });
            }

            toast.success(UI_TEXT.learningMaterials.toastSuccessTitle, UI_TEXT.learningMaterials.toastSaveLessonSuccess);
        } catch (error) {
            toast.error(UI_TEXT.learningMaterials.toastErrorTitle, UI_TEXT.learningMaterials.toastSaveError);
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    }, [
        activeTab,
        isVideoDirty,
        isReadingDirty,
        videoUrl,
        videoFile,
        videoDuration,
        videoQuestions,
        readingContent,
        readingFile,
        readingHtmlFiles,
        readingPdfUrl,
        readingQuestions,
        quizId,
        isQuizQuestionsDirty,
        lessonId,
        localLesson,
        queryClient,
        isQuizLinkDirty,
        quizSaveRef,
    ]);

    handleSaveAllRef.current = handleSaveAll;

    useEffect(() => {
        if (onRegisterSave) {
            // Always call latest save via ref — parent passes a new onRegisterSave each render.
            onRegisterSave(() => handleSaveAllRef.current?.() ?? Promise.resolve());
        }
    }, [onRegisterSave]);

    useEffect(() => {
        if (onIsSavingChange) {
            onIsSavingChange(isSaving);
        }
    }, [onIsSavingChange, isSaving]);

    if (isLoading || !localLesson) {
        return (
            <div className="flex flex-1 items-center justify-center py-20">
                <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-0 flex-1 flex-col gap-4">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 pb-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h3 className="text-base font-black text-slate-800">
                            {activeTab === "video" && UI_TEXT.learningMaterials.labelConfigVideo}
                            {activeTab === "reading" && UI_TEXT.learningMaterials.labelConfigReading}
                            {activeTab === "quiz" && UI_TEXT.learningMaterials.labelConfigQuiz}
                        </h3>

                        {activeTab === "reading" && (
                            <div className="inline-flex items-center gap-0.5 rounded-full border border-slate-200/80 bg-slate-50/60 p-0.5 shadow-2xs">
                                <button
                                    type="button"
                                    onClick={() => setReadingSubTab("document")}
                                    className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all duration-150 ${
                                        readingSubTab === "document"
                                            ? "bg-wine text-white shadow-xs"
                                            : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
                                    }`}
                                >
                                    <FileText className={`size-3.5 ${readingSubTab === "document" ? "text-white" : "text-slate-400"}`} />
                                    <span>{UI_TEXT.learningMaterials.labelTabReadingDoc}</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setReadingSubTab("questions")}
                                    className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all duration-150 ${
                                        readingSubTab === "questions"
                                            ? "bg-wine text-white shadow-xs"
                                            : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
                                    }`}
                                >
                                    <HelpCircle className={`size-3.5 ${readingSubTab === "questions" ? "text-white" : "text-slate-400"}`} />
                                    <span>{UI_TEXT.learningMaterials.labelTabReadingQs}</span>
                                    {readingQuestions.length > 0 && (
                                        <span
                                            className={`py-0.2 ml-1 rounded-full px-1.5 text-[10px] font-extrabold ${
                                                readingSubTab === "questions" ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700"
                                            }`}
                                        >
                                            {readingQuestions.length}
                                        </span>
                                    )}
                                </button>
                            </div>
                        )}

                        {isCurrentTabDirty && (
                            <span className="animate-pulse rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-600">
                                {UI_TEXT.learningMaterials.labelUnsavedState}
                            </span>
                        )}
                    </div>
                    <p className="mt-0.5 text-xs font-medium text-slate-400">
                        {UI_TEXT.learningMaterials.labelUpdateLessonDesc}
                        {localLesson.name}
                        {")"}
                    </p>
                </div>
                {activeTab === "video" && (
                    <button
                        type="button"
                        onClick={() => openVideoModalRef.current?.()}
                        className="hover:bg-wine-hover flex cursor-pointer items-center gap-1.5 rounded-full bg-wine px-5 py-2 text-xs font-black text-white shadow-xs transition duration-150"
                    >
                        {videoUrl || videoFile ? <Repeat className="size-3.5" /> : <Plus className="size-3.5" />}
                        {videoUrl || videoFile ? UI_TEXT.learningMaterials.btnChangeConfig : UI_TEXT.learningMaterials.btnAddVideo}
                    </button>
                )}
                {activeTab === "quiz" && (
                    <button
                        type="button"
                        onClick={() => openQuizModalRef.current?.()}
                        className="hover:bg-wine-hover flex cursor-pointer items-center gap-1.5 rounded-full bg-wine px-5 py-2 text-xs font-black text-white shadow-xs transition duration-150"
                    >
                        {quizId ? <Repeat className="size-3.5" /> : <Plus className="size-3.5" />}
                        {quizId ? UI_TEXT.learningMaterials.btnChangeConfig : UI_TEXT.learningMaterials.btnSelectQuiz}
                    </button>
                )}
                {activeTab === "reading" &&
                    (readingSubTab === "questions" ? (
                        <button
                            type="button"
                            onClick={() => openAddQuestionModalRef.current?.()}
                            className="hover:bg-wine-hover flex cursor-pointer items-center gap-1.5 rounded-full bg-wine px-5 py-2 text-xs font-black text-white shadow-xs transition duration-150"
                        >
                            <Plus className="size-3.5" />
                            <span>{UI_TEXT.learningMaterials.addQuestionBtn}</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => openReadingModalRef.current?.()}
                            className="hover:bg-wine-hover flex cursor-pointer items-center gap-1.5 rounded-full bg-wine px-5 py-2 text-xs font-black text-white shadow-xs transition duration-150"
                        >
                            {readingContent || readingFile || readingHtmlFiles.length > 0 || readingPdfUrl || localLesson?.reading || localLesson?.pdf ? (
                                <Repeat className="size-3.5" />
                            ) : (
                                <Plus className="size-3.5" />
                            )}
                            {readingContent || readingFile || readingHtmlFiles.length > 0 || readingPdfUrl || localLesson?.reading || localLesson?.pdf
                                ? UI_TEXT.learningMaterials.btnChangeConfig
                                : UI_TEXT.learningMaterials.btnAddReading}
                        </button>
                    ))}
            </div>

            {/* Scrollable Content Area */}
            <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
                {/* Video Config Section */}
                {activeTab === "video" && (
                    <div className="flex min-h-0 flex-1 flex-col gap-4">
                        <VideoConfigTab
                            key={`${localLesson?.id}-${readingVersion}`}
                            url={videoUrl}
                            setUrl={setVideoUrl}
                            duration={videoDuration}
                            setDuration={setVideoDuration}
                            file={videoFile}
                            setFile={setVideoFile}
                            questions={videoQuestions}
                            setQuestions={setVideoQuestions}
                            submitted={submitted}
                            onDelete={() => triggerDelete("video")}
                            onRegisterOpenModal={(fn) => {
                                openVideoModalRef.current = fn;
                            }}
                        />
                    </div>
                )}

                {/* Quiz Config Section */}
                {activeTab === "quiz" && (
                    <div className="flex h-full min-h-0 flex-1 flex-col gap-4">
                        <QuizConfigTab
                            key={`${localLesson?.id}-${quizId}-${readingVersion}`}
                            quizId={quizId}
                            setQuizId={setQuizId}
                            quizzes={quizzes as unknown as Record<string, unknown>[]}
                            onDelete={() => triggerDelete("quiz")}
                            onQuestionsDirtyChange={setIsQuizQuestionsDirty}
                            onRegisterSave={(saveFn) => {
                                quizSaveRef.current = saveFn;
                            }}
                            onRegisterOpenModal={(fn) => {
                                openQuizModalRef.current = fn;
                            }}
                        />
                    </div>
                )}

                {/* Reading Config Section */}
                {activeTab === "reading" && (
                    <div className="flex min-h-0 flex-1 flex-col gap-4">
                        <ReadingConfigTab
                            key={`${localLesson.id}-${readingVersion}`}
                            readingSubTab={readingSubTab}
                            setReadingSubTab={setReadingSubTab}
                            content={readingContent}
                            setContent={setReadingContent}
                            file={readingFile}
                            setFile={setReadingFile}
                            htmlFiles={readingHtmlFiles}
                            setHtmlFiles={setReadingHtmlFiles}
                            pdfUrl={readingPdfUrl}
                            setPdfUrl={setReadingPdfUrl}
                            questions={readingQuestions}
                            setQuestions={setReadingQuestions}
                            savedPdf={isPdfDeleted ? undefined : readingPdfUrl || localLesson.reading?.pdf || localLesson.pdf || undefined}
                            savedHtmlUrl={(isPdfDeleted && readingHtmlFiles.length === 0) || !localLesson.reading ? undefined : localLesson.reading?.htmlUrl}
                            onClearSavedMedia={() => setIsPdfDeleted(true)}
                            onDelete={() => triggerDelete("reading")}
                            onRegisterOpenModal={(fn) => {
                                openReadingModalRef.current = fn;
                            }}
                            onRegisterAddQuestionModal={(fn) => {
                                openAddQuestionModalRef.current = fn;
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Confirmation Modal for Deletion using application ConfirmModal */}
            <ConfirmModal
                isOpen={isConfirmDeleteOpen}
                onClose={() => setIsConfirmDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
                title={UI_TEXT.learningMaterials.confirmDeleteTitle}
                message={
                    deleteTarget === "video"
                        ? UI_TEXT.learningMaterials.confirmDeleteVideoDesc
                        : deleteTarget === "reading"
                          ? UI_TEXT.learningMaterials.confirmDeleteReadingDesc
                          : deleteTarget === "quiz"
                            ? UI_TEXT.learningMaterials.confirmDeleteQuizDesc
                            : ""
                }
                confirmText={UI_TEXT.learningMaterials.confirmDeleteButton}
                cancelText={UI_TEXT.courseDetail.cancelButton}
                variant="danger"
            />
        </div>
    );
}
