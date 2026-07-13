"use client";

import { PROGRESS_DEFAULT_MAX_VALUE, PROGRESS_DEFAULT_MIN_VALUE, PROGRESS_PERCENTAGE_MAX } from "@/constants/base-components.constants";
import type { ProgressBarProps, ProgressIndicatorWithTextProps } from "@/types/base-components.types";
import { cx } from "@/utils/cx";

export type { ProgressBarProps, ProgressIndicatorWithTextProps };

/**
 * A basic progress bar component.
 */
export const ProgressBarBase = ({
    value,
    min = PROGRESS_DEFAULT_MIN_VALUE,
    max = PROGRESS_DEFAULT_MAX_VALUE,
    className,
    progressClassName,
}: ProgressBarProps) => {
    const percentage = ((value - min) * PROGRESS_PERCENTAGE_MAX) / (max - min);

    return (
        <div
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={min}
            aria-valuemax={max}
            className={cx("h-2 w-full overflow-hidden rounded-md bg-quaternary", className)}
        >
            <div
                // Use transform instead of width to avoid layout thrashing (and for smoother animation)
                style={{ transform: `translateX(-${PROGRESS_PERCENTAGE_MAX - percentage}%)` }}
                className={cx("size-full rounded-md bg-fg-brand-primary transition duration-75 ease-linear", progressClassName)}
            />
        </div>
    );
};

/**
 * A progress bar component that displays the value text in various configurable layouts.
 */
export const ProgressBar = ({
    value,
    min = PROGRESS_DEFAULT_MIN_VALUE,
    max = PROGRESS_DEFAULT_MAX_VALUE,
    valueFormatter,
    labelPosition,
    className,
    progressClassName,
}: ProgressIndicatorWithTextProps) => {
    const percentage = ((value - min) * PROGRESS_PERCENTAGE_MAX) / (max - min);
    const formattedValue = valueFormatter ? valueFormatter(value, percentage) : `${percentage.toFixed(0)}%`; // Default to rounded percentage

    const baseProgressBar = <ProgressBarBase min={min} max={max} value={value} className={className} progressClassName={progressClassName} />;

    switch (labelPosition) {
        case "right":
            return (
                <div className="flex items-center gap-3">
                    {baseProgressBar}
                    <span className="shrink-0 text-sm font-medium text-secondary tabular-nums">{formattedValue}</span>
                </div>
            );
        case "bottom":
            return (
                <div className="flex flex-col items-end gap-2">
                    {baseProgressBar}
                    <span className="text-sm font-medium text-secondary tabular-nums">{formattedValue}</span>
                </div>
            );
        case "top-floating":
            return (
                <div className="relative flex flex-col items-end gap-2">
                    {baseProgressBar}
                    <div
                        style={{ left: `${percentage}%` }}
                        className="absolute -top-2 -translate-x-1/2 -translate-y-full rounded-lg bg-primary_alt px-3 py-2 shadow-lg ring-1 ring-secondary_alt"
                    >
                        <div className="text-xs font-semibold text-secondary tabular-nums">{formattedValue}</div>
                    </div>
                </div>
            );
        case "bottom-floating":
            return (
                <div className="relative flex flex-col items-end gap-2">
                    {baseProgressBar}
                    <div
                        style={{ left: `${percentage}%` }}
                        className="absolute -bottom-2 -translate-x-1/2 translate-y-full rounded-lg bg-primary_alt px-3 py-2 shadow-lg ring-1 ring-secondary_alt"
                    >
                        <div className="text-xs font-semibold text-secondary">{formattedValue}</div>
                    </div>
                </div>
            );
        default:
            // Fallback or default case, could render the basic progress bar or throw an error
            return baseProgressBar;
    }
};
