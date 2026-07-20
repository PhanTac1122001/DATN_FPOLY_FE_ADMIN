# Đặc tả thiết kế: Đồng bộ API Lưu và Sửa lỗi xóa Học liệu bài học

Tài liệu này mô tả thiết kế kỹ thuật để sửa đổi luồng lưu học liệu (Video, Tài liệu/Bài đọc, Bài tập/Quiz) của bài học nhằm loại bỏ race condition ghi đè dữ liệu trên DB, xử lý triệt để lỗi giao diện khi xóa tài liệu, và đồng bộ hóa các API tương ứng ở cả Frontend và Backend.

## Mục tiêu
1. **Sửa lỗi giao diện xóa tài liệu:** Đảm bảo khi người dùng xóa tài liệu, màn hình sẽ quay trở lại trạng thái trống (Empty State) để chọn lại phương thức tạo (Tải PDF hoặc soạn thảo).
2. **Loại bỏ Race Condition:** Gọi các API lưu cấu hình học liệu một cách tuần tự (sequential) thay vì song song (`Promise.all`) để tránh tình trạng ghi đè bản ghi trong MongoDB/Mongoose.
3. **Đồng bộ hóa chức năng Xóa/Hủy liên kết:** Cho phép xóa video, PDF đính kèm hoặc hủy liên kết quiz thành công từ giao diện xuống cơ sở dữ liệu.

---

## Chi tiết Thiết kế & Luồng dữ liệu

### 1. Đồng bộ trạng thái giao diện (Lifting `readingType` State)
- Chuyển state `readingType` từ component con `ReadingConfigTab` lên component cha `LessonEditorWrapper`.
- Khởi tạo giá trị `readingType` dựa vào dữ liệu bài học nhận được từ API:
  - Nếu bài học có PDF (`lessonDetails.reading.pdf`) -> `readingType = "pdf"`.
  - Nếu bài học có nội dung soạn thảo (`lessonDetails.reading.content`) -> `readingType = "text"`.
  - Nếu không có cả hai -> `readingType = ""`.
- Khi bấm xác nhận xóa tài liệu, hàm `handleConfirmDelete` sẽ reset `readingType = ""` cùng với các state nội dung, giúp giao diện tự động quay về trang Empty State.

### 2. Sửa luồng Lưu tuần tự (Sequential Save API Calls)
- Thay đổi hàm `handleSaveAll` trong `LessonEditorWrapper`:
  - Thay vì `await Promise.all(promises)`, ta sẽ thực thi từng API cấu hình một cách tuần tự bằng chuỗi `await` nếu trạng thái của chúng bị thay đổi (dirty).
  - Cập nhật state bài học nội bộ sau mỗi bước lưu thành công để đảm bảo dữ liệu luôn mới nhất.

### 3. Hỗ trợ Xóa/Hủy liên kết học liệu ở cả Frontend & Backend
- **Hủy liên kết Quiz:** 
  - Frontend: Khi xóa quiz, `quizId` được set thành `""`.
  - API DTO (`AssignLessonQuizDto`): Đổi `quizId` từ `@IsNotEmpty()` thành `@IsOptional()` để chấp nhận giá trị rỗng/null.
  - API Service (`assignQuiz`): Nếu `dto.quizId` rỗng, cập nhật `lesson.quizId = null` và lưu vào DB thay vì báo lỗi không tìm thấy quiz.
- **Xóa Video/Tài liệu:**
  - Frontend: Gửi rõ thông tin đã bị xóa lên API (ví dụ: `url: ""` cho video hoặc `pdf: ""` cho tài liệu).
  - API Service (`uploadVideoMaterial` & `uploadReadingMaterial`): 
    - Phân biệt rõ giữa `dto.url === undefined` (giữ nguyên video cũ) và `dto.url === ""` (xóa video cũ).
    - Phân biệt rõ giữa `dto.pdf === undefined` (giữ nguyên file PDF cũ) và `dto.pdf === ""` (xóa file PDF cũ).
    - Cập nhật DTO `UploadLessonReadingDto` để `content` là `@IsOptional()` thay vì `@IsNotEmpty()`, vì khi xóa tài liệu hoặc chỉ tải PDF, `content` sẽ rỗng.

---

## Các Tệp Thay Đổi Đề Xuất

### 1. Frontend Client
- **[MODIFY] [type-detail-course-view.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/views/type/type-detail-course-view.tsx)**
  - Đưa state `readingType` lên `LessonEditorWrapper`.
  - Cập nhật hàm `handleConfirmDelete` để reset `readingType`.
  - Cập nhật hàm `handleSaveAll` để gọi các API tuần tự và truyền tham số xóa rỗng rõ ràng.
  - Cập nhật interface props của `ReadingConfigTab` nhận `readingType` và `setReadingType` từ cha.

### 2. Backend API
- **[MODIFY] [upload-material.dto.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-api/src/modules/lesson/dto/upload-material.dto.ts)**
  - Cập nhật DTO `UploadLessonReadingDto` để `content` là optional.
  - Cập nhật DTO `AssignLessonQuizDto` để `quizId` là optional.
- **[MODIFY] [lesson.service.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-api/src/modules/lesson/lesson.service.ts)**
  - Cập nhật `uploadVideoMaterial` để phân biệt rõ tham số `url` undefined vs rỗng. Reset `lesson.video` về `null` nếu cả url và file đều trống.
  - Cập nhật `uploadReadingMaterial` để phân biệt rõ tham số `pdf` undefined vs rỗng. Reset `lesson.reading` về `null` nếu cả content và pdf đều trống.
  - Cập nhật `assignQuiz` để set `lesson.quizId = null` nếu `dto.quizId` trống.
