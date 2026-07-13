import { NO_DATA_ICON_SIZE } from "@/constants/common-components.constants";
import type { BaseSvgIconProps } from "@/types/icon-components.types";

export function NoData({ size = NO_DATA_ICON_SIZE, color = "currentColor", className, ...props }: BaseSvgIconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className} aria-hidden="true" {...props}>
            <rect x="20" y="28" width="80" height="56" rx="8" stroke={color} strokeWidth="2" opacity="0.35" />
            <path d="M36 52h48M36 64h32" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.35" />
            <circle cx="60" cy="92" r="4" fill={color} opacity="0.35" />
        </svg>
    );
}
