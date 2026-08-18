"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, BookOpen, CheckCircle2, Trash2, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { completeStudentElearning, getAttendanceRoster, getAttendanceSessions } from "@/services/attendance.service";
import { toast } from "@/services/toast.service";
import type { UncompletedElearningModalProps } from "@/types/class.types";

export function UncompletedElearningModal({
    isOpen,
    onClose,
    studentId,
    studentName,
    studentCode,
    classId,
    courseId,
    isLocked = false,
}: UncompletedElearningModalProps) {
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: async (classSessionId: string) => {
            if (isLocked) {
                toast.warning(UI_TEXT.staff.classLearning.toastInfoTitle, UI_TEXT.uncompletedElearningModal.toastFinalizedLocked);
                return;
            }
            await completeStudentElearning(classSessionId, studentId);
        },
        onSuccess: () => {
            toast.success(UI_TEXT.uncompletedElearningModal.toastDeleteSuccess);
            queryClient.invalidateQueries({ queryKey: ["sessions-rosters-map"] });
            queryClient.invalidateQueries({ queryKey: ["class-rpoints-map"] });
            queryClient.invalidateQueries({ queryKey: ["course-class-statistics"] });
            queryClient.invalidateQueries({ queryKey: ["class-detail"] });
        },
        onError: () => {
            toast.error(UI_TEXT.uncompletedElearningModal.toastDeleteError);
        },
    });
    const { data: sessions = [], isLoading: isLoadingSessions } = useQuery({
        queryKey: ["class-attendance-sessions-modal", classId, courseId],
        queryFn: () => getAttendanceSessions({ classId, courseId }),
        enabled: isOpen && !!classId && !!courseId,
    });

    const uniqueSessions = useMemo(() => {
        const map = new Map<string, (typeof sessions)[0]>();
        for (const sess of sessions) {
            const sObj = sess as unknown as Record<string, unknown>;
            const populatedSession = typeof sObj.sessionId === "object" && sObj.sessionId !== null ? (sObj.sessionId as Record<string, unknown>) : null;
            const curriculumSessionId = String(populatedSession?._id || populatedSession?.id || sObj.sessionId || "");
            const key = curriculumSessionId || String(sess.id || sObj._id || "");
            if (key && !map.has(key)) {
                map.set(key, sess);
            }
        }
        return Array.from(map.values());
    }, [sessions]);

    const { data: sessionRostersMap = {}, isLoading: isLoadingRosters } = useQuery({
        queryKey: [
            "sessions-rosters-map",
            classId,
            courseId,
            studentId,
            uniqueSessions.map((s) => s.id || (s as unknown as Record<string, unknown>)._id).join(","),
        ],
        queryFn: async () => {
            const map: Record<string, boolean> = {};
            await Promise.all(
                uniqueSessions.map(async (sess) => {
                    const sId = String(sess.id || (sess as unknown as Record<string, unknown>)._id || "");
                    if (!sId) return;
                    try {
                        const rosterRes = await getAttendanceRoster(sId);
                        const rawData = (rosterRes as unknown as Record<string, unknown>)?.data ?? rosterRes;
                        const rosterList: Record<string, unknown>[] = Array.isArray(rawData)
                            ? rawData
                            : Array.isArray((rawData as Record<string, unknown>)?.roster)
                              ? ((rawData as Record<string, unknown>).roster as Record<string, unknown>[])
                              : [];
                        const stItem = rosterList.find((r) => String(r.studentId) === studentId);
                        if (stItem) {
                            map[sId] = stItem.isSessionCompleted === true;
                        }
                    } catch {
                        // ignore fail
                    }
                }),
            );
            return map;
        },
        enabled: isOpen && uniqueSessions.length > 0 && !!studentId,
    });

    const isLoading = isLoadingSessions || isLoadingRosters;

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="max-w-4xl rounded-[24px] border-none bg-white p-0 shadow-2xl">
                <Dialog className="flex flex-col outline-none">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 font-bold text-rose-600">
                                <BookOpen className="size-5" />
                            </div>
                            <div>
                                <Heading slot="title" className="text-lg font-extrabold text-slate-900">
                                    {UI_TEXT.uncompletedElearningModal.title}
                                </Heading>
                                <p className="mt-0.5 text-xs font-medium text-slate-500">
                                    {UI_TEXT.uncompletedElearningModal.studentPrefix} <strong className="font-extrabold text-slate-900">{studentName}</strong>{" "}
                                    {`(${studentCode})`}
                                </p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            color="tertiary"
                            size="sm"
                            onClick={onClose}
                            iconLeading={<X className="size-5" />}
                            aria-label="Close modal"
                            className="rounded-full !p-1.5 text-slate-400 hover:text-slate-600"
                        />
                    </div>

                    {/* Body */}
                    <div className="px-6 py-5">
                        {isLoading ? (
                            <div className="flex h-48 items-center justify-center gap-2 text-xs font-semibold text-slate-500">
                                <div className="size-5 animate-spin rounded-full border-2 border-slate-200 border-t-rose-600" />
                                {UI_TEXT.uncompletedElearningModal.loadingList}
                            </div>
                        ) : uniqueSessions.length === 0 ? (
                            <div className="flex h-40 flex-col items-center justify-center gap-2 text-center text-slate-400">
                                <AlertCircle className="size-8 text-slate-300" />
                                <p className="text-sm font-bold text-slate-600">{UI_TEXT.uncompletedElearningModal.noSessionsSet}</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="max-h-96 overflow-y-auto rounded-2xl border border-slate-100 bg-white">
                                    <table className="w-full text-left text-xs whitespace-nowrap">
                                        <thead>
                                            <tr className="border-b border-slate-100 bg-slate-50 font-bold text-slate-500 uppercase">
                                                <th className="w-12 px-4 py-3 text-center">{UI_TEXT.uncompletedElearningModal.thStt}</th>
                                                <th className="px-4 py-3">{UI_TEXT.uncompletedElearningModal.thSession}</th>
                                                <th className="px-4 py-3 text-center">{UI_TEXT.uncompletedElearningModal.thDate}</th>
                                                <th className="px-4 py-3 text-center">{UI_TEXT.uncompletedElearningModal.thElearningStatus}</th>
                                                <th className="w-20 px-4 py-3 text-center">{UI_TEXT.uncompletedElearningModal.thActions}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {uniqueSessions.map((sess, idx) => {
                                                const sObj = sess as unknown as Record<string, unknown>;
                                                const sId = String(sess.id || sObj._id || "");
                                                const isCompleted = sessionRostersMap[sId] === true;

                                                const populatedSession =
                                                    typeof sObj.sessionId === "object" && sObj.sessionId !== null
                                                        ? (sObj.sessionId as Record<string, unknown>)
                                                        : null;
                                                const curriculumSessionName = populatedSession?.name ? String(populatedSession.name) : "";
                                                const periodNum =
                                                    sess.period || (populatedSession?.position != null ? Number(populatedSession.position) : idx + 1);

                                                let sessName = "";
                                                if (curriculumSessionName) {
                                                    sessName = curriculumSessionName;
                                                } else if (sess.topic) {
                                                    sessName = sess.topic.replace(/^Buổi\s*\d+:?\s*/i, "");
                                                } else {
                                                    sessName = `Session ${periodNum}`;
                                                }

                                                const dateStr = sess.date ? new Date(sess.date).toLocaleDateString("vi-VN") : "—";

                                                return (
                                                    <tr key={sId || idx} className="hover:bg-slate-50">
                                                        <td className="px-4 py-3 text-center font-bold text-slate-400">{idx + 1}</td>
                                                        <td className="px-4 py-3 font-bold text-slate-800">{sessName}</td>
                                                        <td className="px-4 py-3 text-center font-medium text-slate-500">{dateStr}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            {isCompleted ? (
                                                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                                                                    <CheckCircle2 className="size-3 text-emerald-600" />
                                                                    {UI_TEXT.uncompletedElearningModal.statusCompleted}
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700">
                                                                    <AlertCircle className="size-3 text-rose-600" />
                                                                    {UI_TEXT.uncompletedElearningModal.statusUncompleted}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            {!isCompleted && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        if (isLocked) {
                                                                            toast.warning(
                                                                                UI_TEXT.staff.classLearning.toastInfoTitle,
                                                                                UI_TEXT.uncompletedElearningModal.toastFinalizedLocked,
                                                                            );
                                                                            return;
                                                                        }
                                                                        deleteMutation.mutate(sId);
                                                                    }}
                                                                    disabled={isLocked || deleteMutation.isPending}
                                                                    title={
                                                                        isLocked
                                                                            ? UI_TEXT.uncompletedElearningModal.toastFinalizedLocked
                                                                            : UI_TEXT.uncompletedElearningModal.deleteBtnTooltip
                                                                    }
                                                                    aria-label={UI_TEXT.uncompletedElearningModal.deleteBtnTooltip}
                                                                    className={`inline-flex size-7 items-center justify-center rounded-lg border transition ${
                                                                        isLocked
                                                                            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-60"
                                                                            : "cursor-pointer border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white disabled:opacity-50"
                                                                    }`}
                                                                >
                                                                    <Trash2 className="size-3.5" />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
