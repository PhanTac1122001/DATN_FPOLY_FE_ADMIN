"use client";

import { useEffect, useState } from "react";
import { LOADING_SPLASH_DELAY_MS } from "@/constants/common-components.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";

export function LoadingOverlay() {
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowSplash(false), LOADING_SPLASH_DELAY_MS);
        return () => clearTimeout(timer);
    }, []);

    if (!showSplash) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-white">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500" />
            <p className="text-base font-semibold text-gray-900">{UI_TEXT.common.appName}</p>
        </div>
    );
}
