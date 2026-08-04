# Dynamic Courseware Integration (Phase 1: Session Types) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Phase 1 of Dynamic Courseware by integrating dynamic `SessionType` management in `lms-portal-admin`, replacing hardcoded session types (`LY_THUYET`, `THUC_HANH`) with dynamic backend-driven session types (`/v1/staff/session-types`).

**Architecture:** Create `session-type.types.ts` and `session-type.service.ts`. Build `SessionTypeModal` for staff to manage session types. Update `SessionForm` and `TypeDetailCourseView` to populate session type options dynamically from backend API.

**Tech Stack:** Next.js, React, Tailwind CSS, Lucide React, `httpClient` (`@/lib/http-client`).

## Global Constraints

- Use vanilla CSS / Tailwind utility classes established in `lms-portal-admin`.
- Use `@/lib/http-client` for API calls to ensure Authorization Bearer headers are properly sent.
- Handle fallback when offline or when no session types are returned by falling back gracefully.

---

### Task 1: Create SessionType Types & API Service

**Files:**
- Create: `src/types/session-type.types.ts`
- Create: `src/services/session-type.service.ts`

**Interfaces:**
- Produces: `SessionType`, `CreateSessionTypeDto`, `UpdateSessionTypeDto`, `sessionTypeService`

- [ ] **Step 1: Create `src/types/session-type.types.ts`**

```ts
export interface SessionType {
    id: string;
    code: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    position: number;
    isActive: boolean;
    isSystem: boolean;
    defaultBlocks?: Array<{
        type: string;
        title: string;
        isRequired: boolean;
        completionCriteria?: Record<string, unknown>;
    }>;
}

export interface CreateSessionTypeDto {
    code: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    isActive?: boolean;
}

export interface UpdateSessionTypeDto {
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
    isActive?: boolean;
}
```

- [ ] **Step 2: Create `src/services/session-type.service.ts`**

```ts
import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type {
    CreateSessionTypeDto,
    SessionType,
    UpdateSessionTypeDto,
} from "@/types/session-type.types";

export const sessionTypeService = {
    getAll: async (includeInactive = true): Promise<SessionType[]> => {
        return await httpClient<SessionType[]>(
            `/v1/staff/session-types?includeInactive=${includeInactive}`,
            { method: HttpMethod.GET }
        );
    },

    create: async (dto: CreateSessionTypeDto): Promise<SessionType> => {
        return await httpClient<SessionType>("/v1/staff/session-types", {
            method: HttpMethod.POST,
            body: JSON.stringify(dto),
        });
    },

    update: async (id: string, dto: UpdateSessionTypeDto): Promise<SessionType> => {
        return await httpClient<SessionType>(`/v1/staff/session-types/${id}`, {
            method: HttpMethod.PATCH,
            body: JSON.stringify(dto),
        });
    },

    remove: async (id: string): Promise<{ success: boolean; deactivatedOnly?: boolean }> => {
        return await httpClient<{ success: boolean; deactivatedOnly?: boolean }>(
            `/v1/staff/session-types/${id}`,
            { method: HttpMethod.DELETE }
        );
    },

    reorder: async (ids: string[]): Promise<{ success: boolean }> => {
        return await httpClient<{ success: boolean }>("/v1/staff/session-types/reorder", {
            method: HttpMethod.PUT,
            body: JSON.stringify({ ids }),
        });
    },
};
```

---

### Task 2: Build SessionType Management Modal

**Files:**
- Create: `src/components/application/modals/session-type-modal.tsx`

**Interfaces:**
- Consumes: `sessionTypeService`, `SessionType`
- Produces: `SessionTypeModal`

