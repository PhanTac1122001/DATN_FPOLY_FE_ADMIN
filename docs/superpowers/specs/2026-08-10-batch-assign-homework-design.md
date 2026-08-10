# Spec: Batch Assign Homework to Group in Single API Call

## Context & Problem
Currently, when assigning homework to a study group in `AssignGroupHomeworkModal` with multiple selected homework items (e.g. random selections across difficulty levels), the frontend executes multiple HTTP POST requests (`POST /staff/groups/:id/assign-homework`) in parallel via `Promise.all`. This causes multiple redundant API requests in Network tab.

## Proposed Solution
Update `POST /staff/groups/:id/assign-homework` endpoint payload to accept a `homeworks` array. The frontend will combine all homework items into a single array payload and execute only 1 API call per assignment operation.

---

## 1. Backend Changes (`lms-portal-api`)

### 1.1 DTO Updates (`AssignGroupHomeworkDto`)
Location: `lms-portal-api/src/modules/group/dto/assign-group-homework.dto.ts`

- Create `HomeworkAssignmentItemDto`:
  - `homeworkId`: string (required)
  - `difficultyLevel`: `HomeworkDifficultyLevel` (required)
- Update `AssignGroupHomeworkDto`:
  - `homeworks`: `HomeworkAssignmentItemDto[]` (optional, array of homework items)
  - `homeworkId`: string (optional, for backward compatibility)
  - `difficultyLevel`: `HomeworkDifficultyLevel` (optional, for backward compatibility)
  - `subjectId`: string (required)
  - `assignedStudentIds`: string[] (optional)
  - `dueDate`: string (optional)
  - `note`: string (optional)

### 1.2 Service Updates (`GroupService.assignHomework`)
Location: `lms-portal-api/src/modules/group/group.service.ts`

- Normalize items list:
  - If `dto.homeworks` is provided and non-empty, use `items = dto.homeworks`.
  - Otherwise, fallback to `items = [{ homeworkId: dto.homeworkId, difficultyLevel: dto.difficultyLevel }]`.
- Validate group and student IDs once before loop.
- Loop over `items`:
  - Find homework by ID or title for each item.
  - Upsert assignment in `groupHomeworkAssignmentModel` for `(groupId, targetHomeworkId)`.
- Return array of created/updated `GroupHomeworkAssignment` documents.

---

## 2. Frontend Changes (`lms-portal-admin`)

### 2.1 Types (`lms-portal-admin/src/types/group.types.ts`)
Update `AssignGroupHomeworkRequest`:
```ts
export interface HomeworkAssignmentItem {
    homeworkId: string;
    difficultyLevel: HomeworkDifficultyLevel;
}

export interface AssignGroupHomeworkRequest {
    subjectId: string;
    homeworks?: HomeworkAssignmentItem[];
    homeworkId?: string;
    difficultyLevel?: HomeworkDifficultyLevel;
    assignedStudentIds?: string[];
    dueDate?: string;
    note?: string;
}
```

### 2.2 Modal Implementation (`AssignGroupHomeworkModal`)
Location: `lms-portal-admin/src/components/application/modals/assign-group-homework-modal.tsx`

- For random assignment:
  - Collect selected homework items into `homeworksPayload: HomeworkAssignmentItem[]`.
  - Invoke `assignHomeworkToGroup(group.id, { subjectId, homeworks: homeworksPayload, ... })` in 1 single call.
- For manual homework title input:
  - Invoke `assignHomeworkToGroup(group.id, { subjectId, homeworks: [{ homeworkId: homeworkTitle.trim(), difficultyLevel }], ... })`.

---

## Verification Plan
1. Send 1 batch assignment from modal with multiple random items and verify Network tab shows exactly **1** request to `assign-homework` payload with `homeworks` array.
2. Verify all homework assignments are successfully created/upserted in MongoDB database.
3. Test single title assignment to ensure single item assignment still works properly.
