export function autoResizeTextarea(element: HTMLTextAreaElement | null): void {
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
}

export function getResizeHandleBg(color: string): string {
    return color;
}
