"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, BookOpen, Download, Eye, FileSpreadsheet, FileText, Lock, Notebook, RefreshCw, ShieldAlert, Star, Unlock, Users } from "lucide-react";
import { AddRpointBonusModal } from "@/components/application/modals/add-rpoint-bonus-modal";
import { AddViolationModal } from "@/components/application/modals/add-violation-modal";
import { StudentRpointDetailModal } from "@/components/application/modals/student-rpoint-detail-modal";
import { UncompletedElearningModal } from "@/components/application/modals/uncompleted-elearning-modal";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { Select } from "@/components/base/select/select";
import { UI_TEXT } from "@/constants/ui-text.constants";
import {
    finalizeClassRPoints,
    finalizeStudentRPoint,
    getCourseRpointFormula,
    getStudentRPointDetail,
    recalculateStudentRPoint,
} from "@/services/auto-rpoint.service";
import { getCourseClassStatistics, getCourseClassesByClassId } from "@/services/class.service";
import { toast } from "@/services/toast.service";
import type { ClassLearningSubpanelProps } from "@/types/class.types";
import { extractCourseMongoId, extractStudentMongoId, formatPercent, isValidMongoId } from "@/utils/class.utils";
import { cx } from "@/utils/cx";

const percentageFactor = 100;
const decimalPlaces = 2;
const defaultMaxScore = 100;
const passingScoreThreshold = 80;
const maxPercentageVal = 100;
const minTopOffsetIndex = 2;
const bottomThresholdCount = 3;
const defaultDeductionThreshold = 20;
const defaultDeductionScale = 100;

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

    const [selectedCourseId, setSelectedCourseId] = useState<string>("");

    // Reset selectedCourseId if current selection is no longer in courseOptions
    useEffect(() => {
        if (selectedCourseId && courseOptions.length > 0 && !courseOptions.some((opt) => opt.id === selectedCourseId)) {
            setSelectedCourseId("");
        }
    }, [courseOptions, selectedCourseId]);

    const [isClassFinalized, setIsClassFinalized] = useState(false);

    // Track locked state per student locally for optimistic UI
    const [lockedStudents, setLockedStudents] = useState<Record<string, boolean>>({});

    // Modal state for student actions
    const [selectedStudentForAction, setSelectedStudentForAction] = useState<{
        studentId: string;
        fullName: string;
        studentCode: string;
    } | null>(null);

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
    const [isViolationModalOpen, setIsViolationModalOpen] = useState(false);
    const [isElearningModalOpen, setIsElearningModalOpen] = useState(false);

    // Query R-points detail map for all students in class for selected course
    const { data: rpointsMap = {} } = useQuery({
        queryKey: ["class-rpoints-map", classId, selectedCourseId],
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

    const { data: courseClassesList = [] } = useQuery({
        queryKey: ["class-course-classes", classId],
        queryFn: () => getCourseClassesByClassId(classId),
        enabled: !!classId && isValidMongoId(classId),
    });

    const selectedCourseClass = courseClassesList.find(
        (cc: { courseId?: unknown; id?: string; _id?: string }) =>
            extractCourseMongoId(cc as Parameters<typeof extractCourseMongoId>[0]) === selectedCourseId ||
            cc.id === selectedCourseId ||
            String(cc._id) === selectedCourseId,
    );
    const courseClassId = selectedCourseClass?.id || selectedCourseClass?._id;

    const { data: courseClassStats } = useQuery({
        queryKey: ["course-class-statistics", courseClassId],
        queryFn: () => getCourseClassStatistics(String(courseClassId)),
        enabled: !!courseClassId && isValidMongoId(String(courseClassId)),
    });

    const elearningStatsByStudent = useMemo(() => {
        const map: Record<string, { onTimeSessions: number; lateSessions: number; tickedSessions: number; rate: number | null }> = {};
        if (courseClassStats?.students && Array.isArray(courseClassStats.students)) {
            for (const st of courseClassStats.students) {
                if (st.studentId && st.elearning) {
                    map[String(st.studentId)] = st.elearning;
                }
            }
        }
        return map;
    }, [courseClassStats]);

    // Query Course R-Point Formula for dynamic thresholds
    const { data: formulaRes } = useQuery({
        queryKey: ["course-rpoint-formula", selectedCourseId],
        queryFn: () => getCourseRpointFormula(selectedCourseId),
        enabled: !!selectedCourseId && isValidMongoId(selectedCourseId),
    });

    const rpointFormula = formulaRes?.formula;

    const maxAbsenceThreshold = useMemo(() => {
        if (!rpointFormula?.attendance?.deductionPerPercent || rpointFormula.attendance.deductionPerPercent <= 0) return defaultDeductionThreshold;
        return Math.round((rpointFormula.attendance.max / rpointFormula.attendance.deductionPerPercent) * defaultDeductionScale) / defaultDeductionScale;
    }, [rpointFormula]);

    const maxHomeworkThreshold = useMemo(() => {
        if (!rpointFormula?.assignment?.deductionPerPercent || rpointFormula.assignment.deductionPerPercent <= 0) return defaultDeductionThreshold;
        return Math.round((rpointFormula.assignment.max / rpointFormula.assignment.deductionPerPercent) * defaultDeductionScale) / defaultDeductionScale;
    }, [rpointFormula]);

    // Sync class finalized state automatically when all student records are locked
    const isAllStudentsLocked = useMemo(() => {
        if (students.length === 0 || Object.keys(rpointsMap).length === 0) return false;
        return students.every((s) => {
            const sId = extractStudentMongoId(s);
            const rDetail = rpointsMap[sId] as { isLocked?: boolean } | undefined;
            return !!rDetail?.isLocked;
        });
    }, [students, rpointsMap]);

    useEffect(() => {
        if (Object.keys(rpointsMap).length > 0) {
            setIsClassFinalized(isAllStudentsLocked);
        }
    }, [isAllStudentsLocked, rpointsMap]);

    const selectedCourseItem = courses.find((c) => extractCourseMongoId(c) === selectedCourseId);
    const selectedCourseObj = typeof selectedCourseItem?.courseId === "object" ? (selectedCourseItem.courseId as Record<string, unknown>) : null;
    const courseTotalSessions = Number(selectedCourseObj?.totalSessions || (selectedCourseItem as unknown as Record<string, unknown>)?.totalSessions || 0);

    const calcStudentAbsenceRate = useCallback(
        (d: Record<string, unknown>, isLocked?: boolean) => {
            if (d?.absenceRate != null) return Number(d.absenceRate);
            if (isLocked) return 0;
            let rate = 0;
            if (courseTotalSessions > 0) {
                if (d?.absenceCount != null || d?.absentCount != null) {
                    const count = Number(d.absenceCount ?? d.absentCount ?? 0);
                    rate = (count / courseTotalSessions) * percentageFactor;
                } else if (d?.totalSessions && Number(d.totalSessions) > 0 && rate > 0) {
                    const count = (rate / percentageFactor) * Number(d.totalSessions);
                    rate = (count / courseTotalSessions) * percentageFactor;
                }
            }
            return rate;
        },
        [courseTotalSessions],
    );

    const calcHwMissingRate = useCallback((d: Record<string, unknown>, isLocked?: boolean) => {
        if (d?.homeworkMissingRate != null) return Number(d.homeworkMissingRate);
        if (d?.submissionRate != null) return Math.max(0, maxPercentageVal - Number(d.submissionRate));
        if (isLocked) return 0;
        return 0;
    }, []);

    // Helper to compute per-student effective thresholds and RED alert status considering locked formula snapshots
    const getStudentThresholdAndAlert = useCallback(
        (rDetail: Record<string, unknown>, fallbackAbsenceThresh: number, fallbackHwThresh: number) => {
            const isLocked = !!rDetail?.isLocked;
            let absThresh = fallbackAbsenceThresh;
            let hwThresh = fallbackHwThresh;

            const formula = rDetail?.formulaSnapshot as Record<string, Record<string, unknown>> | undefined;
            if (formula?.attendance?.deductionPerPercent && Number(formula.attendance.deductionPerPercent) > 0) {
                absThresh =
                    Math.round((Number(formula.attendance.max) / Number(formula.attendance.deductionPerPercent)) * defaultDeductionScale) /
                    defaultDeductionScale;
            } else if (isLocked) {
                // Infer attendance threshold from locked snapshot scores if formulaSnapshot is missing
                const attScore = rDetail?.attendanceScore != null ? Number(rDetail.attendanceScore) : null;
                const absRate = rDetail?.absenceRate != null ? Number(rDetail.absenceRate) : null;
                const attMax = Number(formula?.attendance?.max ?? defaultDeductionThreshold);
                if (attScore != null && absRate != null && absRate > 0 && attScore > 0 && attScore < attMax) {
                    const inferredDeduction = (attMax - attScore) / absRate;
                    if (inferredDeduction > 0) {
                        absThresh = Math.round((attMax / inferredDeduction) * defaultDeductionScale) / defaultDeductionScale;
                    }
                }
            }

            if (formula?.assignment?.deductionPerPercent && Number(formula.assignment.deductionPerPercent) > 0) {
                hwThresh =
                    Math.round((Number(formula.assignment.max) / Number(formula.assignment.deductionPerPercent)) * defaultDeductionScale) /
                    defaultDeductionScale;
            } else if (isLocked) {
                // Infer assignment threshold from locked snapshot scores if formulaSnapshot is missing
                const hwScore = rDetail?.assignmentScore != null ? Number(rDetail.assignmentScore) : null;
                const missRate =
                    rDetail?.homeworkMissingRate != null
                        ? Number(rDetail.homeworkMissingRate)
                        : rDetail?.submissionRate != null
                          ? Math.max(0, maxPercentageVal - Number(rDetail.submissionRate))
                          : null;
                const hwMax = Number(formula?.assignment?.max ?? defaultDeductionThreshold);
                if (hwScore != null && missRate != null && missRate > 0 && hwScore > 0 && hwScore < hwMax) {
                    const inferredDeduction = (hwMax - hwScore) / missRate;
                    if (inferredDeduction > 0) {
                        hwThresh = Math.round((hwMax / inferredDeduction) * defaultDeductionScale) / defaultDeductionScale;
                    }
                }
            }

            const absenceRateVal = calcStudentAbsenceRate(rDetail, isLocked);
            const hwMissingRateVal = calcHwMissingRate(rDetail, isLocked);

            // Invariant: if locked and attendanceScore > 0, attendance rate did NOT reach the threshold when locked
            const attScore = rDetail?.attendanceScore != null ? Number(rDetail.attendanceScore) : null;
            const isAbsenceRed = isLocked && attScore != null && attScore > 0 ? false : absenceRateVal >= absThresh && absThresh > 0;

            const hwScore = rDetail?.assignmentScore != null ? Number(rDetail.assignmentScore) : null;
            const isHwMissingRed = isLocked && hwScore != null && hwScore > 0 ? false : hwMissingRateVal >= hwThresh && hwThresh > 0;

            return { absThresh, hwThresh, absenceRateVal, hwMissingRateVal, isAbsenceRed, isHwMissingRed };
        },
        [calcStudentAbsenceRate, calcHwMissingRate],
    );

    const getStudentRateColor = (rateVal: number, isRed: boolean) => {
        if (isRed) return "text-rose-600 font-extrabold";
        if (rateVal > 0) return "text-amber-600 font-extrabold";
        return "text-emerald-600 font-bold";
    };

    // Calculate KPI metrics using per-student threshold logic
    const totalStudents = students.length;
    const highAbsenceCount = Object.values(rpointsMap).filter((d) => {
        return getStudentThresholdAndAlert(d as Record<string, unknown>, maxAbsenceThreshold, maxHomeworkThreshold).isAbsenceRed;
    }).length;

    const highHwMissingCount = Object.values(rpointsMap).filter((d) => {
        return getStudentThresholdAndAlert(d as Record<string, unknown>, maxAbsenceThreshold, maxHomeworkThreshold).isHwMissingRed;
    }).length;

    const noPrepCount = students.filter((s) => {
        const sId = extractStudentMongoId(s);
        const rDetail = (rpointsMap[sId] as Record<string, unknown>) || {};
        if (rDetail.isLocked && rDetail.lateCount != null) {
            return Number(rDetail.lateCount) > 0;
        }
        const eStat = elearningStatsByStudent[sId];
        if (eStat) return Number(eStat.lateSessions || 0) > 0;
        return Number(rDetail.lateCount ?? 0) > 0;
    }).length;

    // Display threshold in card title (use locked class threshold if any student is locked)
    const displayAbsenceThreshold = useMemo(() => {
        const lockedStudent = students.find((s) => {
            const sId = extractStudentMongoId(s);
            const rDetail = (rpointsMap[sId] as Record<string, unknown>) || {};
            return !!rDetail.isLocked;
        });
        if (lockedStudent) {
            const sId = extractStudentMongoId(lockedStudent);
            const rDetail = (rpointsMap[sId] as Record<string, unknown>) || {};
            const info = getStudentThresholdAndAlert(rDetail, maxAbsenceThreshold, maxHomeworkThreshold);
            return info.absThresh;
        }
        return maxAbsenceThreshold;
    }, [students, rpointsMap, maxAbsenceThreshold, maxHomeworkThreshold, getStudentThresholdAndAlert]);

    const displayHwThreshold = useMemo(() => {
        const lockedStudent = students.find((s) => {
            const sId = extractStudentMongoId(s);
            const rDetail = (rpointsMap[sId] as Record<string, unknown>) || {};
            return !!rDetail.isLocked;
        });
        if (lockedStudent) {
            const sId = extractStudentMongoId(lockedStudent);
            const rDetail = (rpointsMap[sId] as Record<string, unknown>) || {};
            const info = getStudentThresholdAndAlert(rDetail, maxAbsenceThreshold, maxHomeworkThreshold);
            return info.hwThresh;
        }
        return maxHomeworkThreshold;
    }, [students, rpointsMap, maxAbsenceThreshold, maxHomeworkThreshold, getStudentThresholdAndAlert]);

    const absenceCardRate = totalStudents > 0 ? (highAbsenceCount / totalStudents) * percentageFactor : 0;
    const hwCardRate = totalStudents > 0 ? (highHwMissingCount / totalStudents) * percentageFactor : 0;
    const noPrepCardRate = totalStudents > 0 ? (noPrepCount / totalStudents) * percentageFactor : 0;

    const getKpiCardColorClass = (count: number): string => {
        if (count > 0) return "text-rose-600";
        return "text-emerald-600";
    };

    const handleRefreshRPoints = () => {
        queryClient.invalidateQueries({ queryKey: ["class-detail"] });
        queryClient.invalidateQueries({ queryKey: ["class-rpoints-map"] });
        queryClient.invalidateQueries({ queryKey: ["student-rpoint-detail"] });
        queryClient.invalidateQueries({ queryKey: ["course-class-statistics"] });
        queryClient.invalidateQueries({ queryKey: ["course-rpoint-formula"] });
    };

    // Finalize Class Mutation (Cannot be unfinalized once locked)
    const finalizeClassMutation = useMutation({
        mutationFn: async () => {
            if (!selectedCourseId) throw new Error("Vui lòng chọn môn học");
            if (isClassFinalized) {
                toast.warning(UI_TEXT.staff.classLearning.toastInfoTitle, UI_TEXT.staff.classLearning.toastClassFinalizedLocked);
                return;
            }
            await finalizeClassRPoints(classId, selectedCourseId);
        },
        onSuccess: () => {
            if (!isClassFinalized) {
                setIsClassFinalized(true);
                toast.success(UI_TEXT.staff.classLearning.toastSuccessTitle, UI_TEXT.staff.classLearning.toastFinalizeSuccess);
                handleRefreshRPoints();
            }
        },
        onError: (err: Error) => {
            toast.error(UI_TEXT.staff.classLearning.toastErrorTitle, err.message || "Không thể chốt điểm lớp!");
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
            handleRefreshRPoints();
        },
        onError: (err: Error) => {
            toast.error(UI_TEXT.staff.classLearning.toastErrorTitle, err.message || UI_TEXT.staff.classLearning.toastSyncError);
        },
    });

    // Toggle Single Student Lock (Cannot unlock once locked)
    const toggleStudentLock = async (studentId: string) => {
        const currentlyLocked = isClassFinalized || !!lockedStudents[studentId] || !!(rpointsMap[studentId] as { isLocked?: boolean })?.isLocked;
        if (currentlyLocked) {
            toast.warning(UI_TEXT.staff.classLearning.toastInfoTitle, UI_TEXT.staff.classLearning.toastStudentFinalizedLocked);
            return;
        }
        setLockedStudents((prev) => ({
            ...prev,
            [studentId]: true,
        }));
        try {
            await finalizeStudentRPoint(studentId, selectedCourseId, classId);
            toast.success(UI_TEXT.staff.classLearning.toastSuccessTitle, UI_TEXT.staff.classLearning.toastLockStudent);
            queryClient.invalidateQueries({ queryKey: ["class-rpoints-map", classId, selectedCourseId] });
        } catch {
            // UI optimism handled
        }
    };

    return (
        <div className="flex min-h-[500px] flex-1 flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            {/* Header */}
            <div className="border-b border-slate-100 pb-4">
                <h3 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
                    <Notebook className="size-5 text-blue-600" />
                    {UI_TEXT.staff.classLearning.title}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">{UI_TEXT.staff.classLearning.description}</p>
            </div>

            {/* Action & Filter Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                {/* Left Side: Selectors (Course) */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Course Select */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-600">{UI_TEXT.staff.classLearning.selectCourseLabel}</span>
                        <div className="w-64">
                            <Select
                                aria-label={UI_TEXT.staff.classLearning.selectCourseLabel}
                                placeholder={courseOptions.length === 0 ? UI_TEXT.staff.classLearning.noCourseAssigned : "Chọn môn học"}
                                items={courseOptions}
                                selectedKey={selectedCourseId}
                                onSelectionChange={(key) => setSelectedCourseId(String(key || ""))}
                                isClearable={false}
                                triggerClassName="!rounded-full border-slate-200 bg-white shadow-2xs text-xs font-bold"
                            >
                                {(item) => (
                                    <Select.Item key={item.id} id={item.id}>
                                        {item.label}
                                    </Select.Item>
                                )}
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Right Side: Action Buttons */}
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
                        onClick={() => {
                            if (!isClassFinalized) {
                                finalizeClassMutation.mutate();
                            }
                        }}
                        isLoading={finalizeClassMutation.isPending}
                        disabled={isClassFinalized}
                        className={cx(
                            "gap-1.5 border font-bold transition duration-150",
                            isClassFinalized
                                ? "cursor-not-allowed border-amber-300 bg-amber-100/80 text-amber-800 opacity-90"
                                : "border-amber-200 bg-amber-50/80 text-amber-900 hover:bg-amber-100",
                        )}
                        iconLeading={<Lock className="size-3.5 text-amber-700" />}
                    >
                        {isClassFinalized ? UI_TEXT.staff.classLearning.statusClassFinalized : UI_TEXT.staff.classLearning.btnFinalizeAll}
                    </Button>
                </div>
            </div>

            {/* 3 KPI Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* KPI Card 1 */}
                <div
                    className={cx(
                        "flex items-center justify-between rounded-xl border border-t-4 bg-white p-4 shadow-xs transition-colors",
                        highAbsenceCount > 0 ? "border-rose-200 border-t-rose-600 bg-rose-50/20" : "border-slate-200 border-t-blue-600",
                    )}
                >
                    <div>
                        <span className="text-xs font-semibold text-slate-500">
                            {UI_TEXT.staff.classLearning.cardAbsencePrefix}
                            {displayAbsenceThreshold}
                            {UI_TEXT.staff.classLearning.percentSymbol}
                        </span>
                        <strong className={cx("mt-1 block text-2xl font-extrabold", getKpiCardColorClass(highAbsenceCount))}>
                            {absenceCardRate.toFixed(decimalPlaces)}
                            {UI_TEXT.staff.classLearning.percentSymbol}
                        </strong>
                        <span className="text-[11px] text-slate-400">
                            {highAbsenceCount}
                            {"/"}
                            {totalStudents} {UI_TEXT.staff.classLearning.studentUnit}
                        </span>
                    </div>
                    <div
                        className={cx(
                            "flex size-10 items-center justify-center rounded-xl transition-colors",
                            highAbsenceCount > 0 ? "bg-rose-100 text-rose-600" : "bg-blue-50 text-blue-600",
                        )}
                    >
                        <Users className="size-5" />
                    </div>
                </div>

                {/* KPI Card 2 */}
                <div
                    className={cx(
                        "flex items-center justify-between rounded-xl border border-t-4 bg-white p-4 shadow-xs transition-colors",
                        highHwMissingCount > 0 ? "border-rose-200 border-t-rose-600 bg-rose-50/20" : "border-slate-200 border-t-wine",
                    )}
                >
                    <div>
                        <span className="text-xs font-semibold text-slate-500">
                            {UI_TEXT.staff.classLearning.cardHwMissingPrefix}
                            {displayHwThreshold}
                            {UI_TEXT.staff.classLearning.percentSymbol}
                        </span>
                        <strong className={cx("mt-1 block text-2xl font-extrabold", getKpiCardColorClass(highHwMissingCount))}>
                            {hwCardRate.toFixed(decimalPlaces)}
                            {UI_TEXT.staff.classLearning.percentSymbol}
                        </strong>
                        <span className="text-[11px] text-slate-400">
                            {highHwMissingCount}
                            {"/"}
                            {totalStudents} {UI_TEXT.staff.classLearning.studentUnit}
                        </span>
                    </div>
                    <div
                        className={cx(
                            "flex size-10 items-center justify-center rounded-xl transition-colors",
                            highHwMissingCount > 0 ? "bg-rose-100 text-rose-600" : "bg-wine-soft text-wine",
                        )}
                    >
                        <BookOpen className="size-5" />
                    </div>
                </div>

                {/* KPI Card 3 */}
                <div
                    className={cx(
                        "flex items-center justify-between rounded-xl border border-t-4 bg-white p-4 shadow-xs transition-colors",
                        noPrepCount > 0 ? "border-rose-200 border-t-rose-600 bg-rose-50/20" : "border-slate-200 border-t-rose-600",
                    )}
                >
                    <div>
                        <span className="text-xs font-semibold text-slate-500">{UI_TEXT.staff.classLearning.cardNoPrepRate}</span>
                        <strong className={cx("mt-1 block text-2xl font-extrabold", getKpiCardColorClass(noPrepCount))}>
                            {noPrepCardRate.toFixed(decimalPlaces)}
                            {"%"}
                        </strong>
                        <span className="text-[11px] text-slate-400">
                            {noPrepCount}
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
            {courses.length === 0 || courseOptions.length === 0 ? (
                <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-12 text-center text-slate-600">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 font-bold text-slate-500">
                        <BookOpen className="size-6 text-slate-500" />
                    </div>
                    <div className="max-w-md">
                        <h4 className="text-base font-bold text-slate-900">{UI_TEXT.classes.noCoursesAssignedMsg}</h4>
                        <p className="mt-1 text-xs text-slate-500">{UI_TEXT.classSchedule.noModuleCoursesDesc}</p>
                    </div>
                </div>
            ) : !selectedCourseId ? (
                <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-12 text-center text-slate-600">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 font-bold text-slate-500">
                        <BookOpen className="size-6 text-slate-500" />
                    </div>
                    <div className="max-w-md">
                        <h4 className="text-base font-bold text-slate-900">{UI_TEXT.classSchedule.pleaseSelectCourseTitle}</h4>
                        <p className="mt-1 text-xs text-slate-500">{UI_TEXT.classSchedule.pleaseSelectCourseDesc}</p>
                    </div>
                </div>
            ) : students.length === 0 ? (
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

                                const studentInfo = getStudentThresholdAndAlert(rDetail, maxAbsenceThreshold, maxHomeworkThreshold);
                                const absenceRateVal = studentInfo.absenceRateVal;
                                const hwMissingRateVal = studentInfo.hwMissingRateVal;
                                const absenceRateStr = formatPercent(absenceRateVal);
                                const hwMissingRateStr = formatPercent(hwMissingRateVal);
                                const scoreNum = Number(rDetail.totalScore ?? rDetail.autoRPoint ?? defaultMaxScore);
                                const scoreVal = String(scoreNum);
                                const isQualified = scoreNum >= passingScoreThreshold;

                                const eStat = elearningStatsByStudent[sId];
                                const uncompletedCount =
                                    isLocked && rDetail.lateCount != null
                                        ? Number(rDetail.lateCount)
                                        : eStat
                                          ? Number(eStat.lateSessions || 0)
                                          : Number(rDetail.lateCount ?? 0);
                                const hasTicked = eStat ? Number(eStat.tickedSessions || 0) > 0 : uncompletedCount > 0;

                                return (
                                    <tr key={s.enrollmentId || idx} className="hover:bg-slate-50/80">
                                        <td className="px-4 py-3 text-center font-semibold text-slate-400">{idx + 1}</td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-bold text-slate-900">{studentName}</p>
                                                <p className="font-mono text-xs text-slate-400">{studentCode}</p>
                                            </div>
                                        </td>
                                        <td className={cx("px-4 py-3 text-center", getStudentRateColor(absenceRateVal, studentInfo.isAbsenceRed))}>
                                            {absenceRateStr}
                                        </td>
                                        <td className={cx("px-4 py-3 text-center", getStudentRateColor(hwMissingRateVal, studentInfo.isHwMissingRed))}>
                                            {hwMissingRateStr}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="inline-flex items-center justify-center gap-1.5">
                                                <span
                                                    className={cx(
                                                        "font-bold",
                                                        uncompletedCount > 0 ? "font-extrabold text-rose-600" : "font-bold text-emerald-600",
                                                    )}
                                                >
                                                    {hasTicked
                                                        ? `${uncompletedCount} ${UI_TEXT.staff.classLearning.sessionsSuffix}`
                                                        : UI_TEXT.staff.classLearning.zeroSessions}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedStudentForAction({
                                                            studentId: sId,
                                                            fullName: studentName,
                                                            studentCode: studentCode,
                                                        });
                                                        setIsElearningModalOpen(true);
                                                    }}
                                                    title={UI_TEXT.staff.classLearning.viewElearningDetailTooltip}
                                                    aria-label={UI_TEXT.staff.classLearning.viewElearningDetailTooltip}
                                                    className="inline-flex size-6 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                                                >
                                                    <Eye className="size-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center font-extrabold text-amber-600">{scoreVal}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (!isLocked) {
                                                        toggleStudentLock(sId);
                                                    }
                                                }}
                                                disabled={isLocked}
                                                className={cx(
                                                    "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold transition duration-150",
                                                    isLocked
                                                        ? "cursor-not-allowed border border-amber-300 bg-amber-100/80 text-amber-800 opacity-90"
                                                        : "cursor-pointer bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700",
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
                                            <Badge color={isQualified ? "success" : "error"} size="sm" className="font-bold">
                                                {isQualified ? UI_TEXT.staff.classLearning.statusQualified : UI_TEXT.staff.classLearning.statusNotQualified}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center">
                                                <Dropdown.Root>
                                                    <Dropdown.DotsButton className="rounded-lg p-1.5 text-muted hover:bg-slate-100" />
                                                    <Dropdown.Popover
                                                        placement={
                                                            idx >= Math.max(minTopOffsetIndex, students.length - bottomThresholdCount)
                                                                ? "top end"
                                                                : "bottom end"
                                                        }
                                                        className="z-50 w-56 rounded-xl border border-line bg-white shadow-xl ring-1 ring-line"
                                                    >
                                                        <Dropdown.Menu>
                                                            <Dropdown.Item
                                                                icon={FileText}
                                                                onAction={() => {
                                                                    setSelectedStudentForAction({
                                                                        studentId: sId,
                                                                        fullName: studentName,
                                                                        studentCode: studentCode,
                                                                    });
                                                                    setIsDetailModalOpen(true);
                                                                }}
                                                                className={(state) =>
                                                                    "text-slate-700 [&_svg]:text-blue-600 " +
                                                                    (state.isFocused || state.isHovered ? "[&>div]:!bg-blue-50" : "")
                                                                }
                                                            >
                                                                <span>{UI_TEXT.staff.classLearning.actionDetailEval}</span>
                                                            </Dropdown.Item>

                                                            <Dropdown.Item
                                                                icon={Star}
                                                                onAction={() => {
                                                                    if (isLocked) {
                                                                        toast.warning(
                                                                            UI_TEXT.staff.classLearning.toastInfoTitle,
                                                                            UI_TEXT.staff.classLearning.toastStudentInfoLocked,
                                                                        );
                                                                        return;
                                                                    }
                                                                    setSelectedStudentForAction({
                                                                        studentId: sId,
                                                                        fullName: studentName,
                                                                        studentCode: studentCode,
                                                                    });
                                                                    setIsBonusModalOpen(true);
                                                                }}
                                                                className={(state) =>
                                                                    (isLocked ? "cursor-not-allowed opacity-40 " : "") +
                                                                    "text-slate-700 [&_svg]:text-amber-500" +
                                                                    (state.isFocused || state.isHovered ? "[&>div]:!bg-amber-50" : "")
                                                                }
                                                            >
                                                                <span>{UI_TEXT.staff.classLearning.actionAddBonus}</span>
                                                            </Dropdown.Item>

                                                            <Dropdown.Item
                                                                icon={AlertTriangle}
                                                                onAction={() => {
                                                                    if (isLocked) {
                                                                        toast.warning(
                                                                            UI_TEXT.staff.classLearning.toastInfoTitle,
                                                                            UI_TEXT.staff.classLearning.toastStudentInfoLocked,
                                                                        );
                                                                        return;
                                                                    }
                                                                    setSelectedStudentForAction({
                                                                        studentId: sId,
                                                                        fullName: studentName,
                                                                        studentCode: studentCode,
                                                                    });
                                                                    setIsViolationModalOpen(true);
                                                                }}
                                                                className={(state) =>
                                                                    (isLocked ? "cursor-not-allowed opacity-40 " : "") +
                                                                    "text-slate-700 [&_svg]:text-rose-500" +
                                                                    (state.isFocused || state.isHovered ? "[&>div]:!bg-rose-50" : "")
                                                                }
                                                            >
                                                                <span>{UI_TEXT.staff.classLearning.actionAddViolation}</span>
                                                            </Dropdown.Item>

                                                            <Dropdown.Item
                                                                icon={RefreshCw}
                                                                onAction={() => {
                                                                    if (isLocked) {
                                                                        toast.warning(
                                                                            UI_TEXT.staff.classLearning.toastInfoTitle,
                                                                            UI_TEXT.staff.classLearning.toastStudentInfoLocked,
                                                                        );
                                                                        return;
                                                                    }
                                                                    recalculateMutation.mutate(sId);
                                                                }}
                                                                className={(state) =>
                                                                    (isLocked ? "cursor-not-allowed opacity-40 " : "") +
                                                                    "text-slate-700 [&_svg]:text-purple-600" +
                                                                    (state.isFocused || state.isHovered ? "[&>div]:!bg-purple-50" : "")
                                                                }
                                                            >
                                                                <span>{UI_TEXT.staff.classLearning.actionSyncAutoRpoints}</span>
                                                            </Dropdown.Item>
                                                        </Dropdown.Menu>
                                                    </Dropdown.Popover>
                                                </Dropdown.Root>
                                            </div>
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
                    onSuccess={handleRefreshRPoints}
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
                    onSuccess={handleRefreshRPoints}
                />
            )}

            {/* Uncompleted E-learning Modal */}
            {selectedStudentForAction && (
                <UncompletedElearningModal
                    isOpen={isElearningModalOpen}
                    onClose={() => setIsElearningModalOpen(false)}
                    studentId={selectedStudentForAction.studentId}
                    studentName={selectedStudentForAction.fullName}
                    studentCode={selectedStudentForAction.studentCode}
                    classId={classId}
                    courseId={selectedCourseId}
                    isLocked={
                        isClassFinalized ||
                        !!lockedStudents[selectedStudentForAction.studentId] ||
                        !!(rpointsMap[selectedStudentForAction.studentId] as { isLocked?: boolean })?.isLocked
                    }
                />
            )}
        </div>
    );
}
