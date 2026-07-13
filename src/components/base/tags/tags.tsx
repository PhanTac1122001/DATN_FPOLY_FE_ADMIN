"use client";

import { type PropsWithChildren, createContext, useContext } from "react";
import { Tag as AriaTag, TagGroup as AriaTagGroup, TagList as AriaTagList } from "react-aria-components";
import { Avatar } from "@/components/base/avatar/avatar";
import { Dot } from "@/components/foundations/dot-icon";
import { TAG_STYLES } from "@/constants/base-components.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import type { TagGroupProps, TagItem, TagProps } from "@/types/base-components.types";
import { cx } from "@/utils/cx";
import { TagCheckbox } from "./base-components/tag-checkbox";
import { TagCloseX } from "./base-components/tag-close-x";

export type { TagItem };

const TagGroupContext = createContext<{
    selectionMode: "none" | "single" | "multiple";
    size: "sm" | "md" | "lg";
}>({
    selectionMode: "none",
    size: "sm",
});

export const TagGroup = ({ label, selectionMode = "none", size = "sm", children, ...otherProps }: TagGroupProps) => {
    return (
        <TagGroupContext.Provider value={{ selectionMode, size }}>
            <AriaTagGroup aria-label={label} selectionMode={selectionMode} disallowEmptySelection={selectionMode === "single"} {...otherProps}>
                {children}
            </AriaTagGroup>
        </TagGroupContext.Provider>
    );
};

export const TagList = AriaTagList;

export const Tag = ({
    id,
    avatarSrc,
    avatarContrastBorder,
    dot,
    dotClassName,
    isDisabled,
    count,
    className,
    children,
    onClose,
}: PropsWithChildren<TagProps>) => {
    const context = useContext(TagGroupContext);

    const leadingContent = avatarSrc ? (
        <Avatar size="xxs" src={avatarSrc} alt={UI_TEXT.common.icons.userAvatarAlt} contrastBorder={avatarContrastBorder} />
    ) : dot ? (
        <Dot className={cx("text-fg-success-secondary", dotClassName)} size="sm" />
    ) : null;

    return (
        <AriaTag
            id={id}
            isDisabled={isDisabled}
            textValue={typeof children === "string" ? children : undefined}
            className={(state) =>
                cx(
                    "flex cursor-default items-center gap-0.75 rounded-md bg-primary text-secondary ring-1 ring-primary ring-inset focus:outline-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring",
                    TAG_STYLES[context.size].root.base,

                    // With avatar
                    avatarSrc && TAG_STYLES[context.size].root.withAvatar,
                    // With X button
                    (onClose || state.allowsRemoving) && TAG_STYLES[context.size].root.withClose,
                    // With dot
                    dot && TAG_STYLES[context.size].root.withDot,
                    // With count
                    typeof count === "number" && TAG_STYLES[context.size].root.withCount,
                    // With checkbox
                    context.selectionMode !== "none" && TAG_STYLES[context.size].root.withCheckbox,
                    // Disabled
                    isDisabled && "cursor-not-allowed",

                    typeof className === "function" ? className(state) : className,
                )
            }
        >
            {({ isSelected, isDisabled, allowsRemoving }) => (
                <>
                    <div className={cx("flex items-center gap-1", TAG_STYLES[context.size].content)}>
                        {context.selectionMode !== "none" && <TagCheckbox size={context.size} isSelected={isSelected} isDisabled={isDisabled} />}

                        {leadingContent}

                        {children}

                        {typeof count === "number" && (
                            <span className={cx("flex items-center justify-center rounded-[3px] bg-tertiary text-center", TAG_STYLES[context.size].count)}>
                                {count}
                            </span>
                        )}
                    </div>

                    {(onClose || allowsRemoving) && <TagCloseX size={context.size} onPress={() => id && onClose?.(id.toString())} />}
                </>
            )}
        </AriaTag>
    );
};
