# Cấu hình Form Thêm/Sửa Chương Học (Session) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm toàn bộ các trường cấu hình của Chương học (Session) vào cả hai form Thêm mới và Sửa trên giao diện Admin, sử dụng bố cục phân tab để tối ưu không gian hiển thị.

**Architecture:** Cập nhật Types trong `material.types.ts`, mở rộng kiểu dữ liệu đầu vào cho các hàm `createSession` và `updateSession` trong `material.service.ts`, sau đó thiết kế một giao diện Form Tab gồm 3 phần (Thông tin chung, Học liệu chương, Bài thực hành) trong cả hai Modal Thêm/Sửa Session ở `type-detail-course-view.tsx`.

**Tech Stack:** React, Tailwind CSS, TypeScript, TanStack Query, Radix UI (nếu có, hoặc CustomModal hiện tại).

## Global Constraints
- Types phải khớp hoàn toàn với Backend schema.
- Giao diện phải sạch sẽ, hiện đại và thân thiện với người dùng (UX gọn gàng).
- Không được làm phá vỡ các tính năng hiện tại của Session hay Lesson.

---

### Task 1: Cập nhật Types và Services cho Session

**Files:**
- Modify: [material.types.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/types/material.types.ts)
- Modify: [material.service.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/services/material.service.ts)

**Interfaces:**
- Consumes: Backend DTO và model của Session
- Produces: Updated `Session` interface và các hàm API `createSession`/`updateSession` nâng cấp.

- [ ] **Step 1: Cập nhật interface `Session` trong `material.types.ts`**
  Show changes to [material.types.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/types/material.types.ts):
  ```diff
  export interface SessionPracticeResource {
      label?: string;
      url: string;
  }

  export interface SessionPractice {
      content: string;
      resources?: SessionPracticeResource[];
      submissionType: 'LINK' | 'FILE' | 'TEXT';
  }

  export interface Session {
      id: string;
      name: string;
      courseId: string;
      position: number;
      createdAt: string;
  +   status?: boolean;
  +   type?: string;
  +   mindmap?: string;
  +   srs?: string;
  +   miniProject?: string;
  +   pdf?: string;
  +   exercise?: string;
  +   quizzi?: string;
  +   practiceEntranceQuiz?: string;
  +   isShowMindmap?: boolean;
  +   description?: string;
  +   practice?: SessionPractice | null;
  }
  ```

- [ ] **Step 2: Cập nhật chữ ký hàm `createSession` và `updateSession` trong `material.service.ts`**
  Modify [material.service.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/services/material.service.ts) to:
  ```typescript
  export async function createSession(body: Omit<Session, "id" | "createdAt" | "position"> & { position?: number }): Promise<Session> {
      const res = await httpClient<any>("/api/staff/sessions", {
          method: HttpMethod.POST,
          body: JSON.stringify(body),
      });
      return res.data || res;
  }

  export async function updateSession(id: string, body: Partial<Omit<Session, "id" | "createdAt">>): Promise<Session> {
      const res = await httpClient<any>(`/api/staff/sessions/${id}`, {
          method: HttpMethod.PUT,
          body: JSON.stringify(body),
      });
      return res.data || res;
  }
  ```

- [ ] **Step 3: Biên dịch kiểm tra lỗi Type**
  Run command: `pnpm run type-check`
  Expected: Không có lỗi TypeScript liên quan đến hai tệp trên.

- [ ] **Step 4: Commit thay đổi**
  Run:
  ```bash
  git add src/types/material.types.ts src/services/material.service.ts
  git commit -m "feat(types): update Session interface and service methods for full fields"
  ```

---

### Task 2: Thiết kế giao diện Form Phân Tab và logic xử lý trong Modal

**Files:**
- Modify: [type-detail-course-view.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/views/type/type-detail-course-view.tsx)

**Interfaces:**
- Consumes: Cập nhật hàm `createSession` và `updateSession` cùng với kiểu `Session` mới.
- Produces: Form Tab đầy đủ chức năng phục vụ Thêm và Chỉnh sửa chương học.

- [ ] **Step 1: Tạo states quản lý các trường của Form và Tab hoạt động**
  Thêm các state trong component `TypeDetailCourseView` (đoạn đầu component):
  ```typescript
  // Form Tabs state: "general" | "resources" | "practice"
  const [addSessionTab, setAddSessionTab] = useState<"general" | "resources" | "practice">("general");
  const [editSessionTab, setEditSessionTab] = useState<"general" | "resources" | "practice">("general");

  // Form Fields state for adding session
  const [newSessionFields, setNewSessionFields] = useState({
      name: "",
      type: "LY_THUYET",
      status: false,
      mindmap: "",
      srs: "",
      miniProject: "",
      pdf: "",
      exercise: "",
      quizzi: "",
      practiceEntranceQuiz: "",
      isShowMindmap: false,
      description: "",
      practice: {
          content: "",
          resources: [] as { label: string; url: string }[],
          submissionType: "LINK" as "LINK" | "FILE" | "TEXT",
      }
  });

  // State editSession sẽ dùng kiểu Session đầy đủ
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  ```

