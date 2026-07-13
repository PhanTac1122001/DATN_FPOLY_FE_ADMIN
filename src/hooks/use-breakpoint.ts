"use client";

import { useSyncExternalStore } from "react";

const screens = {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
};

/**
 * Checks whether a particular Tailwind CSS viewport size applies.
 *
 * @param size The size to check, which must either be included in Tailwind CSS's
 * list of default screen sizes, or added to the Tailwind CSS config file.
 *
 * @returns A boolean indicating whether the viewport size applies.
 */
export const useBreakpoint = (size: "sm" | "md" | "lg" | "xl" | "2xl") => {
    const query = `(min-width: ${screens[size]})`;

    const subscribe = (callback: () => void) => {
        const mql = window.matchMedia(query);
        mql.addEventListener("change", callback);
        return () => mql.removeEventListener("change", callback);
    };

    const getSnapshot = () => {
        if (typeof window === "undefined") return true;
        return window.matchMedia(query).matches;
    };

    const getServerSnapshot = () => true;

    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
