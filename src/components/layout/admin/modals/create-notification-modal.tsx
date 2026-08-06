"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Send, Users, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { TiptapEditor } from "@/components/base/editor";
import { Input } from "@/components/base/input/input";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { DEFAULT_NOTIFICATION_CATEGORIES } from "@/constants/notification.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { getClassDetail, getClassList } from "@/services/class.service";
import { notificationService } from "@/services/notification.service";
import { getStudentsList } from "@/services/student.service";
import { getSystemsList } from "@/services/system.service";
import { toast } from "@/services/toast.service";
import type { ClassEntity } from "@/types/class.types";
import type { CreateNotificationModalProps, NotificationCategory } from "@/types/notification.types";
import type { Student } from "@/types/student.types";
import type { System } from "@/types/system.types";

export function CreateNotificationModal({ isOpen, onClose, onSuccess }: CreateNotificationModalProps) {
    const [categories, setCategories] = useState<NotificationCategory[]>([]);
    const [loadingCats, setLoadingCats] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [categoryCode, setCategoryCode] = useState("");
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [bodyText, setBodyText] = useState("");
    const [author, setAuthor] = useState("");
    const [isPinned, setIsPinned] = useState(false);

    // Target Selection state
    const [targetMode, setTargetMode] = useState<"SYSTEM" | "CLASS" | "STUDENT">("SYSTEM");
    const [systems, setSystems] = useState<System[]>([]);
    const [loadingSystems, setLoadingSystems] = useState(false);
    const [selectedSystemIds, setSelectedSystemIds] = useState<string[]>([]);

    const [classes, setClasses] = useState<ClassEntity[]>([]);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);

    const [studentsList, setStudentsList] = useState<Student[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [studentSearch, setStudentSearch] = useState("");
    const [manualStudentText, setManualStudentText] = useState("");

    useEffect(() => {
        if (!isOpen) return;
        setLoadingCats(true);
        setError("");
        setTitle("");
        setMessage("");
        setBodyText("");
        setAuthor("");
        setIsPinned(false);

        // Reset target selection states
        setTargetMode("SYSTEM");
        setSelectedSystemIds([]);
        setSelectedClassIds([]);
        setSelectedStudentIds([]);
        setStudentSearch("");
        setManualStudentText("");

        notificationService
            .listCategories()
            .then((res) => {
                const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
                const cats = items.length > 0 ? items : DEFAULT_NOTIFICATION_CATEGORIES;
                setCategories(cats);
                if (cats.length > 0) {
                    setCategoryCode(cats[0].code);
                }
            })
            .catch((err) => {
                console.error("Failed to load categories, using defaults", err);
                setCategories(DEFAULT_NOTIFICATION_CATEGORIES);
                setCategoryCode(DEFAULT_NOTIFICATION_CATEGORIES[0].code);
            })
            .finally(() => setLoadingCats(false));
    }, [isOpen]);

    const selectedCat = categories.find((c) => c.code === categoryCode);
    const requiresStudents = selectedCat?.requiresTargetStudents;

    // Load Systems, Classes, and Students when target selection is required
    useEffect(() => {
        if (!isOpen || !requiresStudents) return;

        setLoadingSystems(true);
        getSystemsList()
            .then((res) => setSystems(res || []))
            .catch(() => setSystems([]))
            .finally(() => setLoadingSystems(false));

        setLoadingClasses(true);
        getClassList()
            .then((res) => setClasses(res || []))
            .catch(() => setClasses([]))
            .finally(() => setLoadingClasses(false));

        setLoadingStudents(true);
        getStudentsList({ pageSize: 200 })
            .then((res) => setStudentsList(res?.items || []))
            .catch(() => setStudentsList([]))
            .finally(() => setLoadingStudents(false));
    }, [isOpen, requiresStudents]);

    const toggleSystemSelection = (sysId: string) => {
        setSelectedSystemIds((prev) => (prev.includes(sysId) ? prev.filter((id) => id !== sysId) : [...prev, sysId]));
    };

    const toggleClassSelection = (clsId: string) => {
        setSelectedClassIds((prev) => (prev.includes(clsId) ? prev.filter((id) => id !== clsId) : [...prev, clsId]));
    };

    const toggleStudentSelection = (stuId: string) => {
        setSelectedStudentIds((prev) => (prev.includes(stuId) ? prev.filter((id) => id !== stuId) : [...prev, stuId]));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!title.trim() || !message.trim() || !categoryCode) {
            setError(UI_TEXT.notifications.errRequired);
            return;
        }

        let resolvedStudentIds: string[] = [];

        if (requiresStudents) {
            setSubmitting(true);
            try {
                if (targetMode === "SYSTEM") {
                    if (selectedSystemIds.length === 0) {
                        setError("Vui lòng chọn ít nhất 1 Hệ đào tạo.");
                        setSubmitting(false);
                        return;
                    }
                    const fetchedStudentLists = await Promise.all(
                        selectedSystemIds.map((sysId) => getStudentsList({ systemId: sysId, pageSize: 1000 })),
                    );
                    const allStudents = fetchedStudentLists.flatMap((res) => res?.items || []);
                    resolvedStudentIds = Array.from(new Set(allStudents.map((s) => s.id).filter(Boolean)));
                } else if (targetMode === "CLASS") {
                    if (selectedClassIds.length === 0) {
                        setError("Vui lòng chọn ít nhất 1 Lớp học.");
                        setSubmitting(false);
                        return;
                    }
                    const fetchedClassDetails = await Promise.all(selectedClassIds.map((clsId) => getClassDetail(clsId)));
                    const allClassStudents = fetchedClassDetails.flatMap((det) => det?.students || []);
                    resolvedStudentIds = Array.from(
                        new Set(allClassStudents.map((s) => s.student?.id).filter((id): id is string => Boolean(id))),
                    );
                } else if (targetMode === "STUDENT") {
                    const manualIds = manualStudentText
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean);
                    resolvedStudentIds = Array.from(new Set([...selectedStudentIds, ...manualIds]));

                    if (resolvedStudentIds.length === 0) {
                        setError("Vui lòng chọn hoặc nhập ít nhất 1 sinh viên.");
                        setSubmitting(false);
                        return;
                    }
                }
            } catch (err) {
                console.error("Failed to resolve target students", err);
                setError("Có lỗi xảy ra khi truy xuất danh sách sinh viên.");
                setSubmitting(false);
                return;
            }
        }

        const body = bodyText.trim() ? [bodyText.trim()] : undefined;

        try {
            setSubmitting(true);
            await notificationService.createStaffNotification({
                categoryCode,
                title: title.trim(),
                message: message.trim(),
                body,
                author: author.trim() || undefined,
                isPinned,
                studentIds: requiresStudents ? resolvedStudentIds : undefined,
            });
            toast.success(UI_TEXT.notifications.createSuccessToast);
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : UI_TEXT.notifications.errCreateFailed;
            setError(msg);
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredStudents = studentsList.filter(
        (st) =>
            st.fullName?.toLowerCase().includes(studentSearch.toLowerCase()) ||
            st.studentCode?.toLowerCase().includes(studentSearch.toLowerCase()) ||
            st.email?.toLowerCase().includes(studentSearch.toLowerCase()),
    );

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="w-full max-w-3xl sm:max-w-4xl !overflow-hidden !rounded-[24px]">
                <Dialog className="flex max-h-[90vh] w-full flex-col rounded-[24px] bg-white shadow-2xl outline-none">
                    {/* Header */}
                    <div className="relative flex items-center justify-between border-b border-slate-100 px-6 py-5">
                        <div>
                            <Heading slot="title" className="text-xl font-bold text-slate-900">
                                {UI_TEXT.notifications.createNewTitle}
                            </Heading>
                            <p className="mt-0.5 text-xs text-slate-500">Tạo thông báo mới gửi tới giảng viên hoặc sinh viên trong hệ thống</p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            aria-label="Close"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                        <div className="custom-scrollbar flex flex-1 flex-col gap-5 overflow-y-auto p-6">
                            {error && <div className="rounded-xl bg-rose-50 p-3.5 text-xs font-semibold text-rose-600 border border-rose-100">{error}</div>}

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                {/* Category Dropdown */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-slate-700">
                                        {UI_TEXT.notifications.categoryLabel} <span className="font-bold text-red-500">*</span>
                                    </label>
                                    {loadingCats ? (
                                        <div className="flex items-center gap-2 py-2 text-xs text-slate-400">
                                            <Loader2 className="size-4 animate-spin" /> {UI_TEXT.notifications.loadingCategories}
                                        </div>
                                    ) : (
                                        <select
                                            value={categoryCode}
                                            onChange={(e) => setCategoryCode(e.target.value)}
                                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-wine focus:bg-white focus:outline-none transition"
                                        >
                                            {categories.map((cat) => (
                                                <option key={cat.code} value={cat.code}>
                                                    {cat.label} ({cat.code})
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {/* Author & Pin Option */}
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <Input
                                        label={UI_TEXT.notifications.authorLabel}
                                        value={author}
                                        onChange={(val: string) => setAuthor(val)}
                                        placeholder={UI_TEXT.notifications.authorPlaceholder}
                                    />
                                    <div className="flex items-center pt-6">
                                        <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={isPinned}
                                                onChange={(e) => setIsPinned(e.target.checked)}
                                                className="size-4 accent-wine rounded border-slate-300"
                                            />
                                            {UI_TEXT.notifications.pinLabel}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* TARGET STUDENTS SECTION */}
                            {requiresStudents && (
                                <div className="flex flex-col gap-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 p-4.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                            <Users className="size-4.5 text-wine" />
                                            <span>Đối tượng nhận thông báo</span>
                                            <span className="font-bold text-red-500">*</span>
                                        </label>
                                    </div>

                                    {/* Mode Tabs */}
                                    <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-slate-200/60 p-1 text-xs font-bold text-slate-600">
                                        <button
                                            type="button"
                                            onClick={() => setTargetMode("SYSTEM")}
                                            className={`cursor-pointer rounded-lg py-2 text-center transition ${
                                                targetMode === "SYSTEM" ? "bg-white text-wine shadow-xs" : "hover:text-slate-900"
                                            }`}
                                        >
                                            Theo hệ đào tạo
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTargetMode("CLASS")}
                                            className={`cursor-pointer rounded-lg py-2 text-center transition ${
                                                targetMode === "CLASS" ? "bg-white text-wine shadow-xs" : "hover:text-slate-900"
                                            }`}
                                        >
                                            Theo lớp học
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setTargetMode("STUDENT")}
                                            className={`cursor-pointer rounded-lg py-2 text-center transition ${
                                                targetMode === "STUDENT" ? "bg-white text-wine shadow-xs" : "hover:text-slate-900"
                                            }`}
                                        >
                                            Theo sinh viên
                                        </button>
                                    </div>

                                    {/* MODE 1: SYSTEM */}
                                    {targetMode === "SYSTEM" && (
                                        <div className="flex flex-col gap-2.5">
                                            <p className="text-xs text-slate-500 font-medium">
                                                Chọn các Hệ đào tạo. Tất cả sinh viên thuộc các hệ này sẽ tự động nhận thông báo.
                                            </p>
                                            {loadingSystems ? (
                                                <div className="flex items-center gap-2 py-4 text-xs text-slate-400">
                                                    <Loader2 className="size-4 animate-spin text-wine" /> Đang tải danh sách hệ đào tạo...
                                                </div>
                                            ) : (
                                                <div className="max-h-52 overflow-y-auto grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 p-0.5">
                                                    {systems.map((sys) => {
                                                        const isSelected = selectedSystemIds.includes(sys.id);
                                                        return (
                                                            <button
                                                                key={sys.id}
                                                                type="button"
                                                                onClick={() => toggleSystemSelection(sys.id)}
                                                                className={`flex cursor-pointer items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-xs font-semibold transition ${
                                                                    isSelected
                                                                        ? "border-wine bg-wine/5 text-wine shadow-2xs"
                                                                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100/80"
                                                                }`}
                                                            >
                                                                <span className="truncate">{sys.name}</span>
                                                                {isSelected && <Check className="size-4 shrink-0 text-wine" />}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* MODE 2: CLASS */}
                                    {targetMode === "CLASS" && (
                                        <div className="flex flex-col gap-2.5">
                                            <p className="text-xs text-slate-500 font-medium">
                                                Chọn các Lớp học. Tất cả sinh viên trong các lớp này sẽ tự động nhận thông báo.
                                            </p>
                                            {loadingClasses ? (
                                                <div className="flex items-center gap-2 py-4 text-xs text-slate-400">
                                                    <Loader2 className="size-4 animate-spin text-wine" /> Đang tải danh sách lớp học...
                                                </div>
                                            ) : (
                                                <div className="max-h-52 overflow-y-auto grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 p-0.5">
                                                    {classes.map((cls) => {
                                                        const isSelected = selectedClassIds.includes(cls.id);
                                                        return (
                                                            <button
                                                                key={cls.id}
                                                                type="button"
                                                                onClick={() => toggleClassSelection(cls.id)}
                                                                className={`flex cursor-pointer items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-xs font-semibold transition ${
                                                                    isSelected
                                                                        ? "border-wine bg-wine/5 text-wine shadow-2xs"
                                                                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100/80"
                                                                }`}
                                                            >
                                                                <div className="flex flex-col overflow-hidden">
                                                                    <span className="truncate">{cls.name}</span>
                                                                    <span className="text-[10px] text-slate-400 font-normal">{cls.classCode}</span>
                                                                </div>
                                                                {isSelected && <Check className="size-4 shrink-0 text-wine" />}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* MODE 3: STUDENT */}
                                    {targetMode === "STUDENT" && (
                                        <div className="flex flex-col gap-2.5">
                                            <p className="text-xs text-slate-500 font-medium">
                                                Tìm kiếm và chọn trực tiếp sinh viên hoặc nhập danh sách mã sinh viên / ID.
                                            </p>
                                            <input
                                                type="text"
                                                value={studentSearch}
                                                onChange={(e) => setStudentSearch(e.target.value)}
                                                placeholder="Tìm theo tên, mã sinh viên hoặc email..."
                                                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-wine focus:outline-none"
                                            />
                                            {loadingStudents ? (
                                                <div className="flex items-center gap-2 py-4 text-xs text-slate-400">
                                                    <Loader2 className="size-4 animate-spin text-wine" /> Đang tải danh sách sinh viên...
                                                </div>
                                            ) : (
                                                <div className="max-h-48 overflow-y-auto border border-slate-200 bg-white rounded-xl divide-y divide-slate-100">
                                                    {filteredStudents.length === 0 ? (
                                                        <div className="p-3.5 text-center text-xs text-slate-400">Không tìm thấy sinh viên phù hợp</div>
                                                    ) : (
                                                        filteredStudents.map((stu) => {
                                                            const isSelected = selectedStudentIds.includes(stu.id);
                                                            return (
                                                                <div
                                                                    key={stu.id}
                                                                    onClick={() => toggleStudentSelection(stu.id)}
                                                                    className={`flex cursor-pointer items-center justify-between px-3.5 py-2 text-xs transition ${
                                                                        isSelected ? "bg-wine/5 text-wine font-bold" : "hover:bg-slate-50 text-slate-700"
                                                                    }`}
                                                                >
                                                                    <div className="flex flex-col">
                                                                        <span>{stu.fullName}</span>
                                                                        <span className="text-[10px] text-slate-400 font-normal">
                                                                            {stu.studentCode ? `${stu.studentCode} • ` : ""}{stu.email}
                                                                        </span>
                                                                    </div>
                                                                    {isSelected && <Check className="size-4 shrink-0 text-wine" />}
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            )}

                                            <Input
                                                label="Hoặc nhập mã / ID sinh viên (cách nhau bởi dấu phẩy):"
                                                value={manualStudentText}
                                                onChange={(val: string) => setManualStudentText(val)}
                                                placeholder="VD: SV001, SV002, 65d83f12..."
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Title & Short Message */}
                            <Input
                                label={
                                    <span>
                                        {UI_TEXT.notifications.titleLabel} <span className="font-bold text-red-500">*</span>
                                    </span>
                                }
                                value={title}
                                onChange={(val: string) => setTitle(val)}
                                placeholder={UI_TEXT.notifications.titlePlaceholder}
                            />

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-slate-700">
                                    {UI_TEXT.notifications.messageLabel} <span className="font-bold text-red-500">*</span>
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={2}
                                    placeholder={UI_TEXT.notifications.messagePlaceholder}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm font-medium text-slate-800 focus:border-wine focus:bg-white focus:outline-none transition"
                                />
                            </div>

                            {/* Detailed Content with Rich Text Editor (Tiptap / CKEditor equivalent) */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-slate-700">{UI_TEXT.notifications.bodyLabel}</label>
                                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
                                    <TiptapEditor
                                        value={bodyText}
                                        onChange={(val: string) => setBodyText(val)}
                                        placeholder={UI_TEXT.notifications.bodyPlaceholder}
                                        editorClassName="min-h-[160px] p-3 text-sm text-slate-800"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 rounded-b-[24px] border-t border-slate-100 bg-slate-50/60 px-6 py-4">
                            <Button type="button" color="secondary-gray" size="md" onClick={onClose} isDisabled={submitting}>
                                {UI_TEXT.common.cancel}
                            </Button>
                            <Button
                                color="primary"
                                size="md"
                                type="submit"
                                isLoading={submitting}
                                className="border-none bg-wine px-6 font-bold text-white hover:bg-wine-deep"
                                iconLeading={!submitting ? <Send className="size-4" /> : undefined}
                            >
                                {UI_TEXT.notifications.sendButton}
                            </Button>
                        </div>
                    </form>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
