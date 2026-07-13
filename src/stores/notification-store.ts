import { create } from "zustand";
import type { NotificationState } from "@/types/notification-store.types";

export const useNotificationStore = create<NotificationState>((set) => ({
    isOpen: false,
    variant: "info",
    title: "",
    message: "",
    showCloseButton: true,
    showNotification: (payload) => set({ ...payload, isOpen: true }),
    closeNotification: () => set({ isOpen: false }),
}));
