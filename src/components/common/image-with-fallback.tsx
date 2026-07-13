"use client";

import { useState } from "react";
import Image from "next/image";
import type { ImageWithFallbackProps } from "@/types/common-components.types";

export function ImageWithFallback({ fallbackSrc, alt, src, ...props }: ImageWithFallbackProps) {
    const [error, setError] = useState(false);
    const [prevSrc, setPrevSrc] = useState(src);

    if (src !== prevSrc) {
        setPrevSrc(src);
        setError(false);
    }

    return <Image alt={alt} onError={() => setError(true)} src={error ? fallbackSrc || "/placeholder-img.svg" : src} {...props} />;
}
