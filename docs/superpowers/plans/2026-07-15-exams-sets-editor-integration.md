# Exams Sets TipTap Editor Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the mock rich text editor in `QuestionModal` with the codebase's built-in `TiptapEditor` component to provide a fully functional WYSIWYG editor matching the screenshot.

**Architecture:** Use the `TiptapEditor` from `@/components/base/editor`.

**Tech Stack:** TipTap, React.

---

### Task 1: Integrate TiptapEditor in QuestionModal

**Files:**
- Modify: `lms-portal-admin/src/components/application/modals/question-modal.tsx`

- [ ] **Step 1: Update `question-modal.tsx`**

1. Import `TiptapEditor` from `@/components/base/editor`:
   `import { TiptapEditor } from "@/components/base/editor";`
2. Remove the mock editor toolbar and mock textarea.
3. Insert the `<TiptapEditor />` component:
   ```tsx
   <TiptapEditor
       value={explanation}
       onChange={setExplanation}
       placeholder={UI_TEXT.examsSetsEl.placeholderQuestionDesc}
   />
   ```

- [ ] **Step 2: Commit Task 1 changes**
Run:
`git add src/components/application/modals/question-modal.tsx`
`git commit -m "feat: replace mock rich editor with native TiptapEditor in QuestionModal"`
