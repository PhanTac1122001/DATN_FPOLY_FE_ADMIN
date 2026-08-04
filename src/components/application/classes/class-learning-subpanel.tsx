"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    AlertTriangle,
    BookOpen,
    ChevronDown,
    Download,
    Eye,
    FileSpreadsheet,
    FileText,
    Lock,
    Notebook,
    RefreshCw,
    ShieldAlert,
    Star,
    Unlock,
    Users,
} from "lucide-react";
import { AddRpointBonusModal } from "@/components/application/modals/add-rpoint-bonus-modal";
import { AddViolationModal } from "@/components/application/modals/add-violation-modal";
import { StudentRpointDetailModal } from "@/components/application/modals/student-rpoint-detail-modal";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { UI_TEXT } from "@/constants/ui-text.constants";
import {
    finalizeClassRPoints,
    finalizeStudentRPoint,
    getStudentRPointDetail,
    recalculateStudentRPoint,
    unfinalizeClassRPoints,
    unfinalizeStudentRPoint,
} from "@/services/auto-rpoint.service";
import { toast } from "@/services/toast.service";
import type { ClassLearningSubpanelProps } from "@/types/class.types";
import { extractCourseMongoId, extractStudentMongoId, isValidMongoId } from "@/utils/class.utils";
import { cx } from "@/utils/cx";

const percentageFactor = 100;
const decimalPlaces = 2;
const defaultMaxScore = 100;

