"use client";

import { PROGRESS_BASE_DIAMETER_MULTIPLIER, PROGRESS_FULL_PERCENTAGE, PROGRESS_HALF_PERCENTAGE } from "@/constants/base-components.constants";
import type { ProgressBarCircleProps } from "@/types/base-components.types";
import { cx as clx, sortCx } from "@/utils/cx";

const sizes = sortCx({
    xxs: {
        strokeWidth: 6,
        radius: 29,
        valueClass: "text-sm font-semibold text-primary",
        labelClass: "text-xs font-medium text-tertiary",
        halfCircleTextPosition: "absolute bottom-0.5 text-center",
    },
    xs: {
        strokeWidth: 16,
        radius: 72,
        valueClass: "text-display-xs font-semibold text-primary",
        labelClass: "text-xs font-medium text-tertiary",
        halfCircleTextPosition: "absolute bottom-0.5 text-center",
    },
    sm: {
        strokeWidth: 20,
        radius: 90,
        valueClass: "text-display-sm font-semibold text-primary",
        labelClass: "text-xs font-medium text-tertiary",
        halfCircleTextPosition: "absolute bottom-1 text-center",
    },
    md: {
        strokeWidth: 24,
        radius: 108,
        valueClass: "text-display-md font-semibold text-primary",
        labelClass: "text-sm font-medium text-tertiary",
        halfCircleTextPosition: "absolute bottom-1 text-center",
    },
    lg: {
        strokeWidth: 28,
        radius: 126,
        valueClass: "text-display-lg font-semibold text-primary",
        labelClass: "text-sm font-medium text-tertiary",
        halfCircleTextPosition: "absolute bottom-0 text-center",
    },
});

export const ProgressBarCircle = ({ value, min = 0, max = PROGRESS_FULL_PERCENTAGE, size, label, valueFormatter }: ProgressBarCircleProps) => {
    const percentage = Math.round(((value - min) * PROGRESS_FULL_PERCENTAGE) / (max - min));

    const sizeConfig = sizes[size];

    const { strokeWidth, radius, valueClass, labelClass } = sizeConfig;

    const diameter = PROGRESS_BASE_DIAMETER_MULTIPLIER * (radius + strokeWidth / PROGRESS_BASE_DIAMETER_MULTIPLIER);
    const width = diameter;
    const height = diameter;
    const viewBox = `0 0 ${width} ${height}`;
    const cx = diameter / PROGRESS_BASE_DIAMETER_MULTIPLIER;
    const cy = diameter / PROGRESS_BASE_DIAMETER_MULTIPLIER;

    const textPosition = label ? "absolute text-center" : "absolute text-primary";
    const strokeDashoffset = PROGRESS_FULL_PERCENTAGE - percentage;

    return (
        <div className="flex flex-col items-center gap-0.5">
            <div role="progressbar" aria-valuenow={value} aria-valuemin={min} aria-valuemax={max} className="relative flex w-max items-center justify-center">
                <svg className="-rotate-90" width={width} height={height} viewBox={viewBox}>
                    {/* Background circle */}
                    <circle
                        className="stroke-bg-quaternary"
                        cx={cx}
                        cy={cy}
                        r={radius}
                        fill="none"
                        strokeWidth={strokeWidth}
                        pathLength="100"
                        strokeDasharray="100"
                        strokeLinecap="round"
                    />

                    {/* Foreground circle */}
                    <circle
                        className="stroke-fg-brand-primary"
                        cx={cx}
                        cy={cy}
                        r={radius}
                        fill="none"
                        strokeWidth={strokeWidth}
                        pathLength="100"
                        strokeDasharray="100"
                        strokeLinecap="round"
                        strokeDashoffset={strokeDashoffset}
                    />
                </svg>
                {label && size !== "xxs" ? (
                    <div className="absolute text-center">
                        <div className={labelClass}>{label}</div>
                        <div className={valueClass}>{valueFormatter ? valueFormatter(value, percentage) : `${percentage}%`}</div>
                    </div>
                ) : (
                    <span className={clx(textPosition, valueClass)}>{valueFormatter ? valueFormatter(value, percentage) : `${percentage}%`}</span>
                )}
            </div>

            {label && size === "xxs" && <div className={labelClass}>{label}</div>}
        </div>
    );
};

export const ProgressBarHalfCircle = ({ value, min = 0, max = PROGRESS_FULL_PERCENTAGE, size, label, valueFormatter }: ProgressBarCircleProps) => {
    const percentage = Math.round(((value - min) * PROGRESS_FULL_PERCENTAGE) / (max - min));

    const sizeConfig = sizes[size];

    const { strokeWidth, radius, valueClass, labelClass, halfCircleTextPosition } = sizeConfig;

    const width = PROGRESS_BASE_DIAMETER_MULTIPLIER * (radius + strokeWidth / PROGRESS_BASE_DIAMETER_MULTIPLIER);
    const height = radius + strokeWidth;
    const viewBox = `0 0 ${width} ${height}`;
    const cx = "50%";
    const cy = radius + strokeWidth / PROGRESS_BASE_DIAMETER_MULTIPLIER;

    const strokeDashoffset = -PROGRESS_HALF_PERCENTAGE - (PROGRESS_FULL_PERCENTAGE - percentage) / PROGRESS_BASE_DIAMETER_MULTIPLIER;

    return (
        <div className="flex flex-col items-center gap-0.5">
            <div role="progressbar" aria-valuenow={value} aria-valuemin={min} aria-valuemax={max} className="relative flex w-max items-center justify-center">
                <svg width={width} height={height} viewBox={viewBox}>
                    {/* Background half-circle */}
                    <circle
                        className="stroke-bg-quaternary"
                        cx={cx}
                        cy={cy}
                        r={radius}
                        fill="none"
                        strokeWidth={strokeWidth}
                        pathLength="100"
                        strokeDasharray="100"
                        strokeDashoffset="-50"
                        strokeLinecap="round"
                    />

                    {/* Foreground half-circle */}
                    <circle
                        className="origin-center -scale-x-100 stroke-fg-brand-primary"
                        cx={cx}
                        cy={cy}
                        r={radius}
                        fill="none"
                        strokeWidth={strokeWidth}
                        pathLength="100"
                        strokeDasharray="100"
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                    />
                </svg>

                {label && size !== "xxs" ? (
                    <div className={halfCircleTextPosition}>
                        <div className={labelClass}>{label}</div>
                        <div className={valueClass}>{valueFormatter ? valueFormatter(value, percentage) : `${percentage}%`}</div>
                    </div>
                ) : (
                    <span className={clx(halfCircleTextPosition, valueClass)}>{valueFormatter ? valueFormatter(value, percentage) : `${percentage}%`}</span>
                )}
            </div>

            {label && size === "xxs" && <div className={labelClass}>{label}</div>}
        </div>
    );
};
