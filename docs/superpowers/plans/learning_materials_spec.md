# Tài liệu đặc tả tích hợp API & UI/UX Học Liệu (Learning Materials Spec)

Tài liệu này hướng dẫn đội ngũ phát triển Frontend thiết kế giao diện (UI/UX) và tích hợp các API học liệu mới cho phân hệ quản trị (**Staff**) và phân hệ học viên (**Student**).

---

## 1. Giao diện & Luồng nghiệp vụ Quản trị (Staff UI/UX)

### Luồng tổng quan (Flow)
```
[Chọn Hệ học] ➔ [Chọn Môn học] ➔ [Tạo/Chọn Buổi (Session) & Bài (Lesson)] ➔ [Cấu hình Học liệu (Video, Bài đọc, Quiz)]
```

### Chi tiết giao diện

#### Màn hình 1: Quản lý chương trình đào tạo
- **Hành động 1 (Chọn Hệ học):** Hiển thị danh sách/dropdown chứa các **Hệ học (Systems)** (Lấy dữ liệu từ `GET /v1/systems`).
- **Hành động 2 (Chọn Môn học):** Khi staff chọn một Hệ học, gọi API `GET /v1/staff/courses/system/:systemId` để lấy danh sách các **Môn học (Courses)** tương ứng và hiển thị lên lưới/danh sách môn học.
- **Hành động 3 (Quản lý Session & Lesson):** Khi staff nhấp vào một Môn học:
  - Hiển thị danh sách các **Buổi học (Sessions)** (Lấy từ `GET /v1/staff/sessions/course/:courseId`).
  - Cho phép tạo mới Session (gọi `POST /v1/staff/sessions`).
  - Trong mỗi Session, hiển thị danh sách các **Bài học (Lessons)** (Lấy từ `GET /v1/staff/lessons/session/:sessionId`).
  - Cho phép tạo mới Lesson (gọi `POST /v1/staff/lessons`).

#### Màn hình 2: Cấu hình học liệu bài học (Lesson Material Settings)
Khi nhấp vào một Bài học (Lesson), hệ thống hiển thị form cấu hình chia làm 3 Tab:

##### **Tab 1: Video bài học (Video Material)**
- **UI:**
  - Nút tải lên file video (kéo thả hoặc chọn file).
  - Hoặc ô nhập Direct URL (Ví dụ: link YouTube hoặc link S3 có sẵn).
  - Ô nhập thời lượng video (`durationTime` tính bằng giây).
  - **Quản lý Câu hỏi nhúng (Embedded Questions):**
    - Cho phép staff bấm nút "Thêm câu hỏi nhúng".
    - Nhập thời điểm xuất hiện câu hỏi (`timeInVideo` tính bằng giây).
    - Nhập nội dung câu hỏi, chọn loại câu hỏi (`SINGLE_CHOICE` hoặc `MULTIPLE_CHOICE`).
    - Thêm các tùy chọn đáp án, tích chọn đáp án đúng (`isCorrect`).
- **Tích hợp API:**
  - Gửi request đến `POST /v1/staff/lessons/:id/video` dưới dạng `multipart/form-data`.
  - Tham số: `file` (nếu tải trực tiếp), `url` (nếu dán link), `durationTime`, và `questions` (chuyển đổi mảng câu hỏi thành chuỗi JSON stringified).

##### **Tab 2: Bài đọc (Reading Material)**
- **UI:**
  - Trình soạn thảo văn bản hỗ trợ Markdown hoặc Rich Text (`content`).
  - Nút tải lên file PDF đính kèm bài học (`file`).
  - **Quản lý Câu hỏi bài đọc (Embedded Questions):**
    - Tương tự như video, cho phép thêm câu hỏi trắc nghiệm kiểm tra độ hiểu bài đọc.
- **Tích hợp API:**
  - Gửi request đến `POST /v1/staff/lessons/:id/reading` dưới dạng `multipart/form-data`.
  - Tham số: `file` (file PDF), `content` (nội dung văn bản), và `questions` (JSON stringified).

##### **Tab 3: Bài tập kiểm tra (Quiz Material)**
- **UI:**
  - Dropdown tìm kiếm và chọn một đề kiểm tra (`quizId`) có sẵn trong hệ thống (lấy danh sách từ `GET /v1/staff/quizzes`).
