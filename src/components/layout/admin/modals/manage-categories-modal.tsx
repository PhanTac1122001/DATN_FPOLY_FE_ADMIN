"use client";

import { useEffect, useState } from "react";
import { Edit2, Loader2, Plus, Trash2, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { notificationService } from "@/services/notification.service";
import { toast } from "@/services/toast.service";
import type { ManageCategoriesModalProps, NotificationCategory } from "@/types/notification.types";

const DEFAULT_HEX_COLOR = "#8A2535";

export function ManageCategoriesModal({ isOpen, onClose, onSuccess }: ManageCategoriesModalProps) {
    const [categories, setCategories] = useState<NotificationCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Add / Edit form state
    const [isEditing, setIsEditing] = useState(false);
    const [editingCode, setEditingCode] = useState("");
    const [code, setCode] = useState("");
    const [label, setLabel] = useState("");
    const [tone, setTone] = useState(DEFAULT_HEX_COLOR);
    const [requiresTargetStudents, setRequiresTargetStudents] = useState(false);

    const fetchCategories = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await notificationService.listCategories();
            const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
            setCategories(items);
        } catch (err) {
            console.error("Failed to list categories", err);
            setError("Không thể tải danh sách thể loại");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
            resetForm();
        }
    }, [isOpen]);

    const resetForm = () => {
        setIsEditing(false);
        setEditingCode("");
        setCode("");
        setLabel("");
        setTone(DEFAULT_HEX_COLOR);
        setRequiresTargetStudents(false);
        setError("");
    };

    const handleEditClick = (cat: NotificationCategory) => {
        setIsEditing(true);
        setEditingCode(cat.code);
        setCode(cat.code);
        setLabel(cat.label);
        setTone(cat.tone && cat.tone.startsWith("#") ? cat.tone : DEFAULT_HEX_COLOR);
        setRequiresTargetStudents(cat.requiresTargetStudents || false);
        setError("");
    };

    const handleDelete = async (catCode: string) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa thể loại "${catCode}"?`)) return;
        try {
            setSubmitting(true);
            await notificationService.deleteCategory(catCode);
            toast.success("Xóa thể loại thành công");
            await fetchCategories();
            onSuccess();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Không thể xóa thể loại";
            setError(msg);
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!code.trim() || !label.trim()) {
            setError("Mã và tên thể loại không được để trống");
            return;
        }

        try {
            setSubmitting(true);
            const autoSortOrder = isEditing
                ? (categories.find((c) => c.code === editingCode)?.sortOrder ?? 1)
                : categories.length + 1;

            if (isEditing) {
                await notificationService.updateCategory(editingCode, {
                    label: label.trim(),
                    sortOrder: autoSortOrder,
                    tone: tone.trim() || DEFAULT_HEX_COLOR,
                    requiresTargetStudents,
                });
                toast.success("Cập nhật thể loại thành công");
            } else {
                await notificationService.createCategory({
                    code: code.trim().toUpperCase(),
                    label: label.trim(),
                    sortOrder: autoSortOrder,
                    tone: tone.trim() || DEFAULT_HEX_COLOR,
                    requiresTargetStudents,
                });
                toast.success("Thêm thể loại mới thành công");
            }
            resetForm();
            await fetchCategories();
            onSuccess();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Không thể lưu thể loại";
            setError(msg);
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="w-full max-w-xl !overflow-hidden !rounded-[24px]">
                <Dialog className="flex max-h-[90vh] w-full flex-col rounded-[24px] bg-white shadow-2xl outline-none">
                    <div className="relative flex flex-col border-b border-slate-100 px-6 pt-6 pb-4">
                        <Heading slot="title" className="text-xl font-bold text-slate-900">
                            Quản lý Thể loại Thông báo
                        </Heading>
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute top-5 right-5 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            aria-label="Close"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    <div className="custom-scrollbar flex flex-1 flex-col gap-6 overflow-y-auto p-6">
                        {error && <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600">{error}</div>}

                        {/* Add / Edit Form */}
                        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                    {isEditing ? `Chỉnh sửa thể loại: ${editingCode}` : "Thêm thể loại mới"}
                                </h4>
                                {isEditing && (
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="text-xs font-bold text-wine hover:underline cursor-pointer"
                                    >
                                        + Thêm mới
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label={
                                        <span>
                                            Mã thể loại <span className="font-bold text-red-500">*</span>
                                        </span>
                                    }
                                    isDisabled={isEditing}
                                    value={code}
                                    onChange={(val: string) => setCode(val)}
                                    placeholder="VD: GIAO_VU"
                                />

                                <Input
                                    label={
                                        <span>
                                            Tên hiển thị <span className="font-bold text-red-500">*</span>
                                        </span>
                                    }
                                    value={label}
                                    onChange={(val: string) => setLabel(val)}
                                    placeholder="VD: Giáo vụ"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-slate-700">Màu hiển thị (Hex Color)</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={tone.startsWith("#") ? tone : DEFAULT_HEX_COLOR}
                                        onChange={(e) => setTone(e.target.value)}
                                        className="size-10 cursor-pointer rounded-xl border border-slate-200 bg-white p-1"
                                    />
                                    <Input
                                        value={tone}
                                        onChange={(val: string) => setTone(val)}
                                        placeholder="#8A2535"
                                        className="flex-1 font-mono"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={requiresTargetStudents}
                                        onChange={(e) => setRequiresTargetStudents(e.target.checked)}
                                        className="size-4 accent-wine"
                                    />
                                    Yêu cầu chọn học viên cá nhân (studentIds)
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <Button
                                    color="primary"
                                    size="sm"
                                    type="submit"
                                    isLoading={submitting}
                                    className="border-none bg-wine font-bold text-white hover:bg-wine-deep"
                                    iconLeading={!submitting ? <Plus className="size-4" /> : undefined}
                                >
                                    {isEditing ? "Cập nhật thể loại" : "Thêm thể loại"}
                                </Button>
                            </div>
                        </form>

                        {/* List Categories */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Danh sách thể loại ({categories.length})</h4>

                            {loading ? (
                                <div className="flex items-center justify-center p-6 text-xs text-slate-400">
                                    <Loader2 className="size-4 animate-spin mr-2" /> Đang tải...
                                </div>
                            ) : categories.length === 0 ? (
                                <div className="p-4 text-center text-xs text-slate-400">Chưa có thể loại nào.</div>
                            ) : (
                                <div className="max-h-48 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200 bg-white">
                                    {categories.map((cat) => (
                                        <div key={cat.code} className="flex items-center justify-between p-3 transition-colors hover:bg-slate-50">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="size-4 shrink-0 rounded-full border border-slate-200"
                                                    style={{ backgroundColor: cat.tone && cat.tone.startsWith("#") ? cat.tone : DEFAULT_HEX_COLOR }}
                                                    title={cat.tone}
                                                />
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-slate-900">{cat.label}</span>
                                                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                                                            {cat.code}
                                                        </span>
                                                        {cat.requiresTargetStudents && (
                                                            <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                                                                Cá nhân
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleEditClick(cat)}
                                                    className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                                    title="Sửa thể loại"
                                                >
                                                    <Edit2 className="size-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat.code)}
                                                    className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                                    title="Xóa thể loại"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
