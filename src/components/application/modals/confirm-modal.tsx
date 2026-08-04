"use client";

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
                    <div className="mt-5 flex w-full items-center justify-center gap-3">
                        {cancelText && (
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading}
                                className={cx(
                                    "w-1/3 cursor-pointer justify-center !rounded-full border border-slate-200 bg-slate-50 py-2.5 text-center text-xs font-bold text-slate-600 transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
                                    variant === "danger" ? "hover:border-red-600 hover:bg-red-600 hover:text-white" : "hover:bg-slate-100 hover:text-slate-800",
                                )}
                            >
                                {cancelText}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={cx(
                                "cursor-pointer justify-center !rounded-full py-2.5 text-center text-xs font-black text-white shadow-md shadow-blue-500/10 transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400",
                                cancelText ? "w-2/3" : "w-full",
                                variant === "danger" ? "bg-brand-600 shadow-brand-500/10 hover:bg-brand-700" : "bg-blue-600 hover:bg-blue-700",
                            )}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
