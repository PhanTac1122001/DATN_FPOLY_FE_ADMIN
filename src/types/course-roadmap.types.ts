import type { CourseCategory } from "@/types/course-category.types";

/** A category target for a move action: a category id, or null to remove from any group. */
export type CategoryTarget = string | null;

/** Direction a course can be nudged within its column. */
export type ReorderDirection = "up" | "down";

/** A single board column derived from the per-system roadmap: a category with its ordered courses, or the uncategorized bucket. */
export interface RoadmapColumnData {
    id: string;
    name: string;
    color: string | null;
    categoryId: string | null;
    isUncategorized: boolean;
    courses: SystemRoadmapCourse[];
}

export interface RoadmapColumnProps {
    column: RoadmapColumnData;
    activeCategories: CourseCategory[];
    selectedIds: Set<string>;
    onToggleSelect: (courseId: string) => void;
    onMove: (courseId: string, categoryId: CategoryTarget) => void;
    onReorder: (columnId: string, courseId: string, direction: ReorderDirection) => void;
    onEditCategory: (categoryId: string) => void;
    onHideCategory: (categoryId: string) => void;
}

export interface CourseCardProps {
    course: SystemRoadmapCourse;
    activeCategories: CourseCategory[];
    isSelected: boolean;
    isFirst: boolean;
    isLast: boolean;
    onToggleSelect: (courseId: string) => void;
    onMove: (courseId: string, categoryId: CategoryTarget) => void;
    onMoveUp: (courseId: string) => void;
    onMoveDown: (courseId: string) => void;
}

export interface BulkAssignBarProps {
    selectedCount: number;
    activeCategories: CourseCategory[];
    isApplying: boolean;
    onApply: (categoryId: CategoryTarget) => void;
    onClear: () => void;
}

/** A course node inside the per-system roadmap preview (endpoint #4). */
export interface SystemRoadmapCourse {
    courseId: string;
    name: string;
    courseCode: string;
    courseCover?: string | null;
    hour: number;
    position: number;
    semesterName: string | null;
    semesterPriority: number;
    careerTags: { id: string; name: string }[];
}

/** A category column in the per-system roadmap preview (endpoint #4). */
export interface SystemRoadmapCategory {
    categoryId: string;
    name: string;
    color: string | null;
    icon: string | null;
    priority: number;
    totalCourses: number;
    courses: SystemRoadmapCourse[];
}

/** The full per-system roadmap preview payload (endpoint #4). */
export interface SystemRoadmap {
    systemId: string;
    totalCourses: number;
    categories: SystemRoadmapCategory[];
    uncategorized: { totalCourses: number; courses: SystemRoadmapCourse[] };
}

/** A course returned by the reverse career-tagging lookup (endpoint #2). */
export interface TagCourse {
    id: string;
    name: string;
    courseCode: string;
    categoryId: string | null;
}

/** A single new-position entry for the reorder mutation (endpoint #3). */
export interface ReorderCourseItem {
    courseId: string;
    position: number;
}

/** Props for the career assign panel (reverse career-tagging). */
export interface CareerAssignPanelProps {
    systemRoadmap: SystemRoadmap | undefined;
    careers: { id: string; name: string }[];
    activeCareerId: string | null;
    onChangeCareer: (id: string) => void;
}
