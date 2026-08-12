# Exams Sets EL Icon Buttons Synchronization & Edit Set Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Synchronize action icon buttons in `/exams-sets-el` (`ExamSetListView` and `ExamSetDetailView`) to match the Course page (`CoursesListView`), and add Edit Set functionality (`CreateQuizModal`) to allow editing exam set metadata from the list view.

**Architecture:** 
1. Enhance `CreateQuizModal` to accept optional `initialData` for edit mode and submit via `updateQuiz` API.
2. Update `ExamSetListView` header button to pill style, update table action buttons to circular badge buttons (`Eye`, `Pencil`, `Trash2`), and wire up `selectedQuizForEdit` to `CreateQuizModal`.
3. Update `ExamSetDetailView` header buttons to pill style and question/essay item action buttons to circular badge style.

**Tech Stack:** React, Next.js, Lucide Icons, Tailwind CSS, TypeScript.

## Global Constraints

- Preserve all existing functionality and API contracts.
- Follow Course page (`courses-list-view.tsx`) button styling conventions exactly.
- Use `Pencil` icon for Edit action buttons (`size-4`).

---

### Task 1: Enhance `CreateQuizModal` to support Edit Mode

**Files:**
- Modify: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-admin\src\types\quiz.types.ts:58-62`
- Modify: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-admin\src\components\application\modals\create-quiz-modal.tsx:1-158`

**Interfaces:**
- Consumes: `updateQuiz` from `@/services/quiz.service`, `ExamSetMock` from `@/types/exam-set.types`
- Produces: `CreateQuizModal` accepting `initialData?: ExamSetMock | QuizBackendEntity | null`

- [ ] **Step 1: Update `CreateQuizModalProps` interface**

Update `src/types/quiz.types.ts`:
```typescript
export interface CreateQuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (quiz: QuizBackendEntity) => void;
    initialData?: ExamSetMock | QuizBackendEntity | null;
}
```

- [ ] **Step 2: Update `CreateQuizModal` implementation**

In `src/components/application/modals/create-quiz-modal.tsx`:
- Import `useEffect` from React.
- Import `updateQuiz` from `@/services/quiz.service`.
- Handle `initialData` in `useEffect` to prefill `title`, `description`, `passThreshold`, `courseId`.
- In `handleSubmit`:
```typescript
if (initialData) {
    const updated = await updateQuiz(initialData.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        passThreshold: Number(passThreshold) || DEFAULT_PASS_THRESHOLD,
        courseId: courseId.trim() || undefined,
    });
    toast.success(UI_TEXT.examsSetsEl.title, UI_TEXT.examsSetsEl.toastQuestionUpdated || "Cập nhật bộ đề thành công");
    onSuccess(updated);
} else {
    // create call
}
```
- Update modal title: `{initialData ? "Chỉnh sửa bộ đề trắc nghiệm" : UI_TEXT.examsSetsEl.createModalTitle}`
- Update submit button text: `{isSubmitting ? UI_TEXT.examsSetsEl.submitting : initialData ? "Lưu thay đổi" : UI_TEXT.examsSetsEl.btnCreateQuiz}`

- [ ] **Step 3: Verify TypeScript compilation**

Run: `npm run build` or inspect in project.

---

### Task 2: Synchronize buttons and add Edit Set in `ExamSetListView`

**Files:**
- Modify: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-admin\src\views\exams-sets\exam-set-list-view.tsx:1-205`

**Interfaces:**
- Consumes: `CreateQuizModal` with `initialData`, Lucide icons (`Eye`, `Pencil`, `Trash2`, `Plus`)

- [ ] **Step 1: Update `ExamSetListView` state and handlers**

In `src/views/exams-sets/exam-set-list-view.tsx`:
- Import `Pencil` icon from `"lucide-react"`.
- Add `[selectedQuizForEdit, setSelectedQuizForEdit] = useState<ExamSetMock | null>(null)`.
- Create `handleEditQuiz = (item: ExamSetMock) => { setSelectedQuizForEdit(item); setIsCreateModalOpen(true); }`.
- Update `handleCreateClick = () => { setSelectedQuizForEdit(null); setIsCreateModalOpen(true); }`.
- Update `handleCreateSuccess`:
```typescript
const handleModalSuccess = (quiz: QuizBackendEntity) => {
    const mapped = mapBackendQuizToExamSet(quiz);
    setExamSets((prev) => {
        const exists = prev.some((q) => q.id === mapped.id);
        if (exists) {
            return prev.map((q) => (q.id === mapped.id ? { ...q, ...mapped } : q));
        }
        return [mapped, ...prev];
    });
};
```

- [ ] **Step 2: Update Header "Tạo bộ đề" button style**

Replace header button with pill button:
```tsx
<button
    type="button"
    onClick={handleCreateClick}
    className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-wine px-5 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-wine/90 active:scale-95"
