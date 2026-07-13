"use client";

import { AVATAR_ONLINE_INDICATOR_SIZES } from "@/constants/base-components.constants";
import type { AvatarOnlineIndicatorProps } from "@/types/base-components.types";
import { cx } from "@/utils/cx";

export const AvatarOnlineIndicator = ({ size, status, className }: AvatarOnlineIndicatorProps) => (
    <span
        className={cx(
            "absolute right-0 bottom-0 rounded-full ring-[1.5px] ring-bg-primary",
            status === "online" ? "bg-fg-success-secondary" : "bg-fg-disabled_subtle",
            AVATAR_ONLINE_INDICATOR_SIZES[size],
            className,
        )}
    />
);
