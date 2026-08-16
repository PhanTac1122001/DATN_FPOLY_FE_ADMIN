import type { CourseCategory } from "@/types/course-category.types";
import type { CourseItem } from "@/types/course.types";

/** A category target for a move action: a category id, or null to remove from any group. */
export type CategoryTarget = string | null;

/** A single derived board column: an active category with its courses, or the uncategorized bucket. */
export interface RoadmapColumnData {
    id: string;
    category: CourseCategory | null;
    isUncategorized: boolean;
    courses: CourseItem[];
}

export interface RoadmapColumnProps {
    column: RoadmapColumnData;
    activeCategories: CourseCategory[];
    selectedIds: Set<string>;
    onToggleSelect: (courseId: string) => void;
    onMove: (courseId: string, categoryId: CategoryTarget) => void;
    onEditTags: (course: CourseItem) => void;
    onEditCategory: (categoryId: string) => void;
    onHideCategory: (categoryId: string) => void;
}

export interface CourseCardProps {
    course: CourseItem;
    activeCategories: CourseCategory[];
    isSelected: boolean;
    onToggleSelect: (courseId: string) => void;
    onMove: (courseId: string, categoryId: CategoryTarget) => void;
    onEditTags: (course: CourseItem) => void;
}

export interface BulkAssignBarProps {
    selectedCount: number;
    activeCategories: CourseCategory[];
    isApplying: boolean;
    onApply: (categoryId: CategoryTarget) => void;
    onClear: () => void;
}

export interface CourseTagsPopoverProps {
    course: CourseItem | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}
