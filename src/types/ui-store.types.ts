export interface UIStore {
    isSidebarCollapsed: boolean;
    isGlobalLoading: boolean;
    toggleSidebar: () => void;
    setSidebarCollapsed: (value: boolean) => void;
    setGlobalLoading: (isLoading: boolean) => void;
}
