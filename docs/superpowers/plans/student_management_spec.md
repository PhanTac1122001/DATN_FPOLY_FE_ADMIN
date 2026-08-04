# Tài liệu đặc tả tích hợp API & UI/UX Quản lý học viên (Student Management Spec)

Tài liệu này hướng dẫn đội ngũ phát triển Frontend thiết kế giao diện (UI/UX) và tích hợp các API Quản lý học viên cho phân hệ quản trị (**Staff**).

---

## 1. Giao diện & Luồng nghiệp vụ Quản trị (Staff UI/UX)

### Luồng tổng quan (Flow)
```
[Thống kê nhanh] ➔ [Tìm kiếm/Lọc học viên] ➔ [Xem chi tiết/Cập nhật/Quản lý Lớp học]
                                         ➔ [Tạo mới học viên / Import Excel]
```

### Chi tiết giao diện

#### Màn hình chính: Danh sách Học viên & Báo cáo nhanh (Dashboard & Search Grid)

1. **Thẻ thống kê nhanh (Overview Cards):**
   - **UI:** Thiết kế các card hiển thị số lượng học viên theo từng Trạng thái (Đang học, Bảo lưu, Bỏ học, Tốt nghiệp...) và phân nhóm theo Hệ đào tạo (Hệ học).
   - **Tích hợp API:** Gọi API `GET /v1/students/report/by-system` để lấy dữ liệu thống kê.

2. **Bộ lọc & Tìm kiếm (Filters & Search):**
   - **UI:**
     - Ô tìm kiếm theo **Họ tên học viên** (`name`).
     - Ô tìm kiếm theo **Mã học viên** (`studentCode`).
     - Dropdown chọn **Hệ học (System)**: Dữ liệu tải từ `GET /v1/systems`.
     - Dropdown chọn **Trạng thái học viên** (`studentStatusSearch`): Danh sách trạng thái chuẩn (`ĐANG HỌC`, `BỎ HỌC`, `TỐT NGHIỆP`, `TỐT NGHIỆP SỚM`, `BẢO LƯU`, `CHỜ BẢO LƯU`, `ĐÌNH CHỈ`).
   - **Tích hợp API:** Khi người dùng thay đổi bộ lọc hoặc nhấn nút tìm kiếm, gọi API `GET /v1/students` truyền kèm các Query Parameters tương ứng.

3. **Lưới danh sách học viên (Table Grid):**
   - **UI:** Bảng hiển thị thông tin gồm các cột:
     - Avatar & Mã học viên.
     - Họ và tên, Email, Số điện thoại.
     - Cơ sở đào tạo (HN/HCM), Hệ học đang tham gia.
     - Trạng thái hiện tại (Đang học, Bảo lưu...).
     - Cột Thao tác: Nút **Sửa/Chi tiết**, **Quản lý Lớp học**, **Xóa**.
     - Phân trang (Pagination): Điều khiển trang (`page`) và kích thước trang (`pageSize`).
   - **Tích hợp API:** Tải dữ liệu từ `GET /v1/students` có phân trang. Khi bấm **Xóa**, hiển thị popup xác nhận và gọi `DELETE /v1/students/:id`.

---

#### Màn hình/Modal: Thêm mới Học viên (Add Student)

- **UI:** Form nhập các thông tin sau:
  - **Họ và tên** (bắt buộc).
  - **Email** (bắt buộc, dùng để đăng nhập).
  - **Số điện thoại** (bắt buộc).
  - **Ngày sinh** (bắt buộc, định dạng date picker `YYYY-MM-DD`).
  - **Cơ sở đào tạo** (bắt buộc, chọn `HN` hoặc `HCM`).
  - **Hệ học mặc định** (bắt buộc, dropdown chọn 1 Hệ học từ danh sách `GET /v1/systems`).
  - **Mã học viên** (không bắt buộc, nếu để trống hệ thống sẽ tự động tạo mã dạng `RE<YY><Số thứ tự>`).
  - **Mật khẩu** (không bắt buộc, nếu để trống hệ thống sẽ tự sinh mặc định theo cấu trúc ngày sinh của học viên dạng `DDMMYYYY`).
- **Tích hợp API:** Gửi request dạng JSON đến `POST /v1/students`.

---

#### Màn hình/Modal: Chỉnh sửa học viên (Edit Student)

