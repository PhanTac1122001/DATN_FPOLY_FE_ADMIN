import { getLocalTimeZone, today } from "@internationalized/date";
import type { CalendarDate } from "@internationalized/date";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { TIME_DIGIT_PADDING } from "@/constants/date-time.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";

/** Today in local timezone (for date pickers). */
export const getTodayDateValue = (): CalendarDate => today(getLocalTimeZone());

/** Default highlighted dates for date picker (today only). */
export const getDefaultHighlightedDates = (): CalendarDate[] => [getTodayDateValue()];

// Helper function to format relative time in Vietnamese
export const formatRelativeTime = (date: Date): string => {
    const distance = formatDistanceToNow(date, { locale: vi, addSuffix: true });
    return distance.replace(`${UI_TEXT.common.time.about} `, "").replace(`${UI_TEXT.common.time.few} `, "");
};

/** Convert "HH:mm" local time to "HH:mm" UTC string */
export function localToUtcString(localTime: string) {
    if (!localTime || localTime.trim() === "") return localTime;
    const [h, m] = localTime.split(":").map(Number);
    const d = new Date();
    d.setHours(h ?? 0, m ?? 0, 0, 0);
    return `${String(d.getUTCHours()).padStart(TIME_DIGIT_PADDING, "0")}:${String(d.getUTCMinutes()).padStart(TIME_DIGIT_PADDING, "0")}`;
}

/** Convert "HH:mm" UTC time to "HH:mm" local string */
export function utcToLocalString(utcTime: string) {
    if (!utcTime || utcTime.trim() === "") return utcTime;
    const [h, m] = utcTime.split(":").map(Number);
    const d = new Date();
    d.setUTCHours(h ?? 0, m ?? 0, 0, 0);
    return `${String(d.getHours()).padStart(TIME_DIGIT_PADDING, "0")}:${String(d.getMinutes()).padStart(TIME_DIGIT_PADDING, "0")}`;
}

/** Get current timestamp in milliseconds */
export const getCurrentTimeMs = (): number => Date.now();

const SECONDS_IN_MINUTE = 60;
const PAD_LENGTH = 2;

/** Format countdown seconds as "MM:SS" */
export function formatOtpCountdown(seconds: number): string {
    const mins = Math.floor(seconds / SECONDS_IN_MINUTE);
    const secs = seconds % SECONDS_IN_MINUTE;
    return `${String(mins).padStart(PAD_LENGTH, "0")}:${String(secs).padStart(PAD_LENGTH, "0")}`;
}
