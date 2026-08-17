"use client";

import { useCallback, useEffect, useState } from "react";
import {
    AlertCircle,
    ArrowLeft,
    Calendar,
    Check,
    CheckCircle2,
    Clock,
    ExternalLink,
    Eye,
    FileCheck,
    FileText,
    ImageIcon,
    Search,
    X,
    XCircle,
} from "lucide-react";
import Link from "next/link";
import { Breadcrumb } from "@/components/application/breadcrumb";
import { ALL_FILTER } from "@/constants/application.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { approveLeaveRequest, getClassLeaveRequests, rejectLeaveRequest } from "@/services/leave-request.service";
import { toast } from "@/services/toast.service";
import { type ClassLeavesViewProps, type LeaveRequestItem, LeaveRequestStatusEnum } from "@/types/leave-request.types";

const idSuffixLength = 6;

export function ClassLeavesView({ classId }: ClassLeavesViewProps) {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<LeaveRequestItem[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>(ALL_FILTER);
    const [searchQuery, setSearchQuery] = useState<string>("");

    // Modal states
    const [selectedRequest, setSelectedRequest] = useState<LeaveRequestItem | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
    const [rejectNote, setRejectNote] = useState<string>("");
    const [submittingAction, setSubmittingAction] = useState<boolean>(false);
    const [zoomImage, setZoomImage] = useState<string | null>(null);

    const fetchLeaveRequests = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getClassLeaveRequests(classId, {
                status: statusFilter,
                search: searchQuery,
            });
            setItems(data.items || []);
        } catch (err) {
            console.error("Failed to load leave requests:", err);
            toast.error(UI_TEXT.classLeaves.toastApproveError);
        } finally {
            setLoading(false);
        }
    }, [classId, statusFilter, searchQuery]);

    useEffect(() => {
        fetchLeaveRequests();
    }, [fetchLeaveRequests]);

    const handleApprove = async (item: LeaveRequestItem) => {
        setSubmittingAction(true);
        try {
            await approveLeaveRequest(item._id);
            toast.success(UI_TEXT.classLeaves.toastApproveSuccess);
            setIsDetailOpen(false);
            fetchLeaveRequests();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : UI_TEXT.classLeaves.toastApproveError;
            toast.error(message);
        } finally {
            setSubmittingAction(false);
        }
    };

    const handleRejectSubmit = async () => {
        if (!selectedRequest) return;
        setSubmittingAction(true);
        try {
            await rejectLeaveRequest(selectedRequest._id, rejectNote);
            toast.success(UI_TEXT.classLeaves.toastRejectSuccess);
            setIsRejectModalOpen(false);
            setIsDetailOpen(false);
            setRejectNote("");
            fetchLeaveRequests();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : UI_TEXT.classLeaves.toastRejectError;
            toast.error(message);
        } finally {
            setSubmittingAction(false);
        }
    };

    // Summary counts
    const totalCount = items.length;
    const pendingCount = items.filter((i) => i.status === LeaveRequestStatusEnum.PENDING).length;
    const approvedCount = items.filter((i) => i.status === LeaveRequestStatusEnum.APPROVED).length;
    const rejectedCount = items.filter((i) => i.status === LeaveRequestStatusEnum.REJECTED).length;

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "---";
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        } catch {
            return dateStr;
        }
    };

    const formatDateTime = (dateStr?: string) => {
        if (!dateStr) return "---";
        try {
            const d = new Date(dateStr);
            return d.toLocaleString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return dateStr;
        }
    };

    const renderStatusBadge = (status: string) => {
        switch (status) {
            case LeaveRequestStatusEnum.APPROVED:
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="size-3.5" />
                        {UI_TEXT.classLeaves.badgeApproved}
                    </span>
                );
            case LeaveRequestStatusEnum.REJECTED:
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                        <XCircle className="size-3.5" />
                        {UI_TEXT.classLeaves.badgeRejected}
                    </span>
                );
            case LeaveRequestStatusEnum.PENDING:
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        <AlertCircle className="size-3.5 animate-pulse" />
                        {UI_TEXT.classLeaves.badgePending}
                    </span>
                );
        }
    };

    return (
        <div className="flex w-full flex-1 flex-col gap-6 p-6">
            {/* Top Breadcrumb & Header */}
            <div className="flex flex-col gap-3">
                <Breadcrumb
                    items={[
                        { label: UI_TEXT.classes.breadcrumbRoot, href: "/classes" },
                        { label: UI_TEXT.classDetail.title, href: `/classes/${classId}` },
                        { label: UI_TEXT.classLeaves.headerTitle },
                    ]}
                />
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-3">
                            <Link
                                href={`/classes/${classId}`}
                                className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:border-wine hover:text-wine"
                            >
                                <ArrowLeft className="size-4" />
                            </Link>
                            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{UI_TEXT.classLeaves.headerTitle}</h1>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{UI_TEXT.classLeaves.headerSubtitle}</p>
                    </div>
                </div>
            </div>

            {/* Summary Stat Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <button
                    type="button"
                    onClick={() => setStatusFilter(ALL_FILTER)}
                    className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                        statusFilter === ALL_FILTER ? "border-wine bg-wine/5 shadow-sm" : "border-slate-100 bg-white hover:border-slate-200"
                    }`}
                >
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                        <FileCheck className="size-6" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500">{UI_TEXT.classLeaves.statTotalTitle}</p>
                        <p className="text-2xl font-bold text-slate-900">{totalCount}</p>
                    </div>
                </button>

                <button
                    type="button"
                    onClick={() => setStatusFilter(LeaveRequestStatusEnum.PENDING)}
                    className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                        statusFilter === LeaveRequestStatusEnum.PENDING
                            ? "border-amber-500 bg-amber-500/5 shadow-sm"
                            : "border-slate-100 bg-white hover:border-slate-200"
                    }`}
                >
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <AlertCircle className="size-6" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500">{UI_TEXT.classLeaves.statPendingTitle}</p>
                        <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
                    </div>
                </button>

                <button
                    type="button"
                    onClick={() => setStatusFilter(LeaveRequestStatusEnum.APPROVED)}
                    className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                        statusFilter === LeaveRequestStatusEnum.APPROVED
                            ? "border-emerald-500 bg-emerald-500/5 shadow-sm"
                            : "border-slate-100 bg-white hover:border-slate-200"
                    }`}
                >
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <CheckCircle2 className="size-6" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500">{UI_TEXT.classLeaves.statApprovedTitle}</p>
                        <p className="text-2xl font-bold text-emerald-700">{approvedCount}</p>
                    </div>
                </button>

                <button
                    type="button"
                    onClick={() => setStatusFilter(LeaveRequestStatusEnum.REJECTED)}
                    className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                        statusFilter === LeaveRequestStatusEnum.REJECTED
                            ? "border-rose-500 bg-rose-500/5 shadow-sm"
                            : "border-slate-100 bg-white hover:border-slate-200"
                    }`}
                >
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                        <XCircle className="size-6" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-500">{UI_TEXT.classLeaves.statRejectedTitle}</p>
                        <p className="text-2xl font-bold text-rose-700">{rejectedCount}</p>
                    </div>
                </button>
            </div>

            {/* Filter Controls & Search */}
            <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-xs sm:flex-row">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={UI_TEXT.classLeaves.filterSearchPlaceholder}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pr-4 pl-10 text-xs font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-wine focus:bg-white focus:ring-1 focus:ring-wine"
                    />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/80 p-1">
                    {[
                        { id: ALL_FILTER, label: UI_TEXT.classLeaves.filterAll },
                        { id: LeaveRequestStatusEnum.PENDING, label: UI_TEXT.classLeaves.badgePending },
                        { id: LeaveRequestStatusEnum.APPROVED, label: UI_TEXT.classLeaves.badgeApproved },
                        { id: LeaveRequestStatusEnum.REJECTED, label: UI_TEXT.classLeaves.badgeRejected },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setStatusFilter(tab.id)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                                statusFilter === tab.id ? "bg-white text-wine shadow-xs" : "text-slate-500 hover:text-slate-900"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table / Content List */}
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs">
                {loading ? (
                    <div className="flex h-64 flex-col items-center justify-center gap-3">
                        <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
                        <p className="text-xs font-semibold text-slate-500">{UI_TEXT.classDetail.loading}</p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-400">
                        <FileText className="size-12 stroke-[1.5]" />
                        <p className="text-sm font-semibold">{UI_TEXT.classLeaves.emptyLeaves}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-slate-100 bg-slate-50/50 font-bold tracking-wider text-slate-500 uppercase">
                                <tr>
                                    <th className="px-6 py-3.5">{UI_TEXT.classLeaves.thStudent}</th>
                                    <th className="px-6 py-3.5">{UI_TEXT.classLeaves.fieldDate}</th>
                                    <th className="px-6 py-3.5">{UI_TEXT.classLeaves.fieldShift}</th>
                                    <th className="px-6 py-3.5">{UI_TEXT.classLeaves.thReason}</th>
                                    <th className="px-6 py-3.5">{UI_TEXT.classLeaves.thProof}</th>
                                    <th className="px-6 py-3.5">{UI_TEXT.classLeaves.thStatus}</th>
                                    <th className="px-6 py-3.5">{UI_TEXT.classDetail.thTime}</th>
                                    <th className="px-6 py-3.5 text-right">{UI_TEXT.classLeaves.thAction}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {items.map((item) => {
                                    const studentName = item.studentId?.fullName || item.studentId?.name || UI_TEXT.enrollStudentModal.defaultStudentLabel;
                                    const studentCode = item.studentId?.studentCode || item.studentId?.code || "N/A";
                                    return (
                                        <tr key={item._id} className="transition-colors hover:bg-slate-50/60">
                                            {/* Student info */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-wine/10 text-xs font-bold text-wine uppercase">
                                                        {studentName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-900">{studentName}</p>
                                                        <p className="text-[11px] text-slate-400">{`${UI_TEXT.classDetail.thStudentCode}: ${studentCode}`}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Date */}
                                            <td className="px-6 py-4 font-semibold whitespace-nowrap text-slate-900">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="size-3.5 text-slate-400" />
                                                    {formatDate(item.date)}
                                                </div>
                                            </td>

                                            {/* Shift */}
                                            <td className="px-6 py-4 font-medium whitespace-nowrap text-slate-700">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="size-3.5 text-slate-400" />
                                                    {item.shift}
                                                </div>
                                            </td>

                                            {/* Reason */}
                                            <td className="max-w-xs truncate px-6 py-4 text-slate-600">{item.reason}</td>

                                            {/* Proof Image */}
                                            <td className="px-6 py-4">
                                                {item.proofImage ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setZoomImage(item.proofImage)}
                                                        className="group flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-600 transition-all hover:border-wine hover:text-wine"
                                                    >
                                                        <div className="relative size-7 overflow-hidden rounded bg-slate-200">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img
                                                                src={item.proofImage}
                                                                alt={UI_TEXT.classLeaves.thProof}
                                                                className="size-full object-cover transition-transform group-hover:scale-105"
                                                            />
                                                        </div>
                                                        <span className="text-[11px] font-semibold">{UI_TEXT.classLeaves.proofViewBtn}</span>
                                                    </button>
                                                ) : (
                                                    <span className="text-[11px] text-slate-400 italic">{UI_TEXT.classLeaves.noProofText}</span>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4 whitespace-nowrap">{renderStatusBadge(item.status)}</td>

                                            {/* CreatedAt */}
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-500">{formatDateTime(item.createdAt)}</td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedRequest(item);
                                                            setIsDetailOpen(true);
                                                        }}
                                                        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 hover:text-slate-900"
                                                    >
                                                        <Eye className="size-3.5 text-slate-500" />
                                                        {UI_TEXT.studentTranscriptModal.viewDetailBtn}
                                                    </button>

                                                    {item.status === LeaveRequestStatusEnum.PENDING && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleApprove(item)}
                                                                disabled={submittingAction}
                                                                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-emerald-700"
                                                            >
                                                                <Check className="size-3.5" />
                                                                {UI_TEXT.classLeaves.approveBtn}
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedRequest(item);
                                                                    setRejectNote("");
                                                                    setIsRejectModalOpen(true);
                                                                }}
                                                                disabled={submittingAction}
                                                                className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-rose-700"
                                                            >
                                                                <X className="size-3.5" />
                                                                {UI_TEXT.classLeaves.rejectBtn}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* DETAIL MODAL */}
            {isDetailOpen && selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
                    <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl duration-200 animate-in fade-in zoom-in">
                        {/* Modal Header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-3xl border-b border-slate-100 bg-white px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-wine/10 text-wine">
                                    <FileText className="size-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-extrabold text-slate-900">{UI_TEXT.classLeaves.detailModalTitle}</h3>
                                    <p className="text-xs text-slate-500">{`${UI_TEXT.classLeaves.codePrefix}${selectedRequest._id.slice(-idSuffixLength)}`}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {renderStatusBadge(selectedRequest.status)}
                                <button
                                    type="button"
                                    onClick={() => setIsDetailOpen(false)}
                                    className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="space-y-6 p-6">
                            {/* Student Header Card */}
                            <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-wine text-lg font-bold text-white">
                                    {(selectedRequest.studentId?.fullName || selectedRequest.studentId?.name || "SV").charAt(0)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-sm font-extrabold text-slate-900">
                                        {selectedRequest.studentId?.fullName || selectedRequest.studentId?.name}
                                    </h4>
                                    <p className="mt-0.5 text-xs text-slate-500">
                                        {`${UI_TEXT.classDetail.thStudentCode}: `}
                                        <strong className="text-slate-700">
                                            {selectedRequest.studentId?.studentCode || selectedRequest.studentId?.code || "N/A"}
                                        </strong>
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {`${UI_TEXT.classDetail.thEmail}: ${selectedRequest.studentId?.email || "Chưa cập nhật"}`}
                                    </p>
                                </div>
                            </div>

                            {/* Leave Information */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border border-slate-100 bg-white p-3.5">
                                    <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">{UI_TEXT.classLeaves.fieldDate}</p>
                                    <p className="mt-1 flex items-center gap-1.5 text-sm font-extrabold text-slate-900">
                                        <Calendar className="size-4 text-wine" />
                                        {formatDate(selectedRequest.date)}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-100 bg-white p-3.5">
                                    <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">{UI_TEXT.classLeaves.fieldShift}</p>
                                    <p className="mt-1 flex items-center gap-1.5 text-sm font-extrabold text-slate-900">
                                        <Clock className="size-4 text-wine" />
                                        {selectedRequest.shift}
                                    </p>
                                </div>
                            </div>

                            {/* Reason */}
                            <div>
                                <label className="mb-1.5 block text-xs font-bold text-slate-700">{UI_TEXT.classLeaves.fieldReason}</label>
                                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-xs leading-relaxed font-medium text-slate-800">
                                    {selectedRequest.reason}
                                </div>
                            </div>

                            {/* Proof Image */}
                            <div>
                                <label className="mb-1.5 block flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                    <ImageIcon className="size-4 text-slate-500" />
                                    {UI_TEXT.classLeaves.fieldProof}
                                </label>
                                {selectedRequest.proofImage ? (
                                    <div className="group relative flex max-h-80 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={selectedRequest.proofImage}
                                            alt={UI_TEXT.classLeaves.fieldProof}
                                            className="h-auto max-h-80 w-full object-contain"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setZoomImage(selectedRequest.proofImage)}
                                            className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-xl bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-xs transition-colors hover:bg-slate-900"
                                        >
                                            <ExternalLink className="size-3.5" />
                                            {UI_TEXT.classLeaves.zoomImageBtn}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-400">
                                        {UI_TEXT.classLeaves.noProofModalText}
                                    </div>
                                )}
                            </div>

                            {/* Reviewer Note Info if processed */}
                            {selectedRequest.status !== LeaveRequestStatusEnum.PENDING && (
                                <div className="space-y-1 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs">
                                    <p className="font-bold text-slate-800">{UI_TEXT.classLeaves.approvalInfoTitle}</p>
                                    <p className="text-slate-600">
                                        {UI_TEXT.classLeaves.reviewerLabel}{" "}
                                        <strong className="text-slate-900">
                                            {selectedRequest.reviewerId?.fullName || selectedRequest.reviewerId?.name || "Staff"}
                                        </strong>
                                    </p>
                                    <p className="text-slate-600">{`${UI_TEXT.classLeaves.reviewTimeLabel} ${formatDateTime(selectedRequest.reviewedAt)}`}</p>
                                    {selectedRequest.reviewerNote && (
                                        <p className="mt-1 font-semibold text-rose-600">
                                            {`${UI_TEXT.classLeaves.rejectNoteLabel} ${selectedRequest.reviewerNote}`}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer Actions */}
                        <div className="sticky bottom-0 flex items-center justify-between rounded-b-3xl border-t border-slate-100 bg-white px-6 py-4">
                            <button
                                type="button"
                                onClick={() => setIsDetailOpen(false)}
                                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
                            >
                                {UI_TEXT.classLeaves.closeBtn}
                            </button>

                            {selectedRequest.status === LeaveRequestStatusEnum.PENDING && (
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setRejectNote("");
                                            setIsRejectModalOpen(true);
                                        }}
                                        disabled={submittingAction}
                                        className="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-xs transition-colors hover:bg-rose-700"
                                    >
                                        {UI_TEXT.classLeaves.rejectBtn}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleApprove(selectedRequest)}
                                        disabled={submittingAction}
                                        className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-xs transition-colors hover:bg-emerald-700"
                                    >
                                        {UI_TEXT.classLeaves.approveBtn}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* REJECT NOTE MODAL */}
            {isRejectModalOpen && selectedRequest && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
                    <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl duration-150 animate-in fade-in zoom-in">
                        <h3 className="text-base font-extrabold text-slate-900">{UI_TEXT.classLeaves.rejectConfirmTitle}</h3>
                        <p className="mt-1 text-xs text-slate-500">{UI_TEXT.classLeaves.rejectConfirmDesc}</p>
                        <textarea
                            value={rejectNote}
                            onChange={(e) => setRejectNote(e.target.value)}
                            placeholder={UI_TEXT.classLeaves.rejectReasonPlaceholder}
                            className="mt-4 h-28 w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 outline-none placeholder:text-slate-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                        />
                        <div className="mt-5 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsRejectModalOpen(false)}
                                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                            >
                                {UI_TEXT.classLeaves.cancelBtn}
                            </button>
                            <button
                                type="button"
                                onClick={handleRejectSubmit}
                                disabled={submittingAction}
                                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-rose-700"
                            >
                                {UI_TEXT.classLeaves.confirmRejectBtn}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* IMAGE ZOOM MODAL */}
            {zoomImage && (
                <div
                    className="fixed inset-0 z-[70] flex cursor-zoom-out items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md"
                    onClick={() => setZoomImage(null)}
                >
                    <div className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={zoomImage} alt={UI_TEXT.classLeaves.fieldProof} className="h-auto max-h-[90vh] w-full rounded-2xl object-contain" />
                        <button
                            type="button"
                            onClick={() => setZoomImage(null)}
                            className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full bg-slate-900/80 text-white hover:bg-slate-900"
                        >
                            <X className="size-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
