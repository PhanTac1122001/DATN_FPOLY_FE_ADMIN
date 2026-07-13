/** Seconds in one minute */
export const SECONDS_IN_MINUTE = 60;
/** Milliseconds in one second */
export const MS_IN_SECOND = 1000;
/** Cache duration in minutes */
export const CACHE_MINUTES = 5;
/** Stale time for profile query (5 minutes in ms) */
export const STALE_TIME_FIVE_MINUTES = CACHE_MINUTES * SECONDS_IN_MINUTE * MS_IN_SECOND;
/** Alias for profile cache (5 minutes in ms) */
export const PROFILE_CACHE_TIME = STALE_TIME_FIVE_MINUTES;
