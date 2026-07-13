// Time conversion constants
export const MS_PER_SECOND = 1000;
export const SECONDS_PER_MINUTE = 60;
export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_DAY = 24;
export const DAYS_PER_WEEK = 7;

// Derived constants
export const SECONDS_PER_HOUR = SECONDS_PER_MINUTE * MINUTES_PER_HOUR;
export const MS_PER_MINUTE = MS_PER_SECOND * SECONDS_PER_MINUTE;
export const MS_PER_HOUR = MS_PER_MINUTE * MINUTES_PER_HOUR;
export const MS_PER_DAY = MS_PER_HOUR * HOURS_PER_DAY;
export const MS_PER_WEEK = MS_PER_DAY * DAYS_PER_WEEK;

// Common time intervals
const MINUTES_FIVE = 5;
export const FIVE_MINUTES_MS = MINUTES_FIVE * MS_PER_MINUTE;
export const ONE_WEEK_MS = DAYS_PER_WEEK * HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MS_PER_SECOND;

/** Offset (days) from week start (Monday) to week end (Sunday) for 7-day week. */
export const DAYS_PER_WEEK_LAST_DAY_OFFSET = DAYS_PER_WEEK - 1;

// String padding constants
export const TIME_STRING_PADDING = 2;
