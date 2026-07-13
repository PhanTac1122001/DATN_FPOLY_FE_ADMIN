import type { BadgeTypeToColorMap } from "@/components/base/badges/badge-types";
import { BADGE_WITH_PILL_TYPES } from "@/constants/badge.constants";
import type { BadgeTypes } from "@/types/base-components.types";

/**
 * BadgeColor type - derives color options based on badge type (kept for reference)
 */
export type BadgeColor<T extends BadgeTypes> = BadgeTypeToColorMap<typeof BADGE_WITH_PILL_TYPES>[T];
