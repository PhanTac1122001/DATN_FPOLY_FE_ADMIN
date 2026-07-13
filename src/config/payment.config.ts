import type { ComponentType, HTMLAttributes } from "react";
import { AmexIcon, DiscoverIcon, MastercardIcon, VisaIcon } from "@/components/foundations/payment-icons";
import type { IconsaxIconProps } from "@/types/base-components.types";

export const CARD_TYPES = ["visa", "mastercard", "amex", "discover"] as const;

export const CARD_ICONS: Record<string, ComponentType<HTMLAttributes<HTMLOrSVGElement> | IconsaxIconProps>> = {
    visa: VisaIcon,
    mastercard: MastercardIcon,
    amex: AmexIcon,
    discover: DiscoverIcon,
};
