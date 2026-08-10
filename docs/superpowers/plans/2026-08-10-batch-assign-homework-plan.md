# Batch Assign Homework Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update backend homework assignment API and frontend modal to send a single POST request containing a batch array of homework items (`homeworks: [{ homeworkId, difficultyLevel }]`).

**Architecture:** Extend `AssignGroupHomeworkDto` in NestJS to accept a `homeworks` array of items alongside single fields. Update `GroupService.assignHomework` to process the array in a single batch upsert operation. Update frontend modal to send all selected homework items in one request.

**Tech Stack:** NestJS, TypeScript, MongoDB/Mongoose, React, TanStack Query, Axios/Fetch.

## Global Constraints
- Naming: `homeworks` array containing objects with `homeworkId` and `difficultyLevel`.
- Backward compatibility: Support single `homeworkId` and `difficultyLevel` if `homeworks` is omitted.

---

### Task 1: Backend DTO and Service updates for batch homework assignment

**Files:**
- Modify: `lms-portal-api/src/modules/group/dto/assign-group-homework.dto.ts`
- Modify: `lms-portal-api/src/modules/group/group.service.ts:237-316`

**Interfaces:**
- Produces:
  ```ts
  export class HomeworkAssignmentItemDto {
      homeworkId: string;
      difficultyLevel: HomeworkDifficultyLevel;
  }
  ```
  And updated `AssignGroupHomeworkDto` with `homeworks?: HomeworkAssignmentItemDto[]`.

- [ ] **Step 1: Update DTO definitions**

In `lms-portal-api/src/modules/group/dto/assign-group-homework.dto.ts`, add `HomeworkAssignmentItemDto` and update `AssignGroupHomeworkDto`:

```ts
import { HomeworkDifficultyLevel } from '@db/models'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator'

export class HomeworkAssignmentItemDto {
    @ApiProperty({ example: 'hw_123', description: 'ID bài tập về nhà' })
    @IsNotEmpty()
    @IsString()
    homeworkId: string

    @ApiProperty({
        enum: HomeworkDifficultyLevel,
        example: HomeworkDifficultyLevel.MEDIUM,
        description: 'Cấp độ khó bài tập: EASY | MEDIUM | FAIR | GOOD | EXCELLENT',
    })
    @IsNotEmpty()
    @IsEnum(HomeworkDifficultyLevel)
    difficultyLevel: HomeworkDifficultyLevel
}

export class AssignGroupHomeworkDto {
    @ApiProperty({ example: 'sub_01', description: 'ID môn học' })
    @IsNotEmpty()
    @IsString()
    subjectId: string

    @ApiPropertyOptional({
        type: [HomeworkAssignmentItemDto],
        description: 'Danh sách bài tập cần giao theo mảng',
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => HomeworkAssignmentItemDto)
    homeworks?: HomeworkAssignmentItemDto[]

    @ApiPropertyOptional({ example: 'hw_123', description: 'ID bài tập về nhà (đơn)' })
    @IsOptional()
    @IsString()
    homeworkId?: string

    @ApiPropertyOptional({
        enum: HomeworkDifficultyLevel,
        example: HomeworkDifficultyLevel.MEDIUM,
        description: 'Cấp độ khó bài tập',
    })
    @IsOptional()
    @IsEnum(HomeworkDifficultyLevel)
    difficultyLevel?: HomeworkDifficultyLevel

    @ApiPropertyOptional({
        type: [String],
        example: ['std_101', 'std_102'],
        description: 'Danh sách ID sinh viên trong nhóm nhận bài (để trống nếu giao cho cả nhóm)',
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    assignedStudentIds?: string[]

    @ApiPropertyOptional({ example: '2026-08-15T23:59:59.000Z' })
    @IsOptional()
    @IsString()
    dueDate?: string

    @ApiPropertyOptional({ example: 'Ghi chú cho nhóm bài tập này' })
    @IsOptional()
    @IsString()
    note?: string
}
```

- [ ] **Step 2: Update GroupService.assignHomework**

In `lms-portal-api/src/modules/group/group.service.ts`:

