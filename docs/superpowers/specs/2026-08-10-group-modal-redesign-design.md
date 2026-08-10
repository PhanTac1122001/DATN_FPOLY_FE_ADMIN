# Group Modal Redesign Specification

## 1. Overview
Redesign and widen `GroupModal` (`src/components/application/modals/group-modal.tsx`) in `lms-portal-admin` to synchronize its UI layout, title header, inputs, and button styling with `StaffModal` (`src/components/application/modals/staff-modal.tsx`).

## 2. Design Details

### 2.1 Modal Container & Width
- Expand modal max width from `max-w-2xl` to `max-w-3xl` (`!overflow-visible !rounded-[24px]`).
- Dialog container: `flex max-h-[90vh] w-full flex-col rounded-[24px] bg-white shadow-2xl outline-none`.

### 2.2 Modal Header
- Structure: Relative flex container with `border-b border-slate-100 px-6 pt-6 pb-4`.
- Title: `text-xl font-bold text-slate-900` ("Thêm nhóm học tập mới" / "Chỉnh sửa nhóm học tập").
- Subtitle: `mt-1 text-xs text-slate-500` ("Tạo nhóm mới để quản lý phân công môn học và danh sách sinh viên" / "Cập nhật thông tin nhóm học tập và danh sách sinh viên").
- Close button: `absolute top-5 right-5 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700` using `<X className="size-5" />`.

### 2.3 Form Fields & Styling
- **Group Title Input**:
  - Use `Input` component with styled label `<span>Tên / Tiêu đề nhóm <span className="font-bold text-red-500">*</span></span>`.
  - Placeholder: `Nhập tên nhóm (ví dụ: Nhóm 1 - Fullstack Frontend)`.
- **Group Description Textarea**:
  - Styled label: `<label className="text-sm font-semibold text-slate-700">Mô tả nhóm</label>`.
  - Textarea element: `w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-wine focus:outline-none focus:ring-1 focus:ring-wine transition`.
- **Applied Subjects Selector**:
  - Label: `<label className="text-sm font-semibold text-slate-700">Chọn Môn học áp dụng (Đã chọn: X)</label>`.
  - Search input: Styled with rounded pill/border and `Search` icon.
  - Tag pills: Clean selection chips styled with slate/wine active states.
- **Student Roster Selector**:
  - Label: `<label className="text-sm font-semibold text-slate-700">Thành viên sinh viên trong lớp (X/Y)</label>`.
  - Search input: Styled search input with `Search` icon.
  - Action button: "Chọn tất cả" / "Bỏ chọn tất cả" link button.
  - Roster list: Scrollable container with `border border-slate-100 rounded-2xl p-2 bg-slate-50/50`, item rows with avatar initials or code, and accent checkboxes.

### 2.4 Modal Footer
- Container: `flex justify-end gap-3 rounded-b-[24px] border-t border-slate-100 bg-slate-50/60 p-4`.
- Cancel button: `<Button type="button" color="secondary-gray" size="md" onClick={onClose} isDisabled={mutation.isPending}>Hủy</Button>`.
- Submit button: `<Button color="primary" size="md" onClick={() => mutation.mutate()} isLoading={mutation.isPending} isDisabled={!title.trim()} className="border-none bg-wine px-6 font-bold text-white hover:bg-wine-deep">{groupData ? "Cập nhật nhóm" : "Tạo nhóm"}</Button>`.
