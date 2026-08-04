# Exams Sets Question Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the "Thêm câu hỏi trắc nghiệm mới" modal on the E-learning exam sets detail page. The modal allows users to input question title, points, description, and configure exactly 4 answer options (no dynamic adding of options, meaning no "+" button). The modal also supports toggle between single and multiple correct answers. Saving appends/edits the question in local state.

**Architecture:** A React modal component using Tailwind and standard input/textarea controls. It will be wired to the edit/create triggers in `ExamSetDetailView`.

**Tech Stack:** React, TailwindCSS, Lucide Icons.

## Global Constraints
- Exact path names and structures
- Giao diện giống thiết kế trong hình vẽ: Check-circle icon in red circle, grid 2x2 for 4 cards, radio style indicators, Correct/Incorrect indicator text, and the switcher group at bottom.
- No hardcoded strings in Views; all Vietnamese copy must be localized in `src/constants/ui-text.constants.ts`.

---

### Task 1: Update UI_TEXT and Declared Types

**Files:**
- Modify: `lms-portal-admin/src/constants/ui-text.constants.ts`
- Modify: `lms-portal-admin/src/types/exam-set.types.ts`

- [ ] **Step 1: Update `src/constants/ui-text.constants.ts`**

Add translations for the question modal:
```typescript
        modalAddTitle: "Thêm câu hỏi trắc nghiệm mới",
        modalEditTitle: "Sửa câu hỏi trắc nghiệm",
        labelQuestionTitle: "Tên / Tiêu đề câu hỏi *",
        placeholderQuestionTitle: "Ví dụ: Chọn định dạng đúng của IP Address",
        labelPoints: "Điểm số *",
        labelQuestionDesc: "Nội dung câu hỏi",
        placeholderQuestionDesc: "Nhập nội dung văn bản...",
        labelAnswersList: "Danh sách câu trả lời (Click chọn câu trả lời đúng)",
        placeholderAnswer: "Nhập câu trả lời",
        labelCorrect: "Đúng",
        labelIncorrect: "Sai",
        btnSingleCorrect: "Câu trả lời đúng duy nhất",
        btnMultiCorrect: "Nhiều câu trả lời đúng",
        btnCancel: "Hủy bỏ",
        btnSave: "Lưu",
        toastQuestionAdded: "Đã thêm câu hỏi mới thành công.",
        toastQuestionUpdated: "Đã cập nhật câu hỏi thành công.",
```

- [ ] **Step 2: Update `src/types/exam-set.types.ts`**

Add `QuestionModalProps` type:
```typescript
export interface QuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (question: QuestionMock) => void;
    question?: QuestionMock | null;
}
```

- [ ] **Step 3: Commit Task 1 changes**
Run:
`git add src/constants/ui-text.constants.ts src/types/exam-set.types.ts`
`git commit -m "feat: add types and UI translations for exam set question modal"`

---

### Task 2: Implement QuestionModal Component

**Files:**
- Create: `lms-portal-admin/src/components/application/modals/question-modal.tsx`

- [ ] **Step 1: Create `src/components/application/modals/question-modal.tsx`**

Build the modal using `CustomModal` (similar to how `SystemModal` or `StaffModal` are written).
The modal will manage local states for fields:
- `text` (question title)
- `points`
- `explanation`
- `options` (array of exactly 4 options with text and `isCorrect`)
- `isMulti` (boolean toggle between single and multiple correct answers)

If a `question` is passed (Edit mode), populate the fields. If not, set defaults.

- [ ] **Step 2: Commit Task 2 changes**
Run:
`git add src/components/application/modals/question-modal.tsx`
`git commit -m "feat: implement QuestionModal component with 4 static choices and toggle modes"`

---

### Task 3: Integrate Modal in Detail View

**Files:**
- Modify: `lms-portal-admin/src/views/exam-set-detail-view.tsx`

- [ ] **Step 1: Update `src/views/exam-set-detail-view.tsx`**

1. Define a React State for questions: `const [questions, setQuestions] = useState<QuestionMock[]>(selectedSet.questions);`.
2. Add state for `isModalOpen` and `selectedQuestion` (for edit mode).
3. Connect `+ Tạo câu hỏi mới` button to open the modal with `selectedQuestion = null`.
4. Connect `Edit` button of each question row to open the modal with `selectedQuestion = q`.
5. Connect `Delete` button to remove the question from the local state list.
6. Render `<QuestionModal />` at the bottom and implement `handleSaveQuestion`.

- [ ] **Step 2: Commit Task 3 changes**
Run:
`git add src/views/exam-set-detail-view.tsx`
`git commit -m "feat: integrate QuestionModal in exam set detail view with local state persistence"`
