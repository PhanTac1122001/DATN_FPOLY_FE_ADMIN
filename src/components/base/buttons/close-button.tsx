"use client";

import { X as CloseIcon } from "@untitledui/icons";
import { Button as AriaButton } from "react-aria-components";
import { CLOSE_BUTTON_SIZES, CLOSE_BUTTON_THEMES } from "@/constants/base-components.constants";
import type { CloseButtonProps } from "@/types/base-components.types";
import { cx } from "@/utils/cx";

export type { CloseButtonProps };

export const CloseButton = ({ label, className, size = "sm", theme = "light", ...otherProps }: CloseButtonProps) => {
    return (
        <AriaButton
            {...otherProps}
            aria-label={label || "Close"}
            className={(state) =>
                cx(
                    "flex cursor-pointer items-center justify-center rounded-lg p-2 transition duration-100 ease-linear focus:outline-hidden",
                    CLOSE_BUTTON_SIZES[size].root,
                    CLOSE_BUTTON_THEMES[theme],
                    typeof className === "function" ? className(state) : className,
                )
            }
        >
            <CloseIcon aria-hidden="true" className={cx("shrink-0 transition-inherit-all", CLOSE_BUTTON_SIZES[size].icon)} />
        </AriaButton>
    );
};
