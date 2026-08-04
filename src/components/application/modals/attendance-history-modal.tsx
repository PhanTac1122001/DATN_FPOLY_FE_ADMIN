"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Calendar, CheckCircle2, Eye, History, Save, Users, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { AttendanceStatusEnum, SessionModeEnum } from "@/constants/class.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { getAttendanceRoster, getAttendanceSessions, markAttendance } from "@/services/attendance.service";
import { toast } from "@/services/toast.service";
import type { AttendanceHistoryModalProps, AttendanceSession } from "@/types/class.types";
import { extractStudentMongoId, getSessionId, getShiftLabel } from "@/utils/class.utils";
import { cx } from "@/utils/cx";

const localeVi = "vi-VN";
const onlineLabel = "ONLINE";
const offlineLabel = "OFFLINE";

export function AttendanceHistoryModal({
    isOpen,
    onClose,
    classId,
    courses,
    students = [],
    currentAttendanceMap,
    onSelectSession,
}: AttendanceHistoryModalProps) {
    const queryClient = useQueryClient();

    const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);
    const [sessionRoster, setSessionRoster] = useState<Record<string, unknown>[]>([]);
    const [isLoadingRoster, setIsLoadingRoster] = useState(false);
    const [rosterMap, setRosterMap] = useState<Record<string, { status: string; note: string }>>({});

    const { data: sessions = [], isLoading: isLoadingSessions } = useQuery({
        queryKey: ["attendance-sessions", classId],
        queryFn: () => getAttendanceSessions({ classId }),
        enabled: isOpen && !!classId,
    });

    const getCourseName = (courseId: string) => {
        const found = courses.find((c) => {
            const rawId = typeof c.courseId === "object" ? (c.courseId as unknown as Record<string, unknown>)?._id || c.courseId?.id : c.courseId;
            return rawId === courseId || c.id === courseId;
        });
        return (typeof found?.courseId === "object" ? found.courseId?.name : "") || "Môn học";
    };

    const handleOpenSessionDetail = async (sess: AttendanceSession) => {
        const sId = getSessionId(sess);
        if (!sId) {
            toast.error(UI_TEXT.classes.toastError, UI_TEXT.classes.toastMissingSessionId);
            return;
        }

        setSelectedSession(sess);
        setIsLoadingRoster(true);
        try {
            const res = await getAttendanceRoster(sId);
            const raw = (res as unknown as Record<string, unknown>)?.data ?? res;
            let list: Record<string, unknown>[] = Array.isArray(raw)
                ? raw
                : Array.isArray((raw as Record<string, unknown>)?.roster)
                  ? ((raw as Record<string, unknown>).roster as Record<string, unknown>[])
                  : [];

            // Fallback: If session roster from backend is empty array, populate from class students prop!
            if (list.length === 0 && students && students.length > 0) {
                list = students.map((s) => {
                    const studentObj = s.student;
                    const stId = extractStudentMongoId(s);
                    const currentOnScreen = currentAttendanceMap?.[stId];
                    return {
                        studentId: stId,
                        fullName: studentObj?.fullName || "Sinh viên",
                        studentCode: studentObj?.studentCode || studentObj?.email || "-",
                        status: currentOnScreen?.status || "PRESENT",
                        note: currentOnScreen?.note || "",
                    };
                });
            }

            setSessionRoster(list);

            const initialMap: Record<string, { status: string; note: string }> = {};
            list.forEach((r) => {
                const stId = String(r.studentId || r._id || r.id || "");
                if (stId) {
                    const currentOnScreen = (currentAttendanceMap as Record<string, { status?: string; note?: string }>)?.[stId];
                    const statusStr = typeof r.status === "string" && r.status ? r.status : currentOnScreen?.status || "PRESENT";
                    const noteStr = typeof r.note === "string" ? r.note : currentOnScreen?.note || "";
                    initialMap[stId] = {
                        status: String(statusStr),
                        note: String(noteStr),
                    };
                }
            });
            setRosterMap(initialMap);
        } catch {
            // Fallback to class students list if request fails
            if (students && students.length > 0) {
                const fallbackList = students.map((s) => {
                    const studentObj = s.student;
                    const stId = extractStudentMongoId(s);
                    const currentOnScreen = currentAttendanceMap?.[stId];
                    return {
                        studentId: stId,
                        fullName: studentObj?.fullName || "Sinh viên",
                        studentCode: studentObj?.studentCode || studentObj?.email || "-",
                        status: currentOnScreen?.status || "PRESENT",
                        note: currentOnScreen?.note || "",
                    };
                });
                setSessionRoster(fallbackList);

                const initialMap: Record<string, { status: string; note: string }> = {};
                fallbackList.forEach((r) => {
                    if (r.studentId) {
                        const currentOnScreen = currentAttendanceMap?.[r.studentId];
                        initialMap[r.studentId] = {
                            status: currentOnScreen?.status || "PRESENT",
                            note: currentOnScreen?.note || "",
                        };
                    }
                });
                setRosterMap(initialMap);
            } else {
                toast.error(UI_TEXT.classes.toastError, UI_TEXT.classes.toastRosterLoadError);
            }
        } finally {
            setIsLoadingRoster(false);
        }
    };

    const setStatusForStudent = (studentId: string, status: string) => {
        setRosterMap((prev) => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                status,
            },
        }));
    };

    const setNoteForStudent = (studentId: string, note: string) => {
        setRosterMap((prev) => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                note,
            },
        }));
    };

    const saveSessionMutation = useMutation({
        mutationFn: async () => {
            if (!selectedSession) return;
            const sId = getSessionId(selectedSession);
            if (!sId) {
                throw new Error(UI_TEXT.classes.errInvalidSessionId);
            }
            const entries = Object.entries(rosterMap).map(([studentId, data]) => ({
                studentId,
                status: data.status as unknown as AttendanceStatusEnum,
                note: data.note,
            }));
            await markAttendance(sId, { entries });
        },
        onSuccess: () => {
            toast.success(UI_TEXT.classes.toastSuccess, UI_TEXT.classes.toastUpdateAttendanceSuccess);
            queryClient.invalidateQueries({ queryKey: ["class-detail", classId] });
            queryClient.invalidateQueries({ queryKey: ["attendance-sessions", classId] });
        },
        onError: (err: Error) => {
            toast.error(UI_TEXT.classes.toastError, err.message || UI_TEXT.classes.toastUpdateAttendanceError);
        },
    });

    const handleCloseModal = () => {
        setSelectedSession(null);
        onClose();
    };

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && handleCloseModal()}>
            <CustomModal.Content className="max-w-4xl !rounded-[24px]">
                <Dialog className="flex flex-col rounded-[24px] bg-white shadow-2xl outline-none">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-wine-soft font-bold text-wine">
                                <History className="size-5" />
                            </div>
                            <div>
                                <Heading slot="title" className="text-lg font-bold text-slate-900">
                                    {selectedSession ? UI_TEXT.classes.modalDetailTitle : UI_TEXT.classes.modalHistoryTitle}
                                </Heading>
                                <p className="text-xs text-slate-500">
                                    {selectedSession
                                        ? `${UI_TEXT.classes.datePrefix}${new Date(selectedSession.date).toLocaleDateString(localeVi)} - ${getShiftLabel(selectedSession.period || 1)}`
                                        : UI_TEXT.classes.noHistoryData}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {selectedSession ? (
                            /* SESSION DETAIL & EDIT ROSTER VIEW */
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedSession(null)}
                                        className="flex cursor-pointer items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-wine"
                                    >
                                        <ArrowLeft className="size-4" />
                                        <span>{UI_TEXT.classes.backToSessions}</span>
                                    </button>

                                    <div className="flex items-center gap-2">
                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                            {UI_TEXT.classes.subjectLabel} <strong>{getCourseName(selectedSession.courseId)}</strong>
                                        </span>
                                        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                                            {selectedSession.mode === SessionModeEnum.ONLINE ? onlineLabel : offlineLabel}
                                        </span>
                                    </div>
                                </div>

                                {isLoadingRoster ? (
                                    <div className="flex min-h-[280px] items-center justify-center gap-3 text-slate-400">
                                        <div className="size-6 animate-spin rounded-full border-2 border-slate-200 border-t-wine" />
                                        <span className="text-sm font-semibold">{UI_TEXT.classes.loadingRoster}</span>
                                    </div>
                                ) : sessionRoster.length === 0 ? (
                                    <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center text-slate-400">
                                        <Users className="size-8 text-slate-300" />
                                        <p className="text-sm font-bold text-slate-700">{UI_TEXT.classes.noRosterData}</p>
                                    </div>
                                ) : (
                                    <div className="custom-scrollbar max-h-[380px] overflow-x-auto rounded-2xl border border-line bg-white shadow-xs">
                                        <table className="w-full table-auto border-collapse text-left text-sm text-ink">
                                            <thead>
                                                <tr className="sticky top-0 z-10 border-b border-line bg-slate-50 text-[11px] font-bold tracking-wider text-muted uppercase">
                                                    <th className="w-12 px-4 py-3 text-center">{UI_TEXT.classes.thStt}</th>
                                                    <th className="px-4 py-3">{UI_TEXT.classes.thStudentCodeName}</th>
                                                    <th className="px-4 py-3 text-center">{UI_TEXT.classes.thNote}</th>
                                                    <th className="w-[420px] px-4 py-3 text-center whitespace-nowrap">{UI_TEXT.classes.thAttendanceStatus}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {sessionRoster.map((st, idx) => {
                                                    const sId = String(st.studentId || st.id || st._id || "");
                                                    const current = rosterMap[sId] || {
                                                        status: typeof st.status === "string" ? st.status : "PRESENT",
                                                        note: typeof st.note === "string" ? st.note : "",
                                                    };

                                                    return (
                                                        <tr key={sId || idx} className="group transition duration-150 hover:bg-slate-50">
                                                            <td className="border-b border-line px-4 py-3 text-center text-xs font-semibold text-muted">
                                                                {idx + 1}
                                                            </td>
                                                            <td className="border-b border-line px-4 py-3 whitespace-nowrap">
                                                                <div>
                                                                    <p className="text-xs font-bold text-ink">
                                                                        {typeof st.fullName === "string" ? st.fullName : UI_TEXT.common.defaultStudentName}
                                                                    </p>
                                                                    <p className="font-mono text-[11px] text-muted">
                                                                        {typeof st.studentCode === "string" ? st.studentCode : "-"}
                                                                    </p>
                                                                </div>
                                                            </td>
                                                            <td className="border-b border-line px-4 py-3 text-center">
                                                                <input
                                                                    type="text"
                                                                    placeholder={UI_TEXT.classes.placeholderNote}
                                                                    value={current.note}
                                                                    onChange={(e) => setNoteForStudent(sId, e.target.value)}
                                                                    className="w-full rounded-full border border-slate-200 px-3 py-1 text-center text-xs text-ink outline-none focus:border-wine"
                                                                />
                                                            </td>
                                                            <td className="w-[420px] border-b border-line px-4 py-3 text-center whitespace-nowrap">
                                                                <div className="flex flex-nowrap items-center justify-center gap-1 whitespace-nowrap">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setStatusForStudent(sId, AttendanceStatusEnum.PRESENT)}
                                                                        className={cx(
                                                                            "shrink-0 cursor-pointer rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap transition",
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
                                                                            "shrink-0 cursor-pointer rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap transition",
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
                                                                            "shrink-0 cursor-pointer rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap transition",
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
                                                                            "shrink-0 cursor-pointer rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap transition",
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
                            </div>
                        ) : /* SESSIONS LIST VIEW */
                        isLoadingSessions ? (
                            <div className="flex min-h-[220px] items-center justify-center gap-3 text-slate-400">
                                <div className="size-6 animate-spin rounded-full border-2 border-slate-200 border-t-wine" />
                                <span className="text-sm font-semibold">{UI_TEXT.classes.loadingHistory}</span>
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center text-slate-400">
                                <Calendar className="size-8 text-slate-300" />
                                <p className="text-sm font-bold text-slate-700">{UI_TEXT.classes.noHistoryData}</p>
                                <p className="text-xs text-slate-400">{UI_TEXT.classes.firstSessionHint}</p>
                            </div>
                        ) : (
                            <div className="custom-scrollbar max-h-[380px] overflow-x-auto rounded-2xl border border-line bg-white shadow-xs">
                                <table className="w-full table-auto border-collapse text-left text-sm text-ink">
                                    <thead>
                                        <tr className="sticky top-0 z-10 border-b border-line bg-slate-50 text-[11px] font-bold tracking-wider text-muted uppercase">
                                            <th className="w-12 px-4 py-3 text-center">{UI_TEXT.classes.thStt}</th>
                                            <th className="px-4 py-3">{UI_TEXT.classes.thDate}</th>
                                            <th className="px-4 py-3">{UI_TEXT.classes.thShift}</th>
                                            <th className="px-4 py-3">{UI_TEXT.classes.thSubject}</th>
                                            <th className="px-4 py-3 text-center">{UI_TEXT.classes.thMode}</th>
                                            <th className="px-4 py-3 text-center">{UI_TEXT.classes.thViewDetail}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {sessions.map((sess, idx) => {
                                            const formattedDate = sess.date ? new Date(sess.date).toLocaleDateString(localeVi) : "—";

                                            return (
                                                <tr key={getSessionId(sess) || idx} className="group transition duration-150 hover:bg-slate-50">
                                                    <td className="border-b border-line px-4 py-3 text-center text-xs font-semibold text-muted">{idx + 1}</td>
                                                    <td className="border-b border-line px-4 py-3 text-xs font-bold text-ink">{formattedDate}</td>
                                                    <td className="border-b border-line px-4 py-3 text-xs font-semibold text-slate-700">
                                                        {getShiftLabel(sess.period)}
                                                    </td>
                                                    <td className="border-b border-line px-4 py-3 text-xs font-semibold text-slate-900">
                                                        {getCourseName(sess.courseId)}
                                                    </td>
                                                    <td className="border-b border-line px-4 py-3 text-center">
                                                        <span
                                                            className={cx(
                                                                "inline-flex rounded-full px-2.5 py-0.5 text-[10.5px] font-bold",
                                                                sess.mode === SessionModeEnum.ONLINE
                                                                    ? "border border-purple-200 bg-purple-50 text-purple-700"
                                                                    : "border border-blue-200 bg-blue-50 text-blue-700",
                                                            )}
                                                        >
                                                            {sess.mode === SessionModeEnum.ONLINE ? onlineLabel : offlineLabel}
                                                        </span>
                                                    </td>
                                                    <td className="border-b border-line px-4 py-3 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenSessionDetail(sess)}
                                                            className="cursor-pointer rounded-full p-2 text-wine transition hover:bg-wine-soft"
                                                            title={UI_TEXT.classes.thViewDetail}
                                                        >
                                                            <Eye className="size-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
                        {selectedSession ? (
                            <>
                                <Button
                                    type="button"
                                    color="secondary"
                                    size="md"
                                    onClick={() => {
                                        if (onSelectSession) onSelectSession(selectedSession);
                                        handleCloseModal();
                                    }}
                                    className="gap-2 rounded-full border-slate-200 font-bold text-slate-700"
                                    iconLeading={<CheckCircle2 className="size-4 text-emerald-600" />}
                                >
                                    {UI_TEXT.classes.loadToMainScreen}
                                </Button>
                                <div className="flex items-center gap-2">
                                    <Button type="button" color="secondary" size="md" onClick={() => setSelectedSession(null)} className="rounded-full">
                                        {UI_TEXT.classes.cancelBtn}
                                    </Button>
                                    <Button
                                        type="button"
                                        color="primary"
                                        size="md"
                                        onClick={() => saveSessionMutation.mutate()}
                                        isLoading={saveSessionMutation.isPending}
                                        className="gap-2 rounded-full border-none bg-wine font-bold text-white"
                                        iconLeading={<Save className="size-4" />}
                                    >
                                        {UI_TEXT.classes.saveAttendanceChanges}
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="ml-auto">
                                <Button type="button" color="secondary" size="md" onClick={handleCloseModal} className="rounded-full">
                                    {UI_TEXT.classes.closeBtn}
                                </Button>
                            </div>
                        )}
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
