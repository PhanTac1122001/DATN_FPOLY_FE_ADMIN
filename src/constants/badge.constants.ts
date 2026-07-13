import type { BadgeColors } from "@/components/base/badges/badge-types";
import { BADGE_TYPES } from "@/constants/base-components.constants";
import type { BadgeGroupColor, BadgeGroupTheme } from "@/types/base-components.types";
import { sortCx } from "@/utils/cx";

export const BADGE_GROUP_BASE_CLASSES: Record<BadgeGroupTheme, { root?: string; addon?: string; icon?: string }> = {
    light: {
        root: "rounded-full ring-1 ring-inset",
        addon: "rounded-full ring-1 ring-inset",
    },
    modern: {
        root: "rounded-[10px] bg-primary text-secondary shadow-xs ring-1 ring-inset ring-primary hover:bg-secondary",
        addon: "flex items-center rounded-md bg-primary shadow-xs ring-1 ring-inset ring-primary",
        icon: "text-utility-gray-500",
    },
};

export const BADGE_GROUP_COLOR_CLASSES = sortCx<
    Record<BadgeGroupTheme, Record<BadgeGroupColor, { root?: string; addon?: string; icon?: string; dot?: string }>>
>({
    light: {
        brand: {
            root: "bg-utility-brand-50 text-utility-brand-700 ring-utility-brand-200 hover:bg-utility-brand-100",
            addon: "bg-primary text-current ring-utility-brand-200",
            icon: "text-utility-brand-500",
        },
        gray: {
            root: "bg-utility-gray-50 text-utility-gray-700 ring-utility-gray-200 hover:bg-utility-gray-100",
            addon: "bg-primary text-current ring-utility-gray-200",
            icon: "text-utility-gray-500",
        },
        error: {
            root: "bg-utility-error-50 text-utility-error-700 ring-utility-error-200 hover:bg-utility-error-100",
            addon: "bg-primary text-current ring-utility-error-200",
            icon: "text-utility-error-500",
        },
        warning: {
            root: "bg-utility-warning-50 text-utility-warning-700 ring-utility-warning-200 hover:bg-utility-warning-100",
            addon: "bg-primary text-current ring-utility-warning-200",
            icon: "text-utility-warning-500",
        },
        success: {
            root: "bg-utility-success-50 text-utility-success-700 ring-utility-success-200 hover:bg-utility-success-100",
            addon: "bg-primary text-current ring-utility-success-200",
            icon: "text-utility-success-500",
        },
    },
    modern: {
        brand: { dot: "bg-utility-brand-500 outline-3 -outline-offset-1 outline-utility-brand-100" },
        gray: { dot: "bg-utility-gray-500 outline-3 -outline-offset-1 outline-utility-gray-100" },
        error: { dot: "bg-utility-error-500 outline-3 -outline-offset-1 outline-utility-error-100" },
        warning: { dot: "bg-utility-warning-500 outline-3 -outline-offset-1 outline-utility-warning-100" },
        success: { dot: "bg-utility-success-500 outline-3 -outline-offset-1 outline-utility-success-100" },
    },
});

export const BADGE_FILLED_COLORS: Record<BadgeColors, { root: string; addon: string; addonButton: string }> = {
    gray: { root: "bg-gray-50 text-gray-700 ring-gray-200", addon: "text-gray-500", addonButton: "hover:bg-gray-100 text-gray-400 hover:text-gray-500" },
    brand: {
        root: "bg-brand-50 text-brand-700 ring-brand-200",
        addon: "text-brand-500",
        addonButton: "hover:bg-brand-100 text-brand-400 hover:text-brand-500",
    },
    error: {
        root: "bg-error-50 text-error-600 ring-error-200",
        addon: "text-error-500",
        addonButton: "hover:bg-error-100 text-error-400 hover:text-error-500",
    },
    warning: {
        root: "bg-warning-50 text-warning-600 ring-warning-200",
        addon: "text-warning-500",
        addonButton: "hover:bg-warning-100 text-warning-400 hover:text-warning-500",
    },
    success: {
        root: "bg-success-50 text-success-700 ring-success-200",
        addon: "text-success-500",
        addonButton: "hover:bg-success-100 text-success-400 hover:text-success-500",
    },
    "gray-blue": {
        root: "bg-gray-blue-50 text-gray-blue-700 ring-gray-blue-200",
        addon: "text-gray-blue-500",
        addonButton: "hover:bg-gray-blue-100 text-gray-blue-400 hover:text-gray-blue-500",
    },
    "blue-light": {
        root: "bg-blue-light-50 text-blue-light-700 ring-blue-light-200",
        addon: "text-blue-light-500",
        addonButton: "hover:bg-blue-light-100 text-blue-light-400 hover:text-blue-light-500",
    },
    blue: { root: "bg-blue-25 text-blue-400 ring-blue-200", addon: "text-blue-500", addonButton: "hover:bg-blue-100 text-blue-400 hover:text-blue-500" },
    indigo: {
        root: "bg-indigo-50 text-indigo-700 ring-indigo-200",
        addon: "text-indigo-500",
        addonButton: "hover:bg-indigo-100 text-indigo-400 hover:text-indigo-500",
    },
    purple: {
        root: "bg-purple-50 text-purple-700 ring-purple-200",
        addon: "text-purple-500",
        addonButton: "hover:bg-purple-100 text-purple-400 hover:text-purple-500",
    },
    pink: { root: "bg-pink-50 text-pink-700 ring-pink-200", addon: "text-pink-500", addonButton: "hover:bg-pink-100 text-pink-400 hover:text-pink-500" },
    orange: {
        root: "bg-orange-50 text-orange-700 ring-orange-200",
        addon: "text-orange-500",
        addonButton: "hover:bg-orange-100 text-orange-400 hover:text-orange-500",
    },
};

export const BADGE_ADDON_ONLY_COLORS = Object.fromEntries(Object.entries(BADGE_FILLED_COLORS).map(([k, v]) => [k, { root: "", addon: v.addon }])) as Record<
    BadgeColors,
    { root: string; addon: string }
>;

export const BADGE_WITH_PILL_TYPES = {
    [BADGE_TYPES.pillColor]: { common: "size-max flex items-center whitespace-nowrap rounded-full", styles: BADGE_FILLED_COLORS },
    [BADGE_TYPES.badgeColor]: { common: "size-max flex items-center whitespace-nowrap rounded-md", styles: BADGE_FILLED_COLORS },
    [BADGE_TYPES.badgeModern]: {
        common: "size-max flex items-center whitespace-nowrap rounded-md shadow-xs",
        styles: {
            ...BADGE_FILLED_COLORS,
            gray: {
                root: "bg-primary text-secondary ring-primary",
                addon: "text-gray-500",
                addonButton: "hover:bg-gray-100 text-gray-400 hover:text-gray-500",
            },
        },
    },
};

export const BADGE_WITH_BADGE_TYPES = {
    [BADGE_TYPES.pillColor]: { common: "size-max flex items-center whitespace-nowrap rounded-full", styles: BADGE_FILLED_COLORS },
    [BADGE_TYPES.badgeColor]: { common: "size-max flex items-center whitespace-nowrap rounded-md", styles: BADGE_FILLED_COLORS },
    [BADGE_TYPES.badgeModern]: {
        common: "size-max flex items-center whitespace-nowrap rounded-md bg-primary text-secondary ring-primary shadow-xs",
        styles: BADGE_ADDON_ONLY_COLORS,
    },
};
