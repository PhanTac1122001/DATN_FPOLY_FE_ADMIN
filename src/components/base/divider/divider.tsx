"use client";

import { type FC } from "react";
// Import type for internal use
import type { DividerProps } from "@/types/base-components.types";
import { cx, sortCx } from "@/utils/cx";

export const styles = sortCx({
    common: {
        root: "border-0 bg-gray-100",
    },

    orientations: {
        horizontal: "h-px w-full",
        vertical: "h-full w-px",
    },

    variants: {
        solid: "bg-gray-100",
        dashed: "border-t border-dashed border-border-secondary bg-transparent",
        dotted: "border-t border-dotted border-border-secondary bg-transparent",
    },

    spacing: {
        none: "",
        sm: "",
        md: "",
        lg: "",
        xl: "",
    },
});

// Re-export type from centralized location
export type { DividerProps } from "@/types/base-components.types";

export const Divider: FC<DividerProps> = ({ orientation = "horizontal", variant = "solid", spacing: _spacing = "md", className, children }) => {
    // If there are children, render a divider with text
    if (children && orientation === "horizontal") {
        const lineClasses = cx(
            "flex-1",
            variant === "solid" && "h-px bg-gray-100",
            variant === "dashed" && "border-t border-dashed border-border-secondary",
            variant === "dotted" && "border-t border-dotted border-border-secondary",
        );

        return (
            <div className={cx("flex items-center", className)} role="separator">
                <div className={lineClasses} />
                <span className="px-3 text-sm text-fg-quaternary">{children}</span>
                <div className={lineClasses} />
            </div>
        );
    }

    // Simple divider without text
    const dividerClasses = cx(
        styles.common.root,
        styles.orientations[orientation],
        variant === "solid" && styles.variants.solid,
        variant === "dashed" && styles.variants.dashed,
        variant === "dotted" && styles.variants.dotted,
        className,
    );

    return <hr className={dividerClasses} role="separator" aria-orientation={orientation} />;
};
