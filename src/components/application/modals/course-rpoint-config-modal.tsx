"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Award, Info, RotateCcw, Save, Trash2, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { Input } from "@/components/base/input/input";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { ROUND_FACTOR } from "@/constants/options.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { deleteCourseRpointFormula, getCourseRpointFormula, setCourseRpointFormula } from "@/services/auto-rpoint.service";
import { toast } from "@/services/toast.service";
import type { CourseRpointConfigModalProps, CourseRpointTabType, RpointFormula, RpointTier } from "@/types/rpoint.types";
import { cloneRpointFormula } from "@/utils/rpoint-formula.utils";

export function CourseRpointConfigModal({ isOpen, onOpenChange, courseId, courseTitle }: CourseRpointConfigModalProps) {
    const queryClient = useQueryClient();
    const [formula, setFormula] = useState<RpointFormula | null>(null);
    const [isDefault, setIsDefault] = useState(true);
    const [activeTab, setActiveTab] = useState<CourseRpointTabType>("linear");

    const t = UI_TEXT.courseRpointModal;

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["course-rpoint-formula", courseId],
        queryFn: () => getCourseRpointFormula(courseId),
        enabled: isOpen && !!courseId,
    });

    useEffect(() => {
        if (data?.formula) {
            setFormula(cloneRpointFormula(data.formula));
            setIsDefault(!!data.isDefault);
        }
    }, [data]);

    // Validation logic (Section 1.4)
    const validationErrors = useMemo(() => {
        if (!formula) return [];
        const errors: string[] = [];

        if (formula.attendance.max < 0) errors.push("Điểm tối đa chuyên cần không được âm");
        if (formula.attendance.deductionPerPercent < 0) errors.push("Mức trừ chuyên cần không được âm");
        if (formula.assignment.max < 0) errors.push("Điểm tối đa bài tập không được âm");
        if (formula.assignment.deductionPerPercent < 0) errors.push("Mức trừ bài tập không được âm");

        if (formula.preparation.max < 0) errors.push("Điểm tối đa chuẩn bị không được âm");
        if (formula.compliance.max < 0) errors.push("Điểm tối đa tuân thủ không được âm");
        if (formula.bonus.cap < 0) errors.push("Trần điểm thưởng không được âm");

        // Prep Tiers
        const prepTiers = formula.preparation.tiers || [];
        if (!prepTiers.some((t) => t.minCount === 0)) {
            errors.push("Chuẩn bị / Nộp muộn: Phải có dòng cho số lần = 0 (minCount = 0)");
        }
        const prepCounts = new Set<number>();
        prepTiers.forEach((tier) => {
            if (!Number.isInteger(tier.minCount) || tier.minCount < 0) {
                errors.push(`Chuẩn bị: Số lần (${tier.minCount}) phải là số nguyên không âm`);
            }
            if (prepCounts.has(tier.minCount)) {
                errors.push(`Chuẩn bị: Trùng lặp số lần = ${tier.minCount}`);
            }
            prepCounts.add(tier.minCount);
            if (tier.score < 0 || tier.score > formula.preparation.max) {
                errors.push(`Chuẩn bị (lần ${tier.minCount}): Điểm còn lại (${tier.score}) phải nằm trong [0, ${formula.preparation.max}]`);
            }
        });

        // Compliance Tiers
        const compTiers = formula.compliance.tiers || [];
        if (!compTiers.some((t) => t.minCount === 0)) {
            errors.push("Tuân thủ / Vi phạm: Phải có dòng cho số lần = 0 (minCount = 0)");
        }
        const compCounts = new Set<number>();
        compTiers.forEach((tier) => {
            if (!Number.isInteger(tier.minCount) || tier.minCount < 0) {
                errors.push(`Tuân thủ: Số lần (${tier.minCount}) phải là số nguyên không âm`);
            }
            if (compCounts.has(tier.minCount)) {
                errors.push(`Tuân thủ: Trùng lặp số lần = ${tier.minCount}`);
            }
            compCounts.add(tier.minCount);
            if (tier.score < 0 || tier.score > formula.compliance.max) {
                errors.push(`Tuân thủ (lần ${tier.minCount}): Điểm còn lại (${tier.score}) phải nằm trong [0, ${formula.compliance.max}]`);
            }
        });

        return errors;
    }, [formula]);

    const isValid = validationErrors.length === 0;

    const saveMutation = useMutation({
        mutationFn: () => setCourseRpointFormula(courseId, formula!),
        onSuccess: () => {
            toast.success(t.toastSaveTitle, `${t.toastSaveDesc}. `);
            queryClient.invalidateQueries({ queryKey: ["courses"] });
            queryClient.invalidateQueries({ queryKey: ["course-rpoint-formula", courseId] });
            queryClient.invalidateQueries({ queryKey: ["class-rpoints-map"] });
            queryClient.invalidateQueries({ queryKey: ["course-class-statistics"] });
            queryClient.invalidateQueries({ queryKey: ["student-rpoint-detail"] });
            queryClient.invalidateQueries({ queryKey: ["class-detail"] });
            onOpenChange(false);
        },
        onError: (err: Error) => {
            toast.error(t.toastSaveErrorTitle, err.message || t.toastSaveErrorDesc);
        },
    });

    const resetMutation = useMutation({
        mutationFn: () => deleteCourseRpointFormula(courseId),
        onSuccess: async () => {
            toast.success(t.toastResetTitle, t.toastResetDesc);
            queryClient.invalidateQueries({ queryKey: ["courses"] });
            queryClient.invalidateQueries({ queryKey: ["course-rpoint-formula", courseId] });
            queryClient.invalidateQueries({ queryKey: ["class-rpoints-map"] });
            queryClient.invalidateQueries({ queryKey: ["course-class-statistics"] });
            queryClient.invalidateQueries({ queryKey: ["student-rpoint-detail"] });
            queryClient.invalidateQueries({ queryKey: ["class-detail"] });
            await refetch();
            onOpenChange(false);
        },
        onError: (err: Error) => {
            toast.error(t.toastSaveErrorTitle, err.message || t.toastResetErrorDesc);
        },
    });

    const updateLinear = (key: "attendance" | "assignment", field: "max" | "deductionPerPercent", value: number) => {
        if (!formula) return;
        setFormula({
            ...formula,
            [key]: { ...formula[key], [field]: value },
        });
        setIsDefault(false);
    };

    const updateTierMax = (key: "preparation" | "compliance", max: number) => {
        if (!formula) return;
        setFormula({
            ...formula,
            [key]: { ...formula[key], max },
        });
        setIsDefault(false);
    };

    const updateTierRow = (key: "preparation" | "compliance", index: number, field: "minCount" | "deduction", val: number) => {
        if (!formula) return;
        const currentGroup = formula[key];
        const updatedTiers = [...currentGroup.tiers];
        const target = { ...updatedTiers[index] };

        if (field === "minCount") {
            target.minCount = val;
        } else if (field === "deduction") {
            target.score = Math.max(0, currentGroup.max - val);
        }

        updatedTiers[index] = target;
        setFormula({
            ...formula,
            [key]: { ...currentGroup, tiers: updatedTiers },
        });
        setIsDefault(false);
    };

    const _addTierRow = (key: "preparation" | "compliance") => {
        if (!formula) return;
        const currentGroup = formula[key];
        const maxMinCount = currentGroup.tiers.reduce((max, item) => Math.max(max, item.minCount), 0);
        const newTier: RpointTier = {
            minCount: maxMinCount + 1,
            score: currentGroup.max,
        };
        setFormula({
            ...formula,
            [key]: { ...currentGroup, tiers: [...currentGroup.tiers, newTier] },
        });
        setIsDefault(false);
    };

    const removeTierRow = (key: "preparation" | "compliance", index: number) => {
        if (!formula) return;
        const currentGroup = formula[key];
        if (currentGroup.tiers[index].minCount === 0) return;

        const updatedTiers = currentGroup.tiers.filter((_, i) => i !== index);
        setFormula({
            ...formula,
            [key]: { ...currentGroup, tiers: updatedTiers },
        });
        setIsDefault(false);
    };

    const updateBonusCap = (value: number) => {
        if (!formula) return;
        setFormula({ ...formula, bonus: { cap: value } });
        setIsDefault(false);
    };

    if (!isOpen) return null;

    return (
        <CustomModal.Root open={isOpen} onOpenChange={onOpenChange}>
            <CustomModal.Content className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden !rounded-[24px] bg-white shadow-2xl">
                <Dialog className="flex min-h-0 flex-1 flex-col outline-none">
                    {/* Header */}
                    <div className="relative flex shrink-0 flex-col px-6 pt-6">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 font-bold text-amber-600">
                                <Award className="size-5" />
                            </div>
                            <div>
                                <Heading slot="title" className="text-xl font-bold text-slate-900">
                                    {t.title}
                                </Heading>
                                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                                    <span className="font-semibold text-slate-800">{courseTitle}</span>
                                    <span
                                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${
                                            isDefault ? "bg-slate-100 text-slate-600" : "bg-amber-100 text-amber-800"
                                        }`}
                                    >
                                        {isDefault ? t.statusDefaultBadge : t.statusCustomBadge}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="absolute top-5 right-5 cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            aria-label="Close"
                        >
                            <X className="size-5" />
                        </button>

                        {/* Navigation Tabs */}
                        <div className="mt-5 flex border-b border-slate-200 text-xs font-bold text-slate-500">
                            <button
                                type="button"
                                onClick={() => setActiveTab("linear")}
                                className={`cursor-pointer border-b-2 px-4 py-2.5 transition ${
                                    activeTab === "linear" ? "border-wine text-wine" : "border-transparent hover:text-slate-900"
                                }`}
                            >
                                {t.tabLinear}
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("tiers")}
                                className={`cursor-pointer border-b-2 px-4 py-2.5 transition ${
                                    activeTab === "tiers" ? "border-wine text-wine" : "border-transparent hover:text-slate-900"
                                }`}
                            >
                                {t.tabTiers}
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("bonus")}
                                className={`cursor-pointer border-b-2 px-4 py-2.5 transition ${
                                    activeTab === "bonus" ? "border-wine text-wine" : "border-transparent hover:text-slate-900"
                                }`}
                            >
                                {t.tabBonus}
                            </button>
                        </div>
                    </div>

                    {/* Modal Body */}
                    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6">
                        {isLoading || !formula ? (
                            <div className="flex h-48 items-center justify-center gap-2 text-sm text-slate-500">
                                <div className="size-5 animate-spin rounded-full border-2 border-slate-200 border-t-wine" />
                                {t.loading}
                            </div>
                        ) : (
                            <>
                                {/* Validation Error Banner */}
                                {validationErrors.length > 0 && (
                                    <div className="flex flex-col gap-1 rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-xs text-rose-700">
                                        <div className="flex items-center gap-2 font-bold text-rose-800">
                                            <AlertCircle className="size-4 shrink-0" />
                                            <span>
                                                {t.invalidFormulaPrefix}
                                                {validationErrors.length}
                                                {t.errorsSuffix}
                                            </span>
                                        </div>
                                        <ul className="ml-6 list-disc space-y-0.5 font-medium">
                                            {validationErrors.map((err, idx) => (
                                                <li key={idx}>{err}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* TAB 1: Linear Groups (Chuyên cần) */}
                                {activeTab === "linear" && (
                                    <div className="flex flex-col gap-8">
                                        {/* Attendance */}
                                        <div className="flex flex-col gap-3 rounded-2xl">
                                            <h3 className="text-xs font-bold text-slate-800">{t.attendanceSection}</h3>
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <Input
                                                    label={t.attendanceMaxLabel}
                                                    type="number"
                                                    min={0}
                                                    value={String(formula.attendance.max)}
                                                    onChange={(v) => updateLinear("attendance", "max", Number(v))}
                                                />
                                                <Input
                                                    label={t.attendanceDeductionLabel}
                                                    type="number"
                                                    min={0}
                                                    step={0.5}
                                                    value={String(formula.attendance.deductionPerPercent)}
                                                    onChange={(v) => updateLinear("attendance", "deductionPerPercent", Number(v))}
                                                />
                                            </div>
                                            {formula.attendance.deductionPerPercent > 0 && (
                                                <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 p-2 text-[11px] font-semibold text-amber-700">
                                                    <Info className="size-3.5 shrink-0" />
                                                    <span>
                                                        {t.attendanceThresholdHint.replace(
                                                            "{percent}",
                                                            String(
                                                                Math.round((formula.attendance.max / formula.attendance.deductionPerPercent) * ROUND_FACTOR) /
                                                                    ROUND_FACTOR,
                                                            ),
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Assignment */}
                                        <div className="flex flex-col gap-3 rounded-2xl">
                                            <h3 className="text-xs font-bold text-slate-800">{t.assignmentSection}</h3>
                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                <Input
                                                    label={t.assignmentMaxLabel}
                                                    type="number"
                                                    min={0}
                                                    value={String(formula.assignment.max)}
                                                    onChange={(v) => updateLinear("assignment", "max", Number(v))}
                                                />
                                                <Input
                                                    label={t.assignmentDeductionLabel}
                                                    type="number"
                                                    min={0}
                                                    step={0.5}
                                                    value={String(formula.assignment.deductionPerPercent)}
                                                    onChange={(v) => updateLinear("assignment", "deductionPerPercent", Number(v))}
                                                />
                                            </div>
                                            {formula.assignment.deductionPerPercent > 0 && (
                                                <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 p-2 text-[11px] font-semibold text-amber-700">
                                                    <Info className="size-3.5 shrink-0" />
                                                    <span>
                                                        {t.assignmentThresholdHint.replace(
                                                            "{percent}",
                                                            String(
                                                                Math.round((formula.assignment.max / formula.assignment.deductionPerPercent) * ROUND_FACTOR) /
                                                                    ROUND_FACTOR,
                                                            ),
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Preparation Tiers */}
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center justify-between gap-4">
                                                <h3 className="text-xs font-bold text-slate-800">{t.preparationSection}</h3>
                                                <div className="flex items-center gap-2">
                                                    <label className="text-xs font-bold whitespace-nowrap text-slate-600">
                                                        {t.preparationMaxLabel}
                                                        {":"}
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        value={formula.preparation.max}
                                                        onChange={(e) => updateTierMax("preparation", Number(e.target.value))}
                                                        className="w-20 rounded-full border border-slate-200 px-3 py-1.5 text-center font-bold text-slate-800 transition outline-none focus:border-wine focus:ring-1 focus:ring-wine"
                                                    />
                                                </div>
                                            </div>

                                            <div className="overflow-hidden rounded-2xl border border-slate-200">
                                                <table className="w-full text-left text-xs">
                                                    <thead className="bg-slate-50 text-[11px] font-bold text-slate-500">
                                                        <tr>
                                                            <th className="w-28 px-4 py-3 whitespace-nowrap">{t.thMinCount}</th>
                                                            <th className="w-48 px-4 py-3 whitespace-nowrap">{t.thDeduction}</th>
                                                            <th className="px-4 py-3 whitespace-nowrap">{t.thScore}</th>
                                                            <th className="w-28 px-4 py-3 text-center whitespace-nowrap">{t.thActions}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {formula.preparation.tiers.map((tier, idx) => {
                                                            const deduction = Math.max(0, formula.preparation.max - tier.score);
                                                            const isMandatoryZero = tier.minCount === 0;

                                                            return (
                                                                <tr key={idx} className="hover:bg-slate-50/60">
                                                                    <td className="w-28 px-4 py-2.5 align-middle">
                                                                        <input
                                                                            type="number"
                                                                            min={0}
                                                                            value={tier.minCount}
                                                                            onChange={(e) =>
                                                                                updateTierRow("preparation", idx, "minCount", Number(e.target.value))
                                                                            }
                                                                            className="w-20 rounded-full border border-slate-200 px-3 py-1.5 text-center font-bold text-slate-800 transition outline-none focus:border-wine focus:ring-1 focus:ring-wine"
                                                                        />
                                                                    </td>
                                                                    <td className="w-48 px-4 py-2.5 align-middle">
                                                                        <input
                                                                            type="number"
                                                                            min={0}
                                                                            max={formula.preparation.max}
                                                                            value={deduction}
                                                                            onChange={(e) =>
                                                                                updateTierRow("preparation", idx, "deduction", Number(e.target.value))
                                                                            }
                                                                            className="w-24 rounded-full border border-slate-200 px-3 py-1.5 text-center font-bold text-rose-600 transition outline-none focus:border-wine focus:ring-1 focus:ring-wine"
                                                                        />
                                                                    </td>
                                                                    <td className="px-4 py-2.5 align-middle font-bold text-slate-700">
                                                                        {tier.score} {"/"} {formula.preparation.max}
                                                                    </td>
                                                                    <td className="w-28 px-4 py-2.5 text-center align-middle">
                                                                        <button
                                                                            type="button"
                                                                            disabled={isMandatoryZero}
                                                                            onClick={() => removeTierRow("preparation", idx)}
                                                                            title={isMandatoryZero ? t.minCountZeroRequiredTooltip : "Xóa dòng"}
                                                                            className="inline-flex size-7 items-center justify-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                                                                        >
                                                                            <Trash2 className="size-4" />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 2: Tier Groups (E-learning / Vi phạm) */}
                                {activeTab === "tiers" && (
                                    <div className="flex flex-col gap-8">
                                        {/* Compliance Tiers */}
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center justify-between gap-4">
                                                <h3 className="text-xs font-bold text-slate-800">{t.complianceSection}</h3>
                                                <div className="flex items-center gap-2">
                                                    <label className="text-xs font-bold whitespace-nowrap text-slate-600">
                                                        {t.complianceMaxLabel}
                                                        {":"}
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        value={formula.compliance.max}
                                                        onChange={(e) => updateTierMax("compliance", Number(e.target.value))}
                                                        className="w-20 rounded-full border border-slate-200 px-3 py-1.5 text-center font-bold text-slate-800 transition outline-none focus:border-wine focus:ring-1 focus:ring-wine"
                                                    />
                                                </div>
                                            </div>

                                            <div className="overflow-hidden rounded-2xl border border-slate-200">
                                                <table className="w-full text-left text-xs">
                                                    <thead className="bg-slate-50 text-[11px] font-bold text-slate-500">
                                                        <tr>
                                                            <th className="w-28 px-4 py-3 whitespace-nowrap">{t.thMinCount}</th>
                                                            <th className="w-48 px-4 py-3 whitespace-nowrap">{t.thDeduction}</th>
                                                            <th className="px-4 py-3 whitespace-nowrap">{t.thScore}</th>
                                                            <th className="w-28 px-4 py-3 text-center whitespace-nowrap">{t.thActions}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {formula.compliance.tiers.map((tier, idx) => {
                                                            const deduction = Math.max(0, formula.compliance.max - tier.score);
                                                            const isMandatoryZero = tier.minCount === 0;

                                                            return (
                                                                <tr key={idx} className="hover:bg-slate-50/60">
                                                                    <td className="w-28 px-4 py-2.5 align-middle">
                                                                        <input
                                                                            type="number"
                                                                            min={0}
                                                                            value={tier.minCount}
                                                                            onChange={(e) =>
                                                                                updateTierRow("compliance", idx, "minCount", Number(e.target.value))
                                                                            }
                                                                            className="w-20 rounded-full border border-slate-200 px-3 py-1.5 text-center font-bold text-slate-800 transition outline-none focus:border-wine focus:ring-1 focus:ring-wine"
                                                                        />
                                                                    </td>
                                                                    <td className="w-48 px-4 py-2.5 align-middle">
                                                                        <input
                                                                            type="number"
                                                                            min={0}
                                                                            max={formula.compliance.max}
                                                                            value={deduction}
                                                                            onChange={(e) =>
                                                                                updateTierRow("compliance", idx, "deduction", Number(e.target.value))
                                                                            }
                                                                            className="w-24 rounded-full border border-slate-200 px-3 py-1.5 text-center font-bold text-rose-600 transition outline-none focus:border-wine focus:ring-1 focus:ring-wine"
                                                                        />
                                                                    </td>
                                                                    <td className="px-4 py-2.5 align-middle font-bold text-slate-700">
                                                                        {tier.score} {"/"} {formula.compliance.max}
                                                                    </td>
                                                                    <td className="w-28 px-4 py-2.5 text-center align-middle">
                                                                        <button
                                                                            type="button"
                                                                            disabled={isMandatoryZero}
                                                                            onClick={() => removeTierRow("compliance", idx)}
                                                                            title={isMandatoryZero ? t.minCountZeroRequiredTooltip : "Xóa dòng"}
                                                                            className="inline-flex size-7 items-center justify-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
                                                                        >
                                                                            <Trash2 className="size-4" />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TAB 3: Bonus Group */}
                                {activeTab === "bonus" && (
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between gap-4">
                                            <h3 className="text-xs font-bold text-slate-800">{t.bonusSection}</h3>
                                            <div className="flex items-center gap-2">
                                                <label className="text-xs font-bold whitespace-nowrap text-slate-600">
                                                    {t.bonusCapLabel}
                                                    {":"}
                                                </label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={formula.bonus.cap}
                                                    onChange={(e) => updateBonusCap(Number(e.target.value))}
                                                    className="w-20 rounded-full border border-slate-200 px-3 py-1.5 text-center font-bold text-slate-800 transition outline-none focus:border-wine focus:ring-1 focus:ring-wine"
                                                />
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-500">{t.bonusCapHint}</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                        <div className="flex gap-2">
                            <button
                                type="button"
                                disabled={resetMutation.isPending || isDefault}
                                onClick={() => resetMutation.mutate()}
                                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <RotateCcw className="size-4 shrink-0" />
                                <span>{t.resetSystemBtn}</span>
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => onOpenChange(false)}
                                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                            >
                                <span>{t.cancelBtn}</span>
                            </button>
                            <button
                                type="button"
                                disabled={!formula || !isValid || saveMutation.isPending}
                                onClick={() => saveMutation.mutate()}
                                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-wine px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-wine-deep disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Save className="size-4 shrink-0" />
                                <span>{saveMutation.isPending ? t.saving : t.saveBtn}</span>
                            </button>
                        </div>
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
