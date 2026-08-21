import { useEffect, useState } from "react";
import { BookText, FileText, HelpCircle, Play, Sparkles, X } from "lucide-react";
import { FlashcardDeckModal } from "@/components/application/modals/flashcard-deck-modal";
import { Button } from "@/components/base/buttons/button";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { SessionKindEnum } from "@/constants/class.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { sessionTypeService } from "@/services/session-type.service";
import type { EditSessionModalProps } from "@/types/course.types";
import type { SessionTypeOption } from "@/types/courseware.types";
import { SessionTypeEnum } from "@/types/material.types";

export function EditSessionModal({ isOpen, onOpenChange, editingSession, setEditingSession, onSubmit, isPending }: EditSessionModalProps) {
    const [availableTypes, setAvailableTypes] = useState<SessionTypeOption[]>([
        { id: SessionTypeEnum.LY_THUYET, label: UI_TEXT.addSessionModal.sessionTypeTheory, code: SessionTypeEnum.LY_THUYET },
        { id: SessionTypeEnum.THUC_HANH, label: UI_TEXT.addSessionModal.sessionTypePractice, code: SessionTypeEnum.THUC_HANH },
        { id: SessionTypeEnum.BAI_TAP, label: UI_TEXT.addSessionModal.sessionTypeExercise, code: SessionTypeEnum.BAI_TAP },
        { id: SessionTypeEnum.KIEM_TRA, label: UI_TEXT.addSessionModal.sessionTypeQuiz, code: SessionTypeEnum.KIEM_TRA },
    ]);
    const [typesFromApi, setTypesFromApi] = useState(false);
    const [isFlashcardModalOpen, setIsFlashcardModalOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        sessionTypeService
            .getAll(false)
            .then((data) => {
                if (data && data.length > 0) {
                    const mapped: SessionTypeOption[] = data
                        .filter((t) => t.isActive)
                        .map((t) => ({
                            id: t.id,
                            label: t.name,
                            code: t.code,
                        }));
                    if (mapped.length > 0) {
                        setAvailableTypes(mapped);
                        setTypesFromApi(true);
                    }
                }
            })
            .catch((err) => {
                console.warn("Could not load backend session types, using default types:", err);
            });
    }, [isOpen]);

    const selectedTypeId = editingSession?.typeId;
    const selectedTypeCode = editingSession?.type;

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
                                            <div className="flex w-full flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-1.5">
                                                {availableTypes.map((t) => {
                                                    const isSelected = typesFromApi
                                                        ? selectedTypeId === t.id || (!selectedTypeId && selectedTypeCode === t.code)
                                                        : (selectedTypeCode || SessionKindEnum.THEORY) === t.id;
                                                    return (
                                                        <button
                                                            key={t.id}
                                                            type="button"
                                                            onClick={() =>
                                                                setEditingSession((prev) =>
                                                                    prev
                                                                        ? {
                                                                              ...prev,
                                                                              typeId: typesFromApi ? t.id : prev.typeId,
                                                                              type: t.code || t.id,
                                                                          }
                                                                        : null,
                                                                )
                                                            }
                                                            className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                                                                isSelected
                                                                    ? "border-wine bg-wine text-white shadow-xs"
                                                                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                                                            }`}
                                                        >
                                                            {(t.code || t.id) === SessionTypeEnum.LY_THUYET && <BookText className="size-3.5" />}
                                                            {(t.code || t.id) === SessionTypeEnum.THUC_HANH && <Play className="size-3.5" />}
                                                            {(t.code || t.id) === SessionTypeEnum.BAI_TAP && <FileText className="size-3.5" />}
                                                            {(t.code || t.id) === SessionTypeEnum.KIEM_TRA && <HelpCircle className="size-3.5" />}
                                                            <span>{t.label}</span>
                                                        </button>
                                                    );
                                                })}
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

                                        {/* Flashcard */}
                                        <div className="col-span-2 flex flex-col gap-1.5">
                                            <label className="text-xs font-medium text-slate-500 uppercase">{UI_TEXT.sessionForm.flashcardLabel}</label>
                                            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/50 p-3">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="flex size-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                                                        <Sparkles className="size-4" />
                                                    </span>
                                                    {editingSession.flashcardDeckId && editingSession.flashcardDeck ? (
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold text-slate-800">{editingSession.flashcardDeck.name}</span>
                                                            <span className="text-[11px] font-medium text-slate-500">
                                                                {UI_TEXT.sessionForm.flashcardCardCountPrefix}
                                                                {editingSession.flashcardDeck.cardCount}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[11px] font-medium text-slate-400">{UI_TEXT.sessionForm.flashcardEmpty}</span>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsFlashcardModalOpen(true)}
                                                    className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-purple-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-purple-700"
                                                >
                                                    <Sparkles className="size-3.5" />
                                                    <span>{UI_TEXT.sessionForm.flashcardManageBtn}</span>
                                                </button>
                                            </div>
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

            {editingSession && (
                <FlashcardDeckModal
                    isOpen={isFlashcardModalOpen}
                    onClose={() => setIsFlashcardModalOpen(false)}
                    sessionId={editingSession.id}
                    deckId={editingSession.flashcardDeckId}
                    courseId={editingSession.courseId}
                    onChanged={(deckId) => setEditingSession((prev) => (prev ? { ...prev, flashcardDeckId: deckId } : null))}
                />
            )}
        </CustomModal.Root>
    );
}
