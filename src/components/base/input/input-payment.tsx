"use client";

import { useControlledState } from "@react-stately/utils";
import { HintText } from "@/components/base/input/hint-text";
import { InputBase, TextField } from "@/components/base/input/input";
import { Label } from "@/components/base/input/label";
import { CARD_TYPES } from "@/config/payment.config";
import { PAYMENT_INPUT_DEFAULT_MAX_LENGTH } from "@/constants/base-components.constants";
import type { PaymentInputProps } from "@/types/base-components.types";
import { detectCardType, formatCardNumber } from "@/utils/payment.utils";

export type { PaymentInputProps };

export const PaymentInput = ({
    onChange,
    value,
    defaultValue,
    className,
    maxLength = PAYMENT_INPUT_DEFAULT_MAX_LENGTH,
    label,
    hint,
    ...props
}: PaymentInputProps) => {
    const [cardNumber, setCardNumber] = useControlledState(value, defaultValue || "", (value) => {
        // Remove all non-numeric characters
        value = value.replace(/\D/g, "");

        onChange?.(value || "");
    });

    const card = detectCardType(cardNumber, [...CARD_TYPES]);

    return (
        <TextField
            aria-label={!label ? props?.placeholder : undefined}
            {...props}
            className={className}
            inputMode="numeric"
            maxLength={maxLength}
            value={formatCardNumber(cardNumber)}
            onChange={setCardNumber}
        >
            {({ isDisabled, isInvalid, isRequired }) => (
                <>
                    {label && <Label isRequired={isRequired}>{label}</Label>}

                    <InputBase
                        {...props}
                        isDisabled={isDisabled}
                        isInvalid={isInvalid}
                        icon={card?.icon}
                        inputClassName="pl-13"
                        iconClassName="left-2.5 h-6 w-8.5"
                    />

                    {hint && <HintText isInvalid={isInvalid}>{hint}</HintText>}
                </>
            )}
        </TextField>
    );
};

PaymentInput.displayName = "PaymentInput";
