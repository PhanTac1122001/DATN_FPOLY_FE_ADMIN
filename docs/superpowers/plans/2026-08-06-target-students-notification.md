# Target Students Notification Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow selecting target notification recipients by Training System (Hệ đào tạo), Class (Lớp học), or Individual Student (Sinh viên cụ thể) in `CreateNotificationModal`.

**Architecture:** Extend `CreateNotificationModal` to handle 3 target modes when `requiresTargetStudents = true`. Fetch options for systems, classes, and students using existing services (`system.service.ts`, `class.service.ts`, `student.service.ts`), resolve student IDs accordingly, and present a count preview before submitting.

**Tech Stack:** React, Next.js, Tailwind CSS, Lucide icons, React Query / Service calls.

## Global Constraints
- Minimal non-breaking changes to `notificationService.createStaffNotification`.
- Full typescript type-safety and fallback logic for API responses.

---

### Task 1: Update CreateNotificationModal target selection UI and resolution logic

**Files:**
- Modify: `src/components/layout/admin/modals/create-notification-modal.tsx`
- Modify: `src/constants/ui-text.constants.ts` (if text labels needed)

**Interfaces:**
- Consumes: `getSystemsList()`, `getClassList()`, `getStudentsList()`, `getClassDetail()`
- Produces: `studentIds: string[]` in `CreateStaffNotificationDto`

- [ ] **Step 1: Add state and fetchers for Target Modes**

Add state for `targetMode` ("SYSTEM" | "CLASS" | "STUDENT"), `selectedSystemIds`, `selectedClassIds`, `studentsList`, `selectedStudentIds`.

- [ ] **Step 2: Add Target Mode Selector & UI controls**

When `requiresTargetStudents` is true:
Render a segmented tab or radio selector for ("Theo hệ", "Theo lớp", "Theo sinh viên").
Render multi-select / checkbox selection list for Systems, Classes, or Students.

- [ ] **Step 3: Resolve student IDs for notification payload**

Calculate the final list of `studentIds` based on selected mode:
- SYSTEM: fetch students for selected systems (`getStudentsList({ systemId })`).
- CLASS: fetch detail for selected classes (`getClassDetail(classId)`).
- STUDENT: directly use selected student IDs / entered student IDs.

- [ ] **Step 4: Verify component rendering and submit behavior**

Build and test modal interaction.

- [ ] **Step 5: Commit**

`git commit -m "feat(notifications): add system/class/student target selection to notification modal"`
