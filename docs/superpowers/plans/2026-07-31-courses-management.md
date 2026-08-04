# Trang Quản Lý Môn Học (/courses) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai trang quản lý Môn học (E-Learning Course Management) tại tuyến đường `/courses` thuộc dự án `lms-portal-admin`, cho phép hiển thị danh sách, thêm mới, chỉnh sửa và xóa môn học với form cấu hình 2 Tab (RPoint & Công thức tính điểm).

**Architecture:** Tạo trang `/courses` (Next.js App Router) kết nối với Client View (`courses-client-view`), List View (`courses-list-view`), Form Modal 2 Tab (`course-form-modal`), Delete Modal (`delete-course-modal`) và tầng Service (`course.service.ts`).

**Tech Stack:** React 19, Next.js 15 App Router, TypeScript, Tailwind CSS, Lucide React, React Aria Components (`CustomModal`), `@tanstack/react-query`.

## Global Constraints
- Đường dẫn trang chính: `/courses`
- Tab trong Form thêm/sửa: 
  - Tab 1: Môn học có Rpoint (bật/tắt, số điểm Rpoint, tỷ lệ hoàn thành tối thiểu).
  - Tab 2: Công thức tính điểm (Trọng số chuyên cần %, Trọng số Quiz %, Trọng số thi cuối kỳ %, Điểm đạt tối thiểu).
- Tổng % các trọng số ở Tab 2 phải được kiểm tra (cảnh báo người dùng nếu != 100%).

---

### Task 1: Định nghĩa Data Models & Service Layer cho Môn học

**Files:**
- Create: `src/types/course.types.ts`
- Create: `src/services/course.service.ts`

**Interfaces:**
- Consumes: None
- Produces: `CourseItem`, `CourseRPointConfig`, `CourseGradingFormula`, `CreateCoursePayload`, `UpdateCoursePayload`, `getCoursesList`, `createCourse`, `updateCourse`, `deleteCourse`.

- [ ] **Step 1: Tạo file `src/types/course.types.ts`**

```typescript
export interface CourseRPointConfig {
    enabled: boolean;
    rPointValue: number;
    minCompletionRate: number;
}

export interface CourseGradingFormula {
    attendanceWeight: number; // % trọng số chuyên cần/bài tập
    quizWeight: number;       // % trọng số kiểm tra/quiz
    examWeight: number;       // % trọng số thi cuối kỳ
    passScore: number;        // Điểm đạt tối thiểu (0-10)
}

export interface CourseItem {
    id: string;
    code: string;
    title: string;
    description?: string;
    rPointConfig: CourseRPointConfig;
    gradingFormula: CourseGradingFormula;
    createdAt: string;
    updatedAt: string;
}

export type CreateCoursePayload = Omit<CourseItem, "id" | "createdAt" | "updatedAt">;
export type UpdateCoursePayload = Partial<CreateCoursePayload>;
```

- [ ] **Step 2: Tạo file `src/services/course.service.ts`**

```typescript
import type { CourseItem, CreateCoursePayload, UpdateCoursePayload } from "@/types/course.types";

let mockCourses: CourseItem[] = [
    {
        id: "crs-001",
        code: "MH-FRONTEND",
        title: "Lập trình Web Frontend nâng cao",
        description: "Khóa học React, Next.js và Tailwind CSS",
        rPointConfig: {
            enabled: true,
            rPointValue: 50,
            minCompletionRate: 80,
        },
        gradingFormula: {
            attendanceWeight: 20,
            quizWeight: 30,
            examWeight: 50,
            passScore: 5.0,
        },
        createdAt: "2026-07-01T08:00:00.000Z",
        updatedAt: "2026-07-01T08:00:00.000Z",
    },
    {
        id: "crs-002",
        code: "MH-BACKEND",
        title: "Lập trình Backend Node.js & NestJS",
        description: "Thiết kế RESTful API và Microservices",
        rPointConfig: {
            enabled: false,
            rPointValue: 0,
            minCompletionRate: 100,
        },
        gradingFormula: {
            attendanceWeight: 10,
            quizWeight: 40,
            examWeight: 50,
            passScore: 6.0,
        },
        createdAt: "2026-07-05T09:30:00.000Z",
        updatedAt: "2026-07-05T09:30:00.000Z",
    },
];

export async function getCoursesList(): Promise<CourseItem[]> {
    return new Promise((resolve) => {
        setTimeout(() => resolve([...mockCourses]), 150);
    });
}

export async function createCourse(payload: CreateCoursePayload): Promise<CourseItem> {
    return new Promise((resolve) => {
        const newCourse: CourseItem = {
            ...payload,
            id: `crs-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        mockCourses.unshift(newCourse);
        setTimeout(() => resolve(newCourse), 150);
    });
}

