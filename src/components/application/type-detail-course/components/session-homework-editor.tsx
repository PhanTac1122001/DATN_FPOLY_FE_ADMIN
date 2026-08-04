"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, ExternalLink, FileCode, Pencil, Plus, Trash2, X } from "lucide-react";
import { ConfirmModal } from "@/components/application/modals/confirm-modal";
import { Button } from "@/components/base/buttons/button";
import { TiptapEditor } from "@/components/base/editor";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { approveHomework, createHomework, deleteHomework, getHomeworkBySession, rejectHomework, updateHomework } from "@/services/homework.service";
import { toast } from "@/services/toast.service";
import type { SessionHomeworkEditorProps } from "@/types/courseware.types";
import type { Homework } from "@/types/material.types";

export function SessionHomeworkEditor({ session }: SessionHomeworkEditorProps) {
    const queryClient = useQueryClient();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHomework, setEditingHomework] = useState<Homework | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [expandedHomeworkIds, setExpandedHomeworkIds] = useState<string[]>([]);

    const toggleExpand = (id: string) => {
        setExpandedHomeworkIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    };

    // Form fields
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tutorial, setTutorial] = useState("");
    const [gradingCriteria, setGradingCriteria] = useState("");
    const [sampleLink, setSampleLink] = useState("");
    const [position, setPosition] = useState<number | "">("");

    const { data: homeworks = [], isLoading } = useQuery({
        queryKey: ["homeworks", session.id],
        queryFn: () => getHomeworkBySession(session.id),
        enabled: !!session.id,
    });

    const openCreateModal = () => {
        setEditingHomework(null);
        setTitle("");
        setDescription("");
        setTutorial("");
        setGradingCriteria("");
        setSampleLink("");
        const maxPos = homeworks.reduce((max, h) => Math.max(max, h.position || 0), 0);
        setPosition(maxPos + 1);
        setIsModalOpen(true);
    };

    const openEditModal = (hw: Homework) => {
        setEditingHomework(hw);
        setTitle(hw.title || "");
        setDescription(hw.description || "");
        setTutorial(hw.tutorial || "");
        setGradingCriteria(hw.gradingCriteria || "");
        setSampleLink(hw.sampleLink || "");
        setPosition(hw.position ?? 1);
        setIsModalOpen(true);
    };

    const saveMutation = useMutation({
        mutationFn: async () => {
            const body: Partial<Homework> = {
                sessionId: session.id,
                courseId: session.courseId,
                title: title.trim(),
                description: description.trim(),
                tutorial: tutorial.trim() || undefined,
                gradingCriteria: gradingCriteria.trim() || undefined,
                sampleLink: sampleLink.trim() || undefined,
                position: position === "" ? undefined : Number(position),
            };

            if (editingHomework) {
                const hwId = editingHomework.id || ((editingHomework as unknown as Record<string, unknown>)._id as string);
                return updateHomework(hwId, body);
            } else {
                return createHomework(body);
            }
        },
        onSuccess: () => {
            toast.success(
                UI_TEXT.courseClassModal.toastCreateSuccessTitle,
                editingHomework ? UI_TEXT.homeworkEditor.toastUpdateSuccess : UI_TEXT.homeworkEditor.toastCreateSuccess,
            );
            queryClient.invalidateQueries({ queryKey: ["homeworks", session.id] });
            setIsModalOpen(false);
        },
        onError: () => {
            toast.error(UI_TEXT.courseClassModal.toastCreateErrorTitle, UI_TEXT.homeworkEditor.toastSaveError);
        },
    });

    const _approveMutation = useMutation({
        mutationFn: (id: string) => approveHomework(id),
        onSuccess: () => {
            toast.success(UI_TEXT.courseClassModal.toastCreateSuccessTitle, UI_TEXT.homeworkEditor.toastApproveSuccess);
            queryClient.invalidateQueries({ queryKey: ["homeworks", session.id] });
        },
        onError: () => {
            toast.error(UI_TEXT.courseClassModal.toastCreateErrorTitle, UI_TEXT.homeworkEditor.toastApproveError);
        },
    });

    const _rejectMutation = useMutation({
        mutationFn: (id: string) => rejectHomework(id),
        onSuccess: () => {
            toast.success(UI_TEXT.courseClassModal.toastCreateSuccessTitle, UI_TEXT.homeworkEditor.toastRejectSuccess);
            queryClient.invalidateQueries({ queryKey: ["homeworks", session.id] });
        },
        onError: () => {
            toast.error(UI_TEXT.courseClassModal.toastCreateErrorTitle, UI_TEXT.homeworkEditor.toastRejectError);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteHomework(id),
        onSuccess: () => {
            toast.success(UI_TEXT.courseClassModal.toastCreateSuccessTitle, UI_TEXT.homeworkEditor.toastDeleteSuccess);
            queryClient.invalidateQueries({ queryKey: ["homeworks", session.id] });
            setDeletingId(null);
        },
        onError: () => {
            toast.error(UI_TEXT.courseClassModal.toastCreateErrorTitle, UI_TEXT.homeworkEditor.toastDeleteError);
        },
    });

    const sortedHomeworks = [...homeworks].sort((a, b) => {
        const posA = a.position ?? 0;
        const posB = b.position ?? 0;
        if (posA !== posB) return posA - posB;
        const idA = a.id || ((a as unknown as Record<string, unknown>)._id as string) || "";
        const idB = b.id || ((b as unknown as Record<string, unknown>)._id as string) || "";
        return idA.localeCompare(idB);
    });

    return (
        <div className="flex h-full min-h-0 flex-1 flex-col gap-4">
            {/* Header */}
            <div className="mb-4 flex shrink-0 flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-base font-bold text-slate-800">{UI_TEXT.homeworkEditor.title}</h3>
                    <p className="mt-0.5 text-sm font-medium text-slate-400">
                        {UI_TEXT.homeworkEditor.subtitlePrefix}
                        {session.name}
                        {UI_TEXT.homeworkEditor.subtitleSuffix}
                    </p>
                </div>
                <Button
                    onClick={openCreateModal}
                    iconLeading={<Plus className="size-3.5" />}
                    className="hover:bg-wine-hover cursor-pointer rounded-full border-none bg-wine px-5 py-2.5 text-xs font-black text-white shadow-xs transition-all duration-150 active:scale-[0.98]"
                >
                    {UI_TEXT.homeworkEditor.addHomeworkBtn}
                </Button>
            </div>

            {/* Content Area */}
            <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
                {isLoading ? (
                    <div className="flex flex-1 items-center justify-center py-16">
                        <div className="size-7 animate-spin rounded-full border-2 border-slate-200 border-t-wine" />
                    </div>
                ) : sortedHomeworks.length === 0 ? (
                    <div className="animate-fadeIn flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/30 p-8 py-14 text-center">
                        <div className="flex size-14 items-center justify-center rounded-full border-2 border-dashed border-slate-200 bg-white text-slate-400">
                            <FileCode className="size-6 text-slate-400" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h4 className="text-sm font-black text-slate-800">{UI_TEXT.homeworkEditor.emptyTitle}</h4>
                            <p className="max-w-[320px] text-xs leading-relaxed font-semibold text-slate-400">{UI_TEXT.homeworkEditor.emptyDescription}</p>
                        </div>
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="hover:bg-wine-hover mt-1 flex cursor-pointer items-center gap-1.5 rounded-full bg-wine px-6 py-2.5 text-xs font-black text-white transition duration-150"
                        >
                            <Plus className="size-3.5" />
                            {UI_TEXT.homeworkEditor.addHomeworkShortBtn}
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {sortedHomeworks.map((hw, index) => {
                            const hwId = hw.id || ((hw as unknown as Record<string, unknown>)._id as string) || String(index);
                            const isOpen = expandedHomeworkIds.includes(hwId);
                            const displayTitle = (hw.title || "").replace(/^\d+\.\s*/, "");
                            return (
                                <div
                                    key={hwId}
                                    className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-xs transition duration-150 hover:border-slate-300"
                                >
                                    <div onClick={() => toggleExpand(hwId)} className="flex cursor-pointer items-center justify-between gap-3 select-none">
                                        <div className="flex min-w-0 flex-1 items-center gap-2.5">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleExpand(hwId);
                                                }}
                                                className="cursor-pointer rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                                title={isOpen ? UI_TEXT.homeworkEditor.collapseTooltip : UI_TEXT.homeworkEditor.expandTooltip}
                                            >
                                                {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                                            </button>
                                            <span
                                                className={`flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-black transition ${
                                                    isOpen ? "bg-wine text-white shadow-xs" : "bg-slate-100 text-slate-700"
                                                }`}
                                            >
                                                {index + 1}
                                            </span>
                                            <div className="flex min-w-0 flex-1 flex-col gap-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h4 className="text-sm leading-snug font-black text-slate-900">{displayTitle}</h4>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div onClick={(e) => e.stopPropagation()} className="flex shrink-0 items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(hw)}
                                                className="cursor-pointer rounded-lg bg-blue-50 p-1.5 text-blue-400 transition hover:bg-blue-100 hover:text-blue-500"
                                                title={UI_TEXT.homeworkEditor.editTooltip}
                                            >
                                                <Pencil className="size-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDeletingId(hwId)}
                                                className="cursor-pointer p-1.5 text-red-500 transition hover:text-red-600"
                                                title={UI_TEXT.homeworkEditor.deleteTooltip}
                                            >
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Collapsible Content */}
                                    {isOpen && (
                                        <div className="animate-fadeIn flex flex-col gap-3 pt-1">
                                            {/* Description */}
                                            <div className="flex flex-col gap-1 rounded-xl bg-slate-50 p-3.5 text-sm leading-relaxed font-medium text-slate-700">
                                                <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                                                    {UI_TEXT.homeworkEditor.problemStatementLabel}
                                                </span>
                                                <TiptapEditor
                                                    value={hw.description || ""}
                                                    onChange={() => {}}
                                                    readOnly
                                                    hideToolbar
                                                    editorClassName="min-h-0 p-0 text-sm text-slate-800 bg-transparent [&_p]:!my-0.5 [&_h1]:!mt-2 [&_h1]:!mb-1 [&_h2]:!mt-2 [&_h2]:!mb-1 [&_h3]:!mt-1.5 [&_h3]:!mb-0.5 [&_ul]:!my-1 [&_ol]:!my-1 [&_h1]:!text-base [&_h2]:!text-sm [&_h2]:!font-bold [&_h3]:!text-sm [&_h3]:!font-bold [&_p]:!text-sm [&_p]:!leading-relaxed"
                                                />
                                            </div>

                                            {/* Additional info (Grading criteria / Sample link / Tutorial) */}
                                            {(hw.gradingCriteria || hw.tutorial || hw.sampleLink) && (
                                                <div className="grid grid-cols-1 gap-2 pt-1 text-xs md:grid-cols-2">
                                                    {hw.gradingCriteria && (
                                                        <div className="flex flex-col gap-0.5 rounded-xl border border-blue-100 bg-blue-50/50 p-2.5">
                                                            <span className="text-[10px] font-black text-blue-600 uppercase">
                                                                {UI_TEXT.homeworkEditor.rubricLabel}
                                                            </span>
                                                            <TiptapEditor
                                                                value={hw.gradingCriteria || ""}
                                                                onChange={() => {}}
                                                                readOnly
                                                                hideToolbar
                                                                editorClassName="min-h-0 p-0 text-[11px] text-slate-700 bg-transparent [&_p]:!my-0.5 [&_h1]:!mt-2 [&_h1]:!mb-1 [&_h2]:!mt-2 [&_h2]:!mb-1 [&_h3]:!mt-1.5 [&_h3]:!mb-0.5 [&_ul]:!my-1 [&_ol]:!my-1"
                                                            />
                                                        </div>
                                                    )}
                                                    {hw.tutorial && (
                                                        <div className="flex flex-col gap-0.5 rounded-xl border border-emerald-100 bg-emerald-50/50 p-2.5">
                                                            <span className="text-[10px] font-black text-emerald-600 uppercase">
                                                                {UI_TEXT.homeworkEditor.tutorialLabel}
                                                            </span>
                                                            <TiptapEditor
                                                                value={hw.tutorial || ""}
                                                                onChange={() => {}}
                                                                readOnly
                                                                hideToolbar
                                                                editorClassName="min-h-0 p-0 text-[11px] text-slate-700 bg-transparent [&_p]:!my-0.5 [&_h1]:!mt-2 [&_h1]:!mb-1 [&_h2]:!mt-2 [&_h2]:!mb-1 [&_h3]:!mt-1.5 [&_h3]:!mb-0.5 [&_ul]:!my-1 [&_ol]:!my-1"
                                                            />
                                                        </div>
                                                    )}
                                                    {hw.sampleLink && (
                                                        <div className="col-span-1 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2.5 md:col-span-2">
                                                            <span className="text-[11px] font-bold text-slate-600">
                                                                {UI_TEXT.homeworkEditor.sampleProjectLabel}
                                                            </span>
                                                            <a
                                                                href={hw.sampleLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                                                            >
                                                                {hw.sampleLink} <ExternalLink className="size-3" />
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Create/Edit Homework Modal */}
            <CustomModal.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
                <CustomModal.Content className="w-full max-w-3xl !rounded-[24px]">
                    <Dialog className="custom-scrollbar relative flex max-h-[90vh] flex-col gap-4 overflow-y-auto rounded-[20px] bg-white p-6 shadow-2xl outline-none">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 cursor-pointer rounded-lg p-1 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
                        >
                            <X className="size-4" />
                        </button>

                        <div>
                            <h3 className="text-base font-extrabold text-slate-800">
                                {editingHomework ? UI_TEXT.homeworkEditor.editModalTitle : UI_TEXT.homeworkEditor.createModalTitle}
                            </h3>
                            <p className="mt-0.5 text-xs font-medium text-slate-400">{UI_TEXT.homeworkEditor.modalDescription}</p>
                        </div>

                        <div className="flex flex-col gap-3.5">
                            {/* Title */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-medium text-slate-700 uppercase">{UI_TEXT.homeworkEditor.titleLabel}</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder={UI_TEXT.homeworkEditor.titlePlaceholder}
                                    className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold focus:border-wine focus:outline-none"
                                />
                            </div>

                            {/* Description */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-medium text-slate-700 uppercase">{UI_TEXT.homeworkEditor.descriptionLabel}</label>
                                <TiptapEditor
                                    value={description}
                                    onChange={setDescription}
                                    placeholder={UI_TEXT.homeworkEditor.descriptionPlaceholder}
                                    className="min-h-[160px] w-full overflow-hidden rounded-xl border border-slate-200 bg-white"
                                />
                            </div>

                            {/* Grading Criteria (Rubric for AI) */}
                            <div className="flex flex-col gap-1">
                                <label className="flex items-center gap-1 text-[11px] font-medium text-blue-700 uppercase">
                                    {UI_TEXT.homeworkEditor.rubricInputLabel}
                                </label>
                                <textarea
                                    value={gradingCriteria}
                                    onChange={(e) => setGradingCriteria(e.target.value)}
                                    placeholder={UI_TEXT.homeworkEditor.rubricInputPlaceholder}
                                    rows={3}
                                    className="w-full resize-none rounded-xl border border-blue-200 bg-blue-50/20 p-3 text-xs font-semibold focus:border-blue-500 focus:outline-none"
                                />
                                <span className="text-[10px] font-medium text-slate-400">{UI_TEXT.homeworkEditor.rubricNotice}</span>
                            </div>

                            {/* Tutorial */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-medium text-slate-700 uppercase">{UI_TEXT.homeworkEditor.tutorialInputLabel}</label>
                                <textarea
                                    value={tutorial}
                                    onChange={(e) => setTutorial(e.target.value)}
                                    placeholder={UI_TEXT.homeworkEditor.tutorialInputPlaceholder}
                                    rows={3}
                                    className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-xs font-semibold focus:border-wine focus:outline-none"
                                />
                            </div>

                            {/* Sample Link */}
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] font-medium text-slate-700 uppercase">{UI_TEXT.homeworkEditor.sampleLinkInputLabel}</label>
                                <input
                                    type="text"
                                    value={sampleLink}
                                    onChange={(e) => setSampleLink(e.target.value)}
                                    placeholder={UI_TEXT.homeworkEditor.sampleLinkInputPlaceholder}
                                    className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold focus:border-wine focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="mt-3 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-3">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="cursor-pointer rounded-full bg-slate-100 px-5 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-200"
                            >
                                {UI_TEXT.homeworkEditor.cancelBtn}
                            </button>
                            <Button
                                onClick={() => saveMutation.mutate()}
                                isLoading={saveMutation.isPending}
                                disabled={!title.trim() || !description.trim()}
                                className="hover:bg-wine-hover cursor-pointer rounded-full border-none bg-wine px-6 py-2 text-xs font-black text-white transition"
                            >
                                {editingHomework ? UI_TEXT.homeworkEditor.saveBtn : UI_TEXT.homeworkEditor.createBtn}
                            </Button>
                        </div>
                    </Dialog>
                </CustomModal.Content>
            </CustomModal.Root>

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={() => {
                    if (deletingId) {
                        deleteMutation.mutate(deletingId);
                    }
                }}
                title={UI_TEXT.homeworkEditor.deleteModalTitle}
                message={UI_TEXT.homeworkEditor.deleteModalMessage}
                confirmText={UI_TEXT.homeworkEditor.confirmDeleteBtn}
                cancelText={UI_TEXT.homeworkEditor.cancelBtn}
                variant="danger"
            />
        </div>
    );
}
