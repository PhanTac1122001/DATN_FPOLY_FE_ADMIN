"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Briefcase, Plus, X } from "lucide-react";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { careerTagService } from "@/services/career-tag.service";
import { toast } from "@/services/toast.service";
import type { CareerAssignPanelProps } from "@/types/course-roadmap.types";

const countToken = "{count}";

export function CareerAssignPanel({ systemRoadmap, careers, activeCareerId, onChangeCareer }: CareerAssignPanelProps) {
    const queryClient = useQueryClient();
    const t = UI_TEXT.courseRoadmap;

    const [checked, setChecked] = useState<Set<string>>(new Set());
    const [isCreating, setIsCreating] = useState(false);
    const [newCareerName, setNewCareerName] = useState("");

    const { data: taggedCourses } = useQuery({
        queryKey: ["tag-courses", activeCareerId],
        queryFn: () => careerTagService.getCourses(activeCareerId as string),
        enabled: Boolean(activeCareerId),
    });

    const taggedIds = useMemo(() => (taggedCourses ?? []).map((course) => course.id), [taggedCourses]);

    useEffect(() => {
        setChecked(new Set(taggedIds));
    }, [taggedIds]);

    const allCourses = useMemo(() => {
        if (!systemRoadmap) return [];
        const categorized = systemRoadmap.categories.flatMap((category) => category.courses);
        return [...categorized, ...systemRoadmap.uncategorized.courses];
    }, [systemRoadmap]);

    const careerItems = careers.map((career) => ({ id: career.id, label: career.name }));

    const saveMutation = useMutation({
        mutationFn: () => careerTagService.setCourses(activeCareerId as string, [...checked]),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["staff-roadmap"] });
            queryClient.invalidateQueries({ queryKey: ["tag-courses"] });
            toast.success(t.toastCareerSaveTitle, t.toastCareerSaveDesc);
        },
        onError: () => {
            toast.error(UI_TEXT.common.errorTitle, t.toastCareerSaveError);
        },
    });

    const createMutation = useMutation({
        mutationFn: (name: string) => careerTagService.create({ name }),
        onSuccess: (created) => {
            queryClient.invalidateQueries({ queryKey: ["career-tags"] });
            setNewCareerName("");
            setIsCreating(false);
            onChangeCareer(created.id);
        },
        onError: () => {
            toast.error(UI_TEXT.common.errorTitle, t.toastCareerSaveError);
        },
    });

    const handleToggleCourse = (courseId: string) => {
        setChecked((prev) => {
            const next = new Set(prev);
            if (next.has(courseId)) {
                next.delete(courseId);
            } else {
                next.add(courseId);
            }
            return next;
        });
    };

    const handleCreateCareer = () => {
        const trimmed = newCareerName.trim();
        if (!trimmed) return;
        createMutation.mutate(trimmed);
    };

    return (
        <div className="flex w-full shrink-0 flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-4 lg:w-80">
            <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-wine">
                    <Briefcase className="size-5" />
                </div>
                <span className="text-base font-extrabold text-slate-900">{t.careerPanelTitle}</span>
            </div>

            <div className="flex flex-col gap-2">
                <Select
                    aria-label={t.careerPanelPickCareer}
                    placeholder={t.careerPanelPickCareer}
                    size="sm"
                    isClearable={false}
                    selectedKey={activeCareerId}
                    items={careerItems}
                    onSelectionChange={(key) => key !== null && key !== undefined && onChangeCareer(String(key))}
                >
                    {(item) => <Select.Item id={item.id} label={item.label} />}
                </Select>

                {isCreating ? (
                    <div className="flex items-center gap-2">
                        <div className="min-w-0 flex-1">
                            <Input label="" placeholder={UI_TEXT.careerTags.addPlaceholder} value={newCareerName} onChange={setNewCareerName} />
                        </div>
                        <button
                            type="button"
                            onClick={handleCreateCareer}
                            disabled={createMutation.isPending}
                            aria-label={t.createCareerInline}
                            title={t.createCareerInline}
                            className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-wine text-white shadow-xs transition hover:bg-wine/90 disabled:opacity-50"
                        >
                            <Plus className="size-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsCreating(false);
                                setNewCareerName("");
                            }}
                            aria-label={UI_TEXT.common.cancel}
                            title={UI_TEXT.common.cancel}
                            className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => setIsCreating(true)}
                        className="inline-flex w-fit cursor-pointer items-center gap-1 rounded-full px-2 py-1 text-xs font-bold text-wine transition hover:bg-wine/5"
                    >
                        {t.createCareerInline}
                    </button>
                )}
            </div>

            {activeCareerId ? (
                <div className="flex min-h-0 flex-1 flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600">{t.careerPanelCoursesLabel}</span>
                        <span className="shrink-0 rounded-full bg-wine/10 px-2 py-0.5 text-[11px] font-bold text-wine">
                            {t.careerPanelCount.replace(countToken, String(checked.size))}
                        </span>
                    </div>

                    <div className="custom-scrollbar flex max-h-96 flex-1 flex-col gap-1.5 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50/60 p-2">
                        {allCourses.map((course) => (
                            <label
                                key={course.courseId}
                                className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-transparent bg-white px-2.5 py-2 shadow-2xs transition hover:border-slate-200"
                            >
                                <input
                                    type="checkbox"
                                    checked={checked.has(course.courseId)}
                                    onChange={() => handleToggleCourse(course.courseId)}
                                    className="size-4 shrink-0 cursor-pointer rounded border-slate-300 text-wine focus:ring-wine"
                                    aria-label={course.name}
                                />
                                <span className="shrink-0 font-mono text-[11px] font-bold text-wine">{course.courseCode}</span>
                                <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-800">{course.name}</span>
                            </label>
                        ))}
                    </div>

                    <Button
                        type="button"
                        color="primary"
                        size="md"
                        isLoading={saveMutation.isPending}
                        onClick={() => saveMutation.mutate()}
                        className="w-full rounded-full border-none bg-wine font-bold text-white shadow-xs hover:bg-wine/90"
                    >
                        {t.careerPanelSave}
                    </Button>
                </div>
            ) : (
                <div className="flex flex-1 items-center justify-center px-4 py-10 text-center text-xs font-medium text-slate-400">{t.careerPanelEmpty}</div>
            )}
        </div>
    );
}
