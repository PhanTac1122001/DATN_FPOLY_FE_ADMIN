"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookText, ChevronDown, ChevronRight, FileText, GripVertical, Pencil, ShieldCheck, Trash2, Video } from "lucide-react";
import { ConfirmModal } from "@/components/application/modals/confirm-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { deleteLessonReading, deleteLessonVideo, linkLessonQuiz } from "@/services/material.service";
import { toast } from "@/services/toast.service";
import type { LessonNodeProps } from "@/types/courseware.types";

export function LessonNode({ lesson, selectedLessonId, selectedTab, onSelectLesson, onDelete, onEdit, onOpenCompletionRule, isDeletePending }: LessonNodeProps) {
    const queryClient = useQueryClient();
    const [isExpanded, setIsExpanded] = useState(false);
    const [deletingSubConfig, setDeletingSubConfig] = useState<"video" | "reading" | "quiz" | null>(null);
    const isSelected = lesson.id === selectedLessonId;

    const deleteSubConfigMutation = useMutation({
        mutationFn: async (type: "video" | "reading" | "quiz") => {
            if (type === "video") {
                return deleteLessonVideo(lesson.id);
            } else if (type === "reading") {
                return deleteLessonReading(lesson.id);
            } else if (type === "quiz") {
                return linkLessonQuiz(lesson.id, "");
            }
        },
        onSuccess: () => {
            toast.success(UI_TEXT.studentManagement.toastSuccess, UI_TEXT.lessonNode.toastDeleteConfigSuccess);
            queryClient.invalidateQueries({ queryKey: ["lessons", lesson.sessionId] });
            queryClient.invalidateQueries({ queryKey: ["lesson-details-editor", lesson.id] });
            setDeletingSubConfig(null);
        },
        onError: () => {
            toast.error(UI_TEXT.studentManagement.toastError, UI_TEXT.lessonNode.toastDeleteConfigError);
        },
    });

    useEffect(() => {
        if (isSelected) {
            setIsExpanded(true);
        }
    }, [isSelected]);

    const readingObj = lesson.reading as unknown as { content?: string; _doc?: { content?: string } };
    const readingContent = (readingObj?.content || readingObj?._doc?.content || "").trim();
    const hasReadingContent =
        !!readingContent &&
        readingContent !== "<p></p>" &&
        readingContent !== "<p><br></p>" &&
        readingContent !== "Tài liệu PDF" &&
        readingContent !== "Tài liệu HTML" &&
        readingContent !== "Tài liệu bài đọc";
    const hasReadingConfig = !!(lesson.reading?.pdf?.trim() || lesson.pdf?.trim() || hasReadingContent || lesson.reading?.htmlUrl?.trim());
    const hasVideoConfig = !!(lesson.video?.url?.trim() || lesson.videoUrl?.trim());

    return (
        <div className="flex w-full flex-col gap-1">
            {/* Lesson Header */}
            <div
                onClick={() => {
                    onSelectLesson(lesson.id, "video");
                }}
                className={`group flex w-full cursor-pointer items-center justify-between rounded-lg p-2.5 text-left text-sm transition duration-150 ${isSelected ? "bg-blue-50/60 font-bold text-slate-900" : "bg-white font-semibold text-slate-800 hover:bg-blue-50/40"
                    }`}
            >
                <div className="flex min-w-0 flex-1 items-center gap-1.5">
                    <div
                        className="shrink-0 cursor-grab p-0.5 text-slate-300 transition hover:text-slate-500 active:cursor-grabbing"
                        title={UI_TEXT.lessonNode.dragTooltip}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <GripVertical className="size-3.5" />
                    </div>
                    {/* Toggle open/close Chevron button */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(!isExpanded);
                        }}
                        className="shrink-0 cursor-pointer rounded p-1 text-slate-400 transition hover:bg-slate-100/50 hover:text-slate-600"
                        title={isExpanded ? UI_TEXT.lessonNode.collapseTooltip : UI_TEXT.lessonNode.expandTooltip}
                    >
                        {isExpanded ? <ChevronDown className="size-3.5 shrink-0" /> : <ChevronRight className="size-3.5 shrink-0" />}
                    </button>
                    <span className="flex-1 truncate font-bold text-slate-900">{lesson.name}</span>
                </div>
                <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition duration-150 group-hover:opacity-100">
                    {onOpenCompletionRule && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpenCompletionRule(lesson);
                            }}
                            className="cursor-pointer p-1 text-slate-400 transition duration-150 hover:text-wine"
                            title="Điều kiện hoàn thành bài học"
                        >
                            <ShieldCheck className="size-3.5 text-wine/80 hover:text-wine" />
                        </button>
                    )}
                    {onEdit && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit();
                            }}
                            className="cursor-pointer p-1 text-slate-400 transition duration-150 hover:text-slate-600"
                            title={UI_TEXT.lessonNode.editTooltip}
                        >
                            <Pencil className="size-3.5" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        disabled={isDeletePending}
                        className="cursor-pointer p-1 text-red-500 transition duration-150 hover:text-red-600"
                        title={UI_TEXT.lessonNode.deleteTooltip}
                    >
                        <Trash2 className="size-3.5" />
                    </button>
                </div>
            </div>

            {/* Sub-items list */}
            {isExpanded && (
                <div className="mt-0.5 ml-3 flex flex-col gap-1 border-l border-slate-200/60 pl-5">
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelectLesson(lesson.id, "video");
                        }}
                        className={`group/sub flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition duration-150 ${isSelected && selectedTab === "video" ? "bg-wine/5 font-semibold text-wine" : "cursor-pointer text-slate-600 hover:bg-slate-50"
                            }`}
                    >
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                            <Video className="size-3.5 shrink-0" />
                            <span className="truncate">{UI_TEXT.lessonNode.videoConfig}</span>
                        </div>
                        {hasVideoConfig && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDeletingSubConfig("video");
                                }}
                                className={`shrink-0 cursor-pointer p-0.5 text-red-500 transition duration-150 hover:text-red-600 ${isSelected && selectedTab === "video" ? "opacity-100" : "opacity-0 group-hover/sub:opacity-100"}`}
                                title={UI_TEXT.lessonNode.deleteVideoConfigTooltip}
                            >
                                <Trash2 className="size-3.5" />
                            </button>
                        )}
                    </div>

                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelectLesson(lesson.id, "reading");
                        }}
                        className={`group/sub flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition duration-150 ${isSelected && selectedTab === "reading" ? "bg-wine/5 font-semibold text-wine" : "cursor-pointer text-slate-600 hover:bg-slate-50"
                            }`}
                    >
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                            <FileText className="size-3.5 shrink-0" />
                            <span className="truncate">{UI_TEXT.lessonNode.readingConfig}</span>
                        </div>
                        {hasReadingConfig && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDeletingSubConfig("reading");
                                }}
                                className={`shrink-0 cursor-pointer p-0.5 text-red-500 transition duration-150 hover:text-red-600 ${isSelected && selectedTab === "reading" ? "opacity-100" : "opacity-0 group-hover/sub:opacity-100"}`}
                                title={UI_TEXT.lessonNode.deleteReadingConfigTooltip}
                            >
                                <Trash2 className="size-3.5" />
                            </button>
                        )}
                    </div>

                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelectLesson(lesson.id, "quiz");
                        }}
                        className={`group/sub flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition duration-150 ${isSelected && selectedTab === "quiz" ? "bg-wine/5 font-semibold text-wine" : "cursor-pointer text-slate-600 hover:bg-slate-50"
                            }`}
                    >
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                            <BookText className="size-3.5 shrink-0" />
                            <span className="truncate">{UI_TEXT.lessonNode.quizConfig}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal for Sub-Config Deletion */}
            <ConfirmModal
                isOpen={!!deletingSubConfig}
                onClose={() => setDeletingSubConfig(null)}
                onConfirm={() => {
                    if (deletingSubConfig) {
                        deleteSubConfigMutation.mutate(deletingSubConfig);
                    }
                }}
                title={
                    deletingSubConfig === "video"
                        ? UI_TEXT.lessonNode.deleteVideoTitle
                        : deletingSubConfig === "reading"
                            ? UI_TEXT.lessonNode.deleteReadingTitle
                            : UI_TEXT.lessonNode.deleteQuizTitle
                }
                message={
                    deletingSubConfig === "video"
                        ? `${UI_TEXT.lessonNode.deleteVideoMessagePrefix}${lesson.name}${UI_TEXT.lessonNode.deleteMessageSuffix}`
                        : deletingSubConfig === "reading"
                            ? `${UI_TEXT.lessonNode.deleteReadingMessagePrefix}${lesson.name}${UI_TEXT.lessonNode.deleteMessageSuffix}`
                            : `${UI_TEXT.lessonNode.deleteQuizMessagePrefix}${lesson.name}${UI_TEXT.lessonNode.deleteMessageSuffix}`
                }
                confirmText={UI_TEXT.learningMaterials.confirmDeleteButton}
                cancelText={UI_TEXT.courseDetail.cancelButton}
                variant="danger"
            />
        </div>
    );
}
