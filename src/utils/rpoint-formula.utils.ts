import type { RpointFormula } from "@/types/rpoint.types";

export function cloneRpointFormula(formula: RpointFormula): RpointFormula {
    return JSON.parse(JSON.stringify(formula)) as RpointFormula;
}
