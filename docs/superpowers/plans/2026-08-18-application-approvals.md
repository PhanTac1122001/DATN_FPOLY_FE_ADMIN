# Quản lý Duyệt Đơn (Application Approvals) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the "Duyệt đơn" (Application Approvals) feature under the "Quản lý đào tạo" (Training Management) sidebar group in `lms-portal-admin`, supporting 7 application types with custom forms for "Đăng ký thi lại / Thi bổ sung" and "Đăng ký phúc khảo", filter controls, status tracking, file upload for payment receipts, and approval/rejection actions.

**Architecture:** Next.js App Router (`/application-approvals`) with client views, React state management, custom modals for request creation and detail preview, Lucide React icons, and standard Tailwind UI design consistent with existing admin pages.

**Tech Stack:** TypeScript, Next.js (App Router), React 19, Tailwind CSS, Lucide React icons, HTTP Client / Mock services.

## Global Constraints
- Naming & copy rules: Vietnamese titles and labels in `ui-text.constants.ts`.
- File structure & styling: Tailwind CSS with existing design tokens (`wine`, `brand`, `amber`, `emerald`, `rose`, `indigo`, soft-tinted cards).
- TypeScript: Strict type checks (`npx tsc --noEmit`).

---

### Task 1: Navigation Sidebar & UI Text Constants Setup

**Files:**
- Modify: `src/constants/admin-sidebar.constants.ts`
- Modify: `src/constants/ui-text.constants.ts`

**Interfaces:**
- Consumes: Existing `dtItems` array and `UI_TEXT` object structure.
- Produces: Sidebar entry `{ label: "Duyệt đơn", icon: FileCheck, path: "/application-approvals" }` and `UI_TEXT.applicationApprovals`.

- [ ] **Step 1: Add "Duyệt đơn" menu item to `dtItems` in `admin-sidebar.constants.ts`**

```ts
// src/constants/admin-sidebar.constants.ts
export const dtItems = [
    { label: "Hệ đào tạo", icon: PieChart, path: "/systems" },
    { label: "Môn học", icon: BookOpen, path: "/courses" },
    { label: "Roadmap môn học", icon: Waypoints, path: "/course-roadmap" },
    { label: "Lớp", icon: Users, path: "/classes" },
    { label: "Quản lý nhóm mẫu", icon: Network, path: "/groupwork" },
    { label: "Nhân viên", icon: UserCheck, path: "/staff" },
    { label: "Học viên", icon: User, path: "/users" },
    { label: "Phòng học", icon: Home, path: "/rooms" },
    { label: "Quản lý kỳ thi", icon: FileCheck, path: "/exams" },
    { label: "Quản lý ca thi", icon: Clock, path: "/exams-shifts" },
    { label: "Quản lý bộ đề", icon: FolderOpen, path: "/exams-sets" },
    { label: "Quản lý câu hỏi", icon: HelpCircle, path: "/exams-questions" },
    { label: "Chấm thi", icon: FileSignature, path: "/homework" },
    { label: "Quản lý điểm thi", icon: TrendingUp, path: "/grades" },
    { label: "Thống kê học tập", icon: PieChart, path: "/reports" },
    { label: "Thông báo", icon: Bell, path: "/notifications" },
    { label: "Duyệt đơn", icon: FileCheck, path: "/application-approvals" },
    { label: "Đăng ký bảo vệ lại / thi lại", icon: FileText, path: "/reprotect" },
    { label: "Đăng ký học lại", icon: RefreshCw, path: "/relearn" },
    { label: "Quản lý R-Points", icon: Settings, path: "/rpoints" },
];
```

- [ ] **Step 2: Add UI text constants to `ui-text.constants.ts`**

Add `applicationApprovals` object under `UI_TEXT`:

```ts
applicationApprovals: {
    title: "Duyệt đơn",
    subtitle: "Quản lý và phê duyệt các loại đơn đăng ký, đơn xin của sinh viên",
    btnCreate: "Tạo đơn mới",
    statTotal: "Tất cả các đơn",
    statPending: "Chờ duyệt",
    statApproved: "Đã duyệt",
    statRejected: "Từ chối",
    tabAll: "Tất cả loại đơn",
    tabReExam: "Thi lại / Thi bổ sung",
    tabReGrade: "Phúc khảo điểm",
    tabLeaveLongTerm: "Nghỉ học dài hạn",
    tabTuitionDelay: "Chậm nộp học phí",
    tabAcademicReserve: "Bảo lưu kết quả",
    tabExamPostpone: "Hoãn thi học phần",
    tabReLearn: "Học lại",
    filterSearchPlaceholder: "Tìm theo tên, MSSV, mã đơn...",
    filterSemesterPlaceholder: "Chọn học kỳ",
    filterCoursePlaceholder: "Chọn môn học",
    filterStatusPlaceholder: "Trạng thái",
    btnResetFilters: "Đặt lại",
    thCode: "Mã đơn",
    thStudent: "Sinh viên",
    thType: "Loại đơn",
    thCourseSemester: "Học kỳ & Môn học",
    thSubmittedAt: "Ngày gửi & File",
    thStatus: "Trạng thái",
    thAction: "Thao tác",
    statusPending: "Chờ duyệt",
    statusApproved: "Đã duyệt",
    statusRejected: "Từ chối",
    toastCreateSuccess: "Tạo đơn đăng ký thành công",
    toastApproveSuccess: "Phê duyệt đơn thành công",
    toastRejectSuccess: "Đã từ chối đơn đăng ký",
},
```

