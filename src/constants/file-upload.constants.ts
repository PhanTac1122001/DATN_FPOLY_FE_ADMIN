/**
 * Constants for file upload validation
 */

export const FILE_SIZE_CONSTANTS = {
    MAX_FILE_SIZE_MB: 10,
    BYTES_PER_KB: 1024,
    KB_PER_MB: 1024,
} as const;

export const MAX_FILE_SIZE_BYTES = FILE_SIZE_CONSTANTS.MAX_FILE_SIZE_MB * FILE_SIZE_CONSTANTS.BYTES_PER_KB * FILE_SIZE_CONSTANTS.KB_PER_MB;

export const FILE_SIZE_DISPLAY_CONSTANTS = {
    BYTES_PER_KB: 1024,
    DECIMAL_PLACES: 2,
} as const;
