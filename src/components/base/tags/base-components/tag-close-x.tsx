"use client";

import { XClose } from "@untitledui/icons";
import { Button as AriaButton } from "react-aria-components";
import { TAG_CLOSE_X_STYLES } from "@/constants/base-components.constants";
import type { TagCloseXProps } from "@/types/base-components.types";
import { cx } from "@/utils/cx";

export const TagCloseX = ({ size = "md", className, ...otherProps }: TagCloseXProps) => {
    return (
        <AriaButton
            slot="remove"
            aria-label="Remove this tag"
            className={cx(
                "flex cursor-pointer rounded-[3px] text-fg-quaternary outline-transparent transition duration-100 ease-linear hover:bg-primary_hover hover:text-fg-quaternary_hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:cursor-not-allowed",
                TAG_CLOSE_X_STYLES[size].root,
                className,
            )}
            {...otherProps}
        >
            <XClose className={cx("transition-inherit-all", TAG_CLOSE_X_STYLES[size].icon)} strokeWidth="3" />
        </AriaButton>
    );
};
