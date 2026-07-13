import { useEffect, useState } from "react";
import { DEFAULT_DEBOUNCE_DELAY } from "@/constants/debounce.constants";

export function useDebounce<T>(value: T, delay?: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay ?? DEFAULT_DEBOUNCE_DELAY);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}
