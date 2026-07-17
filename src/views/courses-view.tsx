/* eslint-disable no-restricted-syntax, react/jsx-no-literals */
"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, ChevronRight, File, FileText, FolderPlus, HelpCircle, Plus, Video } from "lucide-react";
import type { Route } from "next";
import { usePathname, useSearchParams } from "next/navigation";
import { LessonMaterialModal } from "@/components/application/modals/lesson-material-modal";
import { Button } from "@/components/base/buttons/button";
import { useAppRouter } from "@/hooks/use-app-router";
import { createLesson, createSession, getCoursesBySystem, getLessonsBySession, getSessionsByCourse } from "@/services/material.service";
import { getSystemsList } from "@/services/system.service";
import { toast } from "@/services/toast.service";
import type { Lesson, Session } from "@/types/material.types";

export function CoursesView() {
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const router = useAppRouter();
    const pathname = usePathname();

    const systemIdParam = searchParams.get("systemId") || "";
    const courseIdParam = searchParams.get("courseId") || "";

    const [selectedSystemId, setSelectedSystemId] = useState(systemIdParam);
    const [selectedCourseId, setSelectedCourseId] = useState(courseIdParam);
    const [expandedSessionId, setExpandedSessionId] = useState("");

    // Sync URL params to state
    useEffect(() => {
        if (systemIdParam && systemIdParam !== selectedSystemId) {
            setSelectedSystemId(systemIdParam);
        }
    }, [systemIdParam, selectedSystemId]);

    useEffect(() => {
        if (courseIdParam && courseIdParam !== selectedCourseId) {
            setSelectedCourseId(courseIdParam);
        }
    }, [courseIdParam, selectedCourseId]);

    // Modal state
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);

    const { data: systems = [] } = useQuery({
        queryKey: ["systems"],
        queryFn: getSystemsList,
    });

    const { data: courses = [] } = useQuery({
        queryKey: ["courses", selectedSystemId],
        queryFn: () => getCoursesBySystem(selectedSystemId),
        enabled: !!selectedSystemId,
    });

    const { data: sessions = [], isLoading: loadingSessions } = useQuery({
        queryKey: ["sessions", selectedCourseId],
        queryFn: () => getSessionsByCourse(selectedCourseId),
        enabled: !!selectedCourseId,
    });

    useEffect(() => {
        if (sessions.length > 0 && !expandedSessionId) {
            setExpandedSessionId(sessions[0].id);
        }
    }, [sessions, expandedSessionId]);

    const addSessionMutation = useMutation({
        mutationFn: (name: string) => createSession({ name, courseId: selectedCourseId }),
        onSuccess: () => {
            toast.success("Thành công", "Đã thêm buổi học mới");
            queryClient.invalidateQueries({ queryKey: ["sessions", selectedCourseId] });
        },
    });

    const handleSystemChange = (systemId: string) => {
        setSelectedSystemId(systemId);
        setSelectedCourseId("");
        const params = new URLSearchParams(window.location.search);
        if (systemId) {
            params.set("systemId", systemId);
        } else {
            params.delete("systemId");
        }
        params.delete("courseId");
        router.replace(`${pathname}?${params.toString()}` as Route);
    };

    const handleCourseChange = (courseId: string) => {
        setSelectedCourseId(courseId);
        const params = new URLSearchParams(window.location.search);
        if (courseId) {
            params.set("courseId", courseId);
        } else {
            params.delete("courseId");
        }
        router.replace(`${pathname}?${params.toString()}` as Route);
    };

    const handleAddSession = () => {
        const name = prompt("Nhập tên buổi học mới (Session name):");
        if (name) addSessionMutation.mutate(name);
    };

    return (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Sidebar filter: Select system & course */}
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4.5 shadow-xs lg:col-span-4">
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Hệ đào tạo</label>
                    <select
                        value={selectedSystemId}
                        onChange={(e) => handleSystemChange(e.target.value)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none"
                    >
                        <option value="">Chọn hệ...</option>
                        {systems.map((sys) => (
                            <option key={sys.id} value={sys.id}>
                                {sys.name}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedSystemId && (
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Danh sách môn học</label>
                        <div className="flex max-h-[350px] flex-col gap-1.5 overflow-y-auto pr-1">
                            {courses.map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => handleCourseChange(c.id)}
                                    className={`flex w-full cursor-pointer items-center justify-between rounded-lg border p-3 text-left text-xs transition ${
                                        selectedCourseId === c.id
                                            ? "border-wine bg-wine/5 font-bold text-wine"
                                            : "border-slate-50 text-slate-700 hover:bg-slate-50"
                                    }`}
                                >
                                    <span>{c.name}</span>
                                    <span className="font-mono text-[10px] text-slate-400 uppercase">{c.courseCode}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Sessions & Lessons tree */}
            <div className="flex flex-col gap-6 rounded-2xl border border-slate-100 bg-white p-4.5 shadow-xs lg:col-span-8">
                {selectedCourseId ? (
                    <>
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-base font-black text-slate-800">Khung chương trình học</h3>
                                <p className="mt-0.5 text-xs font-semibold text-slate-400">Tạo buổi, bài học và gán tài liệu</p>
                            </div>
                            <Button
                                onClick={handleAddSession}
                                className="gap-1.5 border-none bg-wine py-1.5 text-xs text-white"
                                iconLeading={<FolderPlus className="size-4" />}
                            >
                                Buổi học (Session)
                            </Button>
                        </div>

                        <div className="flex max-h-[500px] flex-col gap-3 overflow-y-auto">
                            {loadingSessions ? (
                                <div className="mx-auto my-6 size-6 animate-spin rounded-full border-2 border-slate-200 border-t-wine" />
                            ) : sessions.length === 0 ? (
                                <p className="py-8 text-center text-xs text-slate-400 italic">Chưa có buổi học nào</p>
                            ) : (
                                sessions.map((ses) => (
                                    <SessionAccordion
                                        key={ses.id}
                                        session={ses}
                                        isExpanded={expandedSessionId === ses.id}
                                        onToggle={() => setExpandedSessionId(expandedSessionId === ses.id ? "" : ses.id)}
                                        onConfigureMaterial={(les) => {
                                            setSelectedLesson(les);
                                            setIsMaterialModalOpen(true);
                                        }}
                                    />
                                ))
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 p-12 text-center">
                        <BookOpen className="size-10 text-slate-200" />
                        <p className="text-sm font-black text-slate-500">Vui lòng chọn môn học ở thanh lọc bên trái</p>
                    </div>
                )}
            </div>

            {/* Material Config Modal */}
            {isMaterialModalOpen && selectedLesson && (
                <LessonMaterialModal
                    isOpen={isMaterialModalOpen}
                    onClose={() => {
                        setIsMaterialModalOpen(false);
                        setSelectedLesson(null);
                    }}
                    lesson={selectedLesson}
                />
            )}
        </div>
    );
}

function SessionAccordion({
    session,
    isExpanded,
    onToggle,
    onConfigureMaterial,
}: {
    session: Session;
    isExpanded: boolean;
    onToggle: () => void;
    onConfigureMaterial: (lesson: Lesson) => void;
}) {
    const queryClient = useQueryClient();

    const { data: lessons = [], isLoading } = useQuery({
        queryKey: ["lessons", session.id],
        queryFn: () => getLessonsBySession(session.id),
        enabled: isExpanded,
    });

    const addLessonMutation = useMutation({
        mutationFn: (name: string) => createLesson({ name, sessionId: session.id }),
        onSuccess: () => {
            toast.success("Thành công", "Đã thêm bài học mới");
            queryClient.invalidateQueries({ queryKey: ["lessons", session.id] });
        },
    });

    const handleAddLesson = (e: React.MouseEvent) => {
        e.stopPropagation();
        const name = prompt("Nhập tên bài học mới (Lesson name):");
        if (name) addLessonMutation.mutate(name);
    };

    return (
        <div className="shadow-xxs overflow-hidden rounded-2xl border border-slate-100">
            <button
                onClick={onToggle}
                className="flex w-full cursor-pointer items-center justify-between bg-slate-50/50 px-4 py-3.5 text-sm font-black text-slate-700 hover:bg-slate-50"
            >
                <div className="flex items-center gap-2">
                    <ChevronRight className={`size-4 text-slate-400 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                    <span>{session.name}</span>
                </div>
                <button
                    onClick={handleAddLesson}
                    className="text-xxs flex cursor-pointer items-center gap-1 rounded-lg border border-wine/20 bg-white px-2.5 py-1 font-bold text-wine hover:text-wine-deep"
                >
                    <Plus className="size-3" />
                    <span>Bài học</span>
                </button>
            </button>

            {isExpanded && (
                <div className="flex flex-col gap-2 border-t border-slate-50 bg-white p-3">
                    {isLoading ? (
                        <div className="mx-auto my-2 size-4 animate-spin rounded-full border-2 border-slate-100 border-t-wine" />
                    ) : lessons.length === 0 ? (
                        <p className="py-2 text-center text-[11px] text-slate-400 italic">Không có bài học nào trong buổi này</p>
                    ) : (
                        lessons.map((les) => (
                            <div
                                key={les.id}
                                onClick={() => onConfigureMaterial(les)}
                                className="group flex cursor-pointer items-center justify-between rounded-xl border border-slate-50 p-3 transition hover:border-wine/20 hover:bg-wine/[0.01]"
                            >
                                <div className="flex items-center gap-2">
                                    <FileText className="size-4 text-slate-400 group-hover:text-wine" />
                                    <span className="text-xs font-semibold text-slate-800 group-hover:text-wine-deep">{les.name}</span>
                                </div>
                                <div className="flex gap-2">
                                    {les.videoUrl && (
                                        <span title="Đã có video">
                                            <Video className="size-3.5 text-blue-500" />
                                        </span>
                                    )}
                                    {les.pdf && (
                                        <span title="Đã có bài đọc PDF">
                                            <File className="size-3.5 text-green-500" />
                                        </span>
                                    )}
                                    {les.quizId && (
                                        <span title="Đã gán Quiz">
                                            <HelpCircle className="size-3.5 text-amber-500" />
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