export async function updateCourse(id: string, payload: UpdateCoursePayload): Promise<CourseItem> {
    return new Promise((resolve, reject) => {
        const index = mockCourses.findIndex((c) => c.id === id);
        if (index === -1) {
            reject(new Error("Môn học không tồn tại"));
            return;
        }
        const updated = {
            ...mockCourses[index],
            ...payload,
            updatedAt: new Date().toISOString(),
        };
        mockCourses[index] = updated;
        setTimeout(() => resolve(updated), 150);
    });
}

export async function deleteCourse(id: string): Promise<boolean> {
    return new Promise((resolve) => {
        mockCourses = mockCourses.filter((c) => c.id !== id);
        setTimeout(() => resolve(true), 150);
    });
}
```

- [ ] **Step 3: Commit Task 1**

---

### Task 2: Tạo Modal Form Thêm / Chỉnh Sửa Môn Học (2 Tabs: Rpoint & Công Thức Tính Điểm)

**Files:**
- Create: `src/views/courses/modals/course-form-modal.tsx`

**Interfaces:**
- Consumes: `CourseItem`, `CreateCoursePayload`
- Produces: `CourseFormModal` component

- [ ] **Step 1: Xây dựng Modal Component `CourseFormModal`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { Award, Calculator, X } from "lucide-react";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import type { CourseItem, CreateCoursePayload } from "@/types/course.types";

interface CourseFormModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: CourseItem | null;
    onSubmit: (payload: CreateCoursePayload) => Promise<void>;
}

export function CourseFormModal({ isOpen, onOpenChange, initialData, onSubmit }: CourseFormModalProps) {
    const [activeTab, setActiveTab] = useState<"rpoint" | "grading">("rpoint");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form fields
    const [code, setCode] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    // Tab 1: Rpoint Config
    const [rPointEnabled, setRPointEnabled] = useState(true);
    const [rPointValue, setRPointValue] = useState(50);
    const [minCompletionRate, setMinCompletionRate] = useState(80);

    // Tab 2: Grading Formula
    const [attendanceWeight, setAttendanceWeight] = useState(20);
    const [quizWeight, setQuizWeight] = useState(30);
    const [examWeight, setExamWeight] = useState(50);
    const [passScore, setPassScore] = useState(5.0);

    useEffect(() => {
        if (initialData) {
            setCode(initialData.code);
            setTitle(initialData.title);
            setDescription(initialData.description || "");
            setRPointEnabled(initialData.rPointConfig.enabled);
            setRPointValue(initialData.rPointConfig.rPointValue);
            setMinCompletionRate(initialData.rPointConfig.minCompletionRate);
            setAttendanceWeight(initialData.gradingFormula.attendanceWeight);
            setQuizWeight(initialData.gradingFormula.quizWeight);
            setExamWeight(initialData.gradingFormula.examWeight);
            setPassScore(initialData.gradingFormula.passScore);
        } else {
            setCode("");
            setTitle("");
            setDescription("");
            setRPointEnabled(true);
            setRPointValue(50);
            setMinCompletionRate(80);
            setAttendanceWeight(20);
            setQuizWeight(30);
            setExamWeight(50);
            setPassScore(5.0);
        }
        setActiveTab("rpoint");
    }, [initialData, isOpen]);

    const totalWeight = Number(attendanceWeight) + Number(quizWeight) + Number(examWeight);
    const isWeightValid = totalWeight === 100;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !code.trim()) return;

        setIsSubmitting(true);
        try {
            await onSubmit({
                code: code.trim(),
                title: title.trim(),
                description: description.trim(),
                rPointConfig: {
                    enabled: rPointEnabled,
                    rPointValue: Number(rPointValue),
                    minCompletionRate: Number(minCompletionRate),
                },
                gradingFormula: {
                    attendanceWeight: Number(attendanceWeight),
                    quizWeight: Number(quizWeight),
                    examWeight: Number(examWeight),
                    passScore: Number(passScore),
                },
            });
            onOpenChange(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <CustomModal.Root open={isOpen} onOpenChange={onOpenChange}>
            <CustomModal.Content className="max-w-2xl !rounded-[24px] w-full overflow-hidden">
                <Dialog className="flex flex-col outline-none">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-line px-6 py-4">
                        <h2 className="text-lg font-bold text-ink">{initialData ? "Chỉnh sửa Môn học" : "Thêm Môn học mới"}</h2>
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="rounded-full p-1.5 text-muted transition hover:bg-slate-100 hover:text-ink"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col">
                        <div className="flex flex-col gap-5 p-6 max-h-[75vh] overflow-y-auto">
                            {/* General info */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                                        Mã môn học <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder="Ví dụ: MH-FRONTEND"
                                        className="w-full rounded-xl border border-line px-4 py-2.5 text-sm text-ink outline-none focus:border-wine focus:ring-1 focus:ring-wine"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                                        Tiêu đề môn học <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Ví dụ: Lập trình Web Frontend"
                                        className="w-full rounded-xl border border-line px-4 py-2.5 text-sm text-ink outline-none focus:border-wine focus:ring-1 focus:ring-wine"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">Mô tả môn học</label>
                                <textarea
                                    rows={2}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Nhập mô tả chi tiết môn học..."
                                    className="w-full rounded-xl border border-line px-4 py-2.5 text-sm text-ink outline-none focus:border-wine focus:ring-1 focus:ring-wine resize-none"
                                />
                            </div>

                            {/* Form Tabs */}
                            <div className="flex border-b border-line">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("rpoint")}
                                    className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-bold transition-all ${
                                        activeTab === "rpoint"
                                            ? "border-wine text-wine"
                                            : "border-transparent text-muted hover:text-ink"
                                    }`}
                                >
                                    <Award className="size-4" />
                                    Môn học có Rpoint
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("grading")}
                                    className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-bold transition-all ${
                                        activeTab === "grading"
                                            ? "border-wine text-wine"
                                            : "border-transparent text-muted hover:text-ink"
                                    }`}
                                >
                                    <Calculator className="size-4" />
                                    Công thức tính điểm
                                </button>
                            </div>

                            {/* Tab 1: Rpoint Config */}
                            {activeTab === "rpoint" && (
                                <div className="flex flex-col gap-4 rounded-2xl bg-slate-50/80 p-4 border border-line">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-ink">Bật tích lũy Rpoint</p>
                                            <p className="text-xs text-muted">Cho phép học viên nhận Rpoint khi hoàn thành môn học này</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={rPointEnabled}
                                            onChange={(e) => setRPointEnabled(e.target.checked)}
                                            className="size-5 accent-wine cursor-pointer rounded"
                                        />
                                    </div>

                                    {rPointEnabled && (
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-line/60">
                                            <div>
                                                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                                                    Điểm Rpoint thưởng
                                                </label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={rPointValue}
                                                    onChange={(e) => setRPointValue(Number(e.target.value))}
                                                    className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-wine"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                                                    Tỷ lệ hoàn thành tối thiểu (%)
                                                </label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    value={minCompletionRate}
                                                    onChange={(e) => setMinCompletionRate(Number(e.target.value))}
                                                    className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-wine"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tab 2: Grading Formula */}
                            {activeTab === "grading" && (
                                <div className="flex flex-col gap-4 rounded-2xl bg-slate-50/80 p-4 border border-line">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                        <div>
                                            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                                                Chuyên cần (%)
                                            </label>
                                            <input
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={attendanceWeight}
                                                onChange={(e) => setAttendanceWeight(Number(e.target.value))}
                                                className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-wine"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                                                Kiểm tra / Quiz (%)
                                            </label>
                                            <input
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={quizWeight}
                                                onChange={(e) => setQuizWeight(Number(e.target.value))}
                                                className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-wine"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                                                Thi cuối kỳ (%)
                                            </label>
                                            <input
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={examWeight}
                                                onChange={(e) => setExamWeight(Number(e.target.value))}
                                                className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-wine"
                                            />
                                        </div>
                                    </div>

                                    {!isWeightValid && (
                                        <div className="rounded-xl bg-amber-50 p-3 border border-amber-200 text-xs font-semibold text-amber-700">
                                            ⚠️ Tổng trọng số hiện tại là {totalWeight}%. Tổng các trọng số nên bằng 100%.
                                        </div>
                                    )}

                                    <div className="pt-2 border-t border-line/60">
                                        <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-1.5">
                                            Điểm Đạt tối thiểu (Pass Score)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            min={0}
                                            max={10}
                                            value={passScore}
                                            onChange={(e) => setPassScore(Number(e.target.value))}
                                            className="w-full sm:w-1/2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-wine"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 border-t border-line px-6 py-4 bg-slate-50/50">
                            <button
                                type="button"
                                onClick={() => onOpenChange(false)}
                                className="rounded-xl border border-line px-4 py-2 text-sm font-bold text-ink transition hover:bg-slate-100"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="rounded-xl bg-wine px-5 py-2 text-sm font-bold text-white shadow-xs transition hover:bg-wine/90 disabled:opacity-50"
                            >
                                {isSubmitting ? "Đang xử lý..." : initialData ? "Lưu thay đổi" : "Tạo Môn học"}
                            </button>
                        </div>
                    </form>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
```

