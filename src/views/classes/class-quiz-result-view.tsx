"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Clock, Play, Square, Target } from "lucide-react";
import { Socket, io } from "socket.io-client";
import { Breadcrumb } from "@/components/application/breadcrumb";
import { QuizDashboardModal } from "@/components/application/modals/quiz-dashboard-modal";
import { QuizReviewModal } from "@/components/application/modals/quiz-review-modal";
import { Button } from "@/components/base/buttons/button";
import { Select } from "@/components/base/select/select";
import { AdminLayout } from "@/components/layout/admin/admin-layout";
import { APP_CONFIG } from "@/constants/app.constants";
import { DEFAULT_QUIZ_DURATION_MINUTES, MILLISECONDS_PER_SECOND, PAD_TWO_DIGITS, SECONDS_PER_MINUTE } from "@/constants/options.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { StudentQuizResultItem, getActiveQuizSession, startQuizSession, stopQuizSession } from "@/services/class-quiz-session.service";
import { getClassDetail } from "@/services/class.service";
import { getCourseById } from "@/services/course.service";
import { getSessionsByCourse } from "@/services/material.service";
import { getSessionQuizzes } from "@/services/session-quiz.service";
import { toast } from "@/services/toast.service";
import type { ClassEntity } from "@/types/class.types";
import { type ActiveQuizSessionResponse, QuizSessionStatusEnum, type SessionQuizItem, StudentQuizStatusEnum } from "@/types/session-quiz.types";

