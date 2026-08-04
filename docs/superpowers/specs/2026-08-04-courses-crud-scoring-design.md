# Design Spec: Courses CRUD + Scoring Formula API

**Date:** 2026-08-04  
**Status:** Approved (user chose Option B)

## Goal
Wire admin course create/update/delete to `/api/staff/courses`, and on save sync custom grading via `/api/staff/courses/:id/scoring-formula`.

## Scope
- In: CRUD courses, `learningOutcomes`, map UI % weights → BE `ScoringFormulaDto`, PUT/DELETE scoring-formula after create/update.
- Out: R-Point tab → BE `rpoint-formula` (UI shape does not match API). Validate/publish unchanged.

## Flow
1. Create → `POST /api/staff/courses` → sync scoring.
2. Update → `PUT /api/staff/courses/:id` → sync scoring.
3. Sync: `useCustomFormula` → PUT formula; else → DELETE formula.
4. Delete → `DELETE /api/staff/courses/:id`.

## Mapping
UI percents / 100 → BE fractions (weights sum = 1). Reverse when loading list/detail for the form.

## Files
- `src/types/course.types.ts` — BE scoring types
- `src/utils/course-scoring.utils.ts` — pure mappers
- `src/services/course.service.ts` — API + sync
- `src/views/courses/courses-list-view.tsx` — no change if sync lives in service
