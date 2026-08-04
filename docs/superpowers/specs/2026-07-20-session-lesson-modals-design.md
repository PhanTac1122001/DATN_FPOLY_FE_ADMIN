# Đặc tả thiết kế: Thay thế Prompt bằng Modal khi Thêm Chương học và Bài học

Tài liệu này mô tả thiết kế thay thế các hộp thoại `prompt` mặc định của trình duyệt bằng `CustomModal` (dùng `react-aria-components`) khi thêm chương học mới và thêm bài học mới trong trang chi tiết khóa học.

## Mục tiêu
- Cải thiện trải nghiệm người dùng (UX) và tính đồng bộ thẩm mỹ (UI) của hệ thống quản trị LMS.
- Loại bỏ các hộp thoại `prompt` mặc định của trình duyệt dễ bị chặn hoặc hiển thị không đẹp mắt.

## Chi tiết Thiết kế Giao diện (UI/UX)

### 1. Modal Thêm Chương Học Mới (Add Session Modal)
Được kích hoạt khi người dùng nhấn nút "+" ở tiêu đề phần "Cấu trúc khóa học" tại component `TypeDetailCourseView`.

- **Tiêu đề (Title):** Thêm chương học mới
- **Mô tả (Description):** Nhập tên chương học mới (Chapter name) để bắt đầu xây dựng cấu trúc khóa học.
- **Trường nhập (Input):**
  - Nhãn (Label): Tên chương học
  - Placeholder: Ví dụ: Giới thiệu về React, Phát triển ứng dụng...
  - Ràng buộc: Không được để trống.
- **Nút hành động (Buttons):**
  - **Hủy:** Đóng modal, reset input.
  - **Xác nhận:** Thực hiện gọi mutation `addSessionMutation`, đóng modal khi thành công.

### 2. Modal Thêm Bài Học Mới (Add Lesson Modal)
Được kích hoạt khi người dùng nhấn nút "+" ở bên cạnh tên chương học tại component `SessionNode`.

- **Tiêu đề (Title):** Thêm bài học mới
- **Mô tả (Description):** Nhập tên bài học mới vào chương học này.
- **Trường nhập (Input):**
  - Nhãn (Label): Tên bài học
  - Placeholder: Ví dụ: Tổng quan và cài đặt, Tạo component đầu tiên...
  - Ràng buộc: Không được để trống.
- **Nút hành động (Buttons):**
  - **Hủy:** Đóng modal, reset input.
  - **Xác nhận:** Thực hiện gọi mutation `addLessonMutation`, tự động mở rộng chương (set `isOpen = true`) và đóng modal khi thành công.

---

### 3. Trang chờ (Empty State) và Modal chọn loại tài liệu cho Bài đọc (Reading Material)
Được kích hoạt trong `ReadingConfigTab` khi chưa chọn hoặc tải tài liệu lên (`readingType === ""`).

- **Giao diện Empty State:**
  - Biểu tượng: Icon `FileText` cỡ lớn nằm trong vòng tròn nét đứt.
  - Tiêu đề: `"Tài liệu / Bài đọc hiện tại đang trống"`
  - Mô tả: `"Vui lòng chọn hoặc tải lên tài liệu cho bài học này để tiếp tục cấu hình học liệu."`
  - Nút bấm: `"+ Thêm tài liệu / bài đọc"` (màu đỏ gạch `#A14747`).
- **Giao diện Modal chọn loại tài liệu:**
  - Tiêu đề: `"Chọn loại tài liệu"`
  - Mô tả: `"Chọn cách thức bạn muốn thêm tài liệu vào bài học này"`
  - Các nút lựa chọn:
    - **Tải tệp PDF:** Chọn file từ máy tính.
    - **Nội dung bài viết:** Soạn thảo văn bản qua editor.
  - Nút Hủy để đóng modal.

---

## Thay đổi Code Đề xuất

### [TypeDetailCourseView](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/views/type/type-detail-course-view.tsx)
- Thêm state quản lý modal thêm chương: `isAddSessionOpen` (boolean) và `newSessionName` (string).
- Sửa hàm `handleAddSession` để mở modal thay vì gọi `prompt`.
- Thêm code JSX hiển thị modal thêm chương học mới bằng `CustomModal` và `Dialog`.
- Cập nhật component con `SessionNode`:
  - Thêm state quản lý modal thêm bài học: `isAddLessonOpen` (boolean) và `newLessonName` (string).
  - Sửa hàm `handleAddLesson` để mở modal thêm bài học thay vì gọi `prompt`.
  - Thêm code JSX hiển thị modal thêm bài học mới bằng `CustomModal` và `Dialog`.
- Cập nhật component con `ReadingConfigTab`:
  - Loại bỏ dropdown chọn và các code tính toán tọa độ dropdown, listener scroll/resize đi kèm.
  - Thêm state `isSelectModalOpen` (boolean) để quản lý modal chọn loại tài liệu.
  - Thêm JSX hiển thị Empty State khi `readingType === ""` và Modal `CustomModal` tương ứng.
