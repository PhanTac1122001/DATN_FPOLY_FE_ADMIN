"use client";

import { createContext, useContext } from "react";
import { Radio as AriaRadio, RadioGroup as AriaRadioGroup } from "react-aria-components";
import type { RadioButtonBaseProps, RadioButtonProps, RadioGroupContextType, RadioGroupProps } from "@/types/base-components.types";
import { cx } from "@/utils/cx";

const RadioGroupContext = createContext<RadioGroupContextType | null>(null);

export const RadioButtonBase = ({ className, isFocusVisible, isSelected, isDisabled, size = "sm", variant = "default" }: RadioButtonBaseProps) => {
    const isFilledVariant = variant === "filled";

    return (
        <div
            className={cx(
                "relative flex size-4 min-h-4 min-w-4 cursor-pointer appearance-none items-center justify-center bg-primary ring-1 transition-inherit-all ring-inset",
                size === "md" && "size-5 min-h-5 min-w-5",
                // Default variant (rounded-full, solid background)
                !isFilledVariant && "rounded-full ring-primary",
                !isFilledVariant && isSelected && !isDisabled && "bg-brand-solid ring-bg-brand-solid",
                // Filled variant (rounded-lg, brand-25 background, brand-500 border)
                isFilledVariant && "rounded-lg ring-brand-500",
                isFilledVariant && !isSelected && "bg-primary ring-primary",
                isFilledVariant && isSelected && !isDisabled && "bg-brand-25 ring-brand-500",
                isDisabled && "cursor-not-allowed border-disabled bg-disabled_subtle ring-disabled",
                isFocusVisible && "outline-2 outline-offset-2 outline-focus-ring",
                className,
            )}
        >
            {/* Dot for filled variant */}
            {isFilledVariant && (
                <div
                    className={cx(
                        "size-1.5 rounded-full bg-brand-500 opacity-0 transition-inherit-all",
                        size === "md" && "size-2",
                        isDisabled && "bg-fg-disabled_subtle",
                        isSelected && !isDisabled && "opacity-100",
                    )}
                />
            )}
            {/* Default variant inner dot */}
            {!isFilledVariant && (
                <div
                    className={cx(
                        "size-1.5 rounded-full bg-fg-white opacity-0 transition-inherit-all",
                        size === "md" && "size-2",
                        isDisabled && "bg-fg-disabled_subtle",
                        isSelected && "opacity-100",
                    )}
                />
            )}
        </div>
    );
};
RadioButtonBase.displayName = "RadioButtonBase";

export const RadioButton = ({ label, hint, className, size = "sm", variant = "default", ...ariaRadioProps }: RadioButtonProps) => {
    const context = useContext(RadioGroupContext);

    size = context?.size ?? size;

    const sizes = {
        sm: {
            root: "gap-2",
            textWrapper: "",
            label: "text-sm font-medium",
            hint: "text-sm",
        },
        md: {
            root: "gap-3",
            textWrapper: "gap-0.5",
            label: "text-md font-medium",
            hint: "text-md",
        },
    };

    return (
        <AriaRadio
            {...ariaRadioProps}
            className={(renderProps) =>
                cx(
                    "relative flex items-start",
                    renderProps.isDisabled && "cursor-not-allowed",
                    sizes[size].root,
                    typeof className === "function" ? className(renderProps) : className,
                )
            }
        >
            {({ isSelected, isDisabled, isFocusVisible }) => (
                <>
                    <RadioButtonBase
                        size={size}
                        variant={variant}
                        isSelected={isSelected}
                        isDisabled={isDisabled}
                        isFocusVisible={isFocusVisible}
                        className={label || hint ? "mt-0.5" : ""}
                    />
                    {(label || hint) && (
                        <div className={cx("inline-flex flex-col", sizes[size].textWrapper)}>
                            {label && <p className={cx("text-secondary select-none", sizes[size].label)}>{label}</p>}
                            {hint && (
                                <span className={cx("text-tertiary", sizes[size].hint)} onClick={(event) => event.stopPropagation()}>
                                    {hint}
                                </span>
                            )}
                        </div>
                    )}
                </>
            )}
        </AriaRadio>
    );
};
RadioButton.displayName = "RadioButton";

export const RadioGroup = ({ children, className, size = "sm", validationBehavior = "aria", ...props }: RadioGroupProps) => {
    return (
        <RadioGroupContext.Provider value={{ size }}>
            <AriaRadioGroup validationBehavior={validationBehavior} {...props} className={cx("flex flex-col gap-4", className)}>
                {children}
            </AriaRadioGroup>
        </RadioGroupContext.Provider>
    );
};
