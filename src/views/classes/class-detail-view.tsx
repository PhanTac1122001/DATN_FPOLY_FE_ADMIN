"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Award,
    BookMarked,
    Calendar,
    ChevronRight,
    Code,
    Edit,
    FileCheck,
    FileText,
    FolderOpen,
    GraduationCap,
    Heart,
    HelpCircle,
    Info,
    Notebook,
    Pencil,
    PieChart,
    Plus,
    Trash2,
    Users,
} from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "@/components/application/breadcrumb";
import { ClassGroupsTab } from "@/components/application/classes/class-groups-tab";
import { ClassModal } from "@/components/application/modals/class-modal";
import { ConfirmModal } from "@/components/application/modals/confirm-modal";
import { CourseClassModal } from "@/components/application/modals/course-class-modal";
import { CourseRpointConfigModal } from "@/components/application/modals/course-rpoint-config-modal";
import { EnrollStudentModal } from "@/components/application/modals/enroll-student-modal";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { deleteCourseClass, deleteStudentFromClass, getClassDetail } from "@/services/class.service";
import { toast } from "@/services/toast.service";
import type { ClassDetailViewProps, CourseClassEmbed, DetailTabType, StudentClassEmbed } from "@/types/class.types";
import { CourseClassStatusEnum, StudentClassStatusEnum } from "@/types/class.types";
import { getClassTypeLabel } from "@/utils/class.utils";
import { cx } from "@/utils/cx";

