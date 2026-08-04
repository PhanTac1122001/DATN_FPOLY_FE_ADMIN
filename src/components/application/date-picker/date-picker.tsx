"use client";

import { getLocalTimeZone, parseDate } from "@internationalized/date";
import type { DateValue } from "@internationalized/date";
import { useControlledState } from "@react-stately/utils";
import { useDateFormatter } from "react-aria";
import { Button as AriaButton, DatePicker as AriaDatePicker, Dialog as AriaDialog, Group as AriaGroup, Popover as AriaPopover } from "react-aria-components";
import { Label } from "@/components/base/input/label";
import { Calendar as CalendarIcon } from "@/components/icons";
import { POPOVER_OFFSET } from "@/constants/application.constants";
import type { CustomDatePickerProps } from "@/types/date-picker.types";
import { cx } from "@/utils/cx";
import { getDefaultHighlightedDates } from "@/utils/date.utils";
import { Calendar } from "./calendar";

export const DatePicker = ({
    label,
    placeholder = "dd/mm/yyyy",
    value: valueProp,
    defaultValue,
    onChange,
    onApply: _onApply,
    onCancel: _onCancel,
    triggerClassName,
    shouldCloseOnSelect = true,
    ...props
}: CustomDatePickerProps) => {
    const highlightedDates = getDefaultHighlightedDates();
    const formatter = useDateFormatter({
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

    const isStringValue = typeof valueProp === "string";

    // Safely parse string "YYYY-MM-DD" to DateValue
    let parsedValue: DateValue | null = null;
    if (typeof valueProp === "string" && valueProp) {
        try {
            parsedValue = parseDate(valueProp);
        } catch {
            parsedValue = null;
        }
    } else if (valueProp && typeof valueProp === "object") {
        parsedValue = valueProp as DateValue;
    }

    const [value, setValue] = useControlledState<DateValue | null>(parsedValue, defaultValue || null, (val) => {
        if (onChange) {
            if (isStringValue) {
                onChange(val ? val.toString() : "");
            } else {
                onChange(val);
            }
        }
    });

    const formattedDate = value ? formatter.format(value.toDate(getLocalTimeZone())) : null;

    return (
        <div className="flex w-full flex-col gap-1.5">
            {label &&
                (typeof label === "string" ? (
                    <Label className="text-sm font-medium text-slate-700">{label}</Label>
                ) : (
                    <Label className="text-sm font-medium text-slate-700">{label}</Label>
                ))}
            <AriaDatePicker shouldCloseOnSelect={shouldCloseOnSelect} {...props} value={value} onChange={setValue}>
                <AriaGroup className="w-full">
                    <AriaButton
                        className={cx(
                            "flex w-full cursor-pointer items-center justify-between rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-none transition duration-150 ease-linear outline-none hover:border-slate-300 focus:border-wine focus:ring-1 focus:ring-wine/20",
                            triggerClassName,
                        )}
                    >
                        <span className={formattedDate ? "font-semibold text-slate-800" : "font-medium text-slate-400"}>{formattedDate || placeholder}</span>
                        <CalendarIcon size={18} className="shrink-0 text-slate-400" />
                    </AriaButton>
                </AriaGroup>
                <AriaPopover
                    offset={POPOVER_OFFSET}
                    placement="bottom start"
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
                    <AriaDialog className="rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-slate-200 outline-none">
                        <div className="flex px-4 py-3">
                            <Calendar highlightedDates={highlightedDates} />
                        </div>
                    </AriaDialog>
                </AriaPopover>
            </AriaDatePicker>
        </div>
    );
};
