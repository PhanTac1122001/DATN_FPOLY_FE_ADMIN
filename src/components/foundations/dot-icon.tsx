"use client";

import type { HTMLAttributes } from "react";
import { DOT_SIZES } from "@/constants/base-components.constants";

export const Dot = ({ size = "md", ...props }: HTMLAttributes<HTMLOrSVGElement> & { size?: "sm" | "md" }) => {
    const s = DOT_SIZES[size];
    return (
        <svg width={s.wh} height={s.wh} viewBox={`0 0 ${s.wh} ${s.wh}`} fill="none" {...props}>
            <circle cx={s.c} cy={s.c} r={s.r} fill="currentColor" stroke="currentColor" />
        </svg>
    );
};
