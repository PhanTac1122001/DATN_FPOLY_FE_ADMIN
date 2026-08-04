# Systems Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the training systems (hệ đào tạo) management page with full CRUD, client-side pagination, search filtering, and details/delete modal actions under the `/systems` URL.

**Architecture:** A modular React structure using Next.js App Router. We will create dedicated system services, typings, validation schemas, and components (modal & view), integrating the existing `<TablePagination />` and `<ConfirmModal />`.

**Tech Stack:** Next.js, React, TailwindCSS, Zod, React Hook Form, @tanstack/react-query, Lucide React, Iconsax React.

## Global Constraints
- Target URL is `/systems`.
- Call API at `/api/systems` (rewritten to `http://103.118.29.137:6789/v1/systems` via `next.config.ts`).
- Perform client-side pagination since GET `/systems` returns the full list.
- Exact styling match with the admin portal theme (dark/slate borders, rounded design elements, wine-colored buttons).

---

### Task 1: Navigation & Constants Configuration

**Files:**
- Modify: [admin-sidebar.constants.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/constants/admin-sidebar.constants.ts)
- Modify: [ui-text.constants.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/constants/ui-text.constants.ts)

**Interfaces:**
- Produces: `uiText.trainingSystem` translation block, and updated path in `dtItems`.

- [ ] **Step 1: Modify admin-sidebar.constants.ts to update route path**
  Find the item for "Hệ đào tạo" in `dtItems` and change its path from `"/training-systems-dt"` to `"/systems"`.
  ```typescript
  // target content:
  { label: "Hệ đào tạo", icon: PieChart, path: "/training-systems-dt" },
  // replacement:
  { label: "Hệ đào tạo", icon: PieChart, path: "/systems" },
  ```

- [ ] **Step 2: Add translation constants for training systems**
  Open `src/constants/ui-text.constants.ts` and append `trainingSystem` translation keys before the closing object brace.
  ```typescript
  // add before last "} as const;"
  trainingSystem: {
      title: "Quản lý Hệ đào tạo",
      subtitle: "Danh sách hệ đào tạo trong hệ thống lms",
      searchPlaceholder: "Tìm kiếm mã hệ, tên hệ...",
      addSystem: "Thêm hệ đào tạo",
      editSystem: "Sửa hệ đào tạo",
      deleteSystem: "Xóa hệ đào tạo",
      loading: "Đang tải danh sách hệ đào tạo...",
      noDataTitle: "Không tìm thấy hệ đào tạo nào",
      noDataDesc: "Thử thay đổi bộ lọc tìm kiếm hoặc thêm hệ đào tạo mới.",
      
      // Table headers
      thStt: "STT",
      thId: "Id hệ",
      thName: "Tên hệ",
      thCode: "Mã hệ",
      thCreatedAt: "Ngày tạo",
      thActions: "Hành động",

      // Actions/buttons
      viewDetails: "Xem chi tiết",
      learningPath: "Lộ trình học",
      deleteTooltip: "Xóa hệ đào tạo",

      // Add/Edit Modal
      addTitle: "Thêm hệ đào tạo mới",
      addSubtitle: "Tạo hệ đào tạo mới cho hệ thống quản lý.",
      editTitle: "Cập nhật hệ đào tạo",
      editSubtitle: "Chỉnh sửa mã và tên hệ đào tạo hiện tại.",
      labelCode: "Mã hệ đào tạo *",
      placeholderCode: "Nhập mã hệ đào tạo (VD: DT, EL, PK)",
      labelName: "Tên hệ đào tạo *",
      placeholderName: "Nhập tên hệ đào tạo đầy đủ",
      btnCancel: "Hủy bỏ",
      btnSave: "Lưu hệ đào tạo",
      btnUpdate: "Cập nhật",

      // Confirm Delete Modal
      confirmDeleteTitle: "Xóa hệ đào tạo?",
      confirmDeleteMessage: "Bạn có chắc chắn muốn xóa vĩnh viễn hệ đào tạo này? Hành động này không thể hoàn tác.",
      confirmDeleteBtn: "Xóa vĩnh viễn",
      confirmCancelBtn: "Hủy bỏ",

      // Toasts
      toastSuccess: "Thành công",
      toastError: "Lỗi",
      toastAddSuccess: "Đã thêm hệ đào tạo mới thành công.",
      toastAddError: "Không thể thêm hệ đào tạo.",
      toastUpdateSuccess: "Đã cập nhật hệ đào tạo thành công.",
      toastUpdateError: "Không thể cập nhật hệ đào tạo.",
      toastDeleteSuccess: "Đã xóa hệ đào tạo thành công.",
      toastDeleteError: "Không thể xóa hệ đào tạo.",
  },
  ```

