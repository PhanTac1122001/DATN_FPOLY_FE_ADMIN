import type { DriveStep } from "driver.js";
import { UI_TEXT } from "@/constants/ui-text.constants";

const t = UI_TEXT.guidedTour.typeDetailCourse;

/**
 * Các bước tour cho màn builder khóa học.
 * Bước trỏ tới phần tử có thể không tồn tại (vd nút "Điều kiện hoàn thành" chỉ hiện khi có buổi học)
 * sẽ được driver.js tự bỏ qua khi selector không match.
 */
export const typeDetailCourseTourSteps: DriveStep[] = [
    {
        element: '[data-tour="workspace"]',
        popover: { title: t.step1Title, description: t.step1Desc },
    },
    {
        element: '[data-tour="course-structure"]',
        popover: { title: t.step2Title, description: t.step2Desc },
    },
    {
        element: '[data-tour="add-session"]',
        popover: { title: t.step3Title, description: t.step3Desc },
    },
    {
        element: '[data-tour="config-panel"]',
        popover: { title: t.step4Title, description: t.step4Desc },
    },
    {
        element: '[data-tour="completion-conditions"]',
        popover: { title: t.step5Title, description: t.step5Desc },
    },
    {
        element: '[data-tour="save"]',
        popover: { title: t.step6Title, description: t.step6Desc },
    },
];
