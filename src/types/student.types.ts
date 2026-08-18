import type { System } from "./system.types";

export type StudentLocation = "HN" | "HCM";
export type StudentStatus = "ĐANG HỌC" | "BẢO LƯU" | "CHỜ BẢO LƯU" | "BỎ HỌC" | "TỐT NGHIỆP" | "TỐT NGHIỆP SỚM" | "ĐÌNH CHỈ";

export enum StudentStatusEnum {
    DANG_HOC = "ĐANG HỌC",
    BAO_LUU = "BẢO LƯU",
    CHO_BAO_LUU = "CHỜ BẢO LƯU",
    BO_HOC = "BỎ HỌC",
    TOT_NGHIEP = "TỐT NGHIỆP",
    TOT_NGHIEP_SOM = "TỐT NGHIỆP SỚM",
    DINH_CHI = "ĐÌNH CHỈ",
}

export type GenderType = "MALE" | "FEMALE" | "OTHER";

export interface Student {
    id: string;
    studentCode: string;
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: GenderType;
    status: StudentStatus;
    location: StudentLocation;
    avatar?: string;
    isLocked: boolean;
    lockedUntil?: string | null;
    systemIds: string[];
    specializeIds?: string[];
    identityCard?: string;
    address?: string;
    hometown?: string;
    languages?: string;
    facebookAddress?: string;
    role?: string;
    createdAt: string;
    updatedAt: string;
}

export interface StudentReport {
    systemId: string;
    systemName: string | null;
    systemCode: string | null;
    total: number;
    byStatus: Record<string, number>;
}

export interface StudentClassEnrollment {
    id: string;
    studentId: string;
    classId: string;
    isActive: boolean;
    status: "STUDYING" | "DROPOFF" | "RESERVED";
    createdAt: string;
}

export interface Classroom {
    id: string;
    className?: string;
    name?: string;
    classCode?: string;
    code?: string;
    courseId?: string;
    status?: string;
    createdAt?: string;
}

export interface LearningPathItem {
    id: string;
    studentId: string;
    courseId: string;
    courseName?: string;
    courseCode?: string;
    source: "SYSTEM_SEED" | "MANUAL_ASSIGN";
    semesterId?: string;
    specializeId?: string;
    position: number;
    isRequired: boolean;
    isActive: boolean;
    createdAt: string;
}

export interface TranscriptSummary {
    totalCourses: number;
    passedCount: number;
    failedCount: number;
    avgScore: number;
}

export interface AttemptResult {
    id: string;
    count: number;
    classId?: string;
    className?: string;
    totalScore: number;
    bonus?: number;
    scoreWithBonus: number;
    pass: boolean;
    status: number; // 0 = Draft, 1 = Teacher Approved, 2 = Admin Approved
    note?: string | null;
    createdAt: string;
}

export interface EffectiveResult extends AttemptResult {
    courseId: string;
    courseName?: string;
    courseCode?: string;
    homework?: number;
    elearning?: number;
    attendance?: number;
    quizzi?: number;
    project?: number;
    retakeProject?: number | null;
    rpoints?: number;
}

export interface TranscriptItem {
    effective: EffectiveResult;
    attemptCount: number;
    attempts: AttemptResult[];
}

export interface StudentTranscriptResponse {
    studentId: string;
    summary: TranscriptSummary;
    results: TranscriptItem[];
}

export interface SpecializationOption {
    id: string;
    name: string;
    code?: string;
}

export interface StaffCourseOption {
    id: string;
    name: string;
    courseCode?: string;
}

export interface ExcelImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    systems: System[];
}
export interface StudentFormValues {
    fullName: string;
    email: string;
    phone: string;
    location: StudentLocation;
    dateOfBirth: string;
    studentCode: string;
    password: string;
    status: StudentStatus;
    systemId: string;
    lockedUntil: string;
    systemIds: string[];
}