- [ ] **Step 2: Commit Task 2**

---

### Task 3: Tạo Modal Confirm Xóa Môn Học

**Files:**
- Create: `src/views/courses/modals/delete-course-modal.tsx`

**Interfaces:**
- Consumes: `CourseItem`
- Produces: `DeleteCourseModal` component

- [ ] **Step 1: Xây dựng `DeleteCourseModal`**

```tsx
"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import type { CourseItem } from "@/types/course.types";

interface DeleteCourseModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    course: CourseItem | null;
    onConfirm: (id: string) => Promise<void>;
}

export function DeleteCourseModal({ isOpen, onOpenChange, course, onConfirm }: DeleteCourseModalProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    if (!course) return null;

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await onConfirm(course.id);
            onOpenChange(false);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <CustomModal.Root open={isOpen} onOpenChange={onOpenChange}>
            <CustomModal.Content className="max-w-md !rounded-[24px] w-full overflow-hidden">
                <Dialog className="flex flex-col outline-none">
                    <div className="flex items-center justify-between border-b border-line px-6 py-4">
                        <div className="flex items-center gap-2 text-rose-600 font-bold">
                            <AlertTriangle className="size-5" />
                            <span>Xác nhận xóa môn học</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="rounded-full p-1.5 text-muted transition hover:bg-slate-100 hover:text-ink"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    <div className="p-6">
                        <p className="text-sm text-ink leading-relaxed">
                            Bạn có chắc chắn muốn xóa môn học <strong className="text-wine">{course.title}</strong> ({course.code}) không?
                            Thao tác này không thể hoàn tác.
                        </p>
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-line px-6 py-4 bg-slate-50/50">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="rounded-xl border border-line px-4 py-2 text-sm font-bold text-ink transition hover:bg-slate-100"
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            disabled={isDeleting}
                            onClick={handleDelete}
                            className="rounded-xl bg-rose-600 px-5 py-2 text-sm font-bold text-white shadow-xs transition hover:bg-rose-700 disabled:opacity-50"
                        >
                            {isDeleting ? "Đang xóa..." : "Xác nhận Xóa"}
                        </button>
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
```