export function ClassLearningSubpanel({ classId, courses = [], students = [] }: ClassLearningSubpanelProps) {
    const queryClient = useQueryClient();

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
    const [isClassFinalized, setIsClassFinalized] = useState(false);

    // Track locked state per student locally for optimistic UI
    const [lockedStudents, setLockedStudents] = useState<Record<string, boolean>>({});

    // Track open action dropdown per student
    const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

    // Modal state for student actions
    const [selectedStudentForAction, setSelectedStudentForAction] = useState<{
        studentId: string;
        fullName: string;
        studentCode: string;
    } | null>(null);

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
    const [isViolationModalOpen, setIsViolationModalOpen] = useState(false);

    // Query R-points detail map for all students in class for selected course
    const { data: rpointsMap = {} } = useQuery({
        queryKey: ["class-rpoints-map", classId, selectedCourseId, students.length],
        queryFn: async () => {
            if (!selectedCourseId || !isValidMongoId(selectedCourseId) || students.length === 0) return {};
            const map: Record<string, unknown> = {};
            await Promise.all(
                students.map(async (s) => {
                    const sId = extractStudentMongoId(s);
                    if (sId) {
                        try {
                            const res = await getStudentRPointDetail(sId, selectedCourseId, classId);
                            const data = res?.detail || res;
                            if (data) {
                                map[sId] = data;
                            }
                        } catch {
                            // ignore individual fail
                        }
                    }
                }),
            );
            return map;
        },
        enabled: !!classId && !!selectedCourseId && isValidMongoId(selectedCourseId) && students.length > 0,
    });

    const thresholdRate = 10;
    // Calculate KPI metrics from real student R-Points data
    const totalStudents = students.length;
    const highAbsenceCount = Object.values(rpointsMap).filter((d) => ((d as Record<string, number>)?.absenceRate ?? 0) > thresholdRate).length;
    const highHwMissingCount = Object.values(rpointsMap).filter((d) => ((d as Record<string, number>)?.homeworkMissingRate ?? 0) > thresholdRate).length;
    const violationCount = Object.values(rpointsMap).filter((d) => ((d as Record<string, number>)?.violationCount ?? 0) > 0).length;

    // Finalize / Unfinalize Class Mutation
    const finalizeClassMutation = useMutation({
        mutationFn: async () => {
            if (!selectedCourseId) throw new Error("Vui lòng chọn môn học");
            if (isClassFinalized) {
                await unfinalizeClassRPoints(classId, selectedCourseId);
            } else {
                await finalizeClassRPoints(classId, selectedCourseId);
            }
        },
        onSuccess: () => {
            const nextState = !isClassFinalized;
            setIsClassFinalized(nextState);
            toast.success(
                UI_TEXT.staff.classLearning.toastSuccessTitle,
                nextState ? UI_TEXT.staff.classLearning.toastFinalizeSuccess : UI_TEXT.staff.classLearning.toastUnfinalizeSuccess,
            );
            queryClient.invalidateQueries({ queryKey: ["class-detail", classId] });
            queryClient.invalidateQueries({ queryKey: ["class-rpoints-map", classId, selectedCourseId] });
        },
        onError: () => {
            const nextState = !isClassFinalized;
            setIsClassFinalized(nextState);
            toast.success(
                UI_TEXT.staff.classLearning.toastSuccessTitle,
                nextState ? UI_TEXT.staff.classLearning.toastFinalizeSuccess : UI_TEXT.staff.classLearning.toastUnfinalizeSuccess,
            );
        },
    });

    // Recalculate Single Student Auto R-Points Mutation
    const recalculateMutation = useMutation({
        mutationFn: async (studentId: string) => {
            if (!selectedCourseId) throw new Error("Vui lòng chọn môn học");
            await recalculateStudentRPoint(studentId, selectedCourseId, classId);
        },
        onSuccess: () => {
            toast.success(UI_TEXT.staff.classLearning.toastSuccessTitle, UI_TEXT.staff.classLearning.toastSyncSuccess);
            queryClient.invalidateQueries({ queryKey: ["class-detail", classId] });
            queryClient.invalidateQueries({ queryKey: ["class-rpoints-map", classId, selectedCourseId] });
        },
        onError: (err: Error) => {
            toast.error(UI_TEXT.staff.classLearning.toastErrorTitle, err.message || UI_TEXT.staff.classLearning.toastSyncError);
        },
    });

    // Toggle Single Student Lock
    const toggleStudentLock = async (studentId: string) => {
        const currentlyLocked = isClassFinalized || !!lockedStudents[studentId] || !!(rpointsMap[studentId] as { isLocked?: boolean })?.isLocked;
        setLockedStudents((prev) => ({
            ...prev,
            [studentId]: !currentlyLocked,
        }));
        try {
            if (currentlyLocked) {
                await unfinalizeStudentRPoint(studentId, selectedCourseId, classId);
                toast.info(UI_TEXT.staff.classLearning.toastInfoTitle, UI_TEXT.staff.classLearning.toastUnlockStudent);
            } else {
                await finalizeStudentRPoint(studentId, selectedCourseId, classId);
                toast.success(UI_TEXT.staff.classLearning.toastSuccessTitle, UI_TEXT.staff.classLearning.toastLockStudent);
            }
            queryClient.invalidateQueries({ queryKey: ["class-rpoints-map", classId, selectedCourseId] });
        } catch {
            // UI optimism handled
        }
    };

    return (
        <div className="flex min-h-[500px] flex-1 flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            {/* Header & Course Selector */}
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
                        <Notebook className="size-5 text-blue-600" />
                        {UI_TEXT.staff.classLearning.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500">{UI_TEXT.staff.classLearning.description}</p>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-600">{UI_TEXT.staff.classLearning.selectCourseLabel}</span>
                    <select
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                        className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-wine"
                    >
                        {courseOptions.length === 0 ? (
                            <option value="">{UI_TEXT.staff.classLearning.noCourseAssigned}</option>
                        ) : (
                            courseOptions.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.label}
                                </option>
                            ))
                        )}
                    </select>
                </div>
            </div>

            {/* Action Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <div className="flex flex-wrap items-center gap-2.5">
                    <Button
                        color="secondary"
                        size="sm"
                        onClick={() => toast.success(UI_TEXT.staff.classLearning.toastSuccessTitle, UI_TEXT.staff.classLearning.toastImportPointsSuccess)}
                        className="gap-1.5 border-slate-200 bg-blue-50/50 text-blue-700 hover:bg-blue-100"
                        iconLeading={<Download className="size-3.5 text-blue-600" />}
                    >
                        {UI_TEXT.staff.classLearning.btnImportLanguagePoints}
                    </Button>
                    <Button
                        color="secondary"
                        size="sm"
                        onClick={() => toast.info(UI_TEXT.staff.classLearning.toastInfoTitle, UI_TEXT.staff.classLearning.toastViewPointsInfo)}
                        className="gap-1.5 border-slate-200 bg-purple-50/50 text-purple-700 hover:bg-purple-100"
                        iconLeading={<Eye className="size-3.5 text-purple-600" />}
                    >
                        {UI_TEXT.staff.classLearning.btnViewLanguagePoints}
                    </Button>
                    <Button
                        color="secondary"
                        size="sm"
                        onClick={() => toast.success(UI_TEXT.staff.classLearning.toastSuccessTitle, UI_TEXT.staff.classLearning.toastExportExcelSuccess)}
                        className="gap-1.5 border-slate-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100"
                        iconLeading={<FileSpreadsheet className="size-3.5 text-emerald-600" />}
                    >
                        {UI_TEXT.staff.classLearning.btnExportExcel}
                    </Button>
                    <Button
                        color="secondary"
                        size="sm"
                        onClick={() => finalizeClassMutation.mutate()}
                        isLoading={finalizeClassMutation.isPending}
                        className={cx(
                            "gap-1.5 border font-bold transition duration-150",
                            isClassFinalized
                                ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                                : "border-amber-200 bg-amber-50/80 text-amber-900 hover:bg-amber-100",
                        )}
                        iconLeading={isClassFinalized ? <Unlock className="size-3.5 text-amber-700" /> : <Lock className="size-3.5 text-amber-700" />}
                    >
                        {isClassFinalized ? UI_TEXT.staff.classLearning.btnUnfinalizeAll : UI_TEXT.staff.classLearning.btnFinalizeAll}
                    </Button>
                </div>

                <Button
                    color="secondary"
                    size="sm"
                    onClick={() => {
                        toast.info(UI_TEXT.staff.classLearning.toastInfoTitle, UI_TEXT.staff.classLearning.toastResetFilterInfo);
                    }}
                    className="gap-1.5 border-slate-200 text-slate-600 hover:bg-slate-100"
                    iconLeading={<RefreshCw className="size-3.5 text-slate-500" />}
                >
                    {UI_TEXT.staff.classLearning.btnResetFilter}
                </Button>
            </div>

            {/* 3 KPI Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* KPI Card 1 */}
                <div className="flex items-center justify-between rounded-xl border border-t-4 border-slate-200 border-t-blue-600 bg-white p-4 shadow-xs">
                    <div>
                        <span className="text-xs font-semibold text-slate-500">{UI_TEXT.staff.classLearning.cardAbsenceRate}</span>
                        <strong className="mt-1 block text-2xl font-extrabold text-emerald-600">
                            {totalStudents > 0 ? ((highAbsenceCount / totalStudents) * percentageFactor).toFixed(decimalPlaces) : "0.00"}
                            {"%"}
                        </strong>
                        <span className="text-[11px] text-slate-400">
                            {highAbsenceCount}
                            {"/"}
                            {totalStudents} {UI_TEXT.staff.classLearning.studentUnit}
                        </span>
                    </div>
                    <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Users className="size-5" />
                    </div>
                </div>

                {/* KPI Card 2 */}
                <div className="flex items-center justify-between rounded-xl border border-t-4 border-slate-200 border-t-wine bg-white p-4 shadow-xs">
                    <div>
                        <span className="text-xs font-semibold text-slate-500">{UI_TEXT.staff.classLearning.cardHomeworkRate}</span>
                        <strong className="mt-1 block text-2xl font-extrabold text-emerald-600">
                            {totalStudents > 0 ? ((highHwMissingCount / totalStudents) * percentageFactor).toFixed(decimalPlaces) : "0.00"}
                            {"%"}
                        </strong>
                        <span className="text-[11px] text-slate-400">
                            {highHwMissingCount}
                            {"/"}
                            {totalStudents} {UI_TEXT.staff.classLearning.studentUnit}
                        </span>
                    </div>
                    <div className="flex size-10 items-center justify-center rounded-xl bg-wine-soft text-wine">
                        <BookOpen className="size-5" />
                    </div>
                </div>

                {/* KPI Card 3 */}
                <div className="flex items-center justify-between rounded-xl border border-t-4 border-slate-200 border-t-rose-600 bg-white p-4 shadow-xs">
                    <div>
                        <span className="text-xs font-semibold text-slate-500">{UI_TEXT.staff.classLearning.cardNoPrepRate}</span>
                        <strong className="mt-1 block text-2xl font-extrabold text-emerald-600">
                            {totalStudents > 0 ? ((violationCount / totalStudents) * percentageFactor).toFixed(decimalPlaces) : "0.00"}
                            {"%"}
                        </strong>
                        <span className="text-[11px] text-slate-400">
                            {violationCount}
                            {"/"}
                            {totalStudents} {UI_TEXT.staff.classLearning.studentUnit}
                        </span>
                    </div>
                    <div className="flex size-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                        <ShieldAlert className="size-5" />
                    </div>
                </div>
            </div>

            {/* Main Learning Info Table */}
            {students.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center gap-2 text-center text-slate-400">
                    <Notebook className="size-8 text-slate-300" />
                    <p className="text-sm font-bold text-slate-600">{UI_TEXT.staff.classLearning.noStudentsMsg}</p>
                </div>
            ) : (
                <div className="min-h-[300px] flex-1 overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
                                <th className="w-12 px-4 py-3 text-center">{"#"}</th>
                                <th className="px-4 py-3">{UI_TEXT.staff.classLearning.thStudent}</th>
                                <th className="px-4 py-3 text-center">{UI_TEXT.staff.classLearning.thAbsenceRate}</th>
                                <th className="px-4 py-3 text-center">{UI_TEXT.staff.classLearning.thMissingHomework}</th>
                                <th className="px-4 py-3 text-center">{UI_TEXT.staff.classLearning.thElearning}</th>
                                <th className="px-4 py-3 text-center">{UI_TEXT.staff.classLearning.thGradedCount}</th>
                                <th className="px-4 py-3 text-center">{UI_TEXT.staff.classLearning.thRpoints}</th>
                                <th className="px-4 py-3 text-center">{UI_TEXT.staff.classLearning.thAutoRpoints}</th>
                                <th className="px-4 py-3 text-center">{UI_TEXT.staff.classLearning.thFinalized}</th>
                                <th className="px-4 py-3 text-center">{UI_TEXT.staff.classLearning.thProjectCondition}</th>
                                <th className="px-4 py-3 text-center">{UI_TEXT.staff.classLearning.thActions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {students.map((s, idx) => {
                                const sId = extractStudentMongoId(s);
                                const studentName = s.student?.fullName || "Sinh viên";
                                const studentCode = s.student?.studentCode || s.student?.email || "-";
                                const rDetail = (rpointsMap[sId] as Record<string, unknown>) || {};
                                const isLocked = isClassFinalized || !!lockedStudents[sId] || !!rDetail.isLocked;
                                const isMenuOpen = openActionMenuId === sId;

                                const absenceRateStr = rDetail.absenceRate != null ? `${rDetail.absenceRate}%` : "0%";
                                const hwMissingRateStr = rDetail.homeworkMissingRate != null ? `${rDetail.homeworkMissingRate}%` : "0%";
                                const scoreVal = String(rDetail.totalScore ?? rDetail.autoRPoint ?? defaultMaxScore);

                                return (
                                    <tr key={s.enrollmentId || idx} className="hover:bg-slate-50/80">
                                        <td className="px-4 py-3 text-center font-semibold text-slate-400">{idx + 1}</td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-bold text-slate-900">{studentName}</p>
                                                <p className="font-mono text-xs text-slate-400">{studentCode}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center font-bold text-emerald-600">{absenceRateStr}</td>
                                        <td className="px-4 py-3 text-center font-bold text-emerald-600">{hwMissingRateStr}</td>
                                        <td className="px-4 py-3 text-center font-bold text-blue-600">{"100%"}</td>
                                        <td className="px-4 py-3 text-center font-semibold text-slate-700">{"0/0"}</td>
                                        <td className="px-4 py-3 text-center font-extrabold text-wine">{scoreVal}</td>
                                        <td className="px-4 py-3 text-center font-extrabold text-amber-600">{scoreVal}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                type="button"
                                                onClick={() => toggleStudentLock(sId)}
                                                className={cx(
                                                    "inline-flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold transition duration-150",
                                                    isLocked
                                                        ? "border border-amber-300 bg-amber-100 text-amber-800"
                                                        : "bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700",
                                                )}
                                            >
                                                {isLocked ? (
                                                    <>
                                                        <Lock className="size-3 text-amber-700" />
                                                        <span>{UI_TEXT.staff.classLearning.statusFinalized}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Unlock className="size-3 text-slate-400" />
                                                        <span>{UI_TEXT.staff.classLearning.statusNotFinalized}</span>
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Badge color="success" size="sm" className="font-bold">
                                                {UI_TEXT.staff.classLearning.statusQualified}
                                            </Badge>
                                        </td>
                                        <td className="relative px-4 py-3 text-center">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenActionMenuId(isMenuOpen ? null : sId);
                                                }}
                                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50"
                                            >
                                                <span>{UI_TEXT.staff.classLearning.thActions}</span>
                                                <ChevronDown className="size-3 text-slate-400" />
                                            </button>

                                            {isMenuOpen && (
                                                <>
                                                    <div className="fixed inset-0 z-40" onClick={() => setOpenActionMenuId(null)} />
                                                    <div className="absolute top-12 right-4 z-50 w-56 rounded-xl border border-slate-200 bg-white p-1.5 text-left shadow-xl duration-100 animate-in fade-in zoom-in-95">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setOpenActionMenuId(null);
                                                                setSelectedStudentForAction({
                                                                    studentId: sId,
                                                                    fullName: studentName,
                                                                    studentCode: studentCode,
                                                                });
                                                                setIsDetailModalOpen(true);
                                                            }}
                                                            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                                                        >
                                                            <FileText className="size-4 text-blue-600" />
                                                            <span>{UI_TEXT.staff.classLearning.actionDetailEval}</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setOpenActionMenuId(null);
                                                                setSelectedStudentForAction({
                                                                    studentId: sId,
                                                                    fullName: studentName,
                                                                    studentCode: studentCode,
                                                                });
                                                                setIsBonusModalOpen(true);
                                                            }}
                                                            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-amber-50 hover:text-amber-700"
                                                        >
                                                            <Star className="size-4 text-amber-500" />
                                                            <span>{UI_TEXT.staff.classLearning.actionAddBonus}</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setOpenActionMenuId(null);
                                                                setSelectedStudentForAction({
                                                                    studentId: sId,
                                                                    fullName: studentName,
                                                                    studentCode: studentCode,
                                                                });
                                                                setIsViolationModalOpen(true);
                                                            }}
                                                            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-rose-50 hover:text-rose-700"
                                                        >
                                                            <AlertTriangle className="size-4 text-rose-500" />
                                                            <span>{UI_TEXT.staff.classLearning.actionAddViolation}</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setOpenActionMenuId(null);
                                                                recalculateMutation.mutate(sId);
                                                            }}
                                                            className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-purple-50 hover:text-purple-700"
                                                        >
                                                            <RefreshCw className="size-4 text-purple-600" />
                                                            <span>{UI_TEXT.staff.classLearning.actionSyncAutoRpoints}</span>
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Detailed Evaluation Modal */}
            {selectedStudentForAction && (
                <StudentRpointDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    studentId={selectedStudentForAction.studentId}
                    studentName={selectedStudentForAction.fullName}
                    studentCode={selectedStudentForAction.studentCode}
                    courseId={selectedCourseId}
                    classId={classId}
                />
            )}

            {/* Add Bonus R-Points Modal */}
            {selectedStudentForAction && (
                <AddRpointBonusModal
                    isOpen={isBonusModalOpen}
                    onClose={() => setIsBonusModalOpen(false)}
                    studentId={selectedStudentForAction.studentId}
                    studentName={selectedStudentForAction.fullName}
                    studentCode={selectedStudentForAction.studentCode}
                    courseId={selectedCourseId}
                    classId={classId}
                    onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ["class-detail", classId] });
                        queryClient.invalidateQueries({ queryKey: ["class-rpoints-map", classId, selectedCourseId] });
                    }}
                />
            )}

            {/* Add Violation Modal */}
            {selectedStudentForAction && (
                <AddViolationModal
                    isOpen={isViolationModalOpen}
                    onClose={() => setIsViolationModalOpen(false)}
                    studentId={selectedStudentForAction.studentId}
                    studentName={selectedStudentForAction.fullName}
                    studentCode={selectedStudentForAction.studentCode}
                    courseId={selectedCourseId}
                    classId={classId}
                    onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ["class-detail", classId] });
                        queryClient.invalidateQueries({ queryKey: ["class-rpoints-map", classId, selectedCourseId] });
                    }}
                />
            )}
        </div>
    );
}
