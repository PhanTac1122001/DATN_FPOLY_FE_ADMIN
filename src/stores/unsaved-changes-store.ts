import { create } from "zustand";
import { UnsavedChangesState } from "@/types/unsaved-changes.types";

export const useUnsavedChangesStore = create<UnsavedChangesState>((set) => ({
    isDirty: false,
    setIsDirty: (isDirty) => set({ isDirty }),
    globalConfirmOpen: false,
    setGlobalConfirmOpen: (isOpen) => set({ globalConfirmOpen: isOpen }),
    pendingRoute: null,
    setPendingRoute: (route) => set({ pendingRoute: route }),
}));
