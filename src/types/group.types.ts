export enum HomeworkDifficultyEnum {
    EASY = "EASY",
    MEDIUM = "MEDIUM",
    FAIR = "FAIR",
    GOOD = "GOOD",
    EXCELLENT = "EXCELLENT",
}

export type HomeworkDifficultyLevel = keyof typeof HomeworkDifficultyEnum;

export interface GroupSubject {
    id: string;
    name: string;
    courseCode?: string;
}

export interface GroupStudent {
    id: string;
    fullName: string;
    studentCode?: string;
    email?: string;
}

export interface Group {
    id: string;
    classId: string;
    title: string;
    description?: string;
    subjectIds: string[];
    studentIds: string[];
    subjects?: GroupSubject[];
    students?: GroupStudent[];
    studentsCount?: number;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateGroupRequest {
    classId: string;
    title: string;
    description?: string;
    subjectIds?: string[];
    studentIds?: string[];
}

export interface UpdateGroupRequest {
    title?: string;
    description?: string;
    subjectIds?: string[];
    studentIds?: string[];
}

export interface AssignGroupHomeworkRequest {
    subjectId: string;
    homeworkId: string;
    difficultyLevel: HomeworkDifficultyLevel;
    assignedStudentIds?: string[];
    dueDate?: string;
    note?: string;
}

export interface GroupHomeworkAssignment {
    id: string;
    groupId: string;
    classId: string;
    subjectId: string;
    homeworkId: string;
    difficultyLevel: HomeworkDifficultyLevel;
    assignedStudentIds: string[];
    dueDate?: string;
    note?: string;
    assignedBy?: string;
    createdAt?: string;
}

export interface FilterGroupParams {
    classId?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export interface GroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    classId: string;
    groupData?: Group | null;
    availableSubjects?: GroupSubject[];
}

export interface ClassCourseItem {
    courseId?:
        | {
              id?: string;
              _id?: string;
              name?: string;
              courseCode?: string;
          }
        | string;
    courseName?: string;
    courseCode?: string;
    id?: string;
}

export interface ClassStudentItem {
    student?: {
        id?: string;
        _id?: string;
        fullName?: string;
        studentCode?: string;
        email?: string;
    };
    id?: string;
    _id?: string;
    fullName?: string;
    studentCode?: string;
    email?: string;
}

export interface AssignGroupHomeworkModalProps {
    isOpen: boolean;
    onClose: () => void;
    group: Group | null;
    availableSubjects?: GroupSubject[];
}

export interface ClassGroupsTabProps {
    classId: string;
    initialGroups?: Group[];
    availableSubjects?: GroupSubject[];
}
