"use client";

import { Button } from "@/components/base/buttons/button";
import { Dialog, Modal, ModalOverlay } from "@/components/ui/custom-modal";
import { MODAL_VARIANTS } from "@/constants/application.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { cn } from "@/lib/utils";
import type { NotificationModalProps, NotificationModalVariant } from "@/types/application.types";

export type { NotificationModalVariant, NotificationModalProps };

export function NotificationModal({
    isOpen,
    onClose,
    variant = "info",
    title,
    message,
    buttonText,
    onButtonClick,
    showCloseButton = true,
}: NotificationModalProps) {
    const styles = MODAL_VARIANTS[variant];
    const IconComponent = styles.icon;

    const handleButtonClick = () => {
        if (onButtonClick) {
            onButtonClick();
        } else {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <ModalOverlay isOpen={isOpen} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <Modal className="w-full max-w-md">
                <Dialog className="flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-xl">
                    <div className="flex flex-col items-center justify-center gap-2">
                        {/* Icon */}
                        <div className="flex items-center justify-center">
                            <div className={cn("flex h-10 w-10 items-center justify-center rounded-full")}>
                                <IconComponent size={40} variant="Bold" color={styles.iconColor} className="flex-shrink-0" />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex flex-col gap-2 text-center">
                            <h2 className={cn("font-display text-2xl leading-7 font-bold", styles.titleColor)}>{title}</h2>
                            <div className={cn("font-sans text-sm leading-5", styles.messageColor)}>{message}</div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex w-full flex-col gap-3">
                        {buttonText && (
                            <Button size="lg" className="w-full" onClick={handleButtonClick}>
                                {buttonText}
                            </Button>
                        )}
                        {showCloseButton && !buttonText && (
                            <Button size="lg" color="secondary" className="w-full" onClick={onClose}>
                                {UI_TEXT.common.close}
                            </Button>
                        )}
                    </div>
                </Dialog>
            </Modal>
        </ModalOverlay>
    );
}
