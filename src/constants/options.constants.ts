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
