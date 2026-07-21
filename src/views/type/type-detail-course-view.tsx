"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, ChevronDown, File, FileText, HelpCircle, Play, Plus, ScrollText, Video, Trash2, GripVertical, Search, CheckCircle2, Circle, Repeat, Link as LinkIcon, Map, ExternalLink, BookText, X, ArrowLeft, Pencil } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Button } from "@/components/base/buttons/button";
import { createLesson, createSession, getCoursesBySystem, getLessonsBySession, getSessionsByCourse, configureLessonVideo, configureLessonReading, linkLessonQuiz, getQuizzesList, getLessonDetails, deleteLesson, deleteSession, updateSession, updateLesson } from "@/services/material.service";
import { getSystemsList } from "@/services/system.service";
import { toast } from "@/services/toast.service";
import type { Lesson, Session } from "@/types/material.types";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { TiptapEditor } from "@/components/base/editor";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { ConfirmModal } from "@/components/application/modals/confirm-modal";

interface TypeDetailCourseViewProps {
    id: string;
    courseId: string;
}

export function TypeDetailCourseView({ id, courseId }: TypeDetailCourseViewProps) {
    const queryClient = useQueryClient();

    const [selectedLessonId, setSelectedLessonId] = useState("");
    const [selectedTab, setSelectedTab] = useState<"video" | "reading" | "quiz">("video");
    const [selectedSessionId, setSelectedSessionId] = useState("");
    const [selectedSessionTab, setSelectedSessionTab] = useState<"mindmap" | "pdf" | "srs">("mindmap");
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
    const [addSessionTab, setAddSessionTab] = useState<"general" | "resources" | "practice">("general");
    const [editSessionTab, setEditSessionTab] = useState<"general" | "resources" | "practice">("general");

    const initialSessionFields = {
        name: "",
        type: "LY_THUYET",
        status: false,
        mindmap: "",
        srs: "",
        miniProject: "",
        pdf: "",
        exercise: "",
        quizzi: "",
        practiceEntranceQuiz: "",
        isShowMindmap: false,
        description: "",
        practice: {
            content: "",
            resources: [] as { label: string; url: string }[],
            submissionType: "LINK" as "LINK" | "FILE" | "TEXT",
        }
    };

    const [newSessionFields, setNewSessionFields] = useState(initialSessionFields);

    const [isEditSessionOpen, setIsEditSessionOpen] = useState(false);
    const [editingSession, setEditingSession] = useState<Session | null>(null);
    const [isDeleteSessionOpen, setIsDeleteSessionOpen] = useState(false);
    const [deletingSession, setDeletingSession] = useState<{ id: string; name: string } | null>(null);

    // Queries
    const { data: systemDetail } = useQuery({
        queryKey: ["system-detail", id],
        queryFn: async () => {
            const systems = await getSystemsList();
            return systems.find((s) => s.id === id) || null;
        },
    });

    const { data: courses = [] } = useQuery({
        queryKey: ["courses", id],
        queryFn: () => getCoursesBySystem(id),
        enabled: !!id,
    });

    const { data: sessions = [], isLoading: loadingSessions } = useQuery({
        queryKey: ["sessions", courseId],
        queryFn: () => getSessionsByCourse(courseId),
        enabled: !!courseId,
    });

    const { data: quizzes = [] } = useQuery({
        queryKey: ["quizzes-list"],
        queryFn: getQuizzesList,
    });

    const course = courses.find((c) => c.id === courseId);
    const systemName = systemDetail?.name || "";
    const courseName = course?.name || "";

    const addSessionMutation = useMutation({
        mutationFn: (body: Omit<Session, "id" | "createdAt" | "position">) => createSession(body),
        onSuccess: () => {
            toast.success("Thành công", "Đã thêm chương học mới");
            queryClient.invalidateQueries({ queryKey: ["sessions", courseId] });
        },
    });

    const reorderSessionsMutation = useMutation({
        mutationFn: async ({ sessionAId, positionA, sessionBId, positionB }: { sessionAId: string; positionA: number; sessionBId: string; positionB: number }) => {
            await Promise.all([
                updateSession(sessionAId, { position: positionB }),
                updateSession(sessionBId, { position: positionA }),
            ]);
        },
        onSuccess: () => {
            toast.success("Thành công", "Đã thay đổi vị trí chương học");
            queryClient.invalidateQueries({ queryKey: ["sessions", courseId] });
        },
        onError: () => {
            toast.error("Lỗi", "Không thể thay đổi vị trí chương học");
        },
    });

    const updateSessionMutation = useMutation({
        mutationFn: ({ sessionId, body }: { sessionId: string; body: Partial<Session> }) => updateSession(sessionId, body),
        onSuccess: () => {
            toast.success("Thành công", "Đã cập nhật chương học");
            queryClient.invalidateQueries({ queryKey: ["sessions", courseId] });
        },
        onError: () => {
            toast.error("Lỗi", "Không thể cập nhật chương học");
        },
    });

    const deleteSessionMutation = useMutation({
        mutationFn: (sessionId: string) => deleteSession(sessionId),
        onSuccess: () => {
            toast.success("Thành công", "Đã xóa chương học");
            queryClient.invalidateQueries({ queryKey: ["sessions", courseId] });
            setSelectedSessionId("");
        },
        onError: () => {
            toast.error("Lỗi", "Không thể xóa chương học");
        },
    });

    const handleAddSession = () => {
        setNewSessionFields(initialSessionFields);
        setAddSessionTab("general");
        setIsAddSessionOpen(true);
    };

    const handleSubmitAddSession = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSessionFields.name.trim()) {
            addSessionMutation.mutate({
                ...newSessionFields,
                name: newSessionFields.name.trim(),
                courseId,
                practice: newSessionFields.practice.content.trim() ? newSessionFields.practice : null
            }, {
                onSuccess: () => {
                    setIsAddSessionOpen(false);
                    setNewSessionFields(initialSessionFields);
                    setAddSessionTab("general");
                }
            });
        }
    };

    const handleSubmitEditSession = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingSession && editingSession.name.trim()) {
            const { id, createdAt, position, courseId, ...body } = editingSession;
            updateSessionMutation.mutate({
                sessionId: id,
                body: {
                    ...body,
                    name: body.name.trim(),
                    practice: body.practice?.content.trim() ? body.practice : null
                }
            }, {
                onSuccess: () => {
                    setIsEditSessionOpen(false);
                    setEditingSession(null);
                    setEditSessionTab("general");
                }
            });
        }
    };

    const sortedSessions = [...sessions].sort((a, b) => a.position - b.position);

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

    return (
        <div className="flex flex-col gap-5">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <Link href={"/type" as Route} className="transition hover:text-slate-600">
                    Quản lý đào tạo
                </Link>
                <ChevronRight className="size-3.5 text-slate-300" />
                <Link href={`/type/${id}` as Route} className="transition hover:text-slate-600">
                    Danh sách khóa học
                </Link>
                <ChevronRight className="size-3.5 text-slate-300" />
                <span className="font-bold text-slate-800">Chi tiết khóa học</span>
            </nav>

            {/* Main content grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 h-[calc(100vh-160px)]">
                {/* Left panel: Cấu trúc khóa học */}
                <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs lg:col-span-4 min-[1440px]:col-span-3 h-full min-h-[400px] overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                            <span className="flex size-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                                <ScrollText className="size-4" />
                            </span>
                            <h3 className="text-sm font-black text-slate-800">Cấu trúc khóa học</h3>
                        </div>
                        <button
                            onClick={handleAddSession}
                            title="Thêm chương"
                            className="flex size-7 cursor-pointer items-center justify-center rounded-lg border border-dashed border-blue-200 bg-blue-50/10 text-blue-600 hover:bg-blue-50/30 transition duration-150 shrink-0"
                        >
                            <Plus className="size-4" />
                        </button>
                    </div>

                    {loadingSessions ? (
                        <div className="flex flex-1 items-center justify-center py-12">
                            <div className="size-6 animate-spin rounded-full border-2 border-slate-200 border-t-wine" />
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="flex flex-1 items-center justify-center py-6">
                            <div className="w-full rounded-xl border border-red-100 bg-red-50/40 p-4 text-center">
                                <p className="text-xs font-extrabold text-red-custom">Chưa có chương học nào.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 overflow-y-auto pr-1 flex-1 custom-scrollbar">
                            {sortedSessions.map((ses, idx) => (
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
                                    className={`transition-all duration-150 rounded-xl ${draggedIndex === idx ? "opacity-30 scale-[0.98] border-2 border-dashed border-blue-300" : ""
                                        }`}
                                >
                                    <SessionNode
                                        session={ses}
                                        index={idx}
                                        selectedLessonId={selectedLessonId}
                                        selectedSessionId={selectedSessionId}
                                        selectedSessionTab={selectedSessionTab}
                                        selectedTab={selectedTab}
                                        onSelectLesson={(lessonId, tab) => {
                                            setSelectedLessonId(lessonId);
                                            setSelectedTab(tab);
                                            setSelectedSessionId(""); // Deselect session
                                        }}
                                        onSelectSession={(sessionId, tab) => {
                                            setSelectedSessionId(sessionId);
                                            setSelectedSessionTab(tab);
                                            setSelectedLessonId(""); // Deselect lesson
                                        }}
                                        onEditSession={(session) => {
                                            setEditingSession(session);
                                            setEditSessionTab("general");
                                            setIsEditSessionOpen(true);
                                        }}
                                        onDeleteSession={(sessionId, name) => {
                                            setDeletingSession({ id: sessionId, name });
                                            setIsDeleteSessionOpen(true);
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right panel: Cấu hình bài học */}
                <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs lg:col-span-8 min-[1440px]:col-span-9 h-full overflow-hidden">
                    {sessions.length === 0 ? (
                        <div className="flex flex-1 flex-col items-center justify-center p-12 py-20 text-center">
                            <div className="flex size-14 items-center justify-center rounded-full border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400">
                                <Play className="size-5.5 text-slate-300 ml-0.5" />
                            </div>
                            <p className="mt-4 text-[12.5px] font-bold text-slate-400 max-w-[340px] leading-relaxed">
                                Cấu trúc khóa học rỗng. Vui lòng bấm &ldquo;Thêm chương&rdquo; để bắt đầu.
                            </p>
                        </div>
                    ) : selectedSessionId ? (
                        <SessionViewerWrapper
                            session={sessions.find((s) => s.id === selectedSessionId)}
                            activeTab={selectedSessionTab}
                            onChangeTab={setSelectedSessionTab}
                        />
                    ) : !selectedLessonId ? (
                        <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
                            <FileText className="size-10 text-slate-300 mb-2" />
                            <p className="text-xs font-bold text-slate-900">Vui lòng chọn bài học ở danh sách bên trái để cấu hình học liệu.</p>
                        </div>
                    ) : (
                        <LessonEditorWrapper lessonId={selectedLessonId} quizzes={quizzes} activeTab={selectedTab} />
                    )}
                </div>
            </div>

            {/* Custom Modal for Adding Session */}
            <CustomModal.Root open={isAddSessionOpen} onOpenChange={setIsAddSessionOpen}>
                <CustomModal.Content className="max-w-xl !rounded-[20px] w-full">
                    <Dialog className="bg-white p-5 rounded-[20px] flex flex-col gap-4 outline-none shadow-2xl relative">
                        <button
                            type="button"
                            onClick={() => setIsAddSessionOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition cursor-pointer p-1 rounded-lg hover:bg-slate-50"
                        >
                            <X className="size-4" />
                        </button>
                        <form onSubmit={handleSubmitAddSession} className="flex flex-col gap-4">
                            <div>
                                <h3 className="text-sm font-black text-slate-800">{UI_TEXT.courseDetail.addSessionTitle}</h3>
                                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{UI_TEXT.courseDetail.addSessionDescription}</p>
                            </div>

                            {/* Form Tabs Header */}
                            <div className="flex gap-1.5 border-b border-slate-100 pb-2">
                                <button
                                    type="button"
                                    onClick={() => setAddSessionTab("general")}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                                        addSessionTab === "general"
                                            ? "bg-wine/5 text-wine"
                                            : "text-slate-500 hover:bg-slate-50"
                                    }`}
                                >
                                    {UI_TEXT.courseDetail.sessionTabGeneral}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAddSessionTab("resources")}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                                        addSessionTab === "resources"
                                            ? "bg-wine/5 text-wine"
                                            : "text-slate-500 hover:bg-slate-50"
                                    }`}
                                >
                                    {UI_TEXT.courseDetail.sessionTabResources}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAddSessionTab("practice")}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                                        addSessionTab === "practice"
                                            ? "bg-wine/5 text-wine"
                                            : "text-slate-500 hover:bg-slate-50"
                                    }`}
                                >
                                    {UI_TEXT.courseDetail.sessionTabPractice}
                                </button>
                            </div>

                            {/* Tab 1: General Info */}
                            {addSessionTab === "general" && (
                                <div className="flex flex-col gap-4 py-2">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">{UI_TEXT.courseDetail.sessionNameLabel}</label>
                                        <input
                                            type="text"
                                            value={newSessionFields.name}
                                            onChange={(e) => setNewSessionFields(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder={UI_TEXT.courseDetail.sessionNamePlaceholder}
                                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:border-wine bg-white font-semibold"
                                            autoFocus
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">{UI_TEXT.courseDetail.sessionTypeLabel}</label>
                                            <select
                                                value={newSessionFields.type}
                                                onChange={(e) => setNewSessionFields(prev => ({ ...prev, type: e.target.value }))}
                                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:border-wine bg-white font-semibold"
                                            >
                                                <option value="LY_THUYET">{UI_TEXT.courseDetail.sessionTypeTheory}</option>
                                                <option value="THUC_HANH">{UI_TEXT.courseDetail.sessionTypePractice}</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center justify-between border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase">{UI_TEXT.courseDetail.sessionStatusLabel}</span>
                                                <span className="text-[9px] text-slate-400 font-semibold mt-0.5">{UI_TEXT.courseDetail.sessionStatusDesc}</span>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={newSessionFields.status}
                                                onChange={(e) => setNewSessionFields(prev => ({ ...prev, status: e.target.checked }))}
                                                className="size-4 rounded border-slate-300 text-wine focus:ring-wine cursor-pointer accent-wine"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">{UI_TEXT.courseDetail.sessionDescLabel}</label>
                                        <textarea
                                            value={newSessionFields.description}
                                            onChange={(e) => setNewSessionFields(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder={UI_TEXT.courseDetail.sessionDescPlaceholder}
                                            rows={3}
                                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:border-wine bg-white font-semibold resize-none"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Tab 2: Resources */}
                            {addSessionTab === "resources" && (
                                <div className="flex flex-col gap-3.5 py-2 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">{UI_TEXT.courseDetail.sessionMindmapLabel}</label>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[9px] text-slate-400 font-bold uppercase">{UI_TEXT.courseDetail.sessionShowMindmapLabel}</span>
                                                <input
                                                    type="checkbox"
                                                    checked={newSessionFields.isShowMindmap}
                                                    onChange={(e) => setNewSessionFields(prev => ({ ...prev, isShowMindmap: e.target.checked }))}
                                                    className="size-3.5 rounded border-slate-300 text-wine cursor-pointer accent-wine"
                                                />
                                            </div>
                                        </div>
                                        <input
                                            type="text"
                                            value={newSessionFields.mindmap}
                                            onChange={(e) => setNewSessionFields(prev => ({ ...prev, mindmap: e.target.value }))}
                                            placeholder="https://example.com/mindmap.jpg"
                                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:border-wine bg-white font-semibold"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">{UI_TEXT.courseDetail.sessionSrsLabel}</label>
                                            <input
                                                type="text"
                                                value={newSessionFields.srs}
                                                onChange={(e) => setNewSessionFields(prev => ({ ...prev, srs: e.target.value }))}
                                                placeholder="https://example.com/srs.pdf"
                                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:border-wine bg-white font-semibold"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">{UI_TEXT.courseDetail.sessionPdfLabel}</label>
                                            <input
                                                type="text"
                                                value={newSessionFields.pdf}
                                                onChange={(e) => setNewSessionFields(prev => ({ ...prev, pdf: e.target.value }))}
                                                placeholder="https://example.com/lecture.pdf"
                                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:border-wine bg-white font-semibold"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">{UI_TEXT.courseDetail.sessionMiniProjectLabel}</label>
                                            <input
                                                type="text"
                                                value={newSessionFields.miniProject}
                                                onChange={(e) => setNewSessionFields(prev => ({ ...prev, miniProject: e.target.value }))}
                                                placeholder="https://example.com/miniproject.zip"
                                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:border-wine bg-white font-semibold"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">{UI_TEXT.courseDetail.sessionExerciseLabel}</label>
                                            <input
                                                type="text"
                                                value={newSessionFields.exercise}
                                                onChange={(e) => setNewSessionFields(prev => ({ ...prev, exercise: e.target.value }))}
                                                placeholder="Bài tập..."
                                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:border-wine bg-white font-semibold"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">{UI_TEXT.courseDetail.sessionQuizziLabel}</label>
                                            <input
                                                type="text"
                                                value={newSessionFields.quizzi}
                                                onChange={(e) => setNewSessionFields(prev => ({ ...prev, quizzi: e.target.value }))}
                                                placeholder="Quizzi..."
                                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:border-wine bg-white font-semibold"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">{UI_TEXT.courseDetail.sessionEntranceQuizLabel}</label>
                                            <input
                                                type="text"
                                                value={newSessionFields.practiceEntranceQuiz}
                                                onChange={(e) => setNewSessionFields(prev => ({ ...prev, practiceEntranceQuiz: e.target.value }))}
                                                placeholder="Entrance Quiz..."
                                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:border-wine bg-white font-semibold"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab 3: Practice */}
                            {addSessionTab === "practice" && (
                                <div className="flex flex-col gap-4 py-2 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">{UI_TEXT.courseDetail.sessionPracticeTypeLabel}</label>
                                            <select
                                                value={newSessionFields.practice.submissionType}
                                                onChange={(e) => setNewSessionFields(prev => ({
                                                    ...prev,
                                                    practice: {
                                                        ...prev.practice,
                                                        submissionType: e.target.value as "LINK" | "FILE" | "TEXT"
                                                    }
                                                }))}
                                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:border-wine bg-white font-semibold"
                                            >
                                                <option value="LINK">{UI_TEXT.courseDetail.sessionPracticeSubmissionTypeLink}</option>
                                                <option value="FILE">{UI_TEXT.courseDetail.sessionPracticeSubmissionTypeFile}</option>
                                                <option value="TEXT">{UI_TEXT.courseDetail.sessionPracticeSubmissionTypeText}</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">{UI_TEXT.courseDetail.sessionPracticeContentLabel}</label>
                                        <textarea
                                            value={newSessionFields.practice.content}
                                            onChange={(e) => setNewSessionFields(prev => ({
                                                ...prev,
                                                practice: {
                                                    ...prev.practice,
                                                    content: e.target.value
                                                }
                                            }))}
                                            placeholder={UI_TEXT.courseDetail.sessionPracticeContentPlaceholder}
                                            rows={3}
                                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:border-wine bg-white font-semibold resize-none"
                                        />
                                    </div>

                                    {/* Resources references */}
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">{UI_TEXT.courseDetail.sessionPracticeResourcesLabel}</label>
                                            <button
                                                type="button"
                                                onClick={() => setNewSessionFields(prev => ({
                                                    ...prev,
                                                    practice: {
                                                        ...prev.practice,
                                                        resources: [...prev.practice.resources, { label: "", url: "" }]
                                                    }
                                                }))}
                                                className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-700 font-bold transition cursor-pointer"
                                            >
                                                <Plus className="size-3" />
                                                {UI_TEXT.courseDetail.sessionPracticeAddResourceBtn}
                                            </button>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            {newSessionFields.practice.resources.map((resource, resIdx) => (
                                                <div key={resIdx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                                                    <input
                                                        type="text"
                                                        value={resource.label}
                                                        onChange={(e) => {
                                                            const newResources = [...newSessionFields.practice.resources];
                                                            newResources[resIdx].label = e.target.value;
                                                            setNewSessionFields(prev => ({
                                                                ...prev,
                                                                practice: { ...prev.practice, resources: newResources }
                                                            }));
                                                        }}
                                                        placeholder={UI_TEXT.courseDetail.sessionPracticeResourceLabelPlaceholder}
                                                        className="w-1/2 rounded-lg border border-slate-200 px-2 py-1 text-[11px] focus:outline-none focus:border-wine bg-white font-semibold"
                                                        required
                                                    />
                                                    <input
                                                        type="text"
                                                        value={resource.url}
                                                        onChange={(e) => {
                                                            const newResources = [...newSessionFields.practice.resources];
                                                            newResources[resIdx].url = e.target.value;
                                                            setNewSessionFields(prev => ({
                                                                ...prev,
                                                                practice: { ...prev.practice, resources: newResources }
                                                            }));
                                                        }}
                                                        placeholder={UI_TEXT.courseDetail.sessionPracticeResourceUrlPlaceholder}
                                                        className="w-1/2 rounded-lg border border-slate-200 px-2 py-1 text-[11px] focus:outline-none focus:border-wine bg-white font-semibold"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newResources = newSessionFields.practice.resources.filter((_, rIdx) => rIdx !== resIdx);
                                                            setNewSessionFields(prev => ({
                                                                ...prev,
                                                                practice: { ...prev.practice, resources: newResources }
                                                            }));
                                                        }}
                                                        className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer shrink-0"
                                                        title="Xóa tài liệu"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                            {newSessionFields.practice.resources.length === 0 && (
                                                <span className="text-[10px] text-slate-400 italic font-semibold">{UI_TEXT.courseDetail.sessionPracticeNoResources}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-2.5 mt-2 w-full">
                                <button
                                    type="button"
                                    onClick={() => setIsAddSessionOpen(false)}
                                    className="w-1/3 bg-slate-50 border border-slate-200 text-slate-600 py-2.5 text-xs font-bold rounded-xl active:scale-[0.98] transition cursor-pointer text-center hover:bg-brand-500 hover:text-white hover:border-brand-500"
                                >
                                    {UI_TEXT.courseDetail.cancelButton}
                                </button>
                                <Button
                                    type="submit"
                                    disabled={addSessionMutation.isPending || !newSessionFields.name.trim()}
                                    className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white border-none py-2.5 text-xs font-black rounded-xl active:scale-[0.98] transition cursor-pointer text-center"
                                >
                                    {addSessionMutation.isPending ? UI_TEXT.courseDetail.addingText : UI_TEXT.courseDetail.confirmButton}
                                </Button>
                            </div>
                        </form>
                    </Dialog>
                </CustomModal.Content>
            </CustomModal.Root>
            {/* Custom Modal for Editing Session */}
            <CustomModal.Root open={isEditSessionOpen} onOpenChange={setIsEditSessionOpen}>
                <CustomModal.Content className="max-w-xl !rounded-[20px] w-full">
                    <Dialog className="bg-white p-5 rounded-[20px] flex flex-col gap-4 outline-none shadow-2xl relative">
                        <button
                            type="button"
                            onClick={() => setIsEditSessionOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition cursor-pointer p-1 rounded-lg hover:bg-slate-50"
                        >
                            <X className="size-4" />
                        </button>
                        <form onSubmit={handleSubmitEditSession} className="flex flex-col gap-4">
                            <div>
                                <h3 className="text-sm font-black text-slate-800">{UI_TEXT.courseDetail.editSessionTitle}</h3>
                                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{UI_TEXT.courseDetail.editSessionDescription}</p>
                            </div>

                            {/* Form Tabs Header */}
                            <div className="flex gap-1.5 border-b border-slate-100 pb-2">
                                <button
                                    type="button"
                                    onClick={() => setEditSessionTab("general")}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                                        editSessionTab === "general"
                                            ? "bg-wine/5 text-wine"
                                            : "text-slate-500 hover:bg-slate-50"
                                    }`}
                                >
                                    {UI_TEXT.courseDetail.sessionTabGeneral}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditSessionTab("resources")}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                                        editSessionTab === "resources"
                                            ? "bg-wine/5 text-wine"
                                            : "text-slate-500 hover:bg-slate-50"
                                    }`}
                                >
                                    {UI_TEXT.courseDetail.sessionTabResources}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditSessionTab("practice")}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                                        editSessionTab === "practice"
                                            ? "bg-wine/5 text-wine"
                                            : "text-slate-500 hover:bg-slate-50"
                                    }`}
                                >
                                    {UI_TEXT.courseDetail.sessionTabPractice}
                                </button>
                            </div>

                            {/* Tab 1: General Info */}
                            {editSessionTab === "general" && editingSession && (
                                <div className="flex flex-col gap-4 py-2">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">{UI_TEXT.courseDetail.sessionNameLabel}</label>
                                        <input
                                            type="text"
                                            value={editingSession.name}
                                            onChange={(e) => setEditingSession(prev => prev ? { ...prev, name: e.target.value } : null)}
                                            placeholder={UI_TEXT.courseDetail.sessionNamePlaceholder}
                                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:border-wine bg-white font-semibold"
                                            autoFocus
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">{UI_TEXT.courseDetail.sessionTypeLabel}</label>
                                            <select
                                                value={editingSession.type || "LY_THUYET"}
                                                onChange={(e) => setEditingSession(prev => prev ? { ...prev, type: e.target.value } : null)}
                                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:border-wine bg-white font-semibold"
                                            >
                                                <option value="LY_THUYET">{UI_TEXT.courseDetail.sessionTypeTheory}</option>
                                                <option value="THUC_HANH">{UI_TEXT.courseDetail.sessionTypePractice}</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center justify-between border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold text-slate-500 uppercase">{UI_TEXT.courseDetail.sessionStatusLabel}</span>
                                                <span className="text-[9px] text-slate-400 font-semibold mt-0.5">{UI_TEXT.courseDetail.sessionStatusDesc}</span>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={!!editingSession.status}
                                                onChange={(e) => setEditingSession(prev => prev ? { ...prev, status: e.target.checked } : null)}
                                                className="size-4 rounded border-slate-300 text-wine focus:ring-wine cursor-pointer accent-wine"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">{UI_TEXT.courseDetail.sessionDescLabel}</label>
                                        <textarea
                                            value={editingSession.description || ""}
                                            onChange={(e) => setEditingSession(prev => prev ? { ...prev, description: e.target.value } : null)}
                                            placeholder={UI_TEXT.courseDetail.sessionDescPlaceholder}
                                            rows={3}
                                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:border-wine bg-white font-semibold resize-none"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Tab 2: Resources */}
                            {editSessionTab === "resources" && editingSession && (
                                <div className="flex flex-col gap-3.5 py-2 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center justify-between">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">{UI_TEXT.courseDetail.sessionMindmapLabel}</label>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[9px] text-slate-400 font-bold uppercase">{UI_TEXT.courseDetail.sessionShowMindmapLabel}</span>
                                                <input
                                                    type="checkbox"
                                                    checked={!!editingSession.isShowMindmap}
                                                    onChange={(e) => setEditingSession(prev => prev ? { ...prev, isShowMindmap: e.target.checked } : null)}
                                                    className="size-3.5 rounded border-slate-300 text-wine cursor-pointer accent-wine"
                                                />
                                            </div>
                                        </div>
                                        <input
                                            type="text"
                                            value={editingSession.mindmap || ""}
                                            onChange={(e) => setEditingSession(prev => prev ? { ...prev, mindmap: e.target.value } : null)}
                                            placeholder="https://example.com/mindmap.jpg"
                                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:border-wine bg-white font-semibold"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">{UI_TEXT.courseDetail.sessionSrsLabel}</label>
                                            <input
                                                type="text"
                                                value={editingSession.srs || ""}
                                                onChange={(e) => setEditingSession(prev => prev ? { ...prev, srs: e.target.value } : null)}
                                                placeholder="https://example.com/srs.pdf"
                                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:border-wine bg-white font-semibold"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">{UI_TEXT.courseDetail.sessionPdfLabel}</label>
                                            <input
                                                type="text"
                                                value={editingSession.pdf || ""}
                                                onChange={(e) => setEditingSession(prev => prev ? { ...prev, pdf: e.target.value } : null)}
                                                placeholder="https://example.com/lecture.pdf"
                                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:border-wine bg-white font-semibold"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">{UI_TEXT.courseDetail.sessionMiniProjectLabel}</label>
                                            <input
                                                type="text"
                                                value={editingSession.miniProject || ""}
                                                onChange={(e) => setEditingSession(prev => prev ? { ...prev, miniProject: e.target.value } : null)}
                                                placeholder="https://example.com/miniproject.zip"
                                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:border-wine bg-white font-semibold"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">{UI_TEXT.courseDetail.sessionExerciseLabel}</label>
                                            <input
                                                type="text"
                                                value={editingSession.exercise || ""}
                                                onChange={(e) => setEditingSession(prev => prev ? { ...prev, exercise: e.target.value } : null)}
                                                placeholder="Bài tập..."
                                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:border-wine bg-white font-semibold"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">{UI_TEXT.courseDetail.sessionQuizziLabel}</label>
                                            <input
                                                type="text"
                                                value={editingSession.quizzi || ""}
                                                onChange={(e) => setEditingSession(prev => prev ? { ...prev, quizzi: e.target.value } : null)}
                                                placeholder="Quizzi..."
                                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:border-wine bg-white font-semibold"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">{UI_TEXT.courseDetail.sessionEntranceQuizLabel}</label>
                                            <input
                                                type="text"
                                                value={editingSession.practiceEntranceQuiz || ""}
                                                onChange={(e) => setEditingSession(prev => prev ? { ...prev, practiceEntranceQuiz: e.target.value } : null)}
                                                placeholder="Entrance Quiz..."
                                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:border-wine bg-white font-semibold"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab 3: Practice */}
                            {editSessionTab === "practice" && editingSession && editingSession.practice && (
                                <div className="flex flex-col gap-4 py-2 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">{UI_TEXT.courseDetail.sessionPracticeTypeLabel}</label>
                                            <select
                                                value={editingSession.practice.submissionType}
                                                onChange={(e) => setEditingSession(prev => prev ? {
                                                    ...prev,
                                                    practice: {
                                                        ...prev.practice!,
                                                        submissionType: e.target.value as "LINK" | "FILE" | "TEXT"
                                                    }
                                                } : null)}
                                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:border-wine bg-white font-semibold"
                                            >
                                                <option value="LINK">{UI_TEXT.courseDetail.sessionPracticeSubmissionTypeLink}</option>
                                                <option value="FILE">{UI_TEXT.courseDetail.sessionPracticeSubmissionTypeFile}</option>
                                                <option value="TEXT">{UI_TEXT.courseDetail.sessionPracticeSubmissionTypeText}</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">{UI_TEXT.courseDetail.sessionPracticeContentLabel}</label>
                                        <textarea
                                            value={editingSession.practice.content}
                                            onChange={(e) => setEditingSession(prev => prev ? {
                                                ...prev,
                                                practice: {
                                                    ...prev.practice!,
                                                    content: e.target.value
                                                }
                                            } : null)}
                                            placeholder={UI_TEXT.courseDetail.sessionPracticeContentPlaceholder}
                                            rows={3}
                                            className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:border-wine bg-white font-semibold resize-none"
                                        />
                                    </div>

                                    {/* Resources references */}
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase">{UI_TEXT.courseDetail.sessionPracticeResourcesLabel}</label>
                                            <button
                                                type="button"
                                                onClick={() => setEditingSession(prev => prev ? {
                                                    ...prev,
                                                    practice: {
                                                        ...prev.practice!,
                                                        resources: [...(prev.practice!.resources || []), { label: "", url: "" }]
                                                    }
                                                } : null)}
                                                className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-700 font-bold transition cursor-pointer"
                                            >
                                                <Plus className="size-3" />
                                                {UI_TEXT.courseDetail.sessionPracticeAddResourceBtn}
                                            </button>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            {(editingSession.practice.resources || []).map((resource, resIdx) => (
                                                <div key={resIdx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                                                    <input
                                                        type="text"
                                                        value={resource.label || ""}
                                                        onChange={(e) => {
                                                            const newResources = [...(editingSession.practice!.resources || [])];
                                                            newResources[resIdx].label = e.target.value;
                                                            setEditingSession(prev => prev ? {
                                                                ...prev,
                                                                practice: { ...prev.practice!, resources: newResources }
                                                            } : null);
                                                        }}
                                                        placeholder={UI_TEXT.courseDetail.sessionPracticeResourceLabelPlaceholder}
                                                        className="w-1/2 rounded-lg border border-slate-200 px-2 py-1 text-[11px] focus:outline-none focus:border-wine bg-white font-semibold"
                                                        required
                                                    />
                                                    <input
                                                        type="text"
                                                        value={resource.url}
                                                        onChange={(e) => {
                                                            const newResources = [...(editingSession.practice!.resources || [])];
                                                            newResources[resIdx].url = e.target.value;
                                                            setEditingSession(prev => prev ? {
                                                                ...prev,
                                                                practice: { ...prev.practice!, resources: newResources }
                                                            } : null);
                                                        }}
                                                        placeholder={UI_TEXT.courseDetail.sessionPracticeResourceUrlPlaceholder}
                                                        className="w-1/2 rounded-lg border border-slate-200 px-2 py-1 text-[11px] focus:outline-none focus:border-wine bg-white font-semibold"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newResources = (editingSession.practice!.resources || []).filter((_, rIdx) => rIdx !== resIdx);
                                                            setEditingSession(prev => prev ? {
                                                                ...prev,
                                                                practice: { ...prev.practice!, resources: newResources }
                                                            } : null);
                                                        }}
                                                        className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer shrink-0"
                                                        title="Xóa tài liệu"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                            {(editingSession.practice.resources || []).length === 0 && (
                                                <span className="text-[10px] text-slate-400 italic font-semibold">{UI_TEXT.courseDetail.sessionPracticeNoResources}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-2.5 mt-2 w-full">
                                <button
                                    type="button"
                                    onClick={() => setIsEditSessionOpen(false)}
                                    className="w-1/3 bg-slate-50 border border-slate-200 text-slate-600 py-2.5 text-xs font-bold rounded-xl active:scale-[0.98] transition cursor-pointer text-center hover:bg-brand-500 hover:text-white hover:border-brand-500"
                                >
                                    {UI_TEXT.courseDetail.cancelButton}
                                </button>
                                <Button
                                    type="submit"
                                    disabled={updateSessionMutation.isPending || !editingSession?.name.trim()}
                                    className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white border-none py-2.5 text-xs font-black rounded-xl active:scale-[0.98] transition cursor-pointer text-center"
                                >
                                    {updateSessionMutation.isPending ? UI_TEXT.courseDetail.savingText : UI_TEXT.courseDetail.confirmButton}
                                </Button>
                            </div>
                        </form>
                    </Dialog>
                </CustomModal.Content>
            </CustomModal.Root>

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
                title="Xóa chương học"
                message={`Bạn có chắc chắn muốn xóa chương học "${deletingSession?.name || ""}"? Tất cả các bài học và học liệu bên trong chương học này cũng sẽ bị xóa vĩnh viễn và không thể khôi phục.`}
                confirmText={UI_TEXT.learningMaterials.confirmDeleteButton}
                cancelText={UI_TEXT.courseDetail.cancelButton}
                variant="danger"
            />
        </div>
    );
}

function LessonNode({
    lesson,
    selectedLessonId,
    selectedTab,
    onSelectLesson,
    onDelete,
    isDeletePending,
}: {
    lesson: Lesson;
    selectedLessonId: string;
    selectedTab: "video" | "reading" | "quiz";
    onSelectLesson: (id: string, tab: "video" | "reading" | "quiz") => void;
    onDelete: () => void;
    isDeletePending: boolean;
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const isSelected = lesson.id === selectedLessonId;

    useEffect(() => {
        if (isSelected) {
            setIsExpanded(true);
        }
    }, [isSelected]);

    return (
        <div className="flex flex-col gap-1 w-full">
            {/* Lesson Header */}
            <div
                onClick={() => {
                    onSelectLesson(lesson.id, "video");
                }}
                className={`flex w-full cursor-pointer items-center justify-between rounded-lg border p-2 text-left text-[11.5px] transition duration-150 group ${isSelected
                    ? "border-blue-400 bg-blue-50/50 font-semibold text-blue-600"
                    : "border-transparent bg-white text-slate-500 hover:bg-slate-50 shadow-xxs font-medium"
                    }`}
            >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <div className="cursor-grab active:cursor-grabbing p-0.5 text-slate-300 hover:text-slate-500 transition shrink-0" title="Kéo thả để di chuyển" onClick={(e) => e.stopPropagation()}>
                        <GripVertical className="size-3" />
                    </div>
                    {/* Toggle open/close Chevron button */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(!isExpanded);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100/50 transition shrink-0 cursor-pointer"
                        title={isExpanded ? "Thu gọn bài học" : "Mở rộng bài học"}
                    >
                        {isExpanded ? (
                            <ChevronDown className="size-3 shrink-0" />
                        ) : (
                            <ChevronRight className="size-3 shrink-0" />
                        )}
                    </button>
                    <span className="truncate flex-1">{lesson.name}</span>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    disabled={isDeletePending}
                    className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50 transition duration-150 shrink-0 cursor-pointer"
                    title="Xóa bài học"
                >
                    <Trash2 className="size-3.5" />
                </button>
            </div>

            {/* Sub-items list */}
            {isExpanded && (
                <div className="flex flex-col gap-1 pl-6 mt-0.5 border-l border-slate-200/60 ml-3">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelectLesson(lesson.id, "video");
                        }}
                        className={`flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] text-left transition duration-150 font-bold ${isSelected && selectedTab === "video"
                            ? "bg-wine/5 text-wine"
                            : "text-slate-500 hover:bg-slate-50"
                            }`}
                    >
                        <Video className="size-3.5 shrink-0" />
                        <span>Cấu hình Video</span>
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelectLesson(lesson.id, "reading");
                        }}
                        className={`flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] text-left transition duration-150 font-bold ${isSelected && selectedTab === "reading"
                            ? "bg-wine/5 text-wine"
                            : "text-slate-500 hover:bg-slate-50"
                            }`}
                    >
                        <FileText className="size-3.5 shrink-0" />
                        <span>Tài liệu / Bài đọc</span>
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelectLesson(lesson.id, "quiz");
                        }}
                        className={`flex w-full items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] text-left transition duration-150 font-bold ${isSelected && selectedTab === "quiz"
                            ? "bg-wine/5 text-wine"
                            : "text-slate-500 hover:bg-slate-50"
                            }`}
                    >
                        <BookText className="size-3.5 shrink-0" />
                        <span>Bài tập (Quiz)</span>
                    </button>
                </div>
            )}
        </div>
    );
}

function SessionNode({
    session,
    index,
    selectedLessonId,
    selectedSessionId,
    selectedSessionTab,
    selectedTab,
    onSelectLesson,
    onSelectSession,
    onEditSession,
    onDeleteSession,
}: {
    session: Session;
    index: number;
    selectedLessonId: string;
    selectedSessionId: string;
    selectedSessionTab: "mindmap" | "pdf" | "srs";
    selectedTab: "video" | "reading" | "quiz";
    onSelectLesson: (id: string, tab: "video" | "reading" | "quiz") => void;
    onSelectSession: (id: string, tab: "mindmap" | "pdf" | "srs") => void;
    onEditSession: (session: Session) => void;
    onDeleteSession: (id: string, name: string) => void;
}) {
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [draggedLessonIndex, setDraggedLessonIndex] = useState<number | null>(null);
    const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
    const [newLessonName, setNewLessonName] = useState("");

    const { data: lessons = [], isLoading } = useQuery({
        queryKey: ["lessons", session.id],
        queryFn: () => getLessonsBySession(session.id),
    });

    const addLessonMutation = useMutation({
        mutationFn: (name: string) => createLesson({ name, sessionId: session.id }),
        onSuccess: () => {
            toast.success("Thành công", "Đã thêm bài học mới");
            queryClient.invalidateQueries({ queryKey: ["lessons", session.id] });
            setIsOpen(true); // Open the chapter automatically when a new lesson is added
        },
    });

    const deleteLessonMutation = useMutation({
        mutationFn: (lessonId: string) => deleteLesson(lessonId),
        onSuccess: (_, lessonId) => {
            toast.success("Thành công", "Đã xóa bài học");
            queryClient.invalidateQueries({ queryKey: ["lessons", session.id] });
            if (selectedLessonId === lessonId) {
                onSelectLesson("", "video");
            }
        },
        onError: () => {
            toast.error("Lỗi", "Không thể xóa bài học");
        },
    });

    const reorderLessonsMutation = useMutation({
        mutationFn: async ({ lessonAId, positionA, lessonBId, positionB }: { lessonAId: string; positionA: number; lessonBId: string; positionB: number }) => {
            await Promise.all([
                updateLesson(lessonAId, { position: positionB }),
                updateLesson(lessonBId, { position: positionA }),
            ]);
        },
        onSuccess: () => {
            toast.success("Thành công", "Đã thay đổi vị trí bài học");
            queryClient.invalidateQueries({ queryKey: ["lessons", session.id] });
        },
        onError: () => {
            toast.error("Lỗi", "Không thể thay đổi vị trí bài học");
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
                }
            });
        }
    };

    const sortedLessons = [...lessons].sort((a, b) => (a.position || 0) - (b.position || 0));

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
        <div className={`flex flex-col gap-1.5 border rounded-xl p-3 transition ${selectedSessionId === session.id
            ? "border-blue-300 bg-blue-50/10 shadow-xs"
            : "border-slate-100 bg-slate-50/30"
            }`}>
            {/* Session Header */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 min-w-0 flex-1">
                    <div className="cursor-grab active:cursor-grabbing p-0.5 text-slate-300 hover:text-slate-500 transition shrink-0" title="Kéo thả để di chuyển">
                        <GripVertical className="size-3" />
                    </div>
                    {/* Toggle open/close Chevron button */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(!isOpen);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition duration-150 cursor-pointer shrink-0"
                        title={isOpen ? "Thu gọn chương học" : "Mở rộng chương học"}
                    >
                        {isOpen ? (
                            <ChevronDown className="size-3.5 shrink-0" />
                        ) : (
                            <ChevronRight className="size-3.5 shrink-0" />
                        )}
                    </button>
                    {/* Title click selects session */}
                    <div
                        onClick={() => {
                            // Also select this session, opening the first available resource tab
                            const defaultTab = session.mindmap ? "mindmap" : session.pdf ? "pdf" : "srs";
                            onSelectSession(session.id, defaultTab);
                        }}
                        className="flex flex-col min-w-0 flex-1 cursor-pointer select-none group"
                    >
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Chương {index + 1}</span>
                        <h4 className="text-xs font-extrabold text-slate-700 truncate leading-snug group-hover:text-blue-600 transition">
                            {session.name}
                        </h4>
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={handleAddLesson}
                        title="Thêm bài học"
                        className="flex size-6 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-wine hover:bg-wine/5 hover:text-wine"
                    >
                        <Plus className="size-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEditSession(session);
                        }}
                        title="Sửa chương học"
                        className="flex size-6 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
                    >
                        <Pencil className="size-3" />
                    </button>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(session.id, session.name);
                        }}
                        title="Xóa chương học"
                        className="flex size-6 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:border-red-500 hover:bg-red-50 hover:text-red-500"
                    >
                        <Trash2 className="size-3.5" />
                    </button>
                </div>
            </div>

            {/* Session resources (Mindmap, PDF, SRS) */}
            {(session.mindmap || session.pdf || session.srs) && (
                <div className="flex flex-wrap items-center gap-1.5 pl-[30px] mt-0.5 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                    {session.mindmap && (
                        <button
                            type="button"
                            onClick={() => onSelectSession(session.id, "mindmap")}
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold transition cursor-pointer ${selectedSessionId === session.id && selectedSessionTab === "mindmap"
                                ? "bg-blue-600 text-white"
                                : "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                                }`}
                            title="Xem Mindmap chương học"
                        >
                            <Map className="size-2.5" />
                            <span>Mindmap</span>
                        </button>
                    )}
                    {session.pdf && (
                        <button
                            type="button"
                            onClick={() => onSelectSession(session.id, "pdf")}
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold transition cursor-pointer ${selectedSessionId === session.id && selectedSessionTab === "pdf"
                                ? "bg-rose-600 text-white"
                                : "bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700"
                                }`}
                            title="Xem tài liệu PDF chương học"
                        >
                            <FileText className="size-2.5" />
                            <span>PDF</span>
                        </button>
                    )}
                    {session.srs && (
                        <button
                            type="button"
                            onClick={() => onSelectSession(session.id, "srs")}
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold transition cursor-pointer ${selectedSessionId === session.id && selectedSessionTab === "srs"
                                ? "bg-emerald-600 text-white"
                                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700"
                                }`}
                            title="Xem tài liệu SRS chương học"
                        >
                            <ScrollText className="size-2.5" />
                            <span>SRS</span>
                        </button>
                    )}
                </div>
            )}

            {/* Nested Lessons List */}
            {isOpen && (
                <div className="flex flex-col gap-1.5 pl-2 mt-1">
                    {isLoading ? (
                        <div className="py-2 text-center">
                            <div className="mx-auto size-3.5 animate-spin rounded-full border border-slate-200 border-t-wine" />
                        </div>
                    ) : lessons.length === 0 ? (
                        <p className="text-[10px] text-slate-400 italic py-1 pl-1">Chưa có bài học nào</p>
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
                                    className={`transition-all duration-150 rounded-lg ${draggedLessonIndex === idx ? "opacity-30 scale-[0.98] border border-dashed border-blue-300" : ""
                                        }`}
                                >
                                    <LessonNode
                                        lesson={les}
                                        selectedLessonId={selectedLessonId}
                                        selectedTab={selectedTab}
                                        onSelectLesson={onSelectLesson}
                                        onDelete={() => {
                                            if (confirm(`Bạn có chắc chắn muốn xóa bài học "${les.name}" không?`)) {
                                                deleteLessonMutation.mutate(les.id);
                                            }
                                        }}
                                        isDeletePending={deleteLessonMutation.isPending}
                                    />
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* Custom Modal for Adding Lesson */}
            <CustomModal.Root open={isAddLessonOpen} onOpenChange={setIsAddLessonOpen}>
                <CustomModal.Content className="max-w-xl !rounded-[20px] w-full">
                    <Dialog className="bg-white p-5 rounded-[20px] flex flex-col gap-4 outline-none shadow-2xl relative">
                        <button
                            type="button"
                            onClick={() => setIsAddLessonOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition cursor-pointer p-1 rounded-lg hover:bg-slate-50"
                        >
                            <X className="size-4" />
                        </button>
                        <form onSubmit={handleSubmitAddLesson} className="flex flex-col gap-4">
                            <div>
                                <h3 className="text-sm font-black text-slate-800">{UI_TEXT.courseDetail.addLessonTitle}</h3>
                                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                                    {UI_TEXT.courseDetail.addLessonDescriptionPrefix}
                                    <strong>{session.name}</strong>
                                    {UI_TEXT.courseDetail.addLessonDescriptionSuffix}
                                </p>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">{UI_TEXT.courseDetail.lessonNameLabel}</label>
                                <input
                                    type="text"
                                    value={newLessonName}
                                    onChange={(e) => setNewLessonName(e.target.value)}
                                    placeholder={UI_TEXT.courseDetail.lessonNamePlaceholder}
                                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:border-wine bg-white font-semibold"
                                    autoFocus
                                    required
                                />
                            </div>

                            <div className="flex items-center gap-2.5 mt-2 w-full">
                                <button
                                    type="button"
                                    onClick={() => setIsAddLessonOpen(false)}
                                    className="w-1/3 bg-slate-50 border border-slate-200 text-slate-600 py-2.5 text-xs font-bold rounded-xl active:scale-[0.98] transition cursor-pointer text-center hover:bg-brand-500 hover:text-white hover:border-brand-500"
                                >
                                    {UI_TEXT.courseDetail.cancelButton}
                                </button>
                                <Button
                                    type="submit"
                                    disabled={addLessonMutation.isPending || !newLessonName.trim()}
                                    className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white border-none py-2.5 text-xs font-black rounded-xl active:scale-[0.98] transition cursor-pointer text-center"
                                >
                                    {addLessonMutation.isPending ? UI_TEXT.courseDetail.addingText : UI_TEXT.courseDetail.confirmButton}
                                </Button>
                            </div>
                        </form>
                    </Dialog>
                </CustomModal.Content>
            </CustomModal.Root>
        </div>
    );
}

function LessonEditorWrapper({
    lessonId,
    quizzes,
    activeTab,
}: {
    lessonId: string;
    quizzes: any[];
    activeTab: "video" | "reading" | "quiz";
}) {
    const queryClient = useQueryClient();
    const [localLesson, setLocalLesson] = useState<Lesson | null>(null);

    // Lifted Form States
    const [videoUrl, setVideoUrl] = useState("");
    const [videoDuration, setVideoDuration] = useState(0);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoQuestions, setVideoQuestions] = useState<any[]>([]);

    const [readingContent, setReadingContent] = useState("");
    const [readingFile, setReadingFile] = useState<File | null>(null);
    const [readingPdfUrl, setReadingPdfUrl] = useState("");
    const [isPdfDeleted, setIsPdfDeleted] = useState(false);
    const [readingVersion, setReadingVersion] = useState(0);

    const [quizId, setQuizId] = useState("");

    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<"video" | "reading" | "quiz" | null>(null);

    const triggerDelete = (target: "video" | "reading" | "quiz") => {
        setDeleteTarget(target);
        setIsConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = () => {
        if (deleteTarget === "video") {
            setVideoUrl("");
            setVideoFile(null);
            setVideoDuration(0);
            setVideoQuestions([]);
        } else if (deleteTarget === "reading") {
            setReadingContent("");
            setReadingFile(null);
            setReadingPdfUrl("");
            setIsPdfDeleted(true);
            setReadingVersion((prev) => prev + 1);
        } else if (deleteTarget === "quiz") {
            setQuizId("");
        }
        setDeleteTarget(null);
        setIsConfirmDeleteOpen(false);
    };

    const { data: lessonDetails, isLoading } = useQuery({
        queryKey: ["lesson-details-editor", lessonId],
        queryFn: () => getLessonDetails(lessonId),
        enabled: !!lessonId,
    });

    useEffect(() => {
        if (lessonDetails) {
            setLocalLesson(lessonDetails);
            setVideoUrl(lessonDetails.video?.url || "");
            setVideoDuration(lessonDetails.video?.durationTime || 0);
            setVideoQuestions(lessonDetails.video?.questions || []);
            setReadingContent(lessonDetails.reading?.content || "");
            setQuizId(lessonDetails.quizId || "");
            setVideoFile(null);
            setReadingFile(null);
            setReadingPdfUrl(lessonDetails.reading?.pdf || "");
            setIsPdfDeleted(false);
            setReadingVersion(0);
        }
    }, [lessonDetails]);

    const handleSave = (updated: Lesson) => {
        setLocalLesson(updated);
        // Invalidate cache for session lessons to trigger reload of indicators
        if (updated.sessionId) {
            queryClient.invalidateQueries({ queryKey: ["lessons", updated.sessionId] });
        }
    };

    const [isSaving, setIsSaving] = useState(false);

    const handleSaveAll = async () => {
        setIsSaving(true);
        try {
            const promises = [];

            // 1. Check if video info is dirty
            const isVideoDirty =
                videoUrl !== (lessonDetails?.video?.url || "") ||
                videoDuration !== (lessonDetails?.video?.durationTime || 0) ||
                videoFile !== null ||
                JSON.stringify(videoQuestions) !== JSON.stringify(lessonDetails?.video?.questions || []);

            if (isVideoDirty) {
                const videoFd = new FormData();
                if (videoFile) videoFd.append("file", videoFile);
                if (videoUrl) videoFd.append("url", videoUrl);
                videoFd.append("durationTime", String(videoDuration));
                videoFd.append("questions", JSON.stringify(videoQuestions));
                promises.push(configureLessonVideo(lessonId, videoFd));
            }

            // 2. Check if reading is dirty
            const hasPdfBeenDeleted = !!lessonDetails?.reading?.pdf && !readingFile && !readingContent && !readingPdfUrl;
            const isReadingDirty =
                readingContent !== (lessonDetails?.reading?.content || "") ||
                readingFile !== null ||
                readingPdfUrl !== (lessonDetails?.reading?.pdf || "") ||
                hasPdfBeenDeleted;

            if (isReadingDirty) {
                const readingFd = new FormData();
                if (readingFile) {
                    readingFd.append("file", readingFile);
                } else if (readingPdfUrl) {
                    readingFd.append("pdf", readingPdfUrl);
                } else {
                    readingFd.append("pdf", "");
                }
                readingFd.append("content", readingContent);
                readingFd.append("questions", JSON.stringify([]));
                promises.push(configureLessonReading(lessonId, readingFd));
            }

            // 3. Check if quiz is dirty
            const isQuizDirty = quizId !== (lessonDetails?.quizId || "");
            if (isQuizDirty) {
                promises.push(linkLessonQuiz(lessonId, quizId));
            }

            if (promises.length === 0) {
                toast.success("Thành công", "Không có thay đổi nào cần lưu");
                setIsSaving(false);
                return;
            }

            const results = await Promise.all(promises);
            // Get the last resolved lesson from results to update state
            const lastUpdatedLesson = results[results.length - 1];
            if (lastUpdatedLesson) {
                handleSave(lastUpdatedLesson);
            }
            toast.success("Thành công", "Đã lưu thông tin bài học thành công");
        } catch (error) {
            toast.error("Lỗi", "Không thể lưu thông tin bài học");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || !localLesson) {
        return (
            <div className="flex flex-1 items-center justify-center py-20">
                <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 flex-1 min-h-0 h-full">
            {/* Header */}
            <div className="border-b border-slate-100 pb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
                <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {activeTab === "video" && "Cấu hình Video"}
                        {activeTab === "reading" && "Cấu hình Tài liệu / Bài đọc"}
                        {activeTab === "quiz" && "Cấu hình Bài tập (Quiz)"}
                    </span>
                    <h3 className="text-base font-extrabold text-blue-500 mt-0.5">{localLesson.name}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        onClick={handleSaveAll}
                        isLoading={isSaving}
                        className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white border-none py-2 px-5 rounded-xl text-xs font-black transition-all duration-150 cursor-pointer shadow-md shadow-blue-500/25"
                    >
                        Lưu bài học
                    </Button>
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar flex flex-col gap-4">
                {/* Video Config Section */}
                {activeTab === "video" && (
                    <div className="flex flex-col gap-4 flex-1 min-h-0">
                        <VideoConfigTab
                            url={videoUrl}
                            setUrl={setVideoUrl}
                            duration={videoDuration}
                            setDuration={setVideoDuration}
                            file={videoFile}
                            setFile={setVideoFile}
                            questions={videoQuestions}
                            setQuestions={setVideoQuestions}
                            onDelete={() => triggerDelete("video")}
                        />
                    </div>
                )}

                {/* Quiz Config Section */}
                {activeTab === "quiz" && (
                    <div className="flex flex-col gap-4 flex-1 min-h-0">
                        <QuizConfigTab
                            key={localLesson.id}
                            quizId={quizId}
                            setQuizId={setQuizId}
                            quizzes={quizzes}
                            onDelete={() => triggerDelete("quiz")}
                        />
                    </div>
                )}

                {/* Reading Config Section */}
                {activeTab === "reading" && (
                    <div className="flex flex-col gap-4 flex-1 min-h-0">
                        <ReadingConfigTab
                            key={`${localLesson.id}-${readingVersion}`}
                            content={readingContent}
                            setContent={setReadingContent}
                            file={readingFile}
                            setFile={setReadingFile}
                            pdfUrl={readingPdfUrl}
                            setPdfUrl={setReadingPdfUrl}
                            savedPdf={isPdfDeleted ? undefined : (readingPdfUrl || localLesson.reading?.pdf)}
                            onDelete={() => triggerDelete("reading")}
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

/* Config components copied from LessonMaterialModal for inline right panel usage */
function VideoConfigTab({
    url,
    setUrl,
    duration,
    setDuration,
    file,
    setFile,
    questions,
    setQuestions,
    onDelete,
}: {
    url: string;
    setUrl: (u: string) => void;
    duration: number;
    setDuration: (d: number) => void;
    file: File | null;
    setFile: (f: File | null) => void;
    questions: any[];
    setQuestions: (q: any[]) => void;
    onDelete?: () => void;
}) {
    const [videoType, setVideoType] = useState<"link" | "file" | "">("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
    const [tempLink, setTempLink] = useState("");
    const [expandedQuestionIndices, setExpandedQuestionIndices] = useState<number[]>([0]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (url) {
            setVideoType("link");
        } else if (file) {
            setVideoType("file");
        } else {
            setVideoType("");
        }
    }, [url, file]);

    const getYoutubeId = (urlStr: string) => {
        if (!urlStr) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = urlStr.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const youtubeId = getYoutubeId(url);

    useEffect(() => {
        if (!youtubeId) return;

        let player: any;
        let isDestroyed = false;
        let ytDiv: HTMLDivElement | null = null;

        const container = document.getElementById("youtube-container");
        if (container) {
            ytDiv = document.createElement("div");
            ytDiv.id = "youtube-preview-player";
            ytDiv.className = "w-full h-full";
            container.appendChild(ytDiv);
        }

        const initPlayer = () => {
            if (isDestroyed || !ytDiv) return;
            const YT = (window as any).YT;
            if (YT && YT.Player) {
                try {
                    player = new YT.Player(ytDiv, {
                        height: "100%",
                        width: "100%",
                        videoId: youtubeId,
                        playerVars: {
                            rel: 0,
                            autoplay: 0,
                            controls: 1,
                        },
                        events: {
                            onReady: (event: any) => {
                                const dur = event.target.getDuration();
                                if (dur) {
                                    setDuration(Math.round(dur));
                                }
                            },
                            onStateChange: (event: any) => {
                                const dur = event.target.getDuration();
                                if (dur) {
                                    setDuration(Math.round(dur));
                                }
                            }
                        }
                    });
                } catch (e) {
                    console.error("Failed to init YT player", e);
                }
            } else {
                setTimeout(initPlayer, 300);
            }
        };

        if (!(window as any).YT) {
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName("script")[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        }

        initPlayer();

        return () => {
            isDestroyed = true;
            if (player && player.destroy) {
                try {
                    player.destroy();
                } catch (e) { }
            }
            if (ytDiv && ytDiv.parentNode) {
                try {
                    ytDiv.parentNode.removeChild(ytDiv);
                } catch (e) { }
            }
        };
    }, [youtubeId, setDuration]);

    const addQuestion = () => {
        const newQuestions = [
            ...questions,
            {
                content: "",
                type: "SINGLE_CHOICE",
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

    const hasVideo = !!url || !!file;
    const videoSrc = file ? URL.createObjectURL(file) : url;

    return (
        <div className="flex flex-col gap-4 flex-1 min-h-0">
            <div className={`flex flex-col gap-1.5 relative ${hasVideo ? "" : "flex-1 min-h-0"}`}>
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">Video</label>
                    {hasVideo && (
                        <button
                            type="button"
                            onClick={() => setIsSelectModalOpen(true)}
                            className="text-slate-400 hover:text-blue-500 transition cursor-pointer p-0.5 rounded"
                            title="Thay đổi nguồn video"
                        >
                            <Repeat className="size-4" />
                        </button>
                    )}
                </div>

                {hasVideo ? (
                    /* Video Preview Player (Image 2) */
                    <div className="flex flex-col gap-3">
                        <div className="rounded-xl overflow-hidden bg-slate-950 shadow-inner w-full aspect-video flex flex-col justify-center relative">
                            {youtubeId ? (
                                <div id="youtube-container" className="w-full h-full" />
                            ) : videoSrc ? (
                                <video
                                    src={videoSrc}
                                    controls
                                    className="w-full h-full"
                                    onLoadedMetadata={(e) => {
                                        const video = e.currentTarget;
                                        if (video && video.duration) {
                                            setDuration(Math.round(video.duration));
                                        }
                                    }}
                                />
                            ) : null}
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase">
                                <span>Thời lượng:</span>
                                <span className="text-slate-800 font-extrabold normal-case">{duration} giây</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Centered Empty State View for Video (Image 2 style) */
                    <div className="flex flex-col flex-1 items-center justify-center p-8 py-14 border border-dashed border-slate-200 rounded-2xl bg-slate-50/30 text-center gap-4 animate-fadeIn">
                        <div className="flex size-16 items-center justify-center rounded-full border-2 border-dashed border-slate-200 bg-white text-slate-400">
                            <Video className="size-6 text-slate-400" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h4 className="text-sm font-black text-slate-800">{"Video bài học hiện tại đang trống"}</h4>
                            <p className="text-xs text-slate-400 font-semibold max-w-[320px] leading-relaxed">
                                {"Vui lòng chọn hoặc tải lên video cho bài học này để tiếp tục cấu hình học liệu."}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsSelectModalOpen(true)}
                            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-black py-2 px-6 rounded-xl transition duration-150 cursor-pointer"
                        >
                            {"+ Thêm video"}
                        </button>
                    </div>
                )}
            </div>

            {/* Hidden file input for automatic selection dialog */}
            <input
                type="file"
                ref={fileInputRef}
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                    const selectedFile = e.target.files?.[0] || null;
                    setFile(selectedFile);
                    if (selectedFile) {
                        setVideoType("file");
                    }
                }}
            />

            {/* Custom Modal for Link Input */}
            <CustomModal.Root open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
                <CustomModal.Content className="max-w-md !rounded-[20px] w-full">
                    <Dialog className="bg-white p-5 rounded-[20px] flex flex-col gap-4 outline-none shadow-2xl relative">
                        <button
                            type="button"
                            onClick={() => setIsLinkModalOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition cursor-pointer p-1 rounded-lg hover:bg-slate-50"
                        >
                            <X className="size-4" />
                        </button>

                        <div className="flex items-center  gap-2.5">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLinkModalOpen(false);
                                    setIsSelectModalOpen(true);
                                }}
                                className="text-slate-400 hover:text-slate-600 transition cursor-pointer p-1 rounded-lg hover:bg-slate-50 -ml-1 mt-0.5 shrink-0"
                                title="Quay lại"
                            >
                                <ArrowLeft className="size-4" />
                            </button>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-black text-slate-800">{"Nhập liên kết bài học"}</h3>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">{"Đường dẫn liên kết (Link Video)"}</label>
                            <input
                                type="text"
                                value={tempLink}
                                onChange={(e) => setTempLink(e.target.value)}
                                placeholder="https://www.youtube.com/watch?v=..."
                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:border-wine bg-white"
                                autoFocus
                            />
                        </div>

                        <div className="flex items-center gap-2.5 mt-2 w-full">
                            <button
                                type="button"
                                onClick={() => setIsLinkModalOpen(false)}
                                className="w-1/3 bg-slate-50 border border-slate-200 text-slate-600 py-2.5 text-xs font-bold rounded-xl active:scale-[0.98] transition cursor-pointer text-center hover:bg-brand-500 hover:text-white hover:border-brand-500"
                            >
                                {"Hủy"}
                            </button>
                            <Button
                                onClick={() => {
                                    setUrl(tempLink);
                                    setIsLinkModalOpen(false);
                                }}
                                className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white border-none py-2.5 text-xs font-black rounded-xl active:scale-[0.98] transition cursor-pointer text-center"
                            >
                                {"Xác nhận"}
                            </Button>
                        </div>
                    </Dialog>
                </CustomModal.Content>
            </CustomModal.Root>

            {/* Custom Modal to choose video source method */}
            <CustomModal.Root open={isSelectModalOpen} onOpenChange={setIsSelectModalOpen}>
                <CustomModal.Content className="max-w-md !rounded-[20px] w-full">
                    <Dialog className="bg-white p-5 rounded-[20px] flex flex-col gap-4 outline-none shadow-2xl relative">
                        <button
                            type="button"
                            onClick={() => setIsSelectModalOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition cursor-pointer p-1 rounded-lg hover:bg-slate-50"
                        >
                            <X className="size-4" />
                        </button>
                        <div>
                            <h3 className="text-sm font-black text-slate-800">{"Chọn nguồn video"}</h3>
                            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{"Chọn cách thức bạn muốn thêm video vào bài học này"}</p>
                        </div>

                        <div className="flex flex-col gap-2.5">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSelectModalOpen(false);
                                    setVideoType("link");
                                    setTempLink(url);
                                    setIsLinkModalOpen(true);
                                }}
                                className="flex w-full items-center gap-3 rounded-xl border border-slate-100 p-3 text-left text-xs hover:bg-slate-50 transition duration-150 cursor-pointer"
                            >
                                <span className="flex size-8 items-center justify-center rounded-full bg-slate-900 text-white shrink-0">
                                    <Play className="size-3 fill-current ml-0.5" />
                                </span>
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-800">{"Nhập liên kết bài học"}</span>
                                    <span className="text-[10px] text-slate-400 font-semibold">{"Nhập liên kết video từ YouTube, S3..."}</span>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSelectModalOpen(false);
                                    setVideoType("file");
                                    fileInputRef.current?.click();
                                }}
                                className="flex w-full items-center gap-3 rounded-xl border border-slate-100 p-3 text-left text-xs hover:bg-slate-50 transition duration-150 cursor-pointer"
                            >
                                <span className="flex size-8 items-center justify-center rounded-full bg-slate-900 text-white shrink-0">
                                    <FileText className="size-4" />
                                </span>
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-800">{"Tải tệp lên"}</span>
                                    <span className="text-[10px] text-slate-400 font-semibold">{"Chọn file từ máy tính"}</span>
                                </div>
                            </button>
                        </div>
                    </Dialog>
                </CustomModal.Content>
            </CustomModal.Root>

            {/* Video Questions (only show if video has been assigned/uploaded) */}
            {hasVideo && (
                <div className="pt-4 ">
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-xs font-bold ">{UI_TEXT.learningMaterials.embeddedQuestionsTitle}</label>
                        <button
                            type="button"
                            onClick={addQuestion}
                            className="bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-600 active:scale-[0.98] transition text-[9px] font-bold py-1 px-2.5 rounded-lg cursor-pointer"
                        >
                            + Thêm câu hỏi nhúng
                        </button>
                    </div>

                    <div className="flex flex-col gap-3">
                        {questions.map((q, idx) => {
                            const isExpanded = expandedQuestionIndices.includes(idx);
                            return (
                                <div key={idx} className="rounded-2xl border border-slate-100 bg-slate-50/20 overflow-hidden transition-all duration-200">
                                    {/* Header */}
                                    <div
                                        onClick={() => toggleQuestionExpand(idx)}
                                        className="flex items-center justify-between p-3.5 bg-slate-50/40 hover:bg-slate-50/80 transition duration-150 cursor-pointer select-none"
                                    >
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            {isExpanded ? (
                                                <ChevronDown className="size-4 text-slate-400 shrink-0" />
                                            ) : (
                                                <ChevronRight className="size-4 text-slate-400 shrink-0" />
                                            )}
                                            <span className="text-xs font-bold text-slate-700 shrink-0">
                                                Câu hỏi nhúng {idx + 1}
                                            </span>
                                            <span className="text-[10px] text-slate-400 truncate font-semibold">
                                                (Thời điểm: {q.timeInVideo}s) {q.content ? `- ${q.content}` : ""}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const copy = [...questions];
                                                copy.splice(idx, 1);
                                                setQuestions(copy);
                                                setExpandedQuestionIndices(
                                                    expandedQuestionIndices
                                                        .filter((i) => i !== idx)
                                                        .map((i) => (i > idx ? i - 1 : i))
                                                );
                                            }}
                                            className="text-slate-400 hover:text-red-500 transition cursor-pointer p-1 rounded"
                                            title="Xóa câu hỏi nhúng"
                                        >
                                            <Trash2 className="size-3.5" />
                                        </button>
                                    </div>

                                    {/* Body */}
                                    {isExpanded && (
                                        <div className="p-3.5 pt-3 border-t border-slate-100/60 flex flex-col gap-3">
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="col-span-2 flex flex-col gap-1">
                                                    <label className="text-[10px] font-bold text-slate-400">Nội dung câu hỏi</label>
                                                    <input
                                                        type="text"
                                                        value={q.content}
                                                        onChange={(e) => {
                                                            const copy = [...questions];
                                                            copy[idx].content = e.target.value;
                                                            setQuestions(copy);
                                                        }}
                                                        placeholder="Nhập nội dung câu hỏi..."
                                                        className="bg-white border border-slate-200 text-xs px-3.5 py-2 rounded-xl focus:outline-none transition duration-150 focus:border-slate-300 shadow-xxs font-semibold"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[10px] font-bold text-slate-400">Thời điểm (s)</label>
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
                                                        className="bg-white border border-slate-200 text-xs px-3.5 py-2 rounded-xl focus:outline-none transition duration-150 focus:border-slate-300 shadow-xxs font-semibold"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2.5 mt-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase">Danh sách Đáp án</span>
                                                    {q.options.length < 6 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const copy = [...questions];
                                                                copy[idx].options.push({ content: "", isCorrect: false });
                                                                setQuestions(copy);
                                                            }}
                                                            className="text-[9px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer transition bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 hover:bg-slate-100"
                                                        >
                                                            <Plus className="size-3 text-blue-600" />
                                                            <span>Thêm đáp án</span>
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {q.options.map((opt: any, optIdx: number) => {
                                                        const isCorrect = opt.isCorrect;
                                                        return (
                                                            <div
                                                                key={optIdx}
                                                                className={`relative flex flex-col gap-2 rounded-xl p-3 border transition duration-150 bg-white ${isCorrect ? "border-emerald-500 bg-emerald-50/10" : "border-slate-200"
                                                                    }`}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const copy = [...questions];
                                                                            copy[idx].options.forEach((o: any, oIdx: number) => {
                                                                                o.isCorrect = oIdx === optIdx;
                                                                            });
                                                                            setQuestions(copy);
                                                                        }}
                                                                        className="cursor-pointer flex items-center justify-center"
                                                                    >
                                                                        {isCorrect ? (
                                                                            <CheckCircle2 className="size-4 text-emerald-600 fill-emerald-100" />
                                                                        ) : (
                                                                            <Circle className="size-4 text-slate-400" />
                                                                        )}
                                                                    </button>
                                                                    <span className={`text-[10px] font-bold ${isCorrect ? "text-emerald-600" : "text-slate-400"}`}>
                                                                        {isCorrect ? "Đúng" : "Sai"}
                                                                    </span>
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    value={opt.content}
                                                                    onChange={(e) => {
                                                                        const copy = [...questions];
                                                                        copy[idx].options[optIdx].content = e.target.value;
                                                                        setQuestions(copy);
                                                                    }}
                                                                    placeholder="Nhập câu trả lời"
                                                                    className="w-full bg-transparent border-none text-[11px] font-bold text-slate-700 focus:outline-none p-0 pr-6"
                                                                />
                                                                {q.options.length > 2 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const copy = [...questions];
                                                                            copy[idx].options.splice(optIdx, 1);
                                                                            if (isCorrect && copy[idx].options.length > 0) {
                                                                                copy[idx].options[0].isCorrect = true;
                                                                            }
                                                                            setQuestions(copy);
                                                                        }}
                                                                        className="absolute bottom-2.5 right-2.5 text-slate-400 hover:text-red-500 transition cursor-pointer p-0.5 rounded"
                                                                        title="Xóa đáp án"
                                                                    >
                                                                        <Trash2 className="size-3" />
                                                                    </button>
                                                                )}
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
            )}
        </div>
    );
}

function ReadingConfigTab({
    content,
    setContent,
    file,
    setFile,
    pdfUrl,
    setPdfUrl,
    savedPdf,
    onDelete,
}: {
    content: string;
    setContent: (c: string) => void;
    file: File | null;
    setFile: (f: File | null) => void;
    pdfUrl: string;
    setPdfUrl: (url: string) => void;
    savedPdf?: string;
    onDelete?: () => void;
}) {
    const [readingType, setReadingType] = useState<"pdf" | "text" | "">(() => {
        if (file || savedPdf || pdfUrl) return "pdf";
        if (content) return "text";
        return "";
    });
    const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [tempLink, setTempLink] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="flex flex-col gap-4 flex-1 min-h-0">
            <div className={`flex flex-col gap-1.5 relative ${readingType !== "" ? "" : "flex-1 min-h-0"}`}>
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">Tài liệu / Bài đọc</label>
                    {readingType !== "" && (
                        <button
                            type="button"
                            onClick={() => setIsSelectModalOpen(true)}
                            className="text-slate-400 hover:text-blue-500 transition cursor-pointer p-0.5 rounded"
                            title="Thay đổi tài liệu"
                        >
                            <Repeat className="size-4" />
                        </button>
                    )}
                </div>

                {readingType === "pdf" && (file || savedPdf || pdfUrl) ? (
                    /* PDF File chosen display & Preview */
                    <div className="flex flex-col gap-3 w-full animate-fadeIn">
                        <div className="rounded-xl p-4 bg-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <span className="flex size-8 items-center justify-center rounded-lg bg-red-50 text-red-600 shrink-0">
                                    <FileText className="size-4" />
                                </span>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-800 line-clamp-1">
                                        {file ? file.name : (pdfUrl ? pdfUrl.split("/").pop() : (savedPdf ? savedPdf.split("/").pop() : "Tệp học liệu"))}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-semibold">Tệp PDF học liệu</span>
                                </div>
                            </div>
                        </div>

                        {/* PDF Content Preview */}
                        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white w-full h-[550px] shadow-sm">
                            <iframe
                                src={file ? URL.createObjectURL(file) : (pdfUrl || savedPdf)}
                                className="w-full h-full border-none"
                                title={UI_TEXT.learningMaterials.pdfPreviewTitle}
                            />
                        </div>
                    </div>
                ) : readingType === "text" ? (
                    /* Rich Text Content display */
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-1.5">
                            <TiptapEditor
                                value={content}
                                onChange={setContent}
                                placeholder={UI_TEXT.learningMaterials.editorPlaceholder}
                                className="w-full bg-white rounded-lg overflow-hidden border border-slate-200"
                            />
                        </div>
                    </div>
                ) : (
                    /* Centered Empty State View for Reading */
                    <div className="flex flex-col flex-1 items-center justify-center p-8 py-14 border border-dashed border-slate-200 rounded-2xl bg-slate-50/30 text-center gap-4 animate-fadeIn">
                        <div className="flex size-16 items-center justify-center rounded-full border-2 border-dashed border-slate-200 bg-white text-slate-400">
                            <FileText className="size-6 text-slate-400" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h4 className="text-sm font-black text-slate-800">{UI_TEXT.learningMaterials.emptyReadingTitle}</h4>
                            <p className="text-xs text-slate-400 font-semibold max-w-[320px] leading-relaxed">
                                {UI_TEXT.learningMaterials.emptyReadingDesc}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsSelectModalOpen(true)}
                            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-black py-2 px-6 rounded-xl transition duration-150 cursor-pointer"
                        >
                            {UI_TEXT.learningMaterials.addReadingButton}
                        </button>
                    </div>
                )}

                {/* Custom Modal to choose document source method */}
                <CustomModal.Root open={isSelectModalOpen} onOpenChange={setIsSelectModalOpen}>
                    <CustomModal.Content className="max-w-md !rounded-[20px] w-full">
                        <Dialog className="bg-white p-5 rounded-[20px] flex flex-col gap-4 outline-none shadow-2xl relative">
                            <button
                                type="button"
                                onClick={() => setIsSelectModalOpen(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition cursor-pointer p-1 rounded-lg hover:bg-slate-50"
                            >
                                <X className="size-4" />
                            </button>
                            <div>
                                <h3 className="text-sm font-black text-slate-800">{UI_TEXT.learningMaterials.selectDocSourceTitle}</h3>
                                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{UI_TEXT.learningMaterials.selectDocSourceDesc}</p>
                            </div>

                            <div className="flex flex-col gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsSelectModalOpen(false);
                                        fileInputRef.current?.click();
                                    }}
                                    className="flex w-full items-center gap-3 rounded-xl border border-slate-100 p-3 text-left text-xs hover:bg-slate-50 transition duration-150 cursor-pointer"
                                >
                                    <span className="flex size-8 items-center justify-center rounded-full bg-slate-900 text-white shrink-0">
                                        <FileText className="size-4" />
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-800">{UI_TEXT.learningMaterials.uploadPdfTitle}</span>
                                        <span className="text-[10px] text-slate-400 font-semibold">{UI_TEXT.learningMaterials.uploadPdfDesc}</span>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsSelectModalOpen(false);
                                        setTempLink(pdfUrl || savedPdf || "");
                                        setIsLinkModalOpen(true);
                                    }}
                                    className="flex w-full items-center gap-3 rounded-xl border border-slate-100 p-3 text-left text-xs hover:bg-slate-50 transition duration-150 cursor-pointer"
                                >
                                    <span className="flex size-8 items-center justify-center rounded-full bg-slate-900 text-white shrink-0">
                                        <LinkIcon className="size-4" />
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-800">Gán liên kết PDF</span>
                                        <span className="text-[10px] text-slate-400 font-semibold">Nhập URL trực tuyến tới tệp PDF</span>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsSelectModalOpen(false);
                                        setReadingType("text");
                                        setContent("");
                                        setFile(null);
                                        setPdfUrl("");
                                    }}
                                    className="flex w-full items-center gap-3 rounded-xl border border-slate-100 p-3 text-left text-xs hover:bg-slate-50 transition duration-150 cursor-pointer"
                                >
                                    <span className="flex size-8 items-center justify-center rounded-full bg-slate-900 text-white shrink-0">
                                        <File className="size-4" />
                                    </span>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-800">{UI_TEXT.learningMaterials.writeDocTitle}</span>
                                        <span className="text-[10px] text-slate-400 font-semibold">{UI_TEXT.learningMaterials.writeDocDesc}</span>
                                    </div>
                                </button>
                            </div>
                        </Dialog>
                    </CustomModal.Content>
                </CustomModal.Root>

                {/* Custom Modal for PDF Link Input */}
                <CustomModal.Root open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
                    <CustomModal.Content className="max-w-md !rounded-[20px] w-full">
                        <Dialog className="bg-white p-5 rounded-[20px] flex flex-col gap-4 outline-none shadow-2xl  relative">
                            <button
                                type="button"
                                onClick={() => setIsLinkModalOpen(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition cursor-pointer p-1 rounded-lg hover:bg-slate-50"
                            >
                                <X className="size-4" />
                            </button>

                            <div className="flex items-center  gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsLinkModalOpen(false);
                                        setIsSelectModalOpen(true);
                                    }}
                                    className="text-slate-400 hover:text-slate-600 transition cursor-pointer p-1 rounded-lg hover:bg-slate-50 -ml-1 mt-0.5 shrink-0"
                                    title="Quay lại"
                                >
                                    <ArrowLeft className="size-4" />
                                </button>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-black text-slate-800">Nhập liên kết tệp PDF</h3>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Đường dẫn liên kết (Link PDF)</label>
                                <input
                                    type="text"
                                    value={tempLink}
                                    onChange={(e) => setTempLink(e.target.value)}
                                    placeholder="https://example.com/document.pdf"
                                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:border-wine bg-white"
                                    autoFocus
                                />
                            </div>

                            <div className="flex items-center gap-2.5 mt-2 w-full">
                                <button
                                    type="button"
                                    onClick={() => setIsLinkModalOpen(false)}
                                    className="w-1/3 bg-slate-50 border border-slate-200 text-slate-600 py-2.5 text-xs font-bold rounded-xl active:scale-[0.98] transition cursor-pointer text-center hover:bg-brand-500 hover:text-white hover:border-brand-500"
                                >
                                    Hủy
                                </button>
                                <Button
                                    onClick={() => {
                                        setPdfUrl(tempLink);
                                        setFile(null);
                                        setReadingType("pdf");
                                        setIsLinkModalOpen(false);
                                    }}
                                    className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white border-none py-2.5 text-xs font-black rounded-xl active:scale-[0.98] transition cursor-pointer text-center"
                                >
                                    Xác nhận
                                </Button>
                            </div>
                        </Dialog>
                    </CustomModal.Content>
                </CustomModal.Root>
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
                        setPdfUrl("");
                        setReadingType("pdf");
                    }
                }}
            />
        </div>
    );
}


