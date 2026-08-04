/* eslint-disable @typescript-eslint/no-magic-numbers, react/jsx-no-literals */
"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Award, Calculator, Plus, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { addCourseCategory, getCourseCategories } from "@/services/course.service";
import { AccessModeEnum, type CourseFormModalProps, FinalExamTypeEnum } from "@/types/course.types";

export function CourseFormModal({ isOpen, onOpenChange, initialData, onSubmit }: CourseFormModalProps) {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<"rpoint" | "grading">("rpoint");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form fields
    const [code, setCode] = useState("");
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
    const [newCategoryInput, setNewCategoryInput] = useState("");
    const [description, setDescription] = useState("");
    const [learningOutcomes, setLearningOutcomes] = useState("");
    const [accessMode, setAccessMode] = useState<AccessModeEnum>(AccessModeEnum.SEQUENTIAL);

    // Tab 1: Rpoint Config
    const [rPointEnabled, setRPointEnabled] = useState(true);
    const [rPointValue, setRPointValue] = useState(50);
    const [minCompletionRate, setMinCompletionRate] = useState(80);

    // Tab 2: Custom Grading Formula
    const [useCustomFormula, setUseCustomFormula] = useState(true);
    const [attendanceWeight, setAttendanceWeight] = useState(10);
    const [quizWeight, setQuizWeight] = useState(10);
    const [hackathonWeight, setHackathonWeight] = useState(20);
    const [examWeight, setExamWeight] = useState(60);

    const [hackathonQuizWeight, setHackathonQuizWeight] = useState(30);
    const [hackathonEssayWeight, setHackathonEssayWeight] = useState(70);

    const [finalExamType, setFinalExamType] = useState<FinalExamTypeEnum>(FinalExamTypeEnum.PROJECT);
    const [projectProductWeight, setProjectProductWeight] = useState(70);
    const [projectKnowledgeWeight, setProjectKnowledgeWeight] = useState(10);
    const [projectInterviewWeight, setProjectInterviewWeight] = useState(20);

    const [essayEssayWeight, setEssayEssayWeight] = useState(70);
    const [essayQuizWeight, setEssayQuizWeight] = useState(30);

    const [passScore, setPassScore] = useState(5.0);

    // Fetch dynamic categories list
    const { data: categories = [] } = useQuery({
        queryKey: ["course-categories"],
        queryFn: getCourseCategories,
        enabled: isOpen,
    });

    const addCategoryMutation = useMutation({
        mutationFn: addCourseCategory,
        onSuccess: (addedName) => {
            queryClient.invalidateQueries({ queryKey: ["course-categories"] });
            setCategory(addedName);
            setIsAddingNewCategory(false);
            setNewCategoryInput("");
        },
    });

    useEffect(() => {
        if (initialData) {
            setCode(initialData.code);
            setTitle(initialData.title);
            setCategory(initialData.category || "");
            setDescription(initialData.description || "");
            setLearningOutcomes(initialData.learningOutcomes || "");
            setAccessMode(initialData.accessMode ? (initialData.accessMode as AccessModeEnum) : AccessModeEnum.SEQUENTIAL);
            setRPointEnabled(initialData.rPointConfig.enabled);
            setRPointValue(initialData.rPointConfig.rPointValue);
            setMinCompletionRate(initialData.rPointConfig.minCompletionRate);

            setUseCustomFormula(initialData.gradingFormula.useCustomFormula ?? true);
            setAttendanceWeight(initialData.gradingFormula.attendanceWeight ?? 10);
            setQuizWeight(initialData.gradingFormula.quizWeight ?? 10);
            setHackathonWeight(initialData.gradingFormula.hackathonWeight ?? 20);
            setExamWeight(initialData.gradingFormula.examWeight ?? 60);
            setHackathonQuizWeight(initialData.gradingFormula.hackathonQuizWeight ?? 30);
            setHackathonEssayWeight(initialData.gradingFormula.hackathonEssayWeight ?? 70);
            setFinalExamType(
                initialData.gradingFormula.finalExamType ? (initialData.gradingFormula.finalExamType as FinalExamTypeEnum) : FinalExamTypeEnum.PROJECT,
            );
            setProjectProductWeight(initialData.gradingFormula.projectProductWeight ?? 70);
            setProjectKnowledgeWeight(initialData.gradingFormula.projectKnowledgeWeight ?? 10);
            setProjectInterviewWeight(initialData.gradingFormula.projectInterviewWeight ?? 20);
            setEssayEssayWeight(initialData.gradingFormula.essayEssayWeight ?? 70);
            setEssayQuizWeight(initialData.gradingFormula.essayQuizWeight ?? 30);
            setPassScore(initialData.gradingFormula.passScore ?? 5.0);
        } else {
            setCode("");
            setTitle("");
            setCategory(categories[0] || "");
            setDescription("");
            setLearningOutcomes("");
            setAccessMode(AccessModeEnum.SEQUENTIAL);
            setRPointEnabled(true);
            setRPointValue(50);
            setMinCompletionRate(80);

            setUseCustomFormula(true);
            setAttendanceWeight(10);
            setQuizWeight(10);
            setHackathonWeight(20);
            setExamWeight(60);
            setHackathonQuizWeight(30);
            setHackathonEssayWeight(70);
            setFinalExamType(FinalExamTypeEnum.PROJECT);
            setProjectProductWeight(70);
            setProjectKnowledgeWeight(10);
            setProjectInterviewWeight(20);
            setEssayEssayWeight(70);
            setEssayQuizWeight(30);
            setPassScore(5.0);
        }
        setIsAddingNewCategory(false);
        setNewCategoryInput("");
        setActiveTab("rpoint");
    }, [initialData, isOpen, categories]);

    const generalTotal = Number(attendanceWeight) + Number(quizWeight) + Number(hackathonWeight) + Number(examWeight);
    const hackathonTotal = Number(hackathonQuizWeight) + Number(hackathonEssayWeight);
    const projectTotal = Number(projectProductWeight) + Number(projectKnowledgeWeight) + Number(projectInterviewWeight);
    const essayTotal = Number(essayEssayWeight) + Number(essayQuizWeight);

    const handleSaveNewCategory = async () => {
        if (!newCategoryInput.trim()) return;
        await addCategoryMutation.mutateAsync(newCategoryInput.trim());
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const selectedCategory = isAddingNewCategory ? newCategoryInput.trim() : category.trim();

        if (!title.trim() || !code.trim() || !selectedCategory) return;

        if (useCustomFormula) {
            if (generalTotal !== 100 || hackathonTotal !== 100) {
                setActiveTab("grading");
                return;
            }
            if (finalExamType === FinalExamTypeEnum.PROJECT && projectTotal !== 100) {
                setActiveTab("grading");
                return;
            }
            if (finalExamType === FinalExamTypeEnum.ESSAY && essayTotal !== 100) {
                setActiveTab("grading");
                return;
            }
        }

        setIsSubmitting(true);
        try {
            await onSubmit({
                code: code.trim(),
                title: title.trim(),
                category: selectedCategory,
                description: description.trim(),
                learningOutcomes: learningOutcomes.trim(),
                accessMode,
                rPointConfig: {
                    enabled: rPointEnabled,
                    rPointValue: Number(rPointValue),
                    minCompletionRate: Number(minCompletionRate),
                },
                gradingFormula: {
                    useCustomFormula,
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
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <CustomModal.Root open={isOpen} onOpenChange={onOpenChange}>
            <CustomModal.Content className="w-full max-w-4xl overflow-hidden !rounded-[24px]">
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

                    <form onSubmit={handleSubmit} className="flex flex-col">
                        <div className="flex max-h-[75vh] flex-col gap-5 overflow-y-auto p-6">
                            {/* General info */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Input
                                    label={
                                        <span>
                                            {UI_TEXT.courseFormModal.codeLabel} <span className="font-bold text-red-500">*</span>
                                        </span>
                                    }
                                    placeholder={UI_TEXT.courseFormModal.codePlaceholder}
                                    value={code}
                                    onChange={(val) => setCode(val)}
                                />
                                <Input
                                    label={
                                        <span>
                                            {UI_TEXT.courseFormModal.titleLabel} <span className="font-bold text-red-500">*</span>
                                        </span>
                                    }
                                    placeholder={UI_TEXT.courseFormModal.titlePlaceholder}
                                    value={title}
                                    onChange={(val) => setTitle(val)}
                                />
                            </div>

                            {/* Category selection / dynamic addition */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-secondary">
                                    {UI_TEXT.courseFormModal.categoryLabel} <span className="font-bold text-red-500">*</span>
                                </label>
                                {!isAddingNewCategory ? (
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1">
                                            <Select
                                                aria-label={UI_TEXT.courseFormModal.categoryLabel}
                                                selectedKey={category || null}
                                                onSelectionChange={(key) => key && setCategory(String(key))}
                                                items={categories.map((cat) => ({ id: cat, label: cat }))}
                                                size="sm"
                                                placeholder={UI_TEXT.courseFormModal.categoryPlaceholder}
                                                isClearable={false}
                                            >
                                                {(item) => <Select.Item id={item.id} label={item.label} />}
                                            </Select>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingNewCategory(true)}
                                            className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full border border-line px-3.5 py-2.5 text-xs font-bold text-wine transition hover:bg-wine/10"
                                            title={UI_TEXT.courseFormModal.addNewCategoryBtn}
                                        >
                                            <Plus className="size-4" />
                                            <span>{UI_TEXT.coursesPage.addCategoryModalTitle}</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            placeholder={UI_TEXT.courseFormModal.newCategoryPlaceholder}
                                            value={newCategoryInput}
                                            onChange={(val) => setNewCategoryInput(val)}
                                            className="flex-1"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleSaveNewCategory}
                                            disabled={!newCategoryInput.trim() || addCategoryMutation.isPending}
                                            className="shrink-0 cursor-pointer rounded-full bg-wine px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-wine/90 disabled:opacity-50"
                                        >
                                            {addCategoryMutation.isPending
                                                ? UI_TEXT.courseFormModal.addingCategoryText
                                                : UI_TEXT.courseFormModal.saveCategoryBtn}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingNewCategory(false)}
                                            className="shrink-0 cursor-pointer rounded-full border border-line px-4 py-2.5 text-xs font-bold text-muted hover:bg-slate-100"
                                        >
                                            {UI_TEXT.courseFormModal.cancelAddCategoryBtn}
                                        </button>
                                    </div>
                                )}
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

                            {/* Form Tabs */}
                            <div className="flex border-b border-line">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("rpoint")}
                                    className={`flex cursor-pointer items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-bold transition-all ${
                                        activeTab === "rpoint" ? "border-wine text-wine" : "border-transparent text-muted hover:text-ink"
                                    }`}
                                >
                                    <Award className="size-4" />
                                    {UI_TEXT.courseFormModal.rpointTab}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("grading")}
                                    className={`flex cursor-pointer items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-bold transition-all ${
                                        activeTab === "grading" ? "border-wine text-wine" : "border-transparent text-muted hover:text-ink"
                                    }`}
                                >
                                    <Calculator className="size-4" />
                                    {UI_TEXT.courseFormModal.gradingTab}
                                </button>
                            </div>

                            {/* Tab 1: Rpoint Config */}
                            {activeTab === "rpoint" && (
                                <div className="flex flex-col gap-4 rounded-2xl border border-line bg-slate-50/80 p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-ink">{UI_TEXT.courseFormModal.rpointSectionTitle}</p>
                                            <p className="text-xs text-muted">{UI_TEXT.courseFormModal.rpointToggleLabel}</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={rPointEnabled}
                                            onChange={(e) => setRPointEnabled(e.target.checked)}
                                            className="size-5 cursor-pointer rounded accent-wine"
                                        />
                                    </div>

                                    {rPointEnabled && (
                                        <div className="grid grid-cols-1 gap-4 border-t border-line/60 pt-2 sm:grid-cols-2">
                                            <Input
                                                label={UI_TEXT.courseFormModal.rpointValueLabel}
                                                type="number"
                                                min={0}
                                                value={rPointValue.toString()}
                                                onChange={(val) => setRPointValue(Number(val))}
                                            />
                                            <Input
                                                label={UI_TEXT.courseFormModal.minCompletionRateLabel}
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={minCompletionRate.toString()}
                                                onChange={(val) => setMinCompletionRate(Number(val))}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tab 2: Grading Formula */}
                            {activeTab === "grading" && (
                                <div className="flex flex-col gap-5">
                                    {/* Toggle banner */}
                                    <div className="flex flex-col justify-between gap-3 rounded-2xl border border-wine/15 bg-gradient-to-r from-wine/5 via-slate-50 to-indigo-50/30 p-4.5 shadow-xs sm:flex-row sm:items-center">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-bold text-slate-900">{UI_TEXT.courseFormModal.gradingSectionTitle}</h3>
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                                        useCustomFormula ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                                                    }`}
                                                >
                                                    {useCustomFormula ? UI_TEXT.coursesPage.visibleStatusText : UI_TEXT.coursesPage.hiddenStatusText}
                                                </span>
                                            </div>
                                            <p className="mt-0.5 text-xs text-slate-500">{UI_TEXT.courseFormModal.useCustomFormulaLabel}</p>
                                        </div>
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={useCustomFormula}
                                            onClick={() => setUseCustomFormula(!useCustomFormula)}
                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                                useCustomFormula ? "bg-wine" : "bg-slate-300"
                                            }`}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                                    useCustomFormula ? "translate-x-5" : "translate-x-0"
                                                }`}
                                            />
                                        </button>
                                    </div>

                                    {useCustomFormula ? (
                                        <>
                                            {/* Card 1: Trọng số tổng quát */}
                                            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition duration-200 hover:shadow-md">
                                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                                    <h4 className="text-sm font-bold text-slate-800">{UI_TEXT.courseFormModal.weightsOverviewTitle}</h4>
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                                                            generalTotal === 100
                                                                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                                                                : "border border-rose-200 bg-rose-50 text-rose-700"
                                                        }`}
                                                    >
                                                        {UI_TEXT.courseFormModal.sumLabel} {generalTotal}%
                                                    </span>
                                                </div>

                                                {/* Visual breakdown progress bar */}
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                                                        <div
                                                            style={{ width: `${Math.min(100, Math.max(0, attendanceWeight))}%` }}
                                                            className="bg-blue-500 transition-all duration-300"
                                                            title={`Chuyên cần: ${attendanceWeight}%`}
                                                        />
                                                        <div
                                                            style={{ width: `${Math.min(100, Math.max(0, quizWeight))}%` }}
                                                            className="bg-amber-500 transition-all duration-300"
                                                            title={`Kiểm tra đầu giờ: ${quizWeight}%`}
                                                        />
                                                        <div
                                                            style={{ width: `${Math.min(100, Math.max(0, hackathonWeight))}%` }}
                                                            className="bg-emerald-500 transition-all duration-300"
                                                            title={`Hackathon: ${hackathonWeight}% (${hackathonQuizWeight}% TN + ${hackathonEssayWeight}% TL)`}
                                                        />
                                                        <div
                                                            style={{ width: `${Math.min(100, Math.max(0, examWeight))}%` }}
                                                            className="bg-wine transition-all duration-300"
                                                            title={`Thi cuối kỳ: ${examWeight}% (${finalExamType}: ${finalExamType === FinalExamTypeEnum.PROJECT ? `${projectProductWeight}% SP + ${projectKnowledgeWeight}% KT + ${projectInterviewWeight}% PV` : `${essayEssayWeight}% TL + ${essayQuizWeight}% TN`})`}
                                                        />
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] font-medium text-slate-500">
                                                        <span className="flex items-center gap-1.5">
                                                            <span className="size-2 shrink-0 rounded-full bg-blue-500" />{" "}
                                                            {UI_TEXT.courseFormModal.attendanceWeightLabel}:{" "}
                                                            <strong className="text-slate-800">{attendanceWeight}%</strong>
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <span className="size-2 shrink-0 rounded-full bg-amber-500" />{" "}
                                                            {UI_TEXT.courseFormModal.quizWeightLabel}: <strong className="text-slate-800">{quizWeight}%</strong>
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <span className="size-2 shrink-0 rounded-full bg-emerald-500" />{" "}
                                                            {UI_TEXT.courseFormModal.hackathonWeightLabel}:{" "}
                                                            <strong className="text-slate-800">{hackathonWeight}%</strong>
                                                            <span className="text-slate-500">
                                                                {UI_TEXT.courseFormModal.hackathonSummaryText
                                                                    .replace("{quiz}", String(hackathonQuizWeight))
                                                                    .replace("{essay}", String(hackathonEssayWeight))}
                                                            </span>
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <span className="size-2 shrink-0 rounded-full bg-wine" /> {UI_TEXT.courseFormModal.examWeightLabel}:{" "}
                                                            <strong className="text-slate-800">{examWeight}%</strong>
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

                                                <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
                                                    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-2.5">
                                                        <span className="text-xs font-semibold text-slate-700">
                                                            {UI_TEXT.courseFormModal.attendanceWeightLabel}
                                                        </span>
                                                        <div className="flex items-center gap-1.5">
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                max={100}
                                                                value={attendanceWeight}
                                                                onChange={(e) => setAttendanceWeight(Number(e.target.value))}
                                                                className="w-20 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-center text-sm font-bold text-slate-800 shadow-2xs outline-none focus:border-wine focus:ring-2 focus:ring-wine/20"
                                                            />
                                                            <span className="text-xs font-bold text-slate-400">%</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-2.5">
                                                        <span className="text-xs font-semibold text-slate-700">{UI_TEXT.courseFormModal.quizWeightLabel}</span>
                                                        <div className="flex items-center gap-1.5">
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                max={100}
                                                                value={quizWeight}
                                                                onChange={(e) => setQuizWeight(Number(e.target.value))}
                                                                className="w-20 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-center text-sm font-bold text-slate-800 shadow-2xs outline-none focus:border-wine focus:ring-2 focus:ring-wine/20"
                                                            />
                                                            <span className="text-xs font-bold text-slate-400">%</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-2.5">
                                                        <span className="text-xs font-semibold text-slate-700">
                                                            {UI_TEXT.courseFormModal.hackathonWeightLabel}
                                                        </span>
                                                        <div className="flex items-center gap-1.5">
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                max={100}
                                                                value={hackathonWeight}
                                                                onChange={(e) => setHackathonWeight(Number(e.target.value))}
                                                                className="w-20 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-center text-sm font-bold text-slate-800 shadow-2xs outline-none focus:border-wine focus:ring-2 focus:ring-wine/20"
                                                            />
                                                            <span className="text-xs font-bold text-slate-400">%</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-2.5">
                                                        <span className="text-xs font-semibold text-slate-700">{UI_TEXT.courseFormModal.examWeightLabel}</span>
                                                        <div className="flex items-center gap-1.5">
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                max={100}
                                                                value={examWeight}
                                                                onChange={(e) => setExamWeight(Number(e.target.value))}
                                                                className="w-20 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-center text-sm font-bold text-slate-800 shadow-2xs outline-none focus:border-wine focus:ring-2 focus:ring-wine/20"
                                                            />
                                                            <span className="text-xs font-bold text-slate-400">%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Card 2: Cấu hình Hackathon */}
                                            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition duration-200 hover:shadow-md">
                                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                                    <h4 className="text-sm font-bold text-slate-800">{UI_TEXT.courseFormModal.hackathonConfigTitle}</h4>
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                                                            hackathonTotal === 100
                                                                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                                                                : "border border-rose-200 bg-rose-50 text-rose-700"
                                                        }`}
                                                    >
                                                        {UI_TEXT.courseFormModal.sumLabel} {hackathonTotal}%
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-2.5">
                                                        <span className="text-xs font-semibold text-slate-700">
                                                            {UI_TEXT.courseFormModal.hackathonQuizWeightLabel}
                                                        </span>
                                                        <div className="flex items-center gap-1.5">
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                max={100}
                                                                value={hackathonQuizWeight}
                                                                onChange={(e) => setHackathonQuizWeight(Number(e.target.value))}
                                                                className="w-20 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-center text-sm font-bold text-slate-800 shadow-2xs outline-none focus:border-wine focus:ring-2 focus:ring-wine/20"
                                                            />
                                                            <span className="text-xs font-bold text-slate-400">%</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-2.5">
                                                        <span className="text-xs font-semibold text-slate-700">
                                                            {UI_TEXT.courseFormModal.hackathonEssayWeightLabel}
                                                        </span>
                                                        <div className="flex items-center gap-1.5">
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                max={100}
                                                                value={hackathonEssayWeight}
                                                                onChange={(e) => setHackathonEssayWeight(Number(e.target.value))}
                                                                className="w-20 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-center text-sm font-bold text-slate-800 shadow-2xs outline-none focus:border-wine focus:ring-2 focus:ring-wine/20"
                                                            />
                                                            <span className="text-xs font-bold text-slate-400">%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Card 3: Hình thức thi cuối kỳ */}
                                            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
                                                <div className="border-b border-slate-100 pb-3">
                                                    <h4 className="text-sm font-bold text-slate-800">{UI_TEXT.courseFormModal.finalExamTypeLabel}</h4>
                                                    <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                                                        {UI_TEXT.courseFormModal.finalExamTypeLabel}
                                                    </p>
                                                </div>

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
                                                            <span className="text-sm font-bold text-slate-900">
                                                                {UI_TEXT.courseFormModal.finalExamTypeProject}
                                                            </span>
                                                            <span
                                                                className={`flex size-4 items-center justify-center rounded-full border ${finalExamType === FinalExamTypeEnum.PROJECT ? "border-wine bg-wine text-white" : "border-slate-300"}`}
                                                            >
                                                                {finalExamType === FinalExamTypeEnum.PROJECT && (
                                                                    <span className="size-1.5 rounded-full bg-white" />
                                                                )}
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
                                                            <span className="text-sm font-bold text-slate-900">
                                                                {UI_TEXT.courseFormModal.finalExamTypeEssay}
                                                            </span>
                                                            <span
                                                                className={`flex size-4 items-center justify-center rounded-full border ${finalExamType === FinalExamTypeEnum.ESSAY ? "border-wine bg-wine text-white" : "border-slate-300"}`}
                                                            >
                                                                {finalExamType === FinalExamTypeEnum.ESSAY && (
                                                                    <span className="size-1.5 rounded-full bg-white" />
                                                                )}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs font-medium text-slate-500">{UI_TEXT.courseFormModal.essayConfigTitle}</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Card 4: Cấu hình bài thi cuối kỳ – PROJECT / ESSAY */}
                                            {finalExamType === FinalExamTypeEnum.PROJECT ? (
                                                <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition duration-200 hover:shadow-md">
                                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                                        <h4 className="text-sm font-bold text-slate-800">{UI_TEXT.courseFormModal.projectConfigTitle}</h4>
                                                        <span
                                                            className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                                                                projectTotal === 100
                                                                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                                                                    : "border border-rose-200 bg-rose-50 text-rose-700"
                                                            }`}
                                                        >
                                                            {UI_TEXT.courseFormModal.sumLabel} {projectTotal}%
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                                        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-2.5">
                                                            <span className="text-xs font-semibold text-slate-700">
                                                                {UI_TEXT.courseFormModal.projectProductWeightLabel}
                                                            </span>
                                                            <div className="flex items-center gap-1.5">
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    max={100}
                                                                    value={projectProductWeight}
                                                                    onChange={(e) => setProjectProductWeight(Number(e.target.value))}
                                                                    className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-1 text-center text-sm font-bold text-slate-800 shadow-2xs outline-none focus:border-wine focus:ring-2 focus:ring-wine/20"
                                                                />
                                                                <span className="text-xs font-bold text-slate-400">%</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-2.5">
                                                            <span className="text-xs font-semibold text-slate-700">
                                                                {UI_TEXT.courseFormModal.projectKnowledgeWeightLabel}
                                                            </span>
                                                            <div className="flex items-center gap-1.5">
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    max={100}
                                                                    value={projectKnowledgeWeight}
                                                                    onChange={(e) => setProjectKnowledgeWeight(Number(e.target.value))}
                                                                    className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-1 text-center text-sm font-bold text-slate-800 shadow-2xs outline-none focus:border-wine focus:ring-2 focus:ring-wine/20"
                                                                />
                                                                <span className="text-xs font-bold text-slate-400">%</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-2.5">
                                                            <span className="text-xs font-semibold text-slate-700">
                                                                {UI_TEXT.courseFormModal.projectInterviewWeightLabel}
                                                            </span>
                                                            <div className="flex items-center gap-1.5">
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    max={100}
                                                                    value={projectInterviewWeight}
                                                                    onChange={(e) => setProjectInterviewWeight(Number(e.target.value))}
                                                                    className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-1 text-center text-sm font-bold text-slate-800 shadow-2xs outline-none focus:border-wine focus:ring-2 focus:ring-wine/20"
                                                                />
                                                                <span className="text-xs font-bold text-slate-400">%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition duration-200 hover:shadow-md">
                                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                                        <h4 className="text-sm font-bold text-slate-800">{UI_TEXT.courseFormModal.essayConfigTitle}</h4>
                                                        <span
                                                            className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                                                                essayTotal === 100
                                                                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                                                                    : "border border-rose-200 bg-rose-50 text-rose-700"
                                                            }`}
                                                        >
                                                            {UI_TEXT.courseFormModal.sumLabel} {essayTotal}%
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-2.5">
                                                            <span className="text-xs font-semibold text-slate-700">
                                                                {UI_TEXT.courseFormModal.essayEssayWeightLabel}
                                                            </span>
                                                            <div className="flex items-center gap-1.5">
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    max={100}
                                                                    value={essayEssayWeight}
                                                                    onChange={(e) => setEssayEssayWeight(Number(e.target.value))}
                                                                    className="w-20 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-center text-sm font-bold text-slate-800 shadow-2xs outline-none focus:border-wine focus:ring-2 focus:ring-wine/20"
                                                                />
                                                                <span className="text-xs font-bold text-slate-400">%</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-2.5">
                                                            <span className="text-xs font-semibold text-slate-700">
                                                                {UI_TEXT.courseFormModal.essayQuizWeightLabel}
                                                            </span>
                                                            <div className="flex items-center gap-1.5">
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    max={100}
                                                                    value={essayQuizWeight}
                                                                    onChange={(e) => setEssayQuizWeight(Number(e.target.value))}
                                                                    className="w-20 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-center text-sm font-bold text-slate-800 shadow-2xs outline-none focus:border-wine focus:ring-2 focus:ring-wine/20"
                                                                />
                                                                <span className="text-xs font-bold text-slate-400">%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center text-sm text-slate-500">
                                            {UI_TEXT.courseFormModal.useCustomFormulaLabel}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 rounded-b-[24px] border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                            <Button
                                type="button"
                                color="secondary"
                                onClick={() => onOpenChange(false)}
                                isDisabled={isSubmitting}
                                className="cursor-pointer rounded-full border-slate-200 px-5 font-semibold text-slate-700 hover:bg-slate-100"
                            >
                                {UI_TEXT.courseFormModal.cancelBtn}
                            </Button>
                            <Button
                                type="submit"
                                color="primary"
                                isLoading={isSubmitting}
                                className="cursor-pointer rounded-full border-none bg-wine px-6 font-bold text-white shadow-md shadow-wine/10 hover:bg-wine-deep"
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
