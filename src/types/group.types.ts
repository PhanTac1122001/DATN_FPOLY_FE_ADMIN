export enum HomeworkDifficultyEnum {
    EASY = "EASY",
    MEDIUM = "MEDIUM",
    FAIR = "FAIR",
    GOOD = "GOOD",
    EXCELLENT = "EXCELLENT",
}

export type HomeworkDifficultyLevel = keyof typeof HomeworkDifficultyEnum;

export const HOMEWORK_DIFFICULTY_RANK: Record<HomeworkDifficultyLevel, number> = {
    [HomeworkDifficultyEnum.EASY]: 1,
    [HomeworkDifficultyEnum.MEDIUM]: 2,
    [HomeworkDifficultyEnum.FAIR]: 3,
    [HomeworkDifficultyEnum.GOOD]: 4,
    [HomeworkDifficultyEnum.EXCELLENT]: 5,
};

export const HOMEWORK_DIFFICULTY_ORDER: HomeworkDifficultyLevel[] = [
    HomeworkDifficultyEnum.EASY,
    HomeworkDifficultyEnum.MEDIUM,
    HomeworkDifficultyEnum.FAIR,
    HomeworkDifficultyEnum.GOOD,
    HomeworkDifficultyEnum.EXCELLENT,
];

export const getDifficultyRank = (level?: string | HomeworkDifficultyLevel): number => {
    if (!level) return HOMEWORK_DIFFICULTY_RANK[HomeworkDifficultyEnum.MEDIUM];
    const key = level.toUpperCase() as HomeworkDifficultyLevel;
    return HOMEWORK_DIFFICULTY_RANK[key] ?? HOMEWORK_DIFFICULTY_RANK[HomeworkDifficultyEnum.MEDIUM];
};

export const isHigherDifficulty = (a?: string | HomeworkDifficultyLevel, b?: string | HomeworkDifficultyLevel): boolean => {
    return getDifficultyRank(a) > getDifficultyRank(b);
};

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
    avatarUrl?: string;
    dateOfBirth?: string;
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

export interface HomeworkAssignmentItem {
    homeworkId: string;
    difficultyLevel: HomeworkDifficultyLevel;
}

export interface AssignGroupHomeworkRequest {
    subjectId: string;
    homeworks?: HomeworkAssignmentItem[];
    homeworkId?: string;
    difficultyLevel?: HomeworkDifficultyLevel;
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

export interface SelectGroupStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    students: GroupStudent[];
    initialSelectedIds: string[];
    onConfirm: (selectedIds: string[]) => void;
}
