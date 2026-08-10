# Thiết Kế Chi Tiết: Module Quản Lý Nhóm Học Tập (Study Group Management)

Tài liệu thiết kế chi tiết cho tính năng **Quản lý nhóm** trong hệ thống LMS Portal (`lms-portal-api` và `lms-portal-admin`), đáp ứng toàn bộ các yêu cầu nghiệp vụ về quản lý nhóm học tập theo lớp, mối quan hệ N-N với môn học, quản lý thành viên sinh viên trong lớp và giao bài tập về nhà theo nhóm phân loại theo cấp độ năng lực.

---

## 1. Tổng Quan Kiến Trúc & Mô Hình Dữ Liệu

### 1.1. Luồng Nghiệp Vụ (Business Logic Flow)
1. **Liên kết Lớp học (`Class`)**: Nhóm học tập thuộc về 1 Lớp học cụ thể (`classId`).
2. **Liên kết Môn học (`Subjects` / N-N)**: Một nhóm có thể phụ trách/học nhiều Môn học (`subjectIds`), và một Môn học có thể được phân công cho nhiều nhóm.
3. **Danh sách Sinh viên trong Nhóm**: Tất cả sinh viên trong nhóm (`studentIds`) phải được xác thực là sinh viên đã ghi danh (enrolled) trong Lớp học (`classId`) đó.
4. **Giao Bài Tập Về Nhà (Homework Assignment)**: Giáo viên/Staff chọn nhóm -> Chọn môn học -> Chọn bài tập -> Chọn cấp độ (Dễ, Trung bình, Khá, Giỏi, Xuất sắc) -> Phân công cho tất cả hoặc một số sinh viên trong nhóm.

```mermaid
erDiagram
    CLASS ||--o{ GROUP : "contains"
    GROUP }|--|{ SUBJECT : "N-N relation (subjectIds)"
    GROUP }|--|{ STUDENT : "contains (studentIds in class)"
    GROUP ||--o{ GROUP_HOMEWORK_ASSIGNMENT : "receives homework"
    HOMEWORK ||--o{ GROUP_HOMEWORK_ASSIGNMENT : "assigned via"
    
    GROUP {
        string _id PK
        string classId FK
        string title
        string description
        string[] subjectIds FK
        string[] studentIds FK
        datetime createdAt
        datetime updatedAt
    }

    GROUP_HOMEWORK_ASSIGNMENT {
        string _id PK
        string groupId FK
        string classId FK
        string subjectId FK
        string homeworkId FK
        string difficultyLevel "EASY | MEDIUM | FAIR | GOOD | EXCELLENT"
        string[] assignedStudentIds FK
        datetime dueDate
        string note
        datetime createdAt
        datetime updatedAt
    }
```

---

## 2. Chi Tiết Schemas & DTOs Backend (`lms-portal-api`)

### 2.1. Mongoose Schema: `Group` (`src/shared/db/models/group.schema.ts`)

```typescript
import * as Mongo from 'mongoose'
import { DefinitionsFactory, Prop, Schema } from '@nestjs/mongoose'
import { BaseDocument } from './base.schema'

@Schema()
export class Group extends BaseDocument {
    @Prop({ type: String, required: true, index: true })
    classId: string

    @Prop({ type: String, required: true, trim: true })
    title: string

    @Prop({ type: String, default: '' })
    description?: string

    // Mối quan hệ N-N với Môn học (Course / Subject)
    @Prop({ type: [String], default: [], index: true })
    subjectIds: string[]

    // Danh sách Sinh viên trong nhóm (lấy từ roster lớp)
    @Prop({ type: [String], default: [], index: true })
    studentIds: string[]

    @Prop({ type: String })
    createdBy?: string

    @Prop({ type: String })
    updatedBy?: string
}

export const GroupSchema = new Mongo.Schema(
    DefinitionsFactory.createForClass(Group),
    { timestamps: true }
)

GroupSchema.index({ classId: 1, title: 1 })
```

### 2.2. Mongoose Schema: `GroupHomeworkAssignment` (`src/shared/db/models/group-homework-assignment.schema.ts`)

