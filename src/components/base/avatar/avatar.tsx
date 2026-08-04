"use client";

import { forwardRef, useState } from "react";
import { User01 } from "@untitledui/icons";
import Image from "next/image";
import { AVATAR_STYLES } from "@/constants/base-components.constants";
import type { AvatarProps } from "@/types/base-components.types";
import { cx } from "@/utils/cx";
import { AvatarOnlineIndicator, VerifiedTick } from "./base-components";

export type { AvatarProps };

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
    (
        {
            contrastBorder = true,
            size = "md",
            src,
            alt,
            initials,
            placeholder,
            placeholderIcon: PlaceholderIcon,
            badge,
            status,
            verified,
            focusable = false,
            className,
            ...props
        },
        ref,
    ) => {
        const [isFailed, setIsFailed] = useState(false);

        const isValidUrl = (url?: string) => {
            if (!url) return false;
            if (url.startsWith("https://.") || url.startsWith("http://.")) return false;
            return true;
        };

        const renderMainContent = () => {
            if (src && isValidUrl(src) && !isFailed) {
                return (
                    <Image data-avatar-img className="rounded-full object-cover" src={src} alt={alt || ""} onError={() => setIsFailed(true)} unoptimized fill />
                );
            }

            if (initials) {
                return <span className={cx("text-quaternary", AVATAR_STYLES[size].initials)}>{initials}</span>;
            }

            if (PlaceholderIcon) {
                return <PlaceholderIcon className={cx("text-fg-quaternary", AVATAR_STYLES[size].icon)} />;
            }

            return placeholder || <User01 className={cx("text-fg-quaternary", AVATAR_STYLES[size].icon)} />;
        };

        const renderBadgeContent = () => {
            if (status) {
                return <AvatarOnlineIndicator status={status} size={size === "xxs" ? "xs" : size} />;
            }

            if (verified) {
                return (
                    <VerifiedTick
                        size={size === "xxs" ? "xs" : size}
                        className={cx("absolute right-0 bottom-0", (size === "xxs" || size === "xs") && "-right-px -bottom-px")}
                    />
                );
            }

            return badge;
        };

        return (
            <div
                ref={ref}
                data-avatar
                className={cx(
                    "relative inline-flex shrink-0 items-center justify-center rounded-full bg-avatar-bg outline-transparent",
                    // Focus styles
                    focusable && "group-outline-focus-ring group-focus-visible:outline-2 group-focus-visible:outline-offset-2",
                    contrastBorder && "outline outline-avatar-contrast-border",
                    AVATAR_STYLES[size].root,
                    className,
                )}
                {...props}
            >
                {renderMainContent()}
                {renderBadgeContent()}
            </div>
        );
    },
);

Avatar.displayName = "Avatar";
