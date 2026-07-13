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
