"use client";

import {
    Label as AriaLabel,
    Slider as AriaSlider,
    SliderOutput as AriaSliderOutput,
    SliderThumb as AriaSliderThumb,
    SliderTrack as AriaSliderTrack,
} from "react-aria-components";
import { SLIDER_DEFAULT_MAX_VALUE, SLIDER_PERCENTAGE_MULTIPLIER } from "@/constants/base-components.constants";
import type { SliderProps } from "@/types/base-components.types";
import { cx, sortCx } from "@/utils/cx";

const styles = sortCx({
    default: "hidden",
    bottom: "absolute top-2 left-1/2 -translate-x-1/2 translate-y-full text-md font-medium text-primary",
    "top-floating":
        "absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-secondary shadow-lg ring-1 ring-secondary_alt",
});

export const Slider = ({
    labelPosition = "default",
    minValue = 0,
    maxValue = SLIDER_DEFAULT_MAX_VALUE,
    labelFormatter,
    formatOptions,
    trackInactiveClassName = "bg-brand-100",
    trackActiveClassName = "bg-brand-solid",
    thumbClassName,
    ...rest
}: SliderProps) => {
    const thumbBaseClassName = "top-1/2 box-border size-6 cursor-grab rounded-full shadow-md ring-2 ring-inset";
    // Format thumb value as percentage by default.
    const defaultFormatOptions: Intl.NumberFormatOptions = {
        style: "percent",
        maximumFractionDigits: 0,
    };

    return (
        <AriaSlider {...rest} {...{ minValue, maxValue }} formatOptions={formatOptions ?? defaultFormatOptions}>
            <AriaLabel />
            <AriaSliderTrack className="relative h-6 w-full">
                {({ state: { values, getThumbValue, getThumbPercent, getFormattedValue } }) => {
                    const left = values.length === 1 ? 0 : getThumbPercent(0);
                    const width = values.length === 1 ? getThumbPercent(0) : getThumbPercent(1) - left;

                    return (
                        <>
                            <span className={cx("absolute top-1/2 h-2 w-full -translate-y-1/2 rounded-full", trackInactiveClassName)} />
                            <span
                                className={cx("absolute top-1/2 h-2 w-full -translate-y-1/2 rounded-full", trackActiveClassName)}
                                style={{
                                    left: `${left * SLIDER_PERCENTAGE_MULTIPLIER}%`,
                                    width: `${width * SLIDER_PERCENTAGE_MULTIPLIER}%`,
                                }}
                            />
                            {values.map((_, index) => {
                                return (
                                    <AriaSliderThumb
                                        key={index}
                                        index={index}
                                        className={({ isFocusVisible, isDragging }) =>
                                            cx(
                                                thumbBaseClassName,
                                                thumbClassName ?? "bg-slider-handle-bg ring-slider-handle-border",
                                                isFocusVisible && "outline-2 outline-offset-2 outline-focus-ring",
                                                isDragging && "cursor-grabbing",
                                            )
                                        }
                                    >
                                        <AriaSliderOutput className={cx("whitespace-nowrap", styles[labelPosition])}>
                                            {labelFormatter
                                                ? labelFormatter(getThumbValue(index))
                                                : getFormattedValue(getThumbValue(index) / SLIDER_DEFAULT_MAX_VALUE)}
                                        </AriaSliderOutput>
                                    </AriaSliderThumb>
                                );
                            })}
                        </>
                    );
                }}
            </AriaSliderTrack>
        </AriaSlider>
    );
};
