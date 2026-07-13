import type { TabRenderProps as AriaTabRenderProps } from "react-aria-components";
import { cx } from "@/utils/cx";

export const getTabStyles = ({ isFocusVisible, isSelected, isHovered }: AriaTabRenderProps) => ({
    "button-brand": cx(
        "rounded-full border transition-colors",
        isFocusVisible && "outline-2 -outline-offset-2",
        isSelected
            ? "border-brand-solid bg-brand-solid text-white hover:border-brand-solid_hover hover:bg-brand-solid_hover"
            : "border-secondary bg-white text-gray-600 hover:bg-gray-100",
    ),
    "button-gray": cx(
        isHovered && "bg-primary_hover text-secondary",
        isFocusVisible && "outline-2 -outline-offset-2",
        isSelected && "bg-active text-secondary",
    ),
    "button-border": cx((isSelected || isHovered) && "bg-primary_alt text-secondary shadow-sm", isFocusVisible && "outline-2 -outline-offset-2"),
    "button-minimal": cx(
        "rounded-lg",
        isHovered && "text-secondary",
        isFocusVisible && "outline-2 -outline-offset-2",
        isSelected && "bg-primary_alt text-secondary shadow-xs ring-1 ring-primary ring-inset",
    ),
    underline: cx(
        "rounded-none border-b-2 border-transparent",
        (isSelected || isHovered) && "border-fg-brand-primary_alt text-brand-secondary",
        isFocusVisible && "outline-2 -outline-offset-2",
    ),
    line: cx(
        "rounded-none border-l-2 border-transparent",
        (isSelected || isHovered) && "border-fg-brand-primary_alt text-brand-secondary",
        isFocusVisible && "outline-2 -outline-offset-2",
    ),
});

export const getTabHorizontalStyles = (opts: { size?: "sm" | "md"; fullWidth?: boolean }) => {
    const { size, fullWidth } = opts;
    return {
        "button-brand": "gap-1",
        "button-gray": "gap-1",
        "button-border": cx("gap-1 rounded-[10px] bg-secondary_alt p-1 ring-1 ring-secondary ring-inset", size === "md" && "rounded-xl p-1.5"),
        "button-minimal": "gap-0.5 rounded-lg bg-secondary_alt ring-1 ring-inset ring-secondary",
        underline: cx("gap-3", fullWidth && "w-full gap-4"),
        line: "gap-2",
    };
};

export const getTabColorStyles = ({ isSelected, isHovered }: Partial<AriaTabRenderProps>) => ({
    "button-brand": isSelected || isHovered ? "brand" : "gray",
    "button-gray": "gray",
    "button-border": "gray",
    "button-minimal": "gray",
    underline: isSelected || isHovered ? "brand" : "gray",
    line: isSelected || isHovered ? "brand" : "gray",
});
