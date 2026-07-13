"use client";

import type { HTMLAttributes, PropsWithChildren } from "react";
import { Fragment, useContext, useState } from "react";
import type { CalendarDate } from "@internationalized/date";
import { useDateFormatter } from "react-aria";
import type { DateValue } from "react-aria-components";
import {
    CalendarGrid as AriaCalendarGrid,
    CalendarGridBody as AriaCalendarGridBody,
    CalendarGridHeader as AriaCalendarGridHeader,
    CalendarHeaderCell as AriaCalendarHeaderCell,
    RangeCalendar as AriaRangeCalendar,
    RangeCalendarContext,
    RangeCalendarStateContext,
    useSlottedContext,
} from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { ChevronLeft, ChevronRight } from "@/components/icons";
import { DAY_SLICE_LENGTH, MONTHS_VISIBLE_DESKTOP, MONTHS_VISIBLE_MOBILE, MONTH_OFFSET, SLICE_START } from "@/constants/application.constants";
import { useBreakpoint } from "@/hooks/use-breakpoint";
import type { RangeCalendarProps } from "@/types/application.types";
import { CalendarCell } from "./cell";
import { DateInput } from "./date-input";

export const RangeCalendarContextProvider = ({ children }: PropsWithChildren) => {
    const [value, onChange] = useState<{ start: DateValue; end: DateValue } | null>(null);
    const [focusedValue, onFocusChange] = useState<DateValue | undefined>();

    return <RangeCalendarContext.Provider value={{ value, onChange, focusedValue, onFocusChange }}>{children}</RangeCalendarContext.Provider>;
};

const RangeCalendarTitle = ({ part }: { part: "start" | "end" }) => {
    const context = useContext(RangeCalendarStateContext);

    if (!context) {
        throw new Error("<RangeCalendarTitle /> must be used within a <RangeCalendar /> component.");
    }

    const formatter = useDateFormatter({
        month: "long",
        year: "numeric",
        calendar: context.visibleRange.start.calendar.identifier,
        timeZone: context.timeZone,
    });

    return part === "start"
        ? formatter.format(context.visibleRange.start.toDate(context.timeZone))
        : formatter.format(context.visibleRange.end.toDate(context.timeZone));
};

const MobilePresetButton = ({ value, children, ...props }: HTMLAttributes<HTMLButtonElement> & { value: { start: DateValue; end: DateValue } }) => {
    const context = useContext(RangeCalendarStateContext);

    return (
        <Button
            {...props}
            slot={null}
            size="sm"
            color="link-color"
            onClick={() => {
                context?.setValue(value);
                context?.setFocusedDate(value.start as CalendarDate);
            }}
        >
            {children}
        </Button>
    );
};

export const RangeCalendar = ({ presets, ...props }: RangeCalendarProps) => {
    const isDesktop = useBreakpoint("md");
    const context = useSlottedContext(RangeCalendarContext);

    const ContextWrapper = context ? Fragment : RangeCalendarContextProvider;

    return (
        <ContextWrapper>
            <AriaRangeCalendar
                className="flex items-start"
                visibleDuration={{
                    months: isDesktop ? MONTHS_VISIBLE_DESKTOP : MONTHS_VISIBLE_MOBILE,
                }}
                {...props}
            >
                <div className="flex flex-col gap-3 px-6 py-5">
                    <header className="relative flex items-center justify-between md:justify-start">
                        <Button slot="previous" iconLeading={ChevronLeft} size="sm" color="tertiary" className="size-8" />

                        <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-semibold text-fg-secondary">
                            <RangeCalendarTitle part="start" />
                        </h2>

                        <Button slot="next" iconLeading={ChevronRight} size="sm" color="tertiary" className="size-8 md:hidden" />
                    </header>

                    {!isDesktop && (
                        <div className="flex items-center gap-2 md:hidden">
                            <DateInput slot="start" className="flex-1" />
                            <div className="text-md text-quaternary">{"–"}</div>
                            <DateInput slot="end" className="flex-1" />
                        </div>
                    )}

                    {!isDesktop && presets && (
                        <div className="mt-1 flex justify-between gap-3 px-2 md:hidden">
                            {Object.values(presets).map((preset) => (
                                <MobilePresetButton key={preset.label} value={preset.value}>
                                    {preset.label}
                                </MobilePresetButton>
                            ))}
                        </div>
                    )}

                    <AriaCalendarGrid weekdayStyle="short" className="w-max">
                        <AriaCalendarGridHeader>
                            {(day) => (
                                <AriaCalendarHeaderCell className="border-b-4 border-transparent p-0">
                                    <div className="flex size-10 items-center justify-center text-sm font-medium text-secondary">
                                        {day.slice(SLICE_START, DAY_SLICE_LENGTH)}
                                    </div>
                                </AriaCalendarHeaderCell>
                            )}
                        </AriaCalendarGridHeader>
                        <AriaCalendarGridBody className="[&_td]:p-0 [&_tr]:border-b-4 [&_tr]:border-transparent [&_tr:last-of-type]:border-none">
                            {(date) => <CalendarCell date={date} />}
                        </AriaCalendarGridBody>
                    </AriaCalendarGrid>
                </div>

                {isDesktop && (
                    <div className="flex flex-col gap-3 border-l border-secondary px-6 py-5">
                        <header className="relative flex items-center justify-end">
                            <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-semibold text-fg-secondary">
                                <RangeCalendarTitle part="end" />
                            </h2>

                            <Button slot="next" iconLeading={ChevronRight} size="sm" color="tertiary" className="size-8" />
                        </header>

                        <AriaCalendarGrid weekdayStyle="short" offset={{ months: MONTH_OFFSET }} className="w-max">
                            <AriaCalendarGridHeader>
                                {(day) => (
                                    <AriaCalendarHeaderCell className="border-b-4 border-transparent p-0">
                                        <div className="flex size-10 items-center justify-center text-sm font-medium text-secondary">
                                            {day.slice(SLICE_START, DAY_SLICE_LENGTH)}
                                        </div>
                                    </AriaCalendarHeaderCell>
                                )}
                            </AriaCalendarGridHeader>
                            <AriaCalendarGridBody className="[&_td]:p-0 [&_tr]:border-b-4 [&_tr]:border-transparent [&_tr:last-of-type]:border-none">
                                {(date) => <CalendarCell date={date} />}
                            </AriaCalendarGridBody>
                        </AriaCalendarGrid>
                    </div>
                )}
            </AriaRangeCalendar>
        </ContextWrapper>
    );
};
