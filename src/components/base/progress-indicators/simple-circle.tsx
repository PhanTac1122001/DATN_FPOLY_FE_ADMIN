"use client";

import { PROGRESS_DEFAULT_MAX_VALUE, PROGRESS_DEFAULT_MIN_VALUE, PROGRESS_FULL_PERCENTAGE } from "@/constants/base-components.constants";

export const CircleProgressBar = (props: { value: number; min?: number; max?: number }) => {
    const { value, min = PROGRESS_DEFAULT_MIN_VALUE, max = PROGRESS_DEFAULT_MAX_VALUE } = props;
    const percentage = ((value - min) * PROGRESS_FULL_PERCENTAGE) / (max - min);

    return (
        <div role="progressbar" aria-valuenow={value} aria-valuemin={min} aria-valuemax={max} className="relative flex w-max items-center justify-center">
            <span className="absolute text-sm font-medium text-primary">
                {percentage}
                {"%"}
            </span>
            <svg className="size-16 -rotate-90" viewBox="0 0 60 60">
                <circle className="stroke-bg-quaternary" cx="30" cy="30" r="26" fill="none" strokeWidth="6" />
                <circle
                    className="stroke-fg-brand-primary"
                    style={{
                        strokeDashoffset: `calc(${PROGRESS_FULL_PERCENTAGE} - ${percentage})`,
                    }}
                    cx="30"
                    cy="30"
                    r="26"
                    fill="none"
                    strokeWidth="6"
                    strokeDasharray="100"
                    pathLength="100"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
};
