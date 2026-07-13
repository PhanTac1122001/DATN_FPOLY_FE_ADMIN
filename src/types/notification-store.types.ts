export interface NotificationState {
    isOpen: boolean;
    variant: "success" | "error" | "info" | "warning";
    title: string;
    message: string;
    buttonText?: string;
    onButtonClick?: () => void;
    showCloseButton?: boolean;
    showNotification: (payload: Omit<NotificationState, "isOpen" | "showNotification" | "closeNotification">) => void;
    closeNotification: () => void;
}
