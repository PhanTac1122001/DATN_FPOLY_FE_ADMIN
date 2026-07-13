"use client";

import { useEffect, useState } from "react";
import { getLocalTimeZone, toCalendarDateTime, today } from "@internationalized/date";
import { Calendar as CalendarIcon, Clock } from "iconsax-react";
import { useDateFormatter } from "react-aria";
import { DatePicker as AriaDatePicker, Dialog as AriaDialog, Group as AriaGroup, Popover as AriaPopover, DateField } from "react-aria-components";
import type { DateValue, Key } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { HintText } from "@/components/base/input/hint-text";
import { Label } from "@/components/base/input/label";
import { Select } from "@/components/base/select/select";
import { ICON_COLORS } from "@/constants/app.constants";
import { TIME_SLOTS } from "@/constants/date-picker.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import type { DateTimePickerProps } from "@/types/date-picker.types";
import { cx } from "@/utils/cx";
import { formatToDateStr, formatToTimeStr, parseToDateTime } from "@/utils/date-time-picker.utils";
import { Calendar } from "./calendar";
import { DateInput } from "./date-input";

export const DateTimePicker = ({ date, time, onChange, placeholder = "Chọn ngày giờ", className, label, hint, isInvalid, isRequired }: DateTimePickerProps) => {
    const [isOpen, setIsOpen] = useState(false);

    // internalValue represents the value currently being manipulated inside the open popover
    const [internalValue, setInternalValue] = useState<DateValue | null>(
        () => parseToDateTime(date, time) || toCalendarDateTime(today(getLocalTimeZone())).set({ hour: 9, minute: 0 }),
    );
    const [focusedValue, setFocusedValue] = useState<DateValue | null>(null);

    // Sync internalValue when opened
    useEffect(() => {
        if (isOpen) {
            const parsed = parseToDateTime(date, time);
            const val = parsed || toCalendarDateTime(today(getLocalTimeZone())).set({ hour: 9, minute: 0 });
            const timer = setTimeout(() => {
                setInternalValue(val);
                setFocusedValue(val);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [isOpen, date, time]);

    const dateFormatter = useDateFormatter({ month: "short", day: "numeric", year: "numeric" });
    const timeFormatter = useDateFormatter({ hour: "numeric", minute: "numeric" });

    const handleTodayClick = () => {
        const t = today(getLocalTimeZone());
        const newDate =
            internalValue && "hour" in internalValue
                ? toCalendarDateTime(t).set({ hour: internalValue.hour, minute: internalValue.minute })
                : toCalendarDateTime(t).set({ hour: 9, minute: 0 });
        setInternalValue(newDate);
        setFocusedValue(newDate);
    };

    const handleTimeClick = (key: Key | null) => {
        const slot = TIME_SLOTS.find((s) => s.id === key);
        if (!slot) return;
        const newDate = internalValue ?? toCalendarDateTime(today(getLocalTimeZone()));
        setInternalValue(newDate.set({ hour: slot.hour, minute: slot.minute }));
    };

    const handleApply = (close: () => void) => {
        if (internalValue && onChange) {
            onChange(formatToDateStr(internalValue), formatToTimeStr(internalValue));
        }
        close();
    };

    const displayValue = parseToDateTime(date, time);

    return (
        <AriaDatePicker
            isInvalid={isInvalid}
            shouldCloseOnSelect={false}
            value={internalValue}
            onChange={setInternalValue}
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            className={cx("group flex h-max w-full flex-col items-start justify-start gap-1.5", className)}
        >
            {label && <Label isRequired={isRequired}>{label}</Label>}
            <AriaGroup className="w-full">
                <Button
                    size="md"
                    color="secondary"
                    className={cx(
                        "ring-0s w-full justify-between rounded-3xl border bg-white px-4 py-2.5 hover:bg-white",
                        isInvalid ? "border-error-primary focus:border-error-primary ring-error_subtle" : "border-slate-300 hover:border-brand",
                    )}
                    iconTrailing={<CalendarIcon size="16" color={ICON_COLORS.GRAY_500} />}
                >
                    <span className="flex-1 truncate text-left text-md font-normal text-slate-600">
                        {displayValue ? (
                            <>
                                {dateFormatter.format(displayValue.toDate(getLocalTimeZone()))}
                                <span className="ml-1 text-slate-500">{timeFormatter.format(displayValue.toDate(getLocalTimeZone()))}</span>
                            </>
                        ) : (
                            placeholder
                        )}
                    </span>
                </Button>
            </AriaGroup>
            {hint && <HintText isInvalid={isInvalid}>{hint}</HintText>}
            <AriaPopover
                offset={8}
                placement="bottom left"
                className={({ isEntering, isExiting }) =>
                    cx(
                        "z-50 origin-(--trigger-anchor-point) will-change-transform",
                        isEntering &&
                            "duration-150 ease-out animate-in fade-in placement-right:slide-in-from-left-0.5 placement-top:slide-in-from-bottom-0.5 placement-bottom:slide-in-from-top-0.5",
                        isExiting &&
                            "duration-100 ease-in animate-out fade-out placement-right:slide-out-to-left-0.5 placement-top:slide-out-to-bottom-0.5 placement-bottom:slide-out-to-top-0.5",
                    )
                }
            >
                <AriaDialog className="flex max-h-[inherit] flex-col rounded-2xl bg-primary shadow-xl ring ring-secondary_alt outline-hidden">
                    {({ close }) => (
                        <>
                            <div className="flex min-h-0 flex-1 overflow-y-auto">
                                <div className="flex flex-col px-6 py-5">
                                    <Calendar focusedValue={focusedValue} onFocusChange={setFocusedValue} />
                                    <div className="mt-4 flex flex-col gap-3 md:hidden">
                                        <div className="flex w-full gap-3">
                                            <DateField aria-label="Date" className="flex-1">
                                                <DateInput className="flex-1" />
                                            </DateField>
                                            <Button slot={null} size="sm" color="secondary" onClick={handleTodayClick}>
                                                {UI_TEXT.dateTimePicker.today}
                                            </Button>
                                        </div>
                                        <Select
                                            aria-label="Time"
                                            size="sm"
                                            placeholder={UI_TEXT.dateTimePicker.time}
                                            placeholderIcon={<Clock size="16" color="currentColor" />}
                                            items={TIME_SLOTS}
                                            selectedKey={
                                                internalValue && "hour" in internalValue
                                                    ? `${internalValue.hour}:${String(internalValue.minute).padStart(Number("2"), "0")}`
                                                    : null
                                            }
                                            onSelectionChange={handleTimeClick}
                                            className="w-full flex-1"
                                        >
                                            {(slot) => (
                                                <Select.Item id={slot.id} textValue={slot.label}>
                                                    {slot.label}
                                                </Select.Item>
                                            )}
                                        </Select>
                                    </div>
                                </div>
                                <div className="relative hidden min-h-0 w-48 flex-col gap-4 border-l border-secondary md:flex">
                                    <div className="shrink-0 px-5 pt-6 text-center text-sm font-semibold text-fg-secondary">{UI_TEXT.dateTimePicker.time}</div>
                                    <div className="relative h-full w-full">
                                        <ul className="absolute inset-0 flex min-h-0 flex-col gap-1.5 overflow-y-auto px-5 pb-5">
                                            {TIME_SLOTS.map((slot) => {
                                                const _isSelected =
                                                    internalValue &&
                                                    "hour" in internalValue &&
                                                    internalValue.hour === slot.hour &&
                                                    internalValue.minute === slot.minute;
                                                return (
                                                    <li key={slot.id} className="flex-1">
                                                        <Button
                                                            size="sm"
                                                            color="secondary"
                                                            className={cx("w-full justify-center")}
                                                            onClick={() => handleTimeClick(slot.id)}
                                                        >
                                                            {slot.label}
                                                        </Button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="flex shrink-0 gap-3 border-t border-secondary p-4">
                                <div className="mr-auto hidden w-full items-center gap-3 md:flex"></div>

                                <Button size="sm" color="secondary" className="w-24 max-md:flex-1" onClick={close}>
                                    {UI_TEXT.dateTimePicker.cancel}
                                </Button>
                                <Button size="sm" color="primary" className="w-24 max-md:flex-1" onClick={() => handleApply(close)}>
                                    {UI_TEXT.dateTimePicker.apply}
                                </Button>
                            </div>
                        </>
                    )}
                </AriaDialog>
            </AriaPopover>
        </AriaDatePicker>
    );
};
