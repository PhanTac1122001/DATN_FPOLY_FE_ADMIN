# Session Practice Blocks Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace legacy session practices (`session.practices` / `session.practice`) on the chapter menu and forms with Courseware Blocks (`type: "PRACTICE"` / `"ASSIGNMENT"`), fully synchronizing chapter practice items with the Session Completion Rule Modal.

**Architecture:** Use React Query to fetch and manage session blocks (`["session-blocks", sessionId]`) via `coursewareService.getSessionBlocks(sessionId)`. Render practice blocks in `SessionNode`, and manage them in `SessionPracticeEditor` & `AddLessonModal` using `coursewareService` APIs (`createSessionBlock`, `updateBlock`, `deleteBlock`).

**Tech Stack:** React 19, Next.js, TanStack React Query, TypeScript, Lucide React, Tailwind CSS.

## Global Constraints

- Preserve TypeScript type safety across all modified files.
- Invalidate `["session-blocks", sessionId]` whenever practice blocks are created, updated, or deleted so chapter menu and completion rule modal stay instantly in sync.

---

### Task 1: Extend `CoursewareBlockEntity` and `coursewareService` to preserve block payload

**Files:**
- Modify: `src/types/completion-rule.types.ts:48-55`
- Modify: `src/services/courseware.service.ts:19-95`

**Interfaces:**
- Consumes: Existing `CoursewareBlockEntity` and `coursewareService` methods.
- Produces: `CoursewareBlockEntity.payload?: Record<string, unknown>` for storing practice content, submissionType, and attached resources.

- [ ] **Step 1: Add `payload` to `CoursewareBlockEntity` in `completion-rule.types.ts`**

```typescript
export interface CoursewareBlockEntity {
    id: string;
    type: string;
    title: string;
    isRequired: boolean;
    position?: number;
    payload?: Record<string, unknown>;
    completionCriteria?: Record<string, unknown>;
}
```

- [ ] **Step 2: Update `coursewareService` mapping to return `payload`**

In `src/services/courseware.service.ts`, update `getSessionBlocks`, `getLessonBlocks`, `createSessionBlock`, and `updateBlock` so mapped entities include `payload: b.payload || {}`.

- [ ] **Step 3: Verify TypeScript compilation for Task 1**

Run: `npx tsc --noEmit`
Expected: PASS with 0 errors in modified files.

- [ ] **Step 4: Commit Task 1**

```bash
git add src/types/completion-rule.types.ts src/services/courseware.service.ts
git commit --no-verify -m "feat: include payload in CoursewareBlockEntity and coursewareService"
```

---

### Task 2: Render PRACTICE courseware blocks in `SessionNode`

**Files:**
- Modify: `src/components/application/type-detail-course/components/session-node.tsx:1-450`

**Interfaces:**
- Consumes: `coursewareService.getSessionBlocks(sessionId)`
- Produces: Chapter node menu rendering practice blocks from `session-blocks` query with titles and required badges.

- [ ] **Step 1: Fetch session blocks via `useQuery` in `SessionNode`**

In `src/components/application/type-detail-course/components/session-node.tsx`:
Import `coursewareService` and `CoursewareBlockEntity`. Add query:

```typescript
const { data: sessionBlocks = [] } = useQuery({
    queryKey: ["session-blocks", session.id],
    queryFn: () => coursewareService.getSessionBlocks(session.id),
    enabled: !!session.id,
});

const practiceBlocks = sessionBlocks.filter((b) => b.type === "PRACTICE" || b.type === "ASSIGNMENT");
```

- [ ] **Step 2: Replace legacy `practicesList.map(...)` rendering with `practiceBlocks.map(...)`**

