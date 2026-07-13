export interface UnsavedChangesState {
    isDirty: boolean;
    setIsDirty: (isDirty: boolean) => void;
    globalConfirmOpen: boolean;
    setGlobalConfirmOpen: (isOpen: boolean) => void;
    pendingRoute: string | null;
    setPendingRoute: (route: string | null) => void;
}
