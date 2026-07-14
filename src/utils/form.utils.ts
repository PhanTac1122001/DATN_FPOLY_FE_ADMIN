import type { UseFormRegisterReturn } from "react-hook-form";

/**
 * Strips 'min' and 'max' from React Hook Form's register return value
 * to avoid type incompatibility with custom Input component props.
 */
export function registerInput<T extends string>(
    registerResult: UseFormRegisterReturn<T>,
): Omit<UseFormRegisterReturn<T>, "min" | "max"> & {
    onChange: (e: unknown) => Promise<boolean | void>;
} {
    const { min: _min, max: _max, onChange, ...rest } = registerResult;
    return {
        ...rest,
        onChange: (e: unknown) => {
            if (e && typeof e === "object" && "target" in e) {
                return onChange(e as Parameters<typeof onChange>[0]);
            }
            return onChange({
                target: {
                    name: registerResult.name,
                    value: e,
                },
                type: "change",
            } as Parameters<typeof onChange>[0]);
        },
    };
}
