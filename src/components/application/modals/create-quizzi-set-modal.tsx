"use client";

import { useEffect, useRef, useState } from "react";
import { Download, HelpCircle, Plus, Trash2, Upload, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { TiptapEditor } from "@/components/base/editor";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { getCoursesList } from "@/services/course.service";
import { createSessionQuiz, downloadExcelTemplate, importExcelQuestions, updateSessionQuiz } from "@/services/session-quiz.service";
import { getSystemsList } from "@/services/system.service";
import { toast } from "@/services/toast.service";
import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type { CourseItem } from "@/types/course.types";
import type { QuestionCategory, QuestionDifficulty, QuestionType, SessionQuizItem, SessionQuizOption, SessionQuizQuestion } from "@/types/session-quiz.types";
import type { System } from "@/types/system.types";

interface SessionInfo {
    id: string;
    title: string;
    description?: string;
    position?: number;
}

interface CreateQuizziSetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (item: SessionQuizItem) => void;
    editQuiz?: SessionQuizItem | null;
}

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

    // Load initial dropdowns
    useEffect(() => {
        if (isOpen) {
            void getSystemsList().then(setSystems);
            void getCoursesList().then(setCourses);
        }
    }, [isOpen]);

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
                const res = await httpClient<any>(`/staff/sessions/course/${selectedCourseId}`, { method: HttpMethod.GET });
                const list = Array.isArray(res) ? res : res?.data || [];
                const mapped: SessionInfo[] = list.map((s: any) => ({
                    id: String(s.id || s._id),
                    title: s.title || s.name || `Session ${s.position || ""}`,
                    position: s.position,
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
        setSelectedSessionIds((prev) =>
            prev.includes(sessionId) ? prev.filter((id) => id !== sessionId) : [...prev, sessionId]
        );
    };

    // Question operations
    const handleAddQuestion = () => {
        const newQuestion: SessionQuizQuestion = {
            content: "",
            type: "SINGLE_CHOICE",
            points: 1,
            category: "NONE",
            difficulty: "EASY",
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

    const handleQuestionChange = (index: number, field: keyof SessionQuizQuestion, value: any) => {
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

    const handleOptionChange = (qIndex: number, oIndex: number, field: keyof SessionQuizOption, value: any) => {
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
            const isSingle = q.type === "SINGLE_CHOICE";
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
            toast.success("Tải template", "Đã tải file Excel mẫu thành công");
        } catch (error) {
            toast.error("Tải template", "Không thể tải file mẫu Excel");
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
                toast.success("Import Excel", `Đã import thành công ${res.totalImported} câu hỏi`);
            } else {
                toast.error("Import Excel", "Không tìm thấy câu hỏi hợp lệ trong file Excel");
            }
        } catch (error: any) {
            console.error("Import error:", error);
            toast.error("Import Excel", error?.message || "Lỗi khi import file Excel");
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    // Form Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error("Quizzi Set", "Vui lòng nhập tiêu đề Quiz");
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
                toast.success("Quizzi Set", `Đã cập nhật bộ đề "${result.title}"`);
            } else {
                result = await createSessionQuiz(payload);
                toast.success("Quizzi Set", `Đã tạo bộ đề "${result.title}" thành công`);
            }

            onSuccess(result);
            onClose();
        } catch (error) {
            console.error("Save quizzi set error:", error);
            toast.error("Quizzi Set", "Đã có lỗi xảy ra khi lưu bộ đề");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="max-w-4xl !rounded-[24px] max-h-[90vh] overflow-y-auto">
                <Dialog className="flex flex-col rounded-[24px] bg-white shadow-2xl outline-none">
                    {/* Header */}
                    <div className="relative flex shrink-0 items-center justify-between border-b border-slate-100 px-6 pt-6 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-full border border-purple-100 bg-purple-50">
                                <HelpCircle className="size-5 text-purple-600" />
                            </div>
                            <Heading slot="title" className="text-lg font-extrabold text-slate-800">
                                {editQuiz ? "Chỉnh Sửa Quizzi Set" : "Tạo Quiz Mới"}
                            </Heading>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Form Body */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
                        {/* Section 1: Session Selector */}
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                            <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-slate-700">
                                Chọn Session <span className="text-rose-500">*</span>
                            </label>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-slate-600">Chọn Hệ đào tạo</label>
                                    <select
                                        value={selectedSystemId}
                                        onChange={(e) => setSelectedSystemId(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-purple-500 focus:outline-none"
                                    >
                                        <option value="">-- Chọn Hệ đào tạo --</option>
                                        {systems.map((sys) => (
                                            <option key={sys.id} value={sys.id}>
                                                {sys.systemCode ? `${sys.systemCode} - ` : ""}{sys.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-slate-600">Chọn Môn học</label>
                                    <select
                                        value={selectedCourseId}
                                        onChange={(e) => setSelectedCourseId(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-purple-500 focus:outline-none"
                                    >
                                        <option value="">-- Chọn Môn học --</option>
                                        {courses.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.code ? `${c.code} - ` : ""}{c.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Sessions list */}
                            <div className="mt-4 flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate-600">Danh sách Sessions</span>
                                    <span className="text-xs font-bold text-purple-600">
                                        Sessions đã chọn: {selectedSessionIds.length}
                                    </span>
                                </div>

                                {!selectedCourseId ? (
                                    <div className="rounded-xl border border-dashed border-slate-200 bg-white p-3 text-center text-xs text-slate-400">
                                        Vui lòng chọn Môn học để hiển thị danh sách Sessions
                                    </div>
                                ) : isLoadingSessions ? (
                                    <div className="p-3 text-center text-xs text-slate-500">Đang tải danh sách sessions...</div>
                                ) : sessions.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-slate-200 bg-white p-3 text-center text-xs text-slate-400">
                                        Không có session nào thuộc môn học này
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

                        {/* Section 2: General Info */}
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-700">
                                    Tiêu đề Quiz <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Nhập tiêu đề quiz"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-purple-500 focus:outline-none"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-700">Mô tả</label>
                                <textarea
                                    rows={2}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Nhập mô tả quiz"
                                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-purple-500 focus:outline-none"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-700">Thời gian làm bài (phút)</label>
                                <input
                                    type="number"
                                    min={0}
                                    value={durationMinutes}
                                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                                    placeholder="Ví dụ: 5 (5 phút)"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-medium text-slate-800 focus:border-purple-500 focus:outline-none sm:w-1/2"
                                />
                            </div>
                        </div>

                        {/* Section 3: Questions List */}
                        <div className="flex flex-col gap-4 border-t border-slate-100 pt-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <h3 className="text-sm font-bold text-slate-800">Danh sách câu hỏi ({questions.length})</h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleDownloadTemplate}
                                        className="flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100"
                                    >
                                        <Download className="size-3.5" />
                                        Tải file excel mẫu
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleAddQuestion}
                                        className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-700"
                                    >
                                        <Plus className="size-3.5" />
                                        Thêm câu hỏi
                                    </button>
                                </div>
                            </div>

                            {/* Excel Import Box */}
                            <div className="rounded-2xl border border-dashed border-purple-200 bg-purple-50/30 p-4">
                                <span className="text-xs font-bold text-purple-900">📥 Import câu hỏi từ Excel</span>
                                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".xlsx, .xls"
                                        onChange={handleImportExcel}
                                        className="text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-purple-100 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-purple-700 hover:file:bg-purple-200"
                                    />
                                    {isImporting && <span className="text-xs font-semibold text-purple-600">Đang import...</span>}
                                </div>
                                <p className="mt-2 text-[11px] text-slate-500">
                                    File Excel có thể có các cột: <code>question_content</code>, <code>answer_1</code>, <code>answer_2</code>, <code>answer_3</code>, <code>answer_4</code>, <code>isCorrect</code>, <code>difficulty</code>, <code>category</code>.
                                </p>
                            </div>

                            {/* Question Cards */}
                            {questions.map((q, qIndex) => (
                                <div key={qIndex} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/30 p-4">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                        <span className="text-xs font-extrabold text-slate-800">Câu hỏi {qIndex + 1}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveQuestion(qIndex)}
                                            className="text-rose-500 hover:text-rose-700"
                                            title="Xóa câu hỏi này"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>

                                    {/* Question Content Editor */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-slate-700">
                                            Nội dung câu hỏi <span className="text-rose-500">*</span>
                                        </label>
                                        <TiptapEditor
                                            value={q.content}
                                            onChange={(val) => handleQuestionChange(qIndex, "content", val)}
                                            placeholder="Nhập nội dung văn bản..."
                                        />
                                    </div>

                                    {/* Question Config Grid */}
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-[11px] font-bold text-slate-600">Loại câu hỏi</label>
                                            <select
                                                value={q.type}
                                                onChange={(e) => handleQuestionChange(qIndex, "type", e.target.value as QuestionType)}
                                                className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800"
                                            >
                                                <option value="SINGLE_CHOICE">Một đáp án đúng</option>
                                                <option value="MULTIPLE_CHOICE">Nhiều đáp án đúng</option>
                                            </select>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <label className="text-[11px] font-bold text-slate-600">Điểm</label>
                                            <input
                                                type="number"
                                                min={1}
                                                value={q.points ?? 1}
                                                onChange={(e) => handleQuestionChange(qIndex, "points", Number(e.target.value))}
                                                className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <label className="text-[11px] font-bold text-slate-600">Phân loại (Pre-quiz)</label>
                                            <select
                                                value={q.category ?? "NONE"}
                                                onChange={(e) => handleQuestionChange(qIndex, "category", e.target.value as QuestionCategory)}
                                                className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800"
                                            >
                                                <option value="NONE">Không phân loại</option>
                                                <option value="BAI_CU">BÀI CỦ</option>
                                                <option value="BAI_MOI">BÀI MỚI</option>
                                            </select>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <label className="text-[11px] font-bold text-slate-600">Độ khó</label>
                                            <select
                                                value={q.difficulty ?? "EASY"}
                                                onChange={(e) => handleQuestionChange(qIndex, "difficulty", e.target.value as QuestionDifficulty)}
                                                className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800"
                                            >
                                                <option value="EASY">⭐ Dễ (EASY)</option>
                                                <option value="MEDIUM">⭐ Trung bình (MEDIUM)</option>
                                                <option value="HARD">⭐ Khó (HARD)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Options List */}
                                    <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-700">Đáp án</span>
                                            <button
                                                type="button"
                                                onClick={() => handleAddOption(qIndex)}
                                                className="text-xs font-bold text-purple-600 hover:underline"
                                            >
                                                + Thêm đáp án
                                            </button>
                                        </div>

                                        {(q.options || []).map((o, oIndex) => (
                                            <div key={oIndex} className="flex items-start gap-2 rounded-xl border border-slate-100 bg-white p-2.5">
                                                <input
                                                    type={q.type === "SINGLE_CHOICE" ? "radio" : "checkbox"}
                                                    name={`q-${qIndex}-correct`}
                                                    checked={o.isCorrect}
                                                    onChange={() => handleOptionCorrectToggle(qIndex, oIndex)}
                                                    className="mt-2.5 size-4 cursor-pointer text-purple-600"
                                                />
                                                <div className="flex flex-1 flex-col gap-1.5">
                                                    <input
                                                        type="text"
                                                        value={o.content}
                                                        onChange={(e) => handleOptionChange(qIndex, oIndex, "content", e.target.value)}
                                                        placeholder={`Đáp án ${oIndex + 1}`}
                                                        className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-purple-500 focus:outline-none"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={o.explanation || ""}
                                                        onChange={(e) => handleOptionChange(qIndex, oIndex, "explanation", e.target.value)}
                                                        placeholder="Giải thích (tuỳ chọn)"
                                                        className="w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-slate-600 focus:border-purple-500 focus:outline-none"
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
                            ))}
                        </div>

                        {/* Footer Controls */}
                        <div className="mt-4 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-600/10 hover:bg-purple-700 disabled:opacity-50"
                            >
                                {isSubmitting ? "Đang xử lý..." : editQuiz ? "Lưu thay đổi" : "Tạo mới"}
                            </button>
                        </div>
                    </form>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