- **Tích hợp API:**
  - Gửi request `PUT /v1/staff/lessons/:id/quiz` dạng JSON với body `{ quizId: "..." }`.

---

## 2. Giao diện & Luồng nghiệp vụ Học viên (Student UI/UX)

### Luồng tổng quan (Flow)
```
[Chọn Hệ học] ➔ [Chọn Môn học] ➔ [Vào trang học trực tuyến (Lớp/Buổi/Bài)]
```

- **Hành động 1:** Sinh viên chọn Hệ học của mình và gọi `GET /v1/student/courses/system/:systemId` để hiển thị các môn học mình được phép học.
- **Hành động 2:** Vào màn hình chi tiết bài học của Môn học, hiển thị danh sách bài học và trạng thái tiến độ (lấy từ `GET /v1/student/progress/courses/:courseId`).

### UX Học bài (Study Lesson Player)
Khi học viên mở một bài học (gọi `GET /v1/student/lessons/:id`), Frontend cần kiểm tra và hiển thị các học liệu đi kèm:

#### **Trường hợp 1: Bài học có Video (`lesson.video` != null)**
- **UX:**
  - Render trình phát video (`lesson.video.url`).
  - Lắng nghe sự kiện thay đổi thời gian phát của video (`timeupdate`).
  - Khi thời gian phát đạt tới giá trị `timeInVideo` của một câu hỏi trong danh sách `lesson.video.questions`:
    - Tạm dừng video (`video.pause()`).
    - Hiển thị cửa sổ popup chặn giữa màn hình yêu cầu học viên trả lời câu hỏi trắc nghiệm đó.
    - Học viên chọn đáp án và ấn "Trả lời".
    - Gọi API `POST /v1/student/progress/lessons/:lessonId/video` để nộp đáp án.
    - Trả kết quả đúng/sai. Nếu đúng/hoàn thành, cho phép đóng popup và tiếp tục phát video (`video.play()`).

#### **Trường hợp 2: Bài học có Bài đọc (`lesson.reading` != null)**
- **UX:**
  - Hiển thị nội dung bài viết định dạng Markdown/HTML (`lesson.reading.content`).
  - Hiển thị khung xem tài liệu PDF (`lesson.reading.pdf`) trực tiếp nếu có.
  - Hiển thị danh sách câu hỏi kiểm tra bài đọc (`lesson.reading.questions`) ở cuối trang hoặc dạng popup.
  - Học viên trả lời và ấn nộp bài đọc, gọi API `POST /v1/student/progress/lessons/:lessonId/reading` để tính điểm tiến độ.

#### **Trường hợp 3: Bài học có Quiz (`lesson.quizId` != null)**
- **UX:**
  - Hiển thị nút "Bắt đầu làm bài kiểm tra".
  - Chuyển hướng học viên sang module thi trắc nghiệm dựa vào `lesson.quizId`. Khi làm xong gọi `POST /v1/student/progress/lessons/:lessonId/quiz`.

---

## 3. Đặc tả chi tiết các API Tích hợp

### 3.1. Lấy danh sách môn học theo hệ học
Dùng chung cấu trúc cho cả Staff và Student.

