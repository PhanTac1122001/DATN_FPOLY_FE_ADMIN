"use client";

import { useState } from "react";
import { User01 } from "@untitledui/icons";
import Image from "next/image";
import { AVATAR_PROFILE_PHOTO_STYLES, AVATAR_PROFILE_PHOTO_TICK_SIZE_MAP } from "@/constants/base-components.constants";
import type { AvatarProfilePhotoProps } from "@/types/base-components.types";
import { cx } from "@/utils/cx";
import { AvatarOnlineIndicator, VerifiedTick } from "./base-components";

export const AvatarProfilePhoto = ({
    contrastBorder = true,
    size = "md",
    src,
    alt,
    initials,
    placeholder,
    placeholderIcon: PlaceholderIcon,
    verified,
    badge,
    status,
    className,
}: AvatarProfilePhotoProps) => {
    const [isFailed, setIsFailed] = useState(false);

    const renderMainContent = () => {
        if (src && !isFailed) {
            return (
                <Image
                    src={src}
                    alt={alt || ""}
                    onError={() => setIsFailed(true)}
                    fill
                    className={cx(
                        "rounded-full object-cover",
                        contrastBorder && "outline-1 -outline-offset-1 outline-avatar-contrast-border",
                        AVATAR_PROFILE_PHOTO_STYLES[size].content,
                    )}
                />
            );
        }

        if (initials) {
            return (
                <div
                    className={cx(
                        "flex size-full items-center justify-center rounded-full bg-tertiary ring-1 ring-secondary_alt",
                        AVATAR_PROFILE_PHOTO_STYLES[size].content,
                    )}
                >
                    <span className={cx("text-quaternary", AVATAR_PROFILE_PHOTO_STYLES[size].initials)}>{initials}</span>
                </div>
            );
        }

        if (PlaceholderIcon) {
            return (
                <div
                    className={cx(
                        "flex size-full items-center justify-center rounded-full bg-tertiary ring-1 ring-secondary_alt",
                        AVATAR_PROFILE_PHOTO_STYLES[size].content,
                    )}
                >
                    <PlaceholderIcon className={cx("text-fg-quaternary", AVATAR_PROFILE_PHOTO_STYLES[size].icon)} />
                </div>
            );
        }

        return (
            <div
                className={cx(
                    "flex size-full items-center justify-center rounded-full bg-tertiary ring-1 ring-secondary_alt",
                    AVATAR_PROFILE_PHOTO_STYLES[size].content,
                )}
            >
                {placeholder || <User01 className={cx("text-fg-quaternary", AVATAR_PROFILE_PHOTO_STYLES[size].icon)} />}
            </div>
        );
    };

    const renderBadgeContent = () => {
        if (status) {
            return (
                <AvatarOnlineIndicator status={status} size={AVATAR_PROFILE_PHOTO_TICK_SIZE_MAP[size]} className={AVATAR_PROFILE_PHOTO_STYLES[size].badge} />
            );
        }

        if (verified) {
            return <VerifiedTick size={AVATAR_PROFILE_PHOTO_TICK_SIZE_MAP[size]} className={cx("absolute", AVATAR_PROFILE_PHOTO_STYLES[size].badge)} />;
        }

        return badge;
    };

    return (
        <div
            className={cx(
                "relative flex shrink-0 items-center justify-center rounded-full bg-primary ring-1 ring-secondary_alt",
                AVATAR_PROFILE_PHOTO_STYLES[size].root,
                (!src || isFailed) && AVATAR_PROFILE_PHOTO_STYLES[size].rootWithPlaceholder,
                className,
            )}
        >
            {renderMainContent()}
            {renderBadgeContent()}
        </div>
    );
};
