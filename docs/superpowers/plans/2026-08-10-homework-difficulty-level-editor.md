# Homework Difficulty Level Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add homework difficulty level selection (pill buttons for EASY, MEDIUM, FAIR, GOOD, EXCELLENT) to the homework creation and edit modal in `session-homework-editor.tsx`, and display difficulty badges on homework items in the session homework list.

**Architecture:** Utilize `HOMEWORK_DIFFICULTY_LEVELS` from `@/constants/ui-components.constants` and `HomeworkDifficultyEnum` / `HomeworkDifficultyLevel` types from `@/types/group.types`. Update `session-homework-editor.tsx` component state, modal form UI, and list card UI.

**Tech Stack:** React, Next.js, TypeScript, Tailwind CSS, TanStack Query.

## Global Constraints
- Target component: `lms-portal-admin/src/components/application/type-detail-course/components/session-homework-editor.tsx`
- UI text constant location: `lms-portal-admin/src/constants/ui-text.constants.ts`
- Use predefined `HOMEWORK_DIFFICULTY_LEVELS` options and styling tokens.

---

### Task 1: Add Difficulty Level Label Constant & Form State in Homework Editor

**Files:**
- Modify: `lms-portal-admin/src/constants/ui-text.constants.ts`
- Modify: `lms-portal-admin/src/components/application/type-detail-course/components/session-homework-editor.tsx`

**Interfaces:**
- Consumes: `HOMEWORK_DIFFICULTY_LEVELS` from `@/constants/ui-components.constants`
- Consumes: `HomeworkDifficultyEnum`, `HomeworkDifficultyLevel` from `@/types/group.types`

- [ ] **Step 1: Add UI Text Label Constant**
Add `difficultyLevelLabel: "Cấp độ khó *"` under `homeworkEditor` in `ui-text.constants.ts`.

- [ ] **Step 2: Add Form State & Import Constants in `session-homework-editor.tsx`**
Import `HOMEWORK_DIFFICULTY_LEVELS` from `@/constants/ui-components.constants` and `HomeworkDifficultyEnum`, `HomeworkDifficultyLevel` from `@/types/group.types`.
Add state `const [difficultyLevel, setDifficultyLevel] = useState<HomeworkDifficultyLevel>(HomeworkDifficultyEnum.MEDIUM);`.
Update `openCreateModal` to set `setDifficultyLevel(HomeworkDifficultyEnum.MEDIUM)`.
Update `openEditModal` to set `setDifficultyLevel((hw.difficultyLevel as HomeworkDifficultyLevel) || HomeworkDifficultyEnum.MEDIUM)`.
Update `saveMutation` to include `difficultyLevel` in `body`.

- [ ] **Step 3: Add Pill Selection UI to Create/Edit Modal**
Add the 5-pill selection control below the Title field in `session-homework-editor.tsx`:
```tsx
{/* Difficulty Level */}
<div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-medium text-slate-700 uppercase">{UI_TEXT.homeworkEditor.difficultyLevelLabel}</label>
    <div className="flex flex-wrap items-center gap-2">
        {HOMEWORK_DIFFICULTY_LEVELS.map((lvl) => {
            const isSelected = difficultyLevel === lvl.id;
            return (
                <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setDifficultyLevel(lvl.id)}
                    className={`cursor-pointer rounded-full border px-3.5 py-1 text-xs font-bold transition-all ${
                        isSelected
                            ? `${lvl.badgeColor} ring-2 ring-wine/20 shadow-sm`
                            : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                    }`}
                >
                    {lvl.label}
                </button>
            );
        })}
    </div>
</div>
```

- [ ] **Step 4: Display Difficulty Badge in Homework List Item Header**
In the homework item list rendering loop, find `hwLevelConfig = HOMEWORK_DIFFICULTY_LEVELS.find((l) => l.id === hw.difficultyLevel) || HOMEWORK_DIFFICULTY_LEVELS.find((l) => l.id === HomeworkDifficultyEnum.MEDIUM)`.
Render the badge next to the homework title:
```tsx
{hwLevelConfig && (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${hwLevelConfig.badgeColor}`}>
        {hwLevelConfig.label}
    </span>
)}
```

- [ ] **Step 5: Verify build**
Run `npm run build` in `lms-portal-admin` to ensure zero compilation or lint errors.
