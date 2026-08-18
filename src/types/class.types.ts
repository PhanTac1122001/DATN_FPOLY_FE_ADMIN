import type { Group } from "./group.types";

export enum ClassTypeEnum {
    FULLTIME = "FULLTIME",
    PARTTIME = "PARTTIME",
    ONLINE = "ONLINE",
}

export enum CourseClassStatusEnum {
    PENDING = "PENDING",
    STUDYING = "STUDYING",
    FINISHED = "FINISHED",
}

export interface ClassEntity {
    id: string;
    name: string;
    classCode: string;
    type?: string;
    courseIds?: string[];
    userIds?: string[];
    courseCount?: number;
    studentCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface CourseClassEmbed {
    id: string;
    status: CourseClassStatusEnum | string;
    startDate?: string;
    endDate?: string;
    courseId?: {
        id?: string;
        name: string;
        courseCode: string;
        hour?: number;
    };
    teacherId?: {
        id?: string;
        fullName: string;
        email?: string;
        avatar?: string;
    };
    taId?: {
        id?: string;
        fullName: string;
        email?: string;
        avatar?: string;
    };
}

export enum StudentClassStatusEnum {
    STUDYING = "STUDYING",
    DROPOFF = "DROPOFF",
    RESERVED = "RESERVED",
}

export interface StudentClassEmbed {
    enrollmentId: string;
    student: {
        id?: string;
        fullName: string;
        studentCode?: string;
        email: string;
    };
    status: StudentClassStatusEnum | string;
    isActive: boolean;
    enrolledAt?: string;
}

export interface ClassDetailSummary {
    courseCount: number;
    studentCount: number;
    activeStudentCount: number;
    groupCount?: number;
}

export interface ClassDetail {
    class: ClassEntity;
    courses: CourseClassEmbed[];
    students: StudentClassEmbed[];
    groups?: Group[];
    summary: ClassDetailSummary;
    name?: string;
    coursesAssigned?: Array<{
        courseId?: string;
        courseName?: string;
        _id?: string;
        id?: string;
    }>;
}

export interface CreateClassRequest {
    name: string;
    classCode: string;
    type?: string;
    courseIds?: string[];
    userIds?: string[];
}

export type UpdateClassRequest = Partial<CreateClassRequest>;

export interface CreateCourseClassRequest {
    classId: string;
    courseId: string;
    teacherId: string;
    taId?: string;
    status?: CourseClassStatusEnum | string;
    startDate?: string;
    endDate?: string;
}

export type UpdateCourseClassRequest = Partial<Omit<CreateCourseClassRequest, "classId" | "courseId">>;

export interface CreateStudentClassRequest {
    classId: string;
    studentId: string;
    status?: string;
    isActive?: boolean;
}

export interface UpdateStudentClassRequest {
    status?: string;
    isActive?: boolean;
}

export interface ClassModalProps {
    isOpen: boolean;
    onClose: () => void;
    classData?: ClassEntity | null;
}

export type DetailTabType = "info" | "courses" | "students" | "groups";

export interface ClassDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    classId: string | null;
}

export interface ClassLearningSubpanelProps {
    classId: string;
    courses?: CourseClassEmbed[];
    students?: StudentClassEmbed[];
}

export interface ClassScheduleSubpanelProps {
    classId: string;
    courses?: CourseClassEmbed[];
    students?: StudentClassEmbed[];
}

export type AttendanceStatus = "PRESENT" | "LATE" | "ABSENT_EXCUSED" | "ABSENT_UNEXCUSED";

export interface AttendanceSession {
    id: string;
    classId: string;
    courseId: string;
    date: string;
    period?: number;
    sessionType?: "NORMAL" | "PROJECT";
    mode?: "OFFLINE" | "ONLINE" | "PROJECT";
    topic?: string;
    sessionId?: string;
}

export interface AttendanceEntry {
    studentId: string;
    status: AttendanceStatus;
    note?: string;
    isSessionCompleted?: boolean;
}

export interface AttendanceRosterItem {
    studentId: string;
    fullName: string;
    studentCode: string;
    status: AttendanceStatus | string | null;
    note?: string | null;
    isSessionCompleted?: boolean;
}

export interface CreateSessionRequest {
    classId: string;
    courseId: string;
    date: string;
    period?: number;
    sessionType?: string;
    mode?: string;
    topic?: string;
    sessionId?: string;
}

export interface MarkAttendanceRequest {
    entries: AttendanceEntry[];
}

export interface AttendanceHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    classId: string;
    courses: CourseClassEmbed[];
    students?: StudentClassEmbed[];
    currentAttendanceMap?: Record<string, { status: string; note: string }>;
    selectedCourseId?: string;
    onSelectSession?: (session: AttendanceSession) => void | Promise<void>;
}

export interface ClassDetailClientViewProps {
    id: string;
}

export type ClassDetailTabType = "overview" | "schedule" | "learning" | "roster";

export interface ClassDetailViewProps {
    id?: string;
    classId: string;
    onBack?: () => void;
}

export interface ClassLearningClientViewProps {
    id: string;
}

export interface ClassLearningPageViewProps {
    classId: string;
}

export interface ClassScheduleClientViewProps {
    id: string;
}

export interface ClassSchedulePageViewProps {
    classId: string;
}

export interface CourseClassModalProps {
    isOpen: boolean;
    onClose: () => void;
    classId: string;
    courseClassData?: CourseClassEmbed | null;
}

export interface EnrollStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    classId: string;
    enrollmentData?: StudentClassEmbed | null;
}

export interface UncompletedElearningModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: string;
    studentName: string;
    studentCode: string;
    classId: string;
    courseId: string;
    isLocked?: boolean;
}
