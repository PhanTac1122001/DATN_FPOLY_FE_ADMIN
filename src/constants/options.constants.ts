import { UI_TEXT } from "./ui-text.constants";

export const DEFAULT_OPTIONS_LIMIT = 20;
export const OPTIONS_STALE_TIME = 60_000;
export const ALL_CATEGORY_OPTION = "ALL";
export const DEFAULT_PAGE_SIZE = 10;
export const BONUS_PRESETS = [5, 10, 15, 20];
export const DEFAULT_BONUS_POINTS = 5;
export const PENALTY_PRESETS = [5, 10, 15, 20];
export const DEFAULT_PENALTY_POINTS = 5;
export const DEFAULT_PASS_SCORE = 5.0;
export const DEFAULT_QUIZ_DURATION_MINUTES = 15;
export const FULL_PERCENT = 100;
export const FULL_WEIGHT_PERCENT = FULL_PERCENT;
export const ROUND_FACTOR = 10;
export const YOUTUBE_MATCH_INDEX = 2;
export const YOUTUBE_ID_LENGTH = 11;
export const PAD_TWO_DIGITS = 2;
export const TWO_DIGITS = 2;
export const SECONDS_PER_MINUTE = 60;
export const MILLISECONDS_PER_SECOND = 1000;

export const MATERIAL_STATUS = {
    PENDING: 0,
    APPROVED: 1,
    REJECTED: 2,
} as const;

export const DEFAULT_GRADING_WEIGHTS = {
    ATTENDANCE: 10,
    QUIZ: 10,
    HACKATHON: 20,
    EXAM: 60,
    HACKATHON_QUIZ: 30,
    HACKATHON_ESSAY: 70,
    PROJECT_PRODUCT: 70,
    PROJECT_KNOWLEDGE: 10,
    PROJECT_INTERVIEW: 20,
    ESSAY_ESSAY: 70,
    ESSAY_QUIZ: 30,
    ESSAY_ORAL: 0,
} as const;

export const SHIFT_OPTIONS_LIST = [
    {
        id: "1",
        get label() {
            return UI_TEXT.classes.shift1;
        },
    },
    {
        id: "2",
        get label() {
            return UI_TEXT.classes.shift2;
        },
    },
    {
        id: "3",
        get label() {
            return UI_TEXT.classes.shift3;
        },
    },
    {
        id: "4",
        get label() {
            return UI_TEXT.classes.shift4;
        },
    },
    {
        id: "5",
        get label() {
            return UI_TEXT.classes.shift5;
        },
    },
    {
        id: "6",
        get label() {
            return UI_TEXT.classes.shift6;
        },
    },
];
