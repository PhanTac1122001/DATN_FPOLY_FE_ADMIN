"use client";

import { useEffect, useMemo, useState } from "react";
import { getLocalTimeZone } from "@internationalized/date";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dices, Layers, RefreshCw, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { DateTimePicker } from "@/components/application/date-picker/date-time-picker";
import { Button } from "@/components/base/buttons/button";
import { Select } from "@/components/base/select/select";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { HOMEWORK_DIFFICULTY_LEVELS, RANDOM_SORT_OFFSET } from "@/constants/ui-components.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { assignHomeworkToGroup } from "@/services/group.service";
import { getHomeworkBySession } from "@/services/homework.service";
import { getSessionsByCourse } from "@/services/material.service";
import { toast } from "@/services/toast.service";
import type { AssignGroupHomeworkModalProps, GroupSubject, HomeworkDifficultyLevel } from "@/types/group.types";
import type { Homework } from "@/types/material.types";
import { parseToDateTime } from "@/utils/date-time-picker.utils";

export function AssignGroupHomeworkModal({ isOpen, onClose, group, availableSubjects = [] }: AssignGroupHomeworkModalProps) {
    const queryClient = useQueryClient();

    const [subjectId, setSubjectId] = useState("");
    const [sessionId, setSessionId] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [dueTime, setDueTime] = useState("");
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

    // State cho số lượng bài tập muốn lấy ngẫu nhiên theo từng cấp độ
    const [levelCounts, setLevelCounts] = useState<Record<HomeworkDifficultyLevel, number>>({
        EASY: 0,
        MEDIUM: 0,
        FAIR: 0,
        GOOD: 0,
        EXCELLENT: 0,
    });

    const groupSubjects = useMemo(() => {
        const map = new Map<string, GroupSubject>();

        // 1. Prioritize populated subjects array on the group
        if (group?.subjects && group.subjects.length > 0) {
            group.subjects.forEach((s) => {
                if (s.id) map.set(s.id, s);
            });
        }

        // 2. If group has subjectIds, resolve details from availableSubjects that match subjectIds
        if (group?.subjectIds && group.subjectIds.length > 0) {
            const subjectIdSet = new Set(group.subjectIds);
            availableSubjects.forEach((s) => {
                if (s.id && subjectIdSet.has(s.id) && !map.has(s.id)) {
                    map.set(s.id, s);
                }
            });
        }

        return Array.from(map.values());
    }, [group, availableSubjects]);

    // Load sessions when subjectId changes
    const { data: sessions = [], isLoading: isLoadingSessions } = useQuery({
        queryKey: ["course-sessions", subjectId],
        queryFn: () => getSessionsByCourse(subjectId),
        enabled: isOpen && !!subjectId,
    });

    // Load homeworks when sessionId changes
    const { data: sessionHomeworks = [], isLoading: isLoadingHomeworks } = useQuery({
        queryKey: ["session-homeworks", sessionId],
        queryFn: () => getHomeworkBySession(sessionId),
        enabled: isOpen && !!sessionId,
    });

    // Phân loại danh sách bài tập theo cấp độ
    const homeworksByLevel = useMemo(() => {
        const map: Record<HomeworkDifficultyLevel, Homework[]> = {
            EASY: [],
            MEDIUM: [],
            FAIR: [],
            GOOD: [],
            EXCELLENT: [],
        };
        sessionHomeworks.forEach((hw) => {
            const lvl = (hw.difficultyLevel || "MEDIUM").toUpperCase() as HomeworkDifficultyLevel;
            if (map[lvl]) {
                map[lvl].push(hw);
            } else {
                map.MEDIUM.push(hw);
            }
        });
        return map;
    }, [sessionHomeworks]);

    useEffect(() => {
        if (isOpen && group) {
            const initialSubject = groupSubjects[0]?.id || "";
            setSubjectId(initialSubject);
            setSessionId("");
            setDueDate("");
            setDueTime("");
            setSelectedStudentIds(group.studentIds || []);
            setLevelCounts({
                EASY: 0,
                MEDIUM: 0,
                FAIR: 0,
                GOOD: 0,
                EXCELLENT: 0,
            });
        }
    }, [isOpen, group, groupSubjects]);

    // Tự động chọn buổi đầu tiên khi tải xong danh sách buổi
    useEffect(() => {
        if (sessions.length > 0 && !sessionId) {
            setSessionId(sessions[0].id);
        }
    }, [sessions, sessionId]);

    const totalRandomCount = useMemo(() => {
        return Object.values(levelCounts).reduce((sum, c) => sum + (c || 0), 0);
    }, [levelCounts]);

    const mutation = useMutation({
        mutationFn: async () => {
            if (!group) return;
            if (!subjectId) throw new Error(UI_TEXT.assignGroupHomeworkModal.errorSelectSubject);

            const homeworksPayload: Array<{ homeworkId: string; difficultyLevel: HomeworkDifficultyLevel }> = [];

            HOMEWORK_DIFFICULTY_LEVELS.forEach((lvl) => {
                const count = levelCounts[lvl.id] || 0;
                const pool = homeworksByLevel[lvl.id] || [];

                if (count > 0 && pool.length > 0) {
                    const shuffled = [...pool].sort(() => RANDOM_SORT_OFFSET - Math.random());
                    const selectedHws = shuffled.slice(0, count);

                    selectedHws.forEach((hw) => {
                        const hwId = hw.id || ((hw as unknown as Record<string, unknown>)._id as string);
                        homeworksPayload.push({
                            homeworkId: hwId,
                            difficultyLevel: lvl.id,
                        });
                    });
                }
            });

            if (homeworksPayload.length === 0) {
                throw new Error(UI_TEXT.assignGroupHomeworkModal.errorNoHomeworkInPool);
            }

            const dueDateValue = parseToDateTime(dueDate, dueTime);
            await assignHomeworkToGroup(group.id, {
                subjectId,
                homeworks: homeworksPayload,
                assignedStudentIds: selectedStudentIds,
                dueDate: dueDateValue ? dueDateValue.toDate(getLocalTimeZone()).toISOString() : undefined,
            });

            return homeworksPayload.length;
        },
        onSuccess: (assignedCount) => {
            toast.success(
                UI_TEXT.assignGroupHomeworkModal.toastSuccessTitle,
                `${UI_TEXT.assignGroupHomeworkModal.toastSuccessDescPrefix} ${assignedCount || 1} ${UI_TEXT.assignGroupHomeworkModal.toastSuccessDescSuffix}`,
            );
            if (group) {
                queryClient.invalidateQueries({ queryKey: ["group-homeworks", group.id] });
            }
            onClose();
        },
        onError: (err: Error) => {
            toast.error(UI_TEXT.assignGroupHomeworkModal.toastErrorTitle, err?.message || UI_TEXT.assignGroupHomeworkModal.toastDefaultError);
        },
    });

    if (!group) return null;

    const subjectOptions = groupSubjects.map((sub) => ({
        id: sub.id,
        label: `${sub.name}${sub.courseCode ? ` (${sub.courseCode})` : ""}`,
    }));

    const sessionOptions = sessions.map((ses, idx) => ({
        id: ses.id,
        label: `${UI_TEXT.assignGroupHomeworkModal.sessionPrefix} ${idx + 1}: ${ses.name}`,
    }));

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="max-w-3xl !overflow-visible !rounded-[24px]">
                <Dialog className="flex max-h-[90vh] w-full flex-col rounded-[24px] bg-white shadow-2xl outline-none">
                    {/* Header */}
                    <div className="relative flex flex-col border-b border-slate-100 px-6 pt-6 pb-4">
                        <Heading slot="title" className="text-xl font-bold text-slate-900">
                            {UI_TEXT.assignGroupHomeworkModal.title}
                        </Heading>
                        <p className="mt-1 text-xs text-slate-500">
                            {UI_TEXT.assignGroupHomeworkModal.groupPrefix} <span className="font-semibold text-slate-700">{group.title}</span>
                        </p>
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute top-5 right-5 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            aria-label="Close"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Scrollable Form Body */}
                    <div className="custom-scrollbar flex flex-1 flex-col gap-5 overflow-y-auto p-6">
                        {/* Chọn môn học & Buổi học */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-slate-700">
                                    {UI_TEXT.assignGroupHomeworkModal.labelSubject} <span className="font-bold text-red-500">{"*"}</span>
                                </label>
                                <Select
                                    aria-label={UI_TEXT.assignGroupHomeworkModal.labelSubject}
                                    selectedKey={subjectId || null}
                                    onSelectionChange={(key) => {
                                        if (key) {
                                            setSubjectId(key as string);
                                            setSessionId("");
                                        }
                                    }}
                                    items={subjectOptions}
                                    size="sm"
                                    placeholder={
                                        groupSubjects.length === 0
                                            ? UI_TEXT.assignGroupHomeworkModal.noSubjectsForGroup
                                            : UI_TEXT.assignGroupHomeworkModal.placeholderSelectSubject
                                    }
                                    isDisabled={groupSubjects.length === 0}
                                >
                                    {(item) => <Select.Item id={item.id} label={item.label} />}
                                </Select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                                    <Layers className="size-4 text-blue-500" />
                                    {UI_TEXT.assignGroupHomeworkModal.labelSession}
                                </label>
                                <Select
                                    aria-label={UI_TEXT.assignGroupHomeworkModal.labelSession}
                                    selectedKey={sessionId || null}
                                    onSelectionChange={(key) => {
                                        if (key) setSessionId(key as string);
                                    }}
                                    items={sessionOptions}
                                    size="sm"
                                    placeholder={
                                        isLoadingSessions
                                            ? UI_TEXT.assignGroupHomeworkModal.loadingSessions
                                            : sessions.length === 0
                                              ? UI_TEXT.assignGroupHomeworkModal.noSessionsFound
                                              : UI_TEXT.assignGroupHomeworkModal.placeholderSelectSession
                                    }
                                    isDisabled={isLoadingSessions || sessions.length === 0}
                                >
                                    {(item) => <Select.Item id={item.id} label={item.label} />}
                                </Select>
                            </div>
                        </div>

                        {/* Nhập số lượng bài tập random ngẫu nhiên theo từng Cấp độ */}
                        {sessionId && (
                            <div className="flex flex-col gap-3 rounded-2xl border border-wine/20 bg-slate-50/70 p-4">
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-wine uppercase">
                                        <Dices className="size-4 text-wine" />
                                        {UI_TEXT.assignGroupHomeworkModal.randomTitle}
                                    </label>
                                    <span className="rounded-full bg-wine/10 px-3 py-0.5 text-xs font-semibold text-wine">
                                        {UI_TEXT.assignGroupHomeworkModal.totalChosenPrefix} {totalRandomCount}{" "}
                                        {UI_TEXT.assignGroupHomeworkModal.totalChosenSuffix}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500">{UI_TEXT.assignGroupHomeworkModal.randomNotice}</p>

                                {isLoadingHomeworks ? (
                                    <div className="flex items-center gap-2 py-2 text-xs text-slate-500">
                                        <RefreshCw className="size-4 animate-spin text-wine" />
                                        {UI_TEXT.assignGroupHomeworkModal.loadingHomeworkPool}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        {HOMEWORK_DIFFICULTY_LEVELS.map((lvl) => {
                                            const poolCount = homeworksByLevel[lvl.id]?.length || 0;
                                            const currentVal = levelCounts[lvl.id] || 0;
                                            return (
                                                <div
                                                    key={lvl.id}
                                                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-xs"
                                                >
                                                    <div>
                                                        <span className={`rounded border px-2 py-0.5 text-xs font-semibold ${lvl.badgeColor}`}>
                                                            {lvl.label}
                                                        </span>
                                                        <span className="ml-2 text-[11px] text-slate-500">
                                                            {UI_TEXT.assignGroupHomeworkModal.poolPrefix} <strong>{poolCount}</strong>{" "}
                                                            {UI_TEXT.assignGroupHomeworkModal.poolSuffix}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            max={poolCount}
                                                            value={currentVal}
                                                            onChange={(e) => {
                                                                const val = Math.max(0, Math.min(poolCount, parseInt(e.target.value, 10) || 0));
                                                                setLevelCounts((prev) => ({
                                                                    ...prev,
                                                                    [lvl.id]: val,
                                                                }));
                                                            }}
                                                            disabled={poolCount === 0}
                                                            className="w-16 rounded-full border border-slate-200 bg-white px-2 py-1 text-center text-xs font-bold text-slate-900 shadow-xs focus:border-wine focus:outline-none disabled:opacity-40"
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Due Date */}
                        <div className="flex flex-col gap-1.5">
                            <DateTimePicker
                                label={UI_TEXT.assignGroupHomeworkModal.labelDueDate}
                                placeholder={UI_TEXT.assignGroupHomeworkModal.placeholderDueDate}
                                date={dueDate || undefined}
                                time={dueTime || undefined}
                                onChange={(nextDate, nextTime) => {
                                    setDueDate(nextDate);
                                    setDueTime(nextTime);
                                }}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 rounded-b-[24px] border-t border-slate-100 bg-slate-50/60 p-4">
                        <Button type="button" color="secondary-gray" size="md" onClick={onClose} isDisabled={mutation.isPending}>
                            {UI_TEXT.assignGroupHomeworkModal.btnCancel}
                        </Button>
                        <Button
                            color="primary"
                            size="md"
                            type="button"
                            onClick={() => mutation.mutate()}
                            isLoading={mutation.isPending}
                            isDisabled={!subjectId || totalRandomCount === 0}
                            className="border-none bg-wine px-6 font-bold text-white hover:bg-wine-deep"
                        >
                            {totalRandomCount > 0
                                ? `${UI_TEXT.assignGroupHomeworkModal.btnConfirmRandomPrefix}${totalRandomCount} ${UI_TEXT.assignGroupHomeworkModal.btnConfirmRandomSuffix}`
                                : UI_TEXT.assignGroupHomeworkModal.btnConfirm}
                        </Button>
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
