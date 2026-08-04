"use client";

import { AlertCircle, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import type { PublishReportModalProps } from "@/types/publish.types";

export function PublishReportModal({
    isOpen,
    onOpenChange,
    report,
    title = UI_TEXT.publishReportModal.defaultTitle,
    isPublishSuccess = false,
}: PublishReportModalProps) {
    const hasErrors = (report?.errors?.length ?? 0) > 0;
    const hasWarnings = (report?.warnings?.length ?? 0) > 0;

    return (
        <CustomModal.Root open={isOpen} onOpenChange={onOpenChange}>
            <CustomModal.Content className="w-full max-w-2xl overflow-hidden !rounded-[24px]">
                <Dialog className="flex flex-col outline-none">
                    {/* Header */}
                    <div className="relative flex flex-col border-b border-slate-100 px-6 pt-6 pb-4">
                        <Heading slot="title" className="flex items-center gap-2 text-xl font-bold text-slate-900">
                            {isPublishSuccess ? (
                                <span className="inline-flex items-center gap-2 text-emerald-600">
                                    <CheckCircle2 className="size-6" />
                                    {UI_TEXT.publishReportModal.publishSuccessTitle}
                                </span>
                            ) : (
                                title
                            )}
                        </Heading>
                        <p className="mt-1 text-xs text-slate-500">
                            {isPublishSuccess ? UI_TEXT.publishReportModal.publishSuccessDesc : UI_TEXT.publishReportModal.validationDesc}
                        </p>
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="absolute top-5 right-5 cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            aria-label="Close"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto p-6">
                        {!hasErrors && !hasWarnings && (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <CheckCircle2 className="size-12 text-emerald-500" />
                                <h3 className="mt-3 text-base font-bold text-slate-800">{UI_TEXT.publishReportModal.cleanTitle}</h3>
                                <p className="mt-1 text-xs text-slate-500">{UI_TEXT.publishReportModal.cleanDesc}</p>
                            </div>
                        )}

                        {/* Errors section */}
                        {hasErrors && (
                            <div className="flex flex-col gap-2 rounded-2xl border border-rose-200 bg-rose-50/60 p-4">
                                <div className="flex items-center gap-2 text-sm font-bold text-rose-800">
                                    <AlertCircle className="size-5 shrink-0" />
                                    <span>
                                        {UI_TEXT.publishReportModal.errorsPrefix}
                                        {report?.errors.length}
                                        {"):"}
                                    </span>
                                </div>
                                <ul className="mt-2 flex flex-col gap-2">
                                    {report?.errors.map((err, i) => (
                                        <li key={i} className="flex flex-col rounded-xl border border-rose-200 bg-white p-3 shadow-2xs">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-mono text-xs font-bold text-rose-700">{`[${err.code}]`}</span>
                                                {(err.sessionId || err.lessonId || err.blockId) && (
                                                    <span className="text-[11px] text-slate-400">
                                                        {err.blockId
                                                            ? `${UI_TEXT.publishReportModal.blockLabel}${err.blockId}`
                                                            : err.lessonId
                                                              ? `${UI_TEXT.publishReportModal.lessonLabel}${err.lessonId}`
                                                              : `${UI_TEXT.publishReportModal.sessionLabel}${err.sessionId}`}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-1 text-xs text-slate-800">{err.message}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Warnings section */}
                        {hasWarnings && (
                            <div className="flex flex-col gap-2 rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
                                <div className="flex items-center gap-2 text-sm font-bold text-amber-800">
                                    <AlertTriangle className="size-5 shrink-0" />
                                    <span>
                                        {UI_TEXT.publishReportModal.warningsPrefix}
                                        {report?.warnings.length}
                                        {"):"}
                                    </span>
                                </div>
                                <ul className="mt-2 flex flex-col gap-2">
                                    {report?.warnings.map((warn, i) => (
                                        <li key={i} className="flex flex-col rounded-xl border border-amber-200 bg-white p-3 shadow-2xs">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="font-mono text-xs font-bold text-amber-700">{`[${warn.code}]`}</span>
                                                {(warn.sessionId || warn.lessonId || warn.blockId) && (
                                                    <span className="text-[11px] text-slate-400">
                                                        {warn.blockId
                                                            ? `${UI_TEXT.publishReportModal.blockLabel}${warn.blockId}`
                                                            : warn.lessonId
                                                              ? `${UI_TEXT.publishReportModal.lessonLabel}${warn.lessonId}`
                                                              : `${UI_TEXT.publishReportModal.sessionLabel}${warn.sessionId}`}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-1 text-xs text-slate-800">{warn.message}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end rounded-b-[24px] border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="cursor-pointer rounded-full bg-slate-900 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
                        >
                            {UI_TEXT.publishReportModal.closeBtn}
                        </button>
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
