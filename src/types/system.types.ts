import type { CourseItem } from "./course.types";

export interface System {
    id: string;
    systemCode: string;
    name: string;
    createdAt: string;
}

export interface CreateSystemRequest {
    code: string;
    name: string;
}

export interface UpdateSystemRequest {
    code?: string;
    name?: string;
}

export interface SystemModalProps {
    isOpen: boolean;
    onClose: () => void;
    system?: System | null;
}

export interface AssignCourseModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    systemName: string;
    onAssign: (selectedCourses: CourseItem[]) => Promise<void>;
}

export interface Semester {
    id: string;
    name: string;
    priority: number;
    specializeId: string;
    courseIds: string[];
}

export interface Specialize {
    id: string;
    name: string;
    systemId: string;
}

export interface FormSemester {
    id?: string;
    name: string;
}

export interface FormSpecialize {
    id?: string;
    name: string;
    semesters: FormSemester[];
    isSemestersVisible?: boolean;
}