- [ ] **Step 2: Cập nhật `addSessionMutation` và `updateSessionMutation`**
  Modify mutations to match the new fields.
  `addSessionMutation`:
  ```typescript
  const addSessionMutation = useMutation({
      mutationFn: (body: Omit<Session, "id" | "createdAt" | "position">) => createSession(body),
      onSuccess: () => {
          toast.success("Thành công", "Đã thêm chương học mới");
          queryClient.invalidateQueries({ queryKey: ["sessions", courseId] });
      },
  });
  ```
  `updateSessionMutation`:
  ```typescript
  const updateSessionMutation = useMutation({
      mutationFn: ({ sessionId, body }: { sessionId: string; body: Partial<Session> }) => updateSession(sessionId, body),
      onSuccess: () => {
          toast.success("Thành công", "Đã cập nhật chương học");
          queryClient.invalidateQueries({ queryKey: ["sessions", courseId] });
      },
  });
  ```

- [ ] **Step 3: Cập nhật hàm Submit**
  `handleSubmitAddSession`:
  ```typescript
  const handleSubmitAddSession = (e: React.FormEvent) => {
      e.preventDefault();
      if (newSessionFields.name.trim()) {
          addSessionMutation.mutate({
              ...newSessionFields,
              name: newSessionFields.name.trim(),
              courseId,
              // chỉ gửi practice nếu có nhập thông tin hoặc thiết lập
              practice: newSessionFields.practice.content.trim() ? newSessionFields.practice : null
          }, {
              onSuccess: () => {
                  setIsAddSessionOpen(false);
                  setNewSessionFields({
                      name: "",
                      type: "LY_THUYET",
                      status: false,
                      mindmap: "",
                      srs: "",
                      miniProject: "",
                      pdf: "",
                      exercise: "",
                      quizzi: "",
                      practiceEntranceQuiz: "",
                      isShowMindmap: false,
                      description: "",
                      practice: {
                          content: "",
                          resources: [],
                          submissionType: "LINK",
                      }
                  });
                  setAddSessionTab("general");
              }
          });
      }
  };
  ```

  Sửa sự kiện `onSubmit` của Edit form:
  ```typescript
  const handleSubmitEditSession = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingSession && editingSession.name.trim()) {
          const { id, createdAt, position, courseId, ...body } = editingSession;
          updateSessionMutation.mutate({
              sessionId: id,
              body: {
                  ...body,
                  name: body.name.trim(),
              }
          }, {
              onSuccess: () => {
                  setIsEditSessionOpen(false);
                  setEditingSession(null);
                  setEditSessionTab("general");
              }
          });
      }
  };
  ```

- [ ] **Step 4: Cập nhật Giao diện Modal (UI tabs và inputs)**
  Thay thế thẻ `<form>` trong cả hai Modal (Add và Edit) để vẽ cấu trúc Tabs sạch đẹp và trực quan.
  Bao gồm các nút điều khiển Tab và layout nhập liệu cho từng tab.
  Cập nhật Trình chỉnh sửa danh sách động Tài liệu tham khảo (`practice.resources`) cho phép người dùng click thêm/xóa dòng.

- [ ] **Step 5: Kiểm tra biên dịch**
  Run: `pnpm run type-check`
  Expected: Build thành công không lỗi.

- [ ] **Step 6: Commit thay đổi**
  Run:
  ```bash
  git add src/views/type/type-detail-course-view.tsx
  git commit -m "feat(ui): implement multi-tab Session form in add/edit modals"
  ```

---

## Verification Plan

### Automated Tests
- Chạy lệnh `pnpm run type-check` để đảm bảo code biên dịch an sau.
- Chạy lệnh `pnpm run lint:check` để kiểm tra chuẩn code style.

### Manual Verification
1. Mở trang quản trị khoá học.
2. Click nút "Thêm chương học mới" (Thêm Session).
3. Kiểm tra Modal mở ra có hiển thị 3 tab: "Thông tin chung", "Tài nguyên & Học liệu", "Bài thực hành".
4. Điền đầy đủ thông tin vào các tab (bao gồm chọn loại bài học, bật tắt trạng thái, điền URL học liệu, nhập nội dung bài thực hành và thêm động 2 tài liệu tham khảo trong tab 3). Ấn "Xác nhận".
5. Xác nhận Session mới được hiển thị trong danh sách.
6. Click icon sửa Session vừa tạo. Kiểm tra dữ liệu được populate đầy đủ vào các Tab tương ứng. Chỉnh sửa một số trường và Lưu. Xác nhận lưu thành công.