function QuizConfigTab({
    quizId,
    setQuizId,
    quizzes,
    onDelete,
}: {
    quizId: string;
    setQuizId: (id: string) => void;
    quizzes: any[];
    onDelete?: () => void;
}) {
    const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
    const [tempQuizId, setTempQuizId] = useState(quizId);
    const [modalSearchTerm, setModalSearchTerm] = useState("");

    const selectedQuiz = quizzes.find((q) => q.id === quizId);

    useEffect(() => {
        setTempQuizId(quizId);
    }, [quizId]);

    const filteredQuizzes = quizzes.filter((q) => {
        const title = (q.title || "").toLowerCase();
        const id = (q.id || "").toLowerCase();
        const search = modalSearchTerm.toLowerCase();
        return title.includes(search) || id.includes(search);
    });

    return (
        <div className="flex flex-col gap-4 flex-1 min-h-0">
            <div className={`flex flex-col gap-1.5 relative ${quizId !== "" ? "" : "flex-1 min-h-0"}`}>
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">{UI_TEXT.learningMaterials.labelQuizSelect}</label>
                    {quizId !== "" && (
                        <button
                            type="button"
                            onClick={() => {
                                setTempQuizId(quizId);
                                setModalSearchTerm("");
                                setIsSelectModalOpen(true);
                            }}
                            className="text-slate-400 hover:text-blue-500 transition cursor-pointer p-0.5 rounded"
                            title="Thay đổi bài tập (quiz)"
                        >
                            <Repeat className="size-4" />
                        </button>
                    )}
                </div>

                {quizId !== "" ? (
                    /* Linked Quiz display */
                    <div className="flex flex-col gap-3 w-full animate-fadeIn">
                        <div className="rounded-xl p-4 bg-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                                    <HelpCircle className="size-4" />
                                </span>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-800 line-clamp-1">
                                        {selectedQuiz ? selectedQuiz.title : `${UI_TEXT.learningMaterials.defaultQuizTitlePrefix} ${quizId}`}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-semibold">
                                        {UI_TEXT.learningMaterials.linkedQuizSub}
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setTempQuizId(quizId);
                                    setModalSearchTerm("");
                                    setIsSelectModalOpen(true);
                                }}
                                className="text-xs text-blue-600 hover:text-blue-700 font-bold transition cursor-pointer"
                            >
                                {UI_TEXT.learningMaterials.changeQuizButton}
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Centered Empty State View for Quiz */
                    <div className="flex flex-col flex-1 items-center justify-center p-8 py-14 border border-dashed border-slate-200 rounded-2xl bg-slate-50/30 text-center gap-4 animate-fadeIn">
                        <div className="flex size-16 items-center justify-center rounded-full border-2 border-dashed border-slate-200 bg-white text-slate-400">
                            <HelpCircle className="size-6 text-slate-400" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h4 className="text-sm font-black text-slate-800">{UI_TEXT.learningMaterials.emptyQuizTitle}</h4>
                            <p className="text-xs text-slate-400 font-semibold max-w-[320px] leading-relaxed">
                                {UI_TEXT.learningMaterials.emptyQuizDesc}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setTempQuizId("");
                                setModalSearchTerm("");
                                setIsSelectModalOpen(true);
                            }}
                            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-black py-2 px-6 rounded-xl transition duration-150 cursor-pointer"
                        >
                            {UI_TEXT.learningMaterials.addQuizButton}
                        </button>
                    </div>
                )}
            </div>

            {/* Custom Modal to choose Quiz as Table */}
            <CustomModal.Root open={isSelectModalOpen} onOpenChange={setIsSelectModalOpen}>
                <CustomModal.Content className="max-w-2xl !rounded-[20px] w-full">
                    <Dialog className="bg-white p-6 rounded-[20px] flex flex-col gap-4 outline-none shadow-2xl relative max-h-[85vh]">
                        <div className="text-center">
                            <h3 className="text-sm font-black text-slate-800">{UI_TEXT.learningMaterials.linkQuizModalTitle}</h3>
                            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{UI_TEXT.learningMaterials.linkQuizModalDesc}</p>
                        </div>

                        {/* Search Box */}
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-slate-200 font-semibold text-slate-700 placeholder-slate-400"
                                placeholder={UI_TEXT.learningMaterials.quizSearchPlaceholder}
                                value={modalSearchTerm}
                                onChange={(e) => setModalSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Scrollable Table View */}
                        <div className="overflow-x-auto border border-slate-100 rounded-xl max-h-[350px] overflow-y-auto custom-scrollbar-gray">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                        <th className="py-2.5 px-4 w-12 text-center">{UI_TEXT.learningMaterials.tableHeaderSelect}</th>
                                        <th className="py-2.5 px-4">{UI_TEXT.learningMaterials.tableHeaderTitle}</th>
                                        <th className="py-2.5 px-4">{UI_TEXT.learningMaterials.tableHeaderDate}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredQuizzes.length > 0 ? (
                                        filteredQuizzes.map((q) => {
                                            const isSelected = q.id === tempQuizId;
                                            return (
                                                <tr
                                                    key={q.id}
                                                    onClick={() => setTempQuizId(q.id)}
                                                    className={`hover:bg-slate-50/40 transition cursor-pointer text-xs font-semibold text-slate-700 ${isSelected ? "bg-wine/5" : ""
                                                        }`}
                                                >
                                                    <td className="py-2.5 px-4 text-center">
                                                        <div className="flex items-center justify-center">
                                                            <div className={`size-4 rounded-full border flex items-center justify-center transition ${isSelected ? "border-wine bg-white" : "border-slate-200 bg-white"
                                                                }`}>
                                                                {isSelected && <div className="size-2 rounded-full bg-wine" />}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-2.5 px-4 text-slate-800 font-bold truncate max-w-xs">{q.title || "—"}</td>
                                                    <td className="py-2.5 px-4 text-slate-400 text-[10px]">
                                                        {q.createdAt ? new Date(q.createdAt).toLocaleDateString("vi-VN") : "—"}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="text-center py-8 text-xs text-slate-400 font-semibold">
                                                {UI_TEXT.learningMaterials.emptyQuizDesc}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex w-full gap-3 mt-2">
                            <button
                                type="button"
                                onClick={() => setIsSelectModalOpen(false)}
                                className="w-1/3 bg-slate-50 border border-slate-200 text-slate-600 py-2.5 text-xs font-bold rounded-xl active:scale-[0.98] transition-all duration-150 cursor-pointer text-center hover:bg-brand-500 hover:text-white hover:border-brand-500"
                            >
                                {UI_TEXT.courseDetail.cancelButton}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setQuizId(tempQuizId);
                                    setIsSelectModalOpen(false);
                                }}
                                disabled={!tempQuizId}
                                className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white border-none py-2.5 text-xs font-black rounded-xl active:scale-[0.98] transition-all duration-150 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed disabled:scale-100 shadow-md shadow-blue-500/10 text-center"
                            >
                                {UI_TEXT.courseDetail.confirmButton}
                            </button>
                        </div>
                    </Dialog>
                </CustomModal.Content>
            </CustomModal.Root>
        </div>
    );
}

