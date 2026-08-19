import { StudentStatusEnum } from "@/types/student.types";
import { UI_TEXT } from "./ui-text.constants";

export enum StudentLocationEnum {
    HN = "HN",
    HCM = "HCM",
}

export const STUDENT_LOCATION_OPTIONS = [
    { id: StudentLocationEnum.HN, label: UI_TEXT.classes.locationHanoi },
    { id: StudentLocationEnum.HCM, label: UI_TEXT.classes.locationHcm },
];

export const STUDENT_STATUS_OPTIONS = [
    { id: StudentStatusEnum.DANG_HOC, label: UI_TEXT.classes.statusStudying },
    { id: StudentStatusEnum.BAO_LUU, label: UI_TEXT.classes.statusReserved },
    { id: StudentStatusEnum.CHO_BAO_LUU, label: UI_TEXT.classes.statusPendingReserve },
    { id: StudentStatusEnum.BO_HOC, label: UI_TEXT.classes.statusDropOut },
    { id: StudentStatusEnum.TOT_NGHIEP, label: UI_TEXT.classes.statusGraduated },
    { id: StudentStatusEnum.TOT_NGHIEP_SOM, label: UI_TEXT.classes.statusGraduatedEarly },
    { id: StudentStatusEnum.DINH_CHI, label: UI_TEXT.classes.statusSuspended },
];

export enum LearningPathSourceEnum {
    SYSTEM_SEED = "SYSTEM_SEED",
    MANUAL_ASSIGN = "MANUAL_ASSIGN",
}

export const MIN_PASSWORD_LENGTH = 6;
export const MAX_PASSWORD_LENGTH = 30;
