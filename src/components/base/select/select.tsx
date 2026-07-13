"use client";

import { createElement, isValidElement, useCallback, useEffect, useRef } from "react";
import type { ComponentType } from "react";
import { ChevronDown, XClose } from "@untitledui/icons";
import { Button as AriaButton, ListBox as AriaListBox, Select as AriaSelect, SelectValue as AriaSelectValue } from "react-aria-components";
import { Avatar } from "@/components/base/avatar/avatar";
import { HintText } from "@/components/base/input/hint-text";
import { Label } from "@/components/base/input/label";
import { SELECT_SIZES } from "@/constants/base-components.constants";
import type { SelectCommonProps, SelectItemType, SelectProps, SelectValueProps } from "@/types/base-components.types";
import { cx } from "@/utils/cx";
import { isReactComponent } from "@/utils/is-react-component";
import { ComboBox } from "./combobox";
import { MultiComboBox } from "./multi-combobox";
import { Popover } from "./popover";
import { SelectContext } from "./select-context";
import { SelectItem } from "./select-item";

export type { SelectItemType, SelectCommonProps as CommonProps, SelectProps, SelectValueProps };

const SelectValue = ({
    isOpen,
    isFocused,
    isDisabled,
    isInvalid,
    size,
    placeholder,
    placeholderIcon,
    trailingIcon,
    isClearable,
    onClear,
    ref,
}: SelectValueProps) => {
    return (
        <AriaButton
            ref={ref}
            className={cx(
                "relative flex w-full cursor-pointer items-center rounded-full bg-primary shadow-xs ring-1 ring-primary outline-hidden transition duration-100 ease-linear ring-inset",
                (isFocused || isOpen) && !isDisabled && !isInvalid && "custom-input-focus ring-2 ring-brand",
                isDisabled && "cursor-not-allowed bg-disabled_subtle text-disabled",
                isInvalid && "ring-error_subtle",
                isInvalid && (isFocused || isOpen) && "custom-input-focus ring-2 ring-error",
            )}
        >
            <AriaSelectValue<SelectItemType>
                className={cx(
                    "flex h-max w-full items-center justify-start gap-2 truncate text-left align-middle",

                    // Icon styles
                    "*:data-icon:size-5 *:data-icon:shrink-0 *:data-icon:text-fg-quaternary in-disabled:*:data-icon:text-fg-disabled",

                    SELECT_SIZES[size].root,
                )}
            >
                {(state) => {
                    const Icon = state.selectedItem?.icon || placeholderIcon;
                    return (
                        <>
                            {state.selectedItem?.avatarUrl ? (
                                <Avatar size="xs" src={state.selectedItem.avatarUrl} alt={state.selectedItem.label} />
                            ) : isReactComponent(Icon) ? (
                                <Icon data-icon aria-hidden="true" />
                            ) : isValidElement(Icon) ? (
                                Icon
                            ) : null}

                            {state.selectedItem ? (
                                <section className="flex w-full min-w-0 flex-1 items-center gap-2">
                                    <p className="block min-w-0 truncate">{state.selectedItem?.label}</p>
                                    {state.selectedItem?.supportingText && (
                                        <p className="block min-w-0 truncate text-md text-tertiary">{state.selectedItem?.supportingText}</p>
                                    )}
                                </section>
                            ) : (
                                <p className={cx("block min-w-0 flex-1 truncate text-md text-placeholder", isDisabled && "text-disabled")}>{placeholder}</p>
                            )}

                            {isClearable && state.selectedItem && !isDisabled ? (
                                <span
                                    role="button"
                                    aria-label="Clear selection"
                                    className="ml-auto shrink-0 cursor-pointer rounded-full p-0.5 text-fg-quaternary transition-colors hover:bg-gray-100 hover:text-fg-secondary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        onClear?.();
                                    }}
                                    onPointerDown={(e) => {
                                        // Prevent the AriaButton from opening the popover
                                        e.stopPropagation();
                                        e.preventDefault();
                                    }}
                                >
                                    <XClose aria-hidden="true" className={size === "sm" ? "size-4 stroke-[2.5px]" : "size-5"} />
                                </span>
                            ) : trailingIcon ? (
                                isReactComponent(trailingIcon) ? (
                                    // If trailingIcon is a component, render it
                                    <span className="ml-auto shrink-0">
                                        {createElement(trailingIcon as ComponentType<{ "aria-hidden": boolean }>, { "aria-hidden": true })}
                                    </span>
                                ) : (
                                    // If trailingIcon is an element/node, render directly
                                    <span className="ml-auto shrink-0">{trailingIcon}</span>
                                )
                            ) : (
                                <ChevronDown
                                    aria-hidden="true"
                                    className={cx("ml-auto shrink-0 text-fg-quaternary", size === "sm" ? "size-4 stroke-[2.5px]" : "size-5")}
                                />
                            )}
                        </>
                    );
                }}
            </AriaSelectValue>
        </AriaButton>
    );
};

export { SelectContext };

const Select = ({
    placeholder = "Select",
    placeholderIcon,
    size = "sm",
    children,
    items,
    label,
    hint,
    tooltip,
    className,
    isInvalid,
    trailingIcon,
    isClearable = true,
    matchTriggerWidth = true,
    validationBehavior = "aria",
    ...rest
}: SelectProps) => {
    const onSelectionChangeRef = useRef(rest.onSelectionChange);
    useEffect(() => {
        onSelectionChangeRef.current = rest.onSelectionChange;
    }, [rest.onSelectionChange]);

    const handleSelectionChange = useCallback((key: string | number | null) => {
        onSelectionChangeRef.current?.((key === null ? undefined : key) as never);
    }, []);

    return (
        <SelectContext.Provider value={{ size }}>
            <AriaSelect
                validationBehavior={validationBehavior}
                {...rest}
                onSelectionChange={handleSelectionChange}
                isInvalid={isInvalid}
                className={(state) => cx("flex flex-col gap-1.5", typeof className === "function" ? className(state) : className)}
            >
                {(state) => (
                    <>
                        {label && (
                            <Label isRequired={state.isRequired} tooltip={tooltip}>
                                {label}
                            </Label>
                        )}

                        <SelectValue
                            {...state}
                            isInvalid={state.isInvalid || false}
                            size={size}
                            placeholder={placeholder}
                            placeholderIcon={placeholderIcon}
                            trailingIcon={trailingIcon}
                            isClearable={isClearable}
                            onClear={() => {
                                handleSelectionChange(null);
                            }}
                        />

                        <Popover size={size} className={rest.popoverClassName} matchTriggerWidth={matchTriggerWidth}>
                            <AriaListBox items={items} className="size-full outline-hidden">
                                {children}
                            </AriaListBox>
                        </Popover>

                        {hint && <HintText isInvalid={state.isInvalid}>{hint}</HintText>}
                    </>
                )}
            </AriaSelect>
        </SelectContext.Provider>
    );
};

const _Select = Select as typeof Select & {
    ComboBox: typeof ComboBox;
    MultiComboBox: typeof MultiComboBox;
    Item: typeof SelectItem;
};
_Select.ComboBox = ComboBox;
_Select.MultiComboBox = MultiComboBox;
_Select.Item = SelectItem;

export { _Select as Select };
