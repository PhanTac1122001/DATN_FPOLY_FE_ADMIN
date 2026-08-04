import type { DateValue } from "@internationalized/date";
import type { DatePickerProps } from "@/types/application.types";

export interface DateTimePickerProps {
    date?: string;
    time?: string;
    onChange?: (date: string, time: string) => void;
    placeholder?: string;
    className?: string;
    label?: string;
    hint?: string;
    isInvalid?: boolean;
    isRequired?: boolean;
}

export interface CustomDatePickerProps extends Omit<DatePickerProps, "value" | "onChange"> {
    label?: React.ReactNode;
    placeholder?: string;
    value?: string | DateValue | null;
    onChange?: (val: DateValue | string | null) => void;
    triggerClassName?: string;
}
