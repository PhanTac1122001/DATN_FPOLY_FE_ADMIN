# Đặc tả thiết kế: Thay đổi định dạng/nguồn học liệu bằng nút Repeat thay vì Xóa hoàn toàn & Hỗ trợ Gán link PDF

Tài liệu này mô tả thiết kế thay đổi hành vi tương tác đối với Video, Tài liệu (Reading), và Bài tập (Quiz). Thay vì hiển thị biểu tượng Thùng rác (để xóa hẳn học liệu), giao diện sẽ chuyển sang hiển thị biểu tượng **Repeat** (Lặp lại/Chọn lại) để mở trực tiếp hộp thoại chọn lại định dạng hoặc nguồn học liệu mới. Đồng thời hỗ trợ tính năng gán liên kết (URL) PDF thay vì chỉ tải tệp từ máy tính.

## Mục tiêu
1. **Biểu tượng Repeat thay cho Thùng rác**:
   - Chuyển đổi biểu tượng xóa học liệu (`Trash2`) thành biểu tượng đổi nguồn học liệu (`Repeat`).
   - Khi click vào biểu tượng này, mở trực tiếp modal lựa chọn nguồn video, tài liệu hoặc quiz.
2. **Hỗ trợ Gán link PDF**:
   - Trong modal chọn loại tài liệu đọc, cung cấp 3 lựa chọn: "Tải tệp PDF từ máy tính", "Gán liên kết PDF (Nhập URL trực tuyến)", và "Nội dung bài viết (Soạn thảo văn bản)".
   - Khi chọn gán liên kết PDF, hiển thị ô nhập URL. Sau khi xác nhận, hiển thị xem trước PDF từ link tương tự như file PDF tải lên.
   - Sửa đổi backend API `/lessons/:id/reading` để hỗ trợ xóa PDF khỏi cơ sở dữ liệu khi gửi chuỗi rỗng `pdf: ""`.

## Phương án thiết kế

### Backend (lms-portal-api)
Sửa đổi logic trong `LessonService.uploadReadingMaterial`:
- Hiện tại, nếu không gửi `pdfUrl`, backend tự động lấy lại PDF cũ từ `lesson.reading.pdf`.
- Thay đổi điều kiện: Chỉ khôi phục PDF cũ nếu `dto.pdf` là `undefined`. Nếu `dto.pdf` được truyền dưới dạng chuỗi rỗng `""`, tức là người dùng muốn xóa tệp PDF cũ, do đó ta lưu `pdf: undefined`.

### Frontend (lms-portal-admin)
1. **Quản lý state cho PDF URL:**
   - Khai báo state `readingPdfUrl` (string) trong `LessonEditorWrapper` để quản lý liên kết PDF nhập trực tiếp.
   - Đồng bộ `readingPdfUrl` khi tải bài học mới và reset khi xóa tài liệu.

2. **Chỉnh sửa giao diện và hành vi ở ReadingConfigTab:**
   - Thêm nút "Gán liên kết PDF" vào modal chọn nguồn.
   - Thêm modal nhập liên kết PDF (`isLinkModalOpen`, `tempLink`).
   - Cập nhật hiển thị và khung iframe xem trước để hỗ trợ đồng thời cả `file` và `pdfUrl`.

## Các file thay đổi đề xuất

### [lesson.service.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-api/src/modules/lesson/lesson.service.ts)
- Cập nhật điều kiện khôi phục PDF cũ thành: `else if (dto.pdf === undefined && lesson.reading?.pdf)`.

### [type-detail-course-view.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/views/type/type-detail-course-view.tsx)
- Import `Link as LinkIcon` từ `lucide-react`.
- Thêm state `readingPdfUrl` và cập nhật logic `handleSaveAll` để gửi `pdf: readingPdfUrl` (hoặc `""` nếu bị xóa).
- Cập nhật component `ReadingConfigTab` nhận các props `pdfUrl` và `setPdfUrl`.
- Thêm modal nhập liên kết và nút chọn liên kết trong `ReadingConfigTab`.
