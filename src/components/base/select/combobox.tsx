"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { ChevronDown, XClose } from "@untitledui/icons";
import { usePreventScroll } from "react-aria";
import { ComboBox as AriaComboBox, Group as AriaGroup, Input as AriaInput, ListBox as AriaListBox, ComboBoxStateContext } from "react-aria-components";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { HintText } from "@/components/base/input/hint-text";
import { Label } from "@/components/base/input/label";
import { Popover } from "@/components/base/select/popover";
import { NoData } from "@/components/icons/no-data";
import { SELECT_SIZES } from "@/constants/base-components.constants";
import { COMBOBOX_SEARCH_DEBOUNCE_MS } from "@/constants/debounce.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { useResizeObserver } from "@/hooks/use-resize-observer";
// Import types for internal use
import type { ComboBoxProps, ComboBoxValueProps } from "@/types/base-components.types";
import { cx } from "@/utils/cx";
import { SelectContext } from "./select-context";
import { SelectItem } from "./select-item";

// Re-export types from centralized location
export type { ComboBoxProps, ComboBoxValueProps } from "@/types/base-components.types";

const ScrollLock = ({ isOpen }: { isOpen: boolean }) => {
    usePreventScroll({ isDisabled: !isOpen });
    return null;
};

const ComboBoxValue = ({ size, shortcut, placeholder, shortcutClassName, isClearable, onClear, ...otherProps }: ComboBoxValueProps) => {
    const state = useContext(ComboBoxStateContext);

    const value = state?.selectedItem?.value || null;
    const inputValue = state?.inputValue || null;
    const hasSelection = state?.selectedItem !== null && state?.selectedItem !== undefined;

    const first = inputValue?.split(value?.supportingText)?.[0] || "";
    const last = inputValue?.split(first)[1];

    return (
        <AriaGroup
            {...otherProps}
            className={({ isFocusWithin, isDisabled, isInvalid }) =>
                cx(
                    "relative flex w-full items-center gap-2 rounded-full bg-primary shadow-xs ring-1 ring-primary outline-hidden transition-shadow duration-100 ease-linear ring-inset",
                    isDisabled && "cursor-not-allowed bg-disabled_subtle ring-disabled",
                    isFocusWithin && !isDisabled && !isInvalid && "custom-input-focus ring-2 ring-brand",
                    isInvalid && "ring-error_subtle",
                    isInvalid && isFocusWithin && "custom-input-focus ring-2 ring-error",
                    SELECT_SIZES[size].root,
                )
            }
        >
            {({ isDisabled }) => (
                <>
                    <div className="relative flex w-full items-center gap-2">
                        {inputValue && (
                            <span className="absolute top-1/2 z-0 inline-flex w-full -translate-y-1/2 gap-2 truncate" aria-hidden="true">
                                <p className={cx("text-md text-primary", isDisabled && "text-disabled")}>{first}</p>
                                {last && <p className={cx("-ml-0.75 text-md text-tertiary", isDisabled && "text-disabled")}>{last}</p>}
                            </span>
                        )}

                        <AriaInput
                            placeholder={placeholder}
                            className="z-10 w-full appearance-none border-none bg-transparent text-md text-transparent caret-alpha-black/90 ring-0 outline-none placeholder:text-placeholder focus:ring-0 focus:outline-none disabled:cursor-not-allowed disabled:text-disabled disabled:placeholder:text-disabled"
                        />
                    </div>

                    {isClearable && hasSelection && !isDisabled ? (
                        <div
                            className={cx(
                                "absolute inset-y-0.5 right-0.5 z-10 flex items-center rounded-r-[inherit] bg-linear-to-r from-transparent to-bg-primary to-40% pl-8",
                                isDisabled && "to-bg-disabled_subtle",
                                SELECT_SIZES[size].shortcut,
                                shortcutClassName,
                            )}
                        >
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
                                    e.stopPropagation();
                                    e.preventDefault();
                                }}
                            >
                                <XClose aria-hidden="true" className={size === "sm" ? "size-4 stroke-[2.5px]" : "size-5"} />
                            </span>
                        </div>
                    ) : (
                        shortcut && (
                            <div
                                className={cx(
                                    "absolute inset-y-0.5 right-0.5 z-10 flex items-center rounded-r-[inherit] bg-linear-to-r from-transparent to-bg-primary to-40% pl-8",
                                    isDisabled && "to-bg-disabled_subtle",
                                    SELECT_SIZES[size].shortcut,
                                    shortcutClassName,
                                )}
                            >
                                <ChevronDown
                                    aria-hidden="true"
                                    className={cx("ml-auto shrink-0 text-fg-quaternary", size === "sm" ? "size-4 stroke-[2.5px]" : "size-5")}
                                />
                            </div>
                        )
                    )}
                </>
            )}
        </AriaGroup>
    );
};

