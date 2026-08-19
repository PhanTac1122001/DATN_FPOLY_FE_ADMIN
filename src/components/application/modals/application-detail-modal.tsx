"use client";

import { useState } from "react";
import { CheckCircle2, Download, FileText, User, X, XCircle } from "lucide-react";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { toast } from "@/services/toast.service";
import { type ApplicationDetailModalProps, ApplicationStatusEnum, ExamTypeEnum } from "@/types/application-approval.types";
import { cx } from "@/utils/cx";

export function ApplicationDetailModal({ item, isOpen, onClose, onApprove, onReject }: ApplicationDetailModalProps) {
    const [rejectReason, setRejectReason] = useState<string>("");
    const [isRejectingState, setIsRejectingState] = useState<boolean>(false);
    const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

    if (!isOpen || !item) return null;

    const handleApprove = async () => {
        setIsActionLoading(true);
        try {
            await onApprove(item.id);
            toast.success(UI_TEXT.common.successTitle || "Thành công", UI_TEXT.applicationApprovals.toastApproveSuccess);
            onClose();
        } catch {
            toast.error(UI_TEXT.common.errorTitle || "Lỗi", UI_TEXT.applicationApprovals.toastFetchError);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleRejectSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectReason.trim()) {
            toast.error(UI_TEXT.common.errorTitle || "Lỗi", UI_TEXT.applicationApprovals.rejectReasonPlaceholder);
            return;
        }

        setIsActionLoading(true);
        try {
            await onReject(item.id, rejectReason.trim());
            toast.success(UI_TEXT.common.successTitle || "Thành công", UI_TEXT.applicationApprovals.toastRejectSuccess);
            onClose();
        } catch {
            toast.error(UI_TEXT.common.errorTitle || "Lỗi", UI_TEXT.applicationApprovals.toastFetchError);
        } finally {
            setIsActionLoading(false);
        }
    };

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="max-w-2xl">
                <Dialog className="outline-none">
                    <div className="flex items-center justify-between border-b border-slate-100 p-5">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                <FileText className="size-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-base font-bold text-slate-900">{UI_TEXT.applicationApprovals.detailModalTitle}</h3>
                                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-extrabold text-slate-700">{item.code}</span>
                                </div>
                                <p className="text-xs font-semibold text-slate-500">{item.typeName}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            type="button"
                            className="flex size-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        >
                            <X className="size-4" />
                        </button>
                    </div>

                    <div className="custom-scrollbar max-h-[78vh] overflow-y-auto p-6">
                        <div className="flex flex-col gap-5">
                            {/* Status Banner */}
                            <div
                                className={cx(
                                    "flex items-center justify-between rounded-2xl border p-4 text-xs font-bold",
                                    item.status === ApplicationStatusEnum.APPROVED
                                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                        : item.status === ApplicationStatusEnum.REJECTED
                                          ? "border-rose-200 bg-rose-50 text-rose-800"
                                          : "border-amber-200 bg-amber-50 text-amber-800",
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    {item.status === ApplicationStatusEnum.APPROVED ? (
                                        <CheckCircle2 className="size-5 text-emerald-600" />
                                    ) : item.status === ApplicationStatusEnum.REJECTED ? (
                                        <XCircle className="size-5 text-rose-600" />
                                    ) : (
                                        <span className="size-2.5 animate-pulse rounded-full bg-amber-500" />
                                    )}
                                    <span>
                                        {UI_TEXT.applicationApprovals.thStatus}
                                        {": "}
                                        <strong className="uppercase">
                                            {item.status === ApplicationStatusEnum.APPROVED
                                                ? UI_TEXT.applicationApprovals.statusApproved
                                                : item.status === ApplicationStatusEnum.REJECTED
                                                  ? UI_TEXT.applicationApprovals.statusRejected
                                                  : UI_TEXT.applicationApprovals.statusPending}
                                        </strong>
                                    </span>
                                </div>
                                <span className="text-[11px] font-normal text-slate-500">{new Date(item.submittedAt).toLocaleDateString("vi-VN")}</span>
                            </div>

                            {/* Student Info Card */}
                            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                                <h4 className="mb-2 text-xs font-bold tracking-wider text-slate-800 uppercase">{UI_TEXT.applicationApprovals.thStudent}</h4>
                                <div className="flex items-start gap-3">
                                    <div className="bg-wine-50 flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-wine">
                                        <User className="size-5 text-wine" />
                                    </div>
                                    <div className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-xs sm:grid-cols-2">
                                        <div>
                                            <span className="font-medium text-slate-500">{UI_TEXT.staff.thName}</span>
                                            {": "}
                                            <strong className="font-bold text-slate-900">{item.student.fullName}</strong>
                                        </div>
                                        <div>
                                            <span className="font-medium text-slate-500">{UI_TEXT.applicationApprovals.studentCodePrefix}</span>{" "}
                                            <strong className="font-bold text-slate-900">{item.student.studentCode}</strong>
                                        </div>
                                        {item.student.dob && (
                                            <div>
                                                <span className="font-medium text-slate-500">{item.student.dob}</span>
                                            </div>
                                        )}
                                        {item.student.phone && (
                                            <div>
                                                <span className="font-medium text-slate-500">{item.student.phone}</span>
                                            </div>
                                        )}
                                        {item.student.className && (
                                            <div>
                                                <strong className="text-slate-800">{item.student.className}</strong>
                                            </div>
                                        )}
                                        {item.student.cohort && (
                                            <div>
                                                <strong className="text-slate-800">{item.student.cohort}</strong>
                                            </div>
                                        )}
                                        {item.student.major && (
                                            <div className="sm:col-span-2">
                                                <strong className="text-slate-800">{item.student.major}</strong>
                                            </div>
                                        )}
                                        {item.student.address && (
                                            <div className="sm:col-span-2">
                                                <strong className="text-slate-800">{item.student.address}</strong>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Application Details Breakdown */}
                            <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-100 bg-white p-4 text-xs">
                                {item.courseName && (
                                    <div>
                                        <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                                            {UI_TEXT.applicationApprovals.thCourseSemester}
                                        </span>
                                        <div className="mt-0.5 font-bold text-slate-900">{item.courseName}</div>
                                    </div>
                                )}

                                {item.examType && (
                                    <div>
                                        <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                                            {UI_TEXT.applicationApprovals.thType}
                                        </span>
                                        <div className="mt-0.5 font-bold text-slate-900">
                                            {item.examType === ExamTypeEnum.RE_TAKE
                                                ? UI_TEXT.applicationApprovals.examReTake
                                                : UI_TEXT.applicationApprovals.examSupplementary}
                                        </div>
                                    </div>
                                )}

                                {item.commitmentDate && (
                                    <div>
                                        <div className="mt-0.5 text-sm font-extrabold text-amber-900">{item.commitmentDate}</div>
                                    </div>
                                )}

                                {(item.fromSemester || item.toSemester) && (
                                    <div>
                                        <div className="mt-0.5 font-bold text-slate-900">
                                            {item.fromSemester} {`(${item.fromYear}) - ${item.toSemester} (${item.toYear})`}
                                        </div>
                                    </div>
                                )}

                                {(item.examDate || item.examShift || item.examRoom) && (
                                    <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3">
                                        {item.examDate && (
                                            <div>
                                                <strong className="text-slate-800">{item.examDate}</strong>
                                            </div>
                                        )}
                                        {item.examBatch && (
                                            <div>
                                                <strong className="text-slate-800">{item.examBatch}</strong>
                                            </div>
                                        )}
                                        {item.examShift && (
                                            <div>
                                                <strong className="text-slate-800">{item.examShift}</strong>
                                            </div>
                                        )}
                                        {item.examRoom && (
                                            <div>
                                                <strong className="text-slate-800">{item.examRoom}</strong>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {item.reason && (
                                    <div>
                                        <div className="mt-1 rounded-xl border border-slate-100 bg-slate-50 p-3 leading-relaxed font-medium text-slate-800">
                                            {item.reason}
                                        </div>
                                    </div>
                                )}

                                {item.attachmentNotes && (
                                    <div>
                                        <div className="mt-1 font-medium text-slate-700">{item.attachmentNotes}</div>
                                    </div>
                                )}

                                {item.notes && (
                                    <div>
                                        <div className="mt-1 font-medium text-slate-700">{item.notes}</div>
                                    </div>
                                )}

                                {item.attachmentName && (
                                    <div>
                                        <div className="mt-1.5 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
                                            <div className="flex items-center gap-2 truncate">
                                                <FileText className="size-4 shrink-0 text-wine" />
                                                <span className="truncate font-semibold text-slate-800">{item.attachmentName}</span>
                                            </div>
                                            <a
                                                href={item.attachmentUrl || "#"}
                                                download={item.attachmentName}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-1 text-xs font-bold text-wine hover:underline"
                                            >
                                                <Download className="size-3.5" />
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {item.status === ApplicationStatusEnum.REJECTED && item.rejectReason && (
                                    <div className="mt-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900">
                                        <span className="text-[10px] font-bold tracking-wider text-rose-700 uppercase">
                                            {UI_TEXT.applicationApprovals.statusRejected}
                                        </span>
                                        <p className="mt-0.5 font-medium">{item.rejectReason}</p>
                                    </div>
                                )}
                            </div>

                            {/* Reject Reason Input Form */}
                            {isRejectingState && item.status === ApplicationStatusEnum.PENDING && (
                                <form onSubmit={handleRejectSubmit} className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50/50 p-4">
                                    <label className="text-xs font-bold text-rose-900">{UI_TEXT.applicationApprovals.rejectReasonPlaceholder}</label>
                                    <textarea
                                        rows={2}
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        placeholder={UI_TEXT.applicationApprovals.rejectReasonPlaceholder}
                                        required
                                        className="w-full rounded-xl border border-rose-200 bg-white p-3 text-xs text-slate-900 outline-none focus:border-rose-500"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsRejectingState(false)}
                                            className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
                                        >
                                            {UI_TEXT.common.cancel || "Hủy"}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isActionLoading}
                                            className="h-8 rounded-lg bg-rose-600 px-3 text-xs font-bold text-white shadow-xs hover:bg-rose-700 disabled:opacity-50"
                                        >
                                            {UI_TEXT.applicationApprovals.btnReject}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Footer Action Buttons */}
                        <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50"
                            >
                                {UI_TEXT.common.close || "Đóng"}
                            </button>

                            {item.status === ApplicationStatusEnum.PENDING && !isRejectingState && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setIsRejectingState(true)}
                                        disabled={isActionLoading}
                                        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                                    >
                                        <XCircle className="size-4" />
                                        {UI_TEXT.applicationApprovals.quickReject}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleApprove}
                                        disabled={isActionLoading}
                                        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 disabled:opacity-50"
                                    >
                                        <CheckCircle2 className="size-4" />
                                        {UI_TEXT.applicationApprovals.btnApprove}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
