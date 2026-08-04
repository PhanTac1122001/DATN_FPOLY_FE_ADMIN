import { CLASS_TYPE_LABELS } from "@/constants/class.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import type { CourseClassEmbed, StudentClassEmbed } from "@/types/class.types";

export const extractCourseMongoId = (c: CourseClassEmbed): string => {
    if (!c) return "";
    if (typeof c.courseId === "string") return c.courseId;
    if (c.courseId && typeof c.courseId === "object") {
        const obj = c.courseId as unknown as Record<string, unknown>;
        return String(obj._id || obj.id || "");
    }
    return "";
};

export const isValidMongoId = (id?: string): boolean => !!id && /^[0-9a-fA-F]{24}$/.test(id);

export const extractStudentMongoId = (s: StudentClassEmbed): string => {
    if (!s) return "";
    const studentObj = s.student as unknown as Record<string, unknown>;
    if (studentObj && typeof studentObj === "object") {
        return String(studentObj._id || studentObj.id || s.enrollmentId || "");
    }
    if (typeof s.student === "string") return s.student;
    return s.enrollmentId || "";
};

export const getSessionId = (sess: unknown): string => {
    if (!sess) return "";
    const sessObj = sess as Record<string, unknown>;
    return String(sessObj.id || sessObj._id || "");
};

export function getClassTypeLabel(type?: string): string {
    if (!type) return UI_TEXT.classes.classTypeRegular;
    return CLASS_TYPE_LABELS[type.toUpperCase()] || type;
}

export function getShiftLabel(period?: number): string {
    if (!period) return "";
    const shiftLabels: Record<number, string> = {
        1: UI_TEXT.classes.shift1,
        2: UI_TEXT.classes.shift2,
        3: UI_TEXT.classes.shift3,
        4: UI_TEXT.classes.shift4,
        5: UI_TEXT.classes.shift5,
        6: UI_TEXT.classes.shift6,
    };
    return shiftLabels[period] || `Ca ${period}`;
}
