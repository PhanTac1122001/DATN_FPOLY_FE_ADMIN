"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dices, Layers, RefreshCw, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
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

export function AssignGroupHomeworkModal({ isOpen, onClose, group, availableSubjects = [] }: AssignGroupHomeworkModalProps) {
    const queryClient = useQueryClient();

    const [subjectId, setSubjectId] = useState("");
    const [sessionId, setSessionId] = useState("");
    const [homeworkTitle, setHomeworkTitle] = useState("");
    const [difficultyLevel] = useState<HomeworkDifficultyLevel>("MEDIUM");
    const [dueDate, setDueDate] = useState("");
    const [note, setNote] = useState("");
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
            setHomeworkTitle("");
            setDueDate("");
            setNote("");
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

            // Trường hợp 1: Chọn bài ngẫu nhiên theo số lượng nhập của các cấp độ
            if (totalRandomCount > 0) {
                const assignedPromises: Promise<unknown>[] = [];

                HOMEWORK_DIFFICULTY_LEVELS.forEach((lvl) => {
                    const count = levelCounts[lvl.id] || 0;
                    const pool = homeworksByLevel[lvl.id] || [];

                    if (count > 0 && pool.length > 0) {
                        // Shuffle pool ngẫu nhiên
                        const shuffled = [...pool].sort(() => RANDOM_SORT_OFFSET - Math.random());
                        const selectedHws = shuffled.slice(0, count);

                        selectedHws.forEach((hw) => {
                            assignedPromises.push(
                                assignHomeworkToGroup(group.id, {
                                    subjectId,
                                    homeworkId: hw.title || hw.id,
                                    difficultyLevel: lvl.id,
                                    assignedStudentIds: selectedStudentIds,
                                    dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
                                    note: note.trim(),
                                }),
                            );
                        });
                    }
                });

                if (assignedPromises.length === 0) {
                    throw new Error(UI_TEXT.assignGroupHomeworkModal.errorNoHomeworkInPool);
                }

                await Promise.all(assignedPromises);
                return assignedPromises.length;
            }

            // Trường hợp 2: Điền tên bài tập thủ công
            if (!homeworkTitle.trim()) {
                throw new Error(UI_TEXT.assignGroupHomeworkModal.errorTitleOrRandomRequired);
            }

            await assignHomeworkToGroup(group.id, {
                subjectId,
                homeworkId: homeworkTitle.trim(),
                difficultyLevel,
                assignedStudentIds: selectedStudentIds,
                dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
                note: note.trim(),
            });
            return 1;
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

                        {/* Hoặc nhập tiêu đề bài tập thủ công */}
                        <Input
                            label={
                                totalRandomCount > 0 ? (
                                    UI_TEXT.assignGroupHomeworkModal.labelTitleOptional
                                ) : (
                                    <span>
                                        {UI_TEXT.assignGroupHomeworkModal.labelTitleManual} <span className="font-bold text-red-500">{"*"}</span>
                                    </span>
                                )
                            }
                            value={homeworkTitle}
                            onChange={(val) => setHomeworkTitle(val)}
                            placeholder={UI_TEXT.assignGroupHomeworkModal.placeholderTitle}
                        />

                        {/* Due Date & Note */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Input
                                label={UI_TEXT.assignGroupHomeworkModal.labelDueDate}
                                type="datetime-local"
                                value={dueDate}
                                onChange={(val) => setDueDate(val)}
                            />
                            <Input
                                label={UI_TEXT.assignGroupHomeworkModal.labelNote}
                                value={note}
                                onChange={(val) => setNote(val)}
                                placeholder={UI_TEXT.assignGroupHomeworkModal.placeholderNote}
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
                            isDisabled={!subjectId || (totalRandomCount === 0 && !homeworkTitle.trim())}
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
