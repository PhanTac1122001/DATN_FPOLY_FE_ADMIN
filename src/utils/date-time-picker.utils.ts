import { CalendarDate, CalendarDateTime } from "@internationalized/date";
import type { DateValue } from "react-aria-components";
import { DATE_PAD_LENGTH, EXPECTED_PARTS_LENGTH_DATE } from "@/constants/date-picker.constants";

export function parseToDateTime(dateStr?: string, timeStr?: string): DateValue | null {
    if (!dateStr) return null;
    try {
        const parts = dateStr.split("/");
        if (parts.length === EXPECTED_PARTS_LENGTH_DATE) {
            const [dayStr, monthStr, yearStr] = parts;
            const date = new CalendarDate(Number(yearStr), Number(monthStr), Number(dayStr));
            let hour = 9;
            let minute = 0;
            if (timeStr) {
                const [hourStr, minuteStr] = timeStr.split(":");
                if (hourStr !== undefined && minuteStr !== undefined) {
                    hour = Number(hourStr);
                    minute = Number(minuteStr);
                }
            }
            return new CalendarDateTime(date.calendar, date.year, date.month, date.day, hour, minute);
        }
    } catch {
        // ignore
    }
    return null;
}

export function formatToDateStr(dateValue: DateValue): string {
    const day = String(dateValue.day).padStart(DATE_PAD_LENGTH, "0");
    const month = String(dateValue.month).padStart(DATE_PAD_LENGTH, "0");
    const year = dateValue.year;
    return `${day}/${month}/${year}`;
}

export function formatToTimeStr(dateValue: DateValue): string {
    if ("hour" in dateValue && "minute" in dateValue) {
        const hour = String(dateValue.hour).padStart(DATE_PAD_LENGTH, "0");
        const minute = String(dateValue.minute).padStart(DATE_PAD_LENGTH, "0");
        return `${hour}:${minute}`;
    }
    return "09:00";
}
