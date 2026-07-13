import { CloseCircle, InfoCircle, TickCircle } from "@/components/icons";
import { ALERT_VARIANTS } from "@/constants/base-components.constants";
import { cn } from "@/lib/utils";
import type { AlertProps, AlertVariant } from "@/types/base-components.types";

export type { AlertVariant, AlertProps };

const alertIcons = {
    error: CloseCircle,
    success: TickCircle,
    warning: InfoCircle,
    info: InfoCircle,
} as const;

export function Alert({ heading, message, variant = "info", icon, showIcon = true, className, ...props }: AlertProps) {
    const IconComponent = icon ?? alertIcons[variant];
    const styles = ALERT_VARIANTS[variant];

    return (
        <div role="alert" {...props} className={cn("flex w-full items-start gap-3 rounded-xl border px-4 py-3", styles.container, className)}>
            {showIcon && IconComponent ? <IconComponent className={cn("mt-0.5 flex-shrink-0", styles.icon)} size={20} color={styles.iconColor} /> : null}

            <div className="flex flex-col gap-1">
                {heading ? <p className={cn("text-sm leading-5 font-semibold", styles.heading)}>{heading}</p> : null}
                <div className={cn("text-sm leading-5", styles.text)}>{message}</div>
            </div>
        </div>
    );
}
