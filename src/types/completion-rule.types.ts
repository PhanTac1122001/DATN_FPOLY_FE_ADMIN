export type RuleOperator = "ALL" | "ANY" | "AT_LEAST_N";
export type RuleItemKind = "BLOCK" | "LESSON";

export interface RuleItemRef {
    kind: RuleItemKind;
    id: string;
}

export interface RuleGroup {
    operator: RuleOperator;
    n?: number;
    /** Absent = all required items in scope. Empty array = no items (always satisfied). */
    items?: RuleItemRef[];
}

export interface CompletionRule {
    groups: RuleGroup[];
}

export interface RuleIssue {
    code: string;
    message: string;
    groupIndex?: number;
    itemKey?: string;
}

export type RuleItemScopeMode = "ALL_REQUIRED" | "CATEGORY" | "NONE";
export type SelectableCategoryType = "BASIC_MATERIAL" | "LESSON" | "PRACTICE";

export interface RuleGroupDraft {
    operator: RuleOperator;
    n?: number;
    scopeMode: RuleItemScopeMode;
    selectedCategory?: SelectableCategoryType;
    selectedKeys: string[];
}

export interface CompletionRuleSelectableItem {
    key: string;
    kind: RuleItemKind;
    id: string;
    label: string;
    isRequired: boolean;
    blockType?: string;
    completionCriteria?: Record<string, unknown>;
}

export interface CoursewareBlockEntity {
    id: string;
    type: string;
    title: string;
    isRequired: boolean;
    position?: number;
    payload?: Record<string, unknown>;
    completionCriteria?: Record<string, unknown>;
}

export interface SessionCompletionRuleModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    sessionId?: string;
    sessionName?: string;
    sessions?: Array<{ id: string; name: string }>;
    onBackToSessionSelect?: () => void;
}
