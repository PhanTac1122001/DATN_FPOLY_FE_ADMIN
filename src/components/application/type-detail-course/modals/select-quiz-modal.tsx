"use client";

import { Search, X } from "lucide-react";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import type { SelectQuizModalProps } from "@/types/material.types";

export function SelectQuizModal({ isOpen, onOpenChange, searchTerm, setSearchTerm, quizzes, tempQuizId, setTempQuizId, onConfirm }: SelectQuizModalProps) {
    const filteredQuizzes = quizzes.filter((q) => q.title?.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <CustomModal.Root open={isOpen} onOpenChange={onOpenChange}>
            <CustomModal.Content className="w-full max-w-3xl !rounded-[28px]">
                <Dialog className="relative flex h-auto max-h-[90vh] flex-col gap-6 rounded-[28px] bg-white p-7 shadow-2xl outline-none sm:p-9">
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="absolute top-6 right-6 z-10 cursor-pointer rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                        <X className="size-5" />
                    </button>

                    {/* Centered Header */}
                    <div className="flex flex-col items-center gap-1 border-b border-slate-100 pb-5 text-center">
                        <h3 className="text-xl font-extrabold text-slate-800">{UI_TEXT.learningMaterials.linkQuizModalTitle}</h3>
                        <p className="mt-0.5 text-xs font-medium text-slate-400">{UI_TEXT.learningMaterials.linkQuizModalDesc}</p>
                    </div>

                    {/* Search Box - Pill Shaped */}
                    <div className="relative w-full">
                        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            className="w-full rounded-full border border-slate-200/80 bg-slate-50/60 bg-white py-2.5 pr-4 pl-11 text-xs font-semibold text-slate-800 placeholder-slate-400 shadow-2xs focus:border-wine focus:outline-none"
                            placeholder={UI_TEXT.learningMaterials.quizSearchPlaceholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Scrollable Table View - Expanded max height */}
                    <div className="custom-scrollbar-gray max-h-[50vh] min-h-[220px] overflow-x-auto overflow-y-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="sticky top-0 z-10 border-b border-slate-200/80 bg-slate-50 bg-slate-50/80 text-[11px] font-black tracking-wider text-slate-400 uppercase">
                                    <th className="w-14 px-4 py-3 text-center">{UI_TEXT.learningMaterials.tableHeaderSelect}</th>
                                    <th className="px-4 py-3">{UI_TEXT.learningMaterials.tableHeaderTitle}</th>
                                    <th className="w-36 px-4 py-3">{UI_TEXT.learningMaterials.tableHeaderDate}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredQuizzes.length > 0 ? (
                                    filteredQuizzes.map((q) => {
                                        const isSelected = q.id === tempQuizId;
                                        return (
                                            <tr
                                                key={q.id}
                                                onClick={() => setTempQuizId(q.id)}
                                                className={`cursor-pointer text-xs font-semibold text-slate-700 transition hover:bg-slate-50/80 ${
                                                    isSelected ? "bg-wine/5" : ""
                                                }`}
                                            >
                                                <td className="px-4 py-3.5 text-center">
                                                    <div className="flex items-center justify-center">
                                                        <div
                                                            className={`flex size-4 items-center justify-center rounded-full border transition ${
                                                                isSelected ? "border-wine bg-white" : "border-slate-300 bg-white"
                                                            }`}
                                                        >
                                                            {isSelected && <div className="size-2 rounded-full bg-wine" />}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5 font-extrabold text-slate-800">{q.title || "—"}</td>
                                                <td className="px-4 py-3.5 text-xs font-medium text-slate-400">
                                                    {q.createdAt ? new Date(q.createdAt).toLocaleDateString("vi-VN") : "—"}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="py-12 text-center text-xs font-semibold text-slate-400">
                                            {UI_TEXT.learningMaterials.emptyQuizDesc}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Buttons */}
                    <div className="mt-1 flex w-full gap-3">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="w-1/3 cursor-pointer rounded-full border border-slate-200 bg-slate-50 py-2.5 text-center text-sm font-bold text-slate-600 transition-all duration-150 hover:bg-slate-100 active:scale-[0.98]"
                        >
                            {UI_TEXT.courseDetail.cancelButton}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={!tempQuizId}
                            className="hover:bg-wine-hover w-2/3 cursor-pointer rounded-full border-none bg-wine py-2.5 text-center text-sm font-black text-white shadow-md shadow-wine/10 transition-all duration-150 active:scale-[0.98] disabled:scale-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                        >
                            {UI_TEXT.courseDetail.confirmButton}
                        </button>
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