export function ClassQuizResultView({ classId }: { classId: string }) {
    const [classData, setClassData] = useState<ClassEntity | null>(null);
    const [studentCount, setStudentCount] = useState<number | null>(null);
    const [subjects, setSubjects] = useState<{ id: string; code: string; title: string; educationProgramId?: string }[]>([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
    const [sessions, setSessions] = useState<{ id: string; title: string }[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string>("");
    const [quizList, setQuizList] = useState<SessionQuizItem[]>([]);
    const [selectedQuizId, setSelectedQuizId] = useState<string>("");

    const [activeSession, setActiveSession] = useState<ActiveQuizSessionResponse["session"]>(null);
    const [results, setResults] = useState<StudentQuizResultItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isDashboardOpen, setIsDashboardOpen] = useState(false);

    const selectedQuiz = quizList.find((q) => q.id === (activeSession?.quizId || selectedQuizId));
    const durationMinutes = selectedQuiz?.durationMinutes || DEFAULT_QUIZ_DURATION_MINUTES;

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
                const count = detail?.students?.length ?? detail?.summary?.studentCount ?? 0;
                setStudentCount(count);

                const assignedCourses = detail?.courses || [];
                const loadedSubjects: { id: string; code: string; title: string; educationProgramId?: string }[] = [];

                for (const cc of assignedCourses) {
                    const rawCourse = cc.courseId;
                    if (rawCourse && typeof rawCourse === "object") {
                        const courseObj = rawCourse as {
                            id?: string;
                            _id?: string;
                            courseCode?: string;
                            code?: string;
                            title?: string;
                            name?: string;
                            educationProgramId?: string;
                        };
                        const cId = courseObj.id || courseObj._id;
                        const cCode = courseObj.courseCode || courseObj.code || "";
                        const cTitle = courseObj.title || courseObj.name || "";
                        if (cId) {
                            loadedSubjects.push({
                                id: String(cId),
                                code: cCode,
                                title: cTitle,
                                educationProgramId: courseObj.educationProgramId || (cls as { educationProgramId?: string } | null)?.educationProgramId,
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
                                    educationProgramId:
                                        (course as { educationProgramId?: string }).educationProgramId ||
                                        (cls as { educationProgramId?: string } | null)?.educationProgramId,
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
                    (loadedSessions || []).map((s: { id?: string; _id?: string; title?: string; name?: string }, idx: number) => ({
                        id: String(s.id || s._id || idx),
                        title: s.title || s.name || `Session ${idx + 1}`,
                    })),
                );
                if (loadedSessions && loadedSessions.length > 0) {
                    const firstSession = loadedSessions[0] as { id?: string; _id?: string };
                    setSelectedSessionId(String(firstSession.id || firstSession._id));
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classId, selectedSubjectId, selectedSessionId, selectedQuizId]);

    const handleStart = async () => {
        if (studentCount === 0) {
            toast.error(UI_TEXT.classQuizResultPage.toastStartTitle, UI_TEXT.classQuizResultPage.toastStartErrorSelect);
            return;
        }

        if (!selectedQuizId) {
            toast.error(UI_TEXT.classQuizResultPage.toastStartTitle, UI_TEXT.classQuizResultPage.toastStartErrorSelect);
            return;
        }

        const currentSub = subjects.find((s) => s.id === selectedSubjectId);
        const programId =
            currentSub?.educationProgramId || (classData as { educationProgramId?: string } | null)?.educationProgramId || "6a5840dfcb86a0edcb952250";

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
            toast.success(UI_TEXT.classQuizResultPage.toastStartTitle, UI_TEXT.classQuizResultPage.toastStartSuccess);
            void fetchSessionState();
        } catch (error) {
            console.error("Start quiz error:", error);
            const errObj = error as { response?: { data?: { message?: string } }; message?: string };
            const errorMsg = errObj?.response?.data?.message || errObj?.message || UI_TEXT.classQuizResultPage.toastStartError;
            toast.error(UI_TEXT.classQuizResultPage.toastStartTitle, errorMsg);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleStop = async () => {
        const sessionId = activeSession?.id || activeSession?._id;
        if (!sessionId) {
            toast.error(UI_TEXT.classQuizResultPage.toastStopTitle, UI_TEXT.classQuizResultPage.toastStopErrorNoSession);
            return;
        }

        try {
            setIsActionLoading(true);
            const session = await stopQuizSession({
                classId,
                quizSessionId: sessionId,
            });
            setActiveSession(session);
            toast.success(UI_TEXT.classQuizResultPage.toastStopTitle, UI_TEXT.classQuizResultPage.toastStopSuccess);
            void fetchSessionState();
        } catch (error) {
            console.error("Stop quiz error:", error);
            toast.error(UI_TEXT.classQuizResultPage.toastStopTitle, UI_TEXT.classQuizResultPage.toastStopError);
        } finally {
            setIsActionLoading(false);
        }
    };

    const isRunning = activeSession?.status === QuizSessionStatusEnum.ACTIVE;

    useEffect(() => {
        if (!isRunning || !activeSession?.startedAt) {
            setTimeLeft(null);
            return;
        }

        const startTime = new Date(activeSession.startedAt).getTime();
        const durationMs = durationMinutes * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND;
        const endTime = startTime + durationMs;

        const updateTimer = () => {
            const now = Date.now();
            const remainingSec = Math.max(0, Math.floor((endTime - now) / MILLISECONDS_PER_SECOND));
            setTimeLeft(remainingSec);
        };

        updateTimer();
        const timerId = setInterval(updateTimer, MILLISECONDS_PER_SECOND);

        return () => clearInterval(timerId);
    }, [isRunning, activeSession?.startedAt, durationMinutes]);

    const formatTimeLeft = (seconds: number | null) => {
        if (seconds === null || seconds < 0) return "00:00";
        const m = Math.floor(seconds / SECONDS_PER_MINUTE);
        const s = seconds % SECONDS_PER_MINUTE;
        return `${String(m).padStart(PAD_TWO_DIGITS, "0")}:${String(s).padStart(PAD_TWO_DIGITS, "0")}`;
    };

    const formatDateTime = (dateInput?: string | Date) => {
        if (!dateInput) return "";
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return "";
        const hours = String(d.getHours()).padStart(PAD_TWO_DIGITS, "0");
        const minutes = String(d.getMinutes()).padStart(PAD_TWO_DIGITS, "0");
        const seconds = String(d.getSeconds()).padStart(PAD_TWO_DIGITS, "0");
        const day = String(d.getDate()).padStart(PAD_TWO_DIGITS, "0");
        const month = String(d.getMonth() + 1).padStart(PAD_TWO_DIGITS, "0");
        const year = d.getFullYear();
        return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
    };

    const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => <Play {...props} className="size-4 shrink-0 fill-white text-white" />;
    const SquareIcon = (props: React.SVGProps<SVGSVGElement>) => <Square {...props} className="size-4 shrink-0 fill-white text-white" />;

    return (
        <AdminLayout
            title={UI_TEXT.classQuizResultPage.title}
            subtitle={`${UI_TEXT.classQuizResultPage.classSubtitlePrefix}${classData?.classCode || classData?.name || classId}`}
        >
            <div className="flex w-full flex-col gap-6">
                {/* Breadcrumb Header */}
                <Breadcrumb
                    items={[
                        { label: UI_TEXT.classes.title, href: "/classes" },
                        { label: classData?.name ? `${classData.name} (${classData.classCode})` : classId, href: `/classes/${classId}` },
                        { label: UI_TEXT.classQuizResultPage.title },
                    ]}
                />

                {/* Filters Row */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
                            {/* Select Subject */}
                            <div className="w-full">
                                <Select
                                    label={UI_TEXT.classQuizResultPage.selectSubjectLabel}
                                    placeholder={UI_TEXT.classQuizResultPage.selectSubjectLabel}
                                    isClearable={false}
                                    selectedKey={selectedSubjectId || undefined}
                                    onSelectionChange={(key) => setSelectedSubjectId(String(key || ""))}
                                    items={subjects.map((sub) => ({ id: sub.id, label: `[${sub.code}] ${sub.title}` }))}
                                >
                                    {(item) => <Select.Item id={item.id} label={item.label} />}
                                </Select>
                            </div>

                            {/* Select Session */}
                            <div className="w-full">
                                <Select
                                    label={UI_TEXT.classQuizResultPage.selectSessionLabel}
                                    placeholder={UI_TEXT.classQuizResultPage.selectSessionLabel}
                                    isClearable={false}
                                    selectedKey={selectedSessionId || undefined}
                                    onSelectionChange={(key) => setSelectedSessionId(String(key || ""))}
                                    items={sessions.map((sess) => ({ id: sess.id, label: sess.title }))}
                                >
                                    {(item) => <Select.Item id={item.id} label={item.label} />}
                                </Select>
                            </div>

                            {/* Select Quiz */}
                            <div className="w-full">
                                <Select
                                    label={UI_TEXT.classQuizResultPage.selectQuizLabel}
                                    placeholder={UI_TEXT.classQuizResultPage.selectQuizLabel}
                                    isClearable={false}
                                    selectedKey={selectedQuizId || undefined}
                                    onSelectionChange={(key) => setSelectedQuizId(String(key || ""))}
                                    items={quizList.map((q) => ({
                                        id: q.id,
                                        label: `${q.title} (${q.questions?.length || 0} ${UI_TEXT.classQuizResultPage.questionsCountSuffix})`,
                                    }))}
                                >
                                    {(item) => <Select.Item id={item.id} label={item.label} />}
                                </Select>
                            </div>
                        </div>

                        {/* Top Actions */}
                        <div className="flex shrink-0 items-center gap-2">
                            <Button color="primary" size="md" onClick={fetchSessionState} className="!bg-indigo-600 hover:!bg-indigo-700">
                                {UI_TEXT.classQuizResultPage.btnSearch}
                            </Button>
                            <Button color="secondary" size="md" onClick={() => setIsReviewOpen(true)} className="!bg-sky-500 !text-white hover:!bg-sky-600">
                                {UI_TEXT.classQuizResultPage.btnReview}
                            </Button>
                            <Button
                                color="secondary"
                                size="md"
                                onClick={() => setIsDashboardOpen(true)}
                                className="!bg-rose-500 !text-white hover:!bg-rose-600"
                            >
                                {UI_TEXT.classQuizResultPage.btnDashboard}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Session Control Card */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-base font-bold text-slate-800">
                                <Target className="size-5 text-rose-500" />
                                <span>{UI_TEXT.classQuizResultPage.sessionManagementTitle}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-slate-700">
                                <div className="flex items-center gap-1.5">
                                    <span>{UI_TEXT.classQuizResultPage.statusLabel}</span>
                                    {isRunning ? (
                                        <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600">
                                            <span className="size-2.5 animate-pulse rounded-full bg-emerald-500" />
                                            {UI_TEXT.classQuizResultPage.statusActive}
                                        </span>
                                    ) : activeSession?.status === QuizSessionStatusEnum.CLOSED ? (
                                        <span className="inline-flex items-center gap-1.5 font-bold text-rose-600">
                                            <span className="size-2.5 rounded-full bg-rose-500" />
                                            {UI_TEXT.classQuizResultPage.statusClosed}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 font-bold text-slate-500">
                                            <span className="size-2.5 rounded-full bg-slate-400" />
                                            {UI_TEXT.classQuizResultPage.statusIdle}
                                        </span>
                                    )}
                                </div>

                                {activeSession?.startedAt && (
                                    <div className="flex items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50/70 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                                        <span>{UI_TEXT.classQuizResultPage.openedAtPrefix}</span>
                                        <strong className="font-mono font-bold text-emerald-900">{formatDateTime(activeSession.startedAt)}</strong>
                                    </div>
                                )}

                                {activeSession?.stoppedAt && activeSession.status === QuizSessionStatusEnum.CLOSED && (
                                    <div className="flex items-center gap-1.5 rounded-lg border border-rose-100 bg-rose-50/70 px-2.5 py-1 text-xs font-semibold text-rose-800">
                                        <span>{UI_TEXT.classQuizResultPage.closedAtPrefix}</span>
                                        <strong className="font-mono font-bold text-rose-900">{formatDateTime(activeSession.stoppedAt)}</strong>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {isRunning ? (
                                <div className="flex items-center gap-2 rounded-xl border border-purple-100 bg-purple-50 px-3.5 py-2 text-xs font-bold text-purple-700 shadow-2xs">
                                    <Clock className="size-4 animate-pulse text-purple-600" />
                                    <span>
                                        {UI_TEXT.classQuizResultPage.timeLeftPrefix}{" "}
                                        <strong className="font-mono text-sm text-purple-900">{formatTimeLeft(timeLeft)}</strong>
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs">
                                    <Clock className="size-4 text-slate-500" />
                                    <span>
                                        {UI_TEXT.classQuizResultPage.selectQuizLabel}{" "}
                                        <strong className="font-mono text-sm text-slate-900">{formatTimeLeft(durationMinutes * SECONDS_PER_MINUTE)}</strong>
                                    </span>
                                </div>
                            )}
                            {!isRunning ? (
                                <Button
                                    color="primary"
                                    size="md"
                                    iconLeading={PlayIcon}
                                    disabled={isActionLoading}
                                    onClick={handleStart}
                                    className="!bg-emerald-600 font-bold !text-white *:!text-white hover:!bg-emerald-700 hover:!text-white hover:*:!text-white disabled:opacity-50"
                                >
                                    {UI_TEXT.classQuizResultPage.btnStart}
                                </Button>
                            ) : (
                                <Button
                                    color="primary"
                                    size="md"
                                    iconLeading={SquareIcon}
                                    disabled={isActionLoading}
                                    onClick={handleStop}
                                    className="!bg-rose-600 font-bold !text-white *:!text-white hover:!bg-rose-700 hover:!text-white hover:*:!text-white disabled:opacity-50"
                                >
                                    {UI_TEXT.classQuizResultPage.btnStop}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Realtime Results Table */}
                <div className="rounded-2xl border border-slate-100 bg-white shadow-xs">
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50/50 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                                <tr>
                                    <th className="px-5 py-4 text-center">{UI_TEXT.classQuizResultPage.tableHeaderNo}</th>
                                    <th className="px-5 py-4">{UI_TEXT.classQuizResultPage.tableHeaderMssv}</th>
                                    <th className="px-5 py-4">{UI_TEXT.classQuizResultPage.tableHeaderName}</th>
                                    <th className="px-5 py-4">{UI_TEXT.classQuizResultPage.tableHeaderDob}</th>
                                    <th className="px-5 py-4 text-center">{UI_TEXT.classQuizResultPage.tableHeaderScore}</th>
                                    <th className="px-5 py-4 text-center">{UI_TEXT.classQuizResultPage.tableHeaderStatus}</th>
                                    <th className="px-5 py-4">{UI_TEXT.classQuizResultPage.tableHeaderSubmittedAt}</th>
                                    <th className="px-5 py-4 text-right">{UI_TEXT.classQuizResultPage.tableHeaderActions}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={8} className="p-8 text-center text-slate-400">
                                            {UI_TEXT.classQuizResultPage.loadingClassData}
                                        </td>
                                    </tr>
                                ) : results.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-12 text-center text-slate-400">
                                            {studentCount === 0 ? UI_TEXT.classQuizResultPage.toastStartErrorSelect : UI_TEXT.classQuizResultPage.emptyResults}
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
                                                {item.status === StudentQuizStatusEnum.SUBMITTED || activeSession?.status === QuizSessionStatusEnum.CLOSED ? (
                                                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                                                        {UI_TEXT.classQuizResultPage.statusSubmitted}
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                                                        {UI_TEXT.classQuizResultPage.statusDoing}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-slate-500">
                                                {item.submittedAt ? new Date(item.submittedAt).toLocaleTimeString("vi-VN") : "---"}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <span className="cursor-pointer text-[11px] font-semibold text-purple-600 hover:underline">
                                                    {UI_TEXT.classQuizResultPage.actionDetail}
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

            <QuizReviewModal
                isOpen={isReviewOpen}
                onClose={() => setIsReviewOpen(false)}
                quizzes={quizList}
                selectedQuizId={selectedQuizId}
                onSelectQuiz={(qId) => setSelectedQuizId(qId)}
            />

            <QuizDashboardModal
                isOpen={isDashboardOpen}
                onClose={() => setIsDashboardOpen(false)}
                results={results}
                activeQuiz={selectedQuiz}
                isClosed={activeSession?.status === QuizSessionStatusEnum.CLOSED}
            />
        </AdminLayout>
    );
}
