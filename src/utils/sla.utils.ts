import { AlertTriangle, Clock, LucideIcon, Timer } from "lucide-react";
import {
    DEFAULT_SLA_HOURS,
    MAX_LOOP_MINUTES,
    MINS_PER_HOUR,
    WARNING_THRESHOLD_HOURS,
    WORK_DAY_END,
    WORK_DAY_START,
    WORK_HOUR_END,
    WORK_HOUR_START,
} from "@/constants/sla.constants";

export interface SLAResult {
    deadlineDate: Date;
    formattedDeadline: string;
    remainingWorkingMinutes: number;
    formattedRemaining: string;
    isOverdue: boolean;
    isWarning: boolean;
    statusLabel: string;
    statusClass: string;
    badgeIcon: LucideIcon;
}

/**
 * Tính toán SLA thời gian xử lý đơn (mặc định 24 giờ làm việc = 3 ngày làm việc 8h-17h, trừ T7, CN & giờ nghỉ)
 */
export function calculateWorkingSLA(submittedAtIso: string, slaHours = DEFAULT_SLA_HOURS, endDateIso?: string): SLAResult {
    const submittedDate = new Date(submittedAtIso);
    if (Number.isNaN(submittedDate.getTime())) {
        return {
            deadlineDate: new Date(),
            formattedDeadline: "—",
            remainingWorkingMinutes: 0,
            formattedRemaining: "—",
            isOverdue: false,
            isWarning: false,
            statusLabel: "N/A",
            statusClass: "bg-slate-100 text-slate-600 border border-slate-200",
            badgeIcon: Clock,
        };
    }

    const targetEnd = endDateIso ? new Date(endDateIso) : null;
    const now = targetEnd && !Number.isNaN(targetEnd.getTime()) ? targetEnd : new Date();

    // Đếm số phút làm việc đã trôi qua từ lúc gửi đến mốc thời gian kết thúc/hiện tại
    const current = new Date(submittedDate.getTime());
    let elapsedWorkingMinutes = 0;

    // Giới hạn max loop để tránh lặp vô tận nếu dữ liệu ngày quá cũ
    const maxMinutes = MAX_LOOP_MINUTES;
    let loopCount = 0;

    while (current < now && loopCount < maxMinutes) {
        const day = current.getDay();
        const hour = current.getHours();
        // Giờ làm việc: Thứ 2 (1) -> Thứ 6 (5), 08:00 -> 17:00
        if (day >= WORK_DAY_START && day <= WORK_DAY_END && hour >= WORK_HOUR_START && hour < WORK_HOUR_END) {
            elapsedWorkingMinutes += 1;
        }
        current.setMinutes(current.getMinutes() + 1);
        loopCount += 1;
    }

    const totalSLAWorkingMinutes = slaHours * MINS_PER_HOUR;
    const remainingMinutes = totalSLAWorkingMinutes - elapsedWorkingMinutes;

    const isOverdue = remainingMinutes < 0;
    const isWarning = !isOverdue && remainingMinutes <= WARNING_THRESHOLD_HOURS * MINS_PER_HOUR;

    const absMinutes = Math.abs(remainingMinutes);
    const hours = Math.floor(absMinutes / MINS_PER_HOUR);
    const mins = absMinutes % MINS_PER_HOUR;
    const formattedRemaining = isOverdue ? `Quá hạn ${hours}h ${mins}m` : `Còn ${hours}h ${mins}m`;

    let statusLabel = "";
    let statusClass = "";
    let badgeIcon: LucideIcon = Clock;

    if (isOverdue) {
        statusLabel = `${formattedRemaining}`;
        statusClass = "bg-rose-50 text-rose-700 border border-rose-300 font-extrabold";
        badgeIcon = AlertTriangle;
    } else if (isWarning) {
        statusLabel = `${formattedRemaining} `;
        statusClass = "bg-amber-50 text-amber-700 border border-amber-300 font-bold";
        badgeIcon = AlertTriangle;
    } else {
        statusLabel = `${formattedRemaining} `;
        statusClass = "bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold";
        badgeIcon = Timer;
    }

    // Tính hạn chót SLA
    const deadlineCounter = new Date(submittedDate.getTime());
    let addedWorkingMins = 0;
    let deadlineLoop = 0;
    while (addedWorkingMins < totalSLAWorkingMinutes && deadlineLoop < maxMinutes) {
        const day = deadlineCounter.getDay();
        const hour = deadlineCounter.getHours();
        if (day >= WORK_DAY_START && day <= WORK_DAY_END && hour >= WORK_HOUR_START && hour < WORK_HOUR_END) {
            addedWorkingMins += 1;
        }
        deadlineCounter.setMinutes(deadlineCounter.getMinutes() + 1);
        deadlineLoop += 1;
    }

    return {
        deadlineDate: deadlineCounter,
        formattedDeadline: deadlineCounter.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        }),
        remainingWorkingMinutes: remainingMinutes,
        formattedRemaining,
        isOverdue,
        isWarning,
        statusLabel,
        statusClass,
        badgeIcon,
    };
}