- [ ] **Step 3: Commit constants changes**
  ```bash
  git add src/constants/admin-sidebar.constants.ts src/constants/ui-text.constants.ts
  git commit -m "feat(systems): configure sidebar path and add UI translations"
  ```

---

### Task 2: Types, API Service, and Schema Definition

**Files:**
- Create: [system.types.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/types/system.types.ts)
- Create: [system.service.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/services/system.service.ts)
- Create: [system.schema.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/schemas/system.schema.ts)

**Interfaces:**
- Produces: `System`, `CreateSystemRequest`, `UpdateSystemRequest` types; API client CRUD functions; and Zod validation schema `systemSchema`.

- [ ] **Step 1: Create system.types.ts**
  Write interface definitions to `src/types/system.types.ts`.
  ```typescript
  export interface System {
      id: string;
      systemCode: string;
      name: string;
      createdAt: string;
  }

  export interface CreateSystemRequest {
      code: string;
      name: string;
  }

  export interface UpdateSystemRequest {
      code?: string;
      name?: string;
  }

  export interface SystemModalProps {
      isOpen: boolean;
      onClose: () => void;
      system?: System | null;
  }
  ```

- [ ] **Step 2: Create system.service.ts**
  Write HTTP clients functions in `src/services/system.service.ts` referencing `/api/systems`.
  ```typescript
  import { httpClient } from "@/lib/http-client";
  import { HttpMethod } from "@/types/api-types";
  import type { CreateSystemRequest, System, UpdateSystemRequest } from "@/types/system.types";

  export async function getSystemsList(): Promise<System[]> {
      const response = await httpClient<any>("/api/systems", { method: HttpMethod.GET });
      return response?.data || response || [];
  }

  export async function createSystem(data: CreateSystemRequest): Promise<System> {
      const response = await httpClient<any>("/api/systems", {
          method: HttpMethod.POST,
          body: JSON.stringify(data),
      });
      return response?.data || response;
  }

  export async function updateSystem(id: string, data: UpdateSystemRequest): Promise<System> {
      const response = await httpClient<any>(`/api/systems/${id}`, {
          method: HttpMethod.PUT,
          body: JSON.stringify(data),
      });
      return response?.data || response;
  }

  export async function deleteSystem(id: string): Promise<void> {
      const response = await httpClient<any>(`/api/systems/${id}`, { method: HttpMethod.DELETE });
      return response?.data || response;
  }
  ```

- [ ] **Step 3: Create system.schema.ts**
  Write the Zod validation object schema to `src/schemas/system.schema.ts`.
  ```typescript
  import { z } from "zod";

  export const systemSchema = z.object({
      code: z.string().min(1, "Mã hệ đào tạo không được để trống"),
      name: z.string().min(1, "Tên hệ đào tạo không được để trống"),
  });

  export type SystemSchemaType = z.infer<typeof systemSchema>;
  ```

- [ ] **Step 4: Commit types, service and schema**
  ```bash
  git add src/types/system.types.ts src/services/system.service.ts src/schemas/system.schema.ts
  git commit -m "feat(systems): add types, HTTP service, and validation schema"
  ```

---

### Task 3: Systems Management Modal Component

**Files:**
- Create: [system-modal.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/components/application/modals/system-modal.tsx)

**Interfaces:**
- Consumes: `SystemModalProps`, `createSystem`, `updateSystem`, `systemSchema`.
- Produces: `<SystemModal />` component.

