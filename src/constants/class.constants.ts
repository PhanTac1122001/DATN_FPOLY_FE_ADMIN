import { ClassTypeEnum } from "@/types/class.types";
import { FilterFieldType } from "@/types/filter.types";
import { HomeworkStatusEnum } from "@/types/homework.types";
import { UI_TEXT } from "./ui-text.constants";

export const CLASS_TYPE_LABELS: Record<string, string> = {
    FULLTIME: UI_TEXT.classes.classTypeFulltime,
    REGULAR: UI_TEXT.classes.classTypeRegular,
    PARTTIME: UI_TEXT.classes.classTypeParttime,
    ONLINE: UI_TEXT.classes.classTypeOnline,
};

export const CLASS_FILTER_FIELDS = [
    {
        key: "type",
        label: UI_TEXT.classes.labelClassTypeFilter,
        type: FilterFieldType.ENUM,
        options: [
            { id: ClassTypeEnum.FULLTIME, label: UI_TEXT.classes.classTypeFulltime },
            { id: ClassTypeEnum.PARTTIME, label: UI_TEXT.classes.classTypeParttime },
            { id: ClassTypeEnum.ONLINE, label: UI_TEXT.classes.classTypeOnline },
        ],
    },
];

export const UNGRADED_FILTER_KEY = "UNGRADED";

export const HOMEWORK_REVIEW_FILTER_FIELDS = [
    {
        key: "status",
        label: UI_TEXT.homeworkReview.thStatus,
        type: FilterFieldType.ENUM,
        options: [
            { id: HomeworkStatusEnum.COMPLETED, label: UI_TEXT.classHomeworkReview.filterCompleted },
            { id: HomeworkStatusEnum.NOT_COMPLETED, label: UI_TEXT.classHomeworkReview.filterNotCompleted },
            { id: UNGRADED_FILTER_KEY, label: UI_TEXT.homeworkReview.tableHeaderUngraded },
        ],
    },
];

export enum AttendanceStatusEnum {
    PRESENT = "PRESENT",
    LATE = "LATE",
    ABSENT_EXCUSED = "ABSENT_EXCUSED",
    ABSENT_UNEXCUSED = "ABSENT_UNEXCUSED",
}

export enum SessionModeEnum {
    OFFLINE = "OFFLINE",
    ONLINE = "ONLINE",
}

export enum SessionKindEnum {
    THEORY = "LY_THUYET",
    PRACTICE = "THUC_HANH",
}

export const COMMON_VIOLATIONS = [
    UI_TEXT.classes.violationNoPrep,
    UI_TEXT.classes.violationDisorder,
    UI_TEXT.classes.violationLateHw,
    UI_TEXT.classes.violationLateSchool,
    UI_TEXT.classes.violationDeviceUse,
];

export const MINUTES_IN_HOUR = 60;
export const SHIFT_1_END_MINUTES = 545;
export const SHIFT_2_END_MINUTES = 700;
export const SHIFT_3_END_MINUTES = 855;
export const SHIFT_4_END_MINUTES = 985;
export const SHIFT_5_END_MINUTES = 1115;
export const SHIFT_NUMBERS = {
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
    SIX: 6,
};