- **UI:** Form tải thông tin hiện tại của học viên (gọi từ `GET /v1/students/:id`), cho phép chỉnh sửa:
  - **Ảnh đại diện (Avatar):** Cho phép chọn/kéo thả file ảnh để cập nhật.
  - **Thông tin cơ bản:** Họ tên, Email, Số điện thoại, Cơ sở đào tạo, Ngày sinh, Mã học viên.
  - **Trạng thái học tập:** Dropdown chọn trạng thái (Đang học, Bảo lưu, Bỏ học...).
  - **Khóa tài khoản:** Ô nhập ngày khóa tài khoản (`lockedUntil` dạng `YYYY-MM-DD`).
  - **Hệ học liên kết:** Multi-select cho phép chọn nhiều Hệ học (`systemIds`) thay vì chỉ chọn 1 hệ như lúc tạo mới.
  - **Mật khẩu mới:** Cho phép nhân viên Reset mật khẩu cho học viên nếu cần.
- **Tích hợp API:**
  - Gửi request đến `PUT /v1/students/:id` dưới dạng **`multipart/form-data`** để upload file avatar cùng các thông tin dạng text khác.

---

#### Màn hình/Modal: Nhập danh sách học viên từ Excel (Excel Import)

- **UI:**
  - Dropdown chọn **Hệ học (System)** để gán mặc định cho toàn bộ học viên trong file Excel (bắt buộc).
  - Khu vực tải file: Kéo và thả file Excel (`.xlsx`) hoặc bấm để chọn file.
  - Hiển thị kết quả sau khi gửi: Số lượng học viên được thêm mới (`inserted`) và số lượng học viên được cập nhật hệ học (`updated`).
- **Tích hợp API:**
  - Gửi request đến `POST /v1/students/import/:systemId` dưới dạng `multipart/form-data` với tham số `file`.

---

#### Màn hình/Tab: Quản lý Lớp học của Học viên (Class Enrollments)

Màn hình này giúp Staff quản lý việc xếp lớp học cho học viên, cho phép xem danh sách các lớp học viên đã tham gia và xếp học viên vào các lớp mới.

- **UI:**
  - **Danh sách lớp học hiện tại của học viên:**
    - Liệt kê thông tin lớp học: Tên lớp, Trạng thái trong lớp (Đang học, Bảo lưu, Đã thôi học...), Trạng thái hoạt động (Active/Inactive), Ngày xếp lớp.
    - Hành động: Nút **Cập nhật trạng thái lớp** (Mở modal/form chỉnh sửa `isActive` và `status` trong lớp) hoặc **Xóa khỏi lớp**.
  - **Xếp vào lớp mới (Add to Class):**
    - Dropdown tìm kiếm và chọn Lớp học (dữ liệu lấy từ `GET /v1/staff/classes`).
    - Form chọn trạng thái bắt đầu (`status`, mặc định `STUDYING`) và tùy chọn active (`isActive`, mặc định `true`).
    - Nút **Lưu/Xếp lớp**.
- **Tích hợp API:**
  - Lấy danh sách lớp của học viên: `GET /v1/staff/student-classes/student/:studentId`.
  - Xếp lớp mới: Gửi request `POST /v1/staff/student-classes` dạng JSON với body `{ studentId, classId, isActive, status }`.
  - Cập nhật trạng thái lớp: Gửi request `PUT /v1/staff/student-classes/:id` dạng JSON với body `{ isActive, status }`.
  - Xóa khỏi lớp: Gửi request `DELETE /v1/staff/student-classes/:id`.

---

## 2. Đặc tả chi tiết các API Tích hợp

### 2.1. Lấy danh sách hệ đào tạo (Hệ học)
Dùng để điền dữ liệu vào các Dropdown lựa chọn Hệ học trên giao diện.

- **URL:** `GET /v1/systems`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Response mẫu (`200 OK`):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "60c72b2f9b1d8b2bad00000a",
      "systemCode": "BTEC",
      "name": "Hệ Quốc Tế BTEC",
      "createdAt": "2026-07-16T03:00:00.000Z"
    },
    {
      "id": "60c72b2f9b1d8b2bad00000b",
      "systemCode": "STANDARD",
      "name": "Hệ Đào Tạo Chuẩn",
      "createdAt": "2026-07-16T03:00:00.000Z"
    }
  ]
}
```

---

### 2.2. Báo cáo thống kê số lượng học viên
Dùng để vẽ các thẻ thống kê nhanh (Overview Cards) ở đầu trang.

- **URL:** `GET /v1/students/report/by-system`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Response mẫu (`200 OK`):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "systemId": "60c72b2f9b1d8b2bad00000a",
      "systemName": "Hệ Quốc Tế BTEC",
      "systemCode": "BTEC",
      "total": 120,
      "byStatus": {
        "ĐANG HỌC": 100,
        "BẢO LƯU": 10,
        "BỎ HỌC": 10
      }
    },
    {
      "systemId": "unknown",
      "systemName": null,
      "systemCode": null,
      "total": 5,
      "byStatus": {
        "ĐANG HỌC": 5
      }
    }
  ]
}
```

