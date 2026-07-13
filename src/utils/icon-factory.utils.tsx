import type { ComponentType } from "react";
import { DEFAULT_ICON_SIZE } from "@/constants/ui-components.constants";
import type { IconsaxIconProps } from "@/types/base-components.types";
import type { FlexibleSvgIconProps } from "@/types/icon-components.types";

export function createIcon(Icon: ComponentType<IconsaxIconProps>) {
    return function IconWrapper({
        size = DEFAULT_ICON_SIZE,
        color = "currentColor",
        className,
        variant = "Linear",
        ...props
    }: FlexibleSvgIconProps & { variant?: string }) {
        const numericSize = typeof size === "string" ? Number(size) : size;
        return (
            <Icon
                size={numericSize}
                color={color}
                className={className}
                variant={variant as IconsaxIconProps["variant"]}
                {...props}
            />
        );
    };
}