- [ ] **Step 1: Create system-modal.tsx**
  Implement the react-hook-form modal matching the styling layout of `staff-modal.tsx`.
  ```typescript
  "use client";

  import { useEffect } from "react";
  import { zodResolver } from "@hookform/resolvers/zod";
  import { useMutation, useQueryClient } from "@tanstack/react-query";
  import { X } from "lucide-react";
  import { Heading } from "react-aria-components";
  import { Controller, useForm } from "react-hook-form";
  import { Button } from "@/components/base/buttons/button";
  import { Input } from "@/components/base/input/input";
  import { CustomModal, Dialog } from "@/components/ui/custom-modal";
  import { UI_TEXT } from "@/constants/ui-text.constants";
  import { type SystemSchemaType, systemSchema } from "@/schemas/system.schema";
  import { createSystem, updateSystem } from "@/services/system.service";
  import { toast } from "@/services/toast.service";
  import type { SystemModalProps } from "@/types/system.types";

  export function SystemModal({ isOpen, onClose, system }: SystemModalProps) {
      const queryClient = useQueryClient();

      const {
          handleSubmit,
          control,
          reset,
          clearErrors,
          formState: { errors },
      } = useForm<SystemSchemaType>({
          resolver: zodResolver(systemSchema),
          defaultValues: {
              code: "",
              name: "",
          },
      });

      useEffect(() => {
          if (isOpen) {
              if (system) {
                  reset({
                      code: system.systemCode,
                      name: system.name,
                  });
              } else {
                  reset({
                      code: "",
                      name: "",
                  });
              }
          }
      }, [isOpen, system, reset]);

      const createMutation = useMutation({
          mutationFn: createSystem,
          onSuccess: () => {
              toast.success(UI_TEXT.trainingSystem.toastSuccess, UI_TEXT.trainingSystem.toastAddSuccess);
              queryClient.invalidateQueries({ queryKey: ["systems"] });
              onClose();
          },
          onError: (error: Error) => {
              toast.error(UI_TEXT.trainingSystem.toastError, error.message || UI_TEXT.trainingSystem.toastAddError);
          },
      });

      const updateMutation = useMutation({
          mutationFn: ({ id, data }: { id: string; data: SystemSchemaType }) => updateSystem(id, data),
          onSuccess: () => {
              toast.success(UI_TEXT.trainingSystem.toastSuccess, UI_TEXT.trainingSystem.toastUpdateSuccess);
              queryClient.invalidateQueries({ queryKey: ["systems"] });
              onClose();
          },
          onError: (error: Error) => {
              toast.error(UI_TEXT.trainingSystem.toastError, error.message || UI_TEXT.trainingSystem.toastUpdateError);
          },
      });

      const onSubmit = (data: SystemSchemaType) => {
          if (system) {
              updateMutation.mutate({ id: system.id, data });
          } else {
              createMutation.mutate(data);
          }
      };

      const isPending = createMutation.isPending || updateMutation.isPending;

      return (
          <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
              <CustomModal.Content className="max-w-md !overflow-visible !rounded-[24px]">
                  <Dialog className="flex max-h-[90vh] w-full flex-col rounded-[24px] bg-white shadow-2xl outline-none">
                      {/* Header */}
                      <div className="relative flex flex-col border-b border-slate-100 px-6 pt-6 pb-4">
                          <Heading slot="title" className="text-xl font-bold text-slate-900">
                              {system ? UI_TEXT.trainingSystem.editTitle : UI_TEXT.trainingSystem.addTitle}
                          </Heading>
                          <p className="mt-1 text-xs text-slate-500">
                              {system ? UI_TEXT.trainingSystem.editSubtitle : UI_TEXT.trainingSystem.addSubtitle}
                          </p>
                          <button
                              type="button"
                              onClick={onClose}
                              className="absolute top-5 right-5 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                              aria-label="Close"
                          >
                              <X className="size-5" />
                          </button>
                      </div>

                      {/* Form Body */}
                      <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
                          <div className="flex flex-1 flex-col gap-5 p-6">
                              <Controller
                                  name="code"
                                  control={control}
                                  render={({ field }) => (
                                      <Input
                                          label={
                                              <span>
                                                  {UI_TEXT.trainingSystem.labelCode.replace(" *", "")}{" "}
                                                  <span className="font-bold text-red-500">*</span>
                                              </span>
                                          }
                                          placeholder={UI_TEXT.trainingSystem.placeholderCode}
                                          hint={errors.code?.message}
                                          isInvalid={!!errors.code}
                                          value={field.value || ""}
                                          onChange={(val) => {
                                              field.onChange(val);
                                              clearErrors("code");
                                          }}
                                          onBlur={field.onBlur}
                                          ref={field.ref}
                                      />
                                  )}
                              />

                              <Controller
                                  name="name"
                                  control={control}
                                  render={({ field }) => (
                                      <Input
                                          label={
                                              <span>
                                                  {UI_TEXT.trainingSystem.labelName.replace(" *", "")}{" "}
                                                  <span className="font-bold text-red-500">*</span>
                                              </span>
                                          }
                                          placeholder={UI_TEXT.trainingSystem.placeholderName}
                                          hint={errors.name?.message}
                                          isInvalid={!!errors.name}
                                          value={field.value || ""}
                                          onChange={(val) => {
                                              field.onChange(val);
                                              clearErrors("name");
                                          }}
                                          onBlur={field.onBlur}
                                          ref={field.ref}
                                      />
                                  )}
                              />
                          </div>

                          {/* Footer Actions */}
                          <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4 rounded-b-[24px]">
                              <Button
                                  type="button"
                                  color="secondary"
                                  onClick={onClose}
                                  isDisabled={isPending}
                                  className="rounded-full border-slate-200 px-5 font-semibold text-slate-700 hover:bg-slate-100"
                              >
                                  {UI_TEXT.trainingSystem.btnCancel}
                              </Button>
                              <Button
                                  type="submit"
                                  color="primary"
                                  isLoading={isPending}
                                  className="rounded-full border-none bg-wine px-6 font-bold text-white shadow-md shadow-wine/10 hover:bg-wine-deep"
                              >
                                  {system ? UI_TEXT.trainingSystem.btnUpdate : UI_TEXT.trainingSystem.btnSave}
                              </Button>
                          </div>
                      </form>
                  </Dialog>
              </CustomModal.Content>
          </CustomModal.Root>
      );
  }
  ```

