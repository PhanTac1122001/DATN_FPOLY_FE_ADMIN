"use client";

import React, { useCallback, useRef, useState } from "react";
import { ChevronDown, X } from "@untitledui/icons";
import { usePreventScroll } from "react-aria";
import { Group as AriaGroup, Input as AriaInput } from "react-aria-components";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { HintText } from "@/components/base/input/hint-text";
import { Label } from "@/components/base/input/label";
import {
    MULTI_COMBOBOX_BLUR_DELAY_MS,
    MULTI_COMBOBOX_GAP,
    MULTI_COMBOBOX_MAX_HEIGHT_MD,
    MULTI_COMBOBOX_MAX_HEIGHT_SM,
    SELECT_SIZES,
} from "@/constants/base-components.constants";
import { COMBOBOX_SEARCH_DEBOUNCE_MS } from "@/constants/debounce.constants";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { useResizeObserver } from "@/hooks/use-resize-observer";
// Import types for internal use
import type { MultiComboBoxProps } from "@/types/base-components.types";
import { cx } from "@/utils/cx";
import { SelectContext } from "./select-context";

// Re-export type from centralized location
export type { MultiComboBoxProps } from "@/types/base-components.types";

export const MultiComboBox = ({
    placeholder = "Search and select",
    size = "sm",
    children: _children,
    items = [],
    selectedKeys = [],
    onSelectionChange,
    onInputChange,
    inputValue: controlledInputValue,
    label,
    hint,
    tooltip,
    isRequired,
    isDisabled,
    isInvalid,
    enableServerFilter = false,
    popoverClassName,
    showCheckbox = true,
    onLoadMore,
    isLoadingMore,
    hasNextPage,
    isLoading,
    scrollTagsOnMobile = false,
    debounceMs,
}: MultiComboBoxProps) => {
    const placeholderRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [internalInputValue, setInternalInputValue] = useState("");
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

    const inputValue = controlledInputValue !== undefined ? controlledInputValue : internalInputValue;

    // Prevent background scrolling when MultiComboBox dropdown is open
    usePreventScroll({ isDisabled: !isOpen });

    // Auto-enable debounce when server filtering is enabled.
    // Callers can override with debounceMs={0} to disable or a custom value.
    const resolvedDebounceMs = debounceMs ?? (enableServerFilter ? COMBOBOX_SEARCH_DEBOUNCE_MS : 0);
    const isDebounceEnabled = resolvedDebounceMs > 0;

    // Debounced version of onInputChange for server-side filtering
    const debouncedOnInputChange = useDebouncedCallback((value: string) => {
        onInputChange?.(value);
    }, resolvedDebounceMs);

    const handleInputChange = (value: string) => {
        if (controlledInputValue === undefined) {
            setInternalInputValue(value);
        }
        // Only call onInputChange if server filtering is enabled
        if (enableServerFilter) {
            if (isDebounceEnabled) {
                debouncedOnInputChange(value);
            } else {
                onInputChange?.(value);
            }
        }
        if (!isOpen) {
            setIsOpen(true);
        }
    };

    // Get selected items
    const selectedItems = items.filter((item) => selectedKeys.includes(item.id));

    // Filter items based on input (only if client-side filtering)
    const filteredItems = enableServerFilter
        ? items // Use items as-is if server filtering
        : items.filter((item) => {
              if (!inputValue) return true;
              return item.label?.toLowerCase().includes(inputValue.toLowerCase());
          });

    // Handle item removal
    const handleRemoveItem = (id: string) => {
        const newSelectedKeys = selectedKeys.filter((key) => key !== id);
        onSelectionChange?.(newSelectedKeys);
    };

    /**
     * Calculate fixed dropdown position from the trigger element rect.
     * Smart positioning: opens upward if there is not enough space below in the viewport.
     * When opening upward, uses CSS `bottom` anchor so the dropdown stays flush with the
     * trigger regardless of actual dropdown height — no need to know content height upfront.
     */
    const calculateDropdownPosition = useCallback(() => {
        if (!placeholderRef.current) return;
        const rect = placeholderRef.current.getBoundingClientRect();
        const dropdownMaxHeight = size === "md" ? MULTI_COMBOBOX_MAX_HEIGHT_MD : MULTI_COMBOBOX_MAX_HEIGHT_SM;
        const gap = MULTI_COMBOBOX_GAP;
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const spaceBelow = viewportHeight - rect.bottom - gap;
        const spaceAbove = rect.top - gap;

        // Clamp left so dropdown doesn't overflow the right edge of the screen
        const clampedLeft = Math.min(rect.left, viewportWidth - rect.width - gap);
        const width = rect.width + "px";

        if (spaceBelow >= dropdownMaxHeight || spaceBelow >= spaceAbove) {
            // Enough space below — open downward, anchor top of dropdown to bottom of trigger
            setDropdownStyle({ width, top: rect.bottom + gap, left: clampedLeft, bottom: undefined });
        } else {
            // Not enough space below, more space above — open upward
            // Anchor the BOTTOM of the dropdown to the TOP of the trigger
            setDropdownStyle({ width, bottom: viewportHeight - rect.top + gap, left: clampedLeft, top: undefined });
        }
    }, [size]);

    const onResize = useCallback(() => {
        if (isOpen) {
            calculateDropdownPosition();
        }
    }, [isOpen, calculateDropdownPosition]);

    useResizeObserver({
        ref: placeholderRef,
        box: "border-box",
        onResize,
    });

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const scrollThreshold = 20;
        const isNearBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + scrollThreshold; // 20px threshold
        if (isNearBottom && hasNextPage && !isLoadingMore) {
            onLoadMore?.();
        }
    };

    return (
        <SelectContext.Provider value={{ size }}>
            <div className="flex flex-col gap-1.5">
                {label && (
                    <Label isRequired={isRequired} tooltip={tooltip}>
                        {label}
                    </Label>
                )}

                <div className="relative" ref={placeholderRef}>
                    <AriaGroup
                        className={cx(
                            "relative flex w-full items-center gap-2 rounded-full bg-primary shadow-xs ring-1 ring-primary outline-hidden transition-shadow duration-100 ease-linear ring-inset",
                            isDisabled && "cursor-not-allowed bg-disabled_subtle ring-disabled",
                            isOpen && !isDisabled && !isInvalid && "custom-input-focus ring-2 ring-brand",
                            isInvalid && "ring-error_subtle",
                            isInvalid && isOpen && "custom-input-focus ring-2 ring-error",
                            SELECT_SIZES[size].root,
                        )}
                    >
                        <div
                            className={cx(
                                "flex w-full min-w-0 items-center gap-1.5",
                                scrollTagsOnMobile ? "scrollbar-hide flex-nowrap overflow-x-auto sm:flex-wrap" : "flex-wrap",
                            )}
                        >
                            {/* Selected items as chips */}
                            {selectedItems.map((item) => (
                                <div
                                    key={item.id}
                                    className={cx(
                                        "flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-sm text-gray-700",
                                        scrollTagsOnMobile && "shrink-0",
                                    )}
                                >
                                    <span className="">{item.label}</span>
                                    {!isDisabled && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveItem(item.id);
                                            }}
                                            className="transition-colors hover:text-red-500"
                                        >
                                            <X className="size-3.5 stroke-[2px]" />
                                        </button>
                                    )}
                                </div>
                            ))}

                            {/* Input field */}
                            <div className="relative min-w-[20px] flex-1">
                                <AriaInput
                                    value={inputValue}
                                    onChange={(e) => handleInputChange(e.target.value)}
                                    onFocus={() => {
                                        calculateDropdownPosition();
                                        setIsOpen(true);
                                    }}
                                    onBlur={() => {
                                        // Delay closing to allow click on items
                                        setTimeout(() => setIsOpen(false), MULTI_COMBOBOX_BLUR_DELAY_MS);
                                    }}
                                    placeholder={selectedItems.length === 0 ? placeholder : undefined}
                                    disabled={isDisabled}
                                    className="w-full appearance-none border-none bg-transparent text-md text-primary caret-alpha-black/90 ring-0 outline-none placeholder:text-placeholder focus:ring-0 focus:outline-none disabled:cursor-not-allowed disabled:text-disabled disabled:placeholder:text-disabled"
                                />
                            </div>

                            {/* Dropdown button */}
                            <button
                                type="button"
                                onClick={() => {
                                    if (!isOpen) {
                                        calculateDropdownPosition();
                                    }
                                    setIsOpen(!isOpen);
                                }}
                                disabled={isDisabled}
                                className="shrink-0 outline-none"
                            >
                                <ChevronDown
                                    aria-hidden="true"
                                    className={cx(
                                        "ml-auto shrink-0 text-fg-quaternary transition-transform",
                                        size === "sm" ? "size-4 stroke-[2.5px]" : "size-5",
                                        isOpen && "rotate-180",
                                    )}
                                />
                            </button>
                        </div>
                    </AriaGroup>

                    {/* Dropdown list — fixed positioning to escape modal overflow clipping, smart direction */}
                    {isOpen && !isDisabled && (filteredItems.length > 0 || isLoading || isLoadingMore) && (
                        <div
                            className={cx(
                                "custom-scrollbar fixed z-[9999] max-h-64 overflow-y-auto rounded-2xl bg-white py-1 shadow-lg ring-1 ring-slate-200 outline-hidden",
                                size === "md" && "max-h-80",
                                popoverClassName,
                            )}
                            style={dropdownStyle}
                            onMouseDown={(e) => {
                                // Prevent input blur when clicking items
                                e.preventDefault();
                            }}
                            onScroll={handleScroll}
                        >
                            {filteredItems.map((item) => {
                                const isSelected = selectedKeys.includes(item.id);

                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => {
                                            const newSelectedKeys = isSelected ? selectedKeys.filter((key) => key !== item.id) : [...selectedKeys, item.id];
                                            onSelectionChange?.(newSelectedKeys);
                                            handleInputChange("");
                                        }}
                                        className={cx(
                                            "relative flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors outline-none",
                                            isSelected ? "bg-brand-50 text-brand-700" : "text-gray-700 hover:bg-gray-50",
                                            item.isDisabled && "cursor-not-allowed opacity-50",
                                        )}
                                    >
                                        {/* Checkbox indicator */}
                                        {showCheckbox && (
                                            <div
                                                className={cx(
                                                    "flex size-4 shrink-0 items-center justify-center rounded border-2",
                                                    isSelected ? "border-brand-600 bg-brand-600" : "border-gray-300",
                                                )}
                                            >
                                                {isSelected && (
                                                    <svg className="size-3 text-white" viewBox="0 0 12 12" fill="none">
                                                        <path
                                                            d="M10 3L4.5 8.5L2 6"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                )}
                                            </div>
                                        )}
                                        <span className="flex-1">{item.label}</span>
                                    </div>
                                );
                            })}
                            {(isLoading || isLoadingMore) && (
                                <div className="flex w-full items-center justify-center p-3">
                                    <LoadingIndicator size="sm" />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {hint && <HintText isInvalid={isInvalid}>{hint}</HintText>}
            </div>
        </SelectContext.Provider>
    );
};
