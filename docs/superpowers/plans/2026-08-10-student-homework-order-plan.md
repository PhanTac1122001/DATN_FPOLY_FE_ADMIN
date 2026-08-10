# Student Homework Order & Filtering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow students to order additional homework (randomly pick unassigned homework of highest difficulty) and filter student session homework endpoint to return only assigned homeworks.

**Architecture:** Extend `HomeworkService` and `HomeworkStudentController` in NestJS `lms-portal-api`. Use `GroupHomeworkAssignment` for homework assignment resolution and tracking.

**Tech Stack:** NestJS, Mongoose, TypeScript, Swagger.

## Global Constraints

- Use standard NestJS decorators and exceptions (`BadRequestException`, `NotFoundException`).
- Return exact error message `'Hết bài tập về nhà'` when no unassigned homeworks remain for the session.

---

### Task 1: Create Order Homework DTO

**Files:**
- Create: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-api\src\modules\homework\dto\order-homework.dto.ts`
- Modify: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-api\src\modules\homework\dto\index.ts`

**Interfaces:**
- Produces: `OrderHomeworkDto` with `sessionId: string`.

- [ ] **Step 1: Create `order-homework.dto.ts`**

```typescript
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class OrderHomeworkDto {
    @ApiProperty({ description: 'ID của buổi học (session)' })
    @IsNotEmpty()
    @IsString()
    sessionId: string
}
```

- [ ] **Step 2: Export `OrderHomeworkDto` in `dto/index.ts`**

Add `export * from './order-homework.dto'` to `c:\Users\Admin\Desktop\lmsPortal\lms-portal-api\src\modules\homework\dto\index.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/modules/homework/dto/order-homework.dto.ts src/modules/homework/dto/index.ts
git commit -m "feat(homework): add OrderHomeworkDto"
```

---

### Task 2: Update `HomeworkService` Logic for Assigned Filtering & Order Homework

**Files:**
- Modify: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-api\src\modules\homework\homework.service.ts`

**Interfaces:**
- Consumes: `Group`, `GroupHomeworkAssignment`, `StudentClass`, `HomeworkDifficultyLevel` from `@db/models`.
- Produces: `HomeworkService.findApprovedBySession(sessionId, studentId)` and `HomeworkService.orderHomework(sessionId, studentId)`.

- [ ] **Step 1: Inject required models & update `findApprovedBySession` and `orderHomework`**

Update `HomeworkService`:
1. Inject `groupModel`, `groupHomeworkAssignmentModel`, `studentClassModel`.
2. Update `findApprovedBySession(sessionId: string, studentId?: string)` to filter homeworks assigned to `studentId`.
3. Add `orderHomework(sessionId: string, studentId: string)` with max-difficulty random selection and assignment creation.

- [ ] **Step 2: Commit**

```bash
git add src/modules/homework/homework.service.ts
git commit -m "feat(homework): implement assigned filtering and orderHomework service"
```

---

### Task 3: Expose Order Homework & Assigned Filter in `HomeworkStudentController`

**Files:**
- Modify: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-api\src\modules\homework\homework.student.controller.ts`

**Interfaces:**
- Produces: `POST student/homework/order`, `POST student/homework/order/:sessionId`, updated `GET student/homework/session/:sessionId`.

- [ ] **Step 1: Update `HomeworkStudentController`**

Pass `ctx.user?.id` to `findApprovedBySession(sessionId, ctx.user?.id)` and add `@Post('order')` and `@Post('order/:sessionId')`.

- [ ] **Step 2: Commit**

```bash
git add src/modules/homework/homework.student.controller.ts
git commit -m "feat(homework): add order endpoints and pass studentId to findApprovedBySession"
```
