/**
 * Paginated response wrapper
 */
export type ApiListMeta = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

export interface PaginatedResponse<T> {
    data: T[];
    pagination?: ApiListMeta;
    meta?: ApiListMeta;
}

/**
 * Base Entity with common fields
 */
export interface BaseEntity {
    id: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * API error response
 */
export interface ApiError {
    message: string | string[];
    error?: string;
    statusCode: number;
}

/**
 * Common query parameters for list endpoints
 */
export interface ListQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

/**
 * Advanced filter condition
 */
export interface FilterCondition {
    fieldKey: string;
    operator: FilterOperator;
    value?: unknown;
}

/**
 * Filter operators
 */
/**
 * Filter operators
 */
export enum FilterOperator {
    CONTAINS = "CONTAINS",
    NOT_CONTAINS = "NOT_CONTAINS",
    EQUALS = "EQUALS",
    NOT_EQUALS = "NOT_EQUALS",
    STARTS_WITH = "STARTS_WITH",
    ENDS_WITH = "ENDS_WITH",
    IS_EMPTY = "IS_EMPTY",
    IS_NOT_EMPTY = "IS_NOT_EMPTY",
    GREATER_THAN = "GREATER_THAN",
    GREATER_THAN_OR_EQUAL = "GREATER_THAN_OR_EQUAL",
    LESS_THAN = "LESS_THAN",
    LESS_THAN_OR_EQUAL = "LESS_THAN_OR_EQUAL",
    IN = "IN",
    NOT_IN = "NOT_IN",
}

/**
 * Advanced filter request
 */
export interface AdvancedFilterRequest {
    filters: FilterCondition[];
}

/**
 * Sort column configuration
 */
export interface SortColumn {
    field: string;
    direction: "asc" | "desc";
}

/**
 * Common user status enum
 */
export enum UserStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
}

/**
 * Common role codes for LMS Portal
 */
export enum RoleCode {
    ADMIN = "ADMIN",
    INSTRUCTOR = "INSTRUCTOR",
    STUDENT = "STUDENT",
}

export enum HttpMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
    PATCH = "PATCH",
}

export interface SuccessResponse {
    success: boolean;
}
