# Admin Header Notification Bell & Staff API Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the notification system in `lms-portal-admin` by adding a Bell Icon dropdown in `AdminHeader` to the right of the Live Time indicator, enabling staff to view notifications list, view details, soft-delete notifications, and create new notifications.

**Architecture:** Create notification TypeScript types and `notification.service.ts` connecting to `lms-portal-api` staff endpoints (`/v1/staff/notifications`). Build reusable `NotificationBell` popover component and modals (`CreateNotificationModal` and `NotificationDetailModal`). Render `<NotificationBell />` in `AdminHeader`.

**Tech Stack:** Next.js, React, Tailwind CSS, Lucide React (`Bell`, `Plus`, `Trash2`, `Eye`, `X`, `Clock`), `http-client` wrapper (`@/lib/http-client`).

## Global Constraints

- Use vanilla CSS / Tailwind utility classes established in `lms-portal-admin`.
- Base colors match project theme (`wine-bright`, `wine`, `cream`, `slate`, `amber`, `emerald`).
- Use `@/lib/http-client` for API calls to ensure Authorization Bearer headers are properly sent.

---

### Task 1: Add Notification Types & API Service

**Files:**
- Create: `src/types/notification.types.ts`
- Create: `src/services/notification.service.ts`

**Interfaces:**
- Produces: `LmsNotificationEntity`, `CreateStaffNotificationDto`, `UpdateStaffNotificationDto`, `NotificationCategory`, `notificationService`

- [ ] **Step 1: Create `src/types/notification.types.ts`**

```ts
export interface LmsNotificationEntity {
    id: string;
    userId: string | null;
    targetStudentIds?: string[];
    title: string;
    message: string;
    body?: string[];
    author?: string;
    categoryCode: string;
    categoryLabel: string;
    categoryTone?: string;
    isPinned: boolean;
    viewCount: number;
    isUnread: boolean;
    readAt: string | null;
    metaData?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

export interface NotificationCategory {
    code: string;
    label: string;
    sortOrder: number;
    tone?: string;
    isActive: boolean;
    requiresTargetStudents?: boolean;
}

export interface CreateStaffNotificationDto {
    categoryCode: string;
    title: string;
    message: string;
    body?: string[];
    author?: string;
    isPinned?: boolean;
    studentIds?: string[];
}

export interface UpdateStaffNotificationDto {
    categoryCode?: string;
    title?: string;
    message?: string;
    body?: string[];
    author?: string;
    isPinned?: boolean;
    studentIds?: string[];
}

export interface PaginatedNotificationsResponse {
    items: LmsNotificationEntity[];
    totalItems: number;
    limit: number;
    offset: number;
}
```

- [ ] **Step 2: Create `src/services/notification.service.ts`**

```ts
import { httpClient } from "@/lib/http-client";
import type {
    CreateStaffNotificationDto,
    LmsNotificationEntity,
    NotificationCategory,
    PaginatedNotificationsResponse,
    UpdateStaffNotificationDto,
} from "@/types/notification.types";

export const notificationService = {
    listStaffNotifications: async (params?: { limit?: number; offset?: number }) => {
        const query = new URLSearchParams();
        if (params?.limit !== undefined) query.set("limit", String(params.limit));
        if (params?.offset !== undefined) query.set("offset", String(params.offset));
        const queryString = query.toString() ? `?${query.toString()}` : "";

        const res = await httpClient.get<PaginatedNotificationsResponse>(
            `/v1/staff/notifications${queryString}`
        );
        return res.data;
    },

    createStaffNotification: async (dto: CreateStaffNotificationDto) => {
        const res = await httpClient.post<LmsNotificationEntity>(
            "/v1/staff/notifications",
            dto
        );
        return res.data;
    },

    updateStaffNotification: async (id: string, dto: UpdateStaffNotificationDto) => {
        const res = await httpClient.put<LmsNotificationEntity>(
            `/v1/staff/notifications/${id}`,
            dto
        );
        return res.data;
    },

    deleteStaffNotification: async (id: string) => {
        const res = await httpClient.delete<void>(`/v1/staff/notifications/${id}`);
        return res.data;
    },

    listCategories: async () => {
        const res = await httpClient.get<{ items: NotificationCategory[] }>(
            "/v1/staff/notification-categories"
        );
        return res.data;
    },
};
```

---

### Task 2: Build Notification Detail & Create Modals

**Files:**
- Create: `src/components/layout/admin/modals/notification-detail-modal.tsx`
- Create: `src/components/layout/admin/modals/create-notification-modal.tsx`

**Interfaces:**
- Consumes: `notificationService`, `LmsNotificationEntity`, `NotificationCategory`
- Produces: `NotificationDetailModal`, `CreateNotificationModal`

