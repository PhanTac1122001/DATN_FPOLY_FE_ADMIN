"use client";

import { Children, isValidElement, useContext } from "react";
import { ListBoxItem as AriaListBoxItem, Text as AriaText } from "react-aria-components";
import { Avatar } from "@/components/base/avatar/avatar";
import { SELECT_ITEM_SIZES } from "@/constants/base-components.constants";
import type { SelectItemProps } from "@/types/base-components.types";
import { cx } from "@/utils/cx";
import { isReactComponent } from "@/utils/is-react-component";
import { SelectContext } from "./select-context";

export type { SelectItemProps };

export const SelectItem = ({
    label,
    id,
    value,
    avatarUrl,
    supportingText,
    isDisabled,
    icon: Icon,
    className,
    children,
    textValue: propTextValue,
    ...props
}: SelectItemProps) => {
    const { size } = useContext(SelectContext);

    const labelOrChildren =
        label ||
        (typeof children === "string" || typeof children === "number"
            ? String(children)
            : typeof children === "function"
              ? ""
              : Children.toArray(children as React.ReactNode)
                    .map((child) => (typeof child === "string" || typeof child === "number" ? String(child) : ""))
                    .join(""));
    const textValue = propTextValue ?? (supportingText ? labelOrChildren + " " + supportingText : labelOrChildren);

    return (
        <AriaListBoxItem
            id={id}
            value={
                value ?? {
                    id,
                    label: labelOrChildren,
                    avatarUrl,
                    supportingText,
                    isDisabled,
                    icon: Icon,
                }
            }
            textValue={textValue}
            isDisabled={isDisabled}
            {...props}
            className={(state) => cx("w-full outline-hidden", typeof className === "function" ? className(state) : className)}
        >
            {(state) => (
                <div
                    className={cx(
                        "flex cursor-pointer items-center gap-2 text-md font-medium text-slate-800 outline-hidden transition-colors select-none",
                        (state.isSelected || state.isFocused) && "bg-wine/10 font-bold text-wine",
                        state.isDisabled && "cursor-not-allowed opacity-50",

                        // Icon styles
                        "*:data-icon:size-4 *:data-icon:shrink-0 *:data-icon:text-fg-quaternary",
                        state.isDisabled && "*:data-icon:text-fg-disabled",

                        SELECT_ITEM_SIZES[size],
                    )}
                >
                    {avatarUrl ? (
                        <Avatar aria-hidden="true" size="xs" src={avatarUrl} alt={label} />
                    ) : isReactComponent(Icon) ? (
                        <Icon data-icon aria-hidden="true" />
                    ) : isValidElement(Icon) ? (
                        Icon
                    ) : null}

                    <div className="flex w-full min-w-0 flex-1 flex-wrap gap-x-2">
                        <AriaText slot="label" className={cx("truncate text-md font-medium whitespace-nowrap", state.isDisabled && "text-disabled")}>
                            {label || (typeof children === "function" ? children(state) : children)}
                        </AriaText>

                        {supportingText && (
                            <AriaText slot="description" className={cx("text-sm whitespace-nowrap text-slate-500", state.isDisabled && "text-disabled")}>
                                {supportingText}
                            </AriaText>
                        )}
                    </div>
                </div>
            )}
        </AriaListBoxItem>
    );
};
