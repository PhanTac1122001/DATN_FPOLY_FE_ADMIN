import type { ImageProps } from "next/image";

export interface ImageWithFallbackProps extends ImageProps {
    fallbackSrc?: string;
}

export interface TurnstileWidgetProps {
    onVerify: (token: string) => void;
    siteKey: string;
}

export interface TurnstileWidgetRef {
    reset: () => void;
}

export interface ReCAPTCHAWidgetProps {
    onVerify: (token: string) => void;
    siteKey: string;
}

export interface ReCAPTCHAWidgetRef {
    reset: () => void;
}