- [ ] **Step 1: Create `src/components/layout/admin/modals/notification-detail-modal.tsx`**

```tsx
"use client";

import { X, Calendar, User, Eye, Pin, Tag } from "lucide-react";
import type { LmsNotificationEntity } from "@/types/notification.types";

interface NotificationDetailModalProps {
    notification: LmsNotificationEntity | null;
    isOpen: boolean;
    onClose: () => void;
}

export function NotificationDetailModal({
    notification,
    isOpen,
    onClose,
}: NotificationDetailModalProps) {
    if (!isOpen || !notification) return null;

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleString("vi-VN", {
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="inline-flex items-center gap-1 rounded-md bg-wine-soft px-2 py-0.5 text-[11px] font-bold text-wine-deep">
                                <Tag className="size-3" />
                                {notification.categoryLabel || notification.categoryCode}
                            </span>
                            {notification.isPinned && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                                    <Pin className="size-3" />
                                    Đã ghim
                                </span>
                            )}
                        </div>
                        <h3 className="font-display text-lg font-bold text-slate-900">
                            {notification.title}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <div className="my-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                    <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700 font-medium">
                        {notification.message}
                    </div>

                    {notification.body && notification.body.length > 0 && (
                        <div className="space-y-2 text-sm text-slate-600">
                            {notification.body.map((p, idx) => (
                                <p key={idx} className="leading-relaxed">
                                    {p}
                                </p>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-[12px] text-slate-500">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <User className="size-3.5 text-slate-400" />
                            {notification.author || "Hệ thống"}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar className="size-3.5 text-slate-400" />
                            {formatDate(notification.createdAt)}
                        </span>
                    </div>
                    <span className="flex items-center gap-1 font-medium">
                        <Eye className="size-3.5 text-slate-400" />
                        {notification.viewCount} lượt xem
                    </span>
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Create `src/components/layout/admin/modals/create-notification-modal.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { notificationService } from "@/services/notification.service";
import type { NotificationCategory } from "@/types/notification.types";

