import { SVG_STROKE_WIDTH } from "@/constants/common-components.constants";
import { DEFAULT_ICON_SIZE } from "@/constants/ui-components.constants";
import type { XIconProps } from "@/types/icon-components.types";

export function XIcon({ size = DEFAULT_ICON_SIZE, color = "currentColor", strokeWidth = SVG_STROKE_WIDTH, className, ...props }: XIconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true" {...props}>
            <path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
