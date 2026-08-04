import type { Course } from "./material.types";
import type { Semester } from "./system.types";

export interface SemesterMock {
    id: string;
    semesterName: string;
    badgeColor: "warning" | "orange" | "error" | "blue" | "success";
}

export interface TrainingTypeMock {
    id: string;
    code: string;
    name: string;
    majors: string;
    createdAt: string;
    semesters: SemesterMock[];
}

export interface TypeDetailViewProps {
    id: string;
}

export interface TypeDetailClientViewProps {
    id: string;
}

export interface SemesterWithSpec extends Semester {
    specializeName: string;
}

export interface CourseListModalProps {
    isOpen: boolean;
    onClose: () => void;
    semesterName: string;
    courses: Course[];
}

export interface TypeDetailCourseClientViewProps {
    courseId: string;
}

export interface TypeDetailCourseViewProps {
    id?: string;
    courseId: string;
}

export interface SystemCourseItem {
    id: string;
    courseCode: string;
    name: string;
    hour?: number;
    category?: string;
    description?: string;
    isVisible?: boolean;
    position?: number;
}