- [ ] **Step 2: Commit Task 3**

---

### Task 4: Tạo Component `CoursesListView` & `CoursesClientView`

**Files:**
- Create: `src/views/courses/courses-list-view.tsx`
- Create: `src/views/courses/courses-client-view.tsx`

**Interfaces:**
- Consumes: `getCoursesList`, `createCourse`, `updateCourse`, `deleteCourse`, `CourseFormModal`, `DeleteCourseModal`
- Produces: `CoursesListView`, `CoursesClientView` components

- [ ] **Step 1: Tạo `src/views/courses/courses-list-view.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Award, Calculator, Pencil, Plus, Trash2 } from "lucide-react";
import { TablePagination } from "@/components/application/pagination/table-pagination";
import { SearchFilters } from "@/components/application/search-filters/search-filters";
import { createCourse, deleteCourse, getCoursesList, updateCourse } from "@/services/course.service";
import type { CourseItem, CreateCoursePayload } from "@/types/course.types";
import { CourseFormModal } from "./modals/course-form-modal";
import { DeleteCourseModal } from "./modals/delete-course-modal";

const defaultLimit = 10;

export function CoursesListView() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(defaultLimit);

    // Modals state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<CourseItem | null>(null);

    const { data: courses = [], isLoading } = useQuery({
        queryKey: ["courses"],
        queryFn: getCoursesList,
    });

    const createMutation = useMutation({
        mutationFn: createCourse,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: CreateCoursePayload }) => updateCourse(id, payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCourse,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["courses"] }),
    });

    const handleSearchChange = (val: string) => {
        setSearch(val);
        setPage(1);
    };

    const handleCreateClick = () => {
        setSelectedCourse(null);
        setIsFormOpen(true);
    };

    const handleEditClick = (course: CourseItem) => {
        setSelectedCourse(course);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (course: CourseItem) => {
        setCourseToDelete(course);
        setIsDeleteOpen(true);
    };

    const handleFormSubmit = async (payload: CreateCoursePayload) => {
        if (selectedCourse) {
            await updateMutation.mutateAsync({ id: selectedCourse.id, payload });
        } else {
            await createMutation.mutateAsync(payload);
        }
    };

    const handleConfirmDelete = async (id: string) => {
        await deleteMutation.mutateAsync(id);
    };

    const filteredCourses = courses.filter((item) => {
        const query = search.toLowerCase();
        return item.title.toLowerCase().includes(query) || item.code.toLowerCase().includes(query);
    });

    const total = filteredCourses.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginatedCourses = filteredCourses.slice((page - 1) * limit, page * limit);

    return (
        <div className="flex w-full flex-1 flex-col gap-6 min-h-0">
            <div className="flex flex-1 flex-col rounded-3xl border border-line bg-white shadow-xs min-h-0 overflow-hidden">
                {/* Header Actions & Filter */}
                <div className="flex flex-col gap-4 border-b border-line py-4 px-5 sm:flex-row sm:items-center sm:justify-between">
                    <SearchFilters search={search} onSearchChange={handleSearchChange} searchPlaceholder="Tìm kiếm theo mã hoặc tiêu đề môn học..." />
                    <button
                        type="button"
                        onClick={handleCreateClick}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-wine px-4 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-wine/90 active:scale-95 shrink-0"
                    >
                        <Plus className="size-4.5" />
                        <span>Thêm Môn học</span>
                    </button>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto">
                    <table className="w-full min-w-[800px] table-auto border-collapse text-left text-sm text-ink">
                        <thead>
                            <tr className="border-b border-line bg-slate-50/50 text-[11px] font-bold tracking-wider text-muted uppercase">
                                <th className="w-16 px-6 py-4 text-center">STT</th>
                                <th className="w-36 px-6 py-4">Mã môn</th>
                                <th className="px-6 py-4">Tiêu đề môn học</th>
                                <th className="px-6 py-4">Cấu hình Rpoint</th>
                                <th className="px-6 py-4">Công thức điểm</th>
                                <th className="w-28 px-6 py-4 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted">
                                        Đang tải danh sách môn học...
                                    </td>
                                </tr>
                            ) : paginatedCourses.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted">
                                        Chưa có môn học nào
                                    </td>
                                </tr>
                            ) : (
                                paginatedCourses.map((item, index) => (
                                    <tr key={item.id} className="group transition duration-150 hover:bg-slate-50">
                                        <td className="border-b border-line group-last:border-b-0 px-6 py-4 text-center font-bold text-muted">
                                            {(page - 1) * limit + index + 1}
                                        </td>
                                        <td className="border-b border-line group-last:border-b-0 px-6 py-4 font-mono font-bold text-wine">
                                            {item.code}
                                        </td>
                                        <td className="border-b border-line group-last:border-b-0 px-6 py-4 font-bold text-ink">
                                            <div>{item.title}</div>
                                            {item.description && <div className="text-xs font-normal text-muted mt-0.5">{item.description}</div>}
                                        </td>
                                        <td className="border-b border-line group-last:border-b-0 px-6 py-4">
                                            {item.rPointConfig.enabled ? (
                                                <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
                                                    <Award className="size-3.5" />
                                                    <span>{item.rPointConfig.rPointValue} Rpoint ({item.rPointConfig.minCompletionRate}%)</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted font-medium">Không kích hoạt</span>
                                            )}
                                        </td>
                                        <td className="border-b border-line group-last:border-b-0 px-6 py-4 text-xs font-medium text-muted">
                                            <div className="flex items-center gap-2">
                                                <Calculator className="size-3.5 text-wine" />
                                                <span>
                                                    CC: {item.gradingFormula.attendanceWeight}% | Quiz: {item.gradingFormula.quizWeight}% | Thi: {item.gradingFormula.examWeight}% (Pass: {item.gradingFormula.passScore})
                                                </span>
                                            </div>
                                        </td>
                                        <td className="border-b border-line group-last:border-b-0 px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEditClick(item)}
                                                    className="inline-flex size-8 items-center justify-center rounded-xl bg-slate-100 text-ink transition hover:bg-wine hover:text-white"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Pencil className="size-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteClick(item)}
                                                    className="inline-flex size-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition hover:bg-rose-600 hover:text-white"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {total > 0 && (
                    <TablePagination
                        total={total}
                        page={page}
                        totalPages={totalPages}
                        limit={limit}
                        onPageChange={(p) => setPage(p)}
                        onLimitChange={(l) => {
                            setLimit(l);
                            setPage(1);
                        }}
                        className="shrink-0 border-t border-line px-6 py-3.5"
                    />
                )}
            </div>

            {/* Modals */}
            <CourseFormModal
                isOpen={isFormOpen}
                onOpenChange={setIsFormOpen}
                initialData={selectedCourse}
                onSubmit={handleFormSubmit}
            />

            <DeleteCourseModal
                isOpen={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                course={courseToDelete}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}
```

