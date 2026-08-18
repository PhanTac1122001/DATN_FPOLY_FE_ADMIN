"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, FileText, Play, Plus, Save, ShieldAlert } from "lucide-react";
import type { Route } from "next";
import { ConfirmModal } from "@/components/application/modals/confirm-modal";
import { SessionTypeModal } from "@/components/application/modals/session-type-modal";
import { LessonEditorWrapper } from "@/components/application/type-detail-course/components/lesson-editor-wrapper";
import { SessionForm } from "@/components/application/type-detail-course/components/session-form";
import { SessionNode } from "@/components/application/type-detail-course/components/session-node";
import { SessionViewerWrapper } from "@/components/application/type-detail-course/components/session-viewer-wrapper";
import { LessonCompletionRuleModal } from "@/components/application/type-detail-course/modals/lesson-completion-rule-modal";
import { SessionCompletionRuleModal } from "@/components/application/type-detail-course/modals/session-completion-rule-modal";
import { SessionSelectItem, SessionSelectModal } from "@/components/application/type-detail-course/modals/session-select-modal";
import { Button } from "@/components/base/buttons/button";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { useAppRouter } from "@/hooks/use-app-router";
import { getCourseById } from "@/services/course.service";
import { createSession, deleteSession, getQuizzesList, getSessionsByCourse, updateSession } from "@/services/material.service";
import { toast } from "@/services/toast.service";
import type { SessionFields } from "@/types/courseware.types";
import { type Lesson, type Session, SessionTypeEnum } from "@/types/material.types";
import type { TypeDetailCourseViewProps } from "@/types/type.types";

const defaultMaxAiGradeAttempts = 3;

