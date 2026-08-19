"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    ArrowLeft,
    Award,
    BookOpen,
    Calendar,
    ChevronRight,
    Code,
    Edit,
    FileCheck,
    FolderOpen,
    GraduationCap,
    Heart,
    HelpCircle,
    Info,
    Notebook,
    PieChart,
    Plus,
    Trash2,
    Users,
    X,
} from "lucide-react";
import { Heading } from "react-aria-components";
import { ClassLearningSubpanel } from "@/components/application/classes/class-learning-subpanel";
import { ClassScheduleSubpanel } from "@/components/application/classes/class-schedule-subpanel";
import { ClassModal } from "@/components/application/modals/class-modal";
import { ConfirmModal } from "@/components/application/modals/confirm-modal";
import { CourseClassModal } from "@/components/application/modals/course-class-modal";
import { CourseRpointConfigModal } from "@/components/application/modals/course-rpoint-config-modal";
import { EnrollStudentModal } from "@/components/application/modals/enroll-student-modal";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { deleteCourseClass, deleteStudentFromClass, getClassDetail } from "@/services/class.service";
import { toast } from "@/services/toast.service";
import {
    type ClassDetailModalProps,
    type CourseClassEmbed,
    CourseClassStatusEnum,
    type DetailTabType,
    type StudentClassEmbed,
    StudentClassStatusEnum,
} from "@/types/class.types";
import { getClassTypeLabel } from "@/utils/class.utils";
import { cx } from "@/utils/cx";

export enum ConfirmDeleteTypeEnum {
    COURSE = "course",
    STUDENT = "student",
}

