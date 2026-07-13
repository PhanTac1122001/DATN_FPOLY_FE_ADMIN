import type { SVGProps } from "react";

export type BaseSvgIconProps = SVGProps<SVGSVGElement> & {
    size?: number;
    color?: string;
};

export type FlexibleSvgIconProps = Omit<BaseSvgIconProps, "size"> & {
    size?: number | string;
    width?: number | string;
    height?: number | string;
};

export type XIconProps = BaseSvgIconProps & {
    strokeWidth?: number;
};
