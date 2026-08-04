### Task 1: Cập nhật API Backend để hỗ trợ Hủy/Xóa học liệu

**Files:**
- Modify: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-api\src\modules\lesson\dto\upload-material.dto.ts`
- Modify: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-api\src\modules\lesson\lesson.service.ts`

**Interfaces:**
- Consumes: `UploadLessonVideoDto`, `UploadLessonReadingDto`, `AssignLessonQuizDto`
- Produces: APIs backend cập nhật thành công video, reading và quiz kể cả khi xóa chúng.

- [ ] **Step 1: Thay đổi DTO để hỗ trợ các thuộc tính optional**

Sửa đổi tệp `upload-material.dto.ts` để đổi `content` (của `UploadLessonReadingDto`) và `quizId` (của `AssignLessonQuizDto`) thành `@IsOptional()` để cho phép truyền chuỗi rỗng khi xóa/hủy liên kết:

```typescript
// c:\Users\Admin\Desktop\lmsPortal\lms-portal-api\src\modules\lesson\dto\upload-material.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type } from 'class-transformer'
import {
    IsArray,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator'

import { QuizQuestionDto } from '../../quiz/dto/create-quiz.dto'

export class UploadLessonVideoDto {
    @ApiPropertyOptional({ example: 'https://example.com/video.mp4' })
    @IsOptional()
    @IsString()
    url?: string

    @ApiPropertyOptional({ example: 300 })
    @IsOptional()
    @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
    @IsInt()
    durationTime?: number

    @ApiPropertyOptional({ type: [QuizQuestionDto] })
    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value)
            } catch {
                return value
            }
        }
        return value
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuizQuestionDto)
    questions?: QuizQuestionDto[]
}

export class UploadLessonReadingDto {
    @ApiPropertyOptional({ example: 'Nội dung bài đọc' })
    @IsOptional()
    @IsString()
    content?: string

    @ApiPropertyOptional({ example: 'https://example.com/reading.pdf' })
    @IsOptional()
    @IsString()
    pdf?: string

    @ApiPropertyOptional({ type: [QuizQuestionDto] })
    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value)
            } catch {
                return value
            }
        }
        return value
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuizQuestionDto)
    questions?: QuizQuestionDto[]
}

export class AssignLessonQuizDto {
    @ApiPropertyOptional({ example: '60c72b2f9b1d8b2bad000002' })
    @IsOptional()
    @IsString()
    quizId?: string
}
```

- [ ] **Step 2: Cập nhật hàm service uploadVideoMaterial**

Cập nhật `lesson.service.ts` để kiểm tra: nếu `dto.url` là chuỗi rỗng `""` và không tải file lên, thực hiện xóa video (thiết lập `lesson.video = null`, `lesson.videoUrl = ""`). Nếu `dto.url` là `undefined`, giữ nguyên video cũ:

```typescript
// Trích đoạn modify uploadVideoMaterial trong c:\Users\Admin\Desktop\lmsPortal\lms-portal-api\src\modules\lesson\lesson.service.ts
    async uploadVideoMaterial(
        id: string,
        file: Express.Multer.File,
        dto: UploadLessonVideoDto,
    ): Promise<LessonEntity> {
        const lesson = await this.LessonModel.findById(id)
        if (!lesson) {
            throw new NotFoundException('Không tìm thấy bài học')
        }

        let videoUrl = dto.url
        if (file) {
            videoUrl = await this.uploadService.uploadFile(file)
        } else if (videoUrl === undefined && lesson.video?.url) {
            videoUrl = lesson.video.url
        }

        let durationTime = dto.durationTime
        if (!durationTime && videoUrl) {
            const ytDuration = await this.getYoutubeVideoDuration(videoUrl)
            if (ytDuration !== null) {
                durationTime = ytDuration
            }
        }

        if (durationTime === undefined) {
            durationTime = lesson.video?.durationTime
        }

        if (!videoUrl && !file) {
            lesson.video = null
            lesson.videoUrl = ''
        } else {
            lesson.video = {
                url: videoUrl || '',
                durationTime: durationTime || 0,
                questions:
                    dto.questions !== undefined
                        ? (dto.questions as any)
                        : lesson.video?.questions || [],
            }
            lesson.videoUrl = videoUrl || ''
        }

        await lesson.save()
        return new LessonEntity(lesson)
    }
```

- [ ] **Step 3: Cập nhật hàm service uploadReadingMaterial**

Cập nhật `lesson.service.ts` để kiểm tra: nếu cả `dto.content` và `dto.pdf` (hoặc file) đều trống, thực hiện xóa tài liệu bài đọc (thiết lập `lesson.reading = null`, `lesson.pdf = ""`). Nếu `dto.pdf` là `undefined`, giữ nguyên PDF cũ:

```typescript
// Trích đoạn modify uploadReadingMaterial trong c:\Users\Admin\Desktop\lmsPortal\lms-portal-api\src\modules\lesson\lesson.service.ts
    async uploadReadingMaterial(
        id: string,
        file: Express.Multer.File,
        dto: UploadLessonReadingDto,
    ): Promise<LessonEntity> {
        const lesson = await this.LessonModel.findById(id)
        if (!lesson) {
            throw new NotFoundException('Không tìm thấy bài học')
        }

        let pdfUrl = dto.pdf
        if (file) {
            pdfUrl = await this.uploadService.uploadFile(file)
        } else if (pdfUrl === undefined && lesson.reading?.pdf) {
            pdfUrl = lesson.reading.pdf
        }

        const content = dto.content || ''
        const questions =
            dto.questions !== undefined
                ? (dto.questions as any)
                : lesson.reading?.questions || []

        if (!content && !pdfUrl && !file) {
            lesson.reading = null
            lesson.pdf = ''
        } else {
            lesson.reading = {
                content,
                pdf: pdfUrl || undefined,
                questions,
            }
            lesson.pdf = pdfUrl || ''
        }

        await lesson.save()
        return new LessonEntity(lesson)
    }
```

- [ ] **Step 4: Cập nhật hàm service assignQuiz**

Cập nhật `lesson.service.ts` để kiểm tra: nếu `dto.quizId` trống hoặc rỗng `""`, thực hiện hủy liên kết quiz (thiết lập `lesson.quizId = null` hoặc `undefined`):

```typescript
// Trích đoạn modify assignQuiz trong c:\Users\Admin\Desktop\lmsPortal\lms-portal-api\src\modules\lesson\lesson.service.ts
    async assignQuiz(
        id: string,
        dto: AssignLessonQuizDto,
    ): Promise<LessonEntity> {
        const lesson = await this.LessonModel.findById(id)
        if (!lesson) {
            throw new NotFoundException('Không tìm thấy bài học')
        }

        if (!dto.quizId) {
            lesson.quizId = null
        } else {
            const QuizModel = this.LessonModel.db.model(DbCollections.QUIZ)
            const quizExists = await QuizModel.exists({ _id: dto.quizId })
            if (!quizExists) {
                throw new NotFoundException('Không tìm thấy quiz')
            }
            lesson.quizId = dto.quizId
        }

        await lesson.save()
        return new LessonEntity(lesson)
    }
```

- [ ] **Step 5: Chạy TypeScript và Lint kiểm tra API**

Chạy lệnh kiểm tra lỗi cú pháp và lint tại thư mục backend:
Run: `pnpm run lint` tại `c:\Users\Admin\Desktop\lmsPortal\lms-portal-api`
Expected: Không có lỗi typescript hoặc lint.

---
