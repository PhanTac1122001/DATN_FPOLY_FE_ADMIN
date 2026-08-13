"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, FileUp, Loader2, Plus, Save, X } from "lucide-react";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { CHATBOT_UPLOAD_ACCEPT, CHATBOT_UPLOAD_EXTENSIONS, CHATBOT_UPLOAD_MAX_BYTES } from "@/constants/chatbot.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { createProcessDocument, extractProcessDocument, updateProcessDocument } from "@/services/chatbot.service";
import { toast } from "@/services/toast.service";
import type { ProcessDocumentModalProps } from "@/types/chatbot.types";

const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 transition outline-none focus:border-wine focus:ring-1 focus:ring-wine disabled:bg-slate-100 disabled:text-slate-500";
const areaClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 transition outline-none focus:border-wine focus:ring-1 focus:ring-wine";
const labelClass = "text-xs font-extrabold text-slate-700";

export function ProcessDocumentModal({ isOpen, onClose, onSuccess, editingDocument }: ProcessDocumentModalProps) {
    const t = UI_TEXT.chatbot;
    const isEdit = !!editingDocument;

    const [code, setCode] = useState("");
    const [title, setTitle] = useState("");
    const [summary, setSummary] = useState("");
    const [keywords, setKeywords] = useState<string[]>([]);
    const [keywordInput, setKeywordInput] = useState("");
    const [content, setContent] = useState("");
    const [department, setDepartment] = useState("");
    const [contactInfo, setContactInfo] = useState("");
    const [answerGuidance, setAnswerGuidance] = useState("");
    const [isActive, setIsActive] = useState(true);

    const [submitting, setSubmitting] = useState(false);
    const [extracting, setExtracting] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        setError("");
        setKeywordInput("");
        if (editingDocument) {
            setCode(editingDocument.code || "");
            setTitle(editingDocument.title || "");
            setSummary(editingDocument.summary || "");
            setKeywords(editingDocument.keywords || []);
            setContent(editingDocument.content || "");
            setDepartment(editingDocument.department || "");
            setContactInfo(editingDocument.contactInfo || "");
            setAnswerGuidance(editingDocument.answerGuidance || "");
            setIsActive(editingDocument.isActive ?? true);
        } else {
            setCode("");
            setTitle("");
            setSummary("");
            setKeywords([]);
            setContent("");
            setDepartment("");
            setContactInfo("");
            setAnswerGuidance("");
            setIsActive(true);
        }
    }, [isOpen, editingDocument]);

    const addKeyword = () => {
        const val = keywordInput.trim();
        if (val && !keywords.includes(val)) {
            setKeywords((prev) => [...prev, val]);
        }
        setKeywordInput("");
    };

    const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addKeyword();
        }
    };

    const removeKeyword = (kw: string) => {
        setKeywords((prev) => prev.filter((k) => k !== kw));
    };

    const resetFileInput = () => {
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setError("");
        const lower = file.name.toLowerCase();
        if (!CHATBOT_UPLOAD_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
            setError(t.errorFileType);
            resetFileInput();
            return;
        }
        if (file.size > CHATBOT_UPLOAD_MAX_BYTES) {
            setError(t.errorFileTooLarge);
            resetFileInput();
            return;
        }
        try {
            setExtracting(true);
            const result = await extractProcessDocument(file);
            setContent(result.content);
            if (!title.trim() && result.title) setTitle(result.title);
            toast.success(UI_TEXT.common.successTitle, t.toastExtractSuccess);
        } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : UI_TEXT.common.genericError;
            setError(errMsg);
            toast.error(UI_TEXT.common.errorTitle, errMsg);
        } finally {
            setExtracting(false);
            resetFileInput();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if ((!isEdit && !code.trim()) || !title.trim() || !content.trim()) {
            setError(t.requiredError);
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                title: title.trim(),
                summary: summary.trim() || undefined,
                keywords,
                content: content.trim(),
                department: department.trim() || undefined,
                contactInfo: contactInfo.trim() || undefined,
                answerGuidance: answerGuidance.trim() || undefined,
                isActive,
            };

            if (isEdit && editingDocument) {
                await updateProcessDocument(editingDocument._id, payload);
                toast.success(UI_TEXT.common.successTitle, t.toastUpdateDocSuccess);
            } else {
                await createProcessDocument({ ...payload, code: code.trim().toUpperCase() });
                toast.success(UI_TEXT.common.successTitle, t.toastCreateDocSuccess);
            }

            onSuccess();
            onClose();
        } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : UI_TEXT.common.genericError;
            setError(errMsg);
            toast.error(UI_TEXT.common.errorTitle, errMsg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="w-full max-w-2xl overflow-hidden !rounded-[24px]">
                <Dialog className="flex max-h-[88vh] flex-col outline-none">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-wine">
                                <FileText className="size-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-extrabold text-slate-900">{isEdit ? t.editDocTitle : t.createDocTitle}</h2>
                                <p className="text-xs font-semibold text-slate-400">{t.docModalSubtitle}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
                            {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-600">{error}</div>}

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-extrabold text-slate-700">
                                        {t.fieldCode} {!isEdit && <span className="text-rose-500">{t.asterisk}</span>}
                                    </label>
                                    <input
                                        type="text"
                                        disabled={isEdit}
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder={t.placeholderCode}
                                        className={`${inputClass} uppercase`}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-extrabold text-slate-700">
                                        {t.fieldTitle} <span className="text-rose-500">{t.asterisk}</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder={t.placeholderTitle}
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className={labelClass}>{t.fieldSummary}</label>
                                <input
                                    type="text"
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    placeholder={t.placeholderSummary}
                                    className={inputClass}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className={labelClass}>{t.fieldKeywords}</label>
                                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 focus-within:border-wine focus-within:ring-1 focus-within:ring-wine">
                                    {keywords.map((kw) => (
                                        <span key={kw} className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-wine">
                                            {kw}
                                            <button type="button" onClick={() => removeKeyword(kw)} className="cursor-pointer text-wine/60 hover:text-wine">
                                                <X className="size-3" />
                                            </button>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        value={keywordInput}
                                        onChange={(e) => setKeywordInput(e.target.value)}
                                        onKeyDown={handleKeywordKeyDown}
                                        onBlur={addKeyword}
                                        placeholder={t.placeholderKeywords}
                                        className="min-w-[140px] flex-1 bg-transparent px-1.5 py-1 text-xs font-bold text-slate-800 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between gap-2">
                                    <label className="text-xs font-extrabold text-slate-700">
                                        {t.fieldContent} <span className="text-rose-500">{t.asterisk}</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={extracting}
                                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-wine/30 bg-amber-50 px-3 py-1.5 text-xs font-bold text-wine transition hover:bg-amber-100 disabled:opacity-50"
                                    >
                                        {extracting ? <Loader2 className="size-3.5 animate-spin" /> : <FileUp className="size-3.5" />}
                                        <span>{extracting ? t.extracting : t.uploadFile}</span>
                                    </button>
                                    <input ref={fileInputRef} type="file" accept={CHATBOT_UPLOAD_ACCEPT} onChange={handleFileChange} className="hidden" />
                                </div>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder={t.placeholderContent}
                                    rows={7}
                                    className={`${areaClass} font-mono`}
                                />
                                <p className="text-[11px] font-medium text-slate-400">{t.uploadHint}</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="flex flex-col gap-1.5">
                                    <label className={labelClass}>{t.fieldDepartment}</label>
                                    <input
                                        type="text"
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        placeholder={t.placeholderDepartment}
                                        className={inputClass}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className={labelClass}>{t.fieldContactInfo}</label>
                                    <input
                                        type="text"
                                        value={contactInfo}
                                        onChange={(e) => setContactInfo(e.target.value)}
                                        placeholder={t.placeholderContactInfo}
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className={labelClass}>{t.fieldAnswerGuidance}</label>
                                <input
                                    type="text"
                                    value={answerGuidance}
                                    onChange={(e) => setAnswerGuidance(e.target.value)}
                                    placeholder={t.placeholderAnswerGuidance}
                                    className={inputClass}
                                />
                            </div>

                            <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5">
                                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="size-4 accent-wine" />
                                <span className="text-xs font-bold text-slate-700">{t.fieldActive}</span>
                            </label>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="cursor-pointer rounded-full border border-slate-200 px-5 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
                            >
                                {UI_TEXT.common.cancel}
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-wine px-6 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-wine/90 disabled:opacity-50"
                            >
                                {submitting ? (
                                    <Loader2 className="size-3.5 animate-spin" />
                                ) : isEdit ? (
                                    <Save className="size-3.5" />
                                ) : (
                                    <Plus className="size-3.5" />
                                )}
                                <span>{isEdit ? UI_TEXT.common.save : t.addDocument}</span>
                            </button>
                        </div>
                    </form>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
