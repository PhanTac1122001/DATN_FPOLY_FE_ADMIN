"use client";

import { useMemo, useState } from "react";
import { endOfMonth, endOfWeek, getLocalTimeZone, startOfMonth, startOfWeek } from "@internationalized/date";
import { useControlledState } from "@react-stately/utils";
import { useDateFormatter } from "react-aria";
import type { DateValue } from "react-aria-components";
import { DateRangePicker as AriaDateRangePicker, Dialog as AriaDialog, Group as AriaGroup, Popover as AriaPopover, useLocale } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { Calendar as CalendarIcon } from "@/components/icons";
import { ALL_TIME_START_YEAR, DATE_OFFSET, MONTH_DECEMBER, MONTH_JANUARY, POPOVER_OFFSET } from "@/constants/application.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import type { DateRangePickerProps } from "@/types/application.types";
import { cx } from "@/utils/cx";
import { getDefaultHighlightedDates, getTodayDateValue } from "@/utils/date.utils";
import { DateInput } from "./date-input";
import { RangeCalendar } from "./range-calendar";
import { RangePresetButton } from "./range-preset";

export const DateRangePicker = ({ value: valueProp, defaultValue, onChange, onApply, onCancel, ...props }: DateRangePickerProps) => {
    const { locale } = useLocale();
    const highlightedDates = getDefaultHighlightedDates();
    const formatter = useDateFormatter({
        month: "short",
        day: "numeric",
        year: "numeric",
    });
    const [value, setValue] = useControlledState(valueProp, defaultValue || null, onChange);
    const [focusedValue, setFocusedValue] = useState<DateValue | null>(null);

    const formattedStartDate = value?.start ? formatter.format(value.start.toDate(getLocalTimeZone())) : UI_TEXT.common.datePicker.selectDate;
    const formattedEndDate = value?.end ? formatter.format(value.end.toDate(getLocalTimeZone())) : UI_TEXT.common.datePicker.selectDate;

    const presets = useMemo(() => {
        const now = getTodayDateValue();
        return {
            today: { label: UI_TEXT.common.datePicker.today, value: { start: now, end: now } },
            yesterday: {
                label: UI_TEXT.common.datePicker.yesterday,
                value: { start: now.subtract({ days: DATE_OFFSET }), end: now.subtract({ days: DATE_OFFSET }) },
            },
            thisWeek: { label: UI_TEXT.common.datePicker.thisWeek, value: { start: startOfWeek(now, locale), end: endOfWeek(now, locale) } },
            lastWeek: {
                label: UI_TEXT.common.datePicker.lastWeek,
                value: {
                    start: startOfWeek(now, locale).subtract({ weeks: DATE_OFFSET }),
                    end: endOfWeek(now, locale).subtract({ weeks: DATE_OFFSET }),
                },
            },
            thisMonth: { label: UI_TEXT.common.datePicker.thisMonth, value: { start: startOfMonth(now), end: endOfMonth(now) } },
            lastMonth: {
                label: UI_TEXT.common.datePicker.lastMonth,
                value: {
                    start: startOfMonth(now).subtract({ months: DATE_OFFSET }),
                    end: endOfMonth(now).subtract({ months: DATE_OFFSET }),
                },
            },
            thisYear: {
                label: UI_TEXT.common.datePicker.thisYear,
                value: { start: startOfMonth(now.set({ month: MONTH_JANUARY })), end: endOfMonth(now.set({ month: MONTH_DECEMBER })) },
            },
            lastYear: {
                label: UI_TEXT.common.datePicker.lastYear,
                value: {
                    start: startOfMonth(now.set({ month: MONTH_JANUARY }).subtract({ years: DATE_OFFSET })),
                    end: endOfMonth(now.set({ month: MONTH_DECEMBER }).subtract({ years: DATE_OFFSET })),
                },
            },
            allTime: {
                label: UI_TEXT.common.datePicker.allTime,
                value: {
                    start: now.set({ year: ALL_TIME_START_YEAR, month: MONTH_JANUARY, day: DATE_OFFSET }),
                    end: now,
                },
            },
        };
    }, [locale]);

    return (
        <AriaDateRangePicker aria-label={UI_TEXT.common.datePicker.ariaLabel} shouldCloseOnSelect={false} {...props} value={value} onChange={setValue}>
            <AriaGroup>
                <Button size="md" color="secondary" iconLeading={CalendarIcon}>
                    {!value ? (
                        <span className="text-placeholder">{UI_TEXT.common.datePicker.selectDates}</span>
                    ) : (
                        `${formattedStartDate} ${UI_TEXT.common.datePicker.dash} ${formattedEndDate}`
                    )}
                </Button>
            </AriaGroup>
            <AriaPopover
                placement="bottom right"
                offset={POPOVER_OFFSET}
                className={({ isEntering, isExiting }) =>
                    cx(
                        "origin-(--trigger-anchor-point) will-change-transform",
                        isEntering &&
                            "duration-150 ease-out animate-in fade-in placement-right:slide-in-from-left-0.5 placement-top:slide-in-from-bottom-0.5 placement-bottom:slide-in-from-top-0.5",
                        isExiting &&
                            "duration-100 ease-in animate-out fade-out placement-right:slide-out-to-left-0.5 placement-top:slide-out-to-bottom-0.5 placement-bottom:slide-out-to-top-0.5",
                    )
                }
            >
                <AriaDialog className="flex rounded-2xl bg-primary shadow-xl ring ring-secondary_alt focus:outline-hidden">
                    {({ close }) => (
                        <>
                            <div className="hidden w-38 flex-col gap-0.5 border-r border-solid border-secondary p-3 lg:flex">
                                {Object.values(presets).map((preset) => (
                                    <RangePresetButton
                                        key={preset.label}
                                        value={preset.value}
                                        onClick={() => {
                                            setValue(preset.value);
                                            setFocusedValue(preset.value.start);
                                        }}
                                    >
                                        {preset.label}
                                    </RangePresetButton>
                                ))}
                            </div>
                            <div className="flex flex-col">
                                <RangeCalendar
                                    focusedValue={focusedValue}
                                    onFocusChange={setFocusedValue}
                                    highlightedDates={highlightedDates}
                                    presets={{
                                        lastWeek: presets.lastWeek,
                                        lastMonth: presets.lastMonth,
                                        lastYear: presets.lastYear,
                                    }}
                                />
                                <div className="flex justify-between gap-3 border-t border-secondary p-4">
                                    <div className="hidden items-center gap-3 md:flex">
                                        <DateInput slot="start" className="w-36" />
                                        <div className="text-md text-quaternary">{UI_TEXT.common.datePicker.dash}</div>
                                        <DateInput slot="end" className="w-36" />
                                    </div>
                                    <div className="grid w-full grid-cols-2 gap-3 md:flex md:w-auto">
                                        <Button
                                            size="md"
                                            color="secondary"
                                            onClick={() => {
                                                onCancel?.();
                                                close();
                                            }}
                                        >
                                            {UI_TEXT.common.datePicker.cancel}
                                        </Button>
                                        <Button
                                            size="md"
                                            color="primary"
                                            onClick={() => {
                                                onApply?.();
                                                close();
                                            }}
                                        >
                                            {UI_TEXT.common.datePicker.apply}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </AriaDialog>
            </AriaPopover>
        </AriaDateRangePicker>
    );
};
