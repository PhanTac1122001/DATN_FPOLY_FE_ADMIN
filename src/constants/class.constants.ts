import { ClassTypeEnum } from "@/types/class.types";
import { FilterFieldType } from "@/types/filter.types";
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