function getEmbeddableUrl(url: string): { embedUrl: string; canEmbed: boolean } {
    if (!url) return { embedUrl: "", canEmbed: false };

    // Google Drive file view
    const driveFileRegex = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
    if (driveFileRegex.test(url)) {
        const match = url.match(driveFileRegex);
        if (match && match[1]) {
            return {
                embedUrl: `https://drive.google.com/file/d/${match[1]}/preview`,
                canEmbed: true
            };
        }
    }

    // Google Docs view/edit
    const googleDocRegex = /https:\/\/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/;
    if (googleDocRegex.test(url)) {
        const match = url.match(googleDocRegex);
        if (match && match[1]) {
            return {
                embedUrl: `https://docs.google.com/document/d/${match[1]}/preview`,
                canEmbed: true
            };
        }
    }

    // If it's a PDF link or S3 PDF link
    if (url.toLowerCase().endsWith(".pdf") || url.toLowerCase().includes(".pdf")) {
        return { embedUrl: url, canEmbed: true };
    }

    // Otherwise, normal websites (e.g. app.xmind.com, external drive folder links, v.v.) are likely not embeddable
    return { embedUrl: url, canEmbed: false };
}

function SessionViewerWrapper({
    session,
    activeTab,
    onChangeTab,
}: {
    session?: Session;
    activeTab: "mindmap" | "pdf" | "srs";
    onChangeTab: (tab: "mindmap" | "pdf" | "srs") => void;
}) {
    if (!session) return null;

    const hasMindmap = !!session.mindmap;
    const hasPdf = !!session.pdf;
    const hasSrs = !!session.srs;

    const noResources = !hasMindmap && !hasPdf && !hasSrs;

    return (
        <div className="flex flex-col gap-4 flex-1 min-h-0 h-full">
            {/* Header */}
            <div className="border-b border-slate-100 pb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
                <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {activeTab === "mindmap" && "Xem Mindmap chương"}
                        {activeTab === "pdf" && "Xem tài liệu PDF chương"}
                        {activeTab === "srs" && "Xem tài liệu SRS chương"}
                    </span>
                    <h3 className="text-base font-extrabold text-blue-500 mt-0.5">{session.name}</h3>
                </div>

                {/* Tabs switcher - only display configured tabs */}
                {!noResources && (
                    <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl">
                        {hasMindmap && (
                            <button
                                onClick={() => onChangeTab("mindmap")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${activeTab === "mindmap"
                                    ? "bg-white text-slate-800 shadow-sm"
                                    : "text-slate-500 hover:text-slate-800"
                                    }`}
                            >
                                Mindmap
                            </button>
                        )}
                        {hasPdf && (
                            <button
                                onClick={() => onChangeTab("pdf")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${activeTab === "pdf"
                                    ? "bg-white text-slate-800 shadow-sm"
                                    : "text-slate-500 hover:text-slate-800"
                                    }`}
                            >
                                Tài liệu PDF
                            </button>
                        )}
                        {hasSrs && (
                            <button
                                onClick={() => onChangeTab("srs")}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${activeTab === "srs"
                                    ? "bg-white text-slate-800 shadow-sm"
                                    : "text-slate-500 hover:text-slate-800"
                                    }`}
                            >
                                SRS
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col gap-4">
                {noResources ? (
                    <div className="flex flex-col flex-1 items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/30 text-center gap-2 p-8 animate-fadeIn">
                        <Map className="size-8 text-slate-300" />
                        <h4 className="text-xs font-bold text-slate-800">Chương này chưa được cấu hình học liệu (Mindmap, PDF, SRS)</h4>
                    </div>
                ) : activeTab === "mindmap" && hasMindmap ? (
                    <div className="flex flex-col flex-1 h-full min-h-0 animate-fadeIn">
                        {(() => {
                            const embedInfo = getEmbeddableUrl(session.mindmap || "");
                            return embedInfo.canEmbed ? (
                                <div className="flex flex-col gap-3 flex-1 h-full">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-slate-400 font-semibold truncate max-w-[400px]">
                                            Đường dẫn: <a href={session.mindmap} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{session.mindmap}</a>
                                        </span>
                                        <a
                                            href={session.mindmap}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-black py-1.5 px-3 rounded-lg transition duration-150 cursor-pointer"
                                        >
                                            Mở trong tab mới <ExternalLink className="size-3" />
                                        </a>
                                    </div>
                                    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white w-full flex-1 shadow-sm">
                                        <iframe
                                            src={embedInfo.embedUrl}
                                            className="w-full h-full border-none"
                                            title="Mindmap preview"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col flex-1 items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/30 text-center gap-4 p-8">
                                    <div className="flex size-16 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400">
                                        <Map className="size-7 text-slate-400" />
                                    </div>
                                    <div className="flex flex-col gap-1 max-w-[360px]">
                                        <h4 className="text-sm font-black text-slate-800">Không hỗ trợ hiển thị trực tiếp Mindmap</h4>
                                        <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                                            Để bảo mật, liên kết này không cho phép nhúng xem trực tiếp bên trong trang. Bạn có thể xem bằng cách mở trực tiếp:
                                        </p>
                                    </div>
                                    <a
                                        href={session.mindmap}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-black py-2.5 px-6 rounded-xl transition duration-150 cursor-pointer shadow-md shadow-blue-500/20"
                                    >
                                        Mở liên kết Mindmap <ExternalLink className="size-3.5" />
                                    </a>
                                </div>
                            );
                        })()}
                    </div>
                ) : activeTab === "pdf" && hasPdf ? (
                    <div className="flex flex-col flex-1 h-full min-h-0 animate-fadeIn">
                        {(() => {
                            const embedInfo = getEmbeddableUrl(session.pdf || "");
                            return embedInfo.canEmbed ? (
                                <div className="flex flex-col gap-3 flex-1 h-full">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-slate-400 font-semibold truncate max-w-[400px]">
                                            Đường dẫn: <a href={session.pdf} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{session.pdf}</a>
                                        </span>
                                        <a
                                            href={session.pdf}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-black py-1.5 px-3 rounded-lg transition duration-150 cursor-pointer"
                                        >
                                            Mở trong tab mới <ExternalLink className="size-3" />
                                        </a>
                                    </div>
                                    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white w-full flex-1 shadow-sm">
                                        <iframe
                                            src={embedInfo.embedUrl}
                                            className="w-full h-full border-none"
                                            title="PDF preview"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col flex-1 items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/30 text-center gap-4 p-8">
                                    <div className="flex size-16 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400">
                                        <FileText className="size-7 text-slate-400" />
                                    </div>
                                    <div className="flex flex-col gap-1 max-w-[360px]">
                                        <h4 className="text-sm font-black text-slate-800">Không hỗ trợ hiển thị trực tiếp tài liệu PDF</h4>
                                        <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                                            Để bảo mật, liên kết này không cho phép nhúng xem trực tiếp bên trong trang. Bạn có thể xem bằng cách mở trực tiếp:
                                        </p>
                                    </div>
                                    <a
                                        href={session.pdf}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-black py-2.5 px-6 rounded-xl transition duration-150 cursor-pointer shadow-md shadow-blue-500/20"
                                    >
                                        Mở liên kết tài liệu PDF <ExternalLink className="size-3.5" />
                                    </a>
                                </div>
                            );
                        })()}
                    </div>
                ) : activeTab === "srs" && hasSrs ? (
                    <div className="flex flex-col flex-1 h-full min-h-0 animate-fadeIn">
                        {(() => {
                            const embedInfo = getEmbeddableUrl(session.srs || "");
                            return embedInfo.canEmbed ? (
                                <div className="flex flex-col gap-3 flex-1 h-full">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-slate-400 font-semibold truncate max-w-[400px]">
                                            Đường dẫn: <a href={session.srs} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{session.srs}</a>
                                        </span>
                                        <a
                                            href={session.srs}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-black py-1.5 px-3 rounded-lg transition duration-150 cursor-pointer"
                                        >
                                            Mở trong tab mới <ExternalLink className="size-3" />
                                        </a>
                                    </div>
                                    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white w-full flex-1 shadow-sm">
                                        <iframe
                                            src={embedInfo.embedUrl}
                                            className="w-full h-full border-none"
                                            title="SRS preview"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col flex-1 items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/30 text-center gap-4 p-8">
                                    <div className="flex size-16 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400">
                                        <ScrollText className="size-7 text-slate-400" />
                                    </div>
                                    <div className="flex flex-col gap-1 max-w-[360px]">
                                        <h4 className="text-sm font-black text-slate-800">Không hỗ trợ hiển thị trực tiếp tài liệu SRS</h4>
                                        <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                                            Để bảo mật, liên kết này không cho phép nhúng xem trực tiếp bên trong trang. Bạn có thể xem bằng cách mở trực tiếp:
                                        </p>
                                    </div>
                                    <a
                                        href={session.srs}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-black py-2.5 px-6 rounded-xl transition duration-150 cursor-pointer shadow-md shadow-blue-500/20"
                                    >
                                        Mở liên kết tài liệu SRS <ExternalLink className="size-3.5" />
                                    </a>
                                </div>
                            );
                        })()}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
