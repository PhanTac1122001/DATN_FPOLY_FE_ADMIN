/**
 * Return type of useClipboard hook
 */
export type UseClipboardReturnType = {
    copied: string | boolean;
    copy: (text: string, id?: string) => Promise<{ success: boolean; error?: Error }>;
};
