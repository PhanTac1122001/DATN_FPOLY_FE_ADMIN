"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calculator, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { MultiComboBox } from "@/components/base/select/multi-combobox";
import { Select } from "@/components/base/select/select";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { DEFAULT_GRADING_WEIGHTS, DEFAULT_PASS_SCORE, FULL_WEIGHT_PERCENT } from "@/constants/options.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { careerTagService } from "@/services/career-tag.service";
import { courseCategoryService } from "@/services/course-category.service";
import { toast } from "@/services/toast.service";
import { AccessModeEnum, type CourseFormModalProps, FinalExamTypeEnum } from "@/types/course.types";

const defaultScoringMethod = "FULL_PROJECT";
const noCategoryKey = "__none__";

export function CourseFormModal({ isOpen, onOpenChange, initialData, onSubmit }: CourseFormModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Form fields
    const [code, setCode] = useState("");
    const [title, setTitle] = useState("");
    const [totalSessions, setTotalSessions] = useState<number | string>("");
    const [description, setDescription] = useState("");
    const [learningOutcomes, setLearningOutcomes] = useState("");
    const [accessMode, setAccessMode] = useState<AccessModeEnum>(AccessModeEnum.SEQUENTIAL);

    // Roadmap fields — nhóm môn (single) + tags nghề nghiệp (multi)
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [careerTagIds, setCareerTagIds] = useState<string[]>([]);

    const { data: courseCategories = [] } = useQuery({
        queryKey: ["course-categories"],
        queryFn: courseCategoryService.getAll,
        enabled: isOpen,
    });
    const { data: careerTags = [] } = useQuery({
        queryKey: ["career-tags"],
        queryFn: careerTagService.getAll,
        enabled: isOpen,
    });

    // Custom Grading Formula (always on — preset scoringMethod is no longer configurable in UI)
    const [attendanceWeight, setAttendanceWeight] = useState<number>(DEFAULT_GRADING_WEIGHTS.ATTENDANCE);
    const [quizWeight, setQuizWeight] = useState<number>(DEFAULT_GRADING_WEIGHTS.QUIZ);
    const [hackathonWeight, setHackathonWeight] = useState<number>(DEFAULT_GRADING_WEIGHTS.HACKATHON);
    const [examWeight, setExamWeight] = useState<number>(DEFAULT_GRADING_WEIGHTS.EXAM);

    const [hackathonQuizWeight, setHackathonQuizWeight] = useState<number>(DEFAULT_GRADING_WEIGHTS.HACKATHON_QUIZ);
    const [hackathonEssayWeight, setHackathonEssayWeight] = useState<number>(DEFAULT_GRADING_WEIGHTS.HACKATHON_ESSAY);

    const [finalExamType, setFinalExamType] = useState<FinalExamTypeEnum>(FinalExamTypeEnum.PROJECT);
    const [projectProductWeight, setProjectProductWeight] = useState<number>(DEFAULT_GRADING_WEIGHTS.PROJECT_PRODUCT);
    const [projectKnowledgeWeight, setProjectKnowledgeWeight] = useState<number>(DEFAULT_GRADING_WEIGHTS.PROJECT_KNOWLEDGE);
    const [projectInterviewWeight, setProjectInterviewWeight] = useState<number>(DEFAULT_GRADING_WEIGHTS.PROJECT_INTERVIEW);

    const [essayEssayWeight, setEssayEssayWeight] = useState<number>(DEFAULT_GRADING_WEIGHTS.ESSAY_ESSAY);
    const [essayQuizWeight, setEssayQuizWeight] = useState<number>(DEFAULT_GRADING_WEIGHTS.ESSAY_QUIZ);

    const [passScore, setPassScore] = useState<number>(DEFAULT_PASS_SCORE);

    useEffect(() => {
        setSubmitted(false);
        if (initialData) {
            setCode(initialData.code);
            setTitle(initialData.title);
            setTotalSessions(initialData.totalSessions ?? "");
            setDescription(initialData.description || "");
            setLearningOutcomes(initialData.learningOutcomes || "");
            setAccessMode(initialData.accessMode ? (initialData.accessMode as AccessModeEnum) : AccessModeEnum.SEQUENTIAL);
            setCategoryId(initialData.categoryId ?? null);
            setCareerTagIds(initialData.careerTagIds ?? []);

            setAttendanceWeight(initialData.gradingFormula.attendanceWeight ?? DEFAULT_GRADING_WEIGHTS.ATTENDANCE);
            setQuizWeight(initialData.gradingFormula.quizWeight ?? DEFAULT_GRADING_WEIGHTS.QUIZ);
            setHackathonWeight(initialData.gradingFormula.hackathonWeight ?? DEFAULT_GRADING_WEIGHTS.HACKATHON);
            setExamWeight(initialData.gradingFormula.examWeight ?? DEFAULT_GRADING_WEIGHTS.EXAM);
            setHackathonQuizWeight(initialData.gradingFormula.hackathonQuizWeight ?? DEFAULT_GRADING_WEIGHTS.HACKATHON_QUIZ);
            setHackathonEssayWeight(initialData.gradingFormula.hackathonEssayWeight ?? DEFAULT_GRADING_WEIGHTS.HACKATHON_ESSAY);
            setFinalExamType(
                initialData.gradingFormula.finalExamType ? (initialData.gradingFormula.finalExamType as FinalExamTypeEnum) : FinalExamTypeEnum.PROJECT,
            );
            setProjectProductWeight(initialData.gradingFormula.projectProductWeight ?? DEFAULT_GRADING_WEIGHTS.PROJECT_PRODUCT);
            setProjectKnowledgeWeight(initialData.gradingFormula.projectKnowledgeWeight ?? DEFAULT_GRADING_WEIGHTS.PROJECT_KNOWLEDGE);
            setProjectInterviewWeight(initialData.gradingFormula.projectInterviewWeight ?? DEFAULT_GRADING_WEIGHTS.PROJECT_INTERVIEW);
            setEssayEssayWeight(initialData.gradingFormula.essayEssayWeight ?? DEFAULT_GRADING_WEIGHTS.ESSAY_ESSAY);
            setEssayQuizWeight(initialData.gradingFormula.essayQuizWeight ?? DEFAULT_GRADING_WEIGHTS.ESSAY_QUIZ);
            setPassScore(initialData.gradingFormula.passScore ?? DEFAULT_PASS_SCORE);
        } else {
            setCode("");
            setTitle("");
            setTotalSessions("");
            setDescription("");
            setLearningOutcomes("");
            setAccessMode(AccessModeEnum.SEQUENTIAL);
            setCategoryId(null);
            setCareerTagIds([]);

            setAttendanceWeight(DEFAULT_GRADING_WEIGHTS.ATTENDANCE);
            setQuizWeight(DEFAULT_GRADING_WEIGHTS.QUIZ);
            setHackathonWeight(DEFAULT_GRADING_WEIGHTS.HACKATHON);
            setExamWeight(DEFAULT_GRADING_WEIGHTS.EXAM);
            setHackathonQuizWeight(DEFAULT_GRADING_WEIGHTS.HACKATHON_QUIZ);
            setHackathonEssayWeight(DEFAULT_GRADING_WEIGHTS.HACKATHON_ESSAY);
            setFinalExamType(FinalExamTypeEnum.PROJECT);
            setProjectProductWeight(DEFAULT_GRADING_WEIGHTS.PROJECT_PRODUCT);
            setProjectKnowledgeWeight(DEFAULT_GRADING_WEIGHTS.PROJECT_KNOWLEDGE);
            setProjectInterviewWeight(DEFAULT_GRADING_WEIGHTS.PROJECT_INTERVIEW);
            setEssayEssayWeight(DEFAULT_GRADING_WEIGHTS.ESSAY_ESSAY);
            setEssayQuizWeight(DEFAULT_GRADING_WEIGHTS.ESSAY_QUIZ);
            setPassScore(DEFAULT_PASS_SCORE);
        }
    }, [initialData, isOpen]);

    const activeCourseCategories = courseCategories.filter((courseCategory) => courseCategory.isActive);
    const isCurrentCategoryStillActive = activeCourseCategories.some((courseCategory) => courseCategory.id === initialData?.categoryId);
    const hiddenCurrentCategory =
        !isCurrentCategoryStillActive && initialData?.categoryId
            ? courseCategories.find((courseCategory) => courseCategory.id === initialData.categoryId)
            : undefined;
    const categoryItems = [
        { id: noCategoryKey, label: UI_TEXT.courseFormModal.courseFormCategoryNone },
        ...activeCourseCategories.map((courseCategory) => ({ id: courseCategory.id, label: courseCategory.name })),
        ...(hiddenCurrentCategory ? [{ id: hiddenCurrentCategory.id, label: hiddenCurrentCategory.name }] : []),
    ];
    const careerTagItems = careerTags.map((careerTag) => ({ id: careerTag.id, label: careerTag.name }));

    const handleCategoryChange = (key: string | number | null) => {
        if (key === null || key === undefined) {
            setCategoryId(null);
            return;
        }
        setCategoryId(key === noCategoryKey ? null : String(key));
    };

    const isInvalidWeight = (val: number) => isNaN(val) || val < 0 || val > FULL_WEIGHT_PERCENT;

    const generalTotal = Number(attendanceWeight) + Number(quizWeight) + Number(hackathonWeight) + Number(examWeight);
    const hackathonTotal = Number(hackathonQuizWeight) + Number(hackathonEssayWeight);
    const projectTotal = Number(projectProductWeight) + Number(projectKnowledgeWeight) + Number(projectInterviewWeight);
    const essayTotal = Number(essayEssayWeight) + Number(essayQuizWeight);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);

        if (!title.trim() || !code.trim() || totalSessions === "" || Number(totalSessions) <= 0) {
            toast.error(UI_TEXT.common.errorTitle, UI_TEXT.courseFormModal.toastRequiredError);
            return;
        }

        const isAnyWeightOutOfRange =
            isInvalidWeight(attendanceWeight) ||
            isInvalidWeight(quizWeight) ||
            isInvalidWeight(hackathonWeight) ||
            isInvalidWeight(hackathonQuizWeight) ||
            isInvalidWeight(hackathonEssayWeight) ||
            isInvalidWeight(examWeight) ||
            (finalExamType === FinalExamTypeEnum.PROJECT &&
                (isInvalidWeight(projectProductWeight) || isInvalidWeight(projectKnowledgeWeight) || isInvalidWeight(projectInterviewWeight))) ||
            (finalExamType === FinalExamTypeEnum.ESSAY && (isInvalidWeight(essayEssayWeight) || isInvalidWeight(essayQuizWeight)));

        if (isAnyWeightOutOfRange) {
            toast.error(UI_TEXT.common.errorTitle, UI_TEXT.courseFormModal.toastWeightOutOfRange);
            return;
        }

        if (generalTotal !== FULL_WEIGHT_PERCENT) {
            toast.error(
                UI_TEXT.common.errorTitle,
                `${UI_TEXT.courseFormModal.toastWeight100ErrorPrefix}${generalTotal}${UI_TEXT.courseFormModal.toastWeight100ErrorSuffix}`,
            );
            return;
        }
        if (hackathonTotal !== FULL_WEIGHT_PERCENT) {
            toast.error(
                UI_TEXT.common.errorTitle,
                `${UI_TEXT.courseFormModal.toastHackathon100ErrorPrefix}${hackathonTotal}${UI_TEXT.courseFormModal.toastWeight100ErrorSuffix}`,
            );
            return;
        }
        if (finalExamType === FinalExamTypeEnum.PROJECT && projectTotal !== FULL_WEIGHT_PERCENT) {
            toast.error(
                UI_TEXT.common.errorTitle,
                `${UI_TEXT.courseFormModal.toastProject100ErrorPrefix}${projectTotal}${UI_TEXT.courseFormModal.toastWeight100ErrorSuffix}`,
            );
            return;
        }
        if (finalExamType === FinalExamTypeEnum.ESSAY && essayTotal !== FULL_WEIGHT_PERCENT) {
            toast.error(
                UI_TEXT.common.errorTitle,
                `${UI_TEXT.courseFormModal.toastEssay100ErrorPrefix}${essayTotal}${UI_TEXT.courseFormModal.toastWeight100ErrorSuffix}`,
            );
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                code: code.trim(),
                title: title.trim(),
                totalSessions: totalSessions === "" ? undefined : Number(totalSessions),
                category: initialData?.category || defaultScoringMethod,
                categoryId,
                careerTagIds,
                description: description.trim(),
                learningOutcomes: learningOutcomes.trim(),
                accessMode,
                rPointConfig: {
                    enabled: false,
                    rPointValue: 0,
                    minCompletionRate: 0,
                },
                gradingFormula: {
                    useCustomFormula: true,
                    attendanceWeight: Number(attendanceWeight),
                    quizWeight: Number(quizWeight),
                    hackathonWeight: Number(hackathonWeight),
                    examWeight: Number(examWeight),
                    hackathonQuizWeight: Number(hackathonQuizWeight),
                    hackathonEssayWeight: Number(hackathonEssayWeight),
                    finalExamType,
                    projectProductWeight: Number(projectProductWeight),
                    projectKnowledgeWeight: Number(projectKnowledgeWeight),
                    projectInterviewWeight: Number(projectInterviewWeight),
                    essayEssayWeight: Number(essayEssayWeight),
                    essayQuizWeight: Number(essayQuizWeight),
                    passScore: Number(passScore),
                },
            });
            onOpenChange(false);
        } catch {
            // Handled by createMutation/updateMutation onError toast
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <CustomModal.Root open={isOpen} onOpenChange={onOpenChange}>
            <CustomModal.Content className="w-full max-w-5xl overflow-hidden !rounded-[24px]">
                <Dialog className="flex flex-col outline-none">
                    {/* Header */}
                    <div className="relative flex flex-col border-b border-slate-100 px-6 pt-6 pb-4">
                        <Heading slot="title" className="text-xl font-bold text-slate-900">
                            {initialData ? UI_TEXT.courseFormModal.editTitle : UI_TEXT.courseFormModal.createTitle}
                        </Heading>
                        <p className="mt-1 text-xs text-slate-500">
                            {initialData ? UI_TEXT.coursesPage.editCourseSubtitle : UI_TEXT.coursesPage.createCourseSubtitle}
                        </p>
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="absolute top-5 right-5 cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            aria-label="Close"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} noValidate className="flex flex-col">
                        <div className="flex max-h-[75vh] flex-col gap-5 overflow-y-auto p-6">
                            {/* General info */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <Input
                                    label={
                                        <span>
                                            {UI_TEXT.courseFormModal.codeLabel} <span className="font-bold text-red-500">{"*"}</span>
                                        </span>
                                    }
                                    placeholder={UI_TEXT.courseFormModal.codePlaceholder}
                                    value={code}
                                    onChange={(val) => setCode(val)}
                                    isInvalid={submitted && !code.trim()}
                                    hint={submitted && !code.trim() ? UI_TEXT.courseFormModal.toastRequiredError : undefined}
                                />
                                <Input
                                    label={
                                        <span>
                                            {UI_TEXT.courseFormModal.titleLabel} <span className="font-bold text-red-500">{"*"}</span>
                                        </span>
                                    }
                                    placeholder={UI_TEXT.courseFormModal.titlePlaceholder}
                                    value={title}
                                    onChange={(val) => setTitle(val)}
                                    isInvalid={submitted && !title.trim()}
                                    hint={submitted && !title.trim() ? UI_TEXT.courseFormModal.toastRequiredError : undefined}
                                />
                                <Input
                                    type="number"
                                    label={
                                        <span>
                                            {UI_TEXT.courseFormModal.totalSessionsLabel} <span className="font-bold text-red-500">{"*"}</span>
                                        </span>
                                    }
                                    placeholder={UI_TEXT.courseFormModal.totalSessionsPlaceholder}
                                    value={totalSessions === "" ? "" : String(totalSessions)}
                                    onChange={(val) => setTotalSessions(val === "" ? "" : Math.max(0, Number(val)))}
                                    isInvalid={submitted && (totalSessions === "" || Number(totalSessions) <= 0)}
                                    hint={
                                        submitted && (totalSessions === "" || Number(totalSessions) <= 0)
                                            ? UI_TEXT.courseFormModal.toastRequiredError
                                            : undefined
                                    }
                                />
                            </div>

                            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4">
                                <span className="text-xs font-extrabold tracking-wider text-slate-700 uppercase">
                                    {UI_TEXT.courseFormModal.courseFormRoadmapSectionTitle}
                                </span>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <Select
                                        label={UI_TEXT.courseFormModal.courseFormCategoryLabel}
                                        placeholder={UI_TEXT.courseFormModal.courseFormCategoryPlaceholder}
                                        items={categoryItems}
                                        selectedKey={categoryId ?? noCategoryKey}
                                        isClearable={false}
                                        onSelectionChange={handleCategoryChange}
                                    >
                                        {(item) => <Select.Item id={item.id} label={item.label} />}
                                    </Select>
                                    <MultiComboBox
                                        label={UI_TEXT.courseFormModal.courseFormTagsLabel}
                                        placeholder={UI_TEXT.courseFormModal.courseFormTagsPlaceholder}
                                        items={careerTagItems}
                                        selectedKeys={careerTagIds}
                                        onSelectionChange={setCareerTagIds}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-secondary">{UI_TEXT.courseFormModal.descLabel}</label>
                                <textarea
                                    rows={2}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={UI_TEXT.courseFormModal.descPlaceholder}
                                    className="w-full resize-none rounded-2xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-wine focus:ring-1 focus:ring-wine"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-secondary">{UI_TEXT.courseFormModal.learningOutcomesLabel}</label>
                                <textarea
                                    rows={3}
                                    value={learningOutcomes}
                                    onChange={(e) => setLearningOutcomes(e.target.value)}
                                    placeholder={UI_TEXT.courseFormModal.learningOutcomesPlaceholder}
                                    className="w-full resize-none rounded-2xl border border-line bg-white px-4 py-2.5 font-mono text-sm text-ink outline-none focus:border-wine focus:ring-1 focus:ring-wine"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-secondary">{UI_TEXT.courseFormModal.accessModeLabel}</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setAccessMode(AccessModeEnum.SEQUENTIAL)}
                                        className={`flex cursor-pointer flex-col rounded-xl border p-3 text-left transition-all ${
                                            accessMode === AccessModeEnum.SEQUENTIAL
                                                ? "border-wine bg-wine/5 font-bold text-wine"
                                                : "border-line bg-white text-ink"
                                        }`}
                                    >
                                        <span className="text-xs">{UI_TEXT.courseFormModal.accessModeSequentialBtn}</span>
                                        <span className="mt-0.5 text-[11px] font-normal text-muted">{UI_TEXT.coursesPage.sequentialModeHelpText}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAccessMode(AccessModeEnum.OPEN)}
                                        className={`flex cursor-pointer flex-col rounded-xl border p-3 text-left transition-all ${
                                            accessMode === AccessModeEnum.OPEN ? "border-wine bg-wine/5 font-bold text-wine" : "border-line bg-white text-ink"
                                        }`}
                                    >
                                        <span className="text-xs">{UI_TEXT.courseFormModal.accessModeOpenBtn}</span>
                                        <span className="mt-0.5 text-[11px] font-normal text-muted">{UI_TEXT.coursesPage.openModeHelpText}</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 border-b border-line pb-2">
                                <span className="text-sm font-bold text-wine">{UI_TEXT.courseFormModal.gradingTab}</span>
                            </div>

                            <div className="flex flex-col gap-5">
                                {/* Card 1: Hình thức thi cuối kỳ */}
                                <div className="flex flex-col gap-2 rounded-2xl bg-white shadow-xs">
                                    <h4 className="text-sm font-bold text-slate-800">{UI_TEXT.courseFormModal.finalExamTypeLabel}</h4>
                                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                                        <button
                                            type="button"
                                            onClick={() => setFinalExamType(FinalExamTypeEnum.PROJECT)}
                                            className={`flex cursor-pointer flex-col gap-1.5 rounded-xl border p-4 text-left transition-all duration-200 ${
                                                finalExamType === FinalExamTypeEnum.PROJECT
                                                    ? "border-2 border-wine bg-wine/5 shadow-xs ring-1 ring-wine/20"
                                                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-slate-900">{UI_TEXT.courseFormModal.finalExamTypeProject}</span>
                                                <span
                                                    className={`flex size-4 items-center justify-center rounded-full border ${finalExamType === FinalExamTypeEnum.PROJECT ? "border-wine bg-wine text-white" : "border-slate-300"}`}
                                                >
                                                    {finalExamType === FinalExamTypeEnum.PROJECT && <span className="size-1.5 rounded-full bg-white" />}
                                                </span>
                                            </div>
                                            <span className="text-xs font-medium text-slate-500">{UI_TEXT.courseFormModal.projectConfigTitle}</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setFinalExamType(FinalExamTypeEnum.ESSAY)}
                                            className={`flex cursor-pointer flex-col gap-1.5 rounded-xl border p-4 text-left transition-all duration-200 ${
                                                finalExamType === FinalExamTypeEnum.ESSAY
                                                    ? "border-2 border-wine bg-wine/5 shadow-xs ring-1 ring-wine/20"
                                                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-slate-900">{UI_TEXT.courseFormModal.finalExamTypeEssay}</span>
                                                <span
                                                    className={`flex size-4 items-center justify-center rounded-full border ${finalExamType === FinalExamTypeEnum.ESSAY ? "border-wine bg-wine text-white" : "border-slate-300"}`}
                                                >
                                                    {finalExamType === FinalExamTypeEnum.ESSAY && <span className="size-1.5 rounded-full bg-white" />}
                                                </span>
                                            </div>
                                            <span className="text-xs font-medium text-slate-500">{UI_TEXT.courseFormModal.essayConfigTitle}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Card 2: Cấu hình bài thi cuối kỳ – PROJECT / ESSAY */}
                                {finalExamType === FinalExamTypeEnum.PROJECT ? (
                                    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition duration-200 hover:shadow-md">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                            <h4 className="text-sm font-bold text-slate-800">{UI_TEXT.courseFormModal.projectConfigTitle}</h4>
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                                                    projectTotal === FULL_WEIGHT_PERCENT
                                                        ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                                                        : "border border-rose-200 bg-rose-50 text-rose-700"
                                                }`}
                                            >
                                                {UI_TEXT.courseFormModal.sumLabel} {projectTotal}
                                                {"%"}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                            <div className="flex flex-col gap-1">
                                                <div
                                                    className={`flex items-center justify-between rounded-xl border px-4 py-2.5 transition-all ${
                                                        isInvalidWeight(projectProductWeight)
                                                            ? "border-rose-400 bg-rose-50/30"
                                                            : "border-slate-100 bg-slate-50/70"
                                                    }`}
                                                >
                                                    <span className="text-xs font-semibold text-slate-700">
                                                        {UI_TEXT.courseFormModal.projectProductWeightLabel}
                                                    </span>
                                                    <div className="flex items-center gap-1.5">
                                                        <input
                                                            type="number"
                                                            value={projectProductWeight}
                                                            onChange={(e) => setProjectProductWeight(Number(e.target.value))}
                                                            className={`w-16 rounded-lg border px-2 py-1 text-center text-sm font-bold shadow-2xs transition-all outline-none ${
                                                                isInvalidWeight(projectProductWeight)
                                                                    ? "border-rose-500 bg-white text-rose-900 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20"
                                                                    : "border-slate-200 bg-white text-slate-800 focus:border-wine focus:ring-2 focus:ring-wine/20"
                                                            }`}
                                                        />
                                                        <span className="text-xs font-bold text-slate-400">{"%"}</span>
                                                    </div>
                                                </div>
                                                {isInvalidWeight(projectProductWeight) && (
                                                    <span className="pl-1 text-[11px] font-medium text-rose-500">
                                                        {UI_TEXT.courseFormModal.weightRangeError}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                <div
                                                    className={`flex items-center justify-between rounded-xl border px-4 py-2.5 transition-all ${
                                                        isInvalidWeight(projectKnowledgeWeight)
                                                            ? "border-rose-400 bg-rose-50/30"
                                                            : "border-slate-100 bg-slate-50/70"
                                                    }`}
                                                >
                                                    <span className="text-xs font-semibold text-slate-700">
                                                        {UI_TEXT.courseFormModal.projectKnowledgeWeightLabel}
                                                    </span>
                                                    <div className="flex items-center gap-1.5">
                                                        <input
                                                            type="number"
                                                            value={projectKnowledgeWeight}
                                                            onChange={(e) => setProjectKnowledgeWeight(Number(e.target.value))}
                                                            className={`w-16 rounded-lg border px-2 py-1 text-center text-sm font-bold shadow-2xs transition-all outline-none ${
                                                                isInvalidWeight(projectKnowledgeWeight)
                                                                    ? "border-rose-500 bg-white text-rose-900 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20"
                                                                    : "border-slate-200 bg-white text-slate-800 focus:border-wine focus:ring-2 focus:ring-wine/20"
                                                            }`}
                                                        />
                                                        <span className="text-xs font-bold text-slate-400">{"%"}</span>
                                                    </div>
                                                </div>
                                                {isInvalidWeight(projectKnowledgeWeight) && (
                                                    <span className="pl-1 text-[11px] font-medium text-rose-500">
                                                        {UI_TEXT.courseFormModal.weightRangeError}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                <div
                                                    className={`flex items-center justify-between rounded-xl border px-4 py-2.5 transition-all ${
                                                        isInvalidWeight(projectInterviewWeight)
                                                            ? "border-rose-400 bg-rose-50/30"
                                                            : "border-slate-100 bg-slate-50/70"
                                                    }`}
                                                >
                                                    <span className="text-xs font-semibold text-slate-700">
                                                        {UI_TEXT.courseFormModal.projectInterviewWeightLabel}
                                                    </span>
                                                    <div className="flex items-center gap-1.5">
                                                        <input
                                                            type="number"
                                                            value={projectInterviewWeight}
                                                            onChange={(e) => setProjectInterviewWeight(Number(e.target.value))}
                                                            className={`w-16 rounded-lg border px-2 py-1 text-center text-sm font-bold shadow-2xs transition-all outline-none ${
                                                                isInvalidWeight(projectInterviewWeight)
                                                                    ? "border-rose-500 bg-white text-rose-900 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20"
                                                                    : "border-slate-200 bg-white text-slate-800 focus:border-wine focus:ring-2 focus:ring-wine/20"
                                                            }`}
                                                        />
                                                        <span className="text-xs font-bold text-slate-400">{"%"}</span>
                                                    </div>
                                                </div>
                                                {isInvalidWeight(projectInterviewWeight) && (
                                                    <span className="pl-1 text-[11px] font-medium text-rose-500">
                                                        {UI_TEXT.courseFormModal.weightRangeError}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition duration-200 hover:shadow-md">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                            <h4 className="text-sm font-bold text-slate-800">{UI_TEXT.courseFormModal.essayConfigTitle}</h4>
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                                                    essayTotal === FULL_WEIGHT_PERCENT
                                                        ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                                                        : "border border-rose-200 bg-rose-50 text-rose-700"
                                                }`}
                                            >
                                                {UI_TEXT.courseFormModal.sumLabel} {essayTotal}
                                                {"%"}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <div className="flex flex-col gap-1">
                                                <div
                                                    className={`flex items-center justify-between rounded-xl border px-4 py-2.5 transition-all ${
                                                        isInvalidWeight(essayEssayWeight) ? "border-rose-400 bg-rose-50/30" : "border-slate-100 bg-slate-50/70"
                                                    }`}
                                                >
                                                    <span className="text-xs font-semibold text-slate-700">
                                                        {UI_TEXT.courseFormModal.essayEssayWeightLabel}
                                                    </span>
                                                    <div className="flex items-center gap-1.5">
                                                        <input
                                                            type="number"
                                                            value={essayEssayWeight}
                                                            onChange={(e) => setEssayEssayWeight(Number(e.target.value))}
                                                            className={`w-16 rounded-lg border px-2 py-1 text-center text-sm font-bold shadow-2xs transition-all outline-none ${
                                                                isInvalidWeight(essayEssayWeight)
                                                                    ? "border-rose-500 bg-white text-rose-900 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20"
                                                                    : "border-slate-200 bg-white text-slate-800 focus:border-wine focus:ring-2 focus:ring-wine/20"
                                                            }`}
                                                        />
                                                        <span className="text-xs font-bold text-slate-400">{"%"}</span>
                                                    </div>
                                                </div>
                                                {isInvalidWeight(essayEssayWeight) && (
                                                    <span className="pl-1 text-[11px] font-medium text-rose-500">
                                                        {UI_TEXT.courseFormModal.weightRangeError}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                <div
                                                    className={`flex items-center justify-between rounded-xl border px-4 py-2.5 transition-all ${
                                                        isInvalidWeight(essayQuizWeight) ? "border-rose-400 bg-rose-50/30" : "border-slate-100 bg-slate-50/70"
                                                    }`}
                                                >
                                                    <span className="text-xs font-semibold text-slate-700">{UI_TEXT.courseFormModal.essayQuizWeightLabel}</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <input
                                                            type="number"
                                                            value={essayQuizWeight}
                                                            onChange={(e) => setEssayQuizWeight(Number(e.target.value))}
                                                            className={`w-16 rounded-lg border px-2 py-1 text-center text-sm font-bold shadow-2xs transition-all outline-none ${
                                                                isInvalidWeight(essayQuizWeight)
                                                                    ? "border-rose-500 bg-white text-rose-900 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20"
                                                                    : "border-slate-200 bg-white text-slate-800 focus:border-wine focus:ring-2 focus:ring-wine/20"
                                                            }`}
                                                        />
                                                        <span className="text-xs font-bold text-slate-400">{"%"}</span>
                                                    </div>
                                                </div>
                                                {isInvalidWeight(essayQuizWeight) && (
                                                    <span className="pl-1 text-[11px] font-medium text-rose-500">
                                                        {UI_TEXT.courseFormModal.weightRangeError}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Custom Formula Accordion */}
                                <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50">
                                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/60 bg-slate-100/60 p-4">
                                        <div className="flex items-center gap-2">
                                            <Calculator className="size-4 text-wine" />
                                            <div>
                                                <h4 className="text-xs font-extrabold tracking-wider text-slate-900 uppercase">
                                                    {UI_TEXT.courseFormModal.overallTotalLabel}
                                                </h4>
                                                <p className="mt-0.5 text-[11px] font-medium text-slate-500">{UI_TEXT.courseFormModal.overallTotalHint}</p>
                                            </div>
                                        </div>
                                        <span
                                            className={`rounded-full px-3.5 py-1 text-xs font-extrabold shadow-2xs transition-all ${
                                                generalTotal === FULL_WEIGHT_PERCENT
                                                    ? "border border-emerald-300 bg-emerald-500 text-white"
                                                    : "animate-pulse border border-rose-300 bg-rose-500 text-white"
                                            }`}
                                        >
                                            {UI_TEXT.courseFormModal.sumLabel} {generalTotal}
                                            {"%"}
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-4 p-4 sm:p-5">
                                        {/* Visual breakdown progress bar */}
                                        <div className="flex flex-col gap-2 rounded-xl p-3.5">
                                            <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 shadow-inner">
                                                <div
                                                    style={{ width: `${Math.min(FULL_WEIGHT_PERCENT, Math.max(0, attendanceWeight))}%` }}
                                                    className="h-full rounded-l-full bg-blue-500 transition-all duration-300"
                                                    title={`Chuyên cần: ${attendanceWeight}%`}
                                                />
                                                <div
                                                    style={{ width: `${Math.min(FULL_WEIGHT_PERCENT, Math.max(0, quizWeight))}%` }}
                                                    className="h-full bg-amber-500 transition-all duration-300"
                                                    title={`Kiểm tra đầu giờ: ${quizWeight}%`}
                                                />
                                                <div
                                                    style={{ width: `${Math.min(FULL_WEIGHT_PERCENT, Math.max(0, hackathonWeight))}%` }}
                                                    className="h-full bg-emerald-500 transition-all duration-300"
                                                    title={`Hackathon: ${hackathonWeight}% (${hackathonQuizWeight}% TN + ${hackathonEssayWeight}% TL)`}
                                                />
                                                <div
                                                    style={{ width: `${Math.min(FULL_WEIGHT_PERCENT, Math.max(0, examWeight))}%` }}
                                                    className="h-full rounded-r-full bg-wine transition-all duration-300"
                                                    title={`Thi cuối kỳ: ${examWeight}% (${finalExamType}: ${finalExamType === FinalExamTypeEnum.PROJECT ? `${projectProductWeight}% SP + ${projectKnowledgeWeight}% KT + ${projectInterviewWeight}% PV` : `${essayEssayWeight}% TL + ${essayQuizWeight}% TN`})`}
                                                />
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5 text-[11px] font-medium text-slate-600">
                                                <span className="flex items-center gap-1.5">
                                                    <span className="size-2.5 shrink-0 rounded-full bg-blue-500 shadow-2xs" />{" "}
                                                    {UI_TEXT.courseFormModal.attendanceWeightLabel}
                                                    {":"}{" "}
                                                    <strong className="font-bold text-slate-900">
                                                        {attendanceWeight}
                                                        {"%"}
                                                    </strong>
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <span className="size-2.5 shrink-0 rounded-full bg-amber-500 shadow-2xs" />{" "}
                                                    {UI_TEXT.courseFormModal.quizWeightLabel}
                                                    {":"}{" "}
                                                    <strong className="font-bold text-slate-900">
                                                        {quizWeight}
                                                        {"%"}
                                                    </strong>
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <span className="size-2.5 shrink-0 rounded-full bg-emerald-500 shadow-2xs" />{" "}
                                                    {UI_TEXT.courseFormModal.hackathonWeightLabel}
                                                    {":"}{" "}
                                                    <strong className="font-bold text-slate-900">
                                                        {hackathonWeight}
                                                        {"%"}
                                                    </strong>
                                                    <span className="text-slate-500">
                                                        {UI_TEXT.courseFormModal.hackathonSummaryText
                                                            .replace("{quiz}", String(hackathonQuizWeight))
                                                            .replace("{essay}", String(hackathonEssayWeight))}
                                                    </span>
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <span className="size-2.5 shrink-0 rounded-full bg-wine shadow-2xs" />{" "}
                                                    {UI_TEXT.courseFormModal.examWeightLabel}
                                                    {":"}{" "}
                                                    <strong className="font-bold text-slate-900">
                                                        {examWeight}
                                                        {"%"}
                                                    </strong>
                                                    <span className="text-slate-500">
                                                        {finalExamType === FinalExamTypeEnum.PROJECT
                                                            ? UI_TEXT.courseFormModal.projectSummaryText
                                                                  .replace("{product}", String(projectProductWeight))
                                                                  .replace("{knowledge}", String(projectKnowledgeWeight))
                                                                  .replace("{interview}", String(projectInterviewWeight))
                                                            : UI_TEXT.courseFormModal.essaySummaryText
                                                                  .replace("{essay}", String(essayEssayWeight))
                                                                  .replace("{quiz}", String(essayQuizWeight))}
                                                    </span>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <div className="flex flex-col gap-1">
                                                <div
                                                    className={`flex items-center justify-between rounded-xl border p-3 shadow-xs transition-all ${
                                                        isInvalidWeight(attendanceWeight)
                                                            ? "border-rose-400 bg-rose-50/30"
                                                            : "border-slate-200/80 bg-white hover:border-wine/30"
                                                    }`}
                                                >
                                                    <span className="text-xs font-bold text-slate-800">{UI_TEXT.courseFormModal.attendanceWeightLabel}</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <input
                                                            type="number"
                                                            value={attendanceWeight}
                                                            onChange={(e) => setAttendanceWeight(Number(e.target.value))}
                                                            className={`w-20 rounded-lg border px-2.5 py-1 text-center text-sm font-extrabold shadow-2xs transition-all outline-none ${
                                                                isInvalidWeight(attendanceWeight)
                                                                    ? "border-rose-500 bg-white text-rose-900 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20"
                                                                    : "border-slate-200 bg-slate-50 text-slate-900 focus:border-wine focus:bg-white focus:ring-2 focus:ring-wine/20"
                                                            }`}
                                                        />
                                                        <span className="text-xs font-bold text-slate-400">{"%"}</span>
                                                    </div>
                                                </div>
                                                {isInvalidWeight(attendanceWeight) && (
                                                    <span className="pl-1 text-[11px] font-medium text-rose-500">
                                                        {UI_TEXT.courseFormModal.weightRangeError}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                <div
                                                    className={`flex items-center justify-between rounded-xl border p-3 shadow-xs transition-all ${
                                                        isInvalidWeight(quizWeight)
                                                            ? "border-rose-400 bg-rose-50/30"
                                                            : "border-slate-200/80 bg-white hover:border-wine/30"
                                                    }`}
                                                >
                                                    <span className="text-xs font-bold text-slate-800">{UI_TEXT.courseFormModal.quizWeightLabel}</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <input
                                                            type="number"
                                                            value={quizWeight}
                                                            onChange={(e) => setQuizWeight(Number(e.target.value))}
                                                            className={`w-20 rounded-lg border px-2.5 py-1 text-center text-sm font-extrabold shadow-2xs transition-all outline-none ${
                                                                isInvalidWeight(quizWeight)
                                                                    ? "border-rose-500 bg-white text-rose-900 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20"
                                                                    : "border-slate-200 bg-slate-50 text-slate-900 focus:border-wine focus:bg-white focus:ring-2 focus:ring-wine/20"
                                                            }`}
                                                        />
                                                        <span className="text-xs font-bold text-slate-400">{"%"}</span>
                                                    </div>
                                                </div>
                                                {isInvalidWeight(quizWeight) && (
                                                    <span className="pl-1 text-[11px] font-medium text-rose-500">
                                                        {UI_TEXT.courseFormModal.weightRangeError}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Hackathon Box - WITH EMBEDDED HACKATHON DETAILS */}
                                            <div className="col-span-1 flex flex-col gap-1 sm:col-span-2">
                                                <div
                                                    className={`flex flex-col gap-2.5 rounded-xl border p-3.5 shadow-xs transition-all ${
                                                        isInvalidWeight(hackathonWeight) ? "border-rose-400 bg-rose-50/30" : "border-slate-200/80 bg-white"
                                                    }`}
                                                >
                                                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/60 pb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-slate-900">
                                                                {UI_TEXT.courseFormModal.hackathonWeightLabel}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <input
                                                                type="number"
                                                                value={hackathonWeight}
                                                                onChange={(e) => setHackathonWeight(Number(e.target.value))}
                                                                className={`w-20 rounded-lg border px-2.5 py-1 text-center text-sm font-extrabold shadow-2xs transition-all outline-none ${
                                                                    isInvalidWeight(hackathonWeight)
                                                                        ? "border-rose-500 bg-white text-rose-900 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20"
                                                                        : "border-slate-200 bg-white text-slate-900 focus:border-wine focus:ring-2 focus:ring-wine/20"
                                                                }`}
                                                            />
                                                            <span className="text-xs font-bold text-slate-500">{"%"}</span>
                                                        </div>
                                                    </div>

                                                    {/* Chi tiết tỷ trọng trong bài thi Hackathon */}
                                                    <div className="flex flex-col gap-1.5 pt-0.5">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[11px] font-bold tracking-wider text-emerald-900 uppercase">
                                                                {UI_TEXT.courseFormModal.hackathonConfigTitle}
                                                            </span>
                                                            <span
                                                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold transition-colors ${
                                                                    hackathonTotal === FULL_WEIGHT_PERCENT
                                                                        ? "border border-emerald-300 bg-emerald-100 text-emerald-800"
                                                                        : "animate-pulse border border-rose-300 bg-rose-100 text-rose-800"
                                                                }`}
                                                            >
                                                                {UI_TEXT.courseFormModal.sumLabel} {hackathonTotal}
                                                                {"%"}
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                                                            <div className="flex flex-col gap-1">
                                                                <div
                                                                    className={`flex items-center justify-between rounded-lg border px-3 py-2 shadow-2xs ${
                                                                        isInvalidWeight(hackathonQuizWeight)
                                                                            ? "border-rose-400 bg-rose-50/30"
                                                                            : "border-emerald-200/60 bg-white"
                                                                    }`}
                                                                >
                                                                    <span className="text-xs font-semibold text-slate-700">
                                                                        {UI_TEXT.courseFormModal.hackathonQuizWeightLabel}
                                                                    </span>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <input
                                                                            type="number"
                                                                            value={hackathonQuizWeight}
                                                                            onChange={(e) => setHackathonQuizWeight(Number(e.target.value))}
                                                                            className={`w-16 rounded-md border px-2 py-0.5 text-center text-xs font-extrabold transition-all outline-none ${
                                                                                isInvalidWeight(hackathonQuizWeight)
                                                                                    ? "border-rose-500 bg-white text-rose-900 focus:border-rose-600"
                                                                                    : "border-slate-200 bg-slate-50 text-slate-900 focus:border-wine focus:bg-white"
                                                                            }`}
                                                                        />
                                                                        <span className="text-xs font-bold text-slate-400">{"%"}</span>
                                                                    </div>
                                                                </div>
                                                                {isInvalidWeight(hackathonQuizWeight) && (
                                                                    <span className="pl-1 text-[11px] font-medium text-rose-500">
                                                                        {UI_TEXT.courseFormModal.weightRangeError}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="flex flex-col gap-1">
                                                                <div
                                                                    className={`flex items-center justify-between rounded-lg border px-3 py-2 shadow-2xs ${
                                                                        isInvalidWeight(hackathonEssayWeight)
                                                                            ? "border-rose-400 bg-rose-50/30"
                                                                            : "border-emerald-200/60 bg-white"
                                                                    }`}
                                                                >
                                                                    <span className="text-xs font-semibold text-slate-700">
                                                                        {UI_TEXT.courseFormModal.hackathonEssayWeightLabel}
                                                                    </span>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <input
                                                                            type="number"
                                                                            value={hackathonEssayWeight}
                                                                            onChange={(e) => setHackathonEssayWeight(Number(e.target.value))}
                                                                            className={`w-16 rounded-md border px-2 py-0.5 text-center text-xs font-extrabold transition-all outline-none ${
                                                                                isInvalidWeight(hackathonEssayWeight)
                                                                                    ? "border-rose-500 bg-white text-rose-900 focus:border-rose-600"
                                                                                    : "border-slate-200 bg-slate-50 text-slate-900 focus:border-wine focus:bg-white"
                                                                            }`}
                                                                        />
                                                                        <span className="text-xs font-bold text-slate-400">{"%"}</span>
                                                                    </div>
                                                                </div>
                                                                {isInvalidWeight(hackathonEssayWeight) && (
                                                                    <span className="pl-1 text-[11px] font-medium text-rose-500">
                                                                        {UI_TEXT.courseFormModal.weightRangeError}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                {isInvalidWeight(hackathonWeight) && (
                                                    <span className="pl-1 text-[11px] font-medium text-rose-500">
                                                        {UI_TEXT.courseFormModal.weightRangeError}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                <div
                                                    className={`flex items-center justify-between rounded-xl border p-3 shadow-xs transition-all ${
                                                        isInvalidWeight(examWeight)
                                                            ? "border-rose-400 bg-rose-50/30"
                                                            : "border-slate-200/80 bg-white hover:border-wine/30"
                                                    }`}
                                                >
                                                    <span className="text-xs font-bold text-slate-800">{UI_TEXT.courseFormModal.examWeightLabel}</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <input
                                                            type="number"
                                                            value={examWeight}
                                                            onChange={(e) => setExamWeight(Number(e.target.value))}
                                                            className={`w-20 rounded-lg border px-2.5 py-1 text-center text-sm font-extrabold shadow-2xs transition-all outline-none ${
                                                                isInvalidWeight(examWeight)
                                                                    ? "border-rose-500 bg-white text-rose-900 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/20"
                                                                    : "border-slate-200 bg-slate-50 text-slate-900 focus:border-wine focus:bg-white focus:ring-2 focus:ring-wine/20"
                                                            }`}
                                                        />
                                                        <span className="text-xs font-bold text-slate-400">{"%"}</span>
                                                    </div>
                                                </div>
                                                {isInvalidWeight(examWeight) && (
                                                    <span className="pl-1 text-[11px] font-medium text-rose-500">
                                                        {UI_TEXT.courseFormModal.weightRangeError}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex w-full items-center gap-3 rounded-b-[24px] border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                            <Button
                                type="button"
                                color="secondary"
                                onClick={() => onOpenChange(false)}
                                isDisabled={isSubmitting}
                                className="w-1/3 cursor-pointer justify-center rounded-full border-slate-200 px-5 font-semibold text-slate-700 hover:bg-slate-100"
                            >
                                {UI_TEXT.courseFormModal.cancelBtn}
                            </Button>
                            <Button
                                type="submit"
                                color="primary"
                                isLoading={isSubmitting}
                                className="w-2/3 cursor-pointer justify-center rounded-full border-none bg-wine px-6 font-bold text-white shadow-md shadow-wine/10 hover:bg-wine-deep"
                            >
                                {isSubmitting
                                    ? UI_TEXT.courseFormModal.submittingText
                                    : initialData
                                      ? UI_TEXT.courseFormModal.saveBtn
                                      : UI_TEXT.courseFormModal.createBtn}
                            </Button>
                        </div>
                    </form>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
