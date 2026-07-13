"use client";

import { toast as sonnerToast } from "sonner";
import { CloseCircle, InfoCircle, TickCircle } from "@/components/icons";
import { XIcon } from "@/components/icons/x-icon";
import { ICON_COLORS } from "@/constants/app.constants";
import type { CustomToastProps, ToastConfigMap, ToastOptions } from "@/types/toast.types";

const toastConfig: ToastConfigMap = {
    success: {
        backgroundColor: ICON_COLORS.TOAST_SUCCESS_BG,
        borderColor: ICON_COLORS.SUCCESS_500,
        iconColor: ICON_COLORS.SUCCESS_500,
    },
    error: {
        backgroundColor: ICON_COLORS.ERROR_50,
        borderColor: ICON_COLORS.ERROR_500,
        iconColor: ICON_COLORS.ERROR_500,
    },
    warning: {
        backgroundColor: ICON_COLORS.WARNING_50,
        borderColor: ICON_COLORS.WARNING_500,
        iconColor: ICON_COLORS.WARNING_500,
    },
    info: {
        backgroundColor: ICON_COLORS.TOAST_INFO_BG,
        borderColor: ICON_COLORS.TOAST_INFO_BORDER,
        iconColor: ICON_COLORS.TOAST_INFO_ICON,
    },
};

// Custom Toast Component
function CustomToast({ title, description, type, toastId }: CustomToastProps) {
    const config = toastConfig[type];

    const renderIcon = () => {
        const iconProps = { size: 32, variant: "Bold" as const };

        switch (type) {
            case "success":
                return <TickCircle {...iconProps} color={config.iconColor} />;
            case "error":
                return <CloseCircle {...iconProps} color={config.iconColor} />;
            case "warning":
            case "info":
                return <InfoCircle {...iconProps} color={config.iconColor} />;
        }
    };

    return (
        <div
            className="flex max-w-[480px] min-w-[320px] items-center gap-3 rounded-[12px] border p-3 font-body shadow-lg"
            style={{
                backgroundColor: config.backgroundColor,
                borderColor: config.borderColor,
            }}
        >
            {/* Icon */}
            <div className="flex shrink-0 items-center justify-center">{renderIcon()}</div>

            {/* Content */}
            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="text-base leading-6 font-semibold text-gray-900">{title}</p>
                {description && <p className="text-xs leading-[18px] text-gray-600">{description}</p>}
            </div>

            {/* Close Button */}
            <button
                onClick={() => sonnerToast.dismiss(toastId)}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-sm leading-none text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close notification"
            >
                <XIcon size={20} color={ICON_COLORS.GRAY_500} aria-hidden="true" />
            </button>
        </div>
    );
}

// Toast Service API
export const toast = {
    success: (title: string, description?: string, options?: ToastOptions) => {
        return sonnerToast.custom((t) => <CustomToast title={title} description={description} type="success" toastId={t} />, {
            className: "!bg-transparent !border-0 !shadow-none !p-0 !min-w-fit",
            ...options,
        });
    },

    error: (title: string, description?: string, options?: ToastOptions) => {
        return sonnerToast.custom((t) => <CustomToast title={title} description={description} type="error" toastId={t} />, {
            className: "!bg-transparent !border-0 !shadow-none !p-0 !min-w-fit",
            ...options,
        });
    },

    warning: (title: string, description?: string, options?: ToastOptions) => {
        return sonnerToast.custom((t) => <CustomToast title={title} description={description} type="warning" toastId={t} />, {
            className: "!bg-transparent !border-0 !shadow-none !p-0 !min-w-fit",
            ...options,
        });
    },

    info: (title: string, description?: string, options?: ToastOptions) => {
        return sonnerToast.custom((t) => <CustomToast title={title} description={description} type="info" toastId={t} />, {
            className: "!bg-transparent !border-0 !shadow-none !p-0 !min-w-fit",
            ...options,
        });
    },

    dismiss: (toastId?: string | number) => {
        return sonnerToast.dismiss(toastId);
    },
};
