import type {
    CompletionRule,
    CompletionRuleSelectableItem,
    CoursewareBlockEntity,
    RuleGroup,
    RuleGroupDraft,
    RuleItemKind,
    RuleItemRef,
    RuleItemScopeMode,
    RuleOperator,
} from "@/types/completion-rule.types";

const ruleOperators: RuleOperator[] = ["ALL", "ANY", "AT_LEAST_N"];
const ruleKinds: RuleItemKind[] = ["BLOCK", "LESSON"];

export function toRuleItemKey(kind: RuleItemKind, id: string): string {
    return `${kind}:${id}`;
}

export function parseRuleItemKey(key: string): RuleItemRef | null {
    const idx = key.indexOf(":");
    if (idx <= 0) return null;
    const kind = key.slice(0, idx) as RuleItemKind;
    const id = key.slice(idx + 1);
    if (!ruleKinds.includes(kind) || !id) return null;
    return { kind, id };
}

export function createDefaultGroupDraft(): RuleGroupDraft {
    return {
        operator: "ALL",
        scopeMode: "ALL_REQUIRED",
        selectedCategory: "BASIC_MATERIAL",
        selectedKeys: [],
    };
}

function normalizeOperator(value: unknown): RuleOperator {
    return ruleOperators.includes(value as RuleOperator) ? (value as RuleOperator) : "ALL";
}

function scopeModeFromItems(items: RuleItemRef[] | undefined, hasItemsKey: boolean): RuleItemScopeMode {
    if (!hasItemsKey) return "ALL_REQUIRED";
    if (!items || items.length === 0) return "NONE";
    return "CATEGORY";
}

/** Convert API rule → editable drafts. Never treat missing `items` as []. */
export function normalizeRuleFromApi(rule: CompletionRule | null | undefined): RuleGroupDraft[] {
    const groups = Array.isArray(rule?.groups) ? rule!.groups : [];
    if (groups.length === 0) {
        return [createDefaultGroupDraft()];
    }

    return groups.map((group) => {
        const src = (group ?? {}) as RuleGroup & Record<string, unknown>;
        const hasItemsKey = Object.prototype.hasOwnProperty.call(src, "items");
        const rawItems = Array.isArray(src.items) ? src.items : undefined;
        const items = (rawItems ?? [])
            .map((ref) => {
                const kind = ref?.kind as RuleItemKind | undefined;
                const id = ref?.id != null ? String(ref.id) : "";
                if (!kind || !ruleKinds.includes(kind) || !id) return null;
                return toRuleItemKey(kind, id);
            })
            .filter((k): k is string => !!k);

        const scopeMode = scopeModeFromItems(hasItemsKey ? (rawItems ?? []) : undefined, hasItemsKey);

        return {
            operator: normalizeOperator(src.operator),
            n: typeof src.n === "number" ? src.n : undefined,
            scopeMode,
            selectedCategory: "BASIC_MATERIAL",
            selectedKeys: scopeMode === "CATEGORY" ? items : [],
        };
    });
}

/**
 * Build PUT body. For ALL_REQUIRED, omit `items` entirely.
 * For NONE, send `items: []`. For CATEGORY, send selected refs.
 */
export function buildRulePayload(drafts: RuleGroupDraft[]): CompletionRule {
    return {
        groups: drafts.map((draft) => {
            const group: RuleGroup = { operator: draft.operator };
            if (draft.operator === "AT_LEAST_N") {
                group.n = draft.n && draft.n >= 1 ? draft.n : 1;
            }
            if (draft.scopeMode === "NONE") {
                group.items = [];
            } else if (draft.scopeMode === "CATEGORY") {
                group.items = draft.selectedKeys
                    .map(parseRuleItemKey)
                    .filter((ref): ref is RuleItemRef => !!ref);
            }
            // ALL_REQUIRED: leave items absent
            return group;
        }),
    };
}

export function pruneMissingItems(
    drafts: RuleGroupDraft[],
    availableKeys: Set<string>,
): { drafts: RuleGroupDraft[]; removedCount: number } {
    let removedCount = 0;
    const next = drafts.map((draft) => {
        if (draft.scopeMode !== "CATEGORY") return draft;
        const kept = draft.selectedKeys.filter((key) => availableKeys.has(key));
        removedCount += draft.selectedKeys.length - kept.length;
        return { ...draft, selectedKeys: kept };
    });
    return { drafts: next, removedCount };
}

export function getItemCategory(item: CompletionRuleSelectableItem): "LESSON" | "PRACTICE" | "BASIC_MATERIAL" {
    if (item.kind === "LESSON") return "LESSON";
    const type = (item.blockType || "").toUpperCase();
    const label = (item.label || "").toUpperCase();

    if (
        type === "PRACTICE" ||
        type === "ASSIGNMENT" ||
        type === "EXERCISE" ||
        label.includes("THỰC HÀNH")
    ) {
        return "PRACTICE";
    }

    return "BASIC_MATERIAL";
}

export function buildSessionSelectableItems(
    blocks: CoursewareBlockEntity[],
    lessons: Array<{ id: string; name?: string }>,
    _sessionData?: unknown,
): CompletionRuleSelectableItem[] {
    const items: CompletionRuleSelectableItem[] = [];

    // 1. Real Lessons
    lessons.forEach((l) => {
        items.push({
            key: toRuleItemKey("LESSON", l.id),
            kind: "LESSON",
            id: l.id,
            label: l.name || l.id,
            isRequired: true,
        });
    });

    // 2. Real ContentBlocks (all blocks attached to session)
    blocks.forEach((b) => {
        items.push({
            key: toRuleItemKey("BLOCK", b.id),
            kind: "BLOCK",
            id: b.id,
            label: b.title || b.type || b.id,
            isRequired: b.isRequired !== false,
            blockType: b.type,
            completionCriteria: b.completionCriteria || {},
        });
    });

    return items;
}

export function buildLessonSelectableItems(
    blocks: CoursewareBlockEntity[],
): CompletionRuleSelectableItem[] {
    return blocks.map((b) => ({
        key: toRuleItemKey("BLOCK", b.id),
        kind: "BLOCK",
        id: b.id,
        label: b.title || b.type || b.id,
        isRequired: b.isRequired !== false,
        blockType: b.type,
        completionCriteria: b.completionCriteria || {},
    }));
}

export function validateDraftsForSubmit(drafts: RuleGroupDraft[]): string | null {
    if (drafts.length === 0) {
        return "Cần ít nhất một nhóm điều kiện";
    }
    for (let i = 0; i < drafts.length; i++) {
        const g = drafts[i];
        if (g.scopeMode === "CATEGORY" && g.selectedKeys.length === 0) {
            return `Nhóm ${i + 1}: hãy chọn ít nhất một mục, hoặc đổi sang "Tất cả mục bắt buộc" / "Không điều kiện"`;
        }
        if (g.operator === "AT_LEAST_N" && (!g.n || g.n < 1)) {
            return `Nhóm ${i + 1}: số N phải ≥ 1`;
        }
    }
    return null;
}

export function isDefaultLessonRule(rule: CompletionRule | null | undefined): boolean {
    if (!rule || !Array.isArray(rule.groups) || rule.groups.length !== 1) return false;
    const g = rule.groups[0];
    if (g?.operator !== "ALL") return false;
    if (g?.items !== undefined) return false;
    return true;
}

