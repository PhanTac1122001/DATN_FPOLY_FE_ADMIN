# Design Spec: Student Homework Order & Assigned Homework View

## Summary
Add an API for students to order (randomly pick highest difficulty) additional homework for a session, and update the existing student session homework list API to only render homeworks that have been assigned to the student.

## Requirements & Scope

### 1. Order Additional Homework (`POST /v1/student/homework/order`)
- **Route**: `POST /v1/student/homework/order` and `POST /v1/student/homework/order/:sessionId`
- **Request Body / Param**: `sessionId: string`
- **Authentication**: `StudentAuthServiceGuard` (extracts `studentId` from JWT user context).
- **Behavior**:
  1. Fetch session and all approved homeworks (`status = 1`) for `sessionId`.
  2. Query existing assignments in `GroupHomeworkAssignment` assigned to `studentId` (or all members of their groups).
  3. Filter approved homeworks to identify `unassignedHomeworks`.
  4. If `unassignedHomeworks.length === 0`: Throw `BadRequestException('Hết bài tập về nhà')`.
  5. Calculate maximum difficulty rank among `unassignedHomeworks` using ordering:
     `EXCELLENT` (5) > `GOOD` (4) > `FAIR` (3) > `MEDIUM` (2) > `EASY` (1).
  6. Filter candidates matching the maximum difficulty rank.
  7. Pick one candidate randomly.
  8. Create a `GroupHomeworkAssignment` record assigning this homework to `studentId`.
  9. Return the assigned homework object.

### 2. Assigned Homework Session View (`GET /v1/student/homework/session/:sessionId`)
- **Route**: `GET /v1/student/homework/session/:sessionId`
- **Authentication**: `StudentAuthServiceGuard`.
- **Behavior**:
  1. Extract `studentId` from `ctx.user.id`.
  2. Query groups for `studentId`.
  3. Query `GroupHomeworkAssignment` for these groups where `assignedStudentIds` includes `studentId` or is empty/missing.
  4. Return `Homework` documents belonging to `sessionId` with `status = 1` whose `_id` is in the assigned homework IDs list.

## Database Models Involved
- `Homework`: Query session approved homeworks.
- `Group`: Resolve student groups.
- `GroupHomeworkAssignment`: Query existing assignments and create new assignment upon order.
- `StudentClass`: Resolve fallback class/group if student is not in a group yet.

## API Specification

### Endpoint 1: `POST /v1/student/homework/order` & `POST /v1/student/homework/order/:sessionId`
- **Response**: `Homework` entity object.
- **Errors**:
  - `400 Bad Request`: `Hết bài tập về nhà` (when all homeworks for the session are assigned).
  - `400 Bad Request`: `Chưa có bài tập về nhà nào cho buổi học này` (when session has no approved homeworks).
  - `404 Not Found`: `Không tìm thấy session` (invalid sessionId).

### Endpoint 2: `GET /v1/student/homework/session/:sessionId`
- **Response**: `Array<Homework>` containing only assigned homeworks for the requesting student.
