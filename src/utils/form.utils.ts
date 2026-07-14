/* eslint-disable @typescript-eslint/no-explicit-any */
import type { UseFormRegisterReturn } from "react-hook-form";

/**
 * Strips 'min' and 'max' from React Hook Form's register return value
 * to avoid type incompatibility with custom Input component props.
 */
export function registerInput<T extends string>(registerResult: UseFormRegisterReturn<T>): any {
    const { min: _min, max: _max, onChange, ...rest } = registerResult;
    return {
        ...rest,
        onChange: (e: any) => {
            if (e && typeof e === "object" && "target" in e) {
                return onChange(e);
            }
            return onChange({
                target: {
                    name: registerResult.name,
                    value: e,
                },
                type: "change",
            } as any);
        },
    };
}
