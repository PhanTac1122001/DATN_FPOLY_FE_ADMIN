"use client";

import { useCallback, useEffect, useRef } from "react";
import { type Config, type DriveStep, driver } from "driver.js";
import "driver.js/dist/driver.css";
import { UI_TEXT } from "@/constants/ui-text.constants";
import type { GuidedTourReturn } from "@/types/guided-tour.types";

/**
 * Bọc driver.js: nhận danh sách bước, trả về `start()` để mở tour khi user bấm.
 * Không tự chạy, không lưu trạng thái. Instance được huỷ khi component unmount.
 */
export function useGuidedTour(steps: DriveStep[], config?: Partial<Config>): GuidedTourReturn {
    const driverRef = useRef<ReturnType<typeof driver> | null>(null);

    useEffect(() => {
        return () => {
            driverRef.current?.destroy();
            driverRef.current = null;
        };
    }, []);

    const start = useCallback(() => {
        driverRef.current?.destroy();
        const instance = driver({
            showProgress: true,
            allowClose: true,
            nextBtnText: UI_TEXT.guidedTour.common.next,
            prevBtnText: UI_TEXT.guidedTour.common.prev,
            doneBtnText: UI_TEXT.guidedTour.common.done,
            steps,
            ...config,
        });
        driverRef.current = instance;
        instance.drive();
    }, [steps, config]);

    return { start };
}
