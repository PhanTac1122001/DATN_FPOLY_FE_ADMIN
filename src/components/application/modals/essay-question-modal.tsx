/* eslint-disable no-restricted-syntax, @typescript-eslint/no-magic-numbers */
"use client";

import { useEffect, useState } from "react";
import { Code2, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { TiptapEditor } from "@/components/base/editor";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { toast } from "@/services/toast.service";
import type { EssayQuestionMock, TestCaseMock } from "@/types/exam-set.types";

export interface EssayQuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (question: EssayQuestionMock) => void;
    question?: EssayQuestionMock | null;
}

const defaultTestCases = (): TestCaseMock[] => [
    { input: "", output: "" },
    { input: "", output: "" },
    { input: "", output: "" },
    { input: "", output: "" },
];

export function EssayQuestionModal({ isOpen, onClose, onSave, question }: EssayQuestionModalProps) {
    const [title, setTitle] = useState("");
    const [language, setLanguage] = useState("");
    const [functionName, setFunctionName] = useState("");
    const [detail, setDetail] = useState("");
    const [templateCode, setTemplateCode] = useState("// Nhập code mẫu cho học viên ở đây...");
    const [testCases, setTestCases] = useState<TestCaseMock[]>(defaultTestCases());

    useEffect(() => {
        if (isOpen) {
            if (question) {
                setTitle(question.title);
                setLanguage(question.language);
                setFunctionName(question.functionName);
                setDetail(question.detail);
                setTemplateCode(question.templateCode);

                // Ensure exactly 4 test cases
                const loadedCases = [...question.testCases];
                while (loadedCases.length < 4) {
                    loadedCases.push({ input: "", output: "" });
                }
                setTestCases(loadedCases);
            } else {
                setTitle("");
                setLanguage("");
                setFunctionName("");
                setDetail("");
                setTemplateCode("// Nhập code mẫu cho học viên ở đây...");
                setTestCases(defaultTestCases());
            }
        }
    }, [isOpen, question]);

    const handleTestCaseChange = (idx: number, field: "input" | "output", val: string) => {
        setTestCases((prev) => prev.map((tc, i) => (i === idx ? { ...tc, [field]: val } : tc)));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            toast.error(UI_TEXT.examsSetsEl.title, "Vui lòng nhập tên câu hỏi");
            return;
        }

        if (!language) {
            toast.error(UI_TEXT.examsSetsEl.title, "Vui lòng chọn ngôn ngữ");
            return;
        }

        if (!functionName.trim()) {
            toast.error(UI_TEXT.examsSetsEl.title, "Vui lòng nhập tên hàm");
            return;
        }

        const validTestCases = testCases.filter((tc) => tc.input.trim() || tc.output.trim());
        if (validTestCases.length === 0) {
            toast.error(UI_TEXT.examsSetsEl.title, "Vui lòng nhập ít nhất 1 test case");
            return;
        }

        const newQuestion: EssayQuestionMock = {
            id: question?.id || `eq_${Date.now()}`,
            title: title.trim(),
            language,
            functionName: functionName.trim(),
            detail: detail.trim(),
            templateCode: templateCode.trim(),
            testCases: testCases.map((tc) => ({
                input: tc.input.trim(),
                output: tc.output.trim(),
            })),
            points: question?.points || 10,
        };

        onSave(newQuestion);
        toast.success(UI_TEXT.examsSetsEl.title, question ? "Đã cập nhật câu hỏi tự luận thành công." : "Đã thêm câu hỏi tự luận mới thành công.");
        onClose();
    };

    const linesCount = templateCode.split("\n").length;
    const lineNumbers = Array.from({ length: Math.max(5, linesCount) }, (_, i) => i + 1);

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="max-w-4xl !overflow-visible !rounded-[24px]">
                <Dialog className="flex max-h-[90vh] w-full flex-col rounded-[24px] bg-white shadow-2xl outline-none">
                    {/* Header */}
                    <div className="relative flex shrink-0 flex-col border-b border-slate-100 px-6 pt-6 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-full border border-rose-100 bg-rose-50/50">
                                <Code2 className="size-5 text-wine" />
                            </div>
                            <div className="flex flex-col">
                                <Heading slot="title" className="text-[16px] leading-snug font-extrabold text-slate-800">
                                    {question ? "Sửa câu hỏi tự luận" : "Thêm câu hỏi tự luận mới"}
                                </Heading>
                            </div>
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

                    {/* Form Body */}
                    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
                        <div className="custom-scrollbar flex flex-1 flex-col gap-5 overflow-y-auto p-6">
                            {/* Title, Language, Function Name Row */}
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-10">
                                <div className="flex flex-col gap-1.5 md:col-span-4">
                                    <label className="text-[12.5px] font-bold text-slate-700">{"Tên câu hỏi *"}</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Ví dụ: Tính tổng hai số"
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13.5px] font-medium text-slate-800 placeholder-slate-400 focus:border-wine focus:ring-1 focus:ring-wine focus:outline-none"
                                        required
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5 md:col-span-3">
                                    <label className="text-[12.5px] font-bold text-slate-700">{"Chọn ngôn ngữ *"}</label>
                                    <select
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13.5px] font-medium text-slate-800 focus:border-wine focus:ring-1 focus:ring-wine focus:outline-none"
                                        required
                                    >
                                        <option value="">{"Chọn ngôn ngữ..."}</option>
                                        <option value="JavaScript">{"JavaScript"}</option>
                                        <option value="Python">{"Python"}</option>
                                        <option value="Java">{"Java"}</option>
                                        <option value="C++">{"C++"}</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1.5 md:col-span-3">
                                    <label className="text-[12.5px] font-bold text-slate-700">{"Tên hàm *"}</label>
                                    <input
                                        type="text"
                                        value={functionName}
                                        onChange={(e) => setFunctionName(e.target.value)}
                                        placeholder="Ví dụ: sum"
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13.5px] font-medium text-slate-800 placeholder-slate-400 focus:border-wine focus:ring-1 focus:ring-wine focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Detail / Rich Editor */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12.5px] font-bold text-slate-700">{"Chi tiết câu hỏi"}</label>
                                <TiptapEditor value={detail} onChange={setDetail} placeholder="Nhập nội dung văn bản..." />
                            </div>

                            {/* Code Template Editor */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[12.5px] font-bold text-slate-700">{"Mã mẫu"}</label>
                                <div className="relative flex overflow-hidden rounded-xl border border-slate-200 bg-[#1e1e1e] font-mono text-sm leading-relaxed text-slate-300">
                                    {/* Line numbers column */}
                                    <div className="flex flex-col border-r border-[#2d2d2d] bg-[#1a1a1a] px-3.5 py-3 text-right font-mono text-[13px] leading-6 text-slate-500 select-none">
                                        {lineNumbers.map((num) => (
                                            <div key={num} className="h-6">
                                                {num}
                                            </div>
                                        ))}
                                    </div>
                                    {/* Textarea column */}
                                    <textarea
                                        value={templateCode}
                                        onChange={(e) => setTemplateCode(e.target.value)}
                                        className="min-h-[120px] w-full resize-none border-none bg-transparent px-4 py-3 font-mono text-[13px] leading-6 text-emerald-400 placeholder-[#4d4d4d] focus:outline-none"
                                        rows={Math.max(5, linesCount)}
                                        style={{ caretColor: "white" }}
                                    />
                                </div>
                            </div>

                            {/* Test Cases */}
                            <div className="flex flex-col gap-2.5">
                                <label className="text-[12.5px] font-bold text-slate-700">{"Các Test Cases đầu vào & đầu ra (Tối đa 4 cases)"}</label>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    {testCases.map((tc, idx) => (
                                        <div key={idx} className="flex flex-col gap-3 rounded-2xl border border-rose-100 bg-rose-50/10 p-4">
                                            <span className="text-[10px] font-extrabold tracking-wider text-rose-600 uppercase">{`TEST CASE ${idx + 1}`}</span>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[11px] font-medium text-slate-500">{"Dữ liệu đầu vào:"}</label>
                                                <input
                                                    type="text"
                                                    value={tc.input}
                                                    onChange={(e) => handleTestCaseChange(idx, "input", e.target.value)}
                                                    placeholder="Nhập input"
                                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:border-wine focus:ring-1 focus:ring-wine focus:outline-none"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-[11px] font-medium text-slate-500">{"Kết quả mong đợi:"}</label>
                                                <input
                                                    type="text"
                                                    value={tc.output}
                                                    onChange={(e) => handleTestCaseChange(idx, "output", e.target.value)}
                                                    placeholder="Nhập output"
                                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:border-wine focus:ring-1 focus:ring-wine focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer Controls & Actions */}
                        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/20 px-6 py-4.5">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                            >
                                {"Hủy bỏ"}
                            </button>
                            <button
                                type="submit"
                                className="rounded-xl bg-wine px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-wine/10 transition hover:bg-wine-deep"
                            >
                                {"Lưu câu hỏi"}
                            </button>
                        </div>
                    </form>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
