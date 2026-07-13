"use client";

import { Button } from "@/components/base/buttons/button";
import { CustomModal } from "@/components/ui/custom-modal";
import type { ConfirmModalProps } from "@/types/application.types";
import { cx } from "@/utils/cx";

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    cancelText,
    variant = "primary",
    isLoading = false,
    icon,
    modalClassName,
}: ConfirmModalProps & { icon?: React.ReactNode }) {
    const getConfirmButtonColor = () => {
        switch (variant) {
            case "danger":
                return "primary" as const; // We will use custom classes for the exact red
            case "warning":
                return "primary" as const;
            default:
                return "primary" as const;
        }
    };

    const getCancelButtonColor = () => {
        switch (variant) {
            case "danger":
                return "secondary" as const; // We will use custom classes for the exact red
            case "warning":
                return "secondary" as const;
            default:
                return "secondary" as const;
        }
    };

    // Figma design has a specific layout: Icon -> Title -> Message -> Buttons
    return (
        <CustomModal.Root open={isOpen} onOpenChange={onClose}>
            <CustomModal.Content className={cx("max-w-[440px] !overflow-visible !rounded-[24px]", modalClassName)}>
                <div className="flex w-full flex-col items-center gap-2 p-8">
                    {/* Icon */}
                    {icon && <div className="flex size-10 shrink-0 items-center justify-center">{icon}</div>}

                    {/* Text Content */}
                    <div className="flex w-full flex-col items-center gap-1 text-center">
                        <h3 className="text-2xl leading-8 font-semibold text-slate-950">{title}</h3>
                        <p className="text-sm leading-5 text-slate-600">{message}</p>
                    </div>

                    {/* Buttons */}
                    <div className="mt-4 flex w-full items-center justify-center gap-4">
                        {cancelText && (
                            <Button
                                type="button"
                                color={getCancelButtonColor()}
                                size="lg"
                                onClick={onClose}
                                isDisabled={isLoading}
                                className="w-[auto] justify-center px-4 max-sm:w-[117px] sm:min-w-[140px]"
                            >
                                {cancelText}
                            </Button>
                        )}
                        <Button
                            type="button"
                            color={getConfirmButtonColor()}
                            size="lg"
                            onClick={onConfirm}
                            isLoading={isLoading}
                            className={cx("justify-center px-4", cancelText ? "flex-1" : "min-w-[140px]")}
                        >
                            {confirmText}
                        </Button>
                    </div>
                </div>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
