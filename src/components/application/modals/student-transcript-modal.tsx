"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Award, CheckCircle2, ChevronDown, ChevronRight, Eye, FileText, PlusCircle, X, XCircle } from "lucide-react";
import { Heading } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { getClassesList, getCourseGradeDetail, getStudentTranscript, retakeCourse } from "@/services/student.service";
import { toast } from "@/services/toast.service";
import type { EffectiveResult, Student, TranscriptItem } from "@/types/student.types";

export function StudentTranscriptModal({ isOpen, onClose, student }: { isOpen: boolean; onClose: () => void; student: Student | null }) {
    const queryClient = useQueryClient();
    const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

    // Detail view state
    const [detailCourseId, setDetailCourseId] = useState<string | null>(null);
    const [detailCourseName, setDetailCourseName] = useState<string>("");

    // Retake modal state
    const [retakeCourseId, setRetakeCourseId] = useState<string | null>(null);
    const [retakeClassId, setRetakeClassId] = useState<string>("");
    const [retakeHomework, setRetakeHomework] = useState<string>("");
    const [retakeQuizzi, setRetakeQuizzi] = useState<string>("");
    const [retakeAttendance, setRetakeAttendance] = useState<string>("");
    const [retakeProject, setRetakeProject] = useState<string>("");
    const [retakeNote, setRetakeNote] = useState<string>("");

    const { data: transcriptData, isLoading } = useQuery({
        queryKey: ["student-transcript", student?.id],
        queryFn: () => getStudentTranscript(student!.id),
        enabled: !!student && isOpen,
    });

    const { data: courseDetail = [], isLoading: isLoadingDetail } = useQuery({
        queryKey: ["course-grade-detail", student?.id, detailCourseId],
        queryFn: () => getCourseGradeDetail(student!.id, detailCourseId!),
        enabled: !!student && !!detailCourseId,
    });

    const { data: classes = [] } = useQuery({
        queryKey: ["classes-list"],
        queryFn: getClassesList,
        enabled: isOpen,
    });

    const retakeMutation = useMutation({
        mutationFn: () => {
            if (!retakeCourseId) throw new Error(UI_TEXT.studentTranscriptModal.invalidCourseError);
            return retakeCourse(student!.id, retakeCourseId, {
                classId: retakeClassId || undefined,
                homework: retakeHomework ? Number(retakeHomework) : undefined,
                quizzi: retakeQuizzi ? Number(retakeQuizzi) : undefined,
                attendance: retakeAttendance ? Number(retakeAttendance) : undefined,
                project: retakeProject ? Number(retakeProject) : undefined,
                note: retakeNote || undefined,
            });
        },
        onSuccess: () => {
            toast.success(UI_TEXT.studentTranscriptModal.toastSuccessTitle, UI_TEXT.studentTranscriptModal.toastRetakeSuccess);
            queryClient.invalidateQueries({ queryKey: ["student-transcript", student?.id] });
            setRetakeCourseId(null);
            setRetakeClassId("");
            setRetakeHomework("");
            setRetakeQuizzi("");
            setRetakeAttendance("");
            setRetakeProject("");
            setRetakeNote("");
        },
        onError: (e: Error) => {
            toast.error(UI_TEXT.studentTranscriptModal.toastErrorTitle, e.message || UI_TEXT.studentTranscriptModal.toastRetakeError);
        },
    });

    if (!student) return null;

    const summary = transcriptData?.summary || { totalCourses: 0, passedCount: 0, failedCount: 0, avgScore: 0 };
    const results = transcriptData?.results || [];

    const getStatusBadge = (status: number) => {
        switch (status) {
            /* eslint-disable-next-line @typescript-eslint/no-magic-numbers */
            case 2:
                return (
                    <span className="inline-flex rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">
                        {UI_TEXT.studentTranscriptModal.statusAdminApproved}
                    </span>
                );
            case 1:
                return (
                    <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                        {UI_TEXT.studentTranscriptModal.statusTeacherApproved}
                    </span>
                );
            default:
                return (
                    <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        {UI_TEXT.studentTranscriptModal.statusPending}
                    </span>
                );
        }
    };

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="w-full max-w-4xl overflow-hidden !rounded-[24px]">
                <Dialog className="flex max-h-[90vh] flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl outline-none">
                    {/* Header */}
                    <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-6 pt-6 pb-4">
                        <div>
                            <Heading slot="title" className="flex items-center gap-2 text-lg font-black text-slate-800">
                                <Award className="size-5 text-wine" />
                                {UI_TEXT.studentTranscriptModal.title}
                            </Heading>
                            <p className="mt-0.5 text-xs font-semibold text-slate-400">
                                {student.fullName} {"("}
                                {student.studentCode}
                                {")"} {UI_TEXT.studentTranscriptModal.dash} {UI_TEXT.studentTranscriptModal.campusPrefix} {student.location}
                            </p>
                        </div>
                        <button onClick={onClose} className="cursor-pointer rounded-lg p-1 transition hover:bg-slate-100">
                            <X className="size-5 text-slate-400" />
                        </button>
                    </div>

                    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            <div className="flex flex-col rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{UI_TEXT.studentTranscriptModal.totalCoursesLabel}</span>
                                <span className="mt-1 text-xl font-black text-slate-800">{summary.totalCourses}</span>
                            </div>
                            <div className="flex flex-col rounded-2xl border border-green-100 bg-green-50/60 p-3.5">
                                <span className="text-[10px] font-bold text-green-700 uppercase">{UI_TEXT.studentTranscriptModal.passedCoursesLabel}</span>
                                <span className="mt-1 text-xl font-black text-green-800">{summary.passedCount}</span>
                            </div>
                            <div className="flex flex-col rounded-2xl border border-red-100 bg-red-50/60 p-3.5">
                                <span className="text-[10px] font-bold text-red-700 uppercase">{UI_TEXT.studentTranscriptModal.failedCoursesLabel}</span>
                                <span className="mt-1 text-xl font-black text-red-800">{summary.failedCount}</span>
                            </div>
                            <div className="flex flex-col rounded-2xl border border-wine/10 bg-wine/5 p-3.5">
                                <span className="text-[10px] font-bold text-wine uppercase">{UI_TEXT.studentTranscriptModal.gpaLabel}</span>
                                <span className="mt-1 text-xl font-black text-wine">{summary.avgScore ? summary.avgScore.toFixed(1) : "0.0"}</span>
                            </div>
                        </div>

                        {/* Transcript Results Grid */}
                        <div className="flex flex-col gap-3">
                            <h4 className="text-sm font-black text-slate-800">{UI_TEXT.studentTranscriptModal.effectiveResultsTitle}</h4>

                            {isLoading ? (
                                <div className="flex min-h-[200px] items-center justify-center">
                                    <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
                                </div>
                            ) : results.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                                    <FileText className="size-8 text-slate-300" />
                                    <p className="text-sm font-bold text-slate-700">{UI_TEXT.studentTranscriptModal.noResultsTitle}</p>
                                </div>
                            ) : (
                                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
                                    <table className="w-full border-collapse text-left text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
                                                <th className="w-8 px-3 py-3"></th>
                                                <th className="px-4 py-3">{UI_TEXT.studentTranscriptModal.thCourse}</th>
                                                <th className="px-4 py-3 text-center">{UI_TEXT.studentTranscriptModal.thTotalScore}</th>
                                                <th className="px-4 py-3 text-center">{UI_TEXT.studentTranscriptModal.thBonusScore}</th>
                                                <th className="px-4 py-3 text-center">{UI_TEXT.studentTranscriptModal.thResult}</th>
                                                <th className="px-4 py-3 text-center">{UI_TEXT.studentTranscriptModal.thApproval}</th>
                                                <th className="px-4 py-3 text-center">{UI_TEXT.studentTranscriptModal.thAction}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results.map((item: TranscriptItem, idx: number) => {
                                                const eff: EffectiveResult = item.effective;
                                                const isExpanded = expandedCourseId === eff.courseId;

                                                return (
                                                    <tr key={eff.id || idx} className="border-b border-slate-100 text-xs hover:bg-slate-50/50">
                                                        <td className="px-3 py-3 text-center">
                                                            {item.attemptCount > 1 ? (
                                                                <button
                                                                    onClick={() => setExpandedCourseId(isExpanded ? null : eff.courseId)}
                                                                    className="p-1 text-slate-400 hover:text-slate-700"
                                                                >
                                                                    {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                                                                </button>
                                                            ) : null}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="font-bold text-slate-900">
                                                                {eff.courseName || `${UI_TEXT.studentTranscriptModal.courseIdPrefix}${eff.courseId}`}
                                                            </div>
                                                            <div className="mt-0.5 flex items-center gap-2">
                                                                {eff.courseCode && (
                                                                    <span className="font-mono text-[10px] text-slate-400">{eff.courseCode}</span>
                                                                )}
                                                                {item.attemptCount > 1 && (
                                                                    <span className="py-0.2 inline-flex rounded bg-purple-100 px-1.5 text-[9px] font-extrabold text-purple-700">
                                                                        {UI_TEXT.studentTranscriptModal.attemptRetakePrefix}
                                                                        {item.attemptCount}
                                                                        {UI_TEXT.studentTranscriptModal.attemptRetakeSuffix}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center font-bold text-slate-800">{eff.totalScore ?? "-"}</td>
                                                        <td className="px-4 py-3 text-center font-black text-slate-900">
                                                            {eff.scoreWithBonus ?? eff.totalScore ?? "-"}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            {eff.pass ? (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-800">
                                                                    <CheckCircle2 className="size-3" /> {UI_TEXT.studentTranscriptModal.passText}
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800">
                                                                    <XCircle className="size-3" /> {UI_TEXT.studentTranscriptModal.failText}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-center">{getStatusBadge(eff.status)}</td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                <button
                                                                    onClick={() => {
                                                                        setDetailCourseId(eff.courseId);
                                                                        setDetailCourseName(
                                                                            eff.courseName || UI_TEXT.studentTranscriptModal.defaultCourseDetailName,
                                                                        );
                                                                    }}
                                                                    className="flex items-center gap-1 rounded p-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50"
                                                                    title={UI_TEXT.studentTranscriptModal.viewDetailTitle}
                                                                >
                                                                    <Eye className="size-3.5" /> {UI_TEXT.studentTranscriptModal.viewDetailBtn}
                                                                </button>
                                                                <button
                                                                    onClick={() => setRetakeCourseId(eff.courseId)}
                                                                    className="flex items-center gap-1 rounded p-1 text-[11px] font-semibold text-purple-600 hover:bg-purple-50"
                                                                    title={UI_TEXT.studentTranscriptModal.retakeTitle}
                                                                >
                                                                    <PlusCircle className="size-3.5" /> {UI_TEXT.studentTranscriptModal.retakeBtn}
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

                        {/* Course Detail Modal */}
                        {detailCourseId && (
                            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                    <h5 className="text-sm font-black text-slate-800">
                                        {UI_TEXT.studentTranscriptModal.courseDetailTitlePrefix} {detailCourseName}
                                    </h5>
                                    <button onClick={() => setDetailCourseId(null)} className="text-xs font-bold text-slate-400 hover:text-slate-700">
                                        {UI_TEXT.studentTranscriptModal.closeBtn}
                                    </button>
                                </div>
                                {isLoadingDetail ? (
                                    <div className="py-4 text-center text-xs text-slate-400">{UI_TEXT.studentTranscriptModal.loadingDetail}</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full rounded-xl border border-slate-200 bg-white text-left text-xs">
                                            <thead>
                                                <tr className="bg-slate-100 text-[10px] font-bold text-slate-600 uppercase">
                                                    <th className="p-2">{UI_TEXT.studentTranscriptModal.thAttempt}</th>
                                                    <th className="p-2 text-center">{UI_TEXT.studentTranscriptModal.thAttendance}</th>
                                                    <th className="p-2 text-center">{UI_TEXT.studentTranscriptModal.thHomework}</th>
                                                    <th className="p-2 text-center">{UI_TEXT.studentTranscriptModal.thQuizzi}</th>
                                                    <th className="p-2 text-center">{UI_TEXT.studentTranscriptModal.thProject}</th>
                                                    <th className="p-2 text-center">{UI_TEXT.studentTranscriptModal.thRetakeProject}</th>
                                                    <th className="p-2 text-center">{UI_TEXT.studentTranscriptModal.thTotalScore}</th>
                                                    <th className="p-2 text-center">{UI_TEXT.studentTranscriptModal.thResult}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {courseDetail.map((rec: Record<string, unknown>, i: number) => (
                                                    <tr key={(rec.id as string) || i} className="border-t border-slate-100">
                                                        <td className="p-2 font-bold text-slate-800">
                                                            {UI_TEXT.studentTranscriptModal.attemptPrefix} {(rec.count as number) || i + 1}
                                                        </td>
                                                        <td className="p-2 text-center">{(rec.attendance as React.ReactNode) ?? "-"}</td>
                                                        <td className="p-2 text-center">{(rec.homework as React.ReactNode) ?? "-"}</td>
                                                        <td className="p-2 text-center">{(rec.quizzi as React.ReactNode) ?? "-"}</td>
                                                        <td className="p-2 text-center">{(rec.project as React.ReactNode) ?? "-"}</td>
                                                        <td className="p-2 text-center">{(rec.retakeProject as React.ReactNode) ?? "-"}</td>
                                                        <td className="p-2 text-center font-black text-slate-900">
                                                            {(rec.scoreWithBonus as React.ReactNode) ?? (rec.totalScore as React.ReactNode) ?? "-"}
                                                        </td>
                                                        <td className="p-2 text-center">
                                                            {rec.pass ? (
                                                                <span className="font-bold text-green-700">{UI_TEXT.studentTranscriptModal.passText}</span>
                                                            ) : (
                                                                <span className="font-bold text-red-600">{UI_TEXT.studentTranscriptModal.failText}</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Retake Form */}
                        {retakeCourseId && (
                            <div className="flex flex-col gap-3 rounded-2xl border border-purple-200 bg-purple-50/50 p-4">
                                <div className="flex items-center justify-between border-b border-purple-100 pb-2">
                                    <h5 className="text-sm font-black text-purple-900">{UI_TEXT.studentTranscriptModal.retakeFormTitle}</h5>
                                    <button onClick={() => setRetakeCourseId(null)} className="text-xs font-bold text-purple-400 hover:text-purple-700">
                                        {UI_TEXT.studentTranscriptModal.cancelCrossBtn}
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                    <div className="col-span-2 flex flex-col gap-1">
                                        <label className="text-[10px] font-bold text-slate-600 uppercase">
                                            {UI_TEXT.studentTranscriptModal.classSectionLabel}
                                        </label>
                                        <select
                                            value={retakeClassId}
                                            onChange={(e) => setRetakeClassId(e.target.value)}
                                            className="rounded-lg border border-slate-200 bg-white p-2 text-xs"
                                        >
                                            <option value="">{UI_TEXT.studentTranscriptModal.selectClassSectionPlaceholder}</option>
                                            {classes.map((cls) => (
                                                <option key={cls.id} value={cls.id}>
                                                    {cls.className}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <Input
                                        label={UI_TEXT.studentTranscriptModal.attendanceScoreLabel}
                                        type="number"
                                        placeholder={UI_TEXT.studentTranscriptModal.attendancePlaceholder}
                                        value={retakeAttendance}
                                        onChange={(val) => setRetakeAttendance(val)}
                                    />
                                    <Input
                                        label={UI_TEXT.studentTranscriptModal.homeworkScoreLabel}
                                        type="number"
                                        placeholder={UI_TEXT.studentTranscriptModal.homeworkPlaceholder}
                                        value={retakeHomework}
                                        onChange={(val) => setRetakeHomework(val)}
                                    />
                                    <Input
                                        label={UI_TEXT.studentTranscriptModal.quizziScoreLabel}
                                        type="number"
                                        placeholder={UI_TEXT.studentTranscriptModal.quizziPlaceholder}
                                        value={retakeQuizzi}
                                        onChange={(val) => setRetakeQuizzi(val)}
                                    />
                                    <Input
                                        label={UI_TEXT.studentTranscriptModal.projectScoreLabel}
                                        type="number"
                                        placeholder={UI_TEXT.studentTranscriptModal.projectPlaceholder}
                                        value={retakeProject}
                                        onChange={(val) => setRetakeProject(val)}
                                    />
                                    <div className="col-span-2">
                                        <Input
                                            label={UI_TEXT.studentTranscriptModal.noteLabel}
                                            placeholder={UI_TEXT.studentTranscriptModal.notePlaceholder}
                                            value={retakeNote}
                                            onChange={(val) => setRetakeNote(val)}
                                        />
                                    </div>
                                </div>
                                <div className="mt-2 flex justify-end gap-2">
                                    <Button color="secondary" onClick={() => setRetakeCourseId(null)} className="text-xs">
                                        {UI_TEXT.studentTranscriptModal.cancelBtn}
                                    </Button>
                                    <Button
                                        onClick={() => retakeMutation.mutate()}
                                        isLoading={retakeMutation.isPending}
                                        className="border-none bg-purple-700 text-xs font-bold text-white hover:bg-purple-800"
                                    >
                                        {UI_TEXT.studentTranscriptModal.saveRetakeScoreBtn}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
