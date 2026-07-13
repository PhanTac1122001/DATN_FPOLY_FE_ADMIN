"use client";

import { Popover as AriaPopover } from "react-aria-components";
// Import type for internal use
import type { SelectPopoverProps as PopoverProps } from "@/types/base-components.types";
import { cx } from "@/utils/cx";

// Re-export type from centralized location
export type { SelectPopoverProps as PopoverProps } from "@/types/base-components.types";

export const Popover = ({ matchTriggerWidth = true, ...props }: PopoverProps) => {
    return (
        <AriaPopover
            placement="bottom"
            containerPadding={0}
            offset={8}
            {...props}
            className={(state) =>
                cx(
                    "custom-scrollbar max-h-64! origin-(--trigger-anchor-point) overflow-x-hidden overflow-y-auto rounded-2xl bg-white py-1 shadow-lg ring-1 ring-slate-200 outline-hidden will-change-transform",

                    state.isEntering &&
                        "duration-150 ease-out animate-in fade-in placement-right:slide-in-from-left-0.5 placement-top:slide-in-from-bottom-0.5 placement-bottom:slide-in-from-top-0.5",
                    state.isExiting &&
                        "duration-100 ease-in animate-out fade-out placement-right:slide-out-to-left-0.5 placement-top:slide-out-to-bottom-0.5 placement-bottom:slide-out-to-top-0.5",
                    props.size === "md" && "max-h-80!",
                    !matchTriggerWidth && "min-w-[var(--trigger-width)]",

                    typeof props.className === "function" ? props.className(state) : props.className,
                )
            }
            style={matchTriggerWidth ? { width: "var(--trigger-width)", ...props.style } : props.style}
        />
    );
};
