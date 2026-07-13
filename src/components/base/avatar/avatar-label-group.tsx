"use client";

import { AVATAR_LABEL_GROUP_STYLES } from "@/constants/base-components.constants";
import type { AvatarLabelGroupProps } from "@/types/base-components.types";
import { cx } from "@/utils/cx";
import { Avatar } from "./avatar";

export const AvatarLabelGroup = ({ title, subtitle, className, ...props }: AvatarLabelGroupProps) => {
    const styles = AVATAR_LABEL_GROUP_STYLES[props.size];
    return (
        <figure className={cx("group flex min-w-0 flex-1 items-center", styles.root, className)}>
            <Avatar {...props} />
            <figcaption className="min-w-0 flex-1">
                <p className={cx("text-primary", styles.title)}>{title}</p>
                <p className={cx("truncate text-tertiary", styles.subtitle)}>{subtitle}</p>
            </figcaption>
        </figure>
    );
};