- [ ] **Step 2: Commit modal component**
  ```bash
  git add src/components/application/modals/system-modal.tsx
  git commit -m "feat(systems): implement create/edit modal component"
  ```

---

### Task 4: Systems Client & Table Views Integration

**Files:**
- Create: [systems-client-view.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/views/systems-client-view.tsx)
- Create: [systems-view.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/views/systems-view.tsx)
- Create: [page.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/app/systems/page.tsx)

**Interfaces:**
- Consumes: `<SystemModal />`, `TablePagination`, `getSystemsList`, `deleteSystem`.
- Produces: `<SystemsClientView />`, `<SystemsView />`, NextJS Route `/systems`.

- [ ] **Step 1: Create systems-client-view.tsx**
  Implement client auth validation wrapper under `src/views/systems-client-view.tsx`.
  ```typescript
  "use client";

  import { useEffect } from "react";
  import { AdminLayout } from "@/components/layout/admin/admin-layout";
  import { useAuth } from "@/hooks/use-auth";
  import { useAppRouter } from "@/hooks/use-app-router";
  import { SystemsView } from "./systems-view";
  import { UI_TEXT } from "@/constants/ui-text.constants";

  export function SystemsClientView() {
      const { user, isLoading } = useAuth();
      const router = useAppRouter();

      useEffect(() => {
          if (!isLoading && !user) {
              router.replace("/login");
          }
      }, [user, isLoading, router]);

      if (isLoading) {
          return (
              <div className="flex min-h-screen items-center justify-center bg-cream">
                  <div className="flex flex-col items-center gap-4">
                      <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
                  </div>
              </div>
          );
      }

      if (!user) {
          return null;
      }

      return (
          <AdminLayout title={UI_TEXT.trainingSystem.title} subtitle={UI_TEXT.trainingSystem.subtitle}>
              <SystemsView />
          </AdminLayout>
      );
  }
  ```