- [ ] **Step 3: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: PASS with 0 errors.

---

### Task 2: Data Models & Application Service Setup

**Files:**
- Create: `src/types/application-approval.types.ts`
- Create: `src/services/application-approval.service.ts`

**Interfaces:**
- Consumes: `httpClient` from `@/lib/http-client`.
- Produces: Types `ApplicationItem`, `ApplicationStats`, `CreateApplicationDto`, and `applicationApprovalService`.

- [ ] **Step 1: Create `src/types/application-approval.types.ts`**

```ts
export type ApplicationTypeEnum =
    | "RE_EXAM"
    | "RE_GRADE"
    | "LEAVE_LONG_TERM"
    | "TUITION_DELAY"
    | "ACADEMIC_RESERVE"
    | "EXAM_POSTPONE"
    | "RE_LEARN";

export type ApplicationStatusEnum = "PENDING" | "APPROVED" | "REJECTED";

export interface StudentInfo {
    id: string;
    studentCode: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    className?: string;
}

export interface ApplicationItem {
    id: string;
    code: string;
    type: ApplicationTypeEnum;
    typeName: string;
    student: StudentInfo;
    semesterId?: string;
    semesterName?: string;
    courseId?: string;
    courseName?: string;
    examType?: "RE_TAKE" | "SUPPLEMENTARY";
    currentGrade?: number;
    reason?: string;
    notes?: string;
    attachmentUrl?: string;
    attachmentName?: string;
    status: ApplicationStatusEnum;
    submittedAt: string;
    processedAt?: string;
    processedBy?: string;
    rejectReason?: string;
}

export interface ApplicationStats {
    totalCount: number;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
}

export interface CreateApplicationDto {
    type: ApplicationTypeEnum;
    studentId: string;
    semesterId?: string;
    courseId?: string;
    examType?: "RE_TAKE" | "SUPPLEMENTARY";
    currentGrade?: number;
    reason?: string;
    notes?: string;
    attachmentFile?: File | null;
}
```

- [ ] **Step 2: Create `src/services/application-approval.service.ts`**

Implement mock data fallback and API integration methods:
`getApplications(query)`, `getApplicationStats()`, `createApplication(dto)`, `approveApplication(id)`, `rejectApplication(id, rejectReason)`.

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: PASS.

---

### Task 3: Modals Implementation (Create Application & Application Details)

**Files:**
- Create: `src/views/application-approvals/components/create-application-modal.tsx`
- Create: `src/views/application-approvals/components/application-detail-modal.tsx`

**Interfaces:**
- Consumes: CustomModal / Dialog from `@/components/ui/custom-modal`, `applicationApprovalService`, `UI_TEXT`.
- Produces: Interactive modals for student request creation matching Images 2 & 3, and detail viewing/approving.

- [ ] **Step 1: Implement `CreateApplicationModal`**
  - Includes type selector (7 types).
  - Matches Image 2 for `RE_EXAM`: Học kỳ, Môn học, Radio: Thi lại (Đã thi không đạt) vs Thi bổ sung (Chưa thi được dự thi bổ sung), Lý do đăng ký (0/300), Ghi chú bổ sung (0/300), Upload file đính kèm (hóa đơn thanh toán 300.000đ).
  - Matches Image 3 for `RE_GRADE`: Học kỳ, Môn học, Điểm hiện tại, Nội dung đề nghị phúc khảo (101/500), Ghi chú bổ sung (0/300), Upload file đính kèm (hóa đơn thanh toán 50.000đ).

- [ ] **Step 2: Implement `ApplicationDetailModal`**
  - Displays full request details, student card, status badge, attachment preview, and approve/reject actions with feedback message.

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: PASS.

---

### Task 4: Main Application Approvals View & Route Setup

**Files:**
- Create: `src/views/application-approvals/application-approvals-view.tsx`
- Create: `src/app/application-approvals/page.tsx`

**Interfaces:**
- Consumes: `AdminLayout`, `ApplicationApprovalsView`, Modals, `applicationApprovalService`.
- Produces: Full admin page accessible at `/application-approvals`.

- [ ] **Step 1: Implement `ApplicationApprovalsView`**
  - Stats Cards (Total, Pending, Approved, Rejected).
  - Filter bar (Category Tabs, Semester ComboBox, Course ComboBox, Search bar, Status dropdown, Reset button).
  - Data table with sorting/pagination.
  - Integration with `CreateApplicationModal` and `ApplicationDetailModal`.

- [ ] **Step 2: Create Next.js page route `src/app/application-approvals/page.tsx`**

```tsx
// src/app/application-approvals/page.tsx
import { ApplicationApprovalsView } from "@/views/application-approvals/application-approvals-view";

export default function ApplicationApprovalsPage() {
    return <ApplicationApprovalsView />;
}
```

- [ ] **Step 3: Verify build and TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: PASS with 0 errors.

---

### Task 5: End-to-End Verification & Polish

**Files:**
- All touched files in `src/app/application-approvals`, `src/views/application-approvals`, `src/constants/admin-sidebar.constants.ts`.

- [ ] **Step 1: Check Next.js build**
Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 2: Verify Sidebar Link Navigation**
Navigate to `/application-approvals` from the sidebar under "Quản lý đào tạo". Confirm active highlighted link.

- [ ] **Step 3: Verify Form Modals & Actions**
Verify forms for "Đăng ký thi lại / Thi bổ sung" and "Đăng ký phúc khảo", attachment previews, and approve/reject flows.