interface CreateNotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CreateNotificationModal({
    isOpen,
    onClose,
    onSuccess,
}: CreateNotificationModalProps) {
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
    const [studentIdsText, setStudentIdsText] = useState("");

    useEffect(() => {
        if (!isOpen) return;
        setLoadingCats(true);
        setError("");
        notificationService
            .listCategories()
            .then((res) => {
                setCategories(res.items || []);
                if (res.items && res.items.length > 0) {
                    setCategoryCode(res.items[0].code);
                }
            })
            .catch((err) => {
                console.error("Failed to load categories", err);
            })
            .finally(() => setLoadingCats(false));
    }, [isOpen]);

    if (!isOpen) return null;

    const selectedCat = categories.find((c) => c.code === categoryCode);
    const requiresStudents = selectedCat?.requiresTargetStudents;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!title.trim() || !message.trim() || !categoryCode) {
            setError("Vui lòng điền đầy đủ thông tin bắt buộc.");
            return;
        }

        const studentIds = studentIdsText
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

        if (requiresStudents && studentIds.length === 0) {
            setError("Thể loại cá nhân yêu cầu ít nhất 1 Student ID.");
            return;
        }

        const body = bodyText
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);

        try {
            setSubmitting(true);
            await notificationService.createStaffNotification({
                categoryCode,
                title: title.trim(),
                message: message.trim(),
                body: body.length > 0 ? body : undefined,
                author: author.trim() || undefined,
                isPinned,
                studentIds: requiresStudents ? studentIds : undefined,
            });
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Tạo thông báo thất bại.";
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-display text-lg font-bold text-slate-900">
                        Tạo thông báo mới
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                    {error && (
                        <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Thể loại <span className="text-red-500">*</span>
                        </label>
                        {loadingCats ? (
                            <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                                <Loader2 className="size-4 animate-spin" /> Đang tải danh mục...
                            </div>
                        ) : (
                            <select
                                value={categoryCode}
                                onChange={(e) => setCategoryCode(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-wine-bright focus:outline-none"
                            >
                                {categories.map((cat) => (
                                    <option key={cat.code} value={cat.code}>
                                        {cat.label} ({cat.code})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {requiresStudents && (
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Danh sách Student IDs (phân cách bằng dấu phẩy) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={studentIdsText}
                                onChange={(e) => setStudentIdsText(e.target.value)}
                                placeholder="vd: 507f1f77bcf86cd799439011, 507f191e810c19729de860ea"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-wine-bright focus:outline-none"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Tiêu đề <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Nhập tiêu đề thông báo"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-wine-bright focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Tóm tắt ngắn (Excerpt) <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={2}
                            placeholder="Tóm tắt hiển thị trên danh sách và popup..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-wine-bright focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Nội dung chi tiết (Các đoạn văn, mỗi đoạn 1 dòng)
                        </label>
                        <textarea
                            value={bodyText}
                            onChange={(e) => setBodyText(e.target.value)}
                            rows={3}
                            placeholder="Nhập nội dung chi tiết..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-wine-bright focus:outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Tác giả
                            </label>
                            <input
                                type="text"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                placeholder="vd: Phòng Giáo vụ"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 focus:border-wine-bright focus:outline-none"
                            />
                        </div>

                        <div className="flex items-center pt-5">
                            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={isPinned}
                                    onChange={(e) => setIsPinned(e.target.checked)}
                                    className="size-4 rounded border-slate-300 text-wine-bright focus:ring-wine-bright"
                                />
                                Ghim lên đầu trang
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-wine-bright px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-wine transition-colors disabled:opacity-50"
                        >
                            {submitting ? (
                                <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                                <Send className="size-3.5" />
                            )}
                            Gửi thông báo
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
```

---

### Task 3: Build NotificationBell Component & Integrate into AdminHeader

**Files:**
- Create: `src/components/layout/admin/notification-bell.tsx`
- Modify: `src/components/layout/admin/admin-header.tsx`

- [ ] **Step 1: Create `src/components/layout/admin/notification-bell.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Plus, Eye, Trash2, Loader2, RefreshCw } from "lucide-react";
import { notificationService } from "@/services/notification.service";
import type { LmsNotificationEntity } from "@/types/notification.types";
import { CreateNotificationModal } from "./modals/create-notification-modal";
import { NotificationDetailModal } from "./modals/notification-detail-modal";

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<LmsNotificationEntity[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<LmsNotificationEntity | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const data = await notificationService.listStaffNotifications({ limit: 10, offset: 0 });
            setNotifications(data.items || []);
            setTotalCount(data.totalItems || 0);
        } catch (err) {
            console.error("Failed to load staff notifications", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Bạn có chắc chắn muốn xóa thông báo này?")) return;
        try {
            await notificationService.deleteStaffNotification(id);
            fetchNotifications();
        } catch (err) {
            console.error("Failed to delete notification", err);
        }
    };

    const handleItemClick = (item: LmsNotificationEntity) => {
        setSelectedNotification(item);
        setIsDetailOpen(true);
        setIsOpen(false);
    };

    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            return `${d.getHours().toString().padStart(2, "0")}:${d
                .getMinutes()
                .toString()
                .padStart(2, "0")} ${d.getDate()}/${d.getMonth() + 1}`;
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) fetchNotifications();
                }}
                className="relative flex items-center justify-center size-9 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-wine-bright transition-colors shadow-xs"
                title="Thông báo"
            >
                <Bell className="size-4.5" />
                {totalCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-wine-bright px-1 text-[10px] font-extrabold text-white">
                        {totalCount > 99 ? "99+" : totalCount}
                    </span>
                )}
            </button>

            {/* Dropdown Popover */}
            {isOpen && (
                <div className="absolute right-0 top-11 z-50 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-150">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <h4 className="font-display text-sm font-bold text-slate-900">
                                Thông báo hệ thống
                            </h4>
                            <span className="rounded-full bg-wine-soft px-2 py-0.5 text-[11px] font-bold text-wine-deep">
                                {totalCount}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={fetchNotifications}
                                disabled={loading}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                                title="Tải lại"
                            >
                                <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
                            </button>
                            <button
                                onClick={() => {
                                    setIsCreateOpen(true);
                                    setIsOpen(false);
                                }}
                                className="flex items-center gap-1 rounded-lg bg-wine-bright px-2.5 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-wine transition-colors"
                            >
                                <Plus className="size-3" /> Tạo tin
                            </button>
                        </div>
                    </div>

                    {/* Notification Items List */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {loading && notifications.length === 0 ? (
                            <div className="flex items-center justify-center gap-2 py-8 text-xs font-medium text-slate-400">
                                <Loader2 className="size-4 animate-spin" /> Đang tải thông báo...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-8 text-center text-xs font-medium text-slate-400">
                                Chưa có thông báo nào.
                            </div>
                        ) : (
                            notifications.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => handleItemClick(item)}
                                    className="group flex items-start gap-3 p-3.5 hover:bg-cream/40 transition-colors cursor-pointer"
                                >
                                    <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-wine-soft text-wine-bright font-bold text-xs">
                                        {item.categoryCode?.[0] || "N"}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-1 mb-0.5">
                                            <span className="truncate text-xs font-bold text-slate-900 group-hover:text-wine-bright transition-colors">
                                                {item.title}
                                            </span>
                                            <span className="shrink-0 text-[10px] font-medium text-slate-400">
                                                {formatDate(item.createdAt)}
                                            </span>
                                        </div>
                                        <p className="line-clamp-2 text-[11.5px] font-medium text-slate-600 leading-snug">
                                            {item.message}
                                        </p>
                                        <div className="mt-1.5 flex items-center justify-between">
                                            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                                                {item.categoryLabel || item.categoryCode}
                                            </span>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleItemClick(item);
                                                    }}
                                                    className="rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye className="size-3.5" />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(item.id, e)}
                                                    className="rounded-md p-1 text-slate-400 hover:bg-red-100 hover:text-red-600"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Modals */}
            <NotificationDetailModal
                notification={selectedNotification}
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
            />

            <CreateNotificationModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={fetchNotifications}
            />
        </div>
    );
}
```

- [ ] **Step 2: Modify `src/components/layout/admin/admin-header.tsx` to include NotificationBell**

```tsx
"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar } from "@/components/base/avatar/avatar";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { RoleEnum } from "@/types/staff.types";
import { NotificationBell } from "./notification-bell";

const PAD_LENGTH = 2;
const CLOCK_INTERVAL = 1000;

export function AdminHeader({
    title = "",
    subtitle = "",
}: {
    title?: string;
    subtitle?: string;
}) {
    const { user } = useAuth();
    const [time, setTime] = useState("");

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(PAD_LENGTH, "0");
            const minutes = String(now.getMinutes()).padStart(PAD_LENGTH, "0");
            setTime(`${hours}:${minutes}`);
        };

        updateClock();
        const interval = setInterval(updateClock, CLOCK_INTERVAL);
        return () => clearInterval(interval);
    }, []);

    // Get initials for profile avatar
    const getInitials = (name?: string) => {
        if (!name) return "A";
        const cleanName = name.replace(/\s*\(.*?\)\s*/g, "").trim();
        const parts = cleanName.split(/\s+/).filter(Boolean);
        if (parts.length === 0) return "A";
        const lastWord = parts[parts.length - 1];
        return lastWord[0].toUpperCase();
    };

    const getRoleLabel = (roles?: string[], defaultRole?: string) => {
        if (!roles || roles.length === 0) {
            return defaultRole === RoleEnum.ADMIN ? UI_TEXT.staff.roleAdmin : UI_TEXT.staff.roleTeacher;
        }
        if (roles.includes(RoleEnum.ADMIN)) return UI_TEXT.staff.roleAdmin;
        if (roles.includes(RoleEnum.MANAGER)) return UI_TEXT.staff.roleManager;
        if (roles.includes(RoleEnum.TEACHER)) return UI_TEXT.staff.roleTeacher;
        if (roles.includes(RoleEnum.TEACHER_ASSISTANT)) return UI_TEXT.staff.roleTeacherAssistant;
        if (roles.includes(RoleEnum.ASSISTANT)) return UI_TEXT.staff.roleAssistant;
        return UI_TEXT.staff.roleDefault;
    };

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-200 bg-cream/86 px-8 py-4 backdrop-blur-[12px]">
            <div className="min-w-0">
                <h1 className="font-display text-[20px] font-extrabold tracking-tight leading-normal text-ink">
                    {title || UI_TEXT.common.appName}
                </h1>
                {subtitle && (
                    <p className="mt-0.5 text-[12px] font-medium text-muted">
                        {subtitle}
                    </p>
                )}
            </div>

            <div className="flex items-center gap-4 shrink-0">
                {/* Live Time indicator */}
                <div className="flex items-center gap-1.5 rounded-full border border-wine/12 bg-wine-soft px-3 py-1.5 text-[12px] font-bold text-wine-deep">
                    <Clock className="size-3.5" />
                    <span>{time || "12:00"}</span>
                </div>

                {/* Notification Bell */}
                <NotificationBell />

                {/* User profile indicator */}
                <div className="flex items-center gap-2.5 rounded-full border border-line bg-white px-3 py-1 shadow-xs">
                    <div className="text-right">
                        <div className="font-bold text-[13px] leading-tight text-ink">
                            {user?.fullName || UI_TEXT.common.appName}
                        </div>
                        <div className="text-[10.5px] font-medium text-muted">
                            {getRoleLabel(user?.roles, user?.role)}
                        </div>
                    </div>
                    <Avatar
                        size="sm"
                        src={user?.avatarUrl || undefined}
                        initials={getInitials(user?.fullName)}
                        alt={user?.fullName}
                        className="bg-linear-to-br from-wine-bright to-wine text-white font-extrabold"
                    />
                </div>
            </div>
        </header>
    );
}
```
