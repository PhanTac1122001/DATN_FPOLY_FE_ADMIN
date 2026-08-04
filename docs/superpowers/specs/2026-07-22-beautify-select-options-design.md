# Design Spec: Beautify Select Options UI

## Context & Problem
In the course management view (`src/views/type/type-detail-course-view.tsx`), the question type field uses a native HTML `<select>` element. On OS desktop browsers (e.g., Windows), opening a native `<select>` renders the browser's default OS dropdown list with standard blue highlight rectangles, which disrupts the modern UI aesthetic of the LMS Portal.

## Goals
1. Replace native HTML `<select>` in `type-detail-course-view.tsx` with the project's built-in `<Select>` component from `@/components/base/select/select`.
2. Standardize native HTML `<select>` controls across the codebase to ensure UI consistency.

## Proposed Changes

### 1. `src/views/type/type-detail-course-view.tsx`
Replace the native `<select>` block:
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

With the custom design-system `<Select>` component:
```tsx
<Select
    aria-label="Loại câu hỏi"
    selectedKey={q.type}
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

## Verification Plan
1. Run `pnpm run type-check` / `npm run build` or verify Next.js hot reload without type errors.
2. Confirm the dropdown displays the styled React Aria popover menu with custom rounded borders, subtle hover effects, and crisp typography.
