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
