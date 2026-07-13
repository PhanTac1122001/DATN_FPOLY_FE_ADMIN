"use client";

import { useNotificationStore } from "@/stores/notification-store";
import { NotificationModal } from "./notification-modal";

export function NotificationModalWrapper() {
    const { isOpen, variant, title, message, buttonText, onButtonClick, showCloseButton, closeNotification } = useNotificationStore();

    return (
        <NotificationModal
            isOpen={isOpen}
            onClose={closeNotification}
            variant={variant}
            title={title}
            message={message}
            buttonText={buttonText}
            onButtonClick={onButtonClick}
            showCloseButton={showCloseButton}
        />
    );
}
