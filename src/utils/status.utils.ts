import { BadgeColors } from "@/components/base/badges/badge-types";
import { UserStatus } from "@/types/api-types";

export const getUserStatusBadgeColor = (status: UserStatus): BadgeColors => {
    switch (status) {
        case UserStatus.ACTIVE:
            return "success";
        case UserStatus.INACTIVE:
            return "gray";
        default:
            return "gray";
    }
};