```ts
    async assignHomework(
        groupId: string,
        dto: AssignGroupHomeworkDto,
        userId?: string,
    ) {
        const group = await this.groupModel.findById(groupId)
        if (!group) {
            throw new NotFoundException('Không tìm thấy nhóm học tập')
        }

        if (
            group.subjectIds?.length > 0 &&
            !group.subjectIds.includes(dto.subjectId)
        ) {
            throw new BadRequestException(
                'Môn học không thuộc nhóm học tập này',
            )
        }

        if (dto.assignedStudentIds && dto.assignedStudentIds.length > 0) {
            const memberSet = new Set((group.studentIds || []).map(String))
            const invalidIds = dto.assignedStudentIds.filter(
                (id) => !memberSet.has(String(id)),
            )
            if (invalidIds.length > 0) {
                throw new BadRequestException(
                    `Các sinh viên có ID sau không thuộc nhóm: ${invalidIds.join(
                        ', ',
                    )}`,
                )
            }
        }

        const assignedStudentIds =
            dto.assignedStudentIds && dto.assignedStudentIds.length > 0
                ? dto.assignedStudentIds
                : group.studentIds

        const itemsToAssign: Array<{
            homeworkId: string
            difficultyLevel: HomeworkDifficultyLevel
        }> = []

        if (dto.homeworks && dto.homeworks.length > 0) {
            itemsToAssign.push(...dto.homeworks)
        } else if (dto.homeworkId && dto.difficultyLevel) {
            itemsToAssign.push({
                homeworkId: dto.homeworkId,
                difficultyLevel: dto.difficultyLevel,
            })
        } else {
            throw new BadRequestException(
                'Vui lòng cung cấp danh sách bài tập (homeworks) hoặc bài tập lẻ (homeworkId, difficultyLevel)',
            )
        }

        const results = []
        for (const item of itemsToAssign) {
            let homework: Homework | null = null
            if (Types.ObjectId.isValid(item.homeworkId)) {
                homework = await this.homeworkModel.findById(item.homeworkId)
            }
            if (!homework) {
                homework = await this.homeworkModel.findOne({
                    title: item.homeworkId,
                })
            }
            if (!homework) {
                throw new NotFoundException(
                    `Không tìm thấy bài tập: ${item.homeworkId}`,
                )
            }

            const targetHomeworkId = homework._id
                ? homework._id.toString()
                : homework.id || item.homeworkId

            const assignment = await this.groupHomeworkAssignmentModel
                .findOneAndUpdate(
                    { groupId, homeworkId: targetHomeworkId },
                    {
                        $set: {
                            classId: group.classId,
                            subjectId: dto.subjectId,
                            difficultyLevel: item.difficultyLevel,
                            assignedStudentIds,
                            dueDate: dto.dueDate
                                ? new Date(dto.dueDate)
                                : undefined,
                            note: dto.note || '',
                            assignedBy: userId,
                        },
                    },
                    { new: true, upsert: true, setDefaultsOnInsert: true },
                )
                .exec()

            results.push(assignment)
        }

        return results.length === 1 ? results[0] : results
    }
```

---

### Task 2: Frontend Types and Modal updates for batch homework assignment

**Files:**
- Modify: `lms-portal-admin/src/types/group.types.ts:55-63`
- Modify: `lms-portal-admin/src/components/application/modals/assign-group-homework-modal.tsx:127-183`

- [ ] **Step 1: Update AssignGroupHomeworkRequest interface**

In `lms-portal-admin/src/types/group.types.ts`:

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

- [ ] **Step 2: Update mutation in AssignGroupHomeworkModal**

In `lms-portal-admin/src/components/application/modals/assign-group-homework-modal.tsx`:

```ts
    const mutation = useMutation({
        mutationFn: async () => {
            if (!group) return;
            if (!subjectId) throw new Error(UI_TEXT.assignGroupHomeworkModal.errorSelectSubject);

            // Trường hợp 1: Chọn bài ngẫu nhiên theo số lượng nhập của các cấp độ
            if (totalRandomCount > 0) {
                const homeworksPayload: Array<{ homeworkId: string; difficultyLevel: HomeworkDifficultyLevel }> = [];

                HOMEWORK_DIFFICULTY_LEVELS.forEach((lvl) => {
                    const count = levelCounts[lvl.id] || 0;
                    const pool = homeworksByLevel[lvl.id] || [];

                    if (count > 0 && pool.length > 0) {
                        const shuffled = [...pool].sort(() => RANDOM_SORT_OFFSET - Math.random());
                        const selectedHws = shuffled.slice(0, count);

                        selectedHws.forEach((hw) => {
                            const hwId = hw.id || ((hw as unknown as Record<string, unknown>)._id as string);
                            homeworksPayload.push({
                                homeworkId: hwId,
                                difficultyLevel: lvl.id,
                            });
                        });
                    }
                });

                if (homeworksPayload.length === 0) {
                    throw new Error(UI_TEXT.assignGroupHomeworkModal.errorNoHomeworkInPool);
                }

                await assignHomeworkToGroup(group.id, {
                    subjectId,
                    homeworks: homeworksPayload,
                    assignedStudentIds: selectedStudentIds,
                    dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
                    note: note.trim(),
                });

                return homeworksPayload.length;
            }

            // Trường hợp 2: Điền tên bài tập thủ công
            if (!homeworkTitle.trim()) {
                throw new Error(UI_TEXT.assignGroupHomeworkModal.errorTitleOrRandomRequired);
            }

            await assignHomeworkToGroup(group.id, {
                subjectId,
                homeworks: [
                    {
                        homeworkId: homeworkTitle.trim(),
                        difficultyLevel,
                    },
                ],
                assignedStudentIds: selectedStudentIds,
                dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
                note: note.trim(),
            });
            return 1;
        },
        onSuccess: (assignedCount) => {
            toast.success(
                UI_TEXT.assignGroupHomeworkModal.toastSuccessTitle,
                `${UI_TEXT.assignGroupHomeworkModal.toastSuccessDescPrefix} ${assignedCount || 1} ${UI_TEXT.assignGroupHomeworkModal.toastSuccessDescSuffix}`,
            );
            if (group) {
                queryClient.invalidateQueries({ queryKey: ["group-homeworks", group.id] });
            }
            onClose();
        },
        onError: (err: Error) => {
            toast.error(UI_TEXT.assignGroupHomeworkModal.toastErrorTitle, err?.message || UI_TEXT.assignGroupHomeworkModal.toastDefaultError);
        },
    });
```
