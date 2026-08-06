# Design Spec: Staff Authoring Pitfalls Fix (Slice A)

**Date:** 2026-08-04  
**Status:** Approved (user chose A)

## Goal
Fix critical FE pitfalls on existing admin code before building dynamic blocks.

## Changes
1. **createLesson** always sends `courseId` (from session / course context).
2. **create/update session** sends `typeId` only (SessionType Mongo `id`), never both `type` + `typeId`. Session type dropdown uses `t.id`, not `t.code`.
3. **session-type / courseware services** use `/api/staff/...` + unwrap `data`.
4. **R-point** removed from course edit form; separate "Cấu hình R-point" button + modal calling `auto-rpoint` formula APIs.
5. When course has custom scoring (`useCustomFormula`), disable category/preset control (maps to `scoringMethod`).

## Out of scope
Dynamic blocks, completion rules, content approval (slice B).
