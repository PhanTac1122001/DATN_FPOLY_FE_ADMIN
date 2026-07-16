import type { BadgeColors } from "@/components/base/badges/badge-types";

export function getBadgeColorForSemester(semesterName: string): BadgeColors {
    const name = semesterName.toLowerCase();
    if (name.includes("hướng dẫn") || name.includes("hdsd")) return "warning";
    if (name.includes("kỳ i") || name.includes("kỳ 1")) return "blue-light";
    if (name.includes("kỳ ii") || name.includes("kỳ 2")) return "success";
    if (name.includes("kỳ iii") || name.includes("kỳ 3")) return "orange";
    if (name.includes("kỳ iv") || name.includes("kỳ 4")) return "error";
    if (name.includes("kỳ v") || name.includes("kỳ 5")) return "purple";
    return "gray";
}
