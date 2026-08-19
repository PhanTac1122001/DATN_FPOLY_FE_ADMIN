import { UI_TEXT } from "@/constants/ui-text.constants";
import { FilterFieldType } from "@/types/filter.types";
import { RoleEnum, StatusEnum } from "@/types/staff.types";

export const STAFF_FILTER_FIELDS = [
    {
        key: "role",
        label: UI_TEXT.staff.thRole,
        type: FilterFieldType.ENUM,
        options: [
            { id: RoleEnum.ADMIN, label: UI_TEXT.staff.roleAdmin },
            { id: RoleEnum.MANAGER, label: UI_TEXT.staff.roleManager },
            { id: RoleEnum.TEACHER, label: UI_TEXT.staff.roleTeacher },
            { id: RoleEnum.TEACHER_ASSISTANT, label: UI_TEXT.staff.roleTeacherAssistant },
            { id: RoleEnum.ASSISTANT, label: UI_TEXT.staff.roleAssistant },
        ],
    },
    {
        key: "status",
        label: UI_TEXT.staff.thStatus,
        type: FilterFieldType.ENUM,
        options: [
            { id: StatusEnum.ACTIVE, label: UI_TEXT.staff.statusActive },
            { id: StatusEnum.DISABLE, label: UI_TEXT.staff.statusDisable },
        ],
    },
];

export const MIN_PASSWORD_LENGTH = 6;
export const MAX_PASSWORD_LENGTH = 30;
