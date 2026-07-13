"use client";

import { Plus } from "@untitledui/icons";
import { Tooltip as AriaTooltip, TooltipTrigger as AriaTooltipTrigger } from "@/components/base/tooltip/tooltip";
import { AVATAR_ADD_BUTTON_SIZES } from "@/constants/base-components.constants";
import type { AvatarAddButtonProps } from "@/types/base-components.types";
import { cx } from "@/utils/cx";

export const AvatarAddButton = ({ size, className, title = "Add user", ...props }: AvatarAddButtonProps) => (
    <AriaTooltip title={title}>
        <AriaTooltipTrigger
            {...props}
            aria-label={title}
            className={cx(
                "flex cursor-pointer items-center justify-center rounded-full border border-dashed border-primary bg-primary text-fg-quaternary outline-focus-ring transition duration-100 ease-linear hover:bg-primary_hover hover:text-fg-quaternary_hover focus-visible:outline-2 focus-visible:outline-offset-2 disabled:border-gray-200 disabled:bg-secondary disabled:text-gray-200",
                AVATAR_ADD_BUTTON_SIZES[size].root,
                className,
            )}
        >
            <Plus className={cx("text-current transition-inherit-all", AVATAR_ADD_BUTTON_SIZES[size].icon)} />
        </AriaTooltipTrigger>
    </AriaTooltip>
);
