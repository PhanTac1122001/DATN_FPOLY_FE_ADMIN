export const START_HOUR = 1;
export const MINUTES_60 = 60;
export const STEP_MINUTES = 30;
export const NOON_HOUR = 12;
export const PAD_LENGTH_2 = 2;
export const DATE_PAD_LENGTH = 2;
export const EXPECTED_PARTS_LENGTH_DATE = 3;

// Generate time slots from 1:00 AM to 11:30 PM, then add 12:00 AM (00:00) at the end.
export const TIME_SLOTS = Array.from({ length: 47 }, (_, i) => {
    if (i === 46) {
        const midnightLabel = "12:00 AM";
        return {
            id: "0:00",
            hour: 0,
            minute: 0,
            label: midnightLabel,
        };
    }
    const totalMinutes = START_HOUR * MINUTES_60 + i * STEP_MINUTES;
    const hour = Math.floor(totalMinutes / MINUTES_60);
    const minute = totalMinutes % MINUTES_60;
    const period = hour >= NOON_HOUR ? "PM" : "AM";
    const h12 = hour % NOON_HOUR || NOON_HOUR;
    const label = `${String(h12).padStart(PAD_LENGTH_2, "0")}:${String(minute).padStart(PAD_LENGTH_2, "0")} ${period}`;
    return { id: `${hour}:${String(minute).padStart(PAD_LENGTH_2, "0")}`, hour, minute, label };
});