```typescript
import * as Mongo from 'mongoose'
import { DefinitionsFactory, Prop, Schema } from '@nestjs/mongoose'
import { BaseDocument } from './base.schema'

export enum HomeworkDifficultyLevel {
    EASY = 'EASY',           // Dễ
    MEDIUM = 'MEDIUM',       // Trung bình
    FAIR = 'FAIR',           // Khá
    GOOD = 'GOOD',           // Giỏi
    EXCELLENT = 'EXCELLENT'  // Xuất sắc
}

@Schema()
export class GroupHomeworkAssignment extends BaseDocument {
    @Prop({ type: String, required: true, index: true })
    groupId: string

    @Prop({ type: String, required: true, index: true })
    classId: string

    @Prop({ type: String, required: true, index: true })
    subjectId: string

    @Prop({ type: String, required: true, index: true })
    homeworkId: string

    @Prop({
        type: String,
        enum: Object.values(HomeworkDifficultyLevel),
        required: true,
        default: HomeworkDifficultyLevel.MEDIUM
    })
    difficultyLevel: HomeworkDifficultyLevel

    @Prop({ type: [String], default: [] })
    assignedStudentIds: string[]

    @Prop({ type: Date })
    dueDate?: Date

    @Prop({ type: String, default: '' })
    note?: string

    @Prop({ type: String })
    assignedBy?: string
}

export const GroupHomeworkAssignmentSchema = new Mongo.Schema(
    DefinitionsFactory.createForClass(GroupHomeworkAssignment),
    { timestamps: true }
)
```

---

## 3. Danh Sách APIs Backend NestJS (`lms-portal-api`)

Module path: `src/modules/group/`

### 3.1. API Quản lý Nhóm (CRUD & Filter)

#### 1. Lấy danh sách & Lọc Nhóm (`GET /v1/staff/groups`)
- **Query Params**:
  - `classId` (string, required/optional): Lọc nhóm theo Lớp học.
  - `subjectId` (string, optional): Lọc nhóm có chứa môn học này (quan hệ N-N).
  - `search` (string, optional): Tìm kiếm theo tiêu đề (`title`) hoặc mô tả.
  - `page` (number, default: 1): Trạng thái trang.
  - `limit` (number, default: 10): Số bản ghi mỗi trang.
- **Response `200 OK`**:
```json
{
  "statusCode": 200,
  "message": "Lấy danh sách nhóm thành công",
  "data": {
    "items": [
      {
        "id": "64f1ab2c...",
        "classId": "65a123...",
        "className": "BK-DA-PTHB260709",
        "title": "Nhóm 1 - Fullstack Frontend",
        "description": "Nhóm thực hành các dự án React / Next.js",
        "subjects": [
          { "id": "sub_01", "name": "Lập trình Web với React", "code": "WEB201" },
          { "id": "sub_02", "name": "Thiết kế UI/UX với Figma", "code": "UI101" }
        ],
        "studentsCount": 5,
        "createdAt": "2026-08-07T08:00:00.000Z",
        "updatedAt": "2026-08-07T08:00:00.000Z"
      }
    ],
    "total": 12,
    "page": 1,
    "limit": 10
  }
}
```

#### 2. Lấy Chi tiết Nhóm (`GET /v1/staff/groups/:id`)
- **Response `200 OK`**:
  - Trả về chi tiết nhóm bao gồm thông tin Lớp học, danh sách các Môn học (N-N), và thông tin chi tiết từng Sinh viên trong nhóm.

#### 3. Thêm mới Nhóm (`POST /v1/staff/groups`)
- **Body Request**:
```json
{
  "classId": "65a123...",
  "title": "Nhóm 2 - Backend NodeJS",
  "description": "Nhóm thực hành NestJS & Microservices",
  "subjectIds": ["sub_01", "sub_03"],
  "studentIds": ["std_101", "std_102", "std_103"]
}
```
- **Validation**:
  - `classId`, `title` bắt buộc.
  - Kiểm tra các `studentIds` gửi lên có thuộc về danh sách sinh viên lớp `classId` hay không. Nếu có sinh viên ngoài lớp -> Báo lỗi `400 Bad Request`.

#### 4. Cập nhật Nhóm (`PUT /v1/staff/groups/:id`)
- **Body Request**:
```json
{
  "title": "Nhóm 2 - Backend & DevOps NestJS",
  "description": "Cập nhật mô tả nhóm mới",
  "subjectIds": ["sub_01", "sub_03", "sub_04"],
  "studentIds": ["std_101", "std_102", "std_103", "std_104"]
}
```

