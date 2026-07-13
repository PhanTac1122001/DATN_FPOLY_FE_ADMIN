"use client";

import { RangeCalendarContext, useSlottedContext } from "react-aria-components";
import { COMPARE_EQUAL } from "@/constants/application.constants";
import type { RangePresetButtonProps } from "@/types/application.types";
import { cx } from "@/utils/cx";

export const RangePresetButton = ({ value, className, children, ...props }: RangePresetButtonProps) => {
    const context = useSlottedContext(RangeCalendarContext);

    const isSelected = context?.value?.start?.compare(value.start) === COMPARE_EQUAL && context?.value?.end?.compare(value.end) === COMPARE_EQUAL;

    return (
        <button
            {...props}
            className={cx(
                "cursor-pointer rounded-md px-3 py-2 text-left text-sm font-medium outline-focus-ring transition duration-100 ease-linear focus-visible:outline-2 focus-visible:outline-offset-2",
                isSelected ? "bg-active text-secondary_hover hover:bg-secondary_hover" : "text-secondary hover:bg-primary_hover hover:text-secondary_hover",
                className,
            )}
        >
            {children}
        </button>
    );
};