- [ ] **Step 2: Create systems-view.tsx**
  Implement the main layout, table view, search filtering, actions (detail, learning-path, delete), and pagination inside `src/views/systems-view.tsx`.
  ```typescript
  "use client";

  import { useState } from "react";
  import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
  import { AlertTriangle, Plus, Search, Trash2 } from "lucide-react";
  import { format } from "date-fns";
  import { ConfirmModal } from "@/components/application/modals/confirm-modal";
  import { SystemModal } from "@/components/application/modals/system-modal";
  import { Button } from "@/components/base/buttons/button";
  import { TablePagination } from "@/components/application/pagination/table-pagination";
  import { UI_TEXT } from "@/constants/ui-text.constants";
  import { deleteSystem, getSystemsList } from "@/services/system.service";
  import { toast } from "@/services/toast.service";
  import type { System } from "@/types/system.types";

  export function SystemsView() {
      const queryClient = useQueryClient();
      const [search, setSearch] = useState("");
      const [page, setPage] = useState(1);
      const [limit, setLimit] = useState(10);

      // Modal States
      const [isSystemModalOpen, setIsSystemModalOpen] = useState(false);
      const [isDeleteOpen, setIsDeleteOpen] = useState(false);
      const [selectedSystem, setSelectedSystem] = useState<System | null>(null);

      // Fetch list
      const { data: systems = [], isLoading } = useQuery({
          queryKey: ["systems"],
          queryFn: getSystemsList,
      });

      const deleteMutation = useMutation({
          mutationFn: deleteSystem,
          onSuccess: () => {
              toast.success(UI_TEXT.trainingSystem.toastSuccess, UI_TEXT.trainingSystem.toastDeleteSuccess);
              queryClient.invalidateQueries({ queryKey: ["systems"] });
              setIsDeleteOpen(false);
              setSelectedSystem(null);
          },
          onError: (error: Error) => {
              toast.error(UI_TEXT.trainingSystem.toastError, error.message || UI_TEXT.trainingSystem.toastDeleteError);
          },
      });

      const handleOpenEdit = (system: System) => {
          setSelectedSystem(system);
          setIsSystemModalOpen(true);
      };

      const handleOpenDelete = (system: System) => {
          setSelectedSystem(system);
          setIsDeleteOpen(true);
      };

      // Client-side search logic
      const filteredSystems = systems.filter((system) => {
          const matchQuery = search.toLowerCase();
          return (
              system.name.toLowerCase().includes(matchQuery) ||
              system.systemCode.toLowerCase().includes(matchQuery)
          );
      });

      // Pagination computations
      const total = filteredSystems.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const paginatedSystems = filteredSystems.slice((page - 1) * limit, page * limit);

      // Reset page when search query changes
      const handleSearchChange = (val: string) => {
          setSearch(val);
          setPage(1);
      };

      const formatDate = (dateStr: string) => {
          try {
              return format(new Date(dateStr), "dd/MM/yyyy");
          } catch (e) {
              return dateStr;
          }
      };

      return (
          <div className="flex w-full flex-col gap-8">
              {/* Toolbar */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative w-full max-w-xs">
                      <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                          <Search className="size-4" />
                      </span>
                      <input
                          type="text"
                          placeholder={UI_TEXT.trainingSystem.searchPlaceholder}
                          value={search}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          className="w-full rounded-full border border-slate-200 bg-white py-2 pr-4 pl-9 text-sm text-slate-900 placeholder-slate-400 transition outline-none focus:border-wine focus:ring-1 focus:ring-wine"
                      />
                  </div>

                  <Button
                      color="primary"
                      size="md"
                      onClick={() => {
                          setSelectedSystem(null);
                          setIsSystemModalOpen(true);
                      }}
                      className="gap-2 border-none bg-wine px-5 font-bold text-white shadow-md shadow-wine/20 hover:bg-wine-deep"
                      iconLeading={<Plus className="size-5 shrink-0" />}
                  >
                      {UI_TEXT.trainingSystem.addSystem}
                  </Button>
              </div>

              {/* Table Area */}
              <div className="rounded-2xl border border-slate-100 bg-white shadow-xs">
                  <div className="overflow-x-auto">
                      {isLoading ? (
                          <div className="flex min-h-[300px] flex-col items-center justify-center gap-4">
                              <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
                              <p className="text-sm font-semibold text-slate-500">{UI_TEXT.trainingSystem.loading}</p>
                          </div>
                      ) : filteredSystems.length === 0 ? (
                          <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 p-8 text-center">
                              <AlertTriangle className="size-10 text-slate-300" />
                              <p className="text-base font-bold text-slate-800">{UI_TEXT.trainingSystem.noDataTitle}</p>
                              <p className="text-sm text-slate-500">{UI_TEXT.trainingSystem.noDataDesc}</p>
                          </div>
                      ) : (
                          <>
                              <table className="w-full min-w-[800px] table-auto border-collapse text-left text-sm text-slate-700">
                                  <thead>
                                      <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-500 uppercase">
                                          <th className="w-16 px-6 py-4 text-center">{UI_TEXT.trainingSystem.thStt}</th>
                                          <th className="w-24 px-6 py-4 text-center">{UI_TEXT.trainingSystem.thId}</th>
                                          <th className="px-6 py-4">{UI_TEXT.trainingSystem.thName}</th>
                                          <th className="w-48 px-6 py-4 text-center">{UI_TEXT.trainingSystem.thCode}</th>
                                          <th className="w-48 px-6 py-4 text-center">{UI_TEXT.trainingSystem.thCreatedAt}</th>
                                          <th className="w-72 px-6 py-4 text-center">{UI_TEXT.trainingSystem.thActions}</th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                      {paginatedSystems.map((system, index) => (
                                          <tr key={system.id} className="group transition duration-150 hover:bg-slate-50/40">
                                              <td className="border-b border-slate-100 px-6 py-4 text-center font-semibold text-slate-400">
                                                  {(page - 1) * limit + index + 1}
                                              </td>
                                              <td className="border-b border-slate-100 px-6 py-4 text-center font-medium text-slate-600">
                                                  {system.id}
                                              </td>
                                              <td className="border-b border-slate-100 px-6 py-4 font-bold text-slate-900">
                                                  {system.name}
                                              </td>
                                              <td className="border-b border-slate-100 px-6 py-4 text-center font-semibold text-slate-600">
                                                  {system.systemCode}
                                              </td>
                                              <td className="border-b border-slate-100 px-6 py-4 text-center text-slate-500">
                                                  {formatDate(system.createdAt)}
                                              </td>
                                              <td className="border-b border-slate-100 px-6 py-4">
                                                  <div className="flex items-center justify-center gap-2">
                                                      <button
                                                          type="button"
                                                          onClick={() => handleOpenEdit(system)}
                                                          className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-white transition hover:bg-blue-50"
                                                      >
                                                          {UI_TEXT.trainingSystem.viewDetails}
                                                      </button>
                                                      <button
                                                          type="button"
                                                          className="rounded-lg border border-green-200 px-3 py-1.5 text-xs font-semibold text-green-600 bg-white transition hover:bg-green-50"
                                                          onClick={() => toast.success("Lộ trình học", `Hệ đào tạo: ${system.name}`)}
                                                      >
                                                          {UI_TEXT.trainingSystem.learningPath}
                                                      </button>
                                                      <button
                                                          type="button"
                                                          onClick={() => handleOpenDelete(system)}
                                                          className="flex items-center justify-center rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                                                          title={UI_TEXT.trainingSystem.deleteTooltip}
                                                      >
                                                          <Trash2 className="size-4" />
                                                      </button>
                                                  </div>
                                              </td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>

                              {/* Table Pagination */}
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
                                  className="border-t border-slate-100 px-6 py-4"
                              />
                          </>
                      )}
                  </div>
              </div>

              {/* Modals */}
              <SystemModal
                  isOpen={isSystemModalOpen}
                  onClose={() => {
                      setIsSystemModalOpen(false);
                      setSelectedSystem(null);
                  }}
                  system={selectedSystem}
              />

              <ConfirmModal
                  isOpen={isDeleteOpen}
                  onClose={() => setIsDeleteOpen(false)}
                  onConfirm={() => {
                      if (selectedSystem) {
                          deleteMutation.mutate(selectedSystem.id);
                      }
                  }}
                  title={UI_TEXT.trainingSystem.confirmDeleteTitle}
                  message={`${UI_TEXT.trainingSystem.confirmDeleteMessage} (${selectedSystem?.name})`}
                  confirmText={UI_TEXT.trainingSystem.confirmDeleteBtn}
                  cancelText={UI_TEXT.trainingSystem.confirmCancelBtn}
                  variant="danger"
                  isLoading={deleteMutation.isPending}
              />
          </div>
      );
  }
  ```

- [ ] **Step 3: Create page.tsx under src/app/systems/**
  Create routing file `src/app/systems/page.tsx`.
  ```typescript
  import type { Metadata } from "next";
  import { SystemsClientView } from "@/views/systems-client-view";
  import { UI_TEXT } from "@/constants/ui-text.constants";

  export const metadata: Metadata = {
      title: UI_TEXT.trainingSystem.title,
      description: UI_TEXT.trainingSystem.subtitle,
  };

  export default function SystemsPage() {
      return <SystemsClientView />;
  }
  ```

- [ ] **Step 4: Commit page views and routing changes**
  ```bash
  git add src/views/systems-client-view.tsx src/views/systems-view.tsx src/app/systems/page.tsx
  git commit -m "feat(systems): implement main paginated table view and NextJS route page"
  ```

---

### Task 5: Project Build Verification

**Files:**
- Test: Build sanity test

- [ ] **Step 1: Run production build check to ensure no lint/typescript issues**
  Run: `npm run build`
  Expected: SUCCESS

- [ ] **Step 2: Finalize changes**
  Inform user of successful implementation and verification.
