import { useEffect } from "react";
import type { UseResizeObserverOptions } from "@/types/resize-observer.types";

/**
 * Checks if the ResizeObserver API is supported.
 * @returns True if the ResizeObserver API is supported, false otherwise.
 */
function hasResizeObserver() {
    return typeof window.ResizeObserver !== "undefined";
}

/**
 * A hook that observes the size of an element and calls a callback function when the size changes.
 * @param options - The options for the hook.
 */
export function useResizeObserver<T extends Element>(options: UseResizeObserverOptions<T>) {
    const { ref, box, onResize } = options;

    useEffect(() => {
        const element = ref?.current;
        if (!element) {
            return;
        }

        if (!hasResizeObserver()) {
            window.addEventListener("resize", onResize, false);

            return () => {
                window.removeEventListener("resize", onResize, false);
            };
        } else {
            const resizeObserverInstance = new window.ResizeObserver((entries) => {
                if (!entries.length) {
                    return;
                }

                onResize();
            });

            resizeObserverInstance.observe(element, { box });

            return () => {
                if (element) {
                    resizeObserverInstance.unobserve(element);
                }
            };
        }
    }, [onResize, ref, box]);
}