- **Staff URL:** `GET /v1/staff/courses/system/:systemId`
- **Student URL:** `GET /v1/student/courses/system/:systemId`
- **Headers:** `Authorization: Bearer <token>`
- **Response mẫu (Success `200 OK`):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "60c72b2f9b1d8b2bad000003",
      "name": "Lập trình NodeJS cơ bản",
      "courseCode": "NODEJS-01",
      "position": 1,
      "hour": 30,
      "courseCover": "https://example.com/cover.png",
      "description": "Khóa học NodeJS dành cho người mới bắt đầu",
      "isVisible": true
    }
  ]
}
```

---

### 3.2. Cấu hình Video học liệu (Staff)
Cập nhật video đính kèm cùng bộ câu hỏi trắc nghiệm chặn dòng video.

- **URL:** `POST /v1/staff/lessons/:id/video`
- **Method:** `POST`
- **Headers:** 
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **Body parameters:**
  - `file`: (File binary, optional) Video đính kèm.
  - `url`: (String, optional) Nhập thủ công link video ngoài (YouTube URL...).
  - `durationTime`: (Number/String, optional) Tổng số giây của video. Nếu là link YouTube và staff không gửi trường này, hệ thống sẽ tự động cào và phân tích trang YouTube để lấy thời lượng video tự động.
  - `questions`: (JSON String, optional) Mảng các câu hỏi nhúng. Ví dụ:
  ```json
  [
    {
      "content": "NodeJS chạy trên runtime nào sau đây?",
      "type": "SINGLE_CHOICE",
      "timeInVideo": 45,
      "points": 1,
      "options": [
        {"content": "V8 Engine", "isCorrect": true},
        {"content": "JVM", "isCorrect": false},
        {"content": "Gecko", "isCorrect": false}
      ]
    }
  ]
  ```

---

### 3.3. Cấu hình Bài đọc học liệu (Staff)
Cập nhật văn bản bài học và file đính kèm (PDF/Slide) cùng bộ câu hỏi trắc nghiệm kiểm tra cuối bài đọc.

- **URL:** `POST /v1/staff/lessons/:id/reading`
- **Method:** `POST`
- **Headers:** 
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **Body parameters:**
  - `file`: (File binary, optional) PDF tài liệu đính kèm.
  - `pdf`: (String, optional) Nhập thủ công link PDF có sẵn.
  - `content`: (String, required) Nội dung văn bản bài học.
  - `questions`: (JSON String, optional) Mảng các câu hỏi kiểm tra bài đọc. Ví dụ:
  ```json
  [
    {
      "content": "Chọn phát biểu đúng về Event Loop",
      "type": "SINGLE_CHOICE",
      "points": 2,
      "options": [
        {"content": "Chạy đơn luồng không đồng bộ", "isCorrect": true},
        {"content": "Chạy đa luồng đồng bộ", "isCorrect": false}
      ]
    }
  ]
  ```

---

### 3.4. Gắn Quiz vào bài học (Staff)
- **URL:** `PUT /v1/staff/lessons/:id/quiz`
- **Method:** `PUT`
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Request Body:**
```json
{
  "quizId": "60c72b2f9b1d8b2bad00000a"
}
```

---

### 3.5. Đối tượng Trả về Lesson (`LessonEntity` Schema)
Dữ liệu trả về khi gọi thông tin chi tiết bài học (`GET /v1/student/lessons/:id` hoặc `GET /v1/staff/lessons/:id`):
```json
{
  "id": "60c72b2f9b1d8b2bad000001",
  "name": "Bài 1: Tổng quan NodeJS",
  "sessionId": "60c72b2f9b1d8b2bad000005",
  "status": true,
  "videoUrl": "https://example-bucket.s3.amazonaws.com/uploads/video.mp4",
  "pdf": "https://example-bucket.s3.amazonaws.com/uploads/reading.pdf",
  "video": {
    "url": "https://example-bucket.s3.amazonaws.com/uploads/video.mp4",
    "durationTime": 300,
    "questions": [
      {
        "_id": "60c72b2f9b1d8b2bad00000f",
        "content": "NodeJS chạy trên runtime nào sau đây?",
        "type": "SINGLE_CHOICE",
        "timeInVideo": 45,
        "points": 1,
        "options": [
          {"content": "V8 Engine", "isCorrect": true},
          {"content": "JVM", "isCorrect": false}
        ]
      }
    ]
  },
  "reading": {
    "content": "Nội dung lý thuyết tổng quan về NodeJS...",
    "pdf": "https://example-bucket.s3.amazonaws.com/uploads/reading.pdf",
    "questions": [
      {
        "_id": "60c72b2f9b1d8b2bad000011",
        "content": "Chọn phát biểu đúng về Event Loop",
        "type": "SINGLE_CHOICE",
        "points": 2,
        "options": [
          {"content": "Chạy đơn luồng không đồng bộ", "isCorrect": true},
          {"content": "Chạy đa luồng đồng bộ", "isCorrect": false}
        ]
      }
    ]
  },
  "quizId": "60c72b2f9b1d8b2bad00000a"
}
```
