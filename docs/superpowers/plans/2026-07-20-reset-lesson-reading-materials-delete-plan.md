# Change Trash Icon to Repeat & Support PDF Link URL Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modify the video, reading, and quiz config tabs to use the Repeat icon and format selection modal. Add the "PDF Link" option in the Reading config modal so users can either input an online PDF URL or select a local file. Update the backend to support deleting the PDF link correctly when it is cleared.

**Architecture:**
- Backend: Change recovery condition of `pdfUrl` in `lesson.service.ts` so it only falls back to existing PDF if `dto.pdf` is `undefined`.
- Frontend: Add `readingPdfUrl` state to `LessonEditorWrapper` and synchronize it. Pass `pdfUrl`/`setPdfUrl` props to `ReadingConfigTab`.
- Frontend: Add PDF Link selection and Input Modal to `ReadingConfigTab`. Render link URL in iframe preview similar to local PDF files.

**Tech Stack:** NestJS, React, Next.js, Lucide Icons, TypeScript

## Global Constraints
- Target frontend file: [type-detail-course-view.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/views/type/type-detail-course-view.tsx)
- Target backend file: [lesson.service.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-api/src/modules/lesson/lesson.service.ts)

---

### Task 1: Update Backend API to Support PDF Deletion

**Files:**
- Modify: [lesson.service.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-api/src/modules/lesson/lesson.service.ts)

- [ ] **Step 1: Update `lesson.service.ts` line 168**
  Change:
  ```typescript
  } else if (!pdfUrl && lesson.reading?.pdf) {
      pdfUrl = lesson.reading.pdf
  }
  ```
  To:
  ```typescript
  } else if (dto.pdf === undefined && lesson.reading?.pdf) {
      pdfUrl = lesson.reading.pdf
  }
  ```

---

### Task 2: Implement PDF Link URL State and Saving in Frontend

**Files:**
- Modify: [type-detail-course-view.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/views/type/type-detail-course-view.tsx)

- [ ] **Step 1: Import `Link as LinkIcon` from `lucide-react`**
  Modify import statement at the top:
  ```typescript
  import { ChevronRight, ChevronDown, File, FileText, HelpCircle, Play, Plus, ScrollText, Video, Trash2, GripVertical, Search, CheckCircle2, Circle, Repeat, Link as LinkIcon } from "lucide-react";
  ```

- [ ] **Step 2: Add `readingPdfUrl` state to `LessonEditorWrapper`**
  Add state hook under other forms:
  ```typescript
  const [readingPdfUrl, setReadingPdfUrl] = useState("");
  ```

- [ ] **Step 3: Update `useEffect` on `lessonDetails` to synchronize `readingPdfUrl`**
  Set `readingPdfUrl` to `lessonDetails.reading?.pdf || ""` on mount/reload.

- [ ] **Step 4: Update `handleConfirmDelete` to clear `readingPdfUrl`**
  Set `readingPdfUrl("")` inside `"reading"` block.

- [ ] **Step 5: Update `handleSaveAll` to include `pdf` parameter**
  Update dirty calculation and FormData appending logic for `pdf` so it sends `readingPdfUrl` (or `""` if cleared).

- [ ] **Step 6: Pass `pdfUrl` and `setPdfUrl` props to `ReadingConfigTab`**
  Update the rendering of `ReadingConfigTab` inside `LessonEditorWrapper`.

---

### Task 3: Update ReadingConfigTab Component JSX for PDF Link

**Files:**
- Modify: [type-detail-course-view.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/views/type/type-detail-course-view.tsx)

- [ ] **Step 1: Update `ReadingConfigTab` function props signature**
  Add `pdfUrl: string` and `setPdfUrl: (url: string) => void`.

- [ ] **Step 2: Add states `isLinkModalOpen` and `tempLink` inside `ReadingConfigTab`**

- [ ] **Step 3: Update `readingType` initialization hook and `useEffect`**
  Include `pdfUrl` in checks.

- [ ] **Step 4: Update the file input onChange handler**
  Clear `pdfUrl` when selecting a local file: `setPdfUrl("")`.

- [ ] **Step 5: Update preview panel rendering**
  Make sure it displays the filename for `pdfUrl` and iframe displays `pdfUrl` when no local file is selected.

- [ ] **Step 6: Update Select Source Modal options**
  Add "Gán liên kết PDF" button options.

- [ ] **Step 7: Render Custom Modal for Link Input**
  Render the `isLinkModalOpen` dialog.

- [ ] **Step 8: Verify the changes compile**
  Run `pnpm type-check` to verify no compilation errors.
