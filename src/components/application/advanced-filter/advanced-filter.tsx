"use client";

import React, { cloneElement, isValidElement, useState } from "react";
import { parseDate } from "@internationalized/date";
import { AddCircle } from "iconsax-react";
import { DateField } from "react-aria-components";
import { DateInput } from "@/components/application/date-picker/date-input";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { XIcon } from "@/components/icons/x-icon";
import { ICON_COLORS } from "@/constants/app.constants";
import { DEFAULT_MAX_CONDITIONS, DROPDOWN_GAP, VIEWPORT_GAP } from "@/constants/application.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import type { AdvancedFilterProps } from "@/types/application.types";
import {
    FilterCondition,
    FilterFieldType,
    FilterOperator,
    FilterState,
    getOperatorsForFieldType,
    operatorRequiresValue,
    operatorSupportsMultipleValues,
} from "@/types/filter.types";
import { SelectFilterInput } from "./select-filter-input";

const t = UI_TEXT.filter;

export function AdvancedFilter({ fields, value, onChange, maxConditions = DEFAULT_MAX_CONDITIONS, trigger }: AdvancedFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    // Local state for filter conditions while menu is open
    // Only applies to parent when menu is closed
    const [localFilterState, setLocalFilterState] = useState<FilterState>(value);

    // Apply filter when menu closes
    const handleCloseMenu = () => {
        setIsOpen(false);
        // Only apply filter if local state is different from current value
        if (JSON.stringify(localFilterState) !== JSON.stringify(value)) {
            onChange(localFilterState);
        }
    };

    const handleApplyFilter = () => {
        setIsOpen(false);
        if (JSON.stringify(localFilterState) !== JSON.stringify(value)) {
            onChange(localFilterState);
        }
    };

    const handleClearFilters = () => {
        const clearedState = { ...localFilterState, conditions: [] };
        setLocalFilterState(clearedState);
        setIsOpen(false);
        onChange(clearedState);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleApplyFilter();
        }
    };

    const handleAddCondition = () => {
        if (localFilterState.conditions.length >= maxConditions) {
            return;
        }

        const newCondition: FilterCondition = {
            id: `condition-${Date.now()}`,
            fieldKey: "",
            operator: FilterOperator.CONTAINS,
            value: null,
        };

        setLocalFilterState({
            ...localFilterState,
            conditions: [...localFilterState.conditions, newCondition],
        });
    };

    const handleRemoveCondition = (conditionId: string) => {
        setLocalFilterState({
            ...localFilterState,
            conditions: localFilterState.conditions.filter((c) => c.id !== conditionId),
        });
    };

    const handleConditionChange = (conditionId: string, updates: Partial<FilterCondition>) => {
        setLocalFilterState({
            ...localFilterState,
            conditions: localFilterState.conditions.map((c) => (c.id === conditionId ? { ...c, ...updates } : c)),
        });
    };

    // Use local state for rendering while menu is open, value prop for display outside
    const displayFilterState = isOpen ? localFilterState : value;

    // Use state for the trigger element to safely pass the ref callback to cloneElement
    // This avoids the 'react-hooks/refs' error about accessing ref.current during render
    const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null);

    // Clone trigger element to inject onClick handler
    const handleTriggerClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isOpen) {
            // Closing menu - apply filter
            handleCloseMenu();
        } else {
            // Opening menu - just open, don't apply filter yet
            // Initialize local state from current props
            setLocalFilterState(value);

            // Calculate position immediately
            const target = triggerElement;
            if (target) {
                const rect = target.getBoundingClientRect();
                // Default position: bottom-start
                let top = rect.bottom + DROPDOWN_GAP;
                let left = rect.left;

                // Check viewport boundaries
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                const dropdownWidth = 600; // Approximate width

                // Ensure dropdown doesn't go beyond right edge
                if (left + dropdownWidth > viewportWidth) {
                    // Align to right edge of trigger if possible, or viewport right
                    left = Math.max(VIEWPORT_GAP, rect.right - dropdownWidth);
                }

                // Ensure dropdown doesn't go beyond left edge
                if (left < VIEWPORT_GAP) {
                    left = VIEWPORT_GAP;
                }

                // Adjust if dropdown goes beyond bottom edge - show above if needed
                const estimatedDropdownHeight = 300; // Approximate height
                if (top + estimatedDropdownHeight > viewportHeight) {
                    // Show above trigger if not enough space below
                    top = rect.top - estimatedDropdownHeight - DROPDOWN_GAP;
                    if (top < VIEWPORT_GAP) {
                        // If still not enough space above, position at top with max height
                        top = VIEWPORT_GAP;
                    }
                }

                setPosition({ top, left });
            }

            setIsOpen(true);
        }
    };

    return (
        <>
            {isValidElement(trigger) ? (
                cloneElement(trigger as React.ReactElement<{ onClick?: React.MouseEventHandler; [key: string]: unknown }>, {
                    ref: setTriggerElement,
                    onClick: (e: React.MouseEvent) => {
                        const element = trigger as React.ReactElement<{ onClick?: React.MouseEventHandler }>;
                        const originalOnClick = element.props.onClick;
                        if (originalOnClick) {
                            originalOnClick(e);
                        }
                        handleTriggerClick(e);
                    },
                })
            ) : (
                <div ref={setTriggerElement} onClick={handleTriggerClick} className="inline-block cursor-pointer">
                    {trigger}
                </div>
            )}

            {/* Dropdown Panel */}
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={handleCloseMenu} />
                    <div
                        className="fixed z-20 w-[calc(100vw-32px)] max-w-[640px] rounded-2xl border border-slate-200 bg-white p-4 shadow-lg"
                        style={{
                            top: `${position.top}px`,
                            left: `${position.left}px`,
                            maxHeight: `calc(100vh - ${position.top + VIEWPORT_GAP}px)`,
                            overflowY: "auto",
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onScroll={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col gap-4">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-500">{t.title}</span>
                            </div>
                            {/* Filter Conditions */}
                            {displayFilterState.conditions.length > 0 && (
                                <div className="flex flex-col gap-3">
                                    {displayFilterState.conditions.map((condition, index) => {
                                        const field = fields.find((f) => f.key === condition.fieldKey);
                                        const operators = field ? getOperatorsForFieldType(field.type) : [];
                                        const operatorOptions = operators.map((op) => ({
                                            id: op,
                                            label: t.operators[op],
                                        }));
                                        const requiresValue = operatorRequiresValue(condition.operator);
                                        const supportsMultiple = operatorSupportsMultipleValues(condition.operator);

                                        return (
                                            <div
                                                key={condition.id}
                                                className="flex flex-col gap-3 rounded-lg bg-slate-25 p-3 md:flex-row md:items-center md:rounded-none md:bg-transparent md:p-0"
                                            >
                                                {/* Mobile Header */}
                                                <div className="flex w-full items-center justify-between md:hidden">
                                                    <span className="text-xs font-medium text-slate-600">
                                                        {t.condition} {index + 1}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveCondition(condition.id)}
                                                        className="text-slate-400 hover:text-slate-600"
                                                        aria-label={t.clearFilters}
                                                    >
                                                        <XIcon size={16} />
                                                    </button>
                                                </div>

                                                {/* Field Selector */}
                                                <div className="w-full md:w-[200px]">
                                                    <Select
                                                        placeholder={t.selectField}
                                                        selectedKey={condition.fieldKey || null}
                                                        onSelectionChange={(key) => {
                                                            const newField = fields.find((f) => f.key === key);
                                                            if (newField) {
                                                                const newOperators = getOperatorsForFieldType(newField.type);
                                                                handleConditionChange(condition.id, {
                                                                    fieldKey: key as string,
                                                                    operator: newOperators[0],
                                                                    value: newField.type === FilterFieldType.STRING ? "" : null,
                                                                });
                                                            }
                                                        }}
                                                        items={fields.map((f) => ({ id: f.key, label: f.label }))}
                                                        size="md"
                                                    >
                                                        {(item) => <Select.Item id={item.id} label={item.label} />}
                                                    </Select>
                                                </div>

                                                {/* Operator Selector */}
                                                <div className="w-full md:w-[150px]">
                                                    <Select
                                                        placeholder={t.selectOperator}
                                                        selectedKey={condition.operator || null}
                                                        onSelectionChange={(key) => {
                                                            handleConditionChange(condition.id, {
                                                                operator: key as FilterOperator,
                                                                value: field?.type === FilterFieldType.STRING ? "" : null,
                                                            });
                                                        }}
                                                        items={operatorOptions}
                                                        size="md"
                                                    >
                                                        {(item) => <Select.Item id={item.id} label={item.label} />}
                                                    </Select>
                                                </div>

                                                {/* Value Input */}
                                                {requiresValue && (
                                                    <div className="w-full md:flex-1">
                                                        {field?.type === FilterFieldType.ENUM && !supportsMultiple ? (
                                                            <Select.ComboBox
                                                                placeholder={t.enterValue}
                                                                selectedKey={condition.value ? String(condition.value) : null}
                                                                onSelectionChange={(key) => {
                                                                    handleConditionChange(condition.id, {
                                                                        value: (key as string) || null,
                                                                    });
                                                                }}
                                                                items={field.options || []}
                                                                size="md"
                                                            >
                                                                {(item) => <Select.Item id={item.id} label={item.label} />}
                                                            </Select.ComboBox>
                                                        ) : field?.type === FilterFieldType.ENUM && supportsMultiple ? (
                                                            <Select.MultiComboBox
                                                                placeholder={t.enterValue}
                                                                selectedKeys={(condition.value as string[]) || []}
                                                                onSelectionChange={(keys) => {
                                                                    handleConditionChange(condition.id, {
                                                                        value: keys,
                                                                    });
                                                                }}
                                                                items={field.options || []}
                                                                size="md"
                                                            />
                                                        ) : field?.type === FilterFieldType.DATE ? (
                                                            <DateField
                                                                value={condition.value ? parseDate(String(condition.value).split("T")[0]) : null}
                                                                onChange={(value) => {
                                                                    handleConditionChange(condition.id, {
                                                                        value: value ? value.toString() : null,
                                                                    });
                                                                }}
                                                                className="w-full"
                                                            >
                                                                <DateInput className="w-full" />
                                                            </DateField>
                                                        ) : field?.type === FilterFieldType.NUMBER ? (
                                                            <Input
                                                                type="number"
                                                                size="md"
                                                                placeholder={field.placeholder || t.enterValue}
                                                                value={condition.value !== null ? String(condition.value) : ""}
                                                                onChange={(value) => {
                                                                    handleConditionChange(condition.id, {
                                                                        value: value ? Number(value) : null,
                                                                    });
                                                                }}
                                                                onKeyDown={handleKeyDown}
                                                            />
                                                        ) : field?.type === FilterFieldType.BOOLEAN ? (
                                                            <Select
                                                                placeholder={t.enterValue}
                                                                selectedKey={condition.value !== null ? String(condition.value) : null}
                                                                onSelectionChange={(key) => {
                                                                    handleConditionChange(condition.id, {
                                                                        value: key === "true",
                                                                    });
                                                                }}
                                                                items={[
                                                                    { id: "true", label: t.boolean.true },
                                                                    { id: "false", label: t.boolean.false },
                                                                ]}
                                                                size="md"
                                                            >
                                                                {(item) => <Select.Item id={item.id} label={item.label} />}
                                                            </Select>
                                                        ) : field?.type === FilterFieldType.SELECT && field.optionsUrl ? (
                                                            <SelectFilterInput
                                                                optionsUrl={field.optionsUrl}
                                                                value={condition.value as string | string[] | null}
                                                                onChange={(value) => {
                                                                    handleConditionChange(condition.id, {
                                                                        value,
                                                                    });
                                                                }}
                                                                supportsMultiple={supportsMultiple}
                                                                placeholder={field.placeholder || t.enterValue}
                                                            />
                                                        ) : (
                                                            <Input
                                                                type="text"
                                                                size="md"
                                                                placeholder={field?.placeholder || t.enterValue}
                                                                value={condition.value !== null ? String(condition.value) : ""}
                                                                onChange={(value) => {
                                                                    handleConditionChange(condition.id, {
                                                                        value: value,
                                                                    });
                                                                }}
                                                                onKeyDown={handleKeyDown}
                                                            />
                                                        )}
                                                    </div>
                                                )}

                                                {/* Remove Button (Desktop) */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveCondition(condition.id)}
                                                    className="hidden flex-shrink-0 cursor-pointer items-center justify-center text-slate-400 transition-colors hover:text-slate-600 md:flex"
                                                    aria-label={t.clearFilters}
                                                >
                                                    <XIcon size={20} color={ICON_COLORS.GRAY_500} className="flex-shrink-0" aria-hidden="true" />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Add Condition Button */}
                            {displayFilterState.conditions.length < maxConditions && (
                                <button
                                    type="button"
                                    onClick={handleAddCondition}
                                    className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-[var(--color-blue-400)] transition-colors hover:text-[var(--color-blue-500)]"
                                >
                                    <AddCircle size={20} variant="Linear" color={ICON_COLORS.BLUE_400} />
                                    {t.addCondition}
                                </button>
                            )}

                            {/* Footer Actions */}
                            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                                <Button type="button" color="secondary-gray" size="md" onClick={handleClearFilters}>
                                    {t.clearFilters}
                                </Button>
                                <Button type="button" color="primary" size="md" onClick={handleApplyFilter}>
                                    {t.apply}
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
