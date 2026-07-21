# Spec: Cấu hình Form Thêm/Sửa Chương Học (Session)

Tài liệu thiết kế chi tiết (spec) cho việc bổ sung đầy đủ các trường thông tin của thực thể Chương học (Session) vào cả hai form Thêm mới và Chỉnh sửa trên giao diện quản trị Admin (`lms-portal-admin`).

## 1. Yêu cầu & Mục tiêu
Bổ sung đầy đủ các trường dữ liệu của Session từ Backend lên giao diện Frontend Admin:
- **Thông tin chung:** Tên buổi học (`name`), loại buổi học (`type`), trạng thái kích hoạt (`status`), mô tả (`description`).
- **Tài nguyên học liệu:** Link mindmap (`mindmap`), trạng thái hiển thị mindmap (`isShowMindmap`), link SRS (`srs`), link PDF bài giảng (`pdf`), link Mini Project (`miniProject`), link Bài tập (`exercise`), Quiz (`quizzi`), Entrance Quiz (`practiceEntranceQuiz`).
- **Bài thực hành (Practice):** Nội dung thực hành (`practice.content`), hình thức nộp bài (`practice.submissionType`), danh sách tài liệu tham khảo động (`practice.resources`).

Giao diện form được thiết kế theo dạng **Phân Tab** gọn gàng trong Modal để tối ưu hóa trải nghiệm người dùng (UX) và giữ bố cục sạch sẽ.

## 2. Thiết kế Cơ sở dữ liệu & APIs
Các APIs liên quan từ Backend đã có sẵn và hỗ trợ đầy đủ các trường này:
- **Create Session:** `POST /api/staff/sessions` nhận `CreateSessionDto`
- **Update Session:** `PUT /api/staff/sessions/:id` nhận `UpdateSessionDto`

### Cập nhật Types trên Frontend
Cập nhật interface `Session` trong [material.types.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/types/material.types.ts) để đồng bộ với Database:
```typescript
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
    status?: boolean;
    type?: string;
    mindmap?: string;
    srs?: string;
    miniProject?: string;
    pdf?: string;
    exercise?: string;
    quizzi?: string;
    practiceEntranceQuiz?: string;
    isShowMindmap?: boolean;
    description?: string;
    practice?: SessionPractice | null;
}
```

## 3. Giao diện & Trải nghiệm Người dùng (UX/UI)
Khi người dùng ấn "Thêm chương học mới" hoặc "Sửa chương học", Modal sẽ hiện ra với **3 Tab** chuyển đổi:
- **Tab 1: Thông tin chung:**
  - *Tên chương học/buổi học* (Input text, required)
  - *Loại bài học* (Dropdown: Lý thuyết `LY_THUYET` / Thực hành `THUC_HANH`)
  - *Trạng thái* (Switch/Checkbox: Đã kích hoạt / Chưa kích hoạt)
  - *Mô tả ngắn* (Textarea)
- **Tab 2: Tài nguyên & Học liệu (Các ô nhập URL):**
  - *Link Mindmap* (Input text) + *Hiện Mindmap cho học viên* (Switch/Checkbox)
  - *Link tài liệu SRS* (Input text)
  - *Link tài liệu giảng dạy PDF* (Input text)
  - *Link tài liệu Mini Project* (Input text)
  - *Tên bài tập* (Input text)
  - *Tên Quiz* (Input text)
  - *Tên Entrance Quiz thực hành* (Input text)
- **Tab 3: Bài thực hành (Practice):**
  - *Nội dung thực hành* (Textarea / Rich Editor đơn giản)
  - *Cách thức nộp bài* (Dropdown: LINK, FILE, TEXT)
  - *Tài liệu tham khảo* (Danh sách động: các cặp `Nhãn (Label)` và `Đường dẫn (URL)`, có nút thêm dòng `+ Thêm tài liệu` và nút xóa dòng `x`).

## 4. Kế hoạch xác thực dữ liệu (Validation)
- Trường `name` bắt buộc nhập và không được để trống.
- Các trường URL cần đảm bảo định dạng URL cơ bản nếu có nhập.
- Tab "Bài thực hành" chỉ hiển thị các trường nhập liệu khi người dùng chọn hình thức nộp bài hoặc cấu hình thực hành.
