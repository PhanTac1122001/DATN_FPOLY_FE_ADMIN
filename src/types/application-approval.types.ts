export enum ApplicationTypeEnum {
    ALL = "ALL",
    RE_EXAM = "RE_EXAM",
    RE_GRADE = "RE_GRADE",
    RE_GRADE_DOC = "RE_GRADE_DOC",
    LEAVE_LONG_TERM = "LEAVE_LONG_TERM",
    TUITION_DELAY = "TUITION_DELAY",
    ACADEMIC_RESERVE = "ACADEMIC_RESERVE",
    EXAM_POSTPONE = "EXAM_POSTPONE",
    RE_LEARN = "RE_LEARN",
}

export enum ApplicationStatusEnum {
    ALL = "ALL",
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
}

export enum SlaStatusFilterEnum {
    ALL = "ALL",
    OVERDUE = "OVERDUE",
    WARNING = "WARNING",
    OK = "OK",
}

export enum ExamTypeEnum {
    RE_TAKE = "RE_TAKE",
    SUPPLEMENTARY = "SUPPLEMENTARY",
}

export interface StudentInfo {
    id: string;
    studentCode: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    className?: string;
    dob?: string;
    phone?: string;
    cohort?: string;
    major?: string;
    address?: string;
}

export interface ApplicationItem {
    id: string;
    code: string;
    type: ApplicationTypeEnum;
    typeName: string;
    student: StudentInfo;
    semesterId?: string;
    semesterName?: string;
    courseId?: string;
    courseName?: string;
    courseCode?: string;
    examType?: "RE_TAKE" | "SUPPLEMENTARY";
    currentGrade?: number;
    reason?: string;
    notes?: string;
    attachmentUrl?: string;
    attachmentName?: string;
    status: ApplicationStatusEnum;
    submittedAt: string;
    processedAt?: string;
    processedBy?: string;
    rejectReason?: string;

    // Specific form fields matching document templates in images
    commitmentDate?: string; // TUITION_DELAY
    fromSemester?: string; // LEAVE_LONG_TERM, ACADEMIC_RESERVE
    fromYear?: string;
    toSemester?: string;
    toYear?: string;
    fromDate?: string;
    examDate?: string; // EXAM_POSTPONE
    examBatch?: string; // EXAM_POSTPONE
    examShift?: string; // EXAM_POSTPONE, RE_GRADE
    examRoom?: string; // EXAM_POSTPONE, RE_GRADE
    attachmentNotes?: string;
}

export interface ApplicationStats {
    totalCount: number;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
}

export interface FilterApplicationQuery {
    type?: ApplicationTypeEnum | "ALL";
    semesterId?: string;
    courseId?: string;
    status?: ApplicationStatusEnum | "ALL";
    search?: string;
    startDate?: string;
    endDate?: string;
}

export interface CreateApplicationDto {
    type: ApplicationTypeEnum;
    studentId?: string;
    studentName?: string;
    studentCode?: string;
    dob?: string;
    phone?: string;
    className?: string;
    cohort?: string;
    major?: string;
    address?: string;
    semesterId?: string;
    semesterName?: string;
    courseId?: string;
    courseName?: string;
    courseCode?: string;
    examType?: "RE_TAKE" | "SUPPLEMENTARY";
    currentGrade?: number;
    reason?: string;
    notes?: string;
    attachmentName?: string;
    attachmentUrl?: string;

    // Specific form fields matching document templates
    commitmentDate?: string;
    fromSemester?: string;
    fromYear?: string;
    toSemester?: string;
    toYear?: string;
    fromDate?: string;
    examDate?: string;
    examBatch?: string;
    examShift?: string;
    examRoom?: string;
    attachmentNotes?: string;
}

export interface ApplicationDetailModalProps {
    item: ApplicationItem | null;
    isOpen: boolean;
    onClose: () => void;
    onApprove: (id: string) => Promise<void>;
    onReject: (id: string, reason: string) => Promise<void>;
}
