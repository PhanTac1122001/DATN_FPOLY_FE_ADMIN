"use client";

import { getLocalTimeZone } from "@internationalized/date";
import { useControlledState } from "@react-stately/utils";
import { useDateFormatter } from "react-aria";
import { DatePicker as AriaDatePicker, Dialog as AriaDialog, Group as AriaGroup, Popover as AriaPopover } from "react-aria-components";
import { Button } from "@/components/base/buttons/button";
import { Calendar as CalendarIcon } from "@/components/icons";
import { CALENDAR_ICON_SIZE, POPOVER_OFFSET } from "@/constants/application.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import type { DatePickerProps } from "@/types/application.types";
import { cx } from "@/utils/cx";
import { getDefaultHighlightedDates } from "@/utils/date.utils";
import { Calendar } from "./calendar";

export const DatePicker = ({ value: valueProp, defaultValue, onChange, onApply, onCancel, ...props }: DatePickerProps) => {
    const highlightedDates = getDefaultHighlightedDates();
    const formatter = useDateFormatter({
        month: "short",
        day: "numeric",
        year: "numeric",
    });
    const [value, setValue] = useControlledState(valueProp, defaultValue || null, onChange);

    const formattedDate = value ? formatter.format(value.toDate(getLocalTimeZone())) : UI_TEXT.common.datePicker.selectDate;

    return (
        <AriaDatePicker shouldCloseOnSelect={false} {...props} value={value} onChange={setValue}>
            <AriaGroup>
                <Button size="md" color="secondary" iconLeading={(props) => <CalendarIcon {...props} size={CALENDAR_ICON_SIZE} color="currentColor" />}>
                    {formattedDate}
                </Button>
            </AriaGroup>
            <AriaPopover
                offset={POPOVER_OFFSET}
                placement="bottom right"
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
                <AriaDialog className="rounded-2xl bg-primary shadow-xl ring ring-secondary_alt">
                    {({ close }) => (
                        <>
                            <div className="flex px-6 py-5">
                                <Calendar highlightedDates={highlightedDates} />
                            </div>
                            <div className="grid grid-cols-2 gap-3 border-t border-secondary p-4">
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
                        </>
                    )}
                </AriaDialog>
            </AriaPopover>
        </AriaDatePicker>
    );
};
