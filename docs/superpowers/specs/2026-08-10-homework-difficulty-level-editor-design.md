# Homework Difficulty Level Selection Design

## Summary
Add difficulty level (`difficultyLevel`) selection to the homework creation and edit modal in `session-homework-editor.tsx`, and display difficulty badges on homework items in the session homework list.

## Proposed Changes

### 1. `lms-portal-admin/src/constants/ui-text.constants.ts`
- Add `difficultyLevelLabel: "Cấp độ khó *"` under `homeworkEditor` UI text constants.

### 2. `lms-portal-admin/src/components/application/type-detail-course/components/session-homework-editor.tsx`
- **State**: Add state `difficultyLevel` of type `HomeworkDifficultyLevel` defaulting to `HomeworkDifficultyEnum.MEDIUM` (`"MEDIUM"`).
- **Modal Opening**:
  - `openCreateModal`: Reset `difficultyLevel` to `HomeworkDifficultyEnum.MEDIUM`.
  - `openEditModal`: Set `difficultyLevel` from `(hw.difficultyLevel as HomeworkDifficultyLevel) || HomeworkDifficultyEnum.MEDIUM`.
- **Payload**: Include `difficultyLevel` in `saveMutation` body when calling `createHomework` or `updateHomework`.
- **Modal Form UI**: Render 5 pill buttons for `EASY`, `MEDIUM`, `FAIR`, `GOOD`, `EXCELLENT` using `HOMEWORK_DIFFICULTY_LEVELS` from `@/constants/ui-components.constants`.
- **Homework List UI**: Display difficulty level badge (`HOMEWORK_DIFFICULTY_LEVELS`) next to homework title on each homework card item.

## Verification Plan
1. Run `npm run build` in `lms-portal-admin` to ensure zero TypeScript errors.
2. Verify creating/editing a homework assignment persists `difficultyLevel` properly.
