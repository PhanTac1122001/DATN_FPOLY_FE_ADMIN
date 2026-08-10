"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { ArrowLeft, Play, Square, Target } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { AdminLayout } from "@/components/layout/admin/admin-layout";
import { Button } from "@/components/base/buttons/button";
import { APP_CONFIG } from "@/constants/app.constants";
import { useAppRouter } from "@/hooks/use-app-router";
import { getClassDetail } from "@/services/class.service";
import { getSessionsByCourse } from "@/services/material.service";
import { getCourseById } from "@/services/course.service";
import { getSessionQuizzes } from "@/services/session-quiz.service";
import {
    getActiveQuizSession,
    startQuizSession,
    stopQuizSession,
    StudentQuizResultItem,
} from "@/services/class-quiz-session.service";
import { toast } from "@/services/toast.service";
import type { ClassEntity } from "@/types/class.types";
import type { SessionQuizItem } from "@/types/session-quiz.types";

export function ClassQuizResultView({ classId }: { classId: string }) {
    const router = useAppRouter();
    const [classData, setClassData] = useState<ClassEntity | null>(null);
    const [subjects, setSubjects] = useState<{ id: string; code: string; title: string; educationProgramId?: string }[]>([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
    const [sessions, setSessions] = useState<{ id: string; title: string }[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string>("");
    const [quizList, setQuizList] = useState<SessionQuizItem[]>([]);
    const [selectedQuizId, setSelectedQuizId] = useState<string>("");

    const [activeSession, setActiveSession] = useState<{ id?: string; _id?: string; status: "IDLE" | "ACTIVE" | "CLOSED" } | null>(null);
    const [results, setResults] = useState<StudentQuizResultItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // Socket state
    useEffect(() => {
        const token = Cookies.get(APP_CONFIG.ACCESS_TOKEN_KEY);
        const socketUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6789";
        const socket: Socket = io(`${socketUrl}/quiz-session`, {
            auth: { token: token ? `Bearer ${token}` : "" },
            transports: ["websocket", "polling"],
        });

        socket.on("connect", () => {
            socket.emit("join_class_room", { classId, isStaff: true });
        });

        socket.on("quiz_result:updated", (data: { studentResult: StudentQuizResultItem }) => {
            if (data?.studentResult) {
                setResults((prev) => {
                    const idx = prev.findIndex(
                        (r) => (r.id || r._id || r.studentId) === (data.studentResult.id || data.studentResult._id || data.studentResult.studentId),
                    );
                    if (idx >= 0) {
                        const updated = [...prev];
                        updated[idx] = data.studentResult;
                        return updated;
                    }
                    return [data.studentResult, ...prev];
                });
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [classId]);

    // Fetch class details and assigned courses/subjects
    useEffect(() => {
        async function loadClassData() {
            try {
                setIsLoading(true);
                const detail = await getClassDetail(classId);
                const cls = detail?.class || null;
                setClassData(cls);

                const assignedCourses = detail?.courses || [];
                const loadedSubjects: { id: string; code: string; title: string; educationProgramId?: string }[] = [];

                for (const cc of assignedCourses) {
                    const rawCourse = cc.courseId;
                    if (rawCourse && typeof rawCourse === "object") {
                        const cId = (rawCourse as any).id || (rawCourse as any)._id;
                        const cCode = (rawCourse as any).courseCode || (rawCourse as any).code || "";
                        const cTitle = (rawCourse as any).title || (rawCourse as any).name || "";
                        if (cId) {
                            loadedSubjects.push({
                                id: String(cId),
                                code: cCode,
                                title: cTitle,
                                educationProgramId: (rawCourse as any).educationProgramId || (cls as any)?.educationProgramId,
                            });
                        }
                    } else if (typeof rawCourse === "string") {
                        try {
                            const course = await getCourseById(rawCourse);
                            if (course) {
                                loadedSubjects.push({
                                    id: course.id,
                                    code: course.code,
                                    title: course.title,
                                    educationProgramId: (course as any).educationProgramId || (cls as any)?.educationProgramId,
                                });
                            }
                        } catch {
                            // ignore
                        }
                    }
                }
                setSubjects(loadedSubjects);
                if (loadedSubjects.length > 0) {
                    setSelectedSubjectId(loadedSubjects[0].id);
                }
            } catch (err) {
                console.error("Error loading class data:", err);
            } finally {
                setIsLoading(false);
            }
        }

        void loadClassData();
    }, [classId]);

    // Load sessions & quizzes when subject changes
    useEffect(() => {
        if (!selectedSubjectId) return;

        async function loadSubjectDetails() {
            try {
                const loadedSessions = await getSessionsByCourse(selectedSubjectId);
                setSessions(
                    (loadedSessions || []).map((s: any, idx: number) => ({
                        id: String(s.id || s._id || idx),
                        title: s.title || s.name || `Session ${idx + 1}`,
                    })),
                );
                if (loadedSessions && loadedSessions.length > 0) {
                    setSelectedSessionId(String(loadedSessions[0].id || (loadedSessions[0] as any)._id));
                } else {
                    setSelectedSessionId("");
                }
            } catch (err) {
                console.error("Error loading subject sessions:", err);
                setSessions([]);
                setSelectedSessionId("");
            }
        }

        void loadSubjectDetails();
    }, [selectedSubjectId]);

    // Load Quizzi sets when subject or session changes
    useEffect(() => {
        if (!selectedSubjectId) return;

        async function loadQuizzes() {
            try {
                const data = await getSessionQuizzes({
                    subjectId: selectedSubjectId,
                    sessionId: selectedSessionId || undefined,
                });
                setQuizList(data.items || []);
                if (data.items && data.items.length > 0) {
                    setSelectedQuizId(data.items[0].id);
                } else {
                    setSelectedQuizId("");
                }
            } catch (err) {
                console.error("Error loading quizzes:", err);
            }
        }

        void loadQuizzes();
    }, [selectedSubjectId, selectedSessionId]);

    // Load active session state & student results
    const fetchSessionState = async () => {
        try {
            const data = await getActiveQuizSession({
                classId,
                subjectId: selectedSubjectId || undefined,
                sessionId: selectedSessionId || undefined,
                quizId: selectedQuizId || undefined,
            });
            setActiveSession(data.session);
            setResults(data.results || []);
        } catch (err) {
            console.error("Error fetching session state:", err);
        }
    };

    useEffect(() => {
        if (classId) {
            void fetchSessionState();
        }
    }, [classId, selectedSubjectId, selectedSessionId, selectedQuizId]);

    const handleStart = async () => {
        if (!selectedQuizId) {
            toast.error("Bắt đầu Quizzi", "Vui lòng chọn bài Quizzi trước khi bắt đầu");
            return;
        }

        const currentSub = subjects.find((s) => s.id === selectedSubjectId);
        const programId = currentSub?.educationProgramId || (classData as any)?.educationProgramId || "6a5840dfcb86a0edcb952250";

        try {
            setIsActionLoading(true);
            const session = await startQuizSession({
                classId,
                educationProgramId: programId,
                subjectId: selectedSubjectId,
                sessionId: selectedSessionId,
                quizId: selectedQuizId,
            });
            setActiveSession(session);
            toast.success("Bắt đầu Quizzi", "Đã mở bài làm Quizzi cho toàn bộ lớp học");
            void fetchSessionState();
        } catch (error) {
            console.error("Start quiz error:", error);
            toast.error("Bắt đầu Quizzi", "Không thể kích hoạt bài Quizzi");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleStop = async () => {
        const sessionId = activeSession?.id || (activeSession as any)?._id;
        if (!sessionId) {
            toast.error("Đóng Quizzi", "Không có phiên Quizzi nào đang chạy");
            return;
        }

        try {
            setIsActionLoading(true);
            const session = await stopQuizSession({
                classId,
                quizSessionId: sessionId,
            });
            setActiveSession(session);
            toast.success("Đóng Quizzi", "Đã đóng bài làm Quizzi và gửi lệnh nộp bài tới sinh viên");
            void fetchSessionState();
        } catch (error) {
            console.error("Stop quiz error:", error);
            toast.error("Đóng Quizzi", "Lỗi khi đóng phiên Quizzi");
        } finally {
            setIsActionLoading(false);
        }
    };

    const isRunning = activeSession?.status === "ACTIVE";

    return (
        <AdminLayout
            title="Kết quả kiểm tra đầu giờ"
            subtitle={`Lớp: ${classData?.classCode || classData?.name || classId}`}
        >
            <div className="flex w-full flex-col gap-6">
                {/* Header Controls & Filters */}
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:flex-1">
                            {/* Select Subject */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-700">Chọn môn học</label>
                                <select
                                    value={selectedSubjectId}
                                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                                    className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-800 outline-none transition focus:border-purple-600"
                                >
                                    {subjects.length === 0 ? (
                                        <option value="">Chưa có môn học nào</option>
                                    ) : (
                                        subjects.map((sub) => (
                                            <option key={sub.id} value={sub.id}>
                                                [{sub.code}] {sub.title}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            {/* Select Session */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-700">Chọn session</label>
                                <select
                                    value={selectedSessionId}
                                    onChange={(e) => setSelectedSessionId(e.target.value)}
                                    className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-800 outline-none transition focus:border-purple-600"
                                >
                                    {sessions.length === 0 ? (
                                        <option value="">Chưa có session</option>
                                    ) : (
                                        sessions.map((sess) => (
                                            <option key={sess.id} value={sess.id}>
                                                {sess.title}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            {/* Select Quiz */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-700">Chọn bài Quiz</label>
                                <select
                                    value={selectedQuizId}
                                    onChange={(e) => setSelectedQuizId(e.target.value)}
                                    className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-800 outline-none transition focus:border-purple-600"
                                >
                                    {quizList.length === 0 ? (
                                        <option value="">Không có bài Quizzi nào</option>
                                    ) : (
                                        quizList.map((q) => (
                                            <option key={q.id} value={q.id}>
                                                {q.title} ({q.questions?.length || 0} câu)
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                        </div>

                        {/* Top Actions */}
                        <div className="flex items-center gap-2">
                            <Button color="primary" size="md" onClick={fetchSessionState} className="!bg-indigo-600 hover:!bg-indigo-700">
                                Tìm kiếm
                            </Button>
                            <Button color="secondary" size="md" className="!bg-sky-500 !text-white hover:!bg-sky-600">
                                Review
                            </Button>
                            <Button color="secondary" size="md" className="!bg-rose-500 !text-white hover:!bg-rose-600">
                                Dashboard
                            </Button>
                            <Button
                                color="secondary"
                                size="md"
                                onClick={() => router.back()}
                                className="gap-1.5 bg-slate-100 font-semibold text-slate-700 hover:bg-slate-200"
                            >
                                <ArrowLeft className="size-4" />
                                Quay lại
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Session Control Card */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
                    <div className="flex items-center gap-2 text-base font-bold text-slate-800">
                        <Target className="size-5 text-rose-500" />
                        <span>Quản lý Quiz Session</span>
                    </div>

                    <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <span>Trạng thái:</span>
                            {isRunning ? (
                                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600">
                                    <span className="size-2.5 animate-pulse rounded-full bg-emerald-500" />
                                    Đang diễn ra
                                </span>
                            ) : activeSession?.status === "CLOSED" ? (
                                <span className="inline-flex items-center gap-1.5 font-bold text-rose-600">
                                    <span className="size-2.5 rounded-full bg-rose-500" />
                                    Đã đóng
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 font-bold text-slate-500">
                                    <span className="size-2.5 rounded-full bg-slate-400" />
                                    Chưa mở
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                        <Button
                            color="primary"
                            size="md"
                            disabled={isActionLoading || isRunning}
                            onClick={handleStart}
                            className="gap-2 !bg-purple-600 font-bold hover:!bg-purple-700 disabled:opacity-50"
                        >
                            <Play className="size-4 fill-white" />
                            START
                        </Button>
                        <Button
                            color="secondary"
                            size="md"
                            disabled={isActionLoading || !isRunning}
                            onClick={handleStop}
                            className="gap-2 bg-slate-200 font-bold text-slate-700 hover:bg-slate-300 disabled:opacity-50"
                        >
                            <Square className="size-4 fill-slate-600 text-slate-600" />
                            STOP
                        </Button>
                    </div>
                </div>

                {/* Realtime Results Table */}
                <div className="rounded-2xl border border-slate-100 bg-white shadow-xs">
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                <tr>
                                    <th className="px-5 py-4 text-center">No.</th>
                                    <th className="px-5 py-4">MSSV</th>
                                    <th className="px-5 py-4">Tên</th>
                                    <th className="px-5 py-4">Ngày sinh</th>
                                    <th className="px-5 py-4 text-center">Điểm</th>
                                    <th className="px-5 py-4 text-center">Trạng thái</th>
                                    <th className="px-5 py-4">Thời gian nộp</th>
                                    <th className="px-5 py-4 text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={8} className="p-8 text-center text-slate-400">
                                            Đang tải dữ liệu lớp học...
                                        </td>
                                    </tr>
                                ) : results.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-12 text-center text-slate-400">
                                            Chưa có dữ liệu làm bài
                                        </td>
                                    </tr>
                                ) : (
                                    results.map((item, idx) => (
                                        <tr key={item.id || item._id || idx} className="transition hover:bg-slate-50/50">
                                            <td className="px-5 py-4 text-center font-bold text-slate-400">{idx + 1}</td>
                                            <td className="px-5 py-4 font-bold text-slate-800">{item.studentCode || "---"}</td>
                                            <td className="px-5 py-4 font-bold text-slate-800">{item.studentName || "Sinh viên"}</td>
                                            <td className="px-5 py-4 text-slate-500">
                                                {item.dateOfBirth ? new Date(item.dateOfBirth).toLocaleDateString("vi-VN") : "---"}
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-extrabold text-purple-700">
                                                    {item.score !== undefined ? `${item.score}/10` : "---"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                {item.status === "SUBMITTED" ? (
                                                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                                                        Đã nộp bài
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                                                        Đang làm
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-slate-500">
                                                {item.submittedAt ? new Date(item.submittedAt).toLocaleTimeString("vi-VN") : "---"}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <span className="text-[11px] font-semibold text-purple-600 hover:underline cursor-pointer">
                                                    Xem chi tiết
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