- [ ] **Step 2: Tạo `src/views/courses/courses-client-view.tsx`**

```tsx
"use client";

import { CoursesListView } from "./courses-list-view";

export function CoursesClientView() {
    return (
        <div className="flex flex-col flex-1 gap-6 p-6 h-full min-h-0">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-extrabold tracking-tight text-ink">Quản lý Môn học</h1>
                <p className="text-sm text-muted">Quản lý danh sách môn học, cấu hình tích lũy Rpoint và công thức tính điểm</p>
            </div>
            <CoursesListView />
        </div>
    );
}
```

- [ ] **Step 3: Commit Task 4**

---

### Task 5: Đấu nối Next.js App Router Page `/courses`

**Files:**
- Create: `src/app/courses/page.tsx`

**Interfaces:**
- Consumes: `CoursesClientView`
- Produces: Default Export `CoursesPage`

- [ ] **Step 1: Tạo `src/app/courses/page.tsx`**

```tsx
import type { Metadata } from "next";
import { CoursesClientView } from "@/views/courses/courses-client-view";

export const metadata: Metadata = {
    title: "Quản lý Môn học | LMS Portal",
    description: "Trang quản lý danh sách môn học, Rpoint và công thức tính điểm",
};

export default function CoursesPage() {
    return <CoursesClientView />;
}
```

- [ ] **Step 2: Kiểm tra Build & Render**
Chạy `npm run build` hoặc kiểm tra Next.js dev server để đảm bảo không có lỗi TypeScript / Linter.

- [ ] **Step 3: Commit Task 5**