---

### 2.3. Lấy danh sách học viên (Phân trang + Tìm kiếm)
- **URL:** `GET /v1/students`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Query Parameters:**
  - `page`: (NumberString, optional) Số trang hiện tại, mặc định 1.
  - `pageSize`: (NumberString, optional) Số bản ghi mỗi trang.
  - `name`: (String, optional) Tìm kiếm theo họ tên học viên (không phân biệt hoa thường).
  - `studentCode`: (String, optional) Tìm kiếm theo mã học viên.
  - `systemId`: (String, optional) Lọc theo ID hệ đào tạo.
  - `studentStatusSearch`: (String, optional) Lọc theo Trạng thái học tập (`ĐANG HỌC`, `BỎ HỌC`, `TỐT NGHIỆP`...).
- **Response mẫu (`200 OK`):**
```json
{
  "statusCode": 200,
  "data": {
    "items": [
      {
        "id": "60c72b2f9b1d8b2bad000100",
        "studentCode": "RE260001",
        "fullName": "Nguyễn Văn A",
        "email": "nguyenvana@gmail.com",
        "phone": "0987654321",
        "dateOfBirth": "2000-01-31T00:00:00.000Z",
        "gender": "MALE",
        "status": "ĐANG HỌC",
        "location": "HN",
        "avatar": "https://example.com/avatar.png",
        "isLocked": false,
        "lockedUntil": null,
        "systemIds": ["60c72b2f9b1d8b2bad00000a"],
        "specializeIds": [],
        "createdAt": "2026-07-16T03:00:00.000Z",
        "updatedAt": "2026-07-16T03:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10
  }
}
```

---

### 2.4. Xem chi tiết thông tin một học viên
- **URL:** `GET /v1/students/:id`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Response mẫu (`200 OK`):**
```json
{
  "statusCode": 200,
  "data": {
    "id": "60c72b2f9b1d8b2bad000100",
    "studentCode": "RE260001",
    "fullName": "Nguyễn Văn A",
    "email": "nguyenvana@gmail.com",
    "phone": "0987654321",
    "dateOfBirth": "2000-01-31T00:00:00.000Z",
    "gender": "MALE",
    "status": "ĐANG HỌC",
    "identityCard": "012345678912",
    "address": "Số 1 Cầu Giấy, Hà Nội",
    "hometown": "Hải Phòng",
    "languages": "Tiếng Anh, Tiếng Nhật",
    "facebookAddress": "https://facebook.com/nguyenvana",
    "role": "STUDENT",
    "location": "HN",
    "avatar": "https://example.com/avatar.png",
    "isLocked": false,
    "lockedUntil": null,
    "systemIds": ["60c72b2f9b1d8b2bad00000a"],
    "specializeIds": [],
    "createdAt": "2026-07-16T03:00:00.000Z",
    "updatedAt": "2026-07-16T03:00:00.000Z"
  }
}
```

---

### 2.5. Tạo mới học viên
- **URL:** `POST /v1/students`
- **Method:** `POST`
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Request Body:**
```json
{
  "fullName": "Trần Thị B",
  "email": "tranthib@gmail.com",
  "phone": "0912345678",
  "location": "HCM",
  "dateOfBirth": "2002-05-15",
  "systemId": "60c72b2f9b1d8b2bad00000a",
  "studentCode": "RE260002",
  "password": "mypassword123"
}
```
> [!NOTE]
> Các trường `studentCode` và `password` là optional. Nếu bỏ trống mật khẩu, hệ thống sẽ gán mật khẩu mặc định là ngày sinh dạng `DDMMYYYY` (ví dụ: ngày sinh `15-05-2002` -> mật khẩu mặc định `15052002`).

---

