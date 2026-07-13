/**
 * Date and time related constants
 */

// Timezone
export const VIETNAM_TIMEZONE_OFFSET = 7; // UTC+7
export const MILLISECONDS_PER_SECOND_VALUE = 1000;
export const SECONDS_PER_MINUTE_VALUE = 60;
export const MINUTES_PER_HOUR_VALUE = 60;
export const HOURS_TO_MILLISECONDS = MINUTES_PER_HOUR_VALUE * SECONDS_PER_MINUTE_VALUE * MILLISECONDS_PER_SECOND_VALUE;

// Time units
export const SECONDS_PER_MINUTE = 60;
export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_DAY = 24;
export const DAYS_PER_WEEK = 7;
export const MILLISECONDS_PER_SECOND = 1000;

// Time formatting
export const TIME_DIGIT_PADDING = 2; // Pad hours/minutes/seconds to 2 digits
export const YEAR_DIGIT_PADDING = 4; // Pad years to 4 digits
export const PARSE_RADIX_DECIMAL = 10; // Base 10 for parseInt
export const DATE_FORMAT_PARTS_LENGTH = 3; // dd/MM/yyyy has 3 parts

// Time period boundaries
export const END_OF_MINUTE_SECONDS = 59; // Maximum seconds in a minute
export const END_OF_SECOND_MILLISECONDS = 999; // Maximum milliseconds in a second

// Calendar
export const DAYS_IN_CALENDAR_GRID = 42; // 6 weeks × 7 days
export const WEEKS_IN_CALENDAR = 6;
export const DAYS_COLUMNS = 7;

// Date month calculation
export const MONTH_OFFSET = 1; // JavaScript months are 0-11, add 1 to get 1-12

// Time format regex components
export const TIME_HOUR_FORMAT_DIGITS_RANGE = "1,2"; // Hours can be 1-2 digits (HH or H)
export const TIME_MINUTE_FORMAT_DIGITS = 2; // Minutes must be exactly 2 digits (MM)

// Percentage
export const PERCENTAGE_BASE = 100;
