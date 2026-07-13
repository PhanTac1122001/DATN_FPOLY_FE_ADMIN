/** Default initial page for tables */
export const DEFAULT_INITIAL_PAGE = 1;
/** Default initial limit (page size) for tables */
export const DEFAULT_INITIAL_LIMIT = 10;
/** Page size option values for selectors */
export const PAGE_SIZE_OPTION_SMALL = 10;
export const PAGE_SIZE_OPTION_MEDIUM = 20;
export const PAGE_SIZE_OPTION_LARGE = 50;
export const PAGE_SIZE_OPTION_EXTRA_LARGE = 100;
/** Page size options for selectors */
export const PAGE_SIZE_OPTIONS = [PAGE_SIZE_OPTION_SMALL, PAGE_SIZE_OPTION_MEDIUM, PAGE_SIZE_OPTION_LARGE] as const;
export const PAGE_SIZE_OPTIONS_EXTENDED = [PAGE_SIZE_OPTION_SMALL, PAGE_SIZE_OPTION_MEDIUM, PAGE_SIZE_OPTION_LARGE, PAGE_SIZE_OPTION_EXTRA_LARGE] as const;
/** Default search debounce in ms for table search */
export const DEFAULT_SEARCH_DEBOUNCE_MS = 300;
