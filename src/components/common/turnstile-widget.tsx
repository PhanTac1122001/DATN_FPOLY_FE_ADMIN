import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { UI_TEXT } from "@/constants/ui-text.constants";
import type { TurnstileWidgetProps, TurnstileWidgetRef } from "@/types/common-components.types";

export type { TurnstileWidgetRef };

export const TurnstileWidget = forwardRef<TurnstileWidgetRef, TurnstileWidgetProps>(({ onVerify, siteKey }, ref) => {
    const turnstileRef = useRef<TurnstileInstance>(null);

    useImperativeHandle(ref, () => ({
        reset: () => {
            turnstileRef.current?.reset();
        },
    }));

    if (!siteKey) {
        console.warn("Turnstile site key is missing");
        return <div className="text-center text-red-500">{UI_TEXT.common.errors.turnstileMissing}</div>;
    }

    return (
        <div className="my-4 flex justify-center">
            <Turnstile
                ref={turnstileRef}
                siteKey={siteKey}
                onSuccess={onVerify}
                options={{
                    theme: "light",
                    size: "flexible",
                }}
            />
        </div>
    );
});

TurnstileWidget.displayName = "TurnstileWidget";
