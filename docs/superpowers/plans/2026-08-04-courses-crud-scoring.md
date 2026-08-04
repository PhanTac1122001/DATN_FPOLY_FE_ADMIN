# Courses CRUD + Scoring Formula Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox syntax.

**Goal:** Persist course CRUD via `/api/staff/courses` and sync custom scoring formula on save.

**Architecture:** Service owns create/update/delete plus scoring sync. Pure mappers convert UI % weights ↔ BE fractions.

**Tech Stack:** Next.js admin, httpClient, existing course form modal.

## Global Constraints
- Paths use `/api/staff/...` (same as staff APIs).
- Unwrap `response?.data || response`.
- R-Point tab not wired this pass.

---

### Task 1: Types + scoring mappers

**Files:**
- Modify: `src/types/course.types.ts`
- Create: `src/utils/course-scoring.utils.ts`

- [ ] Add `BackendScoringFormula` / `SetScoringFormulaPayload` types
- [ ] Implement `mapUiGradingToBackendFormula` and `mapBackendFormulaToUiGrading`
- [ ] Implement `pctToFraction` / `fractionToPct` helpers

### Task 2: Course service sync

**Files:**
- Modify: `src/services/course.service.ts`

- [ ] Map backend `scoringFormula` through UI mapper in `mapBackendToCourseItem`
- [ ] Add `setCourseScoringFormula` / `deleteCourseScoringFormula`
- [ ] After create/update, call sync based on `useCustomFormula`

### Task 3: Verify

- [ ] Type-check / lint on touched files
- [ ] Manual: create course with custom formula, edit, toggle off custom, delete