export function ClassDetailModal({ isOpen, onClose, classId }: ClassDetailModalProps) {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<DetailTabType>("info");
    const [activeSubPanel, setActiveSubPanel] = useState<string>("none");

    // Modal States
    const [isEditClassOpen, setIsEditClassOpen] = useState(false);

    const [isCourseClassModalOpen, setIsCourseClassModalOpen] = useState(false);
    const [selectedCourseClass, setSelectedCourseClass] = useState<CourseClassEmbed | null>(null);

    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [selectedEnrollment, setSelectedEnrollment] = useState<StudentClassEmbed | null>(null);

    const [rpointCourseClass, setRpointCourseClass] = useState<{ courseId: string; title: string } | null>(null);

    const [confirmDelete, setConfirmDelete] = useState<{
        isOpen: boolean;
        type: ConfirmDeleteTypeEnum | null;
        id: string | null;
        name: string;
    }>({
        isOpen: false,
        type: null,
        id: null,
        name: "",
    });

    const { data: detail, isLoading } = useQuery({
        queryKey: ["class-detail", classId],
        queryFn: () => getClassDetail(classId!),
        enabled: isOpen && !!classId,
    });

    const classInfo = detail?.class;
    const courses = detail?.courses || [];
    const students = detail?.students || [];
    const studyingCount = students.filter((s) => s.isActive !== false && (s.status === StudentClassStatusEnum.STUDYING || !s.status)).length;
    const summary = {
        courseCount: detail?.summary?.courseCount ?? courses.length,
        studentCount: detail?.summary?.studentCount ?? students.length,
        activeStudentCount: studyingCount,
    };

    // Delete Mutations
    const deleteCourseMutation = useMutation({
        mutationFn: (id: string) => deleteCourseClass(id),
        onSuccess: () => {
            toast.success(UI_TEXT.courseClassModal.toastCreateSuccessTitle, UI_TEXT.classDetailModal.toastUnassignCourseSuccess);
            queryClient.invalidateQueries({ queryKey: ["class-detail", classId] });
            setConfirmDelete({ isOpen: false, type: null, id: null, name: "" });
        },
        onError: (err: Error) => {
            toast.error(UI_TEXT.courseClassModal.toastCreateErrorTitle, err.message || UI_TEXT.classDetailModal.toastUnassignCourseErrorDefault);
        },
    });

    const deleteStudentMutation = useMutation({
        mutationFn: (id: string) => deleteStudentFromClass(id),
        onSuccess: () => {
            toast.success(UI_TEXT.courseClassModal.toastCreateSuccessTitle, UI_TEXT.classDetailModal.toastRemoveStudentSuccess);
            queryClient.invalidateQueries({ queryKey: ["class-detail", classId] });
            setConfirmDelete({ isOpen: false, type: null, id: null, name: "" });
        },
        onError: (err: Error) => {
            toast.error(UI_TEXT.courseClassModal.toastCreateErrorTitle, err.message || UI_TEXT.classDetailModal.toastRemoveStudentErrorDefault);
        },
    });

    const handleConfirmDelete = () => {
        if (!confirmDelete.id) return;
        if (confirmDelete.type === ConfirmDeleteTypeEnum.COURSE) {
            deleteCourseMutation.mutate(confirmDelete.id);
        } else if (confirmDelete.type === ConfirmDeleteTypeEnum.STUDENT) {
            deleteStudentMutation.mutate(confirmDelete.id);
        }
    };

    const featureCards = [
        {
            id: "group",
            title: UI_TEXT.classDetailModal.features.group.title,
            desc: UI_TEXT.classDetailModal.features.group.desc,
            icon: Users,
            color: "text-pink-600 bg-pink-50 border-pink-500",
            hoverBorder: "hover:border-pink-500 hover:shadow-pink-500/10",
            hoverTitle: "group-hover:text-pink-600",
        },
        {
            id: "learning",
            title: UI_TEXT.classDetailModal.features.learning.title,
            desc: UI_TEXT.classDetailModal.features.learning.desc,
            icon: GraduationCap,
            color: "text-blue-600 bg-blue-50 border-blue-500",
            hoverBorder: "hover:border-blue-500 hover:shadow-blue-500/10",
            hoverTitle: "group-hover:text-blue-600",
        },
        {
            id: "attendance",
            title: UI_TEXT.classDetailModal.features.attendance.title,
            desc: UI_TEXT.classDetailModal.features.attendance.desc,
            icon: FileCheck,
            color: "text-emerald-600 bg-emerald-50 border-emerald-500",
            hoverBorder: "hover:border-emerald-500 hover:shadow-emerald-500/10",
            hoverTitle: "group-hover:text-emerald-600",
        },
        {
            id: "homework",
            title: UI_TEXT.classDetailModal.features.homework.title,
            desc: UI_TEXT.classDetailModal.features.homework.desc,
            icon: Notebook,
            color: "text-purple-600 bg-purple-50 border-purple-500",
            hoverBorder: "hover:border-purple-500 hover:shadow-purple-500/10",
            hoverTitle: "group-hover:text-purple-600",
        },
        {
            id: "gradebook",
            title: UI_TEXT.classDetailModal.features.gradebook.title,
            desc: UI_TEXT.classDetailModal.features.gradebook.desc,
            icon: PieChart,
            color: "text-amber-600 bg-amber-50 border-amber-500",
            hoverBorder: "hover:border-amber-500 hover:shadow-amber-500/10",
            hoverTitle: "group-hover:text-amber-600",
        },
        {
            id: "practice_submission",
            title: UI_TEXT.classDetailModal.features.practiceSubmission.title,
            desc: UI_TEXT.classDetailModal.features.practiceSubmission.desc,
            icon: Code,
            color: "text-cyan-600 bg-cyan-50 border-cyan-500",
            hoverBorder: "hover:border-cyan-500 hover:shadow-cyan-500/10",
            hoverTitle: "group-hover:text-cyan-600",
        },
        {
            id: "schedule",
            title: UI_TEXT.classDetailModal.features.schedule.title,
            desc: UI_TEXT.classDetailModal.features.schedule.desc,
            icon: Calendar,
            color: "text-orange-600 bg-orange-50 border-orange-500",
            hoverBorder: "hover:border-orange-500 hover:shadow-orange-500/10",
            hoverTitle: "group-hover:text-orange-600",
        },
        {
            id: "entrance_quiz_report",
            title: UI_TEXT.classDetailModal.features.entranceQuizReport.title,
            desc: UI_TEXT.classDetailModal.features.entranceQuizReport.desc,
            icon: HelpCircle,
            color: "text-red-600 bg-red-50 border-red-500",
            hoverBorder: "hover:border-red-500 hover:shadow-red-500/10",
            hoverTitle: "group-hover:text-red-600",
        },
        {
            id: "survey_report",
            title: UI_TEXT.classDetailModal.features.surveyReport.title,
            desc: UI_TEXT.classDetailModal.features.surveyReport.desc,
            icon: Heart,
            color: "text-rose-600 bg-rose-50 border-rose-500",
            hoverBorder: "hover:border-rose-500 hover:shadow-rose-500/10",
            hoverTitle: "group-hover:text-rose-600",
        },
    ];

    if (!isOpen) return null;

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="max-w-5xl !rounded-[24px]">
                <Dialog className="flex max-h-[90vh] flex-col rounded-[24px] bg-white shadow-2xl outline-none">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                        <div className="flex items-center gap-3">
                            {activeSubPanel !== "none" ? (
                                <button
                                    type="button"
                                    onClick={() => setActiveSubPanel("none")}
                                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-extrabold text-slate-700 hover:bg-slate-50"
                                >
                                    <ArrowLeft className="size-4" /> {UI_TEXT.classDetailModal.backToClassManage}
                                </button>
                            ) : (
                                <>
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-wine/10 text-wine">
                                        <BookOpen className="size-5" />
                                    </div>
                                    <div>
                                        <Heading slot="title" className="text-lg font-bold text-slate-900">
                                            {isLoading ? UI_TEXT.common.loading : classInfo?.name || UI_TEXT.courseClassModal.createTitle}
                                        </Heading>

                                        {classInfo && (
                                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                                <span>
                                                    {UI_TEXT.classDetailModal.classCodePrefix}
                                                    {classInfo.classCode}
                                                </span>
                                                <span>{UI_TEXT.classDetailModal.dotSeparator}</span>
                                                <Badge color="brand" size="sm">
                                                    {getClassTypeLabel(classInfo.type)}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                        <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Content Container */}
                    <div className="custom-scrollbar flex min-h-[480px] flex-1 flex-col overflow-y-auto p-6">
                        {isLoading ? (
                            <div className="flex min-h-[300px] flex-1 items-center justify-center">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="size-7 animate-spin rounded-full border-2 border-slate-200 border-t-wine" />
                                    <span className="text-xs font-semibold text-slate-400">{UI_TEXT.common.loading}</span>
                                </div>
                            </div>
                        ) : activeSubPanel === "learning" ? (
                            <ClassLearningSubpanel classId={classId!} courses={courses} students={students} />
                        ) : activeSubPanel === "schedule" ? (
                            <ClassScheduleSubpanel classId={classId!} courses={courses} students={students} />
                        ) : (
                            <>
                                {/* Top Stats Overview Cards */}
                                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                                        <div className="flex size-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                                            <FolderOpen className="size-5" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold text-slate-400">{UI_TEXT.classDetailModal.statCourseCountTitle}</div>
                                            <div className="text-xl font-black text-slate-800">
                                                {summary.courseCount} {UI_TEXT.classDetailModal.statCourseCountUnit}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                                        <div className="flex size-11 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                                            <Users className="size-5" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold text-slate-400">{UI_TEXT.classDetailModal.statStudentCountTitle}</div>
                                            <div className="text-xl font-black text-slate-800">
                                                {summary.studentCount} {UI_TEXT.classDetailModal.statStudentCountUnit}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                                        <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                                            <GraduationCap className="size-5" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold text-slate-400">{UI_TEXT.classDetailModal.statActiveStudentTitle}</div>
                                            <div className="text-xl font-black text-emerald-600">
                                                {summary.activeStudentCount} {UI_TEXT.classDetailModal.statActiveStudentUnit}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Navigation Tabs */}
                                <div className="mb-6 flex border-b border-slate-200">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("info")}
                                        className={cx(
                                            "flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-extrabold transition",
                                            activeTab === "info"
                                                ? "border-wine text-wine"
                                                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700",
                                        )}
                                    >
                                        <Info className="size-4" />
                                        <span>{UI_TEXT.classDetailModal.tabGeneralInfo}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("courses")}
                                        className={cx(
                                            "flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-extrabold transition",
                                            activeTab === "courses"
                                                ? "border-wine text-wine"
                                                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700",
                                        )}
                                    >
                                        <FolderOpen className="size-4" />
                                        <span>
                                            {UI_TEXT.classDetailModal.tabAssignedCoursesPrefix}
                                            {summary.courseCount}
                                            {UI_TEXT.classDetailModal.tabAssignedCoursesSuffix}
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("students")}
                                        className={cx(
                                            "flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-extrabold transition",
                                            activeTab === "students"
                                                ? "border-wine text-wine"
                                                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700",
                                        )}
                                    >
                                        <Users className="size-4" />
                                        <span>
                                            {UI_TEXT.classDetailModal.tabStudentListPrefix}
                                            {summary.studentCount}
                                            {UI_TEXT.classDetailModal.tabStudentListSuffix}
                                        </span>
                                    </button>
                                </div>

                                {/* TAB 1: INFO & FEATURE DASHBOARD */}
                                {activeTab === "info" && (
                                    <div className="flex flex-1 flex-col gap-6">
                                        {/* Class Summary Box */}
                                        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 sm:flex-row sm:items-center">
                                            <div className="flex flex-col gap-1">
                                                <div className="text-xs font-bold text-slate-400">{UI_TEXT.classDetailModal.classInfoTitle}</div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-base font-extrabold text-slate-800">{classInfo?.name}</span>
                                                    <Badge color="brand" size="sm">
                                                        {classInfo?.classCode}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <Button
                                                color="secondary"
                                                size="sm"
                                                onClick={() => setIsEditClassOpen(true)}
                                                className="self-start sm:self-auto"
                                                iconLeading={<Edit className="size-3.5" />}
                                            >
                                                {UI_TEXT.classDetailModal.editClassInfoBtn}
                                            </Button>
                                        </div>

                                        {/* Feature Grid Header */}
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-bold text-slate-800">{UI_TEXT.classDetailModal.featureGridTitle}</h4>
                                            <span className="text-xs font-medium text-slate-400">{UI_TEXT.classDetailModal.featureGridSubtitle}</span>
                                        </div>

                                        {/* Grid 9 Cards */}
                                        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                                            {featureCards.map((card) => {
                                                const Icon = card.icon;
                                                return (
                                                    <div
                                                        key={card.id}
                                                        onClick={() => {
                                                            if (card.id === "learning" || card.id === "schedule") {
                                                                setActiveSubPanel(card.id);
                                                            }
                                                        }}
                                                        className={cx(
                                                            "group flex cursor-pointer flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-xs transition duration-200 hover:-translate-y-0.5 hover:shadow-md",
                                                            card.hoverBorder,
                                                        )}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className={cx("flex size-10 items-center justify-center rounded-xl border", card.color)}>
                                                                <Icon className="size-5" />
                                                            </div>
                                                            <ChevronRight className="size-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" />
                                                        </div>
                                                        <div className="mt-3 flex flex-col gap-1">
                                                            <h5 className={cx("text-sm font-extrabold text-slate-800 transition", card.hoverTitle)}>
                                                                {card.title}
                                                            </h5>
                                                            <p className="text-xs leading-relaxed font-medium text-slate-400">{card.desc}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* TAB 2: ASSIGNED COURSES */}
                                {activeTab === "courses" && (
                                    <div className="flex flex-1 flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-bold text-slate-800">{UI_TEXT.classDetailModal.assignedCoursesTitle}</h4>
                                            <Button
                                                color="primary"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedCourseClass(null);
                                                    setIsCourseClassModalOpen(true);
                                                }}
                                                className="gap-1.5 border-none bg-wine font-bold text-white"
                                                iconLeading={<Plus className="size-3.5" />}
                                            >
                                                {UI_TEXT.classDetailModal.assignNewCourseBtn}
                                            </Button>
                                        </div>

                                        {courses.length === 0 ? (
                                            <div className="flex min-h-[280px] flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center">
                                                <FolderOpen className="size-8 text-slate-300" />
                                                <p className="text-sm font-bold text-slate-700">{UI_TEXT.classDetailModal.emptyAssignedCoursesText}</p>
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-xs">
                                                <table className="w-full text-left text-sm">
                                                    <thead>
                                                        <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
                                                            <th className="px-4 py-3">{UI_TEXT.classDetailModal.thCourse}</th>
                                                            <th className="px-4 py-3">{UI_TEXT.classDetailModal.thMainTeacher}</th>
                                                            <th className="px-4 py-3">{UI_TEXT.classDetailModal.thTa}</th>
                                                            <th className="px-4 py-3 text-center">{UI_TEXT.classDetailModal.thStatus}</th>
                                                            <th className="px-4 py-3 text-center">{UI_TEXT.classDetailModal.thActions}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {courses.map((c) => (
                                                            <tr key={c.id} className="hover:bg-slate-50">
                                                                <td className="px-4 py-3 font-bold text-slate-900">
                                                                    {c.courseId?.name || UI_TEXT.classDetailModal.defaultCourseName}{" "}
                                                                    {`(${c.courseId?.courseCode})`}
                                                                </td>
                                                                <td className="px-4 py-3 text-xs text-slate-700">{c.teacherId?.fullName || "—"}</td>
                                                                <td className="px-4 py-3 text-xs text-slate-700">{c.taId?.fullName || "—"}</td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <div className="flex items-center justify-center">
                                                                        <Badge
                                                                            color={
                                                                                c.status === CourseClassStatusEnum.FINISHED
                                                                                    ? "gray"
                                                                                    : c.status === CourseClassStatusEnum.PENDING
                                                                                      ? "warning"
                                                                                      : "brand"
                                                                            }
                                                                            size="sm"
                                                                        >
                                                                            {c.status === CourseClassStatusEnum.FINISHED
                                                                                ? UI_TEXT.classDetailModal.statusFinished
                                                                                : c.status === CourseClassStatusEnum.PENDING
                                                                                  ? UI_TEXT.classDetailModal.statusPending
                                                                                  : UI_TEXT.classDetailModal.statusStudying}
                                                                        </Badge>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <div className="flex items-center justify-center gap-1.5">
                                                                        {(c.courseId?._id || c.courseId?.id) && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    setRpointCourseClass({
                                                                                        courseId: c.courseId?._id || c.courseId?.id || "",
                                                                                        title: c.courseId?.name || "",
                                                                                    })
                                                                                }
                                                                                className="cursor-pointer rounded-lg p-1 text-amber-600 hover:bg-amber-50"
                                                                                title={UI_TEXT.classDetail.configRpoint}
                                                                            >
                                                                                <Award className="size-4" />
                                                                            </button>
                                                                        )}
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setSelectedCourseClass(c);
                                                                                setIsCourseClassModalOpen(true);
                                                                            }}
                                                                            className="cursor-pointer rounded-lg p-1 text-blue-600 hover:bg-blue-50"
                                                                            title={UI_TEXT.classDetailModal.editAssignTooltip}
                                                                        >
                                                                            <Edit className="size-4" />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                setConfirmDelete({
                                                                                    isOpen: true,
                                                                                    type: ConfirmDeleteTypeEnum.COURSE,
                                                                                    id: c.id,
                                                                                    name: c.courseId?.name || UI_TEXT.classDetailModal.defaultCourseName,
                                                                                })
                                                                            }
                                                                            className="cursor-pointer rounded-lg p-1 text-red-600 hover:bg-red-50"
                                                                            title={UI_TEXT.classDetailModal.unassignCourseTooltip}
                                                                        >
                                                                            <Trash2 className="size-4 text-red-600" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* TAB 3: ROSTER SV */}
                                {activeTab === "students" && (
                                    <div className="flex flex-1 flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-bold text-slate-800">{UI_TEXT.classDetailModal.enrolledStudentsTitle}</h4>
                                            <Button
                                                color="primary"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedEnrollment(null);
                                                    setIsEnrollModalOpen(true);
                                                }}
                                                className="gap-1.5 border-none bg-wine font-bold text-white"
                                                iconLeading={<Plus className="size-3.5" />}
                                            >
                                                {UI_TEXT.classDetailModal.enrollStudentBtn}
                                            </Button>
                                        </div>

                                        {students.length === 0 ? (
                                            <div className="flex min-h-[280px] flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center">
                                                <Users className="size-8 text-slate-300" />
                                                <p className="text-sm font-bold text-slate-700">{UI_TEXT.classDetailModal.emptyStudentsText}</p>
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-xs">
                                                <table className="w-full text-left text-sm">
                                                    <thead>
                                                        <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase">
                                                            <th className="px-4 py-3 text-center">{UI_TEXT.classDetailModal.thStt}</th>
                                                            <th className="px-4 py-3">{UI_TEXT.classDetailModal.thStudentCode}</th>
                                                            <th className="px-4 py-3">{UI_TEXT.classDetailModal.thFullName}</th>
                                                            <th className="px-4 py-3 text-center">{UI_TEXT.classDetailModal.thActions}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {students.map((st, index) => (
                                                            <tr
                                                                key={st.enrollmentId}
                                                                className={cx("hover:bg-slate-50", !st.isActive && "bg-slate-50/50 opacity-70")}
                                                            >
                                                                <td className="px-4 py-3 text-center font-bold text-slate-400">{index + 1}</td>
                                                                <td className="px-4 py-3 font-semibold text-slate-800">{st.student?.studentCode || "-"}</td>
                                                                <td className="px-4 py-3 font-bold text-slate-900">{st.student?.fullName}</td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <Badge
                                                                        color={
                                                                            st.status === StudentClassStatusEnum.STUDYING
                                                                                ? "brand"
                                                                                : st.status === StudentClassStatusEnum.RESERVED
                                                                                  ? "warning"
                                                                                  : "gray"
                                                                        }
                                                                        size="sm"
                                                                    >
                                                                        {st.status === StudentClassStatusEnum.STUDYING
                                                                            ? UI_TEXT.classDetailModal.statusStudying
                                                                            : st.status === StudentClassStatusEnum.RESERVED
                                                                              ? UI_TEXT.classDetailModal.statusReserved
                                                                              : st.status === StudentClassStatusEnum.DROPOFF
                                                                                ? UI_TEXT.classDetailModal.statusDropoff
                                                                                : st.status || UI_TEXT.classDetailModal.statusStudying}
                                                                    </Badge>
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <div className="flex items-center justify-center gap-1.5">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setSelectedEnrollment(st);
                                                                                setIsEnrollModalOpen(true);
                                                                            }}
                                                                            className="cursor-pointer rounded-lg p-1 text-blue-600 hover:bg-blue-50"
                                                                            title={UI_TEXT.classDetailModal.editEnrollStatusTooltip}
                                                                        >
                                                                            <Edit className="size-4" />
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                setConfirmDelete({
                                                                                    isOpen: true,
                                                                                    type: ConfirmDeleteTypeEnum.STUDENT,
                                                                                    id: st.enrollmentId,
                                                                                    name: st.student?.fullName || UI_TEXT.classDetailModal.defaultStudentName,
                                                                                })
                                                                            }
                                                                            className="cursor-pointer rounded-lg p-1 text-red-600 hover:bg-red-50"
                                                                            title={UI_TEXT.classDetailModal.removeStudentTooltip}
                                                                        >
                                                                            <Trash2 className="size-4" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end border-t border-slate-100 px-6 py-4">
                        <Button type="button" color="secondary" size="md" onClick={onClose}>
                            {UI_TEXT.common.close}
                        </Button>
                    </div>
                </Dialog>
            </CustomModal.Content>

            {/* Class Edit Modal */}
            {classInfo && <ClassModal isOpen={isEditClassOpen} onClose={() => setIsEditClassOpen(false)} classData={classInfo} />}

            {/* Course Class Modal */}
            {classId && (
                <CourseClassModal
                    isOpen={isCourseClassModalOpen}
                    onClose={() => {
                        setIsCourseClassModalOpen(false);
                        setSelectedCourseClass(null);
                    }}
                    classId={classId}
                    courseClassData={selectedCourseClass}
                />
            )}

            {/* Course R-point Config Modal (per course-class) */}
            {classId && (
                <CourseRpointConfigModal
                    isOpen={!!rpointCourseClass}
                    onOpenChange={(open) => {
                        if (!open) setRpointCourseClass(null);
                    }}
                    courseId={rpointCourseClass?.courseId || ""}
                    courseTitle={rpointCourseClass?.title || ""}
                    classId={classId}
                />
            )}

            {/* Enroll Student Modal */}
            {classId && (
                <EnrollStudentModal
                    isOpen={isEnrollModalOpen}
                    onClose={() => {
                        setIsEnrollModalOpen(false);
                        setSelectedEnrollment(null);
                    }}
                    classId={classId}
                    enrollmentData={selectedEnrollment}
                />
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, type: null, id: null, name: "" })}
                onConfirm={handleConfirmDelete}
                title={
                    confirmDelete.type === ConfirmDeleteTypeEnum.COURSE
                        ? UI_TEXT.classDetailModal.confirmUnassignTitle
                        : UI_TEXT.classDetailModal.confirmRemoveStudentTitle
                }
                message={`${UI_TEXT.classDetailModal.confirmPrefix}${
                    confirmDelete.type === ConfirmDeleteTypeEnum.COURSE
                        ? `${UI_TEXT.classDetailModal.confirmUnassignMsgPrefix}${confirmDelete.name}${UI_TEXT.classDetailModal.confirmUnassignMsgSuffix}`
                        : `${UI_TEXT.classDetailModal.confirmRemoveStudentMsgPrefix}${confirmDelete.name}${UI_TEXT.classDetailModal.confirmRemoveStudentMsgSuffix}`
                }?`}
                confirmText={UI_TEXT.classDetailModal.confirmBtn}
                cancelText={UI_TEXT.classDetailModal.cancelBtn}
                isLoading={deleteCourseMutation.isPending || deleteStudentMutation.isPending}
            />
        </CustomModal.Root>
    );
}
