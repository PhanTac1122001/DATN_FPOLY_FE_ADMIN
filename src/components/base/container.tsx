import { DEFAULT_GRID_COLUMNS } from "@/constants/base-components.constants";
import { ContainerProps, GridItemProps } from "@/types/base-components.types";
import { cx } from "@/utils/cx";

export function Container({ children, className, ...props }: ContainerProps) {
    return (
        <div className={cx("mx-auto grid w-full max-w-container grid-cols-12 gap-4 px-4 md:gap-6 lg:gap-8 lg:px-8", className)} {...props}>
            {children}
        </div>
    );
}

/**
 * GridItem component for consistent 12-column grid spans
 */
export function GridItem({ children, className, span = DEFAULT_GRID_COLUMNS, mdSpan, lgSpan, xlSpan }: GridItemProps) {
    const getSpanClass = (s: number | string | undefined, prefix: string = "") => {
        if (!s) return "";
        const p = prefix ? `${prefix}:` : "";
        return typeof s === "number" ? `${p}col-span-${s}` : `${p}${s}`;
    };

    return (
        <div className={cx(getSpanClass(span), getSpanClass(mdSpan, "md"), getSpanClass(lgSpan, "lg"), getSpanClass(xlSpan, "xl"), className)}>{children}</div>
    );
}
