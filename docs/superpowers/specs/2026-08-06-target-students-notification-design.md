# Target Students Notification Selection Design

## Overview
When creating a notification with a category that has `requiresTargetStudents = true`, admins should be able to select target recipients by:
1. **System (Hệ đào tạo)**: Select one or more training systems -> fetch/resolve all students in those systems.
2. **Class (Lớp học)**: Select one or more classes -> fetch/resolve all students in those classes.
3. **Student (Sinh viên cụ thể)**: Select/search individual students or input student IDs directly.

## Component Changes
- `create-notification-modal.tsx`:
  - Add state for target mode (`SYSTEM` | `CLASS` | `STUDENT`).
  - Add state for selected system IDs, class IDs, selected student objects / IDs.
  - Query systems list (`getSystemsList`), classes list (`getClassList`), and students list (`getStudentsList`).
  - Resolve total target student IDs when mode changes or items are selected/unselected.
  - Display badge showing total target recipient count.
  - On form submit, pass the aggregated `studentIds` array to `notificationService.createStaffNotification`.

## UI/UX
- Radio/Segmented selector for Target Mode when `requiresTargetStudents` is true.
- Multi-select dropdown / checkable items for Systems, Classes, and Students.
- Summary counter: "Đã chọn X sinh viên nhận thông báo".
