import { create } from "zustand";
import type { UIStore } from "@/types/ui-store.types";

export const useUIStore = create<UIStore>((set) => ({
    isSidebarCollapsed: false,
    isGlobalLoading: false,
    toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
    setSidebarCollapsed: (value) => set({ isSidebarCollapsed: value }),
    setGlobalLoading: (isLoading) => set({ isGlobalLoading: isLoading }),
}));
