"use client";

import { isValidElement } from "react";
import { Button as AriaButton, Link as AriaLink } from "react-aria-components";
import { Tooltip } from "@/components/base/tooltip/tooltip";
import { BUTTON_UTILITY_STYLES, TOOLTIP_OFFSET_SM, TOOLTIP_OFFSET_XS } from "@/constants/base-components.constants";
// Import type for internal use
import type { ButtonUtilityProps as Props } from "@/types/base-components.types";
import { cx } from "@/utils/cx";
import { isReactComponent } from "@/utils/is-react-component";

// Re-export types from centralized location
export type {
    ButtonUtilityCommonProps as CommonProps,
    ButtonUtilityButtonProps as ButtonProps,
    ButtonUtilityLinkProps as LinkProps,
    ButtonUtilityProps as Props,
} from "@/types/base-components.types";

export const ButtonUtility = ({
    tooltip,
    className,
    isDisabled,
    icon: Icon,
    size = "sm",
    color = "secondary",
    tooltipPlacement = "top",
    ...otherProps
}: Props) => {
    const href = "href" in otherProps ? otherProps.href : undefined;
    const Component = href ? AriaLink : AriaButton;

    let props = {};

    if (href) {
        props = {
            ...otherProps,

            href: isDisabled ? undefined : href,

            // Since anchor elements do not support the `disabled` attribute and state,
            // we need to specify `data-rac` and `data-disabled` in order to be able
            // to use the `disabled:` selector in classes.
            ...(isDisabled ? { "data-rac": true, "data-disabled": true } : {}),
        };
    } else {
        props = {
            ...otherProps,

            type: otherProps.type || "button",
            isDisabled,
        };
    }

    const content = (
        <Component
            aria-label={tooltip}
            {...props}
            className={cx(
                "group relative inline-flex h-max cursor-pointer items-center justify-center rounded-md p-1.5 outline-focus-ring transition duration-100 ease-linear focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:text-fg-disabled_subtle",
                BUTTON_UTILITY_STYLES[color],

                // Icon styles
                "*:data-icon:pointer-events-none *:data-icon:shrink-0 *:data-icon:text-current *:data-icon:transition-inherit-all",
                size === "xs" ? "*:data-icon:size-4" : "*:data-icon:size-5",

                className,
            )}
        >
            {isReactComponent(Icon) && <Icon data-icon />}
            {isValidElement(Icon) && Icon}
        </Component>
    );

    if (tooltip) {
        return (
            <Tooltip title={tooltip} placement={tooltipPlacement} isDisabled={isDisabled} offset={size === "xs" ? TOOLTIP_OFFSET_XS : TOOLTIP_OFFSET_SM}>
                {content}
            </Tooltip>
        );
    }

    return content;
};
