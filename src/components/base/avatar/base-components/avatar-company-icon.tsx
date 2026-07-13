"use client";

import Image from "next/image";
import { AVATAR_COMPANY_ICON_SIZES } from "@/constants/base-components.constants";
import type { AvatarCompanyIconProps } from "@/types/base-components.types";
import { cx } from "@/utils/cx";

export const AvatarCompanyIcon = ({ size, src, alt }: AvatarCompanyIconProps) => (
    <div
        className={cx(
            "bg-primary-25 absolute -right-0.5 -bottom-0.5 overflow-hidden rounded-full ring-[1.5px] ring-bg-primary",
            AVATAR_COMPANY_ICON_SIZES[size],
        )}
    >
        <Image src={src} alt={alt || ""} fill className="object-cover" />
    </div>
);
