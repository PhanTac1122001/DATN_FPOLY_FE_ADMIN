# Session Completion Rule Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move session completion config out of the session form into a dedicated button + modal wired to `completion-rule` APIs.

**Architecture:** Types + service for rule CRUD; util to serialize `items` correctly; modal editor; session form drops legacy checkboxes and gains an edit-only button.

**Tech Stack:** Next.js admin, React, TanStack Query optional (local modal state + service calls), existing `CustomModal` / `httpClient`.

## Global Constraints

- Never coerce missing `items` to `[]` when reading or writing.
- Label means “session is complete when…”, not unlock.
- Do not commit unless user asks.
- No admin unit-test runner — verify via `npx tsc --noEmit` / lint on touched files.

---

### Task 1: Types + service + serialize util

**Files:**
- Create: `src/types/completion-rule.types.ts`
- Create: `src/services/completion-rule.service.ts`
- Create: `src/utils/completion-rule.utils.ts`
- Modify: `src/services/courseware.service.ts` (add `getSessionBlocks`)

**Interfaces:**
- Produces: `CompletionRule`, `RuleGroup`, `RuleItemRef`, `RuleOperator`, `RuleItemKind`, `RuleIssue`, `CompletionRuleSelectableItem`
- Produces: `completionRuleService.getSessionRule/setSessionRule`, `coursewareService.getSessionBlocks`
- Produces: `parseRuleItemKey`, `toRuleItemKey`, `normalizeRuleFromApi`, `buildRulePayload`, `pruneMissingItems`

- [ ] **Step 1:** Add types matching BE (`ALL`/`ANY`/`AT_LEAST_N`, `BLOCK`/`LESSON`)
- [ ] **Step 2:** Add service methods + `getSessionBlocks`
- [ ] **Step 3:** Add serialize/normalize utils preserving absent `items`

---

### Task 2: Completion rule modal

**Files:**
- Create: `src/components/application/type-detail-course/modals/session-completion-rule-modal.tsx`
- Modify: `src/constants/ui-text.constants.ts`
- Modify: `src/types/courseware.types.ts` (modal props if needed)

**Interfaces:**
- Consumes: services + utils from Task 1
- Produces: `SessionCompletionRuleModal({ isOpen, onOpenChange, sessionId, sessionName })`

- [ ] **Step 1:** Modal loads rule + blocks + lessons on open
- [ ] **Step 2:** Edit groups (operator, n, scope radios, item checkboxes)
- [ ] **Step 3:** Client-block empty explicit selection; prune dangling; PUT with issue highlighting

---

### Task 3: Wire session form; strip legacy rules

**Files:**
- Modify: `src/components/application/type-detail-course/components/session-form.tsx`
- Modify: `src/components/application/type-detail-course/modals/add-session-modal.tsx`
- Modify: `src/types/courseware.types.ts` (`SessionFields`, `SessionFormProps`)
- Modify: `src/views/type/type-detail-course-view.tsx` (pass `sessionId` / open modal if needed)

- [ ] **Step 1:** Remove legacy rule fields from `SessionFields` and both forms
- [ ] **Step 2:** Edit-mode button opens modal with `editingSession.id`
- [ ] **Step 3:** Run TypeScript check on admin project

---

## Self-review

- Spec coverage: separate button, API rule editor, strip legacy form — all tasked.
- `items` semantics covered in util + modal.
- No lesson-level rule (out of scope).