### 2.6. Cập nhật thông tin học viên
- **URL:** `PUT /v1/students/:id`
- **Method:** `PUT`
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data` hoặc `application/json`
- **Request Body (dạng Form Data / JSON):**
  - `avatar`: (File binary, optional) Ảnh đại diện mới.
  - `fullName`: (String, optional) Họ tên mới.
  - `email`: (String, optional) Email mới.
  - `phone`: (String, optional) SĐT mới.
  - `location`: (String, optional) Cơ sở (`HN`/`HCM`).
  - `dateOfBirth`: (String, optional) Ngày sinh `YYYY-MM-DD`.
  - `studentCode`: (String, optional) Mã học viên.
  - `status`: (String, optional) Trạng thái (`ĐANG HỌC`, `BỎ HỌC`...).
  - `lockedUntil`: (String, optional) Ngày khóa tài khoản `YYYY-MM-DD`.
  - `password`: (String, optional) Reset mật khẩu học viên.
  - `systemIds`: (Array of String, optional) Mảng các ID hệ học liên kết mới (Ghi đè toàn bộ).

---

### 2.7. Xóa học viên
- **URL:** `DELETE /v1/students/:id`
- **Method:** `DELETE`
- **Headers:** `Authorization: Bearer <token>`
- **Response mẫu (`200 OK` với NoContent interceptor):**
```json
{
  "statusCode": 200,
  "message": "Xóa sinh viên thành công"
}
```

---

### 2.8. Nhập danh sách học viên từ file Excel
- **URL:** `POST /v1/students/import/:systemId`
- **Method:** `POST`
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **Path Parameters:**
  - `systemId`: ID của hệ đào tạo mà toàn bộ học viên trong file Excel sẽ được gán vào.
- **Body parameters:**
  - `file`: File Excel (`.xlsx`) chứa thông tin học viên.
- **Response mẫu (`201 Created`):**
```json
{
  "statusCode": 201,
  "data": {
    "inserted": 25,
    "updated": 3
  }
}
```
> [!NOTE]
> - Nếu học viên chưa tồn tại (theo email), hệ thống tạo mới học viên đó.
> - Nếu học viên đã tồn tại (theo email), hệ thống chỉ cập nhật thêm `systemId` đã chọn vào danh sách hệ học (`systemIds`) của học viên đó và tăng biến đếm `updated`.

---

### 2.9. Lấy danh sách lớp học của một học viên
- **URL:** `GET /v1/staff/student-classes/student/:studentId`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Response mẫu (`200 OK`):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "60c72b2f9b1d8b2bad000999",
      "studentId": "60c72b2f9b1d8b2bad000100",
      "classId": "60c72b2f9b1d8b2bad000200",
      "isActive": true,
      "status": "STUDYING",
      "createdAt": "2026-07-16T03:30:00.000Z"
    }
  ]
}
```

---

### 2.10. Xếp lớp cho học viên
- **URL:** `POST /v1/staff/student-classes`
- **Method:** `POST`
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Request Body:**
```json
{
  "studentId": "60c72b2f9b1d8b2bad000100",
  "classId": "60c72b2f9b1d8b2bad000200",
  "isActive": true,
  "status": "STUDYING"
}
```

---

### 2.11. Cập nhật trạng thái của học viên trong lớp
Dùng để bật/tắt trạng thái hoạt động hoặc đổi trạng thái học tập riêng của học viên trong một lớp cụ thể.

- **URL:** `PUT /v1/staff/student-classes/:id`
- **Method:** `PUT`
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Request Body:**
```json
{
  "isActive": false,
  "status": "DROPOFF"
}
```

---

### 2.12. Xóa học viên khỏi lớp
- **URL:** `DELETE /v1/staff/student-classes/:id`
- **Method:** `DELETE`
- **Headers:** `Authorization: Bearer <token>`

---

### 2.13. Lấy danh sách tất cả các lớp học
Dùng để load danh sách lớp học đổ vào dropdown chọn lớp khi staff thực hiện xếp lớp cho học viên.

