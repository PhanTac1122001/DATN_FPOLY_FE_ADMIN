"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Plus, Trash2, Upload, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { TiptapEditor } from "@/components/base/editor";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { TextArea } from "@/components/base/textarea/textarea";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { httpClient } from "@/lib/http-client";
import { getCoursesBySystem } from "@/services/material.service";
import { createSessionQuiz, downloadExcelTemplate, importExcelQuestions, updateSessionQuiz } from "@/services/session-quiz.service";
import { getSystemsList } from "@/services/system.service";
import { toast } from "@/services/toast.service";
import { HttpMethod } from "@/types/api-types";
import type { CourseItem } from "@/types/course.types";
import type { Course } from "@/types/material.types";
import {
    type CreateQuizziSetModalProps,
    QuestionCategoryEnum,
    QuestionDifficultyEnum,
    QuestionTypeEnum,
    type SessionInfo,
    type SessionQuizItem,
    type SessionQuizOption,
    type SessionQuizQuestion,
} from "@/types/session-quiz.types";
import type { System } from "@/types/system.types";

export function CreateQuizziSetModal({ isOpen, onClose, onSuccess, editQuiz }: CreateQuizziSetModalProps) {
    // Session selection state
    const [systems, setSystems] = useState<System[]>([]);
    const [courses, setCourses] = useState<CourseItem[]>([]);
    const [selectedSystemId, setSelectedSystemId] = useState("");
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [sessions, setSessions] = useState<SessionInfo[]>([]);
    const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
    const [isLoadingSessions, setIsLoadingSessions] = useState(false);

    // Quiz form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [durationMinutes, setDurationMinutes] = useState<number>(0);
    const [questions, setQuestions] = useState<SessionQuizQuestion[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load systems on open
    useEffect(() => {
        if (isOpen) {
            void getSystemsList().then(setSystems);
        }
    }, [isOpen]);

    // Fetch courses when system selected
    useEffect(() => {
        if (!selectedSystemId) {
            setCourses([]);
            setSelectedCourseId("");
            return;
        }

        const fetchCourses = async () => {
            try {
                const list = await getCoursesBySystem(selectedSystemId);
                const mapped: CourseItem[] = (list || []).map((c: Course) => {
                    const raw = c as unknown as Record<string, unknown>;
                    return {
                        id: String(c.id || raw._id || ""),
                        code: String(c.courseCode || raw.code || ""),
                        title: String(c.name || raw.title || ""),
                        category: typeof c.category === "string" ? c.category : "",
                        rPointConfig: { enabled: false, rPointValue: 0, minCompletionRate: 0 },
                        gradingFormula: { attendanceWeight: 0, quizWeight: 0, examWeight: 0, passScore: 0 },
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    };
                });
                setCourses(mapped);
                setSelectedCourseId((prev) => (mapped.some((item) => item.id === prev) ? prev : ""));
            } catch (error) {
                console.error("Error fetching courses for system:", error);
                setCourses([]);
                setSelectedCourseId("");
            }
        };

        void fetchCourses();
    }, [selectedSystemId]);

    // Populate data when editing
    useEffect(() => {
        if (isOpen && editQuiz) {
            setTitle(editQuiz.title || "");
            setDescription(editQuiz.description || "");
            setDurationMinutes(editQuiz.durationMinutes || 0);
            setSelectedSystemId(editQuiz.educationProgramId || "");
            setSelectedCourseId(editQuiz.subjectId || "");
            setSelectedSessionIds(editQuiz.sessionIds || []);
            setQuestions(editQuiz.questions || []);
        } else if (isOpen && !editQuiz) {
            setTitle("");
            setDescription("");
            setDurationMinutes(0);
            setSelectedSystemId("");
            setSelectedCourseId("");
            setSelectedSessionIds([]);
            setQuestions([]);
        }
    }, [isOpen, editQuiz]);

    // Fetch sessions when course selected
    useEffect(() => {
        if (!selectedCourseId) {
            setSessions([]);
            return;
        }

        const fetchSessions = async () => {
            try {
                setIsLoadingSessions(true);
                const res = await httpClient<unknown>(`/staff/sessions/course/${selectedCourseId}`, { method: HttpMethod.GET });
                const rawList = Array.isArray(res) ? res : (res as { data?: unknown[] })?.data || [];
                const mapped: SessionInfo[] = (rawList as Record<string, unknown>[]).map((s) => ({
                    id: String(s.id || s._id),
                    title: String(s.title || s.name || `Session ${s.position || ""}`),
                    position: typeof s.position === "number" ? s.position : undefined,
                }));
                setSessions(mapped);
            } catch (error) {
                console.error("Error fetching sessions:", error);
                setSessions([]);
            } finally {
                setIsLoadingSessions(false);
            }
        };

        void fetchSessions();
    }, [selectedCourseId]);

    const handleToggleSession = (sessionId: string) => {
        setSelectedSessionIds((prev) => (prev.includes(sessionId) ? prev.filter((id) => id !== sessionId) : [...prev, sessionId]));
    };

    const handleToggleSelectAllSessions = () => {
        const isAllSelected = sessions.length > 0 && sessions.every((s) => selectedSessionIds.includes(s.id));
        if (isAllSelected) {
            setSelectedSessionIds([]);
        } else {
            setSelectedSessionIds(sessions.map((s) => s.id));
        }
    };

    // Question operations
    const handleAddQuestion = () => {
        const newQuestion: SessionQuizQuestion = {
            content: "",
            type: QuestionTypeEnum.SINGLE_CHOICE,
            points: 1,
            category: QuestionCategoryEnum.NONE,
            difficulty: QuestionDifficultyEnum.EASY,
            options: [
                { content: "", isCorrect: true, explanation: "" },
                { content: "", isCorrect: false, explanation: "" },
            ],
        };
        setQuestions((prev) => [...prev, newQuestion]);
    };

    const handleRemoveQuestion = (index: number) => {
        setQuestions((prev) => prev.filter((_, i) => i !== index));
    };

    const handleQuestionChange = <K extends keyof SessionQuizQuestion>(index: number, field: K, value: SessionQuizQuestion[K]) => {
        setQuestions((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    // Option operations
    const handleAddOption = (qIndex: number) => {
        setQuestions((prev) => {
            const next = [...prev];
            const q = { ...next[qIndex] };
            const opts = [...(q.options || [])];
            opts.push({ content: "", isCorrect: false, explanation: "" });
            q.options = opts;
            next[qIndex] = q;
            return next;
        });
    };

    const handleRemoveOption = (qIndex: number, oIndex: number) => {
        setQuestions((prev) => {
            const next = [...prev];
            const q = { ...next[qIndex] };
            q.options = (q.options || []).filter((_, i) => i !== oIndex);
            next[qIndex] = q;
            return next;
        });
    };

    const handleOptionChange = <K extends keyof SessionQuizOption>(qIndex: number, oIndex: number, field: K, value: SessionQuizOption[K]) => {
        setQuestions((prev) => {
            const next = [...prev];
            const q = { ...next[qIndex] };
            const opts = [...(q.options || [])];
            opts[oIndex] = { ...opts[oIndex], [field]: value };
            q.options = opts;
            next[qIndex] = q;
            return next;
        });
    };

    const handleOptionCorrectToggle = (qIndex: number, oIndex: number) => {
        setQuestions((prev) => {
            const next = [...prev];
            const q = { ...next[qIndex] };
            const isSingle = q.type === QuestionTypeEnum.SINGLE_CHOICE;
            const opts = (q.options || []).map((o, idx) => {
                if (idx === oIndex) {
                    return { ...o, isCorrect: isSingle ? true : !o.isCorrect };
                }
                return isSingle ? { ...o, isCorrect: false } : o;
            });
            q.options = opts;
            next[qIndex] = q;
            return next;
        });
    };

    // Excel import / download
    const handleDownloadTemplate = async () => {
        try {
            await downloadExcelTemplate();
            toast.success(UI_TEXT.createQuizziSetModal.toastDownloadTitle, UI_TEXT.createQuizziSetModal.toastDownloadSuccess);
        } catch {
            toast.error(UI_TEXT.createQuizziSetModal.toastDownloadTitle, UI_TEXT.createQuizziSetModal.toastDownloadError);
        }
    };

    const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsImporting(true);
            const res = await importExcelQuestions(file);
            if (res.questions && res.questions.length > 0) {
                setQuestions((prev) => [...prev, ...res.questions]);
                toast.success(
                    UI_TEXT.createQuizziSetModal.toastImportTitle,
                    `${UI_TEXT.createQuizziSetModal.toastImportSuccessPrefix}${res.totalImported}${UI_TEXT.createQuizziSetModal.toastImportSuccessSuffix}`,
                );
            } else {
                toast.error(UI_TEXT.createQuizziSetModal.toastImportTitle, UI_TEXT.createQuizziSetModal.toastImportEmpty);
            }
        } catch (error: unknown) {
            console.error("Import error:", error);
            const errObj = error as { message?: string };
            toast.error(UI_TEXT.createQuizziSetModal.toastImportTitle, errObj?.message || UI_TEXT.createQuizziSetModal.toastImportErrorDefault);
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    // Form Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSessionIds || selectedSessionIds.length === 0) {
            toast.error(UI_TEXT.createQuizziSetModal.toastSubmitTitle, UI_TEXT.createQuizziSetModal.toastSubmitSessionError);
            return;
        }

        if (!title.trim()) {
            toast.error(UI_TEXT.createQuizziSetModal.toastSubmitTitle, UI_TEXT.createQuizziSetModal.toastSubmitTitleError);
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = {
                title: title.trim(),
                description: description.trim() || undefined,
                durationMinutes: Number(durationMinutes) || 0,
                educationProgramId: selectedSystemId || undefined,
                subjectId: selectedCourseId || undefined,
                sessionIds: selectedSessionIds,
                questions,
            };

            let result: SessionQuizItem;
            if (editQuiz) {
                result = await updateSessionQuiz(editQuiz.id, payload);
                toast.success(
                    UI_TEXT.createQuizziSetModal.toastSubmitTitle,
                    `${UI_TEXT.createQuizziSetModal.toastSubmitUpdateSuccessPrefix}${result.title}${UI_TEXT.createQuizziSetModal.toastSubmitUpdateSuccessSuffix}`,
                );
            } else {
                result = await createSessionQuiz(payload);
                toast.success(
                    UI_TEXT.createQuizziSetModal.toastSubmitTitle,
                    `${UI_TEXT.createQuizziSetModal.toastSubmitCreateSuccessPrefix}${result.title}${UI_TEXT.createQuizziSetModal.toastSubmitCreateSuccessSuffix}`,
                );
            }

            onSuccess(result);
            onClose();
        } catch (error) {
            console.error("Save quizzi set error:", error);
            toast.error(UI_TEXT.createQuizziSetModal.toastSubmitTitle, UI_TEXT.createQuizziSetModal.toastSubmitErrorDefault);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="w-full max-w-4xl !rounded-[24px]">
                <Dialog className="flex max-h-[90vh] w-full flex-col rounded-[24px] bg-white shadow-2xl outline-none">
                    {/* Header */}
                    <div className="relative flex flex-col border-b border-slate-100 px-6 pt-6 pb-4">
                        <div className="flex items-center gap-3">
                            <Heading slot="title" className="text-xl font-bold text-slate-900">
                                {editQuiz ? UI_TEXT.createQuizziSetModal.titleEdit : UI_TEXT.createQuizziSetModal.titleCreate}
                            </Heading>
                        </div>
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
                    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                        <div className="custom-scrollbar flex flex-1 flex-col gap-5 overflow-y-auto p-6">
                            {/* Section 1: General Info (Tiêu đề & Mô tả lên đầu) */}
                            <div className="flex flex-col gap-4">
                                <Input
                                    label={
                                        <span>
                                            {UI_TEXT.createQuizziSetModal.quizTitleLabel} <span className="font-bold text-red-500">{"*"}</span>
                                        </span>
                                    }
                                    placeholder={UI_TEXT.createQuizziSetModal.quizTitlePlaceholder}
                                    value={title}
                                    onChange={(val) => setTitle(val)}
                                    size="sm"
                                />
                            </div>

                            {/* Section 2: Session Selector */}
                            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                                <label className="mb-3 block text-xs font-bold tracking-wider text-slate-700 uppercase">
                                    {UI_TEXT.createQuizziSetModal.selectSessionTitle} <span className="text-rose-500">{"*"}</span>
                                </label>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-semibold text-slate-600">{UI_TEXT.createQuizziSetModal.selectSystemLabel}</label>
                                        <Select
                                            aria-label={UI_TEXT.createQuizziSetModal.selectSystemLabel}
                                            selectedKey={selectedSystemId || null}
                                            onSelectionChange={(key) => setSelectedSystemId((key as string) || "")}
                                            items={systems.map((sys) => ({
                                                id: sys.id,
                                                label: sys.systemCode ? `${sys.systemCode} - ${sys.name}` : sys.name,
                                            }))}
                                            size="sm"
                                            placeholder={UI_TEXT.createQuizziSetModal.selectSystemDefault}
                                            isClearable={false}
                                        >
                                            {(item) => <Select.Item id={item.id} label={item.label} />}
                                        </Select>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-semibold text-slate-600">{UI_TEXT.createQuizziSetModal.selectCourseLabel}</label>
                                        <Select
                                            aria-label={UI_TEXT.createQuizziSetModal.selectCourseLabel}
                                            selectedKey={selectedCourseId || null}
                                            onSelectionChange={(key) => setSelectedCourseId((key as string) || "")}
                                            items={courses.map((c) => ({
                                                id: c.id,
                                                label: c.code ? `${c.code} - ${c.title}` : c.title,
                                            }))}
                                            size="sm"
                                            placeholder={selectedSystemId ? UI_TEXT.createQuizziSetModal.selectCourseDefault : "Vui lòng chọn Hệ đào tạo trước"}
                                            isDisabled={!selectedSystemId}
                                            isClearable={false}
                                        >
                                            {(item) => <Select.Item id={item.id} label={item.label} />}
                                        </Select>
                                    </div>
                                </div>

                                {/* Sessions list */}
                                <div className="mt-4 flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate-600">{UI_TEXT.createQuizziSetModal.sessionsListHeader}</span>
                                        {sessions.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={handleToggleSelectAllSessions}
                                                className="text-xs font-bold text-purple-600 hover:text-purple-700 hover:underline"
                                            >
                                                {sessions.every((s) => selectedSessionIds.includes(s.id))
                                                    ? UI_TEXT.createQuizziSetModal.deselectAll
                                                    : UI_TEXT.createQuizziSetModal.selectAll}
                                            </button>
                                        )}
                                    </div>

                                    {!selectedCourseId ? (
                                        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-3 text-center text-xs text-slate-400">
                                            {UI_TEXT.createQuizziSetModal.selectCoursePrompt}
                                        </div>
                                    ) : isLoadingSessions ? (
                                        <div className="p-3 text-center text-xs text-slate-500">{UI_TEXT.createQuizziSetModal.loadingSessions}</div>
                                    ) : sessions.length === 0 ? (
                                        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-3 text-center text-xs text-slate-400">
                                            {UI_TEXT.createQuizziSetModal.noSessionsFound}
                                        </div>
                                    ) : (
                                        <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2">
                                            {sessions.map((s) => {
                                                const isChecked = selectedSessionIds.includes(s.id);
                                                return (
                                                    <label
                                                        key={s.id}
                                                        className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition hover:bg-slate-50"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => handleToggleSession(s.id)}
                                                            className="size-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                                        />
                                                        <span className="text-xs font-medium text-slate-700">{s.title}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <TextArea
                                label={UI_TEXT.createQuizziSetModal.descriptionLabel}
                                placeholder={UI_TEXT.createQuizziSetModal.descriptionPlaceholder}
                                value={description}
                                onChange={(val) => setDescription(val)}
                                rows={2}
                            />
                            {/* Section 3: Duration */}
                            <div className="w-full sm:w-1/2">
                                <Input
                                    label={UI_TEXT.createQuizziSetModal.durationLabel}
                                    placeholder={UI_TEXT.createQuizziSetModal.durationPlaceholder}
                                    type="number"
                                    min={0}
                                    value={durationMinutes ? String(durationMinutes) : "0"}
                                    onChange={(val) => setDurationMinutes(Number(val) || 0)}
                                    size="sm"
                                />
                            </div>

                            {/* Section 3: Questions List */}
                            <div className="flex flex-col gap-4 border-t border-slate-100 pt-4">
                                {/* Hidden File Input for Excel Import */}
                                <input ref={fileInputRef} type="file" accept=".xlsx, .xls" onChange={handleImportExcel} className="hidden" />

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <h3 className="text-sm font-bold text-slate-800">
                                        {UI_TEXT.createQuizziSetModal.questionsListHeader}
                                        {questions.length}
                                        {UI_TEXT.createQuizziSetModal.questionsListHeaderClose}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={handleDownloadTemplate}
                                            className="flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100"
                                        >
                                            <Download className="size-3.5" />
                                            {UI_TEXT.createQuizziSetModal.downloadTemplateBtn}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isImporting}
                                            className="flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100 disabled:opacity-50"
                                        >
                                            <Upload className="size-3.5" />
                                            {isImporting ? UI_TEXT.createQuizziSetModal.importingText : UI_TEXT.createQuizziSetModal.importExcelHeader}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleAddQuestion}
                                            className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-700"
                                        >
                                            <Plus className="size-3.5" />
                                            {UI_TEXT.createQuizziSetModal.addQuestionBtn}
                                        </button>
                                    </div>
                                </div>

                                {/* Question Cards */}
                                {questions.map((q, qIndex) => (
                                    <div key={qIndex} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/30 p-4">
                                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                            <span className="text-xs font-extrabold text-slate-800">
                                                {UI_TEXT.createQuizziSetModal.questionTitlePrefix}
                                                {qIndex + 1}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveQuestion(qIndex)}
                                                className="text-rose-500 hover:text-rose-700"
                                                title={UI_TEXT.createQuizziSetModal.questionRemoveTooltip}
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>

                                        {/* Question Content Editor */}
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold text-slate-700">
                                                {UI_TEXT.createQuizziSetModal.questionContentLabel} <span className="text-rose-500">{"*"}</span>
                                            </label>
                                            <TiptapEditor
                                                value={q.content}
                                                onChange={(val) => handleQuestionChange(qIndex, "content", val)}
                                                placeholder={UI_TEXT.createQuizziSetModal.questionContentPlaceholder}
                                            />
                                        </div>

                                        {/* Question Config Grid */}
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[11px] font-bold text-slate-600">{UI_TEXT.createQuizziSetModal.questionTypeLabel}</label>
                                                <Select
                                                    aria-label={UI_TEXT.createQuizziSetModal.questionTypeLabel}
                                                    selectedKey={q.type}
                                                    onSelectionChange={(key) => handleQuestionChange(qIndex, "type", key as QuestionTypeEnum)}
                                                    items={[
                                                        { id: QuestionTypeEnum.SINGLE_CHOICE, label: UI_TEXT.createQuizziSetModal.typeSingleChoice },
                                                        { id: QuestionTypeEnum.MULTIPLE_CHOICE, label: UI_TEXT.createQuizziSetModal.typeMultipleChoice },
                                                    ]}
                                                    size="sm"
                                                    isClearable={false}
                                                >
                                                    {(item) => <Select.Item id={item.id} label={item.label} />}
                                                </Select>
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                <label className="text-[11px] font-bold text-slate-600">{UI_TEXT.createQuizziSetModal.pointsLabel}</label>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    value={String(q.points ?? 1)}
                                                    onChange={(val) => handleQuestionChange(qIndex, "points", Number(val) || 1)}
                                                    size="sm"
                                                />
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                <label className="text-[11px] font-bold text-slate-600">{UI_TEXT.createQuizziSetModal.categoryLabel}</label>
                                                <Select
                                                    aria-label={UI_TEXT.createQuizziSetModal.categoryLabel}
                                                    selectedKey={q.category ?? QuestionCategoryEnum.NONE}
                                                    onSelectionChange={(key) => handleQuestionChange(qIndex, "category", key as QuestionCategoryEnum)}
                                                    items={[
                                                        { id: QuestionCategoryEnum.NONE, label: UI_TEXT.createQuizziSetModal.categoryNone },
                                                        { id: QuestionCategoryEnum.BAI_CU, label: UI_TEXT.createQuizziSetModal.categoryOld },
                                                        { id: QuestionCategoryEnum.BAI_MOI, label: UI_TEXT.createQuizziSetModal.categoryNew },
                                                    ]}
                                                    size="sm"
                                                    isClearable={false}
                                                >
                                                    {(item) => <Select.Item id={item.id} label={item.label} />}
                                                </Select>
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                <label className="text-[11px] font-bold text-slate-600">{UI_TEXT.createQuizziSetModal.difficultyLabel}</label>
                                                <Select
                                                    aria-label={UI_TEXT.createQuizziSetModal.difficultyLabel}
                                                    selectedKey={q.difficulty ?? QuestionDifficultyEnum.EASY}
                                                    onSelectionChange={(key) => handleQuestionChange(qIndex, "difficulty", key as QuestionDifficultyEnum)}
                                                    items={[
                                                        { id: QuestionDifficultyEnum.EASY, label: UI_TEXT.createQuizziSetModal.difficultyEasy },
                                                        { id: QuestionDifficultyEnum.MEDIUM, label: UI_TEXT.createQuizziSetModal.difficultyMedium },
                                                        { id: QuestionDifficultyEnum.HARD, label: UI_TEXT.createQuizziSetModal.difficultyHard },
                                                    ]}
                                                    size="sm"
                                                    isClearable={false}
                                                >
                                                    {(item) => <Select.Item id={item.id} label={item.label} />}
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Options List */}
                                        <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-700">{UI_TEXT.createQuizziSetModal.answersLabel}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddOption(qIndex)}
                                                    className="text-xs font-bold text-purple-600 hover:underline"
                                                >
                                                    {UI_TEXT.createQuizziSetModal.addAnswerBtn}
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                {(q.options || []).map((o, oIndex) => (
                                                    <div key={oIndex} className="flex items-start gap-2 rounded-xl border border-slate-100 bg-white p-2.5">
                                                        <input
                                                            type={q.type === QuestionTypeEnum.SINGLE_CHOICE ? "radio" : "checkbox"}
                                                            name={`q-${qIndex}-correct`}
                                                            checked={o.isCorrect}
                                                            onChange={() => handleOptionCorrectToggle(qIndex, oIndex)}
                                                            className="mt-2.5 size-4 cursor-pointer text-purple-600 accent-purple-600"
                                                        />
                                                        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                                                            <Input
                                                                value={o.content}
                                                                onChange={(val) => handleOptionChange(qIndex, oIndex, "content", val)}
                                                                placeholder={`${UI_TEXT.createQuizziSetModal.answerPlaceholderPrefix}${oIndex + 1}`}
                                                                size="sm"
                                                            />
                                                            <Input
                                                                value={o.explanation || ""}
                                                                onChange={(val) => handleOptionChange(qIndex, oIndex, "explanation", val)}
                                                                placeholder={UI_TEXT.createQuizziSetModal.explanationPlaceholder}
                                                                size="sm"
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveOption(qIndex, oIndex)}
                                                            className="mt-2 text-slate-400 hover:text-rose-500"
                                                        >
                                                            <X className="size-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="grid grid-cols-3 gap-3 rounded-b-[24px] border-t border-slate-100 bg-slate-50/60 p-4">
                            <Button
                                type="button"
                                color="secondary-gray"
                                size="md"
                                onClick={onClose}
                                isDisabled={isSubmitting}
                                className="col-span-1 justify-center"
                            >
                                {UI_TEXT.createQuizziSetModal.btnCancel}
                            </Button>
                            <Button
                                color="primary"
                                size="md"
                                type="submit"
                                isLoading={isSubmitting}
                                className="col-span-2 justify-center border-none bg-purple-600 font-bold text-white hover:bg-purple-700"
                            >
                                {editQuiz ? UI_TEXT.createQuizziSetModal.btnSubmitEdit : UI_TEXT.createQuizziSetModal.btnSubmitCreate}
                            </Button>
                        </div>
                    </form>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
