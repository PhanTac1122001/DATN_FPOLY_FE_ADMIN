"use client";

import { useCallback, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, FileText, Pencil, Plus, Trash2, X } from "lucide-react";
import { ConfirmModal } from "@/components/application/modals/confirm-modal";
import { Button } from "@/components/base/buttons/button";
import { TiptapEditor } from "@/components/base/editor";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import {
    addSessionPractice,
    deleteSessionPractice,
    deleteSessionPracticeById,
    updateSessionPractice,
    updateSessionPracticeById,
} from "@/services/material.service";
import { toast } from "@/services/toast.service";
import { NEW_PRACTICE_ID_FLAG, type SessionPracticeEditorProps, SubmissionTypeEnum } from "@/types/courseware.types";
import type { SessionPractice } from "@/types/material.types";
import { PracticeFormFields } from "./practice-form-fields";

export function SessionPracticeEditor({ session, selectedPracticeId }: SessionPracticeEditorProps) {
    const queryClient = useQueryClient();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPractice, setEditingPractice] = useState<SessionPractice | null>(null);
    const [deletingPractice, setDeletingPractice] = useState<SessionPractice | null>(null);
    const [expandedIds, setExpandedIds] = useState<string[]>([]);

    // Modal form fields
    const [submissionType, setSubmissionType] = useState<"LINK" | "FILE" | "TEXT">(SubmissionTypeEnum.LINK);
    const [content, setContent] = useState("");
    const [resources, setResources] = useState<{ label: string; url: string }[]>([]);

    const rawPractices: SessionPractice[] = session.practices?.length ? session.practices : session.practice ? [session.practice] : [];

    const openCreateModal = useCallback(() => {
        setEditingPractice(null);
        setSubmissionType(SubmissionTypeEnum.LINK);
        setContent("");
        setResources([]);
        setIsModalOpen(true);
    }, []);

    useEffect(() => {
        if (selectedPracticeId === NEW_PRACTICE_ID_FLAG && rawPractices.length > 0) {
            openCreateModal();
        } else if (selectedPracticeId && selectedPracticeId !== NEW_PRACTICE_ID_FLAG) {
            setExpandedIds([selectedPracticeId]);
        }
    }, [selectedPracticeId, rawPractices.length, openCreateModal]);

    const toggleExpand = (id: string) => {
        setExpandedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    };

    const openEditModal = (p: SessionPractice) => {
        setEditingPractice(p);
        setSubmissionType((p.submissionType as "LINK" | "FILE" | "TEXT") || SubmissionTypeEnum.LINK);
        setContent(p.content || "");
        setResources(p.resources ? p.resources.map((r) => ({ label: r.label || "", url: r.url || "" })) : []);
        setIsModalOpen(true);
    };

    const saveMutation = useMutation({
        mutationFn: async () => {
            const body = {
                submissionType,
                content: content.trim(),
                resources: resources.filter((r) => r.url.trim() !== ""),
            };

            const practiceId = editingPractice?._id || editingPractice?.id;

            if (editingPractice && practiceId) {
                return updateSessionPracticeById(session.id, practiceId, body);
            } else if (editingPractice && !practiceId) {
                return updateSessionPractice(session.id, body);
            } else {
                return addSessionPractice(session.id, body);
            }
        },
        onSuccess: () => {
            toast.success(
                UI_TEXT.courseClassModal.toastCreateSuccessTitle,
                editingPractice ? UI_TEXT.practiceEditor.toastUpdateSuccess : UI_TEXT.practiceEditor.toastCreateSuccess,
            );
            queryClient.invalidateQueries({ queryKey: ["sessions", session.courseId] });
            setIsModalOpen(false);
        },
        onError: () => {
            toast.error(UI_TEXT.courseClassModal.toastCreateErrorTitle, UI_TEXT.practiceEditor.toastSaveError);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (practice: SessionPractice) => {
            const practiceId = practice._id || practice.id;
            if (practiceId) {
                return deleteSessionPracticeById(session.id, practiceId);
            } else {
                return deleteSessionPractice(session.id);
            }
        },
        onSuccess: () => {
            toast.success(UI_TEXT.courseClassModal.toastCreateSuccessTitle, UI_TEXT.practiceEditor.toastDeleteSuccess);
            queryClient.invalidateQueries({ queryKey: ["sessions", session.courseId] });
            setDeletingPractice(null);
        },
        onError: () => {
            toast.error(UI_TEXT.courseClassModal.toastCreateErrorTitle, UI_TEXT.practiceEditor.toastDeleteError);
        },
    });

    return (
        <div className="flex h-full min-h-0 flex-1 flex-col gap-4">
            {/* Header */}
            <div className="mb-4 flex shrink-0 flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-base font-bold text-slate-800">{UI_TEXT.practiceEditor.title}</h3>
                    <p className="mt-0.5 text-sm font-medium text-slate-400">
                        {UI_TEXT.practiceEditor.subtitlePrefix}
                        {session.name}
                        {UI_TEXT.practiceEditor.subtitleSuffix}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={openCreateModal}
                    className="hover:bg-wine-hover flex cursor-pointer items-center gap-1.5 rounded-full bg-wine px-6 py-2.5 text-xs font-black text-white shadow-xs transition duration-150"
                >
                    <Plus className="size-3.5" />
                    {UI_TEXT.practiceEditor.addPracticeBtn}
                </button>
            </div>

            {/* List area */}
            <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
                {rawPractices.length === 0 ? (
                    <div className="animate-fadeIn flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/30 p-8 py-14 text-center">
                        <div className="flex size-14 items-center justify-center rounded-full border-2 border-dashed border-slate-200 bg-white text-slate-400">
                            <FileText className="size-6 text-slate-400" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h4 className="text-sm font-black text-slate-800">{UI_TEXT.practiceEditor.emptyTitle}</h4>
                            <p className="max-w-[340px] text-xs leading-relaxed font-semibold text-slate-400">{UI_TEXT.practiceEditor.emptyDescription}</p>
                        </div>
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="hover:bg-wine-hover mt-1 flex cursor-pointer items-center gap-1.5 rounded-full bg-wine px-6 py-2.5 text-xs font-black text-white transition duration-150"
                        >
                            <Plus className="size-3.5" />
                            {UI_TEXT.practiceEditor.addPracticeBtn}
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {rawPractices.map((p, index) => {
                            const pId = p._id || p.id || String(index);
                            const isExpanded = expandedIds.includes(pId);
                            return (
                                <div
                                    key={pId}
                                    className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-xs transition duration-150 hover:border-slate-300"
                                >
                                    <div onClick={() => toggleExpand(pId)} className="flex cursor-pointer items-center justify-between gap-3 select-none">
                                        <div className="flex min-w-0 flex-1 items-center gap-2.5">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleExpand(pId);
                                                }}
                                                className="cursor-pointer rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                                title={isExpanded ? UI_TEXT.practiceEditor.collapseTooltip : UI_TEXT.practiceEditor.expandTooltip}
                                            >
                                                {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                                            </button>
                                            <span
                                                className={`flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-black transition ${
                                                    isExpanded ? "bg-wine text-white shadow-xs" : "bg-slate-100 text-slate-700"
                                                }`}
                                            >
                                                {index + 1}
                                            </span>
                                            <div className="flex min-w-0 flex-1 flex-col gap-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h4 className="text-sm leading-snug font-black text-slate-900">
                                                        {UI_TEXT.practiceEditor.practiceIndexPrefix}
                                                        {index + 1}
                                                    </h4>
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-blue-200/80 bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-600">
                                                        {p.submissionType === SubmissionTypeEnum.FILE
                                                            ? UI_TEXT.practiceEditor.submitTypeFile
                                                            : p.submissionType === SubmissionTypeEnum.TEXT
                                                              ? UI_TEXT.practiceEditor.submitTypeText
                                                              : UI_TEXT.practiceEditor.submitTypeLink}
                                                    </span>
                                                    {p.resources && p.resources.length > 0 && (
                                                        <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500">
                                                            {p.resources.length}
                                                            {UI_TEXT.practiceEditor.resourcesCountSuffix}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div onClick={(e) => e.stopPropagation()} className="flex shrink-0 items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(p)}
                                                className="cursor-pointer rounded-lg bg-blue-50 p-1.5 text-blue-400 transition hover:bg-blue-100 hover:text-blue-500"
                                                title={UI_TEXT.practiceEditor.editTooltip}
                                            >
                                                <Pencil className="size-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDeletingPractice(p)}
                                                className="cursor-pointer p-1.5 text-red-500 transition hover:text-red-600"
                                                title={UI_TEXT.practiceEditor.deleteTooltip}
                                            >
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="animate-fadeIn flex flex-col gap-3 pt-1">
                                            <div className="flex flex-col gap-1 rounded-xl bg-slate-50 p-3.5 text-sm leading-relaxed font-medium text-slate-700">
                                                <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                                                    {UI_TEXT.practiceEditor.problemStatementLabel}
                                                </span>
                                                <TiptapEditor
                                                    value={p.content || ""}
                                                    onChange={() => {}}
                                                    readOnly
                                                    hideToolbar
                                                    editorClassName="min-h-0 p-0 text-sm text-slate-800 bg-transparent [&_p]:!my-0.5 [&_h1]:!mt-2 [&_h1]:!mb-1 [&_h2]:!mt-2 [&_h2]:!mb-1 [&_h3]:!mt-1.5 [&_h3]:!mb-0.5 [&_ul]:!my-1 [&_ol]:!my-1 [&_h1]:!text-base [&_h2]:!text-sm [&_h2]:!font-bold [&_h3]:!text-sm [&_h3]:!font-bold [&_p]:!text-sm [&_p]:!leading-relaxed"
                                                />
                                            </div>

                                            {p.resources && p.resources.length > 0 && (
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                                                        {UI_TEXT.practiceEditor.attachedResourcesLabel}
                                                    </span>
                                                    <div className="flex flex-col gap-1">
                                                        {p.resources.map((r, rIdx) => (
                                                            <div
                                                                key={rIdx}
                                                                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs"
                                                            >
                                                                <span className="font-semibold text-slate-700">
                                                                    {r.label || `${UI_TEXT.practiceEditor.defaultResourceLabelPrefix}${rIdx + 1}`}
                                                                </span>
                                                                <a
                                                                    href={r.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="max-w-[300px] truncate font-bold text-blue-600 hover:underline"
                                                                >
                                                                    {r.url}
                                                                </a>
                                                            </div>
                                                        ))}
                                                    </div>
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

            {/* Create/Edit Practice Modal */}
            <CustomModal.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
                <CustomModal.Content className="w-full max-w-3xl !rounded-[28px]">
                    <Dialog className="custom-scrollbar relative flex max-h-[90vh] flex-col gap-6 overflow-y-auto rounded-[28px] bg-white p-7 shadow-2xl outline-none sm:p-8">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-5 right-5 z-10 cursor-pointer rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                        >
                            <X className="size-5" />
                        </button>

                        <div className="flex flex-col items-center gap-1">
                            <h3 className="text-center text-lg font-black text-slate-800">
                                {editingPractice ? UI_TEXT.practiceEditor.editModalTitle : UI_TEXT.practiceEditor.createModalTitle}
                            </h3>
                            <p className="text-center text-xs font-semibold text-slate-400 sm:text-sm">{UI_TEXT.practiceEditor.modalDescription}</p>
                        </div>

                        <PracticeFormFields
                            submissionType={submissionType}
                            setSubmissionType={setSubmissionType}
                            content={content}
                            setContent={setContent}
                            resources={resources}
                            setResources={setResources}
                        />

                        <div className="mt-2 flex w-full items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="w-1/3 cursor-pointer rounded-full border border-slate-200 bg-slate-50 py-2.5 text-center text-sm font-bold text-slate-600 transition hover:bg-slate-100 active:scale-[0.98]"
                            >
                                {UI_TEXT.practiceEditor.cancelBtn}
                            </button>
                            <Button
                                onClick={() => saveMutation.mutate()}
                                isLoading={saveMutation.isPending}
                                disabled={!content.trim()}
                                className="hover:bg-wine-hover w-2/3 cursor-pointer rounded-full border-none bg-wine py-2.5 text-center text-sm font-black text-white transition active:scale-[0.98]"
                            >
                                {editingPractice ? UI_TEXT.practiceEditor.saveBtn : UI_TEXT.practiceEditor.addBtn}
                            </Button>
                        </div>
                    </Dialog>
                </CustomModal.Content>
            </CustomModal.Root>

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={!!deletingPractice}
                onClose={() => setDeletingPractice(null)}
                onConfirm={() => {
                    if (deletingPractice) {
                        deleteMutation.mutate(deletingPractice);
                    }
                }}
                title={UI_TEXT.practiceEditor.deleteModalTitle}
                message={UI_TEXT.practiceEditor.deleteModalMessage}
                confirmText={UI_TEXT.practiceEditor.confirmDeleteBtn}
                cancelText={UI_TEXT.practiceEditor.cancelBtn}
                variant="danger"
            />
        </div>
    );
}