- **URL:** `GET /v1/staff/classes`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Response mẫu (`200 OK`):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "60c72b2f9b1d8b2bad000200",
      "className": "WD-1801",
      "courseId": "60c72b2f9b1d8b2bad000003",
      "status": "ACTIVE",
      "createdAt": "2026-07-16T03:00:00.000Z"
    }
  ]
}
```

---

## 3. Quy định cấu trúc file Excel Import mẫu (Excel Template Structure)

File Excel tải lên phải đúng định dạng, dòng đầu tiên (dòng 1) là dòng tiêu đề (Header). Các cột phải đúng tên Tiếng Việt như dưới đây (thứ tự cột không quan trọng):

| Tên cột Excel (Tiêu đề bắt buộc) | Ý nghĩa dữ liệu | Định dạng / Ghi chú |
| :--- | :--- | :--- |
| **Họ và tên** | Họ tên đầy đủ của học viên | Dạng chữ |
| **Email** | Địa chỉ email liên hệ | Dạng email hợp lệ, dùng để đăng nhập và không được trùng |
| **SĐT** | Số điện thoại | Dạng số/chữ |
| **Mã học viên** | Mã số học viên (tự chọn) | Ví dụ: `RE26012`. Nếu bỏ trống sẽ tự sinh mã. |
| **Nơi ở hiện tại** | Địa chỉ hiện tại | Dạng chữ |
| **Quê quán** | Quê quán của học viên | Dạng chữ |
| **Số CCCD** | Số căn cước công dân | Dạng số/chữ |
| **Link facebook** | Đường dẫn Facebook cá nhân | Dạng URL hợp lệ |
| **Ngày sinh** | Ngày sinh của học viên | Định dạng Excel Date, hoặc dạng chuỗi `dd/mm/yyyy`, `yyyy-mm-dd` |
| **Giới tính** | Giới tính học viên | Giá trị hợp lệ: `Nam` (đổi thành MALE), `Nữ` (đổi thành FEMALE), giá trị khác mặc định là OTHER |
| **Cơ sở đào tạo** | Nơi học viên đăng ký học | Nếu chứa chữ `HN` -> cơ sở `HN`, chứa chữ `HCM` -> cơ sở `HCM`, còn lại giữ nguyên giá trị |

---

## 4. Một số lưu ý về Logic Frontend

### 4.1. Quy tắc sinh mật khẩu mặc định
Khi thêm học viên (cả tạo thủ công và import Excel) mà không nhập mật khẩu:
- Tạo thủ công: Mật khẩu mặc định là ngày sinh theo định dạng `DDMMYYYY`.
  - *Ví dụ:* Ngày sinh nhập vào là `2002-05-15` -> FE hoặc BE sẽ tự gán mật khẩu ban đầu là `15052002`.
- Import Excel: Mật khẩu mặc định của học viên được tạo tự động bằng chính **Email** của họ đã băm (hash).

### 4.2. Xử lý ảnh đại diện (Avatar) và gửi dữ liệu dạng Form Data
- Khi gọi API cập nhật học viên (`PUT /v1/students/:id`), nếu người dùng cập nhật Avatar, Frontend bắt buộc phải chuyển Header `Content-Type` thành `multipart/form-data`.
- Dùng đối tượng `FormData` để gửi request:
  - Thêm file ảnh: `formData.append('avatar', file)`
  - Thêm các trường dữ liệu text: `formData.append('fullName', fullName)`, v.v.
  - Đối với mảng `systemIds`, append từng phần tử hoặc dưới dạng cấu trúc FormData hỗ trợ:
    ```javascript
    systemIds.forEach(id => formData.append('systemIds[]', id));
    ```

### 4.3. Các trạng thái chuẩn của Học viên (Student Status Enums)
Dùng các giá trị raw text này khi hiển thị hoặc gửi lên API:
- `ĐANG HỌC` (Studying)
- `BẢO LƯU` (Reserved)
- `CHỜ BẢO LƯU` (Reserved Waiting)
- `BỎ HỌC` (Drop-off)
- `TỐT NGHIỆP` (Graduated)
- `TỐT NGHIỆP SỚM` (Graduated Early)
- `ĐÌNH CHỈ` (Suspended)

---

## 5. Đặc tả APIs Lớp học phần (CourseClass Specs) [Mới bổ sung]

Đây là bộ API dùng để xếp môn học, giảng viên (Staff) và trợ giảng (Staff) cho từng lớp học cụ thể (tách biệt khỏi thông tin hành chính).

### 5.1. Phân công môn học và giảng viên cho lớp (Tạo lớp học phần)
- **URL:** `POST /v1/staff/course-classes`
- **Method:** `POST`
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Request Body:**
```json
{
  "classId": "60c72b2f9b1d8b2bad000200",
  "courseId": "60c72b2f9b1d8b2bad000003",
  "teacherId": "60c72b2f9b1d8b2bad000123",
  "taId": "60c72b2f9b1d8b2bad000124", // optional
  "status": "PENDING", // PENDING | STUDYING | FINISHED
  "startDate": "2026-07-20", // optional
  "endDate": "2026-09-20" // optional
}
```
- **Response mẫu (`201 Created`):**
```json
{
  "statusCode": 201,
  "data": {
    "id": "60c72b2f9b1d8b2bad000999",
    "classId": "60c72b2f9b1d8b2bad000200",
    "courseId": "60c72b2f9b1d8b2bad000003",
    "teacherId": "60c72b2f9b1d8b2bad000123",
    "taId": "60c72b2f9b1d8b2bad000124",
    "status": "PENDING",
    "startDate": "2026-07-20T00:00:00.000Z",
    "endDate": "2026-09-20T00:00:00.000Z",
    "createdAt": "2026-07-16T04:00:00.000Z"
  }
}
```

---

### 5.2. Lấy danh sách môn học của một lớp
Dùng để hiển thị thời khóa biểu/chương trình thực tế mà lớp hành chính này đang hoặc đã học.

- **URL:** `GET /v1/staff/course-classes/class/:classId`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Response mẫu (`200 OK`):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "60c72b2f9b1d8b2bad000999",
      "classId": "60c72b2f9b1d8b2bad000200",
      "courseId": {
        "id": "60c72b2f9b1d8b2bad000003",
        "name": "Lập trình NodeJS",
        "courseCode": "NODEJS-01",
        "hour": 36
      },
      "teacherId": {
        "id": "60c72b2f9b1d8b2bad000123",
        "fullName": "Nguyễn Văn A",
        "email": "teacherA@school.com",
        "avatar": "https://example.com/avatar.png"
      },
      "taId": {
        "id": "60c72b2f9b1d8b2bad000124",
        "fullName": "Trần Trợ Giảng",
        "email": "ta@school.com",
        "avatar": "https://example.com/avatar.png"
      },
      "status": "STUDYING",
      "startDate": "2026-07-20T00:00:00.000Z",
      "endDate": "2026-09-20T00:00:00.000Z",
      "createdAt": "2026-07-16T04:00:00.000Z"
    }
  ]
}
```

