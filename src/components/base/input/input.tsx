"use client";

import { type ChangeEvent, type HTMLAttributes, createContext, useContext, useEffect, useRef } from "react";
import { HelpCircle, InfoCircle } from "@untitledui/icons";
import { Export } from "iconsax-react";
import type { InputProps as AriaInputProps } from "react-aria-components";
import { Group as AriaGroup, Input as AriaInput, TextField as AriaTextField } from "react-aria-components";
import { HintText } from "@/components/base/input/hint-text";
import { Label } from "@/components/base/input/label";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import { Eye, EyeSlash } from "@/components/icons";
import { ICON_COLORS } from "@/constants/app.constants";
import { DEFAULT_ICON_SIZE } from "@/constants/ui-components.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
// Import types for internal use
import type { IconsaxIconProps, InputBaseProps, InputProps, InputTextFieldProps as TextFieldProps } from "@/types/base-components.types";
import { cx, sortCx } from "@/utils/cx";

// Re-export types from centralized location
export type {
    IconsaxIconProps,
    InputBaseProps,
    InputBasePropsInternal as BaseProps,
    InputTextFieldProps as TextFieldProps,
    InputProps,
} from "@/types/base-components.types";

export const InputBase = ({
    ref,
    tooltip,
    shortcut,
    groupRef,
    size = "sm",
    isInvalid,
    isDisabled,
    icon: Icon,
    iconTrailing: IconTrailing,
    placeholder,
    wrapperClassName,
    tooltipClassName,
    inputClassName,
    iconClassName,
    iconTrailingClassName,
    iconColor,
    iconTrailingColor,
    iconVariant,
    iconTrailingVariant,
    iconSize,
    iconTrailingSize,
    showPassword,
    onTogglePassword,
    showPasswordLabel,
    hidePasswordLabel,
    // Omit these props as TextField manages them for text inputs
    value: _value,
    onChange,
    defaultValue: _defaultValue,
    type,
    onFileChange,
    // Filter out React Aria props that shouldn't be passed to DOM elements
    isRequired: _isRequired,
    ...inputProps
}: Omit<InputBaseProps, "label" | "hint">) => {
    // Check if the input has a leading icon or tooltip
    // Show password toggle if onTogglePassword is provided and type is password (even if it gets converted to text)
    // Hide password toggle when there's an error (show error icon instead)
    const isPasswordInput = type === "password" || (onTogglePassword && showPassword !== undefined);
    const shouldShowPasswordToggle = onTogglePassword && isPasswordInput;
    const hasTrailingIcon = tooltip || isInvalid || shouldShowPasswordToggle || IconTrailing;
    const hasLeadingIcon = Icon;

    // If the input is inside a `TextFieldContext`, use its context to simplify applying styles
    const context = useContext(TextFieldContext);

    const inputSize = context?.size || size;

    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleRef = (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === "function") {
            ref(node);
        } else if (ref && typeof ref === "object" && "current" in ref) {
            (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
        }
    };

    useEffect(() => {
        const inputEl = inputRef.current;
        if (!inputEl || type !== "number") return;

        const handleWheel = (e: WheelEvent) => {
            if (document.activeElement === inputEl) {
                e.preventDefault();
            }
        };

        inputEl.addEventListener("wheel", handleWheel, { passive: false });
        return () => {
            inputEl.removeEventListener("wheel", handleWheel);
        };
    }, [type]);

    const sizes = sortCx({
        sm: {
            root: cx("px-3 py-2", hasTrailingIcon && "pr-9", hasLeadingIcon && "pl-10"),
            iconLeading: "left-3",
            iconTrailing: "right-3",
            shortcut: "pr-2.5",
        },
        md: {
            root: cx("px-3.5 py-2.5", hasTrailingIcon && "pr-9.5", hasLeadingIcon && "pl-10.5"),
            iconLeading: "left-3.5",
            iconTrailing: "right-3.5",
            shortcut: "pr-3",
        },
    });

    return (
        <AriaGroup
            {...{ isDisabled, isInvalid }}
            ref={groupRef}
            className={({ isFocusWithin, isDisabled, isInvalid }) =>
                cx(
                    "relative flex w-full flex-row place-content-center place-items-center rounded-full bg-primary shadow-xs ring-1 ring-primary transition-shadow duration-100 ease-linear ring-inset",

                    isFocusWithin && !isDisabled && "custom-input-focus ring-2 ring-brand",

                    // Disabled state styles
                    isDisabled && "cursor-not-allowed bg-disabled_subtle ring-disabled",
                    "group-disabled:cursor-not-allowed group-disabled:bg-disabled_subtle group-disabled:ring-disabled",

                    // Invalid state styles
                    isInvalid && "ring-error_subtle",
                    "group-invalid:ring-error_subtle",

                    // Invalid state with focus-within styles
                    isInvalid && isFocusWithin && "ring-2 ring-error",
                    isFocusWithin && "group-invalid:ring-2 group-invalid:ring-error",

                    context?.wrapperClassName,
                    wrapperClassName,
                )
            }
        >
            {/* Leading icon and Payment icon */}
            {Icon && (
                <Icon
                    {...({
                        size: iconSize || DEFAULT_ICON_SIZE,
                        variant: iconVariant || "Linear",
                        color: iconColor || "currentColor",
                        className: cx(
                            "pointer-events-none absolute size-5",
                            !iconColor && "text-fg-quaternary",
                            isDisabled && "text-fg-disabled",
                            sizes[inputSize].iconLeading,
                            context?.iconClassName,
                            iconClassName,
                        ),
                    } as HTMLAttributes<HTMLOrSVGElement> & IconsaxIconProps)}
                />
            )}

            {/* Input field */}
            <AriaInput
                {...(inputProps as AriaInputProps)}
                ref={handleRef}
                placeholder={placeholder}
                type={shouldShowPasswordToggle && showPassword ? "text" : type}
                onChange={(e) => {
                    if (type === "file" && onFileChange) {
                        onFileChange(e as ChangeEvent<HTMLInputElement>);
                    } else if (onChange) {
                        // AriaTextFieldProps expects onChange to receive a string value, not an event
                        // But AriaInput onChange provides a ChangeEvent
                        onChange(e.target.value);
                    }
                }}
                className={cx(
                    "m-0 w-full bg-transparent text-md text-primary ring-0 outline-hidden placeholder:text-placeholder autofill:rounded-full autofill:text-primary",
                    isDisabled && "cursor-not-allowed text-disabled",
                    sizes[inputSize].root,
                    context?.inputClassName,
                    inputClassName,
                )}
            />

            {/* Tooltip and help icon */}
            {tooltip && !isInvalid && !shouldShowPasswordToggle && (
                <Tooltip title={tooltip} placement="top">
                    <TooltipTrigger
                        className={cx(
                            "absolute cursor-pointer text-fg-quaternary transition duration-200 hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover",
                            sizes[inputSize].iconTrailing,
                            context?.tooltipClassName,
                            tooltipClassName,
                        )}
                    >
                        <HelpCircle className="size-4" />
                    </TooltipTrigger>
                </Tooltip>
            )}

            {/* Password toggle button */}
            {shouldShowPasswordToggle && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onTogglePassword?.();
                    }}
                    className={cx(
                        "absolute z-10 flex cursor-pointer items-center justify-center text-gray-400 transition-colors hover:text-gray-600",
                        sizes[inputSize].iconTrailing,
                    )}
                    aria-label={showPassword ? hidePasswordLabel || UI_TEXT.auth.login.hidePassword : showPasswordLabel || UI_TEXT.auth.login.showPassword}
                    tabIndex={0}
                >
                    {showPassword ? (
                        <EyeSlash size={16} variant="Linear" color={iconColor || ICON_COLORS.GRAY_400} />
                    ) : (
                        <Eye size={16} variant="Linear" color={iconColor || ICON_COLORS.GRAY_400} />
                    )}
                </button>
            )}

            {/* File input export icon */}
            {type === "file" && (
                <div className={cx("pointer-events-none absolute z-10 flex items-center justify-center", sizes[inputSize].iconTrailing)}>
                    <Export size={16} variant="Linear" color={iconColor || ICON_COLORS.GRAY_400} />
                </div>
            )}

            {/* Custom trailing icon - show if no other trailing elements */}
            {IconTrailing && !tooltip && !isInvalid && !shouldShowPasswordToggle && (
                <IconTrailing
                    {...({
                        size: iconTrailingSize || DEFAULT_ICON_SIZE,
                        variant: iconTrailingVariant || "Linear",
                        color: iconTrailingColor || "currentColor",
                        className: cx(
                            "pointer-events-none absolute size-5",
                            !iconTrailingColor && "text-fg-quaternary",
                            isDisabled && "text-fg-disabled",
                            sizes[inputSize].iconTrailing,
                            context?.iconClassName,
                            iconTrailingClassName,
                        ),
                    } as HTMLAttributes<HTMLOrSVGElement> & IconsaxIconProps)}
                />
            )}

            {/* Invalid icon - show only if no password toggle */}
            {isInvalid && !shouldShowPasswordToggle && (
                <InfoCircle
                    className={cx(
                        "pointer-events-none absolute size-4 text-fg-error-secondary",
                        sizes[inputSize].iconTrailing,
                        context?.tooltipClassName,
                        tooltipClassName,
                    )}
                />
            )}

            {/* Shortcut */}
            {shortcut && (
                <div
                    className={cx(
                        "pointer-events-none absolute inset-y-0.5 right-0.5 z-10 flex items-center rounded-full bg-linear-to-r from-transparent to-bg-primary to-40% pl-8",
                        sizes[inputSize].shortcut,
                    )}
                >
                    <span
                        className={cx(
                            "pointer-events-none rounded px-1 py-px text-xs font-medium text-quaternary ring-1 ring-secondary select-none ring-inset",
                            isDisabled && "bg-transparent text-disabled",
                        )}
                        aria-hidden="true"
                    >
                        {typeof shortcut === "string" ? shortcut : UI_TEXT.common.symbols.commandK}
                    </span>
                </div>
            )}
        </AriaGroup>
    );
};

