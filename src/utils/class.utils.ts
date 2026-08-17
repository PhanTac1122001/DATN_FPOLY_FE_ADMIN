import {
    MINUTES_IN_HOUR,
    SHIFT_1_END_MINUTES,
    SHIFT_2_END_MINUTES,
    SHIFT_3_END_MINUTES,
    SHIFT_4_END_MINUTES,
    SHIFT_5_END_MINUTES,
    SHIFT_NUMBERS,
} from "@/constants/class.constants";
import { CLASS_TYPE_LABELS } from "@/constants/class.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import type { CourseClassEmbed, StudentClassEmbed } from "@/types/class.types";

export const extractCourseMongoId = (c: CourseClassEmbed | Record<string, unknown>): string => {
    if (!c) return "";
    const obj = c as Record<string, unknown>;
    if (typeof obj.courseId === "string") return obj.courseId;
    if (obj.courseId && typeof obj.courseId === "object") {
        const nested = obj.courseId as Record<string, unknown>;
        return String(nested._id || nested.id || "");
    }
    return String(obj._id || obj.id || "");
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

export function getCurrentShiftNumber(now: Date = new Date()): number {
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentMinutes = hours * MINUTES_IN_HOUR + minutes;

    if (currentMinutes < SHIFT_1_END_MINUTES) return SHIFT_NUMBERS.ONE; // Ca 1: 07:00 - 09:00 (up to 09:05)
    if (currentMinutes < SHIFT_2_END_MINUTES) return SHIFT_NUMBERS.TWO; // Ca 2: 09:10 - 11:10 (up to 11:40)
    if (currentMinutes < SHIFT_3_END_MINUTES) return SHIFT_NUMBERS.THREE; // Ca 3: 12:10 - 14:10 (up to 14:15)
    if (currentMinutes < SHIFT_4_END_MINUTES) return SHIFT_NUMBERS.FOUR; // Ca 4: 14:20 - 16:20 (up to 16:25)
    if (currentMinutes < SHIFT_5_END_MINUTES) return SHIFT_NUMBERS.FIVE; // Ca 5: 16:30 - 18:30 (up to 18:35)
    return SHIFT_NUMBERS.SIX; // Ca 6: 18:40 - 20:40
}

export const formatPercent = (val: unknown): string => {
    if (val === undefined || val === null || val === "") return "0%";
    const num = Number(val);
    if (isNaN(num)) return "0%";
    const wholeNumberMod = 1;
    const decimalPlaces = 2;
    return num % wholeNumberMod === 0 ? `${num}%` : `${num.toFixed(decimalPlaces)}%`;
};

export const getRateColorClass = (rateVal: unknown): string => {
    const num = Number(rateVal || 0);
    const highThreshold = 10;
    const warnThreshold = 5;
    if (num > highThreshold) return "text-rose-600 font-extrabold";
    if (num >= warnThreshold) return "text-amber-600 font-extrabold";
    return "text-emerald-600 font-bold";
};

const padLength = 2;

export function formatDateTime(dateStr?: string): string {
    if (!dateStr) return "---";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "---";
    const pad = (n: number) => String(n).padStart(padLength, "0");
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    const day = pad(d.getDate());
    const month = pad(d.getMonth() + 1);
    const year = d.getFullYear();
    return `${hh}:${mm}:${ss} ${day}/${month}/${year}`;
}

export function formatSubmittedAt(dateStr?: string): string {
    if (!dateStr) return "---";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "---";
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