#### 5. Xóa Nhóm (`DELETE /v1/staff/groups/:id`)
- **Response `200 OK`**: Xóa thành công nhóm và các bản ghi phân công BTVN liên quan.

---

### 3.2. API Giao Bài Tập Về Nhà Theo Nhóm & Cấp Độ

#### 1. Giao bài tập về nhà cho nhóm (`POST /v1/staff/groups/:id/assign-homework`)
- **Body Request**:
```json
{
  "subjectId": "sub_01",
  "homeworkId": "hw_999",
  "difficultyLevel": "HARD", // Options: 'EASY' | 'MEDIUM' | 'FAIR' | 'GOOD' | 'EXCELLENT'
  "assignedStudentIds": ["std_101", "std_102"], // Chọn tất cả hoặc một số sinh viên trong nhóm
  "dueDate": "2026-08-15T23:59:59.000Z",
  "note": "Bài tập nâng cao dành cho học viên mức Khá/Giỏi"
}
```

#### 2. Lấy danh sách BTVN đã giao cho nhóm (`GET /v1/staff/groups/:id/homework-assignments`)
- **Query Params**: `subjectId`, `difficultyLevel`
- **Response `200 OK`**: Danh sách bài tập đã giao kèm cấp độ khó, sinh viên được giao và trạng thái hoàn thành.

#### 3. Lấy danh sách sinh viên khả dụng trong Lớp (`GET /v1/staff/classes/:classId/students-for-group`)
- Dùng để hiển thị danh sách sinh viên trong Lớp cho modal chọn sinh viên khi Tạo/Sửa nhóm.

---

## 4. Thiết Kế Giao Diện Frontend Admin (`lms-portal-admin`)

### 4.1. Cấu trúc Components & Views
- **Trang Quản lý Nhóm trong Lớp (`src/views/classes/tabs/class-groups-tab.tsx`)**:
  - Thanh công cụ (Toolbar): Thanh tìm kiếm nhóm + Dropdown lọc theo Môn học + Nút **"Thêm Nhóm Mới"**.
  - Bảng danh sách Nhóm: Hiển thị Tên nhóm, Mô tả, Các môn học gán (Badge tags), Số lượng sinh viên, Ngày tạo, Thao tác (Chỉnh sửa, Giao BTVN, Xóa).
- **Modal Thêm / Sửa Nhóm (`src/components/application/modals/group-modal.tsx`)**:
  - Tab 1: **Thông tin nhóm**: Nhập Tiêu đề, Mô tả.
  - Tab 2: **Chọn Môn học (N-N)**: Multi-select dropdown chọn các môn học áp dụng cho nhóm này.
  - Tab 3: **Chọn Sinh viên trong Lớp**: Roster picker cho phép chọn các sinh viên đang thuộc lớp đó vào nhóm.
- **Modal Giao BTVN theo Nhóm (`src/components/application/modals/assign-group-homework-modal.tsx`)**:
  - Chọn Môn học -> Chọn Bài tập về nhà.
  - Chọn **Cấp độ bài tập**: Radio / Select badge (`Dễ`, `Trung bình`, `Khá`, `Giỏi`, `Xuất sắc`).
  - Chọn danh sách sinh viên nhận bài tập (Mặc định chọn tất cả SV trong nhóm).
  - Chọn Hạn nộp & Ghi chú.

---

## 5. Kế Hoạch Kiểm Thử & Xác Nhận (Verification Plan)

### 5.1. Backend API Testing
- Kiểm tra tính hợp lệ của quan hệ N-N giữa Nhóm và Môn học khi thêm/sửa `subjectIds`.
- Kiểm tra validation không cho phép thêm sinh viên không thuộc `classId` vào nhóm.
- Kiểm tra tạo bài tập giao theo cấp độ (`EASY`, `MEDIUM`, `FAIR`, `GOOD`, `EXCELLENT`).

### 5.2. Frontend Integration Testing
- Đảm bảo hiển thị tab "Quản lý nhóm" mượt mà trong chi tiết lớp học (`/classes/:id`).
- Kiểm tra flow: Tạo Nhóm -> Chọn Môn học -> Chọn SV trong Lớp -> Giao BTVN theo cấp độ thành công.
