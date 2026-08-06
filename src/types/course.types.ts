export interface CourseRPointConfig {
    enabled: boolean;
    rPointValue: number;
    minCompletionRate: number;
}

export interface CourseGradingFormula {
    useCustomFormula?: boolean;
    attendanceWeight: number; // % chuyên cần
    quizWeight: number; // % kiểm tra đầu giờ
    hackathonWeight?: number; // % hackathon
    examWeight: number; // % thi cuối kỳ
    passScore: number; // Điểm đạt tối thiểu (0-10)

    // Cấu hình Hackathon
    hackathonQuizWeight?: number; // % trắc nghiệm
    hackathonEssayWeight?: number; // % tự luận

    // Hình thức thi cuối kỳ
    finalExamType?: "PROJECT" | "ESSAY";

    // Cấu hình bài thi cuối kỳ – PROJECT
    projectProductWeight?: number; // % điểm sản phẩm
    projectKnowledgeWeight?: number; // % điểm kiến thức
    projectInterviewWeight?: number; // % điểm phỏng vấn

    // Cấu hình bài thi cuối kỳ – ESSAY
    essayEssayWeight?: number; // % tự luận
    essayQuizWeight?: number; // % trắc nghiệm
}

/** BE scoringFormula shape (fractions, weights sum ≈ 1). */
export interface BackendScoringFormula {
    weights: {
        attendance: number;
        quiz: number;
        hackathon: number;
        finalExam: number;
    };
    hackathon: { multipleChoice: number; essay: number };
    finalExam: {
        type: "PROJECT" | "ESSAY";
        project?: { product: number; knowledge: number; interview: number };
        essay?: { written: number; multipleChoice: number };
    };
}

export type SetScoringFormulaPayload = BackendScoringFormula & {
    scoringMethod?: string;
};

export interface CourseBackendEntity {
    id: string;
    name: string;
    courseCode: string;
    position?: number;
    hour?: number;
    totalSessions?: number;
    courseCover?: string;
    description?: string;
    isVisible?: boolean;
    scoringMethod?: string;
    examType?: string;
    whitelist?: boolean;
    accessMode?: "SEQUENTIAL" | "OPEN";
    scoringFormula?: BackendScoringFormula | null;
    rpointFormula?: CourseRPointConfig | null;
    learningOutcomes?: string;
    createdAt?: string;
}

export interface CourseItem {
    id: string;
    code: string;
    title: string;
    category: string; // Loại môn học (động)
    description?: string;
    learningOutcomes?: string;
    accessMode?: "SEQUENTIAL" | "OPEN";
    isVisible?: boolean;
    position?: number;
    hour?: number;
    totalSessions?: number;
    rPointConfig: CourseRPointConfig;
    gradingFormula: CourseGradingFormula;
    createdAt: string;
    updatedAt: string;
}

export type CreateCoursePayload = Omit<CourseItem, "id" | "createdAt" | "updatedAt">;
export type UpdateCoursePayload = Partial<CreateCoursePayload>;

export interface EditSessionModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    editingSession: import("@/types/material.types").Session | null;
    setEditingSession: React.Dispatch<React.SetStateAction<import("@/types/material.types").Session | null>>;
    onSubmit: (e: React.FormEvent) => void;
    isPending: boolean;
}

export enum AccessModeEnum {
    SEQUENTIAL = "SEQUENTIAL",
    OPEN = "OPEN",
}

export enum FinalExamTypeEnum {
    PROJECT = "PROJECT",
    ESSAY = "ESSAY",
}

export interface DeleteCourseModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    course: CourseItem | null;
    onConfirm: (id: string) => Promise<void>;
}

export interface CourseFormModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: CourseItem | null;
    onSubmit: (payload: CreateCoursePayload) => Promise<void>;
}

export interface CategoryManagementModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectCategory?: (category: string) => void;
    selectedCategory?: string;
}
