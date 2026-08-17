"use client";

import { useQuery } from "@tanstack/react-query";
import { BookOpen, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { getCourseRpointFormula, getStudentRPointDetail } from "@/services/auto-rpoint.service";
import type { StudentRpointDetailModalProps } from "@/types/rpoint.types";
import { formatPercent, getRateColorClass } from "@/utils/class.utils";
import { cx } from "@/utils/cx";

const defaultMaxScore = 100;
const defaultMaxCompliance = 40;
const defaultCategoryMaxScore = 20;

export function StudentRpointDetailModal({ isOpen, onClose, studentId, studentName, studentCode, courseId, classId }: StudentRpointDetailModalProps) {
    const { data: detail, isLoading } = useQuery({
        queryKey: ["student-rpoint-detail", studentId, courseId, classId],
        queryFn: () => getStudentRPointDetail(studentId, courseId, classId),
        enabled: isOpen && !!studentId && !!courseId,
    });

    const { data: formulaData } = useQuery({
        queryKey: ["course-rpoint-formula", courseId],
        queryFn: () => getCourseRpointFormula(courseId),
        enabled: isOpen && !!courseId,
    });

    const info = detail?.detail || detail || {};
    const formula = formulaData?.formula;
    const maxCompliance = formula?.compliance?.max ?? defaultMaxCompliance;
    const compScore = info.complianceScore != null ? Number(info.complianceScore) : maxCompliance;
    const violationDeduction = info.violationDeduction != null ? Math.abs(Number(info.violationDeduction)) : Math.max(0, maxCompliance - compScore);

    if (!isOpen) return null;

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="max-w-2xl rounded-[24px] border-none bg-white p-0 shadow-2xl">
                <Dialog className="flex flex-col outline-none">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 font-bold text-blue-600">
                                <BookOpen className="size-5" />
                            </div>
                            <div>
                                <Heading slot="title" className="text-lg font-extrabold text-slate-900">
                                    {UI_TEXT.studentRpointDetailModal.title}
                                </Heading>
                                <p className="mt-0.5 text-xs font-medium text-slate-500">
                                    {UI_TEXT.studentRpointDetailModal.studentLabel}
                                    <strong className="font-extrabold text-slate-900">{studentName}</strong> {`(${studentCode})`}
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

                    {/* Modal Body */}
                    <div className="px-6 py-5">
                        {isLoading ? (
                            <div className="flex h-48 items-center justify-center gap-2 text-xs font-semibold text-slate-500">
                                <div className="size-5 animate-spin rounded-full border-2 border-slate-200 border-t-wine" />
                                {UI_TEXT.studentRpointDetailModal.loadingData}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-5">
                                {/* Summary Grid */}
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 text-center">
                                        <span className="text-[11px] font-bold text-slate-500">{UI_TEXT.studentRpointDetailModal.autoRpointLabel}</span>
                                        <strong className="mt-1 block text-2xl font-black text-wine">
                                            {info.totalScore ?? info.autoRPoint ?? defaultMaxScore}
                                        </strong>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 text-center">
                                        <span className="text-[11px] font-bold text-slate-500">{UI_TEXT.studentRpointDetailModal.absenceRateLabel}</span>
                                        <strong className={cx("mt-1 block text-2xl font-black", getRateColorClass(info.absenceRate))}>
                                            {formatPercent(info.absenceRate)}
                                        </strong>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 text-center">
                                        <span className="text-[11px] font-bold text-slate-500">{UI_TEXT.studentRpointDetailModal.violationCountLabel}</span>
                                        <strong className="mt-1 block text-2xl font-black text-rose-600">{info.violationCount ?? 0}</strong>
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 text-center">
                                        <span className="text-[11px] font-bold text-slate-500">{UI_TEXT.studentRpointDetailModal.bonusPointsLabel}</span>
                                        <strong className="mt-1 block text-2xl font-black text-amber-600">
                                            {`+${(info.learningBonus ?? 0) + (info.classOfficerBonus ?? 0) + (info.manualBonus ?? 0)}`}
                                        </strong>
                                    </div>
                                </div>

                                {/* Breakdown Rows */}
                                <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4">
                                    <h4 className="mb-1 text-xs font-extrabold tracking-wider text-slate-500 uppercase">
                                        {UI_TEXT.studentRpointDetailModal.breakdownTitle}
                                    </h4>
                                    <div className="flex items-center justify-between border-b border-slate-100 py-2 text-xs font-semibold">
                                        <span className="text-slate-600">{UI_TEXT.studentRpointDetailModal.attendanceScoreLabel}</span>
                                        <span className="font-extrabold text-slate-900">{`${info.attendanceScore ?? defaultCategoryMaxScore}/${formula?.attendance?.max ?? defaultCategoryMaxScore}`}</span>
                                    </div>
                                    <div className="flex items-center justify-between border-b border-slate-100 py-2 text-xs font-semibold">
                                        <span className="text-slate-600">{UI_TEXT.studentRpointDetailModal.homeworkScoreLabel}</span>
                                        <span className="font-extrabold text-slate-900">{`${info.homeworkScore ?? info.assignmentScore ?? defaultCategoryMaxScore}/${formula?.assignment?.max ?? defaultCategoryMaxScore}`}</span>
                                    </div>
                                    <div className="flex items-center justify-between border-b border-slate-100 py-2 text-xs font-semibold">
                                        <span className="text-slate-600">{UI_TEXT.studentRpointDetailModal.elearningLabel}</span>
                                        <span className="font-extrabold text-slate-900">{`${info.preparationScore ?? defaultCategoryMaxScore}/${formula?.preparation?.max ?? defaultCategoryMaxScore}`}</span>
                                    </div>
                                    <div className="flex items-center justify-between border-b border-slate-100 py-2 text-xs font-semibold">
                                        <span className="text-slate-600">{UI_TEXT.studentRpointDetailModal.violationDeductionLabel}</span>
                                        <span className={cx("font-extrabold", violationDeduction > 0 ? "text-rose-600" : "text-slate-900")}>
                                            {violationDeduction > 0 ? `-${violationDeduction}` : "0"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between border-b border-slate-100 py-2 text-xs font-semibold">
                                        <span className="text-slate-600">{UI_TEXT.studentRpointDetailModal.bonusCombinedLabel}</span>
                                        <span className="font-extrabold text-emerald-600">{`+${(info.learningBonus ?? 0) + (info.classOfficerBonus ?? 0) + (info.manualBonus ?? 0)}`}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 pt-2.5 text-xs">
                                        <span className="font-extrabold text-slate-800">{UI_TEXT.studentRpointDetailModal.lockStatusLabel}</span>
                                        <span className="font-black text-amber-700">
                                            {info.isLocked ? UI_TEXT.studentRpointDetailModal.lockedText : UI_TEXT.studentRpointDetailModal.unlockedText}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions - Full Width */}
                    <div className="flex w-full items-center justify-center border-t border-slate-100 px-6 py-4">
                        <Button
                            type="button"
                            color="secondary"
                            size="md"
                            onClick={onClose}
                            className="w-full justify-center rounded-full border-slate-200 py-2.5 text-xs font-bold"
                        >
                            {UI_TEXT.studentRpointDetailModal.closeBtn}
                        </Button>
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