InputBase.displayName = "InputBase";

const TextFieldContext = createContext<TextFieldProps>({});

export const TextField = ({ className, ...props }: TextFieldProps) => {
    return (
        <TextFieldContext.Provider value={props}>
            <AriaTextField
                {...props}
                data-input-wrapper
                className={(state) =>
                    cx("group flex h-max w-full flex-col items-start justify-start gap-1.5", typeof className === "function" ? className(state) : className)
                }
            />
        </TextFieldContext.Provider>
    );
};

TextField.displayName = "TextField";

export const Input = ({
    size = "sm",
    placeholder,
    icon: Icon,
    iconTrailing: IconTrailing,
    label,
    hint,
    shortcut,
    hideRequiredIndicator,
    className,
    ref,
    groupRef,
    tooltip,
    iconClassName,
    iconTrailingClassName,
    inputClassName,
    wrapperClassName,
    tooltipClassName,
    iconColor,
    iconTrailingColor,
    iconVariant,
    iconTrailingVariant,
    iconSize,
    iconTrailingSize,
    showPassword,
    onTogglePassword,
    showPasswordLabel,
    hidePasswordLabel,
    validationBehavior = "aria",
    ...props
}: InputProps) => {
    return (
        <TextField validationBehavior={validationBehavior} aria-label={!label ? placeholder : undefined} {...props} className={className}>
            {({ isRequired, isInvalid }) => (
                <>
                    {label && <Label isRequired={hideRequiredIndicator ? !hideRequiredIndicator : isRequired}>{label}</Label>}

                    <InputBase
                        {...props}
                        ref={ref}
                        groupRef={groupRef}
                        size={size}
                        placeholder={placeholder}
                        icon={Icon}
                        iconTrailing={IconTrailing}
                        shortcut={shortcut}
                        iconClassName={iconClassName}
                        iconTrailingClassName={iconTrailingClassName}
                        inputClassName={inputClassName}
                        wrapperClassName={wrapperClassName}
                        tooltipClassName={tooltipClassName}
                        tooltip={tooltip}
                        iconColor={iconColor}
                        iconTrailingColor={iconTrailingColor}
                        iconVariant={iconVariant}
                        iconTrailingVariant={iconTrailingVariant}
                        iconSize={iconSize}
                        iconTrailingSize={iconTrailingSize}
                        showPassword={showPassword}
                        onTogglePassword={onTogglePassword}
                        showPasswordLabel={showPasswordLabel}
                        hidePasswordLabel={hidePasswordLabel}
                    />
                    {hint && <HintText isInvalid={isInvalid}>{hint}</HintText>}
                </>
            )}
        </TextField>
    );
};

Input.displayName = "Input";