Replace:
```tsx
{practicesList.map((p, pIdx) => { ... })}
```
With:
```tsx
{practiceBlocks.map((b, pIdx) => {
    const isPracticeSelected = selectedSessionId === session.id && selectedSessionTab === "practice" && _selectedPracticeId === b.id;
    return (
        <div
            key={b.id || pIdx}
            onClick={() => onSelectSession?.(session.id, "practice", b.id)}
            className={`group mt-0.5 flex w-full cursor-pointer items-center justify-between rounded-lg p-2.5 text-left text-sm transition duration-150 ${isPracticeSelected ? "bg-blue-50/60 font-semibold text-blue-600" : "bg-white font-medium text-slate-500 hover:bg-blue-50/40"
                }`}
        >
            <div className="flex min-w-0 flex-1 items-center gap-1.5 pl-1">
                <FileText className="size-4 shrink-0 text-blue-600" />
                <span className="flex-1 truncate font-bold text-slate-700">
                    {b.title || `${UI_TEXT.sessionNode.practiceTabPrefix}${pIdx + 1}`}
                </span>
                <span
                    className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${b.isRequired
                        ? "bg-red-50 text-red-600 border border-red-100"
                        : "bg-slate-100 text-slate-500"
                        }`}
                >
                    {b.isRequired ? "Bắt buộc buổi" : "Tùy chọn"}
                </span>
            </div>
        </div>
    );
})}
```

- [ ] **Step 3: Verify TypeScript compilation for Task 2**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit Task 2**

```bash
git add src/components/application/type-detail-course/components/session-node.tsx
git commit --no-verify -m "feat: render courseware practice blocks on chapter menu in SessionNode"
```

---

### Task 3: Update `SessionPracticeEditor` and `AddLessonModal` to use Courseware Blocks

**Files:**
- Modify: `src/components/application/type-detail-course/components/session-practice-editor.tsx:1-346`
- Modify: `src/components/application/type-detail-course/modals/add-lesson-modal.tsx:1-411`

**Interfaces:**
- Consumes: `coursewareService` APIs (`getSessionBlocks`, `createSessionBlock`, `updateBlock`, `deleteBlock`)
- Produces: Practice block creation/editing/deletion integrated with Courseware Blocks schema.

- [ ] **Step 1: Update `SessionPracticeEditor` to fetch and modify `CoursewareBlockEntity`**

In `session-practice-editor.tsx`:
1. Use `useQuery` on `["session-blocks", session.id]` via `coursewareService.getSessionBlocks(session.id)`.
2. Filter for `b.type === "PRACTICE" || b.type === "ASSIGNMENT"`.
3. In modal form, add input state for `practiceTitle` (default `"Bài thực hành cấp buổi"`).
4. Update `saveMutation` to use `coursewareService.createSessionBlock` when creating, or `coursewareService.updateBlock` when editing:
   - Body: `{ title: practiceTitle, type: "PRACTICE", isRequired, payload: { content, submissionType, resources }, completionCriteria: { requireSubmission } }`.
5. Update `deleteMutation` to use `coursewareService.deleteBlock(blockId)`.
6. Invalidate `["session-blocks", session.id]` and `["sessions", session.courseId]` on success.

- [ ] **Step 2: Update `AddLessonModal` practice creation mutation**

In `add-lesson-modal.tsx`:
Update `createPracticeMutation` to call:
```typescript
await coursewareService.createSessionBlock(sessionId, {
    type: "PRACTICE",
    title: practiceTitle.trim() || "Bài thực hành cấp buổi",
    isRequired: true,
    payload: {
        content: practiceContent.trim(),
        submissionType: practiceSubmissionType,
        resources: resources.filter((r) => r.url.trim() !== ""),
    },
});
```
On success, invalidate `["session-blocks", sessionId]`.

- [ ] **Step 3: Verify TypeScript compilation for Task 3**

Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit Task 3**

```bash
git add src/components/application/type-detail-course/components/session-practice-editor.tsx src/components/application/type-detail-course/modals/add-lesson-modal.tsx
git commit --no-verify -m "feat: migrate SessionPracticeEditor and AddLessonModal to courseware blocks"
```

---

### Task 4: End-to-End Type Check & Verification

**Files:**
- Verification only

- [ ] **Step 1: Run full TypeScript check**

Run: `npx tsc --noEmit`
Expected: PASS with 0 errors.

- [ ] **Step 2: Commit any remaining updates if needed**

```bash
git commit --no-verify -m "chore: completed session practice blocks sync implementation"
```
