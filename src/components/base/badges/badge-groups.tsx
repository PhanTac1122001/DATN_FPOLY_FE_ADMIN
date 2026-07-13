"use client";

import { isValidElement } from "react";
import { ArrowRight } from "@untitledui/icons";
import { BADGE_GROUP_BASE_CLASSES, BADGE_GROUP_COLOR_CLASSES } from "@/constants/badge.constants";
import type { BadgeGroupProps } from "@/types/base-components.types";
import { getBadgeGroupSizeClasses } from "@/utils/badge-group.utils";
import { cx } from "@/utils/cx";
import { isReactComponent } from "@/utils/is-react-component";

export const BadgeGroup = ({
    children,
    addonText,
    size = "md",
    color = "brand",
    theme = "light",
    align = "leading",
    className,
    iconTrailing: IconTrailing = ArrowRight,
}: BadgeGroupProps) => {
    const colors = BADGE_GROUP_COLOR_CLASSES[theme][color];
    const sizes = getBadgeGroupSizeClasses(theme, !!children, !!IconTrailing)[align][size];

    const rootClasses = cx(
        "inline-flex w-max cursor-pointer items-center transition duration-100 ease-linear",
        BADGE_GROUP_BASE_CLASSES[theme].root,
        sizes.root,
        colors.root,
        className,
    );
    const addonClasses = cx("inline-flex items-center", BADGE_GROUP_BASE_CLASSES[theme].addon, sizes.addon, colors.addon);
    const dotClasses = cx("inline-block size-2 shrink-0 rounded-full", sizes.dot, colors.dot);
    const iconClasses = cx(BADGE_GROUP_BASE_CLASSES[theme].icon, sizes.icon, colors.icon);

    if (align === "trailing") {
        return (
            <div className={rootClasses}>
                {theme === "modern" && <span className={dotClasses} />}

                {children}

                <span className={addonClasses}>
                    {addonText}

                    {/* Trailing icon */}
                    {isReactComponent(IconTrailing) && <IconTrailing className={iconClasses} />}
                    {isValidElement(IconTrailing) && IconTrailing}
                </span>
            </div>
        );
    }

    return (
        <div className={rootClasses}>
            <span className={addonClasses}>
                {theme === "modern" && <span className={dotClasses} />}
                {addonText}
            </span>

            {children}

            {/* Trailing icon */}
            {isReactComponent(IconTrailing) && <IconTrailing className={iconClasses} />}
            {isValidElement(IconTrailing) && IconTrailing}
        </div>
    );
};