---

### 5.3. Lấy danh sách lớp học của một môn học
Dùng để biết môn học này đang được dạy ở những lớp nào.

- **URL:** `GET /v1/staff/course-classes/course/:courseId`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Response mẫu (`200 OK`):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "60c72b2f9b1d8b2bad000999",
      "classId": {
        "id": "60c72b2f9b1d8b2bad000200",
        "name": "WD-1801",
        "classCode": "WD-1801",
        "type": "REGULAR"
      },
      "courseId": "60c72b2f9b1d8b2bad000003",
      "teacherId": {
        "id": "60c72b2f9b1d8b2bad000123",
        "fullName": "Nguyễn Văn A",
        "email": "teacherA@school.com"
      },
      "status": "STUDYING"
    }
  ]
}
```

---

### 5.4. Lấy danh sách các lớp học của giảng viên/trợ giảng
Dùng để hiển thị lịch dạy cá nhân của thầy cô.

- **URL:** `GET /v1/staff/course-classes/teacher/:teacherId`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Response mẫu (`200 OK`):**
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "60c72b2f9b1d8b2bad000999",
      "classId": {
        "id": "60c72b2f9b1d8b2bad000200",
        "name": "WD-1801",
        "classCode": "WD-1801"
      },
      "courseId": {
        "id": "60c72b2f9b1d8b2bad000003",
        "name": "Lập trình NodeJS",
        "courseCode": "NODEJS-01",
        "hour": 36
      },
      "status": "STUDYING"
    }
  ]
}
```

---

### 5.5. Cập nhật phân công giảng viên hoặc trạng thái lớp học phần
- **URL:** `PUT /v1/staff/course-classes/:id`
- **Method:** `PUT`
- **Headers:**
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Request Body:**
```json
{
  "teacherId": "60c72b2f9b1d8b2bad000777", // Đổi giảng viên
  "status": "FINISHED", // Cập nhật trạng thái
  "endDate": "2026-09-15"
}
```

---

### 5.6. Hủy phân công lớp học phần (Xóa)
- **URL:** `DELETE /v1/staff/course-classes/:id`
- **Method:** `DELETE`
- **Headers:** `Authorization: Bearer <token>`
