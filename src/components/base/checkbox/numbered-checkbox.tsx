"use client";

import type { NumberedCheckboxProps } from "@/types/base-components.types";
import { cx } from "@/utils/cx";

export function NumberedCheckbox({ isSelected, orderNumber, onChange, className, size = "sm" }: NumberedCheckboxProps) {
    const sizeClasses = size === "md" ? "size-6 text-xs" : "size-5 text-[10px]";

    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                onChange?.();
            }}
            className={cx(
                "flex shrink-0 cursor-pointer items-center justify-center rounded-full border-2 font-bold transition-all duration-200",
                sizeClasses,
                isSelected ? "border-brand-500 bg-brand-500 text-white shadow-sm" : "border-slate-300 bg-white text-transparent hover:border-brand-300",
                className,
            )}
            aria-checked={isSelected}
            role="checkbox"
        >
            {isSelected && orderNumber !== undefined ? orderNumber : ""}
        </button>
    );
}

NumberedCheckbox.displayName = "NumberedCheckbox";
