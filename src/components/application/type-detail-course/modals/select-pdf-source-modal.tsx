"use client";

import { ArrowLeft, ChevronRight, File, FileCode, FileText, X } from "lucide-react";
import { Button } from "@/components/base/buttons/button";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import type { LinkPdfModalProps, SelectPdfSourceModalProps } from "@/types/material.types";
import { isValidUrl } from "@/utils/url.utils";

export function SelectPdfSourceModal({
    isOpen,
    onOpenChange,
    onSelectUpload,
    onSelectHtmlUpload,
    onSelectLink: _onSelectLink,
    onSelectWrite,
}: SelectPdfSourceModalProps) {
    return (
        <CustomModal.Root open={isOpen} onOpenChange={onOpenChange}>
            <CustomModal.Content className="w-full max-w-2xl !rounded-[28px]">
                <Dialog className="relative flex flex-col gap-6 rounded-[28px] bg-white p-7 shadow-2xl outline-none sm:p-9">
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="absolute top-6 right-6 z-10 cursor-pointer rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    >
                        <X className="size-5" />
                    </button>

                    <div className="flex flex-col items-center gap-1 border-b border-slate-100 pb-5 text-center">
                        <h3 className="text-xl font-extrabold text-slate-800">{UI_TEXT.learningMaterials.selectDocSourceTitle}</h3>
                        <p className="mt-0.5 text-xs font-medium text-slate-400">{UI_TEXT.learningMaterials.selectDocSourceDesc}</p>
                    </div>

                    <div className="my-1 flex flex-col gap-3.5">
                        {/* Option 1: PDF File */}
                        <button
                            type="button"
                            onClick={onSelectUpload}
                            className="group flex w-full cursor-pointer items-center justify-between rounded-2xl border border-slate-200/90 p-4.5 text-left shadow-xs transition-all duration-200 hover:border-wine/60 hover:bg-wine/5 sm:p-5"
                        >
                            <div className="flex min-w-0 items-center gap-4">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-rose-100/50 bg-rose-50/60 text-rose-500/80 transition duration-200 group-hover:scale-105">
                                    <FileText className="size-6" />
                                </div>
                                <div className="flex min-w-0 flex-col gap-0.5">
                                    <span className="text-sm font-extrabold text-slate-800 transition group-hover:text-wine sm:text-base">
                                        {UI_TEXT.learningMaterials.uploadPdfTitle}
                                    </span>
                                    <span className="text-xs font-medium text-slate-400">{UI_TEXT.learningMaterials.uploadPdfDesc}</span>
                                </div>
                            </div>
                            <ChevronRight className="ml-2 size-5 shrink-0 text-slate-300 transition duration-200 group-hover:translate-x-1 group-hover:text-wine" />
                        </button>

                        {/* Option 2: HTML Folder/File */}
                        {onSelectHtmlUpload && (
                            <button
                                type="button"
                                onClick={onSelectHtmlUpload}
                                className="group flex w-full cursor-pointer items-center justify-between rounded-2xl border border-slate-200/90 p-4.5 text-left shadow-xs transition-all duration-200 hover:border-wine/60 hover:bg-wine/5 sm:p-5"
                            >
                                <div className="flex min-w-0 items-center gap-4">
                                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-blue-100/50 bg-blue-50/60 text-blue-500/80 transition duration-200 group-hover:scale-105">
                                        <FileCode className="size-6" />
                                    </div>
                                    <div className="flex min-w-0 flex-col gap-0.5">
                                        <span className="text-sm font-extrabold text-slate-800 transition group-hover:text-wine sm:text-base">
                                            {UI_TEXT.learningMaterials.uploadHtmlTitle}
                                        </span>
                                        <span className="text-xs font-medium text-slate-400">{UI_TEXT.learningMaterials.uploadHtmlDesc}</span>
                                    </div>
                                </div>
                                <ChevronRight className="ml-2 size-5 shrink-0 text-slate-300 transition duration-200 group-hover:translate-x-1 group-hover:text-wine" />
                            </button>
                        )}

                        {/* Option 3: Write Article */}
                        <button
                            type="button"
                            onClick={onSelectWrite}
                            className="group flex w-full cursor-pointer items-center justify-between rounded-2xl border border-slate-200/90 p-4.5 text-left shadow-xs transition-all duration-200 hover:border-wine/60 hover:bg-wine/5 sm:p-5"
                        >
                            <div className="flex min-w-0 items-center gap-4">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-amber-100/50 bg-amber-50/60 text-amber-500/80 transition duration-200 group-hover:scale-105">
                                    <File className="size-6" />
                                </div>
                                <div className="flex min-w-0 flex-col gap-0.5">
                                    <span className="text-sm font-extrabold text-slate-800 transition group-hover:text-wine sm:text-base">
                                        {UI_TEXT.learningMaterials.writeDocTitle}
                                    </span>
                                    <span className="text-xs font-medium text-slate-400">{UI_TEXT.learningMaterials.writeDocDesc}</span>
                                </div>
                            </div>
                            <ChevronRight className="ml-2 size-5 shrink-0 text-slate-300 transition duration-200 group-hover:translate-x-1 group-hover:text-wine" />
                        </button>
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}

export function LinkPdfModal({ isOpen, onOpenChange, tempLink, setTempLink, onBack, onConfirm }: LinkPdfModalProps) {
    const isUrlValid = isValidUrl(tempLink);
    const isTouchedAndInvalid = tempLink.trim().length > 0 && !isUrlValid;

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (isUrlValid) {
            onConfirm();
        }
    };

    return (
        <CustomModal.Root open={isOpen} onOpenChange={onOpenChange}>
            <CustomModal.Content className="w-full max-w-2xl !rounded-[28px]">
                <Dialog className="relative flex flex-col gap-6 rounded-[28px] bg-white p-7 shadow-2xl outline-none sm:p-9">
                    <div className="relative flex items-center justify-between border-b border-slate-100 pb-5">
                        <button
                            type="button"
                            onClick={onBack}
                            className="z-10 shrink-0 cursor-pointer rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                            title={UI_TEXT.learningMaterials.btnBack}
                        >
                            <ArrowLeft className="size-5" />
                        </button>
                        <div className="-ml-8 flex flex-1 flex-col items-center pr-4 text-center">
                            <h3 className="text-xl font-extrabold text-slate-800">{UI_TEXT.learningMaterials.modalTitleLinkPdf}</h3>
                            <p className="mt-0.5 text-xs font-medium text-slate-400">{UI_TEXT.learningMaterials.enterPdfOnlinePath}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-slate-700">
                                {UI_TEXT.learningMaterials.labelLinkPdfUrl} <span className="text-red-500">{"*"}</span>
                            </label>
                            <input
                                type="text"
                                value={tempLink}
                                onChange={(e) => setTempLink(e.target.value)}
                                placeholder={UI_TEXT.learningMaterials.placeholderLinkPdfUrl}
                                className={`w-full rounded-full border bg-white px-4 py-2.5 text-xs font-semibold transition focus:outline-none ${
                                    isTouchedAndInvalid ? "border-red-400 text-red-600 focus:border-red-500" : "border-slate-200 focus:border-wine"
                                }`}
                                autoFocus
                            />
                            {isTouchedAndInvalid && (
                                <p className="mt-0.5 pl-3 text-[11px] font-medium text-red-500">{UI_TEXT.learningMaterials.invalidUrlError}</p>
                            )}
                        </div>

                        <div className="flex w-full items-center gap-3">
                            <button
                                type="button"
                                onClick={() => onOpenChange(false)}
                                className="w-1/3 cursor-pointer rounded-full border border-slate-200 bg-slate-50 py-3 text-center text-sm font-bold text-slate-600 transition hover:bg-slate-100 active:scale-[0.98]"
                            >
                                {UI_TEXT.learningMaterials.btnCancel}
                            </button>
                            <Button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={!isUrlValid}
                                className={`w-2/3 cursor-pointer rounded-full border-none py-3 text-center text-sm font-black transition active:scale-[0.98] ${
                                    isUrlValid ? "hover:bg-wine-hover bg-wine text-white" : "cursor-not-allowed bg-slate-200 text-slate-400"
                                }`}
                            >
                                {UI_TEXT.learningMaterials.btnConfirm}
                            </Button>
                        </div>
                    </form>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
