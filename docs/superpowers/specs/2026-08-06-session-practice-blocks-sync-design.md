# Session Practice Blocks Sync Design

## Overview
This design standardizes session practice exercises in `lms-portal-admin` around the modern Courseware Block architecture (`type: "PRACTICE"` or `"ASSIGNMENT"`).
It removes the legacy `SessionPractice` schema (`session.practices` / `session.practice`) from the chapter tree menu (`SessionNode`), replacing it with practice blocks fetched directly via `coursewareService.getSessionBlocks(sessionId)`.

By unifying practice exercises around Courseware Blocks, practice items created or managed in the **Session Completion Rule Modal** (`SessionCompletionRuleModal`) will immediately appear on the chapter menu outside the modal, and vice versa.

---

## User Review Required
> [!IMPORTANT]
> - Legacy `SessionPractice` fields (`session.practices` / `session.practice`) are removed from the main chapter menu rendering (`SessionNode`) and practice forms (`SessionPracticeEditor`, `AddLessonModal`).
> - Practice items will now display their block title (e.g. "sds", "Bài thực hành 1") along with an `isRequired` badge ("Bắt buộc buổi" / "Tùy chọn") directly in the chapter node list.

---

## Proposed Changes

### Component 1: `courseware.service.ts` & `completion-rule.types.ts`

#### `[MODIFY] courseware.service.ts`(file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/services/courseware.service.ts)
- Update `getSessionBlocks`, `getLessonBlocks`, `createSessionBlock`, and `updateBlock` to preserve `payload` (e.g. `{ content, submissionType, resources }`) in `CoursewareBlockEntity`.

#### `[MODIFY] completion-rule.types.ts`(file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/types/completion-rule.types.ts)
- Add `payload?: Record<string, unknown>;` to `CoursewareBlockEntity` interface.

---

### Component 2: Chapter Tree Menu & Practice Editor

#### `[MODIFY] session-node.tsx`(file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/components/application/type-detail-course/components/session-node.tsx)
- Replace reading `session.practices` / `session.practice` with `useQuery({ queryKey: ["session-blocks", session.id], queryFn: () => coursewareService.getSessionBlocks(session.id) })`.
- Filter blocks for `b.type === "PRACTICE" || b.type === "ASSIGNMENT"`.
- Render each practice block with its `title` and requirement badge (`isRequired`).
- On click, trigger `onSelectSession?.(session.id, "practice", block.id)`.

#### `[MODIFY] session-practice-editor.tsx`(file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/components/application/type-detail-course/components/session-practice-editor.tsx)
- Query `["session-blocks", session.id]` for `PRACTICE` / `ASSIGNMENT` blocks.
- Update practice creation, editing, and deletion handlers to call `coursewareService.createSessionBlock`, `coursewareService.updateBlock`, and `coursewareService.deleteBlock`.
- Invalidate `["session-blocks", session.id]` and `["sessions", session.courseId]` on mutation success.

#### `[MODIFY] add-lesson-modal.tsx`(file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/components/application/type-detail-course/modals/add-lesson-modal.tsx)
- Update practice creation mutation to use `coursewareService.createSessionBlock(sessionId, ...)` with type `"PRACTICE"`.
- Invalidate `["session-blocks", sessionId]` on success.

---

## Verification Plan

### Automated Tests
- Run `npm run build` or `npx tsc --noEmit` to verify type safety across modified components.

### Manual Verification
1. Open Course Detail page (`/type/[id]/course/[courseId]`).
2. Open **Điều kiện hoàn thành** modal for a session.
3. Add a practice block (e.g. "Bài thực hành 1", check "Bắt buộc buổi").
4. Close modal and inspect chapter menu: verify "Bài thực hành 1" appears under the session with badge "Bắt buộc buổi".
5. Click on "Bài thực hành 1" in chapter menu: verify practice content is loaded in editor.
6. Edit or delete practice block: verify changes sync across chapter menu and modal.