- [ ] **Step 1: Create `src/components/application/modals/session-type-modal.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { X, Plus, Edit2, Trash2, Check, Loader2, Tag } from "lucide-react";
import { sessionTypeService } from "@/services/session-type.service";
import type { SessionType } from "@/types/session-type.types";

interface SessionTypeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onChanged?: () => void;
}

export function SessionTypeModal({
    isOpen,
    onClose,
    onChanged,
}: SessionTypeModalProps) {
    const [types, setTypes] = useState<SessionType[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [isCreating, setIsCreating] = useState(false);
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [color, setColor] = useState("#800020");

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editDesc, setEditDesc] = useState("");

    const loadTypes = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await sessionTypeService.getAll(true);
            setTypes(data || []);
        } catch (err) {
            console.error("Failed to load session types", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadTypes();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim() || !name.trim()) {
            setError("Vui lòng nhập Mã và Tên loại buổi học.");
            return;
        }
        try {
            setSubmitting(true);
            await sessionTypeService.create({
                code: code.trim().toUpperCase(),
                name: name.trim(),
                description: description.trim() || undefined,
                color,
            });
            setIsCreating(false);
            setCode("");
            setName("");
            setDescription("");
            loadTypes();
            onChanged?.();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Tạo loại buổi học thất bại.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async (id: string) => {
        if (!editName.trim()) return;
        try {
            setSubmitting(true);
            await sessionTypeService.update(id, {
                name: editName.trim(),
                description: editDesc.trim() || undefined,
            });
            setEditingId(null);
            loadTypes();
            onChanged?.();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Cập nhật loại buổi học thất bại.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (type: SessionType) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa/ẩn loại buổi học "${type.name}"?`)) return;
        try {
            await sessionTypeService.remove(type.id);
            loadTypes();
            onChanged?.();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Xóa loại buổi học thất bại.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                        <Tag className="size-5 text-wine-bright" />
                        <h3 className="font-display text-lg font-bold text-slate-900">
                            Quản lý loại buổi học
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {error && (
                    <div className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600">
                        {error}
                    </div>
                )}

                <div className="mt-4 max-h-[60vh] overflow-y-auto pr-1 space-y-3">
                    {/* Header Action */}
                    <div className="flex justify-end">
                        {!isCreating && (
                            <button
                                onClick={() => setIsCreating(true)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-wine-bright px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-wine transition-colors cursor-pointer"
                            >
                                <Plus className="size-3.5" /> Thêm loại mới
                            </button>
                        )}
                    </div>

                    {/* Create Form */}
                    {isCreating && (
                        <form onSubmit={handleCreate} className="rounded-xl border border-wine/20 bg-wine-soft/20 p-3 space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                        Mã loại (CODE) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder="vd: KHAC_SAP"
                                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-wine-bright focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                        Tên hiển thị <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="vd: Khảo sát"
                                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-wine-bright focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                    Mô tả
                                </label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Mô tả mục đích..."
                                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-wine-bright focus:outline-none"
                                />
                            </div>
                            <div className="flex items-center justify-end gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex items-center gap-1 rounded-lg bg-wine-bright px-3 py-1 text-xs font-bold text-white hover:bg-wine transition-colors cursor-pointer"
                                >
                                    {submitting && <Loader2 className="size-3 animate-spin" />} Lưu
                                </button>
                            </div>
                        </form>
                    )}

                    {/* List Items */}
                    {loading ? (
                        <div className="flex items-center justify-center gap-2 py-8 text-xs font-medium text-slate-400">
                            <Loader2 className="size-4 animate-spin" /> Đang tải danh sách...
                        </div>
                    ) : types.length === 0 ? (
                        <div className="py-6 text-center text-xs font-medium text-slate-400">
                            Chưa có loại buổi học nào.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                            {types.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 gap-2">
                                    {editingId === item.id ? (
                                        <div className="flex-1 space-y-2">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold"
                                            />
                                            <input
                                                type="text"
                                                value={editDesc}
                                                onChange={(e) => setEditDesc(e.target.value)}
                                                placeholder="Mô tả..."
                                                className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600"
                                            />
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="rounded px-2 py-0.5 text-xs text-slate-500"
                                                >
                                                    Hủy
                                                </button>
                                                <button
                                                    onClick={() => handleUpdate(item.id)}
                                                    className="rounded bg-wine-bright px-2 py-0.5 text-xs font-bold text-white"
                                                >
                                                    Lưu
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-xs text-slate-900">
                                                        {item.name}
                                                    </span>
                                                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600">
                                                        {item.code}
                                                    </span>
                                                    {item.isSystem && (
                                                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                                                            Hệ thống
                                                        </span>
                                                    )}
                                                    {!item.isActive && (
                                                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                                                            Đã ẩn
                                                        </span>
                                                    )}
                                                </div>
                                                {item.description && (
                                                    <p className="mt-0.5 text-[11px] text-slate-500 truncate">
                                                        {item.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => {
                                                        setEditingId(item.id);
                                                        setEditName(item.name);
                                                        setEditDesc(item.description || "");
                                                    }}
                                                    className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                                                    title="Sửa"
                                                >
                                                    <Edit2 className="size-3.5" />
                                                </button>
                                                {!item.isSystem && (
                                                    <button
                                                        onClick={() => handleDelete(item)}
                                                        className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                                                        title="Xóa/Ẩn"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
```

---

### Task 3: Integrate Dynamic SessionTypes in SessionForm & Workspace

**Files:**
- Modify: `src/views/type/type-detail-course/components/session-form.tsx`
- Modify: `src/views/type/type-detail-course-view.tsx`

- [ ] **Step 1: Update `session-form.tsx` to accept dynamic session types & render management trigger**

Update `SessionForm` to load session types via `sessionTypeService.getAll()` or props, and render an option list dynamically with a "+ Quản lý loại buổi học" button.

- [ ] **Step 2: Update `type-detail-course-view.tsx` to handle `SessionTypeModal` state**

Add `isSessionTypeModalOpen` state and include `<SessionTypeModal />` component.

---
