export enum EmbeddedQuestionTypeEnum {
    SINGLE_CHOICE = "SINGLE_CHOICE",
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
}

export interface EmbeddedOption {
    content: string;
    isCorrect: boolean;
}

export interface EmbeddedQuestion {
    _id?: string;
    content: string;
    type: EmbeddedQuestionTypeEnum | "SINGLE_CHOICE" | "MULTIPLE_CHOICE";
    timeInVideo?: number; // seconds
    points: number;
    options: EmbeddedOption[];
}

export interface VideoMaterial {
    url: string;
    durationTime: number;
    questions: EmbeddedQuestion[];
}

export interface ReadingMaterial {
    content: string;
    pdf?: string;
    htmlUrl?: string;
    questions: EmbeddedQuestion[];
}

export interface Homework {
    id: string;
    sessionId: string;
    courseId: string;
    title: string;
    description: string;
    tutorial?: string;
    gradingCriteria?: string;
    sampleLink?: string;
    expectedTime?: number;
    position?: number;
    /* eslint-disable-next-line @typescript-eslint/no-magic-numbers */
    status: 0 | 1 | 2; // 0: Pending, 1: Approved, 2: Rejected
}

export interface LessonCompletionLogic {
    requireCompletion: boolean; // Bắt buộc hoàn thành bài học mới qua bài tiếp
    requireMinPercentage: boolean; // Yêu cầu thời lượng xem/đọc >= 80%
    minPercentageValue: number;
    requireMinQuizScore: boolean; // Yêu cầu điểm quiz/bài tập >= passScore
    minQuizScoreValue: number;
    allowRetake: boolean; // Cho phép học viên làm lại khi chưa đạt
}

export interface Lesson {
    id: string;
    name: string;
    sessionId: string;
    status: boolean;
    position?: number;
    videoUrl?: string;
    pdf?: string;
    description?: string;
    video?: VideoMaterial | null;
    reading?: ReadingMaterial | null;
    quizId?: string | null;
    sequentialBlocks?: boolean;
    completionLogic?: LessonCompletionLogic;
}

export interface SessionPracticeResource {
    label?: string;
    url: string;
}

export interface SessionPractice {
    _id?: string;
    id?: string;
    content: string;
    resources?: SessionPracticeResource[];
    submissionType: "LINK" | "FILE" | "TEXT";
}

export interface SessionCompletionLogic {
    requireSequential: boolean; // Mở khóa tuần tự
    requireAllLessons: boolean; // Yêu cầu hoàn thành tất cả lessons
    requireMinPassScore: boolean; // Yêu cầu điểm tối thiểu
    minPassScoreValue: number;
}

export enum SessionTypeEnum {
    LY_THUYET = "LY_THUYET",
    THUC_HANH = "THUC_HANH",
    BAI_TAP = "BAI_TAP",
    KIEM_TRA = "KIEM_TRA",
}

export interface Session {
    id: string;
    name: string;
    courseId: string;
    position: number;
    createdAt: string;
    mindmap?: string;
    srs?: string;
    pdf?: string;
    status?: boolean;
    type?: SessionTypeEnum | string;
    typeId?: string;
    miniProject?: string;
    exercise?: string;
    quizzi?: string;
    practiceEntranceQuiz?: string;
    isShowMindmap?: boolean;
    description?: string;
    practice?: SessionPractice | null;
    practices?: SessionPractice[];
    completionLogic?: SessionCompletionLogic;
}

export interface Course {
    id: string;
    name: string;
    courseCode: string;
    position: number;
    hour: number;
    category?: string; // Loại môn học
    courseCover?: string;
    description?: string;
    isVisible: boolean;
}

export interface Quiz {
    id: string;
    title: string;
    createdAt: string;
    description?: string;
    passThreshold?: number;
    courseId?: string;
    questions?: EmbeddedQuestion[];
}

export interface ReadingQuestion {
    id?: string;
    content: string;
    answer: string;
}

export interface ReadingQuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (question: ReadingQuestion) => void;
    question?: ReadingQuestion | null;
}

export interface ReadingConfigTabProps {
    readingSubTab?: "document" | "questions";
    setReadingSubTab?: (tab: "document" | "questions") => void;
    content: string;
    setContent: (c: string) => void;
    file: File | null;
    setFile: (f: File | null) => void;
    htmlFiles: File[];
    setHtmlFiles: (files: File[]) => void;
    pdfUrl: string;
    setPdfUrl: (url: string) => void;
    questions?: ReadingQuestion[];
    setQuestions?: (q: ReadingQuestion[]) => void;
    savedPdf?: string;
    savedHtmlUrl?: string;
    onClearSavedMedia?: () => void;
    onDelete?: () => void;
    onRegisterOpenModal?: (fn: () => void) => void;
    onRegisterAddQuestionModal?: (fn: () => void) => void;
}

export interface SelectPdfSourceModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectUpload: () => void;
    onSelectHtmlUpload?: () => void;
    onSelectLink: () => void;
    onSelectWrite: () => void;
}

export interface LinkPdfModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    tempLink: string;
    setTempLink: (link: string) => void;
    onBack: () => void;
    onConfirm: () => void;
}

export interface SelectVideoSourceModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectLink: () => void;
    onSelectFile: () => void;
}

export interface LinkVideoModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    tempLink: string;
    setTempLink: (link: string) => void;
    onBack: () => void;
    onConfirm: () => void;
}

export interface QuizOption {
    id: string;
    title: string;
    createdAt?: string | Date;
}

export interface SelectQuizModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    quizzes: QuizOption[];
    tempQuizId: string;
    setTempQuizId: (id: string) => void;
    onConfirm: () => void;
}

export interface AddSessionTypeModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onAddType: (label: string) => void;
}

export interface LessonEditorWrapperProps {
    lessonId: string;
    quizzes: QuizOption[];
    activeTab: "video" | "reading" | "quiz";
    onRegisterSave?: (saveFn: () => Promise<void>) => void;
    onIsSavingChange?: (isSaving: boolean) => void;
    onIsDirtyChange?: (isDirty: boolean) => void;
}

export interface SessionViewerWrapperProps {
    session?: Session;
    activeTab: "mindmap" | "pdf" | "srs" | "miniProject" | "exercise" | "practiceEntranceQuiz" | "practice" | "homework";
    selectedPracticeId?: string;
    onChangeTab?: (tab: "mindmap" | "pdf" | "srs" | "miniProject" | "exercise" | "practiceEntranceQuiz" | "practice" | "homework") => void;
}
