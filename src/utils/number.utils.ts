/**
 * Creates an array of numbers from start to end (inclusive).
 * @param start - The start number.
 * @param end - The end number.
 * @returns An array of numbers from start to end.
 */
export const range = (start: number, end: number): number[] => {
    const length = end - start + 1;
    if (length <= 0) return [];
    return Array.from({ length }, (_, index) => index + start);
};
