# Đồng bộ API Lưu và Sửa lỗi xóa Học liệu bài học Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đồng bộ hóa các API lưu học liệu bài học (Video, Tài liệu, Quiz) để loại bỏ race condition ghi đè DB, sửa lỗi UI tab tài liệu không reset về Empty State khi xóa, và cho phép xóa/hủy liên kết học liệu thành công ở cả Client và Server.

**Architecture:** 
1. **API (NestJS):** Thay đổi class-validator DTO để `content` (Reading) và `quizId` (Quiz) trở thành optional. Sửa service xử lý: cập nhật/xóa các học liệu tương ứng khi Client truyền lên chuỗi rỗng `""`.
2. **Client (Next.js):** Đưa state `readingType` lên component cha `LessonEditorWrapper` quản lý để đồng bộ xóa. Đổi cơ chế lưu `handleSaveAll` từ song song sang tuần tự (`await` tuần tự từng promise) để tránh race condition trong MongoDB. Truyền rõ tham số rỗng `""` khi người dùng xóa học liệu.

**Tech Stack:** React, Next.js, NestJS, MongoDB, Mongoose, TypeScript.

## Global Constraints
- Phải đảm bảo các API lưu được gọi tuần tự để tránh race condition trên MongoDB/Mongoose.
- Các thay đổi API (DTO, service) không được làm phá vỡ các chức năng cũ.
- Sử dụng chính xác đường dẫn tuyệt đối cho các tệp và các lệnh chạy kiểm thử.

---

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

### Task 2: Cập nhật Frontend Client nâng state quản lý UI và Lưu tuần tự

**Files:**
- Modify: `c:\Users\Admin\Desktop\lmsPortal\lms-portal-admin\src\views\type\type-detail-course-view.tsx`

**Interfaces:**
- Consumes: state bài học và các tabs con trong `type-detail-course-view.tsx`
- Produces: Giao diện cấu hình bài học hoạt động trơn tru, lưu tuần tự, reset UI tài liệu đúng chuẩn.

- [ ] **Step 1: Nâng state `readingType` và Khởi tạo trong `LessonEditorWrapper`**

Khai báo state `readingType` trong `LessonEditorWrapper` (khoảng dòng 637-640) và cập nhật nó trong hook `useEffect` khi dữ liệu `lessonDetails` thay đổi:

```typescript
    const [readingContent, setReadingContent] = useState("");
    const [readingFile, setReadingFile] = useState<File | null>(null);
    const [readingType, setReadingType] = useState<"pdf" | "text" | "">(""); // Nâng state từ con lên cha

    const [quizId, setQuizId] = useState("");

    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<"video" | "reading" | "quiz" | null>(null);

    const triggerDelete = (target: "video" | "reading" | "quiz") => {
        setDeleteTarget(target);
        setIsConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = () => {
        if (deleteTarget === "video") {
            setVideoUrl("");
            setVideoFile(null);
            setVideoDuration(0);
            setVideoQuestions([]);
        } else if (deleteTarget === "reading") {
            setReadingContent("");
            setReadingFile(null);
            setReadingType(""); // Ép kiểu tài liệu về trống để reset UI
        } else if (deleteTarget === "quiz") {
            setQuizId("");
        }
        setDeleteTarget(null);
        setIsConfirmDeleteOpen(false);
    };

    const { data: lessonDetails, isLoading } = useQuery({
        queryKey: ["lesson-details-editor", lessonId],
        queryFn: () => getLessonDetails(lessonId),
        enabled: !!lessonId,
    });

    useEffect(() => {
        if (lessonDetails) {
            setLocalLesson(lessonDetails);
            setVideoUrl(lessonDetails.video?.url || "");
            setVideoDuration(lessonDetails.video?.durationTime || 0);
            setVideoQuestions(lessonDetails.video?.questions || []);
            setReadingContent(lessonDetails.reading?.content || "");
            setQuizId(lessonDetails.quizId || "");
            setVideoFile(null);
            setReadingFile(null);

            // Khởi tạo readingType dựa vào dữ liệu có sẵn
            if (lessonDetails.reading?.pdf) {
                setReadingType("pdf");
            } else if (lessonDetails.reading?.content) {
                setReadingType("text");
            } else {
                setReadingType("");
            }
        }
    }, [lessonDetails]);
```

- [ ] **Step 2: Cập nhật hàm `handleSaveAll` gọi API tuần tự và truyền tham số xóa**

Sửa đổi hàm `handleSaveAll` để thực thi tuần tự các hàm cấu hình học liệu bằng chuỗi các lệnh `await` tuần tự và cập nhật state bài học mới nhất sau mỗi bước:

