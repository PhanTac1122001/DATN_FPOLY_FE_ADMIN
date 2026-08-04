"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
    Check,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    File,
    FileCode,
    FileText,
    Folder,
    HelpCircle,
    Image as ImageIcon,
    Pencil,
    Plus,
    Trash2,
} from "lucide-react";
import { ReadingQuestionModal } from "@/components/application/modals/reading-question-modal";
import { TiptapEditor } from "@/components/base/editor";
import { UI_TEXT } from "@/constants/ui-text.constants";
import type { ReadingConfigTabProps, ReadingQuestion } from "@/types/material.types";
import { cx } from "@/utils/cx";
import { LinkPdfModal, SelectPdfSourceModal } from "../modals/select-pdf-source-modal";

export function ReadingConfigTab({
    readingSubTab: propReadingSubTab,
    setReadingSubTab: propSetReadingSubTab,
    content,
    setContent,
    file,
    setFile,
    htmlFiles,
    setHtmlFiles,
    pdfUrl,
    setPdfUrl,
    questions = [],
    setQuestions,
    savedPdf,
    savedHtmlUrl,
    onClearSavedMedia,
    onDelete: _onDelete,
    onRegisterOpenModal,
    onRegisterAddQuestionModal,
}: ReadingConfigTabProps) {
    const [internalSubTab, setInternalSubTab] = useState<"document" | "questions">("document");
    const readingSubTab = propReadingSubTab ?? internalSubTab;
    const _setReadingSubTab = propSetReadingSubTab ?? setInternalSubTab;

    const [overrideReadingType, setOverrideReadingType] = useState<"pdf" | "html" | "text" | null>(null);

    const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);

    // Active Preview File & Accordion State for HTML folder preview
    const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
    const [isFileListOpen, setIsFileListOpen] = useState<boolean>(false);

    useEffect(() => {
        if (onRegisterOpenModal) {
            onRegisterOpenModal(() => setIsSelectModalOpen(true));
        }
    }, [onRegisterOpenModal]);

    // Reading Questions Modal state
    const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<ReadingQuestion | null>(null);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const handleOpenAddQuestion = useCallback(() => {
        setEditingQuestion(null);
        setEditingIndex(null);
        setIsQuestionModalOpen(true);
    }, []);

    useEffect(() => {
        if (onRegisterAddQuestionModal) {
            onRegisterAddQuestionModal(handleOpenAddQuestion);
        }
    }, [onRegisterAddQuestionModal, handleOpenAddQuestion]);

    useEffect(() => {
        if (htmlFiles.length > 0) {
            const entryIdx = htmlFiles.findIndex((f) => f.name.toLowerCase().endsWith(".html") || f.name.toLowerCase().endsWith(".htm"));
            setActiveFileIndex(entryIdx >= 0 ? entryIdx : 0);
        }
    }, [htmlFiles]);

    const computeReadingType = (): "pdf" | "html" | "text" | "" => {
        if (overrideReadingType) return overrideReadingType;
        if (savedHtmlUrl || htmlFiles.length > 0 || content === "Tài liệu HTML") return "html";
        const rawFileName = file?.name?.toLowerCase() || savedPdf?.toLowerCase() || pdfUrl?.toLowerCase() || "";
        const fileName = rawFileName.split("?")[0];
        if (fileName.endsWith(".html") || fileName.endsWith(".htm")) return "html";
        if (file || savedPdf || pdfUrl) return "pdf";
        if (content && content !== "Tài liệu PDF" && content !== "Tài liệu HTML" && content !== "Tài liệu bài đọc") return "text";
        return "";
    };

    const readingType = computeReadingType();

    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [tempLink, setTempLink] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const htmlFileInputRef = useRef<HTMLInputElement>(null);

    const mainHtmlFileIndex = htmlFiles.findIndex((f) => f.name.toLowerCase().endsWith(".html") || f.name.toLowerCase().endsWith(".htm"));
    const mainHtmlFile = htmlFiles[mainHtmlFileIndex >= 0 ? mainHtmlFileIndex : 0] || htmlFiles[0];
    const activePreviewFile = htmlFiles[activeFileIndex] || mainHtmlFile;

    const getFilePath = (f: File) => {
        return f.webkitRelativePath || f.name;
    };

    const getFileTypeIcon = (filename: string) => {
        const lower = filename.toLowerCase();
        if (lower.endsWith(".html") || lower.endsWith(".htm")) return <FileCode className="size-4 shrink-0 text-blue-600" />;
        if (/\.(png|jpe?g|gif|webp|svg)$/i.test(lower)) return <ImageIcon className="size-4 shrink-0 text-emerald-600" />;
        return <File className="size-4 shrink-0 text-slate-500" />;
    };

    const handleOpenEditQuestion = (q: ReadingQuestion, index: number) => {
        setEditingQuestion(q);
        setEditingIndex(index);
        setIsQuestionModalOpen(true);
    };

    const handleSaveQuestion = (q: ReadingQuestion) => {
        if (editingIndex !== null) {
            const updated = [...questions];
            updated[editingIndex] = q;
            setQuestions?.(updated);
        } else {
            setQuestions?.([...questions, q]);
        }
    };

    const handleDeleteQuestion = (index: number) => {
        const updated = questions.filter((_, i) => i !== index);
        setQuestions?.(updated);
    };

    const stripHtml = (htmlStr: string) => {
        if (!htmlStr) return "";
        return htmlStr
            .replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    };

    const getQuestionText = (q: unknown) => {
        if (!q) return "";
        const qObj = q as Record<string, unknown>;
        const val = qObj.content ?? qObj.question ?? qObj.title ?? qObj.text ?? qObj.questionText ?? qObj.name ?? "";
        return stripHtml(typeof val === "string" ? val : String(val));
    };

    const getAnswerText = (q: unknown) => {
        if (!q) return "";
        const qObj = q as Record<string, unknown>;
        const val = qObj.answer ?? qObj.answerText ?? qObj.solution ?? qObj.explanation ?? "";
        return stripHtml(typeof val === "string" ? val : String(val));
    };

    return (
        <div className="flex min-h-0 w-full flex-1 flex-col gap-4">
            {/* TAB 1: Document View */}
            {readingSubTab === "document" && (
                <div className="relative flex min-h-0 w-full flex-1 flex-col gap-3 pb-2">
                    {readingType !== "" && (
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-slate-500">{UI_TEXT.readingConfigTab.readingContentLabel}</label>
                        </div>
                    )}
                    {readingType === "pdf" && (file || savedPdf || pdfUrl) ? (
                        /* PDF File chosen display & Preview */
                        <div className="animate-fadeIn flex w-full flex-col gap-3">
                            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50 p-4">
                                <div className="flex min-w-0 items-center gap-2.5">
                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                                        <FileText className="size-4" />
                                    </span>
                                    <div className="flex min-w-0 flex-col">
                                        <span className="line-clamp-1 text-xs font-bold text-slate-800">
                                            {file
                                                ? file.name
                                                : pdfUrl
                                                  ? pdfUrl.split("?")[0].split("/").pop()
                                                  : savedPdf
                                                    ? savedPdf.split("?")[0].split("/").pop()
                                                    : UI_TEXT.readingConfigTab.defaultMaterialFile}
                                        </span>
                                        <span className="text-[10px] font-medium text-slate-400">{UI_TEXT.readingConfigTab.pdfMaterialFile}</span>
                                    </div>
                                </div>
                                {(file || pdfUrl || savedPdf) && (
                                    <a
                                        href={file ? URL.createObjectURL(file) : pdfUrl || savedPdf}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 shadow-2xs transition hover:bg-red-100"
                                        title={UI_TEXT.readingConfigTab.pdfTooltip}
                                    >
                                        <ExternalLink className="size-3.5" />
                                        <span>{UI_TEXT.readingConfigTab.viewLink}</span>
                                    </a>
                                )}
                            </div>

                            {/* PDF Content Preview */}
                            <div className="h-[550px] w-full shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <iframe
                                    src={file ? URL.createObjectURL(file) : pdfUrl || savedPdf}
                                    className="h-full w-full border-none"
                                    title={UI_TEXT.learningMaterials.pdfPreviewTitle}
                                />
                            </div>
                        </div>
                    ) : readingType === "html" ? (
                        /* HTML Folder chosen display & Interactive Preview */
                        <div className="animate-fadeIn flex w-full flex-col gap-3">
                            <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-slate-50 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-2.5">
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                                            <Folder className="size-5" />
                                        </span>
                                        <div className="flex min-w-0 flex-col">
                                            <span className="line-clamp-1 text-xs font-bold text-slate-800">
                                                {htmlFiles.length > 0
                                                    ? `${(htmlFiles[0] as File & { webkitRelativePath?: string })?.webkitRelativePath?.split("/")[0] || mainHtmlFile?.name || UI_TEXT.readingConfigTab.htmlFolderDefault} (${htmlFiles.length} ${UI_TEXT.readingConfigTab.filesSuffix})`
                                                    : savedHtmlUrl
                                                      ? savedHtmlUrl.split("?")[0].split("/").pop()
                                                      : UI_TEXT.readingConfigTab.htmlFolderMaterial}
                                            </span>
                                            <span className="truncate text-[10px] font-medium text-slate-400">
                                                {UI_TEXT.readingConfigTab.htmlReadingS3}{" "}
                                                {activePreviewFile ? `• ${UI_TEXT.readingConfigTab.viewingPrefix} ${getFilePath(activePreviewFile)}` : ""}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-2">
                                        {(htmlFiles.length > 0 && activePreviewFile
                                            ? URL.createObjectURL(activePreviewFile)
                                            : savedHtmlUrl || (file ? URL.createObjectURL(file) : pdfUrl)) && (
                                            <a
                                                href={
                                                    htmlFiles.length > 0 && activePreviewFile
                                                        ? URL.createObjectURL(activePreviewFile)
                                                        : savedHtmlUrl || (file ? URL.createObjectURL(file) : pdfUrl)
                                                }
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 shadow-2xs transition hover:bg-blue-100"
                                                title={UI_TEXT.readingConfigTab.htmlTooltip}
                                            >
                                                <ExternalLink className="size-3.5" />
                                                <span>{UI_TEXT.readingConfigTab.viewLink}</span>
                                            </a>
                                        )}
                                        {htmlFiles.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setIsFileListOpen(!isFileListOpen)}
                                                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
                                            >
                                                <span>
                                                    {UI_TEXT.readingConfigTab.fileListPrefix}
                                                    {htmlFiles.length}
                                                    {")"}
                                                </span>
                                                {isFileListOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Accordion Collapsible File List */}
                                {htmlFiles.length > 0 && isFileListOpen && (
                                    <div className="flex max-h-60 flex-col gap-1.5 overflow-y-auto border-t border-slate-200/70 pt-3 pr-1">
                                        <span className="mb-1 text-[11px] font-semibold text-slate-500">{UI_TEXT.learningMaterials.listFilesInDir}</span>
                                        {htmlFiles.map((f, idx) => {
                                            const filePath = getFilePath(f);
                                            const isMain = idx === (mainHtmlFileIndex >= 0 ? mainHtmlFileIndex : 0);
                                            const isActive = idx === activeFileIndex;

                                            return (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => setActiveFileIndex(idx)}
                                                    className={cx(
                                                        "flex cursor-pointer items-center justify-between rounded-lg border p-2 text-left text-xs transition",
                                                        isActive
                                                            ? "border-blue-300 bg-blue-50/80 font-bold text-blue-900 shadow-2xs"
                                                            : "border-slate-100 bg-white text-slate-700 hover:border-slate-300",
                                                    )}
                                                >
                                                    <div className="flex min-w-0 flex-1 items-center gap-2 pr-2">
                                                        {getFileTypeIcon(f.name)}
                                                        <span className="truncate font-mono text-[11px]">{filePath}</span>
                                                    </div>
                                                    <div className="flex shrink-0 items-center gap-1.5">
                                                        {isMain && (
                                                            <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-black text-white">
                                                                {UI_TEXT.learningMaterials.mainPage}
                                                            </span>
                                                        )}
                                                        {isActive && (
                                                            <span className="flex items-center gap-0.5 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
                                                                <Check className="size-3" /> {UI_TEXT.learningMaterials.viewing}
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* HTML Content Preview */}
                            <div className="relative flex h-[550px] w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                {htmlFiles.length > 0 && activePreviewFile ? (
                                    activePreviewFile.type.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg)$/i.test(activePreviewFile.name) ? (
                                        <div className="flex h-full w-full items-center justify-center bg-slate-900/5 p-4">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={URL.createObjectURL(activePreviewFile)}
                                                alt={activePreviewFile.name}
                                                className="max-h-full max-w-full rounded-lg object-contain shadow"
                                            />
                                        </div>
                                    ) : (
                                        <iframe
                                            src={URL.createObjectURL(activePreviewFile)}
                                            className="h-full w-full border-none"
                                            title={UI_TEXT.learningMaterials.previewTitle}
                                            sandbox="allow-scripts allow-popups"
                                        />
                                    )
                                ) : (
                                    <iframe
                                        src={savedHtmlUrl || (file ? URL.createObjectURL(file) : pdfUrl)}
                                        className="h-full w-full border-none"
                                        title={UI_TEXT.learningMaterials.previewTitle}
                                        sandbox="allow-scripts allow-popups"
                                    />
                                )}
                            </div>
                        </div>
                    ) : readingType === "text" ? (
                        /* Rich Text Content display */
                        <div className="flex w-full flex-col gap-2">
                            <div className="flex w-full flex-col gap-1.5">
                                <TiptapEditor
                                    value={content}
                                    onChange={setContent}
                                    placeholder={UI_TEXT.learningMaterials.editorPlaceholder}
                                    className="min-h-[350px] w-full overflow-hidden rounded-lg border border-slate-200 bg-white"
                                />
                            </div>
                        </div>
                    ) : (
                        /* Centered Empty State View for Reading - Full Border & Height */
                        <div className="animate-fadeIn flex min-h-[420px] w-full flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/30 p-8 py-16 text-center">
                            <div className="flex size-16 items-center justify-center rounded-full border-2 border-dashed border-slate-200 bg-white text-slate-400">
                                <FileText className="size-6 text-slate-400" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <h4 className="text-sm font-black text-slate-800">{UI_TEXT.learningMaterials.emptyReadingTitle}</h4>
                                <p className="max-w-[320px] text-xs leading-relaxed font-medium text-slate-400">{UI_TEXT.learningMaterials.emptyReadingDesc}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsSelectModalOpen(true)}
                                className="hover:bg-wine-hover flex cursor-pointer items-center gap-1.5 rounded-full bg-wine px-6 py-2.5 text-xs font-black text-white shadow-xs transition duration-150 active:scale-[0.98]"
                            >
                                {UI_TEXT.learningMaterials.addReadingButton}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: Questions View */}
            {readingSubTab === "questions" && (
                <div className="animate-fadeIn flex min-h-0 w-full flex-1 flex-col gap-4 pb-2">
                    {questions.length > 0 && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-slate-500">{UI_TEXT.learningMaterials.listReadingQuestions}</label>

                                <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-blue-600">
                                    {questions.length} {UI_TEXT.learningMaterials.questionUnit}
                                </span>
                            </div>
                        </div>
                    )}
                    {questions.length === 0 ? (
                        <div className="animate-fadeIn flex min-h-[420px] w-full flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/30 p-8 py-16 text-center">
                            <div className="flex size-14 items-center justify-center rounded-full border-2 border-dashed border-slate-200 bg-white text-slate-400">
                                <HelpCircle className="size-6 text-slate-400" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <h4 className="text-sm font-black text-slate-800">{UI_TEXT.learningMaterials.noReadingQuestions}</h4>
                                <p className="max-w-[320px] text-xs leading-relaxed font-medium text-slate-400">
                                    {UI_TEXT.learningMaterials.readingQuestionsPrompt}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleOpenAddQuestion}
                                className="hover:bg-wine-hover mt-1 flex cursor-pointer items-center gap-1.5 rounded-full bg-wine px-5 py-2.5 text-xs font-black text-white shadow-xs transition duration-150"
                            >
                                <Plus className="size-3.5" />
                                {UI_TEXT.learningMaterials.addQuestionBtn}
                            </button>
                        </div>
                    ) : (
                        <div className="flex w-full flex-col gap-2.5 pb-4">
                            {questions.map((q, idx) => (
                                <div
                                    key={q.id || idx}
                                    className="flex w-full flex-col gap-2.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition hover:border-slate-300"
                                >
                                    <div className="flex w-full items-center justify-between gap-3">
                                        <div className="flex min-w-0 flex-1 items-center gap-2.5">
                                            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-extrabold text-blue-600">
                                                {idx + 1}
                                            </span>
                                            <div className="truncate text-xs font-bold text-slate-800">
                                                <span className="font-medium text-slate-400">{UI_TEXT.learningMaterials.labelQuestion}</span>
                                                {getQuestionText(q) || "(Trống)"}
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenEditQuestion(q, idx)}
                                                className="flex cursor-pointer items-center justify-center rounded-full bg-blue-50 p-1.5 text-blue-600 transition hover:bg-blue-100"
                                                title={UI_TEXT.learningMaterials.editQuestionTooltip}
                                            >
                                                <Pencil className="size-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteQuestion(idx)}
                                                className="flex cursor-pointer items-center justify-center rounded-full p-1.5 text-red-500 transition hover:text-red-600"
                                                title={UI_TEXT.learningMaterials.deleteQuestionTooltip}
                                            >
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    {!!getAnswerText(q) && (
                                        <div className="w-full rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs text-slate-600">
                                            <span className="font-medium text-slate-400">{UI_TEXT.learningMaterials.labelAnswer}</span>
                                            {getAnswerText(q)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Hidden file input for PDF */}
            <input
                type="file"
                ref={fileInputRef}
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                    const selectedFile = e.target.files?.[0] || null;
                    setFile(selectedFile);
                    setHtmlFiles([]);
                    if (selectedFile) {
                        setPdfUrl("");
                        setOverrideReadingType("pdf");
                        onClearSavedMedia?.();
                    }
                }}
            />

            {/* Hidden file input for HTML (supports directory folder upload) */}
            <input
                type="file"
                ref={htmlFileInputRef}
                // @ts-expect-error webkitdirectory is non-standard
                webkitdirectory=""
                multiple
                className="hidden"
                onChange={(e) => {
                    const filesList = Array.from(e.target.files || []);
                    if (filesList.length > 0) {
                        setHtmlFiles(filesList);
                        setFile(null);
                        setPdfUrl("");
                        setOverrideReadingType("html");
                        onClearSavedMedia?.();
                    }
                }}
            />

            {/* Document Source Selection Modal */}
            <SelectPdfSourceModal
                isOpen={isSelectModalOpen}
                onOpenChange={setIsSelectModalOpen}
                onSelectUpload={() => {
                    setIsSelectModalOpen(false);
                    setOverrideReadingType("pdf");
                    onClearSavedMedia?.();
                    setHtmlFiles([]);
                    setPdfUrl("");
                    fileInputRef.current?.click();
                }}
                onSelectHtmlUpload={() => {
                    setIsSelectModalOpen(false);
                    setOverrideReadingType("html");
                    onClearSavedMedia?.();
                    setFile(null);
                    setPdfUrl("");
                    htmlFileInputRef.current?.click();
                }}
                onSelectLink={() => {
                    setIsSelectModalOpen(false);
                    setTempLink(pdfUrl || savedPdf || "");
                    setIsLinkModalOpen(true);
                }}
                onSelectWrite={() => {
                    setIsSelectModalOpen(false);
                    setOverrideReadingType("text");
                    onClearSavedMedia?.();
                    setFile(null);
                    setHtmlFiles([]);
                    setPdfUrl("");
                    if (savedPdf || savedHtmlUrl || file || htmlFiles.length > 0 || pdfUrl) {
                        setContent("");
                    }
                }}
            />

            {/* Link PDF Input Modal */}
            <LinkPdfModal
                isOpen={isLinkModalOpen}
                onOpenChange={setIsLinkModalOpen}
                tempLink={tempLink}
                setTempLink={setTempLink}
                onBack={() => {
                    setIsLinkModalOpen(false);
                    setIsSelectModalOpen(true);
                }}
                onConfirm={() => {
                    setPdfUrl(tempLink);
                    setFile(null);
                    setHtmlFiles([]);
                    const isHtml = tempLink.toLowerCase().endsWith(".html") || tempLink.toLowerCase().endsWith(".htm");
                    setOverrideReadingType(isHtml ? "html" : "pdf");
                    onClearSavedMedia?.();
                    setIsLinkModalOpen(false);
                }}
            />

            {/* Reading Question Modal */}
            <ReadingQuestionModal
                isOpen={isQuestionModalOpen}
                onClose={() => setIsQuestionModalOpen(false)}
                onSave={handleSaveQuestion}
                question={editingQuestion}
            />
        </div>
    );
}