>
    <Plus className="size-4.5" />
    <span>{UI_TEXT.examsSetsEl.btnCreateQuiz}</span>
</button>
```

- [ ] **Step 3: Update Table action buttons style**

Replace table action cell content with:
```tsx
<td className="border-b border-slate-100 px-6 py-5">
    <div className="flex items-center justify-center gap-1.5">
        <Link
            href={`/exams-sets-el/${item.id}` as Route}
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition duration-200 hover:scale-105 hover:bg-indigo-600 hover:text-white"
            title={UI_TEXT.examsSetsEl.viewDetails}
        >
            <Eye className="size-4" />
        </Link>
        <button
            type="button"
            onClick={() => handleEditQuiz(item)}
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition duration-200 hover:bg-emerald-600 hover:text-white"
            title={UI_TEXT.examsSetsEl.editSet}
        >
            <Pencil className="size-4" />
        </button>
        <button
            type="button"
            onClick={() => handleDeleteQuiz(item)}
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-rose-50 text-rose-600 transition hover:bg-rose-600 hover:text-white"
            title={UI_TEXT.examsSetsEl.deleteSet}
        >
            <Trash2 className="size-4" />
        </button>
    </div>
</td>
```

- [ ] **Step 4: Pass `initialData` to `CreateQuizModal`**

```tsx
<CreateQuizModal
    isOpen={isCreateModalOpen}
    onClose={() => {
        setIsCreateModalOpen(false);
        setSelectedQuizForEdit(null);
    }}
    onSuccess={handleModalSuccess}
    initialData={selectedQuizForEdit}
/>
```

---

### Task 3: Synchronize action buttons in `ExamSetDetailView`

**Files:**
- Modify: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-admin\src\views\exams-sets\exam-set-detail-view.tsx:1-504`

- [ ] **Step 1: Update header action buttons to pill button style**

In `ExamSetDetailView`:
Replace Quiz tab button "Tạo câu hỏi mới":
```tsx
<button
    type="button"
    onClick={handleCreateQuestion}
    className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-wine px-5 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-wine/90 active:scale-95"
>
    <Plus className="size-4.5" />
    <span>{UI_TEXT.examsSetsEl.btnCreateQuestion}</span>
</button>
```
And Essay tab button "Tạo câu hỏi mới":
```tsx
<button
    type="button"
    onClick={handleCreateEssayQuestion}
    className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-wine px-5 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-wine/90 active:scale-95"
>
    <Plus className="size-4.5" />
    <span>{UI_TEXT.examsSetsEl.btnCreateEssayQuestion}</span>
</button>
```

- [ ] **Step 2: Update question item and essay item action buttons**

Use `Pencil` icon import instead of `Edit`.
For Quiz question item:
```tsx
<div className="flex shrink-0 items-center gap-1.5">
    <button
        type="button"
        onClick={() => handleEditQuestion(q)}
        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition duration-200 hover:bg-emerald-600 hover:text-white"
        title={UI_TEXT.examsSetsEl.editSet}
    >
        <Pencil className="size-4" />
    </button>
    <button
        type="button"
        onClick={() => handleDeleteQuestion(q.id)}
        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-rose-50 text-rose-600 transition hover:bg-rose-600 hover:text-white"
        title={UI_TEXT.examsSetsEl.deleteSet}
    >
        <Trash2 className="size-4" />
    </button>
    <span className="rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1 text-xs font-bold text-slate-700">
        {q.points}
        {UI_TEXT.examsSetsEl.pointsSuffix}
    </span>
</div>
```

For Essay question item:
```tsx
<div className="flex shrink-0 items-center gap-1.5">
    <button
        type="button"
        onClick={() => handleEditEssayQuestion(q)}
        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition duration-200 hover:bg-emerald-600 hover:text-white"
        title={UI_TEXT.examsSetsEl.tooltipEditQuestion}
    >
        <Pencil className="size-4" />
    </button>
    <button
        type="button"
        onClick={() => handleDeleteEssayQuestion(q.id)}
        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-rose-50 text-rose-600 transition hover:bg-rose-600 hover:text-white"
        title={UI_TEXT.examsSetsEl.tooltipDeleteQuestion}
    >
        <Trash2 className="size-4" />
    </button>
    <span className="rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1 text-xs font-bold text-slate-700">
        {q.points}
        {UI_TEXT.examsSetsEl.pointsSuffix}
    </span>
</div>
```

---

### Task 4: Build & Verification

- [ ] **Step 1: Check TypeScript errors & build**
Run: verify `lms-portal-admin` builds clean without any type or syntax errors.
