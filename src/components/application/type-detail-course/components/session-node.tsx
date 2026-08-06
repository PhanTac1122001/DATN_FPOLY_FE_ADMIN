"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookText, ChevronDown, ChevronRight, Code2, File, FileText, GripVertical, HelpCircle, Map, Plus, ScrollText } from "lucide-react";
import { ConfirmModal } from "@/components/application/modals/confirm-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { coursewareService } from "@/services/courseware.service";
import {
    createLesson,
    deleteLesson,
    deleteSessionPractice,
    deleteSessionPracticeById,
    getLessonsBySession,
    updateLesson,
    updateSession,
} from "@/services/material.service";
import { toast } from "@/services/toast.service";
import type { SessionNodeProps } from "@/types/courseware.types";
import type { Lesson, Session, SessionPractice } from "@/types/material.types";
import { AddLessonModal } from "../modals/add-lesson-modal";
import { LessonNode } from "./lesson-node";

export function SessionNode({
    session,
    index,
    selectedLessonId,
    selectedSessionId,
    selectedSessionTab,
    selectedTab,
    selectedPracticeId: _selectedPracticeId,
    onSelectLesson,
    onSelectSession,
    onEditSession,
    onDeleteSession: _onDeleteSession,
    onOpenLessonCompletionRule,
    courseId,
}: SessionNodeProps) {
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [deletingPracticeTarget, setDeletingPracticeTarget] = useState<SessionPractice | null>(null);

    const { data: sessionBlocks = [] } = useQuery({
        queryKey: ["session-blocks", session.id],
        queryFn: () => coursewareService.getSessionBlocks(session.id),
        enabled: !!session.id,
    });

    const practiceBlocks = sessionBlocks.filter((b) => b.type === "PRACTICE" || b.type === "ASSIGNMENT");

    const deletePracticeMutation = useMutation({
        mutationFn: (p: SessionPractice) => {
            const pId = p._id || p.id;
            if (pId) {
                return deleteSessionPracticeById(session.id, pId);
            } else {
                return deleteSessionPractice(session.id);
            }
        },
        onSuccess: () => {
            toast.success(UI_TEXT.courseClassModal.toastCreateSuccessTitle, UI_TEXT.sessionNode.toastDeletePracticeSuccess);
            queryClient.invalidateQueries({ queryKey: ["sessions", session.courseId] });
            setDeletingPracticeTarget(null);
        },
        onError: () => {
            toast.error(UI_TEXT.courseClassModal.toastCreateErrorTitle, UI_TEXT.sessionNode.toastDeletePracticeError);
        },
    });
    const [draggedLessonIndex, setDraggedLessonIndex] = useState<number | null>(null);
    const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
    const [newLessonName, setNewLessonName] = useState("");
    const [deletingLessonTarget, setDeletingLessonTarget] = useState<{ id: string; name: string } | null>(null);

    const [editingLessonTarget, setEditingLessonTarget] = useState<Lesson | null>(null);
    const [editLessonName, setEditLessonName] = useState("");

    const updateLessonMutation = useMutation({
        mutationFn: ({ lessonId, name }: { lessonId: string; name: string }) => updateLesson(lessonId, { name }),
        onSuccess: () => {
            toast.success(UI_TEXT.courseClassModal.toastCreateSuccessTitle, UI_TEXT.sessionNode.toastUpdateLessonSuccess);
            queryClient.invalidateQueries({ queryKey: ["lessons", session.id] });
            queryClient.invalidateQueries({ queryKey: ["lesson-details-editor"] });
            setEditingLessonTarget(null);
        },
        onError: () => {
            toast.error(UI_TEXT.courseClassModal.toastCreateErrorTitle, UI_TEXT.sessionNode.toastUpdateLessonError);
        },
    });

    const handleEditLesson = (les: Lesson) => {
        setEditingLessonTarget(les);
        setEditLessonName(les.name);
    };

    const handleSubmitEditLesson = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingLessonTarget && editLessonName.trim()) {
            updateLessonMutation.mutate({
                lessonId: editingLessonTarget.id,
                name: editLessonName.trim(),
            });
        }
    };

    const _updateSessionMutation = useMutation({
        mutationFn: ({ sessionId, body }: { sessionId: string; body: Partial<Session> }) => updateSession(sessionId, body),
        onSuccess: () => {
            toast.success(UI_TEXT.courseClassModal.toastCreateSuccessTitle, UI_TEXT.sessionNode.toastUpdatePracticeSuccess);
            queryClient.invalidateQueries({ queryKey: ["sessions", session.courseId] });
        },
        onError: () => {
            toast.error(UI_TEXT.courseClassModal.toastCreateErrorTitle, UI_TEXT.sessionNode.toastUpdatePracticeError);
        },
    });

    const { data: lessons = [], isLoading } = useQuery({
        queryKey: ["lessons", session.id],
        queryFn: () => getLessonsBySession(session.id),
    });

    useEffect(() => {
        if (selectedLessonId && lessons.some((l) => l.id === selectedLessonId)) {
            setIsOpen(true);
        }
    }, [selectedLessonId, lessons]);

    const addLessonMutation = useMutation({
        mutationFn: (name: string) => {
            const maxPos = lessons.length > 0 ? Math.max(...lessons.map((l) => l.position ?? 0)) + 1 : 0;
            return createLesson({
                name,
                sessionId: session.id,
                courseId: session.courseId || courseId || "",
                position: maxPos,
            });
        },
        onSuccess: (newLesson) => {
            toast.success(UI_TEXT.courseClassModal.toastCreateSuccessTitle, UI_TEXT.sessionNode.toastAddLessonSuccess);
            queryClient.invalidateQueries({ queryKey: ["lessons", session.id] });
            setIsOpen(true); // Always open/expand the chapter dropdown when a new lesson is added
            if (newLesson?.id) {
                onSelectLesson(newLesson.id, "video");
            }
        },
    });

    const deleteLessonMutation = useMutation({
        mutationFn: (lessonId: string) => deleteLesson(lessonId),
        onSuccess: (_, lessonId) => {
            toast.success(UI_TEXT.courseClassModal.toastCreateSuccessTitle, UI_TEXT.sessionNode.toastDeleteLessonSuccess);
            queryClient.invalidateQueries({ queryKey: ["lessons", session.id] });
            if (selectedLessonId === lessonId) {
                onSelectLesson("", "video");
            }
        },
        onError: () => {
            toast.error(UI_TEXT.courseClassModal.toastCreateErrorTitle, UI_TEXT.sessionNode.toastDeleteLessonError);
        },
    });

    const reorderLessonsMutation = useMutation({
        mutationFn: async ({ lessonAId, positionA, lessonBId, positionB }: { lessonAId: string; positionA: number; lessonBId: string; positionB: number }) => {
            await Promise.all([updateLesson(lessonAId, { position: positionB }), updateLesson(lessonBId, { position: positionA })]);
        },
        onSuccess: () => {
            toast.success(UI_TEXT.courseClassModal.toastCreateSuccessTitle, UI_TEXT.sessionNode.toastReorderLessonSuccess);
            queryClient.invalidateQueries({ queryKey: ["lessons", session.id] });
        },
        onError: () => {
            toast.error(UI_TEXT.courseClassModal.toastCreateErrorTitle, UI_TEXT.sessionNode.toastReorderLessonError);
        },
    });

    const handleAddLesson = (e: React.MouseEvent) => {
        e.stopPropagation();
        setNewLessonName("");
        setIsAddLessonOpen(true);
    };

    const handleSubmitAddLesson = (e: React.FormEvent) => {
        e.preventDefault();
        if (newLessonName.trim()) {
            addLessonMutation.mutate(newLessonName.trim(), {
                onSuccess: () => {
                    setIsAddLessonOpen(false);
                    setNewLessonName("");
                    setIsOpen(true);
                },
            });
        }
    };

    const sortedLessons = [...lessons].sort((a, b) => {
        const posA = a.position ?? 0;
        const posB = b.position ?? 0;
        if (posA !== posB) return posA - posB;
        const rawA = (a as unknown as Record<string, unknown>).createdAt;
        const rawB = (b as unknown as Record<string, unknown>).createdAt;
        const dateA = rawA ? new Date(rawA as string | number).getTime() : 0;
        const dateB = rawB ? new Date(rawB as string | number).getTime() : 0;
        return dateA - dateB;
    });

    const handleSwapLessons = (draggedIdx: number, targetIdx: number) => {
        const draggedLesson = sortedLessons[draggedIdx];
        const targetLesson = sortedLessons[targetIdx];

        let posA = draggedLesson.position || 0;
        let posB = targetLesson.position || 0;
        if (posA === posB) {
            posA = draggedIdx;
            posB = targetIdx;
        }

        reorderLessonsMutation.mutate({
            lessonAId: draggedLesson.id,
            positionA: posA,
            lessonBId: targetLesson.id,
            positionB: posB,
        });
    };

    return (
        <div
            className={`flex flex-col gap-2 rounded-xl border p-3.5 transition ${selectedSessionId === session.id ? "border-blue-300 bg-blue-50/20 shadow-xs" : "border-slate-200/40 bg-slate-50/50 hover:bg-slate-50"
                }`}
        >
            {/* Session Header */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-1.5">
                    <div
                        className="shrink-0 cursor-grab p-0.5 text-slate-300 transition hover:text-slate-500 active:cursor-grabbing"
                        title={UI_TEXT.coursesPage.dragToMoveTooltip}
                    >
                        <GripVertical className="size-3.5" />
                    </div>
                    {/* Toggle open/close Chevron button */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(!isOpen);
                        }}
                        className="shrink-0 cursor-pointer rounded-md p-1 text-slate-400 transition duration-150 hover:bg-slate-100 hover:text-slate-600"
                        title={isOpen ? UI_TEXT.coursesPage.collapseChapterTooltip : UI_TEXT.coursesPage.expandChapterTooltip}
                    >
                        {isOpen ? <ChevronDown className="size-4 shrink-0" /> : <ChevronRight className="size-4 shrink-0" />}
                    </button>
                    {/* Title click opens session edit form */}
                    <div
                        onClick={() => {
                            onEditSession?.(session);
                        }}
                        className="group flex min-w-0 flex-1 cursor-pointer flex-col select-none"
                    >
                        <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                            {UI_TEXT.coursesPage.chapterIndexPrefix}
                            {index + 1}
                        </span>
                        <h4 className="truncate text-[15px] leading-snug font-extrabold text-slate-800 transition group-hover:text-blue-600">{session.name}</h4>
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                    <button
                        onClick={handleAddLesson}
                        title={UI_TEXT.sessionNode.addLessonBtnTooltip}
                        className="flex size-6 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-wine hover:bg-wine/5 hover:text-wine"
                    >
                        <Plus className="size-3.5" />
                    </button>
                </div>
            </div>

            {/* Session resources (Mindmap, PDF, SRS, Mini Project, Exercise, Entrance Quiz) */}
            {(session.mindmap || session.pdf || session.srs || session.miniProject || session.exercise || session.practiceEntranceQuiz) && (
                <div className="animate-fadeIn mt-0.5 flex flex-wrap items-center gap-1.5 pl-[30px]" onClick={(e) => e.stopPropagation()}>
                    {session.mindmap && (
                        <button
                            type="button"
                            onClick={() => onSelectSession?.(session.id, "mindmap")}
                            className={`inline-flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] font-bold transition ${selectedSessionId === session.id && selectedSessionTab === "mindmap"
                                    ? "bg-pink-600 text-white"
                                    : "bg-pink-50 text-pink-600 hover:bg-pink-100 hover:text-pink-700"
                                }`}
                            title={UI_TEXT.coursesPage.viewMindmapTooltip}
                        >
                            <Map className="size-3" />
                            <span>{UI_TEXT.sessionNode.mindmapTab}</span>
                        </button>
                    )}
                    {session.pdf && (
                        <button
                            type="button"
                            onClick={() => onSelectSession?.(session.id, "pdf")}
                            className={`inline-flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] font-bold transition ${selectedSessionId === session.id && selectedSessionTab === "pdf"
                                    ? "bg-rose-600 text-white"
                                    : "bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700"
                                }`}
                            title={UI_TEXT.coursesPage.viewPdfTooltip}
                        >
                            <FileText className="size-3" />
                            <span>{UI_TEXT.sessionNode.pdfTab}</span>
                        </button>
                    )}
                    {session.srs && (
                        <button
                            type="button"
                            onClick={() => onSelectSession?.(session.id, "srs")}
                            className={`inline-flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] font-bold transition ${selectedSessionId === session.id && selectedSessionTab === "srs"
                                    ? "bg-indigo-600 text-white"
                                    : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700"
                                }`}
                            title={UI_TEXT.coursesPage.viewSrsTooltip}
                        >
                            <ScrollText className="size-3" />
                            <span>{UI_TEXT.sessionNode.srsTab}</span>
                        </button>
                    )}
                    {session.miniProject && (
                        <button
                            type="button"
                            onClick={() => onSelectSession?.(session.id, "miniProject")}
                            className={`inline-flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] font-bold transition ${selectedSessionId === session.id && selectedSessionTab === "miniProject"
                                    ? "bg-emerald-600 text-white"
                                    : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700"
                                }`}
                            title={UI_TEXT.coursesPage.viewMiniProjectTooltip}
                        >
                            <File className="size-3" />
                            <span>{UI_TEXT.sessionNode.miniProjectTab}</span>
                        </button>
                    )}
                    {session.exercise && (
                        <button
                            type="button"
                            onClick={() => onSelectSession?.(session.id, "exercise")}
                            className={`inline-flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] font-bold transition ${selectedSessionId === session.id && selectedSessionTab === "exercise"
                                    ? "bg-violet-600 text-white"
                                    : "bg-violet-50 text-violet-600 hover:bg-violet-100 hover:text-violet-700"
                                }`}
                            title={UI_TEXT.coursesPage.viewExerciseTooltip}
                        >
                            <BookText className="size-3" />
                            <span>{UI_TEXT.sessionNode.exerciseTab}</span>
                        </button>
                    )}
                    {session.practiceEntranceQuiz && (
                        <button
                            type="button"
                            onClick={() => onSelectSession?.(session.id, "practiceEntranceQuiz")}
                            className={`inline-flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] font-bold transition ${selectedSessionId === session.id && selectedSessionTab === "practiceEntranceQuiz"
                                    ? "bg-amber-600 text-white"
                                    : "bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700"
                                }`}
                            title={UI_TEXT.coursesPage.viewEntranceQuizTooltip}
                        >
                            <HelpCircle className="size-3" />
                            <span>{UI_TEXT.sessionNode.entranceQuizTab}</span>
                        </button>
                    )}
                </div>
            )}

            {/* Nested Lessons List */}
            {isOpen && (
                <div className="mt-1 flex flex-col gap-1.5 pl-2">
                    {isLoading ? (
                        <div className="py-2 text-center">
                            <div className="mx-auto size-3.5 animate-spin rounded-full border border-slate-200 border-t-wine" />
                        </div>
                    ) : lessons.length === 0 ? (
                        <p className="py-1 pl-1 text-xs text-slate-400 italic">{UI_TEXT.coursesPage.emptyLessonsText}</p>
                    ) : (
                        sortedLessons.map((les, idx) => {
                            return (
                                <div
                                    key={les.id}
                                    draggable
                                    onDragStart={() => setDraggedLessonIndex(idx)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => {
                                        if (draggedLessonIndex !== null && draggedLessonIndex !== idx) {
                                            handleSwapLessons(draggedLessonIndex, idx);
                                        }
                                        setDraggedLessonIndex(null);
                                    }}
                                    onDragEnd={() => setDraggedLessonIndex(null)}
                                    className={`rounded-lg transition-all duration-150 ${draggedLessonIndex === idx ? "scale-[0.98] border border-dashed border-blue-300 opacity-30" : ""
                                        }`}
                                >
                                    <LessonNode
                                        lesson={les}
                                        selectedLessonId={selectedLessonId}
                                        selectedTab={selectedTab}
                                        onSelectLesson={onSelectLesson}
                                        onDelete={() => setDeletingLessonTarget({ id: les.id, name: les.name })}
                                        onEdit={() => handleEditLesson(les)}
                                        onOpenCompletionRule={onOpenLessonCompletionRule}
                                        isDeletePending={deleteLessonMutation.isPending}
                                    />
                                </div>
                            );
                        })
                    )}

                    {/* Practice Courseware Blocks list */}
                    {practiceBlocks.map((b, pIdx) => {
                        const isPracticeSelected = selectedSessionId === session.id && selectedSessionTab === "practice" && _selectedPracticeId === b.id;
                        return (
                            <div
                                key={b.id || pIdx}
                                onClick={() => onSelectSession?.(session.id, "practice", b.id)}
                                className={`group mt-0.5 flex w-full cursor-pointer items-center justify-between rounded-lg p-2.5 text-left text-sm transition duration-150 ${isPracticeSelected ? "bg-blue-50/60 font-semibold text-blue-600" : "bg-white font-medium text-slate-500 hover:bg-blue-50/40"
                                    }`}
                            >
                                <div className="flex min-w-0 flex-1 items-center justify-between gap-1.5 pl-1">
                                    <div className="flex min-w-0 flex-1 items-center gap-1.5">
                                        <FileText className="size-4 shrink-0 text-blue-600" />
                                        <span className="flex-1 truncate font-bold text-slate-700">
                                            {b.title || `${UI_TEXT.sessionNode.practiceTabPrefix}${pIdx + 1}`}
                                        </span>
                                    </div>
                                    <span
                                        className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${b.isRequired
                                                ? "bg-red-50 text-red-600 border border-red-100"
                                                : "bg-slate-100 text-slate-500"
                                            }`}
                                    >
                                        {b.isRequired ? "Bắt buộc" : "Tùy chọn"}
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                    {/* Session Homework Node */}
                    <div
                        onClick={() => onSelectSession?.(session.id, "homework")}
                        className={`group mt-0.5 flex w-full cursor-pointer items-center justify-between rounded-lg p-2.5 text-left text-sm transition duration-150 ${selectedSessionId === session.id && selectedSessionTab === "homework"
                                ? "bg-blue-50/60 font-semibold text-blue-600"
                                : "bg-white font-medium text-slate-500 hover:bg-blue-50/40"
                            }`}
                    >
                        <div className="flex min-w-0 flex-1 items-center gap-1.5 pl-1">
                            <Code2 className="size-4 shrink-0 text-indigo-600" />
                            <span className="flex-1 truncate font-bold text-slate-700">{UI_TEXT.sessionNode.homeworkTab}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Modal for Adding Lesson / Practice / Homework */}
            <AddLessonModal
                isOpen={isAddLessonOpen}
                onOpenChange={setIsAddLessonOpen}
                sessionId={session.id}
                courseId={session.courseId}
                sessionName={session.name}
                lessonName={newLessonName}
                setLessonName={setNewLessonName}
                onSubmit={handleSubmitAddLesson}
                onSelectPractice={() => {
                    setIsOpen(true);
                    onSelectSession?.(session.id, "practice");
                }}
                onSelectHomework={() => {
                    setIsOpen(true);
                    onSelectSession?.(session.id, "homework");
                }}
                isPending={addLessonMutation.isPending}
            />

            {/* Custom Modal for Editing Lesson Title */}
            <AddLessonModal
                mode="edit"
                isOpen={!!editingLessonTarget}
                onOpenChange={(open) => {
                    if (!open) setEditingLessonTarget(null);
                }}
                sessionId={session.id}
                courseId={session.courseId}
                sessionName={session.name}
                lessonName={editLessonName}
                setLessonName={setEditLessonName}
                onSubmit={handleSubmitEditLesson}
                isPending={updateLessonMutation.isPending}
            />

            {/* Confirmation Modal for Practice Deletion Target */}
            <ConfirmModal
                isOpen={!!deletingPracticeTarget}
                onClose={() => setDeletingPracticeTarget(null)}
                onConfirm={() => {
                    if (deletingPracticeTarget) {
                        deletePracticeMutation.mutate(deletingPracticeTarget);
                        setDeletingPracticeTarget(null);
                    }
                }}
                title={UI_TEXT.sessionNode.deletePracticeConfirmTitle}
                message={UI_TEXT.sessionNode.deletePracticeConfirmMsg}
                confirmText={UI_TEXT.sessionNode.deletePracticeConfirmBtn}
                cancelText={UI_TEXT.sessionNode.cancelBtn}
                variant="danger"
            />

            {/* Confirmation Modal for Lesson Deletion */}
            <ConfirmModal
                isOpen={!!deletingLessonTarget}
                onClose={() => setDeletingLessonTarget(null)}
                onConfirm={() => {
                    if (deletingLessonTarget) {
                        deleteLessonMutation.mutate(deletingLessonTarget.id);
                        setDeletingLessonTarget(null);
                    }
                }}
                title={UI_TEXT.sessionNode.deleteLessonConfirmTitle}
                message={`${UI_TEXT.sessionNode.deleteLessonConfirmMsgPrefix}${deletingLessonTarget?.name || ""}${UI_TEXT.sessionNode.deleteLessonConfirmMsgSuffix}`}
                confirmText={UI_TEXT.sessionNode.deleteLessonConfirmBtn}
                cancelText={UI_TEXT.sessionNode.cancelBtn}
                variant="danger"
            />
        </div>
    );
}
