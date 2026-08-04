"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Calendar, History, Plus, Save, UserPlus, UserX, Users } from "lucide-react";
import { DatePicker } from "@/components/application/date-picker/date-picker";
import { AttendanceHistoryModal } from "@/components/application/modals/attendance-history-modal";
import { CourseClassModal } from "@/components/application/modals/course-class-modal";
import { EnrollStudentModal } from "@/components/application/modals/enroll-student-modal";
import { Button } from "@/components/base/buttons/button";
import { Select } from "@/components/base/select/select";
import { AttendanceStatusEnum, SessionModeEnum } from "@/constants/class.constants";
import { SHIFT_OPTIONS_LIST } from "@/constants/options.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { createAttendanceSession, getAttendanceRoster, getAttendanceSessions, markAttendance } from "@/services/attendance.service";
import { toast } from "@/services/toast.service";
import type { AttendanceSession, AttendanceStatus, ClassScheduleSubpanelProps } from "@/types/class.types";
import { extractCourseMongoId, extractStudentMongoId, isValidMongoId } from "@/utils/class.utils";
import { cx } from "@/utils/cx";

const defaultShift = 3;
const localeVi = "vi-VN";

export function ClassScheduleSubpanel({ classId, courses = [], students = [] }: ClassScheduleSubpanelProps) {
    const queryClient = useQueryClient();
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);

    const courseOptions = courses
        .map((c) => {
            const mongoId = extractCourseMongoId(c);
            const courseObj = typeof c.courseId === "object" ? c.courseId : null;
            return {
                id: mongoId,
                label: courseObj?.name ? `${courseObj.name} (${courseObj.courseCode || "N/A"})` : "Môn học",
            };
        })
        .filter((opt) => isValidMongoId(opt.id));

    const [selectedCourseId, setSelectedCourseId] = useState<string>(() => courseOptions[0]?.id || "");

    // Auto fill/select course when courseOptions updates (e.g. after adding a course)
    useEffect(() => {
        if (courseOptions.length > 0) {
            if (!selectedCourseId || !courseOptions.some((opt) => opt.id === selectedCourseId)) {
                setSelectedCourseId(courseOptions[0].id);
            }
        } else {
            setSelectedCourseId("");
        }
    }, [courseOptions, selectedCourseId]);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
    const [selectedShift, setSelectedShift] = useState<number>(defaultShift);
    const [mode, setMode] = useState<"OFFLINE" | "ONLINE">(SessionModeEnum.OFFLINE);

    // Attendance State mapping studentId -> status & note
    const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: AttendanceStatus; note: string }>>(() => {
        const initial: Record<string, { status: AttendanceStatus; note: string }> = {};
        students.forEach((s) => {
            const sId = extractStudentMongoId(s);
            if (sId) {
                initial[sId] = { status: AttendanceStatusEnum.PRESENT, note: "" };
            }
        });
        return initial;
    });

    // Query existing session and roster for current course, date, and shift
    const { data: currentRosterData } = useQuery({
        queryKey: ["current-attendance-session", classId, selectedCourseId, selectedDate, selectedShift],
        queryFn: async () => {
            if (!selectedCourseId || !isValidMongoId(selectedCourseId)) return null;
            const sessions = await getAttendanceSessions({
                classId,
                courseId: selectedCourseId,
                from: selectedDate,
                to: selectedDate,
            });
            const rawSessions = (sessions as unknown as Record<string, unknown>)?.data ?? sessions;
            const sessionList: Record<string, unknown>[] = Array.isArray(rawSessions) ? rawSessions : [];
            const found = sessionList.find((s) => Number(s.period) === Number(selectedShift));
            if (!found) return null;
            const sId = (found as Record<string, unknown>).id || (found as Record<string, unknown>)._id;
            if (!sId) return null;
            const rosterRes = await getAttendanceRoster(String(sId));
            const rawData = (rosterRes as unknown as Record<string, unknown>)?.data ?? rosterRes;
            const rosterList: Record<string, unknown>[] = Array.isArray(rawData)
                ? rawData
                : Array.isArray((rawData as Record<string, unknown>)?.roster)
                  ? ((rawData as Record<string, unknown>).roster as Record<string, unknown>[])
                  : [];
            return { session: found, roster: rosterList };
        },
        enabled: !!classId && !!selectedCourseId && isValidMongoId(selectedCourseId) && !!selectedDate,
    });

    // Update local attendanceMap when backend roster or students list changes
    useEffect(() => {
        if (currentRosterData?.roster && currentRosterData.roster.length > 0) {
            const rosterMap = new Map(currentRosterData.roster.map((r) => [r.studentId, r]));
            setAttendanceMap((prev) => {
                const next = { ...prev };
                students.forEach((s) => {
                    const sId = extractStudentMongoId(s);
                    if (sId) {
                        const r = rosterMap.get(sId) as Record<string, unknown> | undefined;
                        if (r && r.status) {
                            next[sId] = {
                                status: r.status as AttendanceStatus,
                                note: String(r.note || ""),
                            };
                        } else if (!next[sId]) {
                            next[sId] = { status: AttendanceStatusEnum.PRESENT, note: "" };
                        }
                    }
                });
                return next;
            });
            if (currentRosterData.session?.mode) {
                setMode(currentRosterData.session.mode as "OFFLINE" | "ONLINE");
            }
        } else {
            setAttendanceMap((prev) => {
                const next = { ...prev };
                students.forEach((s) => {
                    const sId = extractStudentMongoId(s);
                    if (sId && !next[sId]) {
                        next[sId] = { status: AttendanceStatusEnum.PRESENT, note: "" };
                    }
                });
                return next;
            });
        }
    }, [currentRosterData, students]);

    const setStatusForStudent = (studentId: string, status: AttendanceStatus) => {
        setAttendanceMap((prev) => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                status,
            },
        }));
    };

    const setNoteForStudent = (studentId: string, note: string) => {
        setAttendanceMap((prev) => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                note,
            },
        }));
    };

    const setAllStatus = (status: AttendanceStatus) => {
        setAttendanceMap((prev) => {
            const next = { ...prev };
            Object.keys(next).forEach((id) => {
                next[id] = { ...next[id], status };
            });
            return next;
        });
    };

    // Calculate Summary Stats
    const totalStudents = students.length;
    const presentCount = Object.values(attendanceMap).filter((a) => a.status === AttendanceStatusEnum.PRESENT || a.status === AttendanceStatusEnum.LATE).length;
    const absentCount = Object.values(attendanceMap).filter(
        (a) => a.status === AttendanceStatusEnum.ABSENT_EXCUSED || a.status === AttendanceStatusEnum.ABSENT_UNEXCUSED,
    ).length;

    // Save Attendance Mutation to Backend API
    const saveMutation = useMutation({
        mutationFn: async () => {
            if (courses.length === 0 || courseOptions.length === 0) {
                throw new Error(UI_TEXT.classes.toastNoCourseSelected);
            }

            if (!selectedCourseId || !isValidMongoId(selectedCourseId)) {
                throw new Error(UI_TEXT.classes.toastNoCourseSelected);
            }

            // Step 1: Create or find session
            const session = await createAttendanceSession({
                classId,
                courseId: selectedCourseId,
                date: selectedDate,
                period: selectedShift,
                mode,
            });

            const sessionId = session?.id || (session as unknown as Record<string, unknown>)?._id;
            if (!sessionId) {
                throw new Error(UI_TEXT.classes.toastSaveError);
            }

            // Step 2: Mark attendance roster
            const entries = Object.entries(attendanceMap).map(([studentId, data]) => ({
                studentId,
                status: data.status,
                note: data.note,
            }));

            await markAttendance(String(sessionId), { entries });
        },
        onSuccess: () => {
            toast.success(UI_TEXT.classes.toastSuccess, UI_TEXT.classes.toastSaveSuccess);
            queryClient.invalidateQueries({ queryKey: ["class-detail", classId] });
            queryClient.invalidateQueries({ queryKey: ["attendance-sessions", classId] });
            queryClient.invalidateQueries({
                queryKey: ["current-attendance-session", classId, selectedCourseId, selectedDate, selectedShift],
            });
        },
        onError: (err: Error) => {
            let msg = err.message || UI_TEXT.classes.toastSaveError;
            if (msg.includes("courseId must be a mongodb id")) {
                msg = UI_TEXT.classes.toastNoCourseSelected;
            }
            toast.error(UI_TEXT.classes.toastError, msg);
        },
    });

    const handleSelectHistorySession = async (sess: AttendanceSession) => {
        const sId = sess.id || (sess as unknown as Record<string, unknown>)._id;
        if (sess.courseId) setSelectedCourseId(sess.courseId);
        if (sess.date) setSelectedDate(new Date(sess.date).toISOString().split("T")[0]);
        if (sess.period) setSelectedShift(sess.period);
        if (sess.mode) setMode(sess.mode as "OFFLINE" | "ONLINE");

        if (!sId) {
            toast.info(UI_TEXT.classes.toastSessionSelected, `${UI_TEXT.classes.toastSessionSelected} ${new Date(sess.date).toLocaleDateString(localeVi)}`);
            return;
        }

        try {
            const roster = await getAttendanceRoster(String(sId));
            const rawData = (roster as unknown as Record<string, unknown>)?.data ?? roster;
            const rosterList: Record<string, unknown>[] = Array.isArray(rawData)
                ? rawData
                : Array.isArray((rawData as Record<string, unknown>)?.roster)
                  ? ((rawData as Record<string, unknown>).roster as Record<string, unknown>[])
                  : [];

            if (rosterList.length > 0) {
                setAttendanceMap((prev) => {
                    const next = { ...prev };
                    rosterList.forEach((r) => {
                        if (r.studentId && r.status) {
                            next[String(r.studentId)] = {
                                status: r.status as AttendanceStatus,
                                note: String(r.note || ""),
                            };
                        }
                    });
                    return next;
                });
                toast.success(UI_TEXT.classes.toastSuccess, `${UI_TEXT.classes.toastSessionSelected} ${new Date(sess.date).toLocaleDateString(localeVi)}`);
            }
        } catch {
            toast.info(UI_TEXT.classes.toastSessionSelected, `${UI_TEXT.classes.toastSessionSelected} ${new Date(sess.date).toLocaleDateString(localeVi)}`);
        }
    };

    return (
        <div className="flex min-h-[520px] flex-1 flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            {/* Header & Main Controls */}
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
                        <Calendar className="size-5 text-wine" />
                        {UI_TEXT.classes.scheduleTitle}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">{UI_TEXT.classes.scheduleSubtitle}</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        color="secondary"
                        size="md"
                        onClick={() => setIsHistoryModalOpen(true)}
                        className="gap-2 rounded-full border-slate-200 font-bold text-wine hover:bg-wine-soft"
                        iconLeading={<History className="size-4 text-wine" />}
                    >
                        {UI_TEXT.classes.attendanceHistoryBtn}
                    </Button>
                    <Button
                        color="primary"
                        size="md"
                        onClick={() => saveMutation.mutate()}
                        isLoading={saveMutation.isPending}
                        className="gap-2 rounded-full border-none bg-wine font-bold text-white shadow-md hover:bg-wine-deep"
                        iconLeading={<Save className="size-4" />}
                    >
                        {UI_TEXT.classes.saveAttendanceBtn}
                    </Button>
                </div>
            </div>

            {/* Selection Bar: Môn học, Ngày, Ca học, Hình thức (Synchronized rounded-full Selects) */}
            <div className="grid grid-cols-1 items-end gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Selector 1: Môn học */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">{UI_TEXT.classes.thSubjectModule}</label>
                    <Select
                        aria-label={UI_TEXT.classes.placeholderSelectSubject}
                        placeholder={UI_TEXT.classes.placeholderSelectSubject}
                        items={courseOptions}
                        selectedKey={selectedCourseId}
                        onSelectionChange={(key) => setSelectedCourseId(String(key))}
                        isClearable={false}
                        triggerClassName="!rounded-full border-slate-200 bg-white"
                    >
                        {(item) => (
                            <Select.Item key={item.id} id={item.id}>
                                {item.label}
                            </Select.Item>
                        )}
                    </Select>
                </div>

                {/* Selector 2: Ngày điểm danh */}
                <DatePicker
                    label={UI_TEXT.classes.thDateLabelUpper}
                    value={selectedDate}
                    onChange={(val) => setSelectedDate(val ? String(val) : "")}
                    triggerClassName="!rounded-full border-slate-200 bg-white"
                />

                {/* Selector 3: Ca học */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">{UI_TEXT.classes.thShiftLabel}</label>
                    <Select
                        aria-label={UI_TEXT.classes.placeholderSelectShift}
                        placeholder={UI_TEXT.classes.placeholderSelectShift}
                        items={SHIFT_OPTIONS_LIST}
                        selectedKey={String(selectedShift)}
                        onSelectionChange={(key) => setSelectedShift(Number(key) || defaultShift)}
                        isClearable={false}
                        triggerClassName="!rounded-full border-slate-200 bg-white"
                    >
                        {(item) => (
                            <Select.Item key={item.id} id={item.id}>
                                {item.label}
                            </Select.Item>
                        )}
                    </Select>
                </div>

                {/* Selector 4: Hình thức học */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">{UI_TEXT.classes.thModeLabel}</label>
                    <div className="flex rounded-full border border-slate-200 bg-slate-100 p-1">
                        <button
                            type="button"
                            onClick={() => setMode(SessionModeEnum.OFFLINE)}
                            className={cx(
                                "flex-1 cursor-pointer rounded-full py-1.5 text-center text-xs font-bold transition duration-150",
                                mode === SessionModeEnum.OFFLINE ? "bg-white text-wine shadow-xs" : "text-slate-600 hover:text-slate-900",
                            )}
                        >
                            {UI_TEXT.classSchedule.modeOffline}
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode(SessionModeEnum.ONLINE)}
                            className={cx(
                                "flex-1 cursor-pointer rounded-full py-1.5 text-center text-xs font-bold transition duration-150",
                                mode === SessionModeEnum.ONLINE ? "bg-white text-wine shadow-xs" : "text-slate-600 hover:text-slate-900",
                            )}
                        >
                            {UI_TEXT.classSchedule.modeOnline}
                        </button>
                    </div>
                </div>
            </div>

            {/* Attendance Roster Header Bar & Stats */}
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-wine-soft font-bold text-wine">
                        <Users className="size-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-900">{UI_TEXT.classes.rosterTitle}</h4>
                        <p className="text-xs text-slate-500">
                            {UI_TEXT.classes.classSizeLabel} <strong className="text-slate-800">{totalStudents}</strong> {UI_TEXT.classes.presentLabel}{" "}
                            <strong className="text-emerald-600">{presentCount}</strong> {UI_TEXT.classes.absentLabel}{" "}
                            <strong className="text-rose-600">{absentCount}</strong>
                        </p>
                    </div>
                </div>

                {/* Quick Bulk Action Buttons */}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">{UI_TEXT.classes.quickSelectAllLabel}</span>
                    <button
                        type="button"
                        onClick={() => setAllStatus(AttendanceStatusEnum.PRESENT)}
                        className="cursor-pointer rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                    >
                        {UI_TEXT.classes.markAllPresentBtn}
                    </button>
                    <button
                        type="button"
                        onClick={() => setAllStatus(AttendanceStatusEnum.ABSENT_UNEXCUSED)}
                        className="cursor-pointer rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100"
                    >
                        {UI_TEXT.classes.markAllAbsentBtn}
                    </button>
                </div>
            </div>

            {/* Student Attendance List Table or Empty Warning */}
            {courses.length === 0 || courseOptions.length === 0 ? (
                <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-slate-50/60 p-12 text-center text-slate-600">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 font-bold text-slate-500">
                        <BookOpen className="size-6" />
                    </div>
                    <div className="max-w-md">
                        <h4 className="text-base font-bold text-slate-900">{UI_TEXT.classes.noCoursesAssignedMsg}</h4>
                        <p className="mt-1 text-xs text-slate-500">{UI_TEXT.classSchedule.noModuleCoursesDesc}</p>
                    </div>
                    <Button
                        color="primary"
                        size="md"
                        onClick={() => setIsCourseModalOpen(true)}
                        className="mt-2 cursor-pointer gap-2 rounded-full border-none bg-wine font-bold text-white shadow-md hover:bg-wine-deep"
                        iconLeading={<Plus className="size-4" />}
                    >
                        {UI_TEXT.classSchedule.btnAssignCourseTeacher}
                    </Button>
                </div>
            ) : !selectedCourseId ? (
                <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-slate-50/60 p-12 text-center text-slate-600">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 font-bold text-slate-500">
                        <BookOpen className="size-6" />
                    </div>
                    <div className="max-w-md">
                        <h4 className="text-base font-bold text-slate-900">{UI_TEXT.classSchedule.pleaseSelectCourseTitle}</h4>
                        <p className="mt-1 text-xs text-slate-500">{UI_TEXT.classSchedule.pleaseSelectCourseDesc}</p>
                    </div>
                </div>
            ) : students.length === 0 ? (
                <div className="flex h-56 flex-col items-center justify-center gap-3 text-center text-slate-400">
                    <UserX className="size-9 text-slate-400" />
                    <div>
                        <p className="text-sm font-bold text-slate-700">{UI_TEXT.classSchedule.noStudentsInClassTitle}</p>
                        <p className="mt-0.5 text-xs text-slate-400">{UI_TEXT.classSchedule.noStudentsInClassDesc}</p>
                    </div>
                    <Button
                        color="primary"
                        size="md"
                        onClick={() => setIsEnrollModalOpen(true)}
                        className="mt-1 cursor-pointer gap-2 rounded-full border-none bg-wine font-bold text-white shadow-md hover:bg-wine-deep"
                        iconLeading={<UserPlus className="size-4" />}
                    >
                        {UI_TEXT.classes.addStudentBtn}
                    </Button>
                </div>
            ) : (
                <div className="min-h-[420px] flex-1 overflow-x-auto rounded-2xl border border-line bg-white shadow-xs">
                    <table className="w-full table-auto border-collapse text-left text-sm text-ink">
                        <thead>
                            <tr className="sticky top-0 z-10 border-b border-line bg-slate-50 text-[11px] font-bold tracking-wider text-muted uppercase">
                                <th className="w-12 px-6 py-4 text-center">{UI_TEXT.classes.thStt}</th>
                                <th className="w-56 px-6 py-4 whitespace-nowrap">{UI_TEXT.classes.thStudentCodeName}</th>
                                <th className="px-6 py-4 text-center">{UI_TEXT.classes.thNote}</th>
                                <th className="w-[430px] px-6 py-4 text-center whitespace-nowrap">{UI_TEXT.classes.thAttendanceStatus}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {students.map((s, idx) => {
                                const sId = extractStudentMongoId(s);
                                const studentName = s.student?.fullName || "Sinh viên";
                                const studentCode = s.student?.studentCode || s.student?.email || "-";
                                const current = attendanceMap[sId] || { status: AttendanceStatusEnum.PRESENT, note: "" };

                                return (
                                    <tr key={s.enrollmentId || idx} className="group transition duration-150 hover:bg-slate-50">
                                        <td className="border-b border-line px-6 py-4 text-center font-semibold text-muted">{idx + 1}</td>
                                        <td className="border-b border-line px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <p className="text-[14.5px] font-bold text-ink">{studentName}</p>
                                                <p className="font-mono text-xs text-muted">{studentCode}</p>
                                            </div>
                                        </td>
                                        <td className="border-b border-line px-6 py-4 text-center">
                                            <input
                                                type="text"
                                                placeholder={UI_TEXT.classes.placeholderNote}
                                                value={current.note}
                                                onChange={(e) => setNoteForStudent(sId, e.target.value)}
                                                className="w-full rounded-full border border-slate-200 px-4 py-1.5 text-center text-xs text-ink outline-none focus:border-wine"
                                            />
                                        </td>
                                        <td className="w-[430px] border-b border-line px-6 py-4 text-center whitespace-nowrap">
                                            <div className="flex flex-nowrap items-center justify-center gap-1.5 whitespace-nowrap">
                                                <button
                                                    type="button"
                                                    onClick={() => setStatusForStudent(sId, AttendanceStatusEnum.PRESENT)}
                                                    className={cx(
                                                        "shrink-0 cursor-pointer rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap transition duration-150",
                                                        current.status === AttendanceStatusEnum.PRESENT
                                                            ? "bg-emerald-600 text-white shadow-xs"
                                                            : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700",
                                                    )}
                                                >
                                                    {UI_TEXT.classes.statusPresent}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setStatusForStudent(sId, AttendanceStatusEnum.LATE)}
                                                    className={cx(
                                                        "shrink-0 cursor-pointer rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap transition duration-150",
                                                        current.status === AttendanceStatusEnum.LATE
                                                            ? "bg-amber-500 text-white shadow-xs"
                                                            : "bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700",
                                                    )}
                                                >
                                                    {UI_TEXT.classes.statusLate}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setStatusForStudent(sId, AttendanceStatusEnum.ABSENT_EXCUSED)}
                                                    className={cx(
                                                        "shrink-0 cursor-pointer rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap transition duration-150",
                                                        current.status === AttendanceStatusEnum.ABSENT_EXCUSED
                                                            ? "bg-blue-600 text-white shadow-xs"
                                                            : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700",
                                                    )}
                                                >
                                                    {UI_TEXT.classes.statusAbsentExcused}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setStatusForStudent(sId, AttendanceStatusEnum.ABSENT_UNEXCUSED)}
                                                    className={cx(
                                                        "shrink-0 cursor-pointer rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap transition duration-150",
                                                        current.status === AttendanceStatusEnum.ABSENT_UNEXCUSED
                                                            ? "bg-rose-600 text-white shadow-xs"
                                                            : "bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700",
                                                    )}
                                                >
                                                    {UI_TEXT.classes.statusAbsentUnexcused}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Enroll Student Modal */}
            <EnrollStudentModal isOpen={isEnrollModalOpen} onClose={() => setIsEnrollModalOpen(false)} classId={classId} />

            {/* Attendance History Modal */}
            <AttendanceHistoryModal
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                classId={classId}
                courses={courses}
                students={students}
                currentAttendanceMap={attendanceMap}
                onSelectSession={handleSelectHistorySession}
            />

            {/* Course Class Modal */}
            <CourseClassModal isOpen={isCourseModalOpen} onClose={() => setIsCourseModalOpen(false)} classId={classId} />
        </div>
    );
}
