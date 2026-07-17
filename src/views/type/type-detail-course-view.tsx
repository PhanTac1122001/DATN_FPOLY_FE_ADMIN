"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Book, ChevronRight, ChevronDown, File, FileText, Film, HelpCircle, Eye, Play, Plus, ScrollText, Video, Trash2, GripVertical, X, Search, CheckCircle2, Circle } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Button } from "@/components/base/buttons/button";
import { createLesson, createSession, getCoursesBySystem, getLessonsBySession, getSessionsByCourse, configureLessonVideo, configureLessonReading, linkLessonQuiz, getQuizzesList, getLessonDetails, deleteLesson, updateSession, updateLesson } from "@/services/material.service";
import { getSystemsList } from "@/services/system.service";
import { toast } from "@/services/toast.service";
import type { Lesson, Session } from "@/types/material.types";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { TiptapEditor } from "@/components/base/editor";

interface TypeDetailCourseViewProps {
    id: string;
    courseId: string;
}

export function TypeDetailCourseView({ id, courseId }: TypeDetailCourseViewProps) {
    const queryClient = useQueryClient();

    const [selectedLessonId, setSelectedLessonId] = useState("");
    const [selectedTab, setSelectedTab] = useState<"video" | "reading" | "quiz">("video");
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

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
        mutationFn: (name: string) => createSession({ name, courseId }),
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

    const handleAddSession = () => {
        const name = prompt("Nhập tên chương học mới (Chapter name):");
        if (name) addSessionMutation.mutate(name);
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
                                <p className="text-xs font-extrabold text-[#A14747]">Chưa có chương học nào.</p>
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
                                        selectedTab={selectedTab}
                                        onSelectLesson={(lessonId, tab) => {
                                            setSelectedLessonId(lessonId);
                                            setSelectedTab(tab);
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right panel: Cấu hình bài học */}
                <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs lg:col-span-8 min-[1440px]:col-span-9 h-fit max-h-full overflow-hidden self-start">
                    {sessions.length === 0 ? (
                        <div className="flex flex-1 flex-col items-center justify-center p-12 py-20 text-center">
                            <div className="flex size-14 items-center justify-center rounded-full border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400">
                                <Play className="size-5.5 text-slate-300 ml-0.5" />
                            </div>
                            <p className="mt-4 text-[12.5px] font-bold text-slate-400 max-w-[340px] leading-relaxed">
                                Cấu trúc khóa học rỗng. Vui lòng bấm &ldquo;Thêm chương&rdquo; để bắt đầu.
                            </p>
                        </div>
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
                    setIsExpanded(!isExpanded);
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
                    {isExpanded ? (
                        <ChevronDown className="size-3 text-slate-400 shrink-0" />
                    ) : (
                        <ChevronRight className="size-3 text-slate-400 shrink-0" />
                    )}
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
                        <HelpCircle className="size-3.5 shrink-0" />
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
    selectedTab,
    onSelectLesson,
}: {
    session: Session;
    index: number;
    selectedLessonId: string;
    selectedTab: "video" | "reading" | "quiz";
    onSelectLesson: (id: string, tab: "video" | "reading" | "quiz") => void;
}) {
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [draggedLessonIndex, setDraggedLessonIndex] = useState<number | null>(null);

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
        const name = prompt("Nhập tên bài học mới (Lesson name):");
        if (name) addLessonMutation.mutate(name);
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
        <div className="flex flex-col gap-1.5 border border-slate-100 rounded-xl p-3 bg-slate-50/30">
            {/* Session Header */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 min-w-0 flex-1">
                    <div className="cursor-grab active:cursor-grabbing p-0.5 text-slate-300 hover:text-slate-500 transition shrink-0" title="Kéo thả để di chuyển">
                        <GripVertical className="size-3" />
                    </div>
                    <div
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-2 cursor-pointer select-none group min-w-0 flex-1"
                    >
                        {isOpen ? (
                            <ChevronDown className="size-3.5 text-slate-400 shrink-0" />
                        ) : (
                            <ChevronRight className="size-3.5 text-slate-400 shrink-0" />
                        )}
                        <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Chương {index + 1}</span>
                            <h4 className="text-xs font-extrabold text-slate-700 truncate leading-snug group-hover:text-blue-600 transition">
                                {session.name}
                            </h4>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleAddLesson}
                    title="Thêm bài học"
                    className="flex size-6 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-wine hover:bg-wine/5 hover:text-wine shrink-0"
                >
                    <Plus className="size-3.5" />
                </button>
            </div>

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
        </div>
    );
}

/* Wrapper for loading specific lesson details and managing config tabs in the right column */
function LessonEditorWrapper({
    lessonId,
    quizzes,
    activeTab,
}: {
    lessonId: string;
    quizzes: any[];
    activeTab: "video" | "reading" | "quiz";
}) {
    const [localLesson, setLocalLesson] = useState<Lesson | null>(null);

    // Lifted Form States
    const [videoUrl, setVideoUrl] = useState("");
    const [videoDuration, setVideoDuration] = useState(0);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoQuestions, setVideoQuestions] = useState<any[]>([]);

    const [readingContent, setReadingContent] = useState("");
    const [readingFile, setReadingFile] = useState<File | null>(null);

    const [quizId, setQuizId] = useState("");

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
        }
    }, [lessonDetails]);

    const handleSave = (updated: Lesson) => {
        setLocalLesson(updated);
        // Invalidate cache for session lessons to trigger reload of indicators
        if (updated.sessionId) {
            const queryClient = useQueryClient();
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
            const isReadingDirty =
                readingContent !== (lessonDetails?.reading?.content || "") ||
                readingFile !== null;

            if (isReadingDirty) {
                const readingFd = new FormData();
                if (readingFile) readingFd.append("file", readingFile);
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
        <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
            {/* Header */}
            <div className="border-b border-slate-100  sticky top-0 bg-white z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {activeTab === "video" && "Cấu hình Video"}
                        {activeTab === "reading" && "Cấu hình Tài liệu / Bài đọc"}
                        {activeTab === "quiz" && "Cấu hình Bài tập (Quiz)"}
                    </span>
                    <h3 className="text-base font-extrabold text-blue-500 mt-0.5">{localLesson.name}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {!(activeTab === "video" && !videoUrl && !videoFile) && (
                        <Button
                            onClick={handleSaveAll}
                            isLoading={isSaving}
                            className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white border-none py-2 px-5 rounded-xl text-xs font-black transition-all duration-150 cursor-pointer shadow-md shadow-blue-500/25"
                        >
                            Lưu bài học
                        </Button>
                    )}
                </div>
            </div>

            {/* Video Config Section */}
            {activeTab === "video" && (
                <div className="flex flex-col gap-4">
                    <VideoConfigTab
                        url={videoUrl}
                        setUrl={setVideoUrl}
                        duration={videoDuration}
                        setDuration={setVideoDuration}
                        file={videoFile}
                        setFile={setVideoFile}
                        questions={videoQuestions}
                        setQuestions={setVideoQuestions}
                    />
                </div>
            )}

            {/* Quiz Config Section */}
            {activeTab === "quiz" && (
                <QuizConfigTab
                    quizId={quizId}
                    setQuizId={setQuizId}
                    quizzes={quizzes}
                />
            )}

            {/* Reading Config Section */}
            {activeTab === "reading" && (
                <div className="flex flex-col gap-4">
                    <ReadingConfigTab
                        content={readingContent}
                        setContent={setReadingContent}
                        file={readingFile}
                        setFile={setReadingFile}
                    />
                </div>
            )}
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
}: {
    url: string;
    setUrl: (u: string) => void;
    duration: number;
    setDuration: (d: number) => void;
    file: File | null;
    setFile: (f: File | null) => void;
    questions: any[];
    setQuestions: (q: any[]) => void;
}) {
    const [videoType, setVideoType] = useState<"link" | "file" | "">("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
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

        const initPlayer = () => {
            if (isDestroyed) return;
            const YT = (window as any).YT;
            if (YT && YT.Player) {
                try {
                    player = new YT.Player("youtube-preview-player", {
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
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-slate-800">Video</label>

                {hasVideo ? (
                    /* Video Preview Player (Image 2) */
                    <div className="flex flex-col gap-3">
                        <div className="rounded-xl overflow-hidden bg-slate-950 shadow-inner w-full aspect-video flex flex-col justify-center relative">
                            {youtubeId ? (
                                <div id="youtube-preview-player" className="w-full h-full" />
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
                            <button
                                type="button"
                                onClick={() => {
                                    setUrl("");
                                    setFile(null);
                                    setVideoType("");
                                }}
                                className="text-xs text-red-500 hover:text-red-700 font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                                Thay đổi video / Xóa
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Dropdown Select to choose video input method (Image 3) */
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full flex items-center justify-between rounded-lg border border-slate-200 px-3.5 py-2 text-xs bg-white text-slate-700 hover:border-slate-300 transition duration-150 cursor-pointer shadow-xxs font-semibold"
                        >
                            <span>Chọn</span>
                            <ChevronDown className="size-4 text-slate-400" />
                        </button>

                        {isDropdownOpen && (
                            <>
                                {/* Transparent backdrop to close dropdown on click outside */}
                                <div
                                    className="fixed inset-0 z-20 cursor-default"
                                    onClick={() => setIsDropdownOpen(false)}
                                />
                                <div className="absolute top-full left-0 right-0 mt-1 z-30 rounded-xl border border-slate-100 bg-white p-1 shadow-md flex flex-col gap-0.5 animate-fadeIn">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setVideoType("link");
                                            setIsDropdownOpen(false);
                                            setTempLink(url);
                                            setIsLinkModalOpen(true);
                                        }}
                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs hover:bg-slate-50 transition cursor-pointer relative z-30"
                                    >
                                        <span className="flex size-7 items-center justify-center rounded-full bg-slate-900 text-white shrink-0">
                                            <Play className="size-3 fill-current ml-0.5" />
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800">Video</span>
                                            <span className="text-[10px] text-slate-400 font-semibold">Nhập liên kết bài học</span>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setVideoType("file");
                                            setIsDropdownOpen(false);
                                            fileInputRef.current?.click();
                                        }}
                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs hover:bg-slate-50 transition cursor-pointer relative z-30"
                                    >
                                        <span className="flex size-7 items-center justify-center rounded-full bg-slate-900 text-white shrink-0">
                                            <FileText className="size-3.5" />
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800">Tải tệp lên</span>
                                            <span className="text-[10px] text-slate-400 font-semibold">Chọn file từ máy tính</span>
                                        </div>
                                    </button>
                                </div>
                            </>
                        )}
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
            {isLinkModalOpen && (
                <CustomModal.Root open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
                    <CustomModal.Content className="max-w-md !rounded-[20px] w-full">
                        <Dialog className="bg-white p-5 rounded-[20px] flex flex-col gap-4 outline-none shadow-2xl relative">
                            <div>
                                <h3 className="text-sm font-black text-slate-800">Nhập liên kết bài học</h3>
                                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Nhập liên kết video từ YouTube, S3 hoặc nguồn trực tiếp khác</p>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Đường dẫn liên kết (Link Video)</label>
                                <input
                                    type="text"
                                    value={tempLink}
                                    onChange={(e) => setTempLink(e.target.value)}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:border-wine bg-white"
                                    autoFocus
                                />
                            </div>

                            <div className="flex justify-end gap-2 mt-2">
                                <Button
                                    onClick={() => setIsLinkModalOpen(false)}
                                    className="bg-slate-50 border-slate-200 text-slate-600 px-4 py-2 text-xs font-bold"
                                >
                                    Hủy
                                </Button>
                                <Button
                                    onClick={() => {
                                        setUrl(tempLink);
                                        setIsLinkModalOpen(false);
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white border-none px-4 py-2 text-xs font-black rounded-xl"
                                >
                                    Xác nhận
                                </Button>
                            </div>
                        </Dialog>
                    </CustomModal.Content>
                </CustomModal.Root>
            )}

            {/* Video Questions (always show or show if video type selected/uploaded) */}
            {(hasVideo || videoType !== "") && (
                <div className="pt-4 ">
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-xs font-bold text-slate-500 uppercase">Câu hỏi nhúng trắc nghiệm chặn dòng video</label>
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
}: {
    content: string;
    setContent: (c: string) => void;
    file: File | null;
    setFile: (f: File | null) => void;
}) {
    const [readingType, setReadingType] = useState<"pdf" | "text" | "">("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [openDirection, setOpenDirection] = useState<"up" | "down">("down");
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (file) {
            setReadingType("pdf");
        } else if (content) {
            setReadingType("text");
        } else {
            setReadingType("");
        }
    }, [file, content]);

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
            if (spaceBelow < 185 && spaceAbove > spaceBelow) {
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

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 relative">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">Tài liệu / Bài đọc</label>
                    {readingType !== "" && (
                        <button
                            type="button"
                            onClick={() => {
                                setFile(null);
                                setContent("");
                                setReadingType("");
                            }}
                            className="text-xs text-red-500 hover:text-red-700 font-bold transition cursor-pointer"
                        >
                            Xóa tài liệu
                        </button>
                    )}
                </div>

                {readingType === "pdf" && file ? (
                    /* PDF File chosen display */
                    <div className="rounded-xl p-4 bg-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <span className="flex size-8 items-center justify-center rounded-lg bg-red-50 text-red-600 shrink-0">
                                <FileText className="size-4" />
                            </span>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-800 line-clamp-1">{file.name}</span>
                                <span className="text-[10px] text-slate-400 font-semibold">Tệp PDF học liệu</span>
                            </div>
                        </div>
                    </div>
                ) : readingType === "text" ? (
                    /* Rich Text Content display */
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-col gap-1.5">
                            <TiptapEditor
                                value={content}
                                onChange={setContent}
                                placeholder="Nhập nội dung bài viết..."
                                className="w-full bg-white rounded-lg overflow-hidden border border-slate-200"
                            />
                        </div>
                    </div>
                ) : (
                    /* Dropdown Select to choose reading input method */
                    <div ref={containerRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full flex items-center justify-between rounded-lg border border-slate-200 px-3.5 py-2 text-xs bg-white text-slate-700 hover:border-slate-300 transition duration-150 cursor-pointer shadow-xxs font-semibold"
                        >
                            <span>Chọn</span>
                            <ChevronDown className={`size-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                        </button>

                        {isDropdownOpen && typeof document !== "undefined" && createPortal(
                            <>
                                <div
                                    className="fixed inset-0 z-[9998] cursor-default"
                                    onClick={() => setIsDropdownOpen(false)}
                                />
                                <div
                                    ref={dropdownRef}
                                    style={{
                                        position: "fixed",
                                        left: `${coords.left}px`,
                                        width: `${coords.width}px`,
                                        zIndex: 9999,
                                        ...(openDirection === "up"
                                            ? { bottom: `${window.innerHeight - coords.top + 6}px` }
                                            : { top: `${coords.top + 38}px` }
                                        )
                                    }}
                                    className="rounded-xl border border-slate-100 bg-white p-1 shadow-md flex flex-col gap-0.5 animate-fadeIn"
                                >
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setReadingType("pdf");
                                            setIsDropdownOpen(false);
                                            fileInputRef.current?.click();
                                        }}
                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs hover:bg-slate-50 transition cursor-pointer relative z-30 font-bold"
                                    >
                                        <span className="flex size-7 items-center justify-center rounded-full bg-slate-900 text-white shrink-0">
                                            <FileText className="size-3.5" />
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800">Tải tệp PDF</span>
                                            <span className="text-[10px] text-slate-400 font-semibold">Chọn tệp tài liệu từ máy tính</span>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setReadingType("text");
                                            setIsDropdownOpen(false);
                                        }}
                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs hover:bg-slate-50 transition cursor-pointer relative z-30 font-bold"
                                    >
                                        <span className="flex size-7 items-center justify-center rounded-full bg-slate-900 text-white shrink-0">
                                            <File className="size-3.5" />
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800">Nội dung bài viết</span>
                                            <span className="text-[10px] text-slate-400 font-semibold">Nhập nội dung bài đọc bằng văn bản</span>
                                        </div>
                                    </button>
                                </div>
                            </>,
                            document.body
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
        </div>
    );
}

function SearchableQuizSelect({
    value,
    onChange,
    quizzes,
}: {
    value: string;
    onChange: (val: string) => void;
    quizzes: any[];
}) {
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
            if (spaceBelow < 250 && spaceAbove > spaceBelow) {
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
    const selectedTitle = selectedQuiz ? (selectedQuiz.title || `Bộ đề Quiz ${selectedQuiz.id}`) : "Chọn đề kiểm tra (Quiz)...";

    const filteredQuizzes = quizzes.filter((q) => {
        const title = (q.title || "").toLowerCase();
        const id = (q.id || "").toLowerCase();
        const search = searchTerm.toLowerCase();
        return title.includes(search) || id.includes(search);
    });

    return (
        <div ref={containerRef} className="relative w-full">
            {/* Search Input styled as Select Box */}
            <div className="relative w-full flex items-center border border-slate-200 rounded-xl bg-white focus-within:border-slate-300 transition duration-150 shadow-xxs">
                <Search className="absolute left-3 size-4 text-slate-400 pointer-events-none" />
                <input
                    ref={inputRef}
                    type="text"
                    className={`w-full bg-transparent pl-9 pr-9 py-2.5 text-xs focus:outline-none font-bold placeholder-slate-400 ${!isOpen && value ? "text-slate-900" : "text-slate-700"
                        }`}
                    placeholder={isOpen ? "Gõ để tìm kiếm đề..." : (value ? "" : "Chọn đề kiểm tra (Quiz)...")}
                    value={isOpen ? searchTerm : (value ? selectedTitle : "")}
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
                    className="absolute right-3 p-0.5 hover:bg-slate-50 rounded cursor-pointer flex items-center justify-center"
                >
                    <ChevronDown className={`size-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </button>
            </div>

            {/* Dropdown panel */}
            {isOpen && typeof document !== "undefined" && createPortal(
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
                                ? { bottom: `${window.innerHeight - coords.top + 6}px` }
                                : { top: `${coords.top + 42}px` }
                            )
                        }}
                        className="rounded-xl border border-slate-100 bg-white p-1 shadow-lg flex flex-col gap-0.5 animate-fadeIn"
                    >
                        {/* List items */}
                        <div className="overflow-y-auto flex flex-col gap-0.5 max-h-56 pr-1 custom-scrollbar-gray">
                            <button
                                type="button"
                                onClick={() => {
                                    onChange("");
                                    setIsOpen(false);
                                    setSearchTerm("");
                                }}
                                className="flex w-full items-center rounded-lg px-3 py-2 text-left text-xs text-red-500 hover:bg-red-50 transition cursor-pointer font-bold"
                            >
                                Không liên kết Quiz (Hủy chọn)
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
                                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition cursor-pointer ${isSelected
                                                ? "bg-wine/5 text-wine font-bold"
                                                : "hover:bg-slate-50 text-slate-700 font-semibold"
                                                }`}
                                        >
                                            <span className="truncate">{q.title || `Bộ đề Quiz ${q.id}`}</span>
                                            {isSelected && <span className="size-1.5 rounded-full bg-wine shrink-0 ml-2" />}
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="text-[11px] text-slate-400 font-semibold text-center py-4">
                                    Không tìm thấy đề kiểm tra nào
                                </div>
                            )}
                        </div>
                    </div>
                </>,
                document.body
            )}
        </div>
    );
}

function QuizConfigTab({
    quizId,
    setQuizId,
    quizzes,
}: {
    quizId: string;
    setQuizId: (id: string) => void;
    quizzes: any[];
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-800">Chọn đề kiểm tra (Quiz)</label>
            <SearchableQuizSelect
                value={quizId}
                onChange={setQuizId}
                quizzes={quizzes}
            />
        </div>
    );
}
