import type { ComponentType, HTMLAttributes } from "react";
import { CARD_ICONS } from "@/config/payment.config";
import type { IconsaxIconProps } from "@/types/base-components.types";

type CardIcon = ComponentType<HTMLAttributes<HTMLOrSVGElement> | IconsaxIconProps>;

export function formatCardNumber(value: string): string {
    const digits = value.replace(/\D/g, "");
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function detectCardType(
    cardNumber: string,
    types: readonly string[],
): { icon: CardIcon } | null {
    const digits = cardNumber.replace(/\D/g, "");
    if (!digits) return null;

    let type: string | null = null;
    if (digits.startsWith("4")) type = "visa";
    else if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) type = "mastercard";
    else if (/^3[47]/.test(digits)) type = "amex";
    else if (digits.startsWith("6")) type = "discover";

    if (!type || !types.includes(type)) return null;

    const icon = CARD_ICONS[type];
    return icon ? { icon } : null;
}
