"use client";
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Maximize2, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { DEMO_EMBEDDED_QUESTIONS, DEMO_QUIZ_QUESTIONS } from "@/mocks/review-materials.mock";
import { getLessonDetails } from "@/services/material.service";
import { getQuizById } from "@/services/quiz.service";
import type { EmbeddedQuestion, Lesson } from "@/types/material.types";
import type { QuizBackendEntity } from "@/types/quiz.types";
import type { ReviewQuizModalProps, ReviewReadingModalProps, ReviewVideoModalProps } from "@/types/review-materials.types";
import { formatDateStr, formatUserName, getYouTubeEmbedUrl } from "@/utils/review-materials.utils";

// ----------------------------------------------------------------------
// 1. VIDEO MODAL ("Video và Quiz - [Tên lesson]")
// ----------------------------------------------------------------------
export function ReviewVideoModal({ isOpen, onClose, lessonItem, sessionName }: ReviewVideoModalProps) {
    const lessonId = lessonItem?.id || "";

    const { data: detail, isLoading } = useQuery<Lesson>({
        queryKey: ["review-lesson-detail", lessonId],
        queryFn: () => getLessonDetails(lessonId),
        enabled: isOpen && !!lessonId,
    });

    if (!isOpen || !lessonItem) return null;

    const lessonName = detail?.name || lessonItem.name;
    const authorName = formatUserName(lessonItem.author || lessonItem.createdBy);
    const rawVideoUrl = detail?.videoUrl || detail?.video?.url || lessonItem.videoUrl || "";
    const embedUrl = getYouTubeEmbedUrl(rawVideoUrl);

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="w-full max-w-5xl !rounded-[24px]">
                <Dialog className="flex max-h-[90vh] flex-col gap-4 overflow-hidden rounded-[24px] bg-white p-6 shadow-2xl outline-none">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <Heading slot="title" className="text-lg font-bold text-slate-800">
                            {UI_TEXT.reviewMaterials.contentTypeVideo}
                            {" - "}
                            {lessonName}
                        </Heading>
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Body */}
                    {isLoading ? (
                        <div className="flex h-64 items-center justify-center text-sm font-semibold text-slate-500">
                            <Loader2 className="mr-2 size-6 animate-spin text-wine" />
                            {UI_TEXT.reviewMaterials.loadingList}
                        </div>
                    ) : (
                        <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pr-1">
                            {/* Metadata */}
                            <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 border-b border-slate-100 pb-3 text-xs text-slate-600 sm:grid-cols-2">
                                <div>
                                    <div>
                                        <strong className="font-semibold text-slate-500">
                                            {UI_TEXT.reviewMaterials.thLessonName}
                                            {":"}
                                        </strong>{" "}
                                        <span className="font-bold text-slate-800">{lessonName}</span>
                                    </div>
                                    <div className="mt-1">
                                        <strong className="font-semibold text-slate-500">
                                            {UI_TEXT.reviewMaterials.authorLabel}
                                            {":"}
                                        </strong>{" "}
                                        <span className="font-semibold text-slate-800">{authorName}</span>
                                    </div>
                                </div>
                                <div>
                                    <div>
                                        <strong className="font-semibold text-slate-500">
                                            {UI_TEXT.reviewMaterials.sessionLabel}
                                            {":"}
                                        </strong>{" "}
                                        <span className="font-semibold text-slate-800">{sessionName}</span>
                                    </div>
                                    <div className="mt-1">
                                        <strong className="font-semibold text-slate-500">
                                            {UI_TEXT.reviewMaterials.updatedAtLabel}
                                            {":"}
                                        </strong>{" "}
                                        <span className="font-semibold text-slate-800">{formatDateStr(lessonItem.updatedAt)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Main Video View */}
                            <div className="flex flex-col gap-2">
                                <label className="block text-xs font-bold tracking-wider text-slate-500 uppercase">
                                    {UI_TEXT.reviewMaterials.contentTypeVideo}
                                    {":"}
                                </label>
                                {embedUrl ? (
                                    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-md">
                                        <iframe
                                            src={embedUrl}
                                            title={lessonName}
                                            className="h-full w-full border-0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>
                                ) : rawVideoUrl ? (
                                    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-md">
                                        <video src={rawVideoUrl} controls className="h-full w-full object-contain" />
                                    </div>
                                ) : (
                                    <div className="flex h-48 w-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-xs font-medium text-slate-400">
                                        {UI_TEXT.reviewMaterials.contentTypeNone}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}

// ----------------------------------------------------------------------
// 2. READING MODAL ("Bài đọc - [Tên lesson]")
// ----------------------------------------------------------------------
export function ReviewReadingModal({ isOpen, onClose, lessonItem, sessionName }: ReviewReadingModalProps) {
    const [isExpandOpen, setIsExpandOpen] = useState(false);
    const lessonId = lessonItem?.id || "";

    const { data: detail, isLoading } = useQuery<Lesson>({
        queryKey: ["review-lesson-detail", lessonId],
        queryFn: () => getLessonDetails(lessonId),
        enabled: isOpen && !!lessonId,
    });

    if (!isOpen || !lessonItem) return null;

    const lessonName = detail?.name || lessonItem.name;
    const authorName = formatUserName(lessonItem.author || lessonItem.createdBy);
    const readingContent = detail?.reading?.content || "";
    const pdfUrl = detail?.pdf || detail?.reading?.pdf || lessonItem.pdf || "";
    const questions: EmbeddedQuestion[] = (detail?.reading?.questions || []) as EmbeddedQuestion[];

    const displayQuestions: EmbeddedQuestion[] = questions.length > 0 ? questions : DEMO_EMBEDDED_QUESTIONS;

    return (
        <>
            <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <CustomModal.Content className="w-full max-w-5xl !rounded-[24px]">
                    <Dialog className="flex max-h-[90vh] flex-col gap-4 overflow-hidden rounded-[24px] bg-white p-6 shadow-2xl outline-none">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <Heading slot="title" className="text-lg font-bold text-slate-800">
                                {UI_TEXT.reviewMaterials.contentTypeReading}
                                {" - "}
                                {lessonName}
                            </Heading>
                            <button
                                type="button"
                                onClick={onClose}
                                className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        {/* Metadata Section Header */}
                        <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 border-b border-slate-100 pb-3 text-xs text-slate-600 sm:grid-cols-2">
                            <div>
                                <div>
                                    <strong className="font-semibold text-slate-500">
                                        {UI_TEXT.reviewMaterials.thLessonName}
                                        {":"}
                                    </strong>{" "}
                                    <span className="font-bold text-slate-800">{lessonName}</span>
                                </div>
                                <div className="mt-1">
                                    <strong className="font-semibold text-slate-500">
                                        {UI_TEXT.reviewMaterials.authorLabel}
                                        {":"}
                                    </strong>{" "}
                                    <span className="font-semibold text-slate-800">{authorName}</span>
                                </div>
                            </div>
                            <div>
                                <div>
                                    <strong className="font-semibold text-slate-500">
                                        {UI_TEXT.reviewMaterials.sessionLabel}
                                        {":"}
                                    </strong>{" "}
                                    <span className="font-semibold text-slate-800">{sessionName}</span>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        {isLoading ? (
                            <div className="flex h-64 items-center justify-center text-sm font-semibold text-slate-500">
                                <Loader2 className="mr-2 size-6 animate-spin text-wine" />
                                {UI_TEXT.reviewMaterials.loadingList}
                            </div>
                        ) : (
                            <div className="custom-scrollbar grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-y-auto pr-1 lg:grid-cols-12">
                                {/* Left Column: Reading Content / Document */}
                                <div className="flex flex-col gap-2 lg:col-span-7">
                                    <label className="block text-xs font-bold tracking-wider text-slate-500 uppercase">
                                        {UI_TEXT.reviewMaterials.contentTypeReading}
                                        {":"}
                                    </label>
                                    <div className="custom-scrollbar relative max-h-[460px] min-h-[320px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-relaxed text-slate-800 shadow-xs">
                                        {pdfUrl ? (
                                            <iframe src={pdfUrl} className="h-[400px] w-full rounded-xl border-0" title={lessonName} />
                                        ) : readingContent ? (
                                            <div dangerouslySetInnerHTML={{ __html: readingContent }} />
                                        ) : (
                                            <p className="text-xs text-slate-400 italic">{UI_TEXT.reviewMaterials.contentTypeNone}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Right Column: Embedded Questions */}
                                <div className="flex flex-col gap-3 lg:col-span-5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold tracking-wider text-slate-500 uppercase">
                                            {UI_TEXT.quizReview.title}
                                            {" ("}
                                            {displayQuestions.length}
                                            {")"}
                                        </label>
                                        <button
                                            onClick={() => setIsExpandOpen(true)}
                                            className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-bold text-purple-600 hover:text-purple-700"
                                        >
                                            <Maximize2 className="size-3" />
                                            <span>{UI_TEXT.reviewMaterials.btnDetail}</span>
                                        </button>
                                    </div>

                                    <div className="custom-scrollbar flex max-h-[460px] flex-col gap-3.5 overflow-y-auto pr-1">
                                        {displayQuestions.map((q, idx) => (
                                            <div key={q._id || idx} className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 text-xs">
                                                <div className="leading-snug font-bold text-slate-800">
                                                    {UI_TEXT.quizziSetDetail.questionPrefix}
                                                    {idx + 1}
                                                    {": "}
                                                    {q.content}
                                                </div>
                                                <div className="mt-2.5 flex flex-col gap-1.5">
                                                    {(q.options || []).map((opt, oIdx) => (
                                                        <div
                                                            key={oIdx}
                                                            className={`rounded-xl border p-2 text-[11.5px] font-medium transition-colors ${
                                                                opt.isCorrect
                                                                    ? "border-emerald-300 bg-emerald-50 font-semibold text-emerald-900"
                                                                    : "border-slate-200/70 bg-white text-slate-700"
                                                            }`}
                                                        >
                                                            {String.fromCharCode(65 + oIdx)}
                                                            {". "}
                                                            {opt.content}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Dialog>
                </CustomModal.Content>
            </CustomModal.Root>

            {/* Expand Fullscreen Quiz Modal */}
            {isExpandOpen && (
                <CustomModal.Root open={isExpandOpen} onOpenChange={(open) => !open && setIsExpandOpen(false)}>
                    <CustomModal.Content className="w-full max-w-4xl !rounded-[24px]">
                        <Dialog className="flex max-h-[90vh] flex-col gap-4 overflow-hidden rounded-[24px] bg-white p-6 shadow-2xl outline-none">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <Heading slot="title" className="text-lg font-bold text-slate-800">
                                    {UI_TEXT.quizReview.title}
                                    {" - "}
                                    {lessonName}
                                </Heading>
                                <button
                                    type="button"
                                    onClick={() => setIsExpandOpen(false)}
                                    className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>
                            <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-1">
                                {displayQuestions.map((q, idx) => (
                                    <div key={q._id || idx} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                                        <h5 className="text-sm font-bold text-slate-900">
                                            {UI_TEXT.quizziSetDetail.questionPrefix}
                                            {idx + 1}
                                            {": "}
                                            {q.content}
                                        </h5>
                                        <div className="mt-3 flex flex-col gap-2">
                                            {(q.options || []).map((opt, oIdx) => (
                                                <div
                                                    key={oIdx}
                                                    className={`rounded-xl border p-3 text-xs font-semibold ${opt.isCorrect ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-slate-100 bg-slate-50 text-slate-700"}`}
                                                >
                                                    {String.fromCharCode(65 + oIdx)}
                                                    {". "}
                                                    {opt.content}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Dialog>
                    </CustomModal.Content>
                </CustomModal.Root>
            )}
        </>
    );
}

// ----------------------------------------------------------------------
// 3. QUIZ MODAL ("Danh sách bài trắc nghiệm - [Tên lesson]")
// ----------------------------------------------------------------------
export function ReviewQuizModal({ isOpen, onClose, lessonItem, sessionName }: ReviewQuizModalProps) {
    const quizId = lessonItem?.quizId || "";

    const { data: quizData, isLoading } = useQuery<QuizBackendEntity>({
        queryKey: ["review-quiz-detail", quizId],
        queryFn: () => getQuizById(quizId),
        enabled: isOpen && !!quizId,
    });

    if (!isOpen || !lessonItem) return null;

    const lessonName = lessonItem.name;
    const authorName = formatUserName(lessonItem.author || lessonItem.createdBy);
    const quizTitle = quizData?.title || lessonName;
    const questions = quizData?.questions || DEMO_QUIZ_QUESTIONS;

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="w-full max-w-4xl !rounded-[24px]">
                <Dialog className="flex max-h-[90vh] flex-col gap-4 overflow-hidden rounded-[24px] bg-white p-6 shadow-2xl outline-none">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <Heading slot="title" className="text-lg font-bold text-slate-800">
                            {UI_TEXT.quizReview.title}
                            {" - "}
                            {quizTitle}
                        </Heading>
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Metadata Header */}
                    <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 border-b border-slate-100 pb-3 text-xs text-slate-600 sm:grid-cols-2">
                        <div>
                            <div>
                                <strong className="font-semibold text-slate-500">
                                    {UI_TEXT.reviewMaterials.thLessonName}
                                    {":"}
                                </strong>{" "}
                                <span className="font-bold text-slate-800">{lessonName}</span>
                            </div>
                            <div className="mt-1">
                                <strong className="font-semibold text-slate-500">
                                    {UI_TEXT.reviewMaterials.authorLabel}
                                    {":"}
                                </strong>{" "}
                                <span className="font-semibold text-slate-800">{authorName}</span>
                            </div>
                        </div>
                        <div>
                            <div>
                                <strong className="font-semibold text-slate-500">
                                    {UI_TEXT.reviewMaterials.sessionLabel}
                                    {":"}
                                </strong>{" "}
                                <span className="font-semibold text-slate-800">{sessionName}</span>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    {isLoading ? (
                        <div className="flex h-64 items-center justify-center text-sm font-semibold text-slate-500">
                            <Loader2 className="mr-2 size-6 animate-spin text-wine" />
                            {UI_TEXT.reviewMaterials.loadingList}
                        </div>
                    ) : (
                        <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
                            <div className="flex items-center justify-between">
                                <label className="block text-xs font-bold tracking-wider text-slate-500 uppercase">
                                    {UI_TEXT.quizReview.title}
                                    {" ("}
                                    {questions.length}
                                    {")"}
                                </label>
                            </div>

                            <div className="flex flex-col gap-4">
                                {questions.map((q, qIdx) => (
                                    <div key={qIdx} className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                                        <div className="flex items-start justify-between gap-3">
                                            <h5 className="text-sm leading-snug font-bold text-slate-900">
                                                {UI_TEXT.quizziSetDetail.questionPrefix}
                                                {qIdx + 1}
                                                {": "}
                                                {q.content}
                                            </h5>
                                            <span className="shrink-0 rounded-lg bg-amber-500 px-2.5 py-0.5 text-xs font-extrabold text-white">
                                                {q.points || 10} {UI_TEXT.quizziSetDetail.pointsSuffix}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-2 border-t border-slate-100 pt-1 text-xs">
                                            <div className="flex flex-col gap-2">
                                                {(q.options || []).map((opt, optIdx) => (
                                                    <div
                                                        key={optIdx}
                                                        className={`flex items-center justify-between rounded-xl border p-2.5 text-xs font-medium ${
                                                            opt.isCorrect
                                                                ? "border-emerald-300 bg-emerald-50 font-semibold text-emerald-900"
                                                                : "border-slate-100 bg-slate-50 text-slate-700"
                                                        }`}
                                                    >
                                                        <span>
                                                            {String.fromCharCode(65 + optIdx)}
                                                            {". "}
                                                            {opt.content}
                                                        </span>
                                                        {opt.isCorrect && (
                                                            <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                                                                {UI_TEXT.quizReview.correctAnswerBadge}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
