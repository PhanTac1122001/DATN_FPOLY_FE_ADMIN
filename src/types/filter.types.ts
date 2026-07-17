/**
 * Advanced Filter System Types
 *
 * This file defines types for a reusable multi-condition filter system
 * Shared filter types used across list views in the LMS Portal.
 */

/**
 * Field types supported by the filter system
 */
export enum FilterFieldType {
    STRING = "STRING",
    NUMBER = "NUMBER",
    DATE = "DATE",
    ENUM = "ENUM",
    BOOLEAN = "BOOLEAN",
    SELECT = "SELECT",
}

/**
 * Comparison operators for different field types
 */
export enum FilterOperator {
    // String operators
    CONTAINS = "CONTAINS",
    NOT_CONTAINS = "NOT_CONTAINS",
    EQUALS = "EQUALS",
    NOT_EQUALS = "NOT_EQUALS",
    STARTS_WITH = "STARTS_WITH",
    ENDS_WITH = "ENDS_WITH",
    IS_EMPTY = "IS_EMPTY",
    IS_NOT_EMPTY = "IS_NOT_EMPTY",

    // Number/Date operators
    GREATER_THAN = "GREATER_THAN",
    GREATER_THAN_OR_EQUAL = "GREATER_THAN_OR_EQUAL",
    LESS_THAN = "LESS_THAN",
    LESS_THAN_OR_EQUAL = "LESS_THAN_OR_EQUAL",

    // Enum/Boolean operators
    IN = "IN",
    NOT_IN = "NOT_IN",
}

/**
 * Field definition for the filter system
 */
export interface FilterFieldDefinition {
    /** Unique key for the field */
    key: string;
    /** Display label for the field */
    label: string;
    /** Field type (determines available operators) */
    type: FilterFieldType;
    /** Options for enum/select fields */
    options?: Array<{ id: string; label: string }>;
    /** API URL to dynamically fetch options for SELECT type */
    optionsUrl?: string;
    /** Placeholder text for input */
    placeholder?: string;
}

/**
 * A single filter condition
 */
export interface FilterCondition {
    /** Unique ID for this condition */
    id: string;
    /** Field key being filtered */
    fieldKey: string;
    /** Comparison operator */
    operator: FilterOperator;
    /** Filter value (can be string, number, date, array for IN/NOT_IN) */
    value: string | number | Date | boolean | string[] | null;
}

/**
 * Complete filter state
 */
export interface FilterState {
    /** Array of filter conditions */
    conditions: FilterCondition[];
}

/**
 * Props for the AdvancedFilter component
 */
export interface AdvancedFilterProps {
    /** Available fields for filtering */
    fields: FilterFieldDefinition[];
    /** Current filter state */
    value: FilterState;
    /** Callback when filter changes */
    onChange: (filter: FilterState) => void;
    /** Optional: Maximum number of conditions allowed */
    maxConditions?: number;
    /** Trigger element */
    trigger: React.ReactNode;
    /** Hide operator selector */
    hideOperator?: boolean;
}

export interface SelectFilterInputProps {
    optionsUrl: string;
    value: string | string[] | null;
    onChange: (value: string | string[] | null) => void;
    supportsMultiple: boolean;
    placeholder?: string;
}

/**
 * Get available operators for a field type
 */
export const getOperatorsForFieldType = (fieldType: FilterFieldType): FilterOperator[] => {
    switch (fieldType) {
        case FilterFieldType.STRING:
            return [
                FilterOperator.CONTAINS,
                FilterOperator.NOT_CONTAINS,
                FilterOperator.EQUALS,
                FilterOperator.NOT_EQUALS,
                FilterOperator.STARTS_WITH,
                FilterOperator.ENDS_WITH,
                FilterOperator.IS_EMPTY,
                FilterOperator.IS_NOT_EMPTY,
            ];

        case FilterFieldType.NUMBER:
        case FilterFieldType.DATE:
            return [
                FilterOperator.EQUALS,
                FilterOperator.NOT_EQUALS,
                FilterOperator.GREATER_THAN,
                FilterOperator.GREATER_THAN_OR_EQUAL,
                FilterOperator.LESS_THAN,
                FilterOperator.LESS_THAN_OR_EQUAL,
            ];

        case FilterFieldType.ENUM:
        case FilterFieldType.SELECT:
            return [FilterOperator.EQUALS, FilterOperator.NOT_EQUALS, FilterOperator.IN, FilterOperator.NOT_IN];

        case FilterFieldType.BOOLEAN:
            return [FilterOperator.EQUALS];

        default:
            return [FilterOperator.EQUALS];
    }
};

/**
 * Check if operator requires a value input
 */
export const operatorRequiresValue = (operator: FilterOperator): boolean => {
    return ![FilterOperator.IS_EMPTY, FilterOperator.IS_NOT_EMPTY].includes(operator);
};

/**
 * Check if operator supports multiple values (for IN/NOT_IN)
 */
export const operatorSupportsMultipleValues = (operator: FilterOperator): boolean => {
    return [FilterOperator.IN, FilterOperator.NOT_IN].includes(operator);
};