export function ClassDetailView({ classId }: ClassDetailViewProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<DetailTabType>("info");

    // Modal States
    const [isEditClassOpen, setIsEditClassOpen] = useState(false);

    const [isCourseClassModalOpen, setIsCourseClassModalOpen] = useState(false);
    const [selectedCourseClass, setSelectedCourseClass] = useState<CourseClassEmbed | null>(null);

    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [selectedEnrollment, setSelectedEnrollment] = useState<StudentClassEmbed | null>(null);

    const [rpointCourseClass, setRpointCourseClass] = useState<{ courseId: string; title: string } | null>(null);

    const [confirmDelete, setConfirmDelete] = useState<{
        isOpen: boolean;
        type: string | null;
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
        queryFn: () => getClassDetail(classId),
        enabled: !!classId,
    });

    const classInfo = detail?.class;
    const courses = detail?.courses || [];
    const students = detail?.students || [];
    const groups = detail?.groups || [];
    const studyingCount = students.filter((s) => s.isActive !== false && (s.status === StudentClassStatusEnum.STUDYING || !s.status)).length;
    const summary = {
        courseCount: detail?.summary?.courseCount ?? courses.length,
        studentCount: detail?.summary?.studentCount ?? students.length,
        activeStudentCount: studyingCount,
        groupCount: detail?.summary?.groupCount ?? groups.length,
    };

    // Mutations for delete
    const deleteCourseMutation = useMutation({
        mutationFn: (id: string) => deleteCourseClass(id),
        onSuccess: () => {
            toast.success(UI_TEXT.classes.toastSuccess, UI_TEXT.classDetail.toastCancelAssignmentSuccess);
            queryClient.invalidateQueries({ queryKey: ["class-detail", classId] });
            queryClient.invalidateQueries({ queryKey: ["classes"] });
            queryClient.invalidateQueries({ queryKey: ["class-groups"] });
            setConfirmDelete({ isOpen: false, type: null, id: null, name: "" });
        },
        onError: (err: Error) => {
            toast.error(UI_TEXT.classes.toastError, err.message || UI_TEXT.classDetail.toastCancelAssignmentError);
        },
    });

    const deleteStudentMutation = useMutation({
        mutationFn: (id: string) => deleteStudentFromClass(id),
        onSuccess: () => {
            toast.success(UI_TEXT.classes.toastSuccess, UI_TEXT.classDetail.toastRemoveStudentSuccess);
            queryClient.invalidateQueries({ queryKey: ["class-detail", classId] });
            queryClient.invalidateQueries({ queryKey: ["classes"] });
            queryClient.invalidateQueries({ queryKey: ["class-groups"] });
            setConfirmDelete({ isOpen: false, type: null, id: null, name: "" });
        },
        onError: (err: Error) => {
            toast.error(UI_TEXT.classes.toastError, err.message || UI_TEXT.classDetail.toastRemoveStudentError);
        },
    });

    const handleConfirmDelete = () => {
        if (!confirmDelete.id) return;
        if (confirmDelete.type === `course`) {
            deleteCourseMutation.mutate(confirmDelete.id);
        } else if (confirmDelete.type === `student`) {
            deleteStudentMutation.mutate(confirmDelete.id);
        }
    };

    const featureCards = [
        {
            id: "schedule",
            title: UI_TEXT.classDetail.featureCards.scheduleTitle,
            desc: UI_TEXT.classDetail.featureCards.scheduleDesc,
            icon: Calendar,
            color: "text-wine bg-wine-soft border-wine",
            hoverBorder: "hover:border-wine hover:shadow-wine/10",
            hoverTitle: "group-hover:text-wine",
        },
        {
            id: "learning",
            title: UI_TEXT.classDetail.featureCards.learningTitle,
            desc: UI_TEXT.classDetail.featureCards.learningDesc,
            icon: Notebook,
            color: "text-blue-600 bg-blue-50 border-blue-500",
            hoverBorder: "hover:border-blue-500 hover:shadow-blue-500/10",
            hoverTitle: "group-hover:text-blue-600",
        },
        {
            id: "resources",
            title: UI_TEXT.classDetail.featureCards.resourcesTitle,
            desc: UI_TEXT.classDetail.featureCards.resourcesDesc,
            icon: FolderOpen,
            color: "text-amber-600 bg-amber-50 border-amber-500",
            hoverBorder: "hover:border-amber-500 hover:shadow-amber-500/10",
            hoverTitle: "group-hover:text-amber-600",
        },
        {
            id: "homework",
            title: UI_TEXT.classDetail.featureCards.homeworkTitle,
            desc: UI_TEXT.classDetail.featureCards.homeworkDesc,
            icon: FileText,
            color: "text-emerald-600 bg-emerald-50 border-emerald-500",
            hoverBorder: "hover:border-emerald-500 hover:shadow-emerald-500/10",
            hoverTitle: "group-hover:text-emerald-600",
        },
        {
            id: "quizziz",
            title: UI_TEXT.classDetail.featureCards.quizzizTitle,
            desc: UI_TEXT.classDetail.featureCards.quizzizDesc,
            icon: HelpCircle,
            color: "text-purple-600 bg-purple-50 border-purple-500",
            hoverBorder: "hover:border-purple-500 hover:shadow-purple-500/10",
            hoverTitle: "group-hover:text-purple-600",
        },
        {
            id: "practice",
            title: UI_TEXT.classDetail.featureCards.practiceTitle,
            desc: UI_TEXT.classDetail.featureCards.practiceDesc,
            icon: Code,
            color: "text-indigo-600 bg-indigo-50 border-indigo-500",
            hoverBorder: "hover:border-indigo-500 hover:shadow-indigo-500/10",
            hoverTitle: "group-hover:text-indigo-600",
        },
        {
            id: "leaves",
            title: UI_TEXT.classDetail.featureCards.leavesTitle,
            desc: UI_TEXT.classDetail.featureCards.leavesDesc,
            icon: FileCheck,
            color: "text-orange-600 bg-orange-50 border-orange-500",
            hoverBorder: "hover:border-orange-500 hover:shadow-orange-500/10",
            hoverTitle: "group-hover:text-orange-600",
        },
        {
            id: "mindmap",
            title: UI_TEXT.classDetail.featureCards.mindmapTitle,
            desc: UI_TEXT.classDetail.featureCards.mindmapDesc,
            icon: PieChart,
            color: "text-cyan-600 bg-cyan-50 border-cyan-500",
            hoverBorder: "hover:border-cyan-500 hover:shadow-cyan-500/10",
            hoverTitle: "group-hover:text-cyan-600",
        },
        {
            id: "care",
            title: UI_TEXT.classDetail.featureCards.careTitle,
            desc: UI_TEXT.classDetail.featureCards.careDesc,
            icon: Heart,
            color: "text-rose-600 bg-rose-50 border-rose-500",
            hoverBorder: "hover:border-rose-500 hover:shadow-rose-500/10",
            hoverTitle: "group-hover:text-rose-600",
        },
    ];

    if (isLoading) {
        return (
            <div className="flex h-96 flex-col items-center justify-center gap-3">
                <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
                <p className="text-sm font-semibold text-slate-500">{UI_TEXT.classes.loading}</p>
            </div>
        );
    }

    return (
        <div className="flex w-full flex-1 flex-col gap-6">
            {/* Breadcrumb Header Bar */}
            <div className="flex flex-col gap-3">
                <Breadcrumb items={[{ label: UI_TEXT.classes.title, href: "/classes" }, { label: classInfo?.name || "Chi tiết lớp học" }]} />
            </div>

            {/* Navigation Tabs Header */}
            <div className="flex gap-6 border-b border-slate-200">
                <button
                    type="button"
                    onClick={() => setActiveTab("info")}
                    className={cx(
                        "flex cursor-pointer items-center gap-2 border-b-2 px-2 py-3 text-sm font-semibold transition duration-150",
                        activeTab === "info" ? "border-wine font-bold text-wine" : "border-transparent text-slate-500 hover:text-wine-bright",
                    )}
                >
                    <Info className="size-4" />
                    <span>{UI_TEXT.classes.tabGeneralInfo}</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("courses")}
                    className={cx(
                        "flex cursor-pointer items-center gap-2 border-b-2 px-2 py-3 text-sm font-semibold transition duration-150",
                        activeTab === "courses" ? "border-wine font-bold text-wine" : "border-transparent text-slate-500 hover:text-wine-bright",
                    )}
                >
                    <GraduationCap className="size-4" />
                    <span>
                        {UI_TEXT.classDetail.tabCoursesAssigned} {"("}
                        {summary.courseCount || courses.length}
                        {")"}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("students")}
                    className={cx(
                        "flex cursor-pointer items-center gap-2 border-b-2 px-2 py-3 text-sm font-semibold transition duration-150",
                        activeTab === "students" ? "border-wine font-bold text-wine" : "border-transparent text-slate-500 hover:text-wine-bright",
                    )}
                >
                    <Users className="size-4" />
                    <span>
                        {UI_TEXT.classDetail.tabRosterSv} {"("}
                        {summary.studentCount || students.length}
                        {")"}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab("groups")}
                    className={cx(
                        "flex cursor-pointer items-center gap-2 border-b-2 px-2 py-3 text-sm font-semibold transition duration-150",
                        activeTab === "groups" ? "border-wine font-bold text-wine" : "border-transparent text-slate-500 hover:text-wine-bright",
                    )}
                >
                    <Users className="size-4" />
                    <span>
                        {UI_TEXT.classDetail.tabGroups} {"("}
                        {summary.groupCount || groups.length}
                        {")"}
                    </span>
                </button>
            </div>

            {/* TAB 1: THÔNG TIN LỚP HỌC */}
            {activeTab === "info" && (
                <div className="flex flex-col gap-6">
                    {/* Class Name Header & Actions */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">{classInfo?.name || UI_TEXT.classDetail.title}</h2>
                            <p className="mt-0.5 text-xs font-medium text-slate-500">
                                {UI_TEXT.classDetail.labelClassType} <strong className="text-slate-700">{getClassTypeLabel(classInfo?.type)}</strong>
                            </p>
                        </div>
                        <Button
                            color="secondary"
                            size="md"
                            onClick={() => setIsEditClassOpen(true)}
                            className="gap-2 border-slate-200"
                            iconLeading={<Edit className="size-4 text-slate-600" />}
                        >
                            {UI_TEXT.classes.editClass}
                        </Button>
                    </div>

                    {/* Summary Stats Cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
                            <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <BookMarked className="size-6" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500">{UI_TEXT.classDetail.thCourse}</p>
                                <p className="text-2xl font-bold text-slate-900">{summary.courseCount}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
                            <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <Users className="size-6" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500">{UI_TEXT.classDetail.totalStudents}</p>
                                <p className="text-2xl font-bold text-slate-900">{summary.studentCount}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
                            <div className="flex size-12 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                                <Users className="size-6" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-500">{UI_TEXT.classDetail.totalGroups}</p>
                                <p className="text-2xl font-bold text-slate-900">{summary.groupCount}</p>
                            </div>
                        </div>
                    </div>

                    {/* Feature Selection Grid */}
                    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
                        <p className="mb-4 text-xs font-bold tracking-wider text-slate-500 uppercase">{UI_TEXT.classDetail.selectFeatureToManage}</p>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {featureCards.map((card) => {
                                const CardIcon = card.icon;
                                return (
                                    <div
                                        key={card.id}
                                        onClick={() => {
                                            if (card.id === "group") {
                                                setActiveTab("groups");
                                            } else if (card.id === "schedule" || card.id === "learning" || card.id === "homework" || card.id === "leaves") {
                                                router.push(`/classes/${classId}/${card.id}` as Route);
                                            } else if (card.id === "quizziz") {
                                                router.push(`/classes/${classId}/quiz` as Route);
                                            } else {
                                                toast.info(card.title, UI_TEXT.classDetail.toastFeatureUnderDevelopment);
                                            }
                                        }}
                                        className={cx(
                                            "group flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md",
                                            "border-l-4 border-slate-200 bg-white",
                                            card.hoverBorder,
                                        )}
                                    >
                                        <div className={cx("flex size-12 shrink-0 items-center justify-center rounded-xl", card.color)}>
                                            <CardIcon className="size-6" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className={cx("text-sm font-bold text-slate-900 transition-colors duration-150", card.hoverTitle)}>
                                                {card.title}
                                            </p>
                                            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500">{card.desc}</p>
                                        </div>
                                        <ChevronRight
                                            className={cx("size-4 shrink-0 text-slate-300 transition duration-150 group-hover:translate-x-1", card.hoverTitle)}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: MÔN ĐƯỢC ASSIGN */}
            {activeTab === "courses" && (
                <div className="flex flex-1 flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">{UI_TEXT.classDetail.assignedCoursesTitle}</h3>
                            <p className="text-xs text-slate-500">{UI_TEXT.classDetail.assignedCoursesSubtitle}</p>
                        </div>
                        <Button
                            color="primary"
                            size="md"
                            onClick={() => {
                                setSelectedCourseClass(null);
                                setIsCourseClassModalOpen(true);
                            }}
                            className="gap-1.5 border-none bg-wine font-bold text-white"
                            iconLeading={<Plus className="size-4" />}
                        >
                            {UI_TEXT.classDetail.assignCourseBtn}
                        </Button>
                    </div>

                    {courses.length === 0 ? (
                        <div className="flex min-h-[400px] flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-8 text-center">
                            <GraduationCap className="size-10 text-slate-300" />
                            <p className="text-base font-bold text-slate-700">{UI_TEXT.classDetail.noAssignedCourses}</p>
                            <p className="text-xs text-slate-400">{UI_TEXT.classDetail.noAssignedCoursesDesc}</p>
                        </div>
                    ) : (
                        <div className="flex min-h-[400px] flex-1 flex-col overflow-x-auto rounded-2xl border border-line bg-white shadow-xs">
                            <table className="w-full table-auto border-collapse text-left text-sm text-ink">
                                <thead>
                                    <tr className="sticky top-0 z-10 border-b border-line bg-slate-50 text-[11px] font-bold tracking-wider text-muted uppercase">
                                        <th className="px-6 py-4">{UI_TEXT.classDetail.thCourse}</th>
                                        <th className="px-6 py-4">{UI_TEXT.classDetail.thTeacher}</th>
                                        <th className="px-6 py-4">{UI_TEXT.classDetail.thTa}</th>
                                        <th className="px-6 py-4 text-center">{UI_TEXT.classDetail.thTime}</th>
                                        <th className="px-6 py-4 text-center">{UI_TEXT.classDetail.thStatus}</th>
                                        <th className="px-6 py-4 text-center">{UI_TEXT.classDetail.thAction}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {courses.map((c) => (
                                        <tr key={c.id} className="group transition duration-150 hover:bg-slate-50">
                                            <td className="border-b border-line px-6 py-4 font-bold text-ink">
                                                <div>
                                                    <p>{c.courseId?.name || "Môn học"}</p>
                                                    <p className="text-xs font-normal text-slate-400">{c.courseId?.courseCode}</p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                {c.teacherId ? (
                                                    <div>
                                                        <p className="font-semibold text-slate-800">{c.teacherId.fullName}</p>
                                                        <p className="text-xs text-slate-400">{c.teacherId.email}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">{UI_TEXT.classDetail.notAssigned}</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                {c.taId ? (
                                                    <div>
                                                        <p className="font-semibold text-slate-800">{c.taId.fullName}</p>
                                                        <p className="text-xs text-slate-400">{c.taId.email}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">{UI_TEXT.classDetail.none}</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-center text-xs text-slate-500">
                                                {c.startDate ? new Date(c.startDate).toLocaleDateString() : "—"} {"-"}{" "}
                                                {c.endDate ? new Date(c.endDate).toLocaleDateString() : "—"}
                                            </td>
                                            <td className="px-5 py-4 text-center">
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
                                                            ? UI_TEXT.classDetail.statusFinished
                                                            : c.status === CourseClassStatusEnum.PENDING
                                                              ? UI_TEXT.classDetail.statusPending
                                                              : UI_TEXT.classDetail.statusStudying}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="border-b border-line px-6 py-4 text-center group-last:border-b-0">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {c.courseId?.id && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setRpointCourseClass({ courseId: c.courseId?.id || "", title: c.courseId?.name || "" })
                                                            }
                                                            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-amber-50 text-amber-600 transition duration-200 hover:bg-amber-600 hover:text-white"
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
                                                        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition duration-200 hover:bg-emerald-600 hover:text-white"
                                                        title={UI_TEXT.classDetail.editAssignment}
                                                    >
                                                        <Pencil className="size-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setConfirmDelete({
                                                                isOpen: true,
                                                                type: "course",
                                                                id: c.id,
                                                                name: c.courseId?.name || "Môn học này",
                                                            })
                                                        }
                                                        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-rose-50 text-rose-600 transition hover:bg-rose-600 hover:text-white"
                                                        title={UI_TEXT.classDetail.cancelAssignment}
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

            {/* TAB 3: ROSTER SV */}
            {activeTab === "students" && (
                <div className="flex flex-1 flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">{UI_TEXT.classDetail.studentListTitle}</h3>
                            <p className="text-xs text-slate-500">{UI_TEXT.classDetail.studentListSubtitle}</p>
                        </div>
                        <Button
                            color="primary"
                            size="md"
                            onClick={() => {
                                setSelectedEnrollment(null);
                                setIsEnrollModalOpen(true);
                            }}
                            className="gap-1.5 border-none bg-wine font-bold text-white"
                            iconLeading={<Plus className="size-4" />}
                        >
                            {UI_TEXT.classDetail.enrollStudentBtn}
                        </Button>
                    </div>

                    {students.length === 0 ? (
                        <div className="flex min-h-[400px] flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-8 text-center">
                            <Users className="size-10 text-slate-300" />
                            <p className="text-base font-bold text-slate-700">{UI_TEXT.classDetail.noStudentsEnrolled}</p>
                            <p className="text-xs text-slate-400">{UI_TEXT.classDetail.noEnrolledStudentsDesc}</p>
                        </div>
                    ) : (
                        <div className="flex min-h-[400px] flex-1 flex-col overflow-x-auto rounded-2xl border border-line bg-white shadow-xs">
                            <table className="w-full table-auto border-collapse text-left text-sm text-ink">
                                <thead>
                                    <tr className="sticky top-0 z-10 border-b border-line bg-slate-50 text-[11px] font-bold tracking-wider text-muted uppercase">
                                        <th className="w-12 px-6 py-4 text-center">{UI_TEXT.classDetail.thStt}</th>
                                        <th className="px-6 py-4">{UI_TEXT.classDetail.thStudentCode}</th>
                                        <th className="px-6 py-4">{UI_TEXT.classDetail.thFullName}</th>
                                        <th className="px-6 py-4">{UI_TEXT.classDetail.thEmail}</th>
                                        <th className="px-6 py-4 text-center">{UI_TEXT.classDetail.thAction}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {students.map((st, index) => (
                                        <tr
                                            key={st.enrollmentId}
                                            className={cx("group transition duration-150 hover:bg-slate-50", !st.isActive && "bg-slate-50/50 opacity-70")}
                                        >
                                            <td className="border-b border-line px-6 py-4 text-center font-semibold text-muted">{index + 1}</td>
                                            <td className="px-5 py-4 font-semibold text-slate-800">{st.student?.studentCode || "—"}</td>
                                            <td className="px-5 py-4 font-bold text-slate-900">{st.student?.fullName || "Sinh viên"}</td>
                                            <td className="px-5 py-4 text-slate-500">{st.student?.email || "—"}</td>
                                            <td className="border-b border-line px-6 py-4 text-center group-last:border-b-0">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedEnrollment(st);
                                                            setIsEnrollModalOpen(true);
                                                        }}
                                                        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition duration-200 hover:bg-emerald-600 hover:text-white"
                                                        title={UI_TEXT.classDetail.editEnrollmentStatus}
                                                    >
                                                        <Pencil className="size-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setConfirmDelete({
                                                                isOpen: true,
                                                                type: `student`,
                                                                id: st.enrollmentId,
                                                                name: st.student?.fullName || "Sinh viên này",
                                                            })
                                                        }
                                                        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-rose-50 text-rose-600 transition hover:bg-rose-600 hover:text-white"
                                                        title={UI_TEXT.classDetail.removeFromClass}
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

            {/* TAB 4: QUẢN LÝ NHÓM */}
            {activeTab === "groups" && (
                <ClassGroupsTab
                    classId={classId}
                    initialGroups={detail?.groups}
                    availableSubjects={courses.map((c: CourseClassEmbed) => {
                        const course = c.courseId;
                        return {
                            id: course?.id || (typeof course === "string" ? course : c.id),
                            name: course?.name || "Môn học",
                            courseCode: course?.courseCode || "",
                        };
                    })}
                />
            )}

            {/* Class Edit Modal */}
            <ClassModal isOpen={isEditClassOpen} onClose={() => setIsEditClassOpen(false)} classData={classInfo} />

            {/* Course Class Modal (Assign/Edit Course) */}
            <CourseClassModal
                isOpen={isCourseClassModalOpen}
                onClose={() => {
                    setIsCourseClassModalOpen(false);
                    setSelectedCourseClass(null);
                }}
                classId={classId}
                courseClassData={selectedCourseClass}
            />

            {/* Course R-point Config Modal (per course-class) */}
            <CourseRpointConfigModal
                isOpen={!!rpointCourseClass}
                onOpenChange={(open) => {
                    if (!open) setRpointCourseClass(null);
                }}
                courseId={rpointCourseClass?.courseId || ""}
                courseTitle={rpointCourseClass?.title || ""}
                classId={classId}
            />

            {/* Enroll Student Modal (Enroll/Edit Student) */}
            <EnrollStudentModal
                isOpen={isEnrollModalOpen}
                onClose={() => {
                    setIsEnrollModalOpen(false);
                    setSelectedEnrollment(null);
                }}
                classId={classId}
                enrollmentData={selectedEnrollment}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, type: null, id: null, name: "" })}
                onConfirm={handleConfirmDelete}
                title={confirmDelete.type === "course" ? "Hủy phân công môn học" : "Gỡ sinh viên khỏi lớp"}
                message={`Bạn có chắc chắn muốn ${
                    confirmDelete.type === "course" ? `hủy phân công "${confirmDelete.name}" khỏi lớp học` : `gỡ sinh viên "${confirmDelete.name}" khỏi lớp học`
                }?`}
                confirmText="Xác nhận"
                cancelText="Hủy"
                isLoading={deleteCourseMutation.isPending || deleteStudentMutation.isPending}
            />
        </div>
    );
}
