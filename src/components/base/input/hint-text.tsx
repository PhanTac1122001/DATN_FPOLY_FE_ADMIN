"use client";

import { Text as AriaText } from "react-aria-components";
// Import type for internal use
import type { HintTextProps } from "@/types/base-components.types";
import { cx } from "@/utils/cx";

// Re-export type from centralized location
export type { HintTextProps } from "@/types/base-components.types";

export const HintText = ({ isInvalid, className, ...props }: HintTextProps) => {
    return (
        <AriaText
            {...props}
            slot={isInvalid ? "errorMessage" : "description"}
            className={cx(
                "text-sm text-tertiary",

                // Invalid state
                isInvalid && "text-error-primary",
                "group-invalid:text-error-primary",

                className,
            )}
        />
    );
};

HintText.displayName = "HintText";
