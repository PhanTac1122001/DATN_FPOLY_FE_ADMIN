"use client";

import { HelpCircle } from "@untitledui/icons";
import { Label as AriaLabel } from "react-aria-components";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
// Import type for internal use
import type { LabelProps } from "@/types/base-components.types";
import { cx } from "@/utils/cx";

// Re-export type from centralized location
export type { LabelProps } from "@/types/base-components.types";

export const Label = ({ isRequired, tooltip, tooltipDescription, className, children, ...props }: LabelProps) => {
    let labelContent = children;
    let hasExplicitRequired = Boolean(isRequired);

    if (typeof children === "string") {
        const trimmed = children.trim();
        if (trimmed.endsWith("*")) {
            labelContent = trimmed.slice(0, -1).trim();
            hasExplicitRequired = true;
        }
    }

    return (
        <AriaLabel
            // Used for conditionally hiding/showing the label element via CSS:
            // <Input label="Visible only on mobile" className="lg:**:data-label:hidden" />
            // or
            // <Input label="Visible only on mobile" className="lg:label:hidden" />
            data-label="true"
            {...props}
            className={cx("flex cursor-default items-center gap-0.5 text-sm font-semibold text-slate-700", className)}
        >
            {labelContent}

            {hasExplicitRequired || isRequired ? (
                <span className="ml-0.5 font-bold text-red-500">{"*"}</span>
            ) : (
                <span className={cx("hidden font-bold text-red-500", typeof isRequired === "undefined" && "group-required:inline-block")}>{"*"}</span>
            )}

            {tooltip && (
                <Tooltip title={tooltip} description={tooltipDescription} placement="top">
                    <TooltipTrigger
                        // `TooltipTrigger` inherits the disabled state from the parent form field
                        // but we don't that. We want the tooltip be enabled even if the parent
                        // field is disabled.
                        isDisabled={false}
                        className="cursor-pointer text-fg-quaternary transition duration-200 hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover"
                    >
                        <HelpCircle className="size-4" />
                    </TooltipTrigger>
                </Tooltip>
            )}
        </AriaLabel>
    );
};

Label.displayName = "Label";