export function TypeDetailCourseView({ id, courseId }: TypeDetailCourseViewProps) {
    const router = useAppRouter();
    const queryClient = useQueryClient();

    const [selectedLessonId, setSelectedLessonId] = useState("");
    const [selectedTab, setSelectedTab] = useState<"video" | "reading" | "quiz">("video");
    const [selectedSessionId, setSelectedSessionId] = useState("");
    const [selectedSessionTab, setSelectedSessionTab] = useState<
        "mindmap" | "pdf" | "srs" | "miniProject" | "exercise" | "practiceEntranceQuiz" | "practice" | "homework"
    >("mindmap");
    const [selectedPracticeId, setSelectedPracticeId] = useState("");
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [isAddingSession, setIsAddingSession] = useState(false);

    const initialSessionFields: SessionFields = {
        name: "",
        type: SessionTypeEnum.LY_THUYET,
        typeId: undefined,
        status: true,
        mindmap: "",
        srs: "",
        miniProject: "",
        pdf: "",
        exercise: "",
        quizzi: "",
        practiceEntranceQuiz: "",
        isShowMindmap: false,
        description: "",
        maxAiGradeAttempts: 3,
    };

    const [newSessionFields, setNewSessionFields] = useState<SessionFields>(initialSessionFields);
    const [editingSession, setEditingSession] = useState<Session | null>(null);
    const [editSessionFields, setEditSessionFields] = useState<SessionFields>(initialSessionFields);
    const [savedSessionFields, setSavedSessionFields] = useState<SessionFields>(initialSessionFields);
    const [isDeleteSessionOpen, setIsDeleteSessionOpen] = useState(false);
    const [deletingSession, setDeletingSession] = useState<{ id: string; name: string } | null>(null);

    const [isLessonDirty, setIsLessonDirty] = useState(false);
    const [lessonResetKey, setLessonResetKey] = useState(0);
    const [isConfirmUnsavedOpen, setIsConfirmUnsavedOpen] = useState(false);
    const [isSessionTypeModalOpen, setIsSessionTypeModalOpen] = useState(false);
    const [sessionTypesReloadToken, setSessionTypesReloadToken] = useState(0);
    const [isSessionSelectModalOpen, setIsSessionSelectModalOpen] = useState(false);
    const [isCompletionRuleModalOpen, setIsCompletionRuleModalOpen] = useState(false);
    const [_isLessonRuleModalOpen, _setIsLessonRuleModalOpen] = useState(false);
    const [ruleTargetSession, setRuleTargetSession] = useState<SessionSelectItem | null>(null);
    const [ruleTargetLesson, setRuleTargetLesson] = useState<{ id: string; name: string } | null>(null);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

    const normalizeSessionFields = (fields: SessionFields): SessionFields => ({
        ...fields,
        name: (fields.name || "").trim(),
        type: (fields.type || "").trim(),
        typeId: fields.typeId || undefined,
        status: !!fields.status,
        mindmap: (fields.mindmap || "").trim(),
        srs: (fields.srs || "").trim(),
        miniProject: (fields.miniProject || "").trim(),
        pdf: (fields.pdf || "").trim(),
        exercise: (fields.exercise || "").trim(),
        quizzi: (fields.quizzi || "").trim(),
        practiceEntranceQuiz: (fields.practiceEntranceQuiz || "").trim(),
        isShowMindmap: !!fields.isShowMindmap,
        description: (fields.description || "").trim(),
        maxAiGradeAttempts: fields.maxAiGradeAttempts && Number(fields.maxAiGradeAttempts) >= 1 ? Number(fields.maxAiGradeAttempts) : defaultMaxAiGradeAttempts,
    });

    const isSessionDirty = isAddingSession
        ? JSON.stringify(normalizeSessionFields(newSessionFields)) !== JSON.stringify(normalizeSessionFields(initialSessionFields))
        : editingSession
          ? JSON.stringify(normalizeSessionFields(editSessionFields)) !== JSON.stringify(normalizeSessionFields(savedSessionFields))
          : false;

    const hasUnsavedChanges = isAddingSession || !!editingSession ? isSessionDirty : !!selectedLessonId && isLessonDirty;

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = "";
                return "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [hasUnsavedChanges]);

    const executeWithUnsavedCheck = (action: () => void) => {
        if (hasUnsavedChanges) {
            setPendingAction(() => action);
            setIsConfirmUnsavedOpen(true);
        } else {
            action();
        }
    };

    const [isDeleteCourseOpen, setIsDeleteCourseOpen] = useState(false);
    const [isSavingLesson, setIsSavingLesson] = useState(false);
    const lessonSaveRef = useRef<(() => Promise<void>) | null>(null);
    const sessionSaveRef = useRef<(() => void) | null>(null);

    // Queries — elearning/:courseId only needs the course itself (no system fan-out)
    const { data: courseDetail, isLoading: isLoadingCourseDetail } = useQuery({
        queryKey: ["course-detail", courseId],
        queryFn: () => getCourseById(courseId),
        enabled: !!courseId,
    });

    const { data: sessions = [], isLoading: loadingSessions } = useQuery({
        queryKey: ["sessions", courseId],
        queryFn: () => getSessionsByCourse(courseId),
        enabled: !!courseId,
    });

    const { data: quizzes = [], isLoading: isLoadingQuizzes } = useQuery({
        queryKey: ["quizzes-list"],
        queryFn: getQuizzesList,
    });

    const addSessionMutation = useMutation({
        mutationFn: (body: Omit<Session, "id" | "createdAt" | "position"> & { position?: number }) => createSession(body),
        onSuccess: () => {
            toast.success(UI_TEXT.classes.toastSuccess, UI_TEXT.courseDetail.toastAddSessionSuccess);
            queryClient.invalidateQueries({ queryKey: ["sessions", courseId] });
        },
    });

    const reorderSessionsMutation = useMutation({
        mutationFn: async ({
            sessionAId,
            positionA,
            sessionBId,
            positionB,
        }: {
            sessionAId: string;
            positionA: number;
            sessionBId: string;
            positionB: number;
        }) => {
            await Promise.all([updateSession(sessionAId, { position: positionB }), updateSession(sessionBId, { position: positionA })]);
        },
        onSuccess: () => {
            toast.success(UI_TEXT.classes.toastSuccess, UI_TEXT.courseDetail.toastReorderSessionSuccess);
            queryClient.invalidateQueries({ queryKey: ["sessions", courseId] });
        },
        onError: () => {
            toast.error(UI_TEXT.classes.toastError, UI_TEXT.courseDetail.toastReorderSessionError);
        },
    });

    const updateSessionMutation = useMutation({
        mutationFn: ({ sessionId, body }: { sessionId: string; body: Partial<Session> }) => updateSession(sessionId, body),
        onSuccess: () => {
            toast.success(UI_TEXT.classes.toastSuccess, UI_TEXT.courseDetail.toastUpdateSessionSuccess);
            queryClient.invalidateQueries({ queryKey: ["sessions", courseId] });
        },
        onError: () => {
            toast.error(UI_TEXT.classes.toastError, UI_TEXT.courseDetail.toastUpdateSessionError);
        },
    });

    const deleteSessionMutation = useMutation({
        mutationFn: (sessionId: string) => deleteSession(sessionId),
        onSuccess: () => {
            toast.success(UI_TEXT.classes.toastSuccess, UI_TEXT.courseDetail.toastDeleteSessionSuccess);
            queryClient.invalidateQueries({ queryKey: ["sessions", courseId] });
            if (editingSession && deletingSession && editingSession.id === deletingSession.id) {
                setEditingSession(null);
            }
            if (selectedSessionId && deletingSession && selectedSessionId === deletingSession.id) {
                setSelectedSessionId("");
            }
            setDeletingSession(null);
        },
        onError: () => {
            toast.error(UI_TEXT.classes.toastError, UI_TEXT.courseDetail.toastDeleteSessionError);
        },
    });

    const _handleSelectSessionNode = (sesId: string) => {
        executeWithUnsavedCheck(() => {
            setSelectedSessionId(sesId);
            setSelectedLessonId("");
            setIsAddingSession(false);
            setEditingSession(null);
            setRuleTargetSession(null);
        });
    };

    const _handleEditSessionNode = (ses: Session) => {
        executeWithUnsavedCheck(() => {
            setEditingSession(ses);
            setSelectedSessionId("");
            setSelectedLessonId("");
            setIsAddingSession(false);
            setRuleTargetSession(null);
            const fields: SessionFields = {
                name: ses.name,
                type: ses.type || "",
                typeId: ses.typeId,
                status: ses.status ?? true,
                mindmap: ses.mindmap || "",
                srs: ses.srs || "",
                miniProject: ses.miniProject || "",
                pdf: ses.pdf || "",
                exercise: ses.exercise || "",
                quizzi: ses.quizzi || "",
                practiceEntranceQuiz: ses.practiceEntranceQuiz || "",
                isShowMindmap: ses.isShowMindmap ?? false,
                description: ses.description || "",
                maxAiGradeAttempts: ses.maxAiGradeAttempts ?? defaultMaxAiGradeAttempts,
            };
            setEditSessionFields(fields);
            setSavedSessionFields(fields);
        });
    };

    const _handleSelectLessonNode = (lessonId: string) => {
        executeWithUnsavedCheck(() => {
            setSelectedLessonId(lessonId);
            setSelectedSessionId("");
            setIsAddingSession(false);
            setEditingSession(null);
            setRuleTargetSession(null);
        });
    };

    const handleStartAddSession = () => {
        executeWithUnsavedCheck(() => {
            setIsAddingSession(true);
            setEditingSession(null);
            setSelectedSessionId("");
            setSelectedLessonId("");
            setRuleTargetSession(null);
            setNewSessionFields(initialSessionFields);
            setSavedSessionFields(initialSessionFields);
        });
    };

    const handleSubmitCreateSession = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSessionFields.name.trim()) {
            const maxPos = sessions.reduce((max, s) => Math.max(max, s.position ?? 0), 0);
            const { type, typeId, ...rest } = newSessionFields;
            const newPos = sessions.length > 0 ? maxPos + 1 : 0;
            const payload = {
                ...rest,
                name: newSessionFields.name.trim(),
                ...(typeId ? { typeId } : { type }),
                courseId,
                position: newPos,
            };
            addSessionMutation.mutate(payload as Omit<Session, "id" | "createdAt" | "position"> & { position?: number }, {
                onSuccess: (newSession) => {
                    setIsAddingSession(false);
                    setNewSessionFields(initialSessionFields);
                    setSavedSessionFields(initialSessionFields);
                    if (newSession?.id) {
                        setSelectedSessionId(newSession.id);
                    }
                },
            });
        }
    };

    const handleSubmitEditSession = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingSession && editSessionFields.name.trim()) {
            const { id } = editingSession;
            const { type, typeId, ...rest } = editSessionFields;
            const updated = {
                ...rest,
                name: editSessionFields.name.trim(),
                ...(typeId ? { typeId } : { type }),
            };
            updateSessionMutation.mutate(
                {
                    sessionId: id,
                    body: updated,
                },
                {
                    onSuccess: () => {
                        setSavedSessionFields({ ...editSessionFields, ...updated });
                        setEditingSession((prev) => (prev ? { ...prev, ...updated } : null));
                    },
                },
            );
        }
    };

    const sortedSessions = [...sessions].sort((a, b) => {
        const posA = a.position ?? 0;
        const posB = b.position ?? 0;
        if (posA !== posB) return posA - posB;
        const rawA = a.createdAt;
        const rawB = b.createdAt;
        const dateA = rawA ? new Date(rawA).getTime() : 0;
        const dateB = rawB ? new Date(rawB).getTime() : 0;
        return dateA - dateB;
    });

    const handleSwapSessions = (draggedIdx: number, targetIdx: number) => {
        const draggedSession = sortedSessions[draggedIdx];
        const targetSession = sortedSessions[targetIdx];

        let posA = draggedSession.position;
        let posB = targetSession.position;
        if (posA === posB) {
            posA = draggedIdx;
            posB = targetIdx;
        }

        reorderSessionsMutation.mutate({
            sessionAId: draggedSession.id,
            positionA: posA,
            sessionBId: targetSession.id,
            positionB: posB,
        });
    };

    const courseDisplayName = courseDetail?.title || UI_TEXT.courseDetail.fallbackTitle;
    const isInitialDataLoading = isLoadingCourseDetail || loadingSessions || isLoadingQuizzes;

    if (isInitialDataLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-cream">
                <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
            </div>
        );
    }

    return (
        <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-50">
            {/* Top Workspace Header Bar */}
            <div className="flex h-16 shrink-0 items-center justify-between bg-white px-8">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => {
                            executeWithUnsavedCheck(() => {
                                if (
                                    typeof window !== "undefined" &&
                                    window.history.length > 1 &&
                                    document.referrer &&
                                    document.referrer.includes(window.location.host)
                                ) {
                                    router.back();
                                } else if (id) {
                                    router.push(`/type/${id}` as Route);
                                } else {
                                    router.push("/courses" as Route);
                                }
                            });
                        }}
                        className="flex size-9 cursor-pointer items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                        title={UI_TEXT.courseDetail.btnBackToCourses}
                    >
                        <ArrowLeft className="size-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg font-black tracking-tight text-slate-800">{courseDisplayName}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {sortedSessions.length > 0 && (
                        <button
                            type="button"
                            onClick={() => {
                                setIsSessionSelectModalOpen(true);
                            }}
                            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-brand-300 px-4 py-2 text-xs font-bold text-brand-800 shadow-xs transition hover:bg-brand-50"
                        >
                            <ShieldAlert className="size-4 text-brand-600" />
                            <span>{UI_TEXT.typeDetailCourse.completionConditions}</span>
                        </button>
                    )}
                    <Button
                        onClick={async () => {
                            if (isAddingSession || editingSession) {
                                if (sessionSaveRef.current) {
                                    sessionSaveRef.current();
                                }
                            } else if (lessonSaveRef.current) {
                                await lessonSaveRef.current();
                            } else {
                                toast.info(UI_TEXT.staff.classLearning.toastInfoTitle, UI_TEXT.courseDetail.toastChooseSessionOrLessonToSave);
                            }
                        }}
                        isLoading={isSavingLesson || addSessionMutation.isPending || updateSessionMutation.isPending}
                        iconLeading={Save}
                        className="hover:bg-wine-hover flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border-none bg-wine px-6 py-2.5 text-xs font-black whitespace-nowrap text-white shadow-sm transition-all duration-150 active:scale-[0.98]"
                    >
                        {UI_TEXT.courseDetail.btnSaveChange}
                    </Button>
                </div>
            </div>

            {/* Main Content Workspace (Flex layout: Left Panel flush with top header, Right Panel padded) */}
            <div className="flex min-h-0 flex-1 overflow-hidden">
                {/* Left Panel: Cấu trúc khóa học */}
                <div className="flex h-full w-[340px] shrink-0 flex-col overflow-hidden bg-white p-4 min-[1440px]:w-[380px]">
                    {/* Scrollable list of sessions */}
                    <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
                        {sessions.length === 0 ? (
                            <div className="flex flex-1 items-center justify-center py-6">
                                <div className="w-full rounded-xl border border-red-100 bg-red-50/40 p-4 text-center">
                                    <p className="text-red-custom text-xs font-extrabold">{UI_TEXT.courseDetail.noSessions}</p>
                                </div>
                            </div>
                        ) : (
                            sortedSessions.map((ses, idx) => (
                                <div
                                    key={ses.id}
                                    draggable
                                    onDragStart={() => setDraggedIndex(idx)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => {
                                        if (draggedIndex !== null && draggedIndex !== idx) {
                                            handleSwapSessions(draggedIndex, idx);
                                        }
                                        setDraggedIndex(null);
                                    }}
                                    onDragEnd={() => setDraggedIndex(null)}
                                    className={`rounded-xl transition-all duration-150 ${
                                        draggedIndex === idx ? "scale-[0.98] border-2 border-dashed border-blue-300 opacity-30" : ""
                                    }`}
                                >
                                    <SessionNode
                                        session={ses}
                                        index={idx}
                                        courseId={courseId}
                                        selectedLessonId={selectedLessonId}
                                        selectedSessionId={selectedSessionId}
                                        selectedSessionTab={selectedSessionTab}
                                        selectedTab={selectedTab}
                                        onSelectLesson={(lessonId, tab) => {
                                            executeWithUnsavedCheck(() => {
                                                setSelectedLessonId(lessonId);
                                                setSelectedTab(tab);
                                                setSelectedSessionId(""); // Deselect session
                                                setIsAddingSession(false);
                                                setEditingSession(null);
                                            });
                                        }}
                                        onSelectSession={(
                                            sessionId: string,
                                            tab?: "mindmap" | "pdf" | "srs" | "miniProject" | "exercise" | "practiceEntranceQuiz" | "practice" | "homework",
                                            practiceId?: string,
                                        ) => {
                                            executeWithUnsavedCheck(() => {
                                                setSelectedSessionId(sessionId);
                                                if (tab) {
                                                    setSelectedSessionTab(tab);
                                                }
                                                if (practiceId !== undefined) {
                                                    setSelectedPracticeId(practiceId);
                                                }
                                                setSelectedLessonId("");
                                                setIsAddingSession(false);
                                                setEditingSession(null);
                                            });
                                        }}
                                        selectedPracticeId={selectedPracticeId}
                                        onEditSession={(session: Session) => {
                                            executeWithUnsavedCheck(() => {
                                                const fields: SessionFields = {
                                                    name: session.name || "",
                                                    type: session.type || "LY_THUYET",
                                                    typeId: session.typeId,
                                                    status: session.status ?? true,
                                                    mindmap: session.mindmap || "",
                                                    srs: session.srs || "",
                                                    miniProject: session.miniProject || "",
                                                    pdf: session.pdf || "",
                                                    exercise: session.exercise || "",
                                                    quizzi: session.quizzi || "",
                                                    practiceEntranceQuiz: session.practiceEntranceQuiz || "",
                                                    isShowMindmap: !!session.isShowMindmap,
                                                    description: session.description || "",
                                                    maxAiGradeAttempts: session.maxAiGradeAttempts ?? defaultMaxAiGradeAttempts,
                                                };
                                                setEditingSession(session);
                                                setEditSessionFields(fields);
                                                setSavedSessionFields(fields);
                                                setIsAddingSession(false);
                                                setSelectedSessionId(session.id);
                                                setSelectedLessonId("");
                                            });
                                        }}
                                        onDeleteSession={(sessionId: string, name?: string) => {
                                            setDeletingSession({ id: sessionId, name: name || "" });
                                            setIsDeleteSessionOpen(true);
                                        }}
                                        onOpenLessonCompletionRule={(lesson: Lesson) => {
                                            setRuleTargetLesson({ id: lesson.id, name: lesson.name });
                                        }}
                                    />
                                </div>
                            ))
                        )}
                    </div>

                    {/* Bottom Add Session Button (Full-width button matching Lưu thay đổi color) */}
                    <div className="mt-2 shrink-0 border-t border-slate-100 pt-3">
                        <button
                            onClick={handleStartAddSession}
                            className="hover:bg-wine-hover flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-wine px-4 py-3 text-xs font-black text-white shadow-xs transition duration-150 active:scale-[0.98]"
                        >
                            <Plus className="size-4" />
                            <span>{UI_TEXT.courseDetail.btnAddSession}</span>
                        </button>
                    </div>
                </div>

                {/* Right Panel: Cấu hình bài học / Thêm & Sửa chương */}
                <div className="h-full flex-1 overflow-hidden bg-slate-50 p-5">
                    {isAddingSession ? (
                        <SessionForm
                            mode="create"
                            fields={newSessionFields}
                            setFields={setNewSessionFields}
                            onSubmit={handleSubmitCreateSession}
                            isPending={addSessionMutation.isPending}
                            isDirty={isSessionDirty}
                            onOpenManageTypes={() => setIsSessionTypeModalOpen(true)}
                            typesReloadToken={sessionTypesReloadToken}
                            onRegisterSave={(fn) => {
                                sessionSaveRef.current = fn;
                            }}
                        />
                    ) : editingSession ? (
                        <SessionForm
                            mode="edit"
                            fields={editSessionFields}
                            setFields={setEditSessionFields}
                            onSubmit={handleSubmitEditSession}
                            isDirty={isSessionDirty}
                            onOpenManageTypes={() => setIsSessionTypeModalOpen(true)}
                            typesReloadToken={sessionTypesReloadToken}
                            onOpenCompletionRule={() => {
                                setRuleTargetSession(null);
                                setIsCompletionRuleModalOpen(true);
                            }}
                            onDelete={() => {
                                if (editingSession) {
                                    setDeletingSession({ id: editingSession.id, name: editingSession.name });
                                    setIsDeleteSessionOpen(true);
                                }
                            }}
                            isPending={updateSessionMutation.isPending}
                            onRegisterSave={(fn) => {
                                sessionSaveRef.current = fn;
                            }}
                        />
                    ) : (
                        <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white p-5 shadow-xs">
                            {sessions.length === 0 ? (
                                <div className="flex flex-1 flex-col items-center justify-center p-12 py-20 text-center">
                                    <div className="flex size-14 items-center justify-center rounded-full border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400">
                                        <Play className="ml-0.5 size-5.5 text-slate-300" />
                                    </div>
                                    <p className="mt-4 max-w-[340px] text-[12.5px] leading-relaxed font-bold text-slate-400">
                                        {UI_TEXT.courseDetail.emptyCourseStructureDesc}
                                    </p>
                                </div>
                            ) : selectedSessionId ? (
                                <SessionViewerWrapper
                                    session={sessions.find((s) => s.id === selectedSessionId)}
                                    activeTab={selectedSessionTab}
                                    selectedPracticeId={selectedPracticeId}
                                    onChangeTab={setSelectedSessionTab}
                                />
                            ) : !selectedLessonId ? (
                                <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
                                    <FileText className="mb-2 size-10 text-slate-300" />
                                    <p className="text-xs font-bold text-slate-900">{UI_TEXT.courseDetail.chooseLessonToConfigDesc}</p>
                                </div>
                            ) : (
                                <LessonEditorWrapper
                                    key={`${selectedLessonId}-${lessonResetKey}`}
                                    lessonId={selectedLessonId}
                                    quizzes={quizzes}
                                    activeTab={selectedTab}
                                    onRegisterSave={(fn) => {
                                        lessonSaveRef.current = fn;
                                    }}
                                    onIsSavingChange={setIsSavingLesson}
                                    onIsDirtyChange={setIsLessonDirty}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Session Type Modal */}
            <SessionTypeModal
                isOpen={isSessionTypeModalOpen}
                onClose={() => setIsSessionTypeModalOpen(false)}
                onChanged={() => setSessionTypesReloadToken((n) => n + 1)}
            />

            {/* Session Select Table Modal */}
            <SessionSelectModal
                isOpen={isSessionSelectModalOpen}
                onOpenChange={setIsSessionSelectModalOpen}
                sessions={sortedSessions.map((s) => ({ id: s.id, name: s.name, type: s.type }))}
                onSelectSession={(session) => {
                    setRuleTargetSession(session);
                    setIsCompletionRuleModalOpen(true);
                }}
            />

            {/* Session Completion Rule Modal */}
            <SessionCompletionRuleModal
                isOpen={isCompletionRuleModalOpen}
                onOpenChange={(open) => {
                    setIsCompletionRuleModalOpen(open);
                    if (!open) {
                        setRuleTargetSession(null);
                    }
                }}
                sessionId={ruleTargetSession?.id || selectedSessionId || editingSession?.id || sortedSessions[0]?.id}
                sessionName={
                    ruleTargetSession?.name ||
                    sessions.find((s) => s.id === (ruleTargetSession?.id || selectedSessionId || editingSession?.id))?.name ||
                    sortedSessions[0]?.name
                }
                sessions={sortedSessions.map((s) => ({ id: s.id, name: s.name }))}
                onBackToSessionSelect={() => {
                    setIsCompletionRuleModalOpen(false);
                    setIsSessionSelectModalOpen(true);
                }}
                onSelectLessonForRule={(lesson) => {
                    setIsCompletionRuleModalOpen(false);
                    setRuleTargetLesson(lesson);
                }}
            />

            {/* Lesson Completion Rule Modal */}
            <LessonCompletionRuleModal
                isOpen={!!ruleTargetLesson}
                onOpenChange={(open) => {
                    if (!open) {
                        setRuleTargetLesson(null);
                    }
                }}
                lessonId={ruleTargetLesson?.id || ""}
                lessonName={ruleTargetLesson?.name || ""}
            />

            {/* Confirmation Modal for Session Deletion */}
            <ConfirmModal
                isOpen={isDeleteSessionOpen}
                onClose={() => setIsDeleteSessionOpen(false)}
                onConfirm={() => {
                    if (deletingSession) {
                        deleteSessionMutation.mutate(deletingSession.id);
                        setIsDeleteSessionOpen(false);
                    }
                }}
                title={UI_TEXT.courseDetail.deleteSessionTitle}
                message={
                    UI_TEXT.courseDetail.deleteSessionConfirmPrefix +
                    ' "' +
                    (deletingSession?.name || "") +
                    '"' +
                    UI_TEXT.courseDetail.deleteSessionConfirmSuffix
                }
                confirmText={UI_TEXT.learningMaterials.confirmDeleteButton}
                cancelText={UI_TEXT.courseDetail.cancelButton}
                variant="danger"
            />

            {/* Confirmation Modal for Course Deletion */}
            <ConfirmModal
                isOpen={isDeleteCourseOpen}
                onClose={() => setIsDeleteCourseOpen(false)}
                onConfirm={() => {
                    toast.info(UI_TEXT.staff.classLearning.toastInfoTitle, UI_TEXT.courseDetail.toastDeleteCourseInfo);
                    setIsDeleteCourseOpen(false);
                }}
                title={UI_TEXT.courseDetail.deleteCourseTitle}
                message={
                    UI_TEXT.courseDetail.deleteCourseConfirmPrefix + ' "' + (courseDisplayName || "") + '"' + UI_TEXT.courseDetail.deleteCourseConfirmSuffix
                }
                confirmText={UI_TEXT.courseDetail.deleteCourseTitle}
                cancelText={UI_TEXT.common.cancel}
                variant="danger"
            />

            {/* Confirmation Modal for Unsaved Changes Exit */}
            <ConfirmModal
                isOpen={isConfirmUnsavedOpen}
                onClose={() => {
                    setIsConfirmUnsavedOpen(false);
                    setPendingAction(null);
                }}
                onConfirm={() => {
                    queryClient.removeQueries({ queryKey: ["lesson-details-editor"] });
                    setLessonResetKey((prev) => prev + 1);
                    if (editingSession && savedSessionFields) {
                        setEditSessionFields(savedSessionFields);
                    }
                    if (isAddingSession) {
                        setNewSessionFields(initialSessionFields);
                    }
                    setIsLessonDirty(false);
                    if (pendingAction) {
                        const actionToRun = pendingAction;
                        setPendingAction(null);
                        setIsConfirmUnsavedOpen(false);
                        actionToRun();
                    } else {
                        setIsConfirmUnsavedOpen(false);
                    }
                }}
                title={UI_TEXT.courseDetail.confirmExitUnsavedTitle}
                message={UI_TEXT.courseDetail.confirmExitUnsavedMessage}
                confirmText={UI_TEXT.courseDetail.confirmExitButton}
                cancelText={UI_TEXT.common.cancel}
                variant="danger"
            />
        </div>
    );
}
