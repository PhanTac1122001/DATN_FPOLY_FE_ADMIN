# Design Specification: Quản lý Duyệt Đơn (Application Approvals)

## Overview
Feature "Duyệt đơn" (Application Approvals) provides training managers and administrators with a centralized system to view, search, approve, reject, and create student applications and requests under the **"Quản lý đào tạo"** (Training Management) sidebar menu in `lms-portal-admin`.

This module covers 7 specific application types, including detailed custom forms for **Đăng ký thi lại / Thi bổ sung** (Exam Re-take / Supplementary Exam) and **Đăng ký phúc khảo** (Grade Re-examination), complete with fee information guidelines and payment receipt attachment upload support.

---

## 1. Sidebar Navigation Integration

Modify `c:\Users\Admin\Desktop\lmsPortal\lms-portal-admin\src\constants\admin-sidebar.constants.ts`:
Add a new item to `dtItems` (Quản lý đào tạo group):
```ts
{ label: "Duyệt đơn", icon: FileCheck, path: "/application-approvals" }
```

---

## 2. Supported Application Types & Fields

| Application Type Key | Display Name | Required Form Fields & Specific Requirements |
| :--- | :--- | :--- |
| `RE_EXAM` | Đăng ký thi lại / Thi bổ sung | - Học kỳ (*)<br>- Môn học (*)<br>- Hình thức: `Thi lại` (Đã thi nhưng không đạt) / `Thi bổ sung` (Chưa thi, phép bổ sung)<br>- Lý do đăng ký (textarea max 300)<br>- Ghi chú bổ sung (textarea max 300)<br>- Đính kèm tệp hóa đơn thanh toán (*) (PDF/JPG/PNG <= 5MB)<br>- Informational note: Lệ phí **300.000đ** / lần. |
| `RE_GRADE` | Đăng ký phúc khảo | - Học kỳ (*)<br>- Môn học (*)<br>- Điểm hiện tại (*)<br>- Nội dung đề nghị phúc khảo (*) (textarea max 500)<br>- Ghi chú bổ sung (textarea max 300)<br>- Đính kèm tệp hóa đơn thanh toán (*) (PDF/JPG/PNG <= 5MB)<br>- Informational note: Phí phúc khảo **50.000đ**. |
| `LEAVE_LONG_TERM` | Đơn xin ngừng học: nghỉ học có thời hạn | - Học kỳ (*), Thời gian nghỉ (số tháng/học kỳ), Lý do (*), Tệp đơn đính kèm / Hóa đơn. |
| `TUITION_DELAY` | Đơn xin chậm nộp học phí | - Học kỳ (*), Môn học/Lớp (*), Lý do xin chậm nộp (*), Hạn cam kết thanh toán (*), Tệp đơn đính kèm. |
| `ACADEMIC_RESERVE` | Đơn xin bảo lưu kết quả học tập | - Học kỳ (*), Lý do bảo lưu (*), Tệp đơn đính kèm / Chứng nhận. |
| `EXAM_POSTPONE` | Đơn xin hoãn thi học phần | - Học kỳ (*), Môn học (*), Lý do xin hoãn thi (*), Tệp minh chứng (giấy khám sức khỏe/lý do do khác). |
| `RE_LEARN` | Đơn đăng ký học lại | - Học kỳ (*), Môn học đăng ký lại (*), Ghi chú (*), Tệp đơn/Hóa đơn đính kèm. |

---

## 3. Data Structure & TypeScript Types (`src/types/application-approval.types.ts`)

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
    studentCode: string; // MSSV
    fullName: string;
    email: string;
    avatarUrl?: string;
    className?: string;
}

export interface ApplicationItem {
    id: string;
    code: string; // e.g., "DON-2026-001"
    type: ApplicationTypeEnum;
    typeName: string;
    student: StudentInfo;
    semesterId?: string;
    semesterName?: string;
    courseId?: string;
    courseName?: string;
    examType?: "RE_TAKE" | "SUPPLEMENTARY"; // for RE_EXAM
    currentGrade?: number; // for RE_GRADE
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
```

---

## 4. User Interface & Layout Architecture

### Page Component (`src/app/application-approvals/page.tsx`)
Rendered within `<AdminLayout>` with `title="Duyệt đơn"` and `subtitle="Quản lý và phê duyệt các loại đơn đăng ký, đơn xin của sinh viên"`.

### Main View Component (`src/views/application-approvals/application-approvals-view.tsx`)

1. **Header Actions & Stats Bar**:
   - Soft-tinted Cards showing counts for: **Tất cả các đơn**, **Chờ duyệt** (Amber), **Đã duyệt** (Emerald), **Từ chối** (Rose).
   - "Tạo đơn mới" button opening the Application Creation Modal/Drawer.

2. **Filters Row**:
   - **Type Tabs / Filter**: Filter by exact Application Type or "All Types".
   - **Semester ComboBox**: Filter by Semester ("Học kỳ 2 - Năm học 2024 - 2025").
   - **Subject ComboBox**: Filter by Subject ("CT313 - Cấu trúc dữ liệu và giải thuật").
   - **Search Input**: Live search by MSSV, Student Name, or Application Code.
   - **Reset Filters**: Clear all filters.

3. **Data Table**:
   - Columns:
     - `Mã đơn` (Code & Badge)
     - `Sinh viên` (Avatar, Full Name, MSSV, Class)
     - `Loại đơn` (Category Tag)
     - `Học kỳ & Môn học`
     - `Ngày gửi & File đính kèm` (Icon preview link for receipt / attached PDF/DOC)
     - `Trạng thái` (Status Badge with custom styling)
     - `Thao tác` (Action buttons: Eye icon for Detail Modal, CheckCircle icon for Quick Approve, XCircle icon for Reject).

4. **Creation Modal (`src/views/application-approvals/components/create-application-modal.tsx`)**:
   - Select application type dropdown.
   - Dynamic form rendering based on selected type:
     - If `RE_EXAM`: Shows Semester select, Course select, Radio buttons for `Thi lại` vs `Thi bổ sung` with explanatory texts, Reason textarea (300 chars max), Notes textarea (300 chars max), File Dropzone for Payment Receipt (300.000đ fee notice callout box).
     - If `RE_GRADE`: Shows Semester select, Course select, Current Grade input (6.5), Re-examination content textarea (500 chars max), Notes textarea (300 chars max), File Dropzone for Payment Receipt (50.000đ fee notice callout box).
     - For other application types: Semester, Course, Reason, Attached PDF/DOC file upload.

5. **Detail & Approval Modal (`src/views/application-approvals/components/application-detail-modal.tsx`)**:
   - Comprehensive read-only view of submitted student info, exam type, attached receipt preview (PDF/Image link), submission time.
   - Approval controls: "Phê duyệt đơn" or "Từ chối đơn" (with rejection reason input field).

---

## 5. UI Text Constants Addition

Update `c:\Users\Admin\Desktop\lmsPortal\lms-portal-admin\src\constants\ui-text.constants.ts` under `UI_TEXT.applicationApprovals` with all Vietnamese string constants.

---

## 6. Implementation Checklist
- [x] Create Design Specification document.
- [ ] Update `admin-sidebar.constants.ts` & `ui-text.constants.ts`.
- [ ] Implement `application-approval.types.ts` & `application-approval.service.ts` with initial mock data & API helper methods.
- [ ] Implement `CreateApplicationModal` & `ApplicationDetailModal`.
- [ ] Implement `ApplicationApprovalsView` & `/application-approvals/page.tsx`.
- [ ] Verify build with `npx tsc --noEmit` and manual route verification.
