# Design Spec: Trang Quản Lý Môn Học (Courses Management)

## Overview
Xây dựng trang quản lý Môn học (E-Learning Course Management) tại tuyến đường `/courses` thuộc dự án `lms-portal-admin`. 
Trang cho phép Quản trị viên/Staff xem danh sách môn học, thêm môn học mới, chỉnh sửa thông tin môn học và xóa môn học. Form thêm/sửa môn học có cấu trúc 2 Tab để cấu hình điểm thưởng RPoint và công thức tính điểm của môn học.

## Architectural Changes

### 1. File Structure & Routes
- `src/app/courses/page.tsx`: Route chính cho trang quản lý môn học, khai báo metadata và render `CoursesClientView`.
- `src/views/courses/courses-client-view.tsx`: Client view bao gồm Header (Title, Action Button) và Table List view.
- `src/views/courses/courses-list-view.tsx`: Bảng danh sách môn học, thanh tìm kiếm (`SearchFilters`), phân trang (`TablePagination`), các nút thao tác Thêm, Sửa, Xóa.
- `src/views/courses/modals/course-form-modal.tsx`: Modal thêm mới & chỉnh sửa môn học với thiết kế 2 Tab:
  - **Thông tin cơ bản**: Tiêu đề môn học, Mã môn học, Mô tả.
  - **Tab 1 - Rpoint (Điểm thưởng)**: Bật/tắt Rpoint, Số điểm Rpoint nhận được, Điều kiện Rpoint.
  - **Tab 2 - Công thức tính điểm (Grading Formula)**: Trọng số Chuyên cần (%), Trọng số Bài kiểm tra/Quiz (%), Trọng số Thi cuối kỳ (%), Điểm đạt tối thiểu (Pass score).
- `src/views/courses/modals/delete-course-modal.tsx`: Modal xác nhận xóa môn học.
- `src/types/course.types.ts`: Khai báo Type/Interface dữ liệu cho Môn học.
- `src/services/course.service.ts`: Service Mock/API xử lý các thao tác CRUD Môn học.

## User Interface & Design System
- Tuân thủ thiết kế đồng bộ với hệ thống `lms-portal-admin`:
  - Dùng `CustomModal` (`react-aria-components`), Lucide Icons (`Plus`, `Pencil`, `Trash2`, `Award`, `Calculator`, `Search`).
  - Màu chủ đạo: `wine` (`#721011` / Tailwind class `bg-wine`, `text-wine`), nền trắng `bg-white`, border `border-line`, text `text-ink`, text phụ `text-muted`.
  - Hiệu ứng chuyển tab mượt mà với UI chuẩn thiết kế LMS Portal.

## Data Model (`Course`)
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
  passScore: number;        // Điểm đạt tối thiểu (thang điểm 10)
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
```

## Form Logic & Validation
1. Form validate tiêu đề môn học không được để trống.
2. Kiểm tra tổng trọng số tính điểm (Chuyên cần % + Quiz % + Final Exam %) phải bằng 100%. Nếu khác 100%, hiển thị cảnh báo để hỗ trợ người dùng nhập đúng.
3. Chuyển đổi linh hoạt giữa 2 Tab Rpoint và Công thức tính điểm trong cùng Modal.

## Verification Plan
1. Truy cập `/courses` trên trình duyệt.
2. Thử nghiệm mở Modal Thêm môn học -> Chuyển qua lại 2 Tab -> Điền thông tin -> Lưu môn học.
3. Kiểm tra danh sách hiển thị môn học mới thêm.
4. Thử nghiệm nút Chỉnh sửa môn học -> Thay đổi thông tin Rpoint và Trọng số tính điểm -> Lưu lại -> Kiểm tra dữ liệu được cập nhật.
5. Thử nghiệm nút Xóa môn học -> Xác nhận xóa -> Kiểm tra môn học bị gỡ khỏi danh sách.