const ComboBox = ({
    placeholder = "Search",
    shortcut = true,
    size = "sm",
    children,
    items,
    shortcutClassName,
    isLoading,
    onLoadMore,
    isLoadingMore,
    hasNextPage,
    allowsEmptyCollection = true,
    isClearable = true,
    debounceMs,
    validationBehavior = "aria",
    defaultFilter,
    ...otherProps
}: ComboBoxProps) => {
    const placeholderRef = useRef<HTMLDivElement>(null);
    const [popoverWidth, setPopoverWidth] = useState("");

    // Auto-enable debounce when inputValue is controlled (server-side search pattern).
    // Callers can override with debounceMs={0} to disable or a custom value.
    const isControlled = otherProps.inputValue !== undefined;
    const resolvedDebounceMs = debounceMs ?? (isControlled ? COMBOBOX_SEARCH_DEBOUNCE_MS : 0);
    const isDebounceEnabled = resolvedDebounceMs > 0;

    // --- Debounce support ---
    // When debounce is enabled, we maintain an internal input value that updates immediately
    // for responsive typing, while the onInputChange callback to the parent is debounced.
    const [internalInputValue, setInternalInputValue] = useState(otherProps.inputValue ?? "");

    // Refs for parent callbacks (avoid stale closures in useCallback)
    const onInputChangeRef = useRef(otherProps.onInputChange);
    const onSelectionChangeRef = useRef(otherProps.onSelectionChange);

    useEffect(() => {
        onInputChangeRef.current = otherProps.onInputChange;
    }, [otherProps.onInputChange]);

    useEffect(() => {
        onSelectionChangeRef.current = otherProps.onSelectionChange;
    }, [otherProps.onSelectionChange]);

    // Debounce timer managed directly to support flush-on-selection
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        };
    }, []);

    // Sync internal value when the parent's controlled inputValue changes externally
    // (e.g. on selection change, or reset)
    const parentInputValue = otherProps.inputValue;
    useEffect(() => {
        if (isDebounceEnabled && parentInputValue !== undefined) {
            setInternalInputValue(parentInputValue);
        }
    }, [parentInputValue, isDebounceEnabled]);
    const [lastSelectedLabel, setLastSelectedLabel] = useState<string>("");

    useEffect(() => {
        if (otherProps.selectedKey && items) {
            const selectedItem = items.find((item) => String(item.id) === String(otherProps.selectedKey));
            if (selectedItem?.label) {
                setLastSelectedLabel(selectedItem.label);
            }
        } else if (!otherProps.selectedKey) {
            setLastSelectedLabel("");
        }
    }, [otherProps.selectedKey, items]);

    // Wrapped onSelectionChange: looks up the selected item's label and flushes input change immediately
    const handleSelectionChange = useCallback(
        (key: string | number | null) => {
            if (key !== null) {
                const selectedItem = items?.find((item) => String(item.id) === String(key));
                if (selectedItem && selectedItem.label) {
                    setLastSelectedLabel(selectedItem.label);
                    if (debounceTimerRef.current) {
                        clearTimeout(debounceTimerRef.current);
                        debounceTimerRef.current = null;
                    }
                    setInternalInputValue(selectedItem.label);
                    onInputChangeRef.current?.(selectedItem.label);
                }
            } else {
                setLastSelectedLabel("");
            }
            onSelectionChangeRef.current?.((key === null ? undefined : key) as never);
        },
        [items],
    );

    // Wrapped onInputChange: debounces typing
    const handleInputChange = useCallback(
        (value: string) => {
            setInternalInputValue(value);

            if (otherProps.selectedKey && lastSelectedLabel && lastSelectedLabel !== value) {
                setLastSelectedLabel("");
                onSelectionChangeRef.current?.(undefined as never);
            }

            // Cancel any pending debounced call
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
                debounceTimerRef.current = null;
            }

            // Typing-triggered: debounce
            debounceTimerRef.current = setTimeout(() => {
                onInputChangeRef.current?.(value);
            }, resolvedDebounceMs);
        },
        [resolvedDebounceMs, otherProps.selectedKey, lastSelectedLabel],
    );

    // Resize observer for popover width
    const onResize = useCallback(() => {
        if (!placeholderRef.current) return;

        const divRect = placeholderRef.current?.getBoundingClientRect();

        setPopoverWidth(divRect.width + "px");
    }, [placeholderRef, setPopoverWidth]);

    useResizeObserver({
        ref: placeholderRef,
        box: "border-box",
        onResize,
    });

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const scrollThreshold = 20;
        const isNearBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + scrollThreshold; // 20px threshold
        if (isNearBottom && hasNextPage && !isLoadingMore && !isLoading) {
            onLoadMore?.();
        }
    };

    return (
        <SelectContext.Provider value={{ size }}>
            <AriaComboBox
                validationBehavior={validationBehavior}
                menuTrigger="focus"
                allowsEmptyCollection={allowsEmptyCollection}
                defaultFilter={defaultFilter ?? (isControlled ? () => true : undefined)}
                {...otherProps}
                onSelectionChange={handleSelectionChange}
                {...(isDebounceEnabled && {
                    inputValue: internalInputValue,
                    onInputChange: handleInputChange,
                })}
            >
                {(state) => (
                    <div className="flex flex-col gap-1.5">
                        <ScrollLock isOpen={state.isOpen} />

                        {otherProps.label && (
                            <Label isRequired={state.isRequired} tooltip={otherProps.tooltip}>
                                {otherProps.label}
                            </Label>
                        )}

                        <ComboBoxValue
                            ref={placeholderRef}
                            placeholder={placeholder}
                            shortcut={shortcut}
                            shortcutClassName={shortcutClassName}
                            size={size}
                            isClearable={isClearable}
                            onClear={() => {
                                // Reset selection and input value
                                if (isDebounceEnabled) {
                                    setInternalInputValue("");
                                    onInputChangeRef.current?.("");
                                }
                                handleSelectionChange(null);
                                otherProps.onInputChange?.("");
                            }}
                            // This is a workaround to correctly calculating the trigger width
                            // while using ResizeObserver wasn't 100% reliable.
                            onFocus={onResize}
                            onPointerEnter={onResize}
                        />

                        <Popover
                            size={size}
                            triggerRef={placeholderRef}
                            style={{ width: popoverWidth }}
                            className={otherProps.popoverClassName}
                            onScroll={handleScroll}
                        >
                            <AriaListBox
                                items={isLoading ? [] : items}
                                className="size-full outline-hidden"
                                renderEmptyState={() =>
                                    !isLoading ? (
                                        <div className="flex flex-col items-center justify-center gap-2 py-6 text-tertiary">
                                            <NoData className="size-10 opacity-60" />
                                            <p className="text-sm">{UI_TEXT.common.noData}</p>
                                        </div>
                                    ) : null
                                }
                            >
                                {children}
                            </AriaListBox>
                            {(isLoading || isLoadingMore) && (
                                <div className="flex w-full items-center justify-center p-4">
                                    <LoadingIndicator size="sm" />
                                </div>
                            )}
                        </Popover>

                        {otherProps.hint && <HintText isInvalid={state.isInvalid}>{otherProps.hint}</HintText>}
                    </div>
                )}
            </AriaComboBox>
        </SelectContext.Provider>
    );
};

const _ComboBox = ComboBox as typeof ComboBox & {
    Item: typeof SelectItem;
};
_ComboBox.Item = SelectItem;

export { _ComboBox as ComboBox };
