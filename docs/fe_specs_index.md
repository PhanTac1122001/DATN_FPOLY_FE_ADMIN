# Tài liệu FE — LMS Portal

Nhánh: `feat/dynamic-courseware`  
Nguồn spec chi tiết: thư mục [`lms-portal-api/docs/`](../../lms-portal-api/docs/)

Mở đầu bằng file này — mục lục hướng dẫn đọc, mỗi chức năng một spec ở API docs.

## Mục lục nhanh (link sang API docs)

| Chức năng | Spec |
| --- | --- |
| Quy trình soạn môn & học liệu (bản đồ — đọc trước) | [staff_authoring_flow.md](../../lms-portal-api/docs/staff_authoring_flow.md) |
| Học liệu động & Publish | [dynamic_courseware_fe_spec.md](../../lms-portal-api/docs/dynamic_courseware_fe_spec.md) |
| Duyệt học liệu theo Lesson | [content_approval_fe_spec.md](../../lms-portal-api/docs/content_approval_fe_spec.md) |
| Màn hình học SV trên học liệu động | [student_dynamic_learning_fe_spec.md](../../lms-portal-api/docs/student_dynamic_learning_fe_spec.md) |
| Cấu hình R-point theo môn | [rpoint_config_fe_spec.md](../../lms-portal-api/docs/rpoint_config_fe_spec.md) |
| Cấu hình công thức điểm học tập | [course_scoring_fe_spec.md](../../lms-portal-api/docs/course_scoring_fe_spec.md) |
| Mục lục đầy đủ (API) | [fe_specs_index.md](../../lms-portal-api/docs/fe_specs_index.md) |

---

## Thứ tự đọc

### Làm phần staff soạn học liệu

1. Đọc [staff_authoring_flow.md](../../lms-portal-api/docs/staff_authoring_flow.md) trước (~222 dòng). Nó là bản đồ 9 bước và bảng thứ tự bắt buộc — biết cái gì phải có trước cái gì.
2. Đọc xong mới vào [dynamic_courseware_fe_spec.md](../../lms-portal-api/docs/dynamic_courseware_fe_spec.md) (~594 dòng, chi tiết từng endpoint) và [content_approval_fe_spec.md](../../lms-portal-api/docs/content_approval_fe_spec.md) (duyệt bài).

### Làm phần sinh viên học

Đọc [student_dynamic_learning_fe_spec.md](../../lms-portal-api/docs/student_dynamic_learning_fe_spec.md) (~357 dòng).

### Làm phần cấu hình điểm theo môn

- [rpoint_config_fe_spec.md](../../lms-portal-api/docs/rpoint_config_fe_spec.md) — điểm rèn luyện
- [course_scoring_fe_spec.md](../../lms-portal-api/docs/course_scoring_fe_spec.md) — điểm học tập

Hai màn trông giống nhau nhưng ranh giới khác nhau — đừng đọc một cái rồi suy ra cái kia.

---

## Bảy chỗ sai nhiều nhất — đọc trước khi code

1. **Có hai đường học song song.** Luôn gọi `GET /v1/student/courses/:courseId/published` để rẽ nhánh. `true` → học liệu động; `false` → đường cũ `student/progress/*`.

2. **Hai đường có tập trạng thái khác nhau** — đường mới 3 giá trị (`LOCKED` / `OPEN` / `COMPLETED`), đường cũ 4. Dùng chung component sẽ vẽ sai.

3. **Nút "Sang buổi tiếp theo"** đọc `status` của buổi kế trong outline. Không dùng `unlockedNextSessionId` làm điều kiện — field đó chỉ khác `null` ở đúng lần nộp vừa mở khóa, F5 xong là nút biến mất.

4. **Đừng hardcode form theo loại học liệu.** Dựng từ `GET /v1/staff/courseware/block-types`. Ngoại lệ duy nhất có chủ đích: disable công tắc `aiReview` của bài đọc — chưa có dịch vụ AI, bật lên là publish bị chặn.

5. **Điều kiện hoàn thành: `items` vắng mặt ≠ `items: []`.** Vắng mặt = "mọi mục bắt buộc"; mảng rỗng = "không mục nào" → sinh viên mở ra là xong. Đừng khởi tạo state bằng `items ?? []`.

6. **Khi tạo bài phải luôn gửi `courseId`.** Field này optional ở BE nên quên là bài vẫn tạo được, rồi không thêm được học liệu nào, và phải xóa tạo lại.

7. **Cấu hình điểm:** R-point không đặt được từ form sửa môn — phải nút riêng, gửi kèm sẽ bị bỏ im lặng và trả 200. Còn điểm học tập thì preset đặt được, nhưng nếu môn đang dùng công thức riêng thì đổi preset không có tác dụng — phải disable dropdown khi `isCustom: true`.

---

## Lưu ý về độ tin cậy

Docs viết từ code thật, có dẫn `file:line`. Nhưng luồng học liệu động chưa từng chạy với dữ liệu thật — DB hiện chưa có block nào. Nếu gặp chỗ API trả khác doc, **báo lại đừng tự workaround**: nhiều khả năng là bug BE chưa lộ, không phải doc sai.

Mục **"Chưa có — đề xuất"** ở cuối mỗi spec liệt kê endpoint không tồn tại — đọc trước khi lên kế hoạch sprint để khỏi chờ thứ chưa có.
