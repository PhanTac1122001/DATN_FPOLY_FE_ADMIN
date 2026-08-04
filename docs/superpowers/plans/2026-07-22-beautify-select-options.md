# Beautify Select Options Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace native HTML `<select>` elements in the course detail view with the project's custom `<Select>` component for a unified, modern dropdown UI.

**Architecture:** Utilize React Aria based `<Select>` and `<Select.Item>` components from `@/components/base/select/select` replacing the native browser `<select>` and `<option>` elements.

**Tech Stack:** React 19, Next.js 16, React Aria Components, Tailwind CSS, Lucide React icons.

## Global Constraints
- Target file: `src/views/type/type-detail-course-view.tsx`
- Component import: `import { Select } from "@/components/base/select/select";`
- No unused variables or broken handlers.

---

### Task 1: Replace native question type `<select>` in `type-detail-course-view.tsx`

**Files:**
- Modify: `src/views/type/type-detail-course-view.tsx:2874-2882`

**Interfaces:**
- Consumes: `<Select>` component from `@/components/base/select/select`
- Produces: Enhanced question type dropdown in question editor card

- [ ] **Step 1: Inspect existing `<select>` block in `type-detail-course-view.tsx`**

Ensure line 2874-2882 contains:
```tsx
<select
    value={q.type}
    onChange={(e) => handleQuestionTypeChange(idx, e.target.value as any)}
    className="bg-white border border-slate-200 text-xs px-3 py-2 rounded-xl focus:outline-none transition duration-150 focus:border-slate-300 font-semibold text-slate-700"
>
    <option value="SINGLE_CHOICE">Một đáp án đúng</option>
    <option value="MULTIPLE_CHOICE">Nhiều đáp án đúng</option>
</select>
```

- [ ] **Step 2: Replace native `<select>` with custom `<Select>`**

Update lines 2874-2882 to:
```tsx
<Select
    aria-label="Loại câu hỏi"
    selectedKey={q.type || "SINGLE_CHOICE"}
    onSelectionChange={(key) => handleQuestionTypeChange(idx, key as any)}
    items={[
        { id: "SINGLE_CHOICE", label: "Một đáp án đúng" },
        { id: "MULTIPLE_CHOICE", label: "Nhiều đáp án đúng" },
    ]}
    size="sm"
    placeholder="Chọn loại câu hỏi"
    isClearable={false}
>
    {(item) => <Select.Item id={item.id} label={item.label} />}
</Select>
```

- [ ] **Step 3: Run type check to verify build success**

Run: `pnpm run type-check` in `c:\Users\Admin\Desktop\lmsPortal\lms-portal-admin`

- [ ] **Step 4: Commit changes**

```bash
git add src/views/type/type-detail-course-view.tsx docs/superpowers/specs/2026-07-22-beautify-select-options-design.md docs/superpowers/plans/2026-07-22-beautify-select-options.md
git commit -m "style: replace native select with custom Select component in course detail questions"
```
