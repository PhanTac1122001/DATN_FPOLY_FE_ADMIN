# Thiết kế Trang Quản Lý Bộ Đề Trắc Nghiệm E-Learning (/exams-sets-el)

Thiết kế trang **Quản lý bộ đề trắc nghiệm** thuộc E-learning với cấu trúc bảng và bộ lọc tương tự trang quản trị nhân viên (Staff list), kèm theo trang xem chi tiết bộ đề (/exams-sets-el/[id]).

## Yêu cầu thiết kế

1. **Đường dẫn URL**: `/exams-sets-el` và `/exams-sets-el/[id]`.
2. **Giao diện danh sách**:
   - Khung chứa (Container) dạng bo góc viền nhẹ tương tự Staff list.
   - Bảng hiển thị cột: STT, TÊN BỘ ĐỀ (hiển thị kèm thư mục màu đỏ, ID và số câu hỏi bên dưới), THỜI GIAN TẠO (kèm icon lịch), CHỨC NĂNG (icon Xem - xanh lá, Sửa - xanh biển, Xóa - đỏ).
   - Bộ lọc tìm kiếm bộ đề (SearchFilters).
3. **Giao diện chi tiết (`/exams-sets-el/[id]`)**:
   - Thẻ thông tin đầu trang chứa 4 ô thông tin: Tên bộ đề (kèm icon thư mục), Mã bộ đề (kèm icon thông tin), Thời gian tạo (kèm icon lịch), Số câu hỏi (kèm icon câu hỏi).
   - Hai Tab: "Soạn câu hỏi Trắc nghiệm" (hoạt động) và "Soạn bài Tự luận".
   - Nút "+ Tạo câu hỏi mới" màu đỏ rượu.
   - Danh sách các câu hỏi hiển thị chi tiết (đáp án đúng viền xanh lá, giải thích đáp án trong khung xám nhẹ, hiển thị số điểm ở góc phải).
4. **Dữ liệu giả lập**:
   - 10 bộ đề trắc nghiệm chuẩn xác theo dữ liệu trong hình vẽ.
   - Danh sách câu hỏi chi tiết giả lập cho bộ đề.

## Kế hoạch triển khai tập tin

- `src/types/exam-set.types.ts` (Định nghĩa interface)
- `src/constants/exam-set-mock.constants.ts` (Mock data)
- `src/app/exams-sets-el/page.tsx` (Trang danh sách)
- `src/app/exams-sets-el/[id]/page.tsx` (Trang chi tiết)
- `src/views/exam-set-list-view.tsx` (View danh sách)
- `src/views/exam-set-detail-view.tsx` (View chi tiết)
