"use client";

import { BookText, Play, X } from "lucide-react";
import { Button } from "@/components/base/buttons/button";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { SessionKindEnum } from "@/constants/class.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import type { EditSessionModalProps } from "@/types/course.types";

export function EditSessionModal({ isOpen, onOpenChange, editingSession, setEditingSession, onSubmit, isPending }: EditSessionModalProps) {
    return (
        <CustomModal.Root open={isOpen} onOpenChange={onOpenChange}>
            <CustomModal.Content className="w-full max-w-3xl !rounded-[20px]">
                <Dialog className="relative flex flex-col gap-4 rounded-[20px] bg-white p-6 shadow-2xl outline-none">
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="absolute top-4 right-4 cursor-pointer rounded-lg p-1 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
                    >
                        <X className="size-4" />
                    </button>
                    <form onSubmit={onSubmit} className="flex flex-col gap-4">
                        <div>
                            <h3 className="text-sm font-black text-slate-800">{UI_TEXT.courseDetail.editSessionTitle}</h3>
                            <p className="mt-0.5 text-[11px] font-medium text-slate-400">{UI_TEXT.courseDetail.editSessionDescription}</p>
                        </div>

                        {/* Scrollable Form Content */}
                        {editingSession && (
                            <div className="custom-scrollbar flex max-h-[500px] flex-col gap-6 overflow-y-auto pr-3">
                                {/* Section 1: General Info */}
                                <div className="flex flex-col gap-4">
                                    <h4 className="border-b border-slate-100 pb-1.5 text-[11px] font-extrabold tracking-wider text-wine uppercase">
                                        {UI_TEXT.courseDetail.sessionTabGeneral}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2 flex flex-col gap-1.5">
                                            <label className="text-xs font-medium text-slate-500 uppercase">{UI_TEXT.courseDetail.sessionNameLabel}</label>
                                            <input
                                                type="text"
                                                value={editingSession.name}
                                                onChange={(e) => setEditingSession((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                                                placeholder={UI_TEXT.courseDetail.sessionNamePlaceholder}
                                                className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold focus:border-wine focus:outline-none"
                                                autoFocus
                                                required
                                            />
                                        </div>
                                        <div className="col-span-2 flex flex-col gap-1.5">
                                            <label className="text-xs font-medium text-slate-500 uppercase">{UI_TEXT.courseDetail.sessionTypeLabel}</label>
                                            <div className="flex h-[38px] w-full items-center gap-1 rounded-full border border-slate-200/80 bg-slate-100/90 p-1 shadow-inner">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingSession((prev) => (prev ? { ...prev, type: SessionKindEnum.THEORY } : null))}
                                                    className={`flex h-full flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full text-xs font-bold transition-all duration-150 ${
                                                        (editingSession.type || SessionKindEnum.THEORY) === SessionKindEnum.THEORY
                                                            ? "bg-blue-600 text-white shadow-xs"
                                                            : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
                                                    }`}
                                                >
                                                    <BookText
                                                        className={`size-3.5 ${(editingSession.type || SessionKindEnum.THEORY) === SessionKindEnum.THEORY ? "text-white" : "text-slate-400"}`}
                                                    />
                                                    <span>{UI_TEXT.courseDetail.sessionTypeTheory}</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => setEditingSession((prev) => (prev ? { ...prev, type: SessionKindEnum.PRACTICE } : null))}
                                                    className={`flex h-full flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full text-xs font-bold transition-all duration-150 ${
                                                        editingSession.type === SessionKindEnum.PRACTICE
                                                            ? "bg-blue-600 text-white shadow-xs"
                                                            : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
                                                    }`}
                                                >
                                                    <Play
                                                        className={`size-3.5 ${editingSession.type === SessionKindEnum.PRACTICE ? "text-white" : "text-slate-400"}`}
                                                    />
                                                    <span>{UI_TEXT.courseDetail.sessionTypePractice}</span>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="col-span-2 flex flex-col gap-1.5">
                                            <label className="text-xs font-medium text-slate-500 uppercase">{UI_TEXT.courseDetail.sessionDescLabel}</label>
                                            <textarea
                                                value={editingSession.description || ""}
                                                onChange={(e) => setEditingSession((prev) => (prev ? { ...prev, description: e.target.value } : null))}
                                                placeholder={UI_TEXT.courseDetail.sessionDescPlaceholder}
                                                rows={4}
                                                className="min-h-[90px] w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold focus:border-wine focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Resources */}
                                <div className="flex flex-col gap-4">
                                    <h4 className="border-b border-slate-100 pb-1.5 text-[11px] font-extrabold tracking-wider text-wine uppercase">
                                        {UI_TEXT.courseDetail.sessionTabResources}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2 flex flex-col gap-1.5">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-medium text-slate-500 uppercase">
                                                    {UI_TEXT.courseDetail.sessionMindmapLabel}
                                                </label>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase">
                                                        {UI_TEXT.courseDetail.sessionShowMindmapLabel}
                                                    </span>
                                                    <input
                                                        type="checkbox"
                                                        checked={!!editingSession.isShowMindmap}
                                                        onChange={(e) =>
                                                            setEditingSession((prev) => (prev ? { ...prev, isShowMindmap: e.target.checked } : null))
                                                        }
                                                        className="size-3.5 cursor-pointer rounded border-slate-300 text-wine accent-wine"
                                                    />
                                                </div>
                                            </div>
                                            <input
                                                type="text"
                                                value={editingSession.mindmap || ""}
                                                onChange={(e) => setEditingSession((prev) => (prev ? { ...prev, mindmap: e.target.value } : null))}
                                                placeholder={UI_TEXT.courseDetail.sessionMindmapPlaceholder}
                                                className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold focus:border-wine focus:outline-none"
                                            />
                                        </div>
                                        <div className="col-span-1 flex flex-col gap-1.5">
                                            <label className="text-xs font-medium text-slate-500 uppercase">{UI_TEXT.courseDetail.sessionSrsLabel}</label>
                                            <input
                                                type="text"
                                                value={editingSession.srs || ""}
                                                onChange={(e) => setEditingSession((prev) => (prev ? { ...prev, srs: e.target.value } : null))}
                                                placeholder={UI_TEXT.courseDetail.sessionSrsPlaceholder}
                                                className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold focus:border-wine focus:outline-none"
                                            />
                                        </div>
                                        <div className="col-span-1 flex flex-col gap-1.5">
                                            <label className="text-xs font-medium text-slate-500 uppercase">{UI_TEXT.courseDetail.sessionPdfLabel}</label>
                                            <input
                                                type="text"
                                                value={editingSession.pdf || ""}
                                                onChange={(e) => setEditingSession((prev) => (prev ? { ...prev, pdf: e.target.value } : null))}
                                                placeholder={UI_TEXT.courseDetail.sessionPdfPlaceholder}
                                                className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold focus:border-wine focus:outline-none"
                                            />
                                        </div>
                                        <div className="col-span-1 flex flex-col gap-1.5">
                                            <label className="text-xs font-medium text-slate-500 uppercase">
                                                {UI_TEXT.courseDetail.sessionMiniProjectLabel}
                                            </label>
                                            <input
                                                type="text"
                                                value={editingSession.miniProject || ""}
                                                onChange={(e) => setEditingSession((prev) => (prev ? { ...prev, miniProject: e.target.value } : null))}
                                                placeholder={UI_TEXT.courseDetail.sessionMiniProjectPlaceholder}
                                                className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold focus:border-wine focus:outline-none"
                                            />
                                        </div>
                                        <div className="col-span-1 flex flex-col gap-1.5">
                                            <label className="text-xs font-medium text-slate-500 uppercase">
                                                {UI_TEXT.courseDetail.sessionEntranceQuizLabel}
                                            </label>
                                            <input
                                                type="text"
                                                value={editingSession.practiceEntranceQuiz || ""}
                                                onChange={(e) => setEditingSession((prev) => (prev ? { ...prev, practiceEntranceQuiz: e.target.value } : null))}
                                                placeholder={UI_TEXT.courseDetail.sessionEntranceQuizPlaceholder}
                                                className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold focus:border-wine focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-2 flex w-full items-center gap-2.5 border-t border-slate-100 pt-4">
                            <button
                                type="button"
                                onClick={() => onOpenChange(false)}
                                className="w-1/3 cursor-pointer rounded-full border border-slate-200 bg-slate-50 py-2.5 text-center text-xs font-bold text-slate-600 transition hover:border-brand-500 hover:bg-brand-500 hover:text-white active:scale-[0.98]"
                            >
                                {UI_TEXT.courseDetail.cancelButton}
                            </button>
                            <Button
                                type="submit"
                                disabled={isPending || !editingSession?.name.trim()}
                                className="hover:bg-wine-hover w-2/3 cursor-pointer rounded-full border-none bg-wine py-2.5 text-center text-xs font-black text-white transition active:scale-[0.98]"
                            >
                                {isPending ? UI_TEXT.courseDetail.savingText : UI_TEXT.courseDetail.confirmButton}
                            </Button>
                        </div>
                    </form>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
