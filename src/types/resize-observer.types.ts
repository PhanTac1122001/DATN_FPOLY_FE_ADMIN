import type { RefObject } from "@react-types/shared";

export interface UseResizeObserverOptions<T> {
    ref: RefObject<T | undefined | null> | undefined;
    box?: ResizeObserverBoxOptions;
    onResize: () => void;
}
