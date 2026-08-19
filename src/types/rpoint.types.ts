export type CourseRpointTabType = "linear" | "tiers" | "bonus" | "eligibility";

export interface AddRpointBonusModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: string;
    studentName: string;
    studentCode: string;
    courseId: string;
    classId: string;
    onSuccess?: () => void;
}

export interface AddViolationModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: string;
    studentName: string;
    studentCode: string;
    courseId: string;
    classId: string;
    onSuccess?: () => void;
}

export interface StudentRpointDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: string;
    studentName: string;
    studentCode: string;
    courseId: string;
    classId: string;
}

export interface AutoRPointSeries {
    period: string;
    sessions: {
        total: number;
        present: number;
        late: number;
        absentExcused: number;
        absentUnexcused: number;
    };
    absenceRate: number;
    submissionRate: number;
    rpoint: number;
}

export interface RpointTier {
    minCount: number;
    score: number;
}

export interface EligibilityRule {
    rpointMin: number;
    attendanceRateMin: number;
    homeworkRateMin: number;
    elearningLateMax: number;
}

export interface RpointFormula {
    attendance: { max: number; deductionPerPercent: number };
    assignment: { max: number; deductionPerPercent: number };
    preparation: { max: number; tiers: RpointTier[] };
    compliance: { max: number; tiers: RpointTier[] };
    bonus: { cap: number };
    eligibility: EligibilityRule;
}

export type RpointFormulaSource = "class" | "course" | "default";

export interface EffectiveFormulaResponse {
    formula: RpointFormula;
    source?: RpointFormulaSource;
    isDefault: boolean;
}

export interface RpointPreviewInputs {
    absenceRate?: number;
    missingRate?: number;
    lateCount?: number;
    violationCount?: number;
    learningBonus?: number;
    classOfficerBonus?: number;
    manualBonus?: number;
}

export interface RpointPreviewResult {
    attendance: number;
    assignment: number;
    preparation: number;
    compliance: number;
    baseScore: number;
    bonusTotal: number;
    totalScore: number;
}

export interface CourseRpointConfigModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    courseId: string;
    courseTitle: string;
    // Khi có classId: cấu hình công thức RIÊNG cho môn ở lớp này (override cấp môn).
    classId?: string;
}