```typescript
    const handleSaveAll = async () => {
        setIsSaving(true);
        try {
            let currentLesson = { ...lessonDetails } as Lesson;

            // 1. Kiểm tra và lưu Video tuần tự
            const isVideoDirty =
                videoUrl !== (currentLesson?.video?.url || "") ||
                videoDuration !== (currentLesson?.video?.durationTime || 0) ||
                videoFile !== null ||
                JSON.stringify(videoQuestions) !== JSON.stringify(currentLesson?.video?.questions || []);

            if (isVideoDirty) {
                const videoFd = new FormData();
                if (videoFile) {
                    videoFd.append("file", videoFile);
                } else if (videoUrl === "" && currentLesson?.video?.url) {
                    videoFd.append("url", ""); // Báo hiệu xóa video
                } else if (videoUrl) {
                    videoFd.append("url", videoUrl);
                }
                videoFd.append("durationTime", String(videoDuration));
                videoFd.append("questions", JSON.stringify(videoQuestions));
                
                const updated = await configureLessonVideo(lessonId, videoFd);
                currentLesson = updated;
            }

            // 2. Kiểm tra và lưu Reading tuần tự
            const hasPdfBeenDeleted = !!currentLesson?.reading?.pdf && !readingFile && readingType === "";
            const isReadingDirty =
                readingContent !== (currentLesson?.reading?.content || "") ||
                readingFile !== null ||
                hasPdfBeenDeleted;

            if (isReadingDirty) {
                const readingFd = new FormData();
                if (readingFile) {
                    readingFd.append("file", readingFile);
                } else if (hasPdfBeenDeleted) {
                    readingFd.append("pdf", ""); // Báo hiệu xóa tệp PDF
                }
                readingFd.append("content", readingContent);
                readingFd.append("questions", JSON.stringify([]));

                const updated = await configureLessonReading(lessonId, readingFd);
                currentLesson = updated;
            }

            // 3. Kiểm tra và lưu Quiz tuần tự
            const isQuizDirty = quizId !== (currentLesson?.quizId || "");
            if (isQuizDirty) {
                const updated = await linkLessonQuiz(lessonId, quizId);
                currentLesson = updated;
            }

            // Cập nhật state bài học và thông báo
            handleSave(currentLesson);
            toast.success("Thành công", "Đã lưu thông tin bài học thành công");
        } catch (error) {
            toast.error("Lỗi", "Không thể lưu thông tin bài học");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };
```

- [ ] **Step 3: Cập nhật component con `ReadingConfigTab` truyền props từ cha**

Sửa đổi phần gọi `<ReadingConfigTab>` trong `LessonEditorWrapper` (khoảng dòng 816-828):

```tsx
            {/* Reading Config Section */}
            {activeTab === "reading" && (
                <div className="flex flex-col gap-4 flex-1 h-full min-h-0">
                    <ReadingConfigTab
                        key={localLesson.id}
                        readingType={readingType}
                        setReadingType={setReadingType}
                        content={readingContent}
                        setContent={setReadingContent}
                        file={readingFile}
                        setFile={setReadingFile}
                        savedPdf={localLesson.reading?.pdf}
                        onDelete={() => triggerDelete("reading")}
                    />
                </div>
            )}
```

Và sửa đổi định nghĩa component `ReadingConfigTab` ở phía dưới (khoảng dòng 1379) để nhận và sử dụng props `readingType` và `setReadingType` thay vì local state:

```tsx
function ReadingConfigTab({
    readingType,
    setReadingType,
    content,
    setContent,
    file,
    setFile,
    savedPdf,
    onDelete,
}: {
    readingType: "pdf" | "text" | "";
    setReadingType: (type: "pdf" | "text" | "") => void;
    content: string;
    setContent: (c: string) => void;
    file: File | null;
    setFile: (f: File | null) => void;
    savedPdf?: string;
    onDelete?: () => void;
}) {
    const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="flex flex-col gap-4 flex-1 h-full min-h-0">
            {/* Giữ nguyên toàn bộ JSX phía dưới chỉ thay setReadingType cục bộ bằng prop setReadingType */}
            {/* Ví dụ khi bấm chọn PDF: */}
            {/* onClick={() => { setIsSelectModalOpen(false); setReadingType("pdf"); fileInputRef.current?.click(); }} */}
            {/* Ví dụ khi soạn thảo: */}
            {/* onClick={() => { setIsSelectModalOpen(false); setReadingType("text"); setContent(""); }} */}
        </div>
    );
}
```

- [ ] **Step 4: Chạy typecheck và lint tại Frontend**

Chạy type-check để đảm bảo code không có lỗi TypeScript:
Run: `npm run type-check` hoặc `tsc --noEmit` tại `c:\Users\Admin\Desktop\lmsPortal\lms-portal-admin`
Expected: Không có lỗi TypeScript.

---

### Task 3: Xác minh toàn diện các chức năng Lưu/Xóa Học liệu

- [ ] **Step 1: Test lưu bài học khi thêm mới và thay đổi**
  - Mở danh sách bài học, cấu hình video mới -> nhấn "Lưu bài học" -> Tải lại trang xem video đã lưu đúng chưa.
  - Cấu hình PDF hoặc soạn thảo văn bản -> nhấn "Lưu bài học" -> Tải lại trang kiểm tra.
  - Liên kết một Quiz bài tập -> nhấn "Lưu bài học" -> Tải lại trang kiểm tra.

- [ ] **Step 2: Test xóa học liệu và kiểm tra giao diện Empty State**
  - Trong tab tài liệu, bấm biểu tượng Thùng rác đỏ -> Xác nhận xóa ở Modal -> Kiểm tra xem giao diện có tự động chuyển về màn hình Empty State ("Tài liệu / Bài đọc hiện tại đang trống") không.
  - Nhấn "Lưu bài học" -> Tải lại trang xem tài liệu đã bị xóa hẳn khỏi cơ sở dữ liệu chưa.
  - Thực hiện tương tự cho việc xóa video và hủy liên kết bài tập Quiz.
