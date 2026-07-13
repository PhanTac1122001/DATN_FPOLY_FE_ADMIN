import { useCallback, useEffect, useRef } from "react";
import { SEARCH_DEBOUNCE_MS } from "@/constants/debounce.constants";

/**
 * Returns a debounced version of the given callback.
 * The callback is only invoked after `delay` ms of inactivity.
 * Automatically cleans up the timer on unmount.
 */
export function useDebouncedCallback<T extends (...args: Parameters<T>) => void>(
    callback: T,
    delay: number = SEARCH_DEBOUNCE_MS,
): (...args: Parameters<T>) => void {
    const callbackRef = useRef(callback);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Always keep the latest callback ref in sync without re-creating the debounced function
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    return useCallback(
        (...args: Parameters<T>) => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            timerRef.current = setTimeout(() => {
                callbackRef.current(...args);
            }, delay);
        },
        [delay],
    );
}
