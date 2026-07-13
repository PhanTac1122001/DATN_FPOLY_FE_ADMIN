/**
 * Application Component Types
 * This file contains all interfaces and types used by application components.
 */
import type { CSSProperties, ComponentPropsWithRef, HTMLAttributes, ReactNode, Ref, TdHTMLAttributes, ThHTMLAttributes } from "react";
import type { DateValue } from "@internationalized/date";
import type {
    CalendarCellProps as AriaCalendarCellProps,
    CalendarProps as AriaCalendarProps,
    CellProps as AriaCellProps,
    ColumnProps as AriaColumnProps,
    DateInputProps as AriaDateInputProps,
    DatePickerProps as AriaDatePickerProps,
    DateRangePickerProps as AriaDateRangePickerProps,
    DialogProps as AriaDialogProps,
    ModalOverlayProps as AriaModalOverlayProps,
    ModalRenderProps as AriaModalRenderProps,
    RangeCalendarProps as AriaRangeCalendarProps,
    RowProps as AriaRowProps,
    TabListProps as AriaTabListProps,
    TabProps as AriaTabProps,
    TabRenderProps as AriaTabRenderProps,
    TableHeaderProps as AriaTableHeaderProps,
    TableProps as AriaTableProps,
    TabListRenderProps,
} from "react-aria-components";
import type { FilterFieldDefinition, FilterState } from "@/types/filter.types";

// ============================================================================
// Advanced Filter Types
// ============================================================================

export interface AdvancedFilterProps {
    /** Available fields for filtering */
    fields: FilterFieldDefinition[];
    /** Current filter state */
    value: FilterState;
    /** Callback when filter changes */
    onChange: (filter: FilterState) => void;
    /** Optional: Maximum number of conditions allowed */
    maxConditions?: number;
    /** Trigger button element */
    trigger: React.ReactNode;
}

// ============================================================================
// Search Filters Types
// ============================================================================

export interface SearchFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    isMobileSearchVisible: boolean;
    setIsMobileSearchVisible: (visible: boolean) => void;
    advancedFilterState: FilterState;
    setAdvancedFilterState: (filter: FilterState) => void;
    filterFields: FilterFieldDefinition[];
    searchPlaceholder?: string;
    filterButtonText?: string;
}

// ============================================================================
// Breadcrumb Types
// ============================================================================

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

export interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

// ============================================================================
// Stepper Types
// ============================================================================

export interface StepItem {
    step: number;
    title: string;
    subtitle: string;
}

export interface StepperProps {
    steps: StepItem[];
    currentStep: number;
    className?: string;
}

// ============================================================================
// Date Picker Types
// ============================================================================

export interface CalendarProps extends AriaCalendarProps<DateValue> {
    /** The dates to highlight. */
    highlightedDates?: DateValue[];
}

export interface CalendarCellProps extends AriaCalendarCellProps {
    /** Whether the calendar is a range calendar. */
    isRangeCalendar?: boolean;
    /** Whether the cell is highlighted. */
    isHighlighted?: boolean;
}

export type DateInputProps = Omit<AriaDateInputProps, "children">;

export interface DatePickerProps extends AriaDatePickerProps<DateValue> {
    /** The function to call when the apply button is clicked. */
    onApply?: () => void;
    /** The function to call when the cancel button is clicked. */
    onCancel?: () => void;
}

export interface DateRangePickerProps extends AriaDateRangePickerProps<DateValue> {
    /** The function to call when the apply button is clicked. */
    onApply?: () => void;
    /** The function to call when the cancel button is clicked. */
    onCancel?: () => void;
}

export interface RangeCalendarProps extends AriaRangeCalendarProps<DateValue> {
    /** The dates to highlight. */
    highlightedDates?: DateValue[];
    /** The date presets to display. */
    presets?: Record<string, { label: string; value: { start: DateValue; end: DateValue } }>;
}

export interface RangePresetButtonProps extends HTMLAttributes<HTMLButtonElement> {
    value: { start: DateValue; end: DateValue };
}

// ============================================================================
// Loading Indicator Types
// ============================================================================

export interface LoadingIndicatorProps {
    /**
     * The visual style of the loading indicator.
     * @default 'line-spinner'
     */
    type?: "line-simple" | "line-spinner" | "dot-circle";
    /**
     * The size of the loading indicator.
     * @default 'sm'
     */
    size?: "sm" | "md" | "lg" | "xl";
    /**
     * Optional text label displayed below the indicator.
     */
    label?: string;
}

// ============================================================================
// Modal Types
// ============================================================================

export interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info" | "primary" | "brand";
    isLoading?: boolean;
    icon?: React.ReactNode;
    modalClassName?: string;
}

export type NotificationModalVariant = "success" | "error" | "warning" | "info";

export interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    variant?: NotificationModalVariant;
    title: string;
    message: ReactNode;
    buttonText?: string;
    onButtonClick?: () => void;
    showCloseButton?: boolean;
}

// ============================================================================
// Pagination Types
// ============================================================================

export type PaginationPage = {
    /** The type of the pagination item. */
    type: "page";
    /** The value of the pagination item. */
    value: number;
    /** Whether the pagination item is the current page. */
    isCurrent: boolean;
};

export type PaginationEllipsisType = {
    type: "ellipsis";
    key: number;
};

export type PaginationItemType = PaginationPage | PaginationEllipsisType;

export interface PaginationContextType {
    /** The pages of the pagination. */
    pages: PaginationItemType[];
    /** The current page of the pagination. */
    currentPage: number;
    /** The total number of pages. */
    total: number;
    /** The function to call when the page changes. */
    onPageChange: (page: number) => void;
}

export interface PaginationRootProps {
    /** Number of sibling pages to show on each side of the current page */
    siblingCount?: number;
    /** Current active page number */
    page: number;
    /** Total number of pages */
    total: number;
    children: ReactNode;
    /** The style of the pagination root. */
    style?: CSSProperties;
    /** The class name of the pagination root. */
    className?: string;
    /** Callback function that's called when the page changes with the new page number. */
    onPageChange?: (page: number) => void;
}

export interface TriggerRenderProps {
    isDisabled: boolean;
    onClick: () => void;
}

export interface TriggerProps {
    /** The children of the trigger. Can be a render prop or a valid element. */
    children: ReactNode | ((props: TriggerRenderProps) => ReactNode);
    /** The style of the trigger. */
    style?: CSSProperties;
    /** The class name of the trigger. */
    className?: string | ((args: { isDisabled: boolean }) => string);
    /** If true, the child element will be cloned and passed down the prop of the trigger. */
    asChild?: boolean;
    /** The direction of the trigger. */
    direction: "prev" | "next";
    /** The aria label of the trigger. */
    ariaLabel?: string;
}

export interface PaginationItemRenderProps {
    isSelected: boolean;
    onClick: () => void;
    value: number;
    "aria-current"?: "page";
    "aria-label"?: string;
}

export interface PaginationItemProps {
    /** The value of the pagination item. */
    value: number;
    /** Whether the pagination item is the current page. */
    isCurrent: boolean;
    /** The children of the pagination item. Can be a render prop or a valid element. */
    children?: ReactNode | ((props: PaginationItemRenderProps) => ReactNode);
    /** The style object of the pagination item. */
    style?: CSSProperties;
    /** The class name of the pagination item. */
    className?: string | ((args: { isSelected: boolean }) => string);
    /** The aria label of the pagination item. */
    ariaLabel?: string;
    /** If true, the child element will be cloned and passed down the prop of the item. */
    asChild?: boolean;
}

export interface PaginationEllipsisProps {
    key: number;
    children?: ReactNode;
    style?: CSSProperties;
    className?: string | (() => string);
}

export interface PaginationContextComponentProps {
    children: (pagination: PaginationContextType) => ReactNode;
}

export interface PaginationDotProps extends Omit<PaginationRootProps, "children"> {
    /** The size of the pagination dot. */
    size?: "md" | "lg";
    /** Whether the pagination uses brand colors. */
    isBrand?: boolean;
    /** Whether the pagination is displayed in a card. */
    framed?: boolean;
}

export interface PaginationLineProps extends Omit<PaginationRootProps, "children"> {
    /** The size of the pagination line. */
    size?: "md" | "lg";
    /** Whether the pagination is displayed in a card. */
    framed?: boolean;
}

export interface PaginationProps extends Partial<Omit<PaginationRootProps, "children">> {
    /** Whether the pagination buttons are rounded. */
    rounded?: boolean;
}

export interface MobilePaginationProps {
    /** The current page. */
    page?: number;
    /** The total number of pages. */
    total?: number;
    /** The class name of the pagination component. */
    className?: string;
    /** The function to call when the page changes. */
    onPageChange?: (page: number) => void;
}

export interface PaginationCardMinimalProps {
    /** The current page. */
    page?: number;
    /** The total number of pages. */
    total?: number;
    /** The alignment of the pagination. */
    align?: "left" | "center" | "right";
    /** The class name of the pagination component. */
    className?: string;
    /** The function to call when the page changes. */
    onPageChange?: (page: number) => void;
}

export interface PaginationButtonGroupProps extends Partial<Omit<PaginationRootProps, "children">> {
    /** The alignment of the pagination. */
    align?: "left" | "center" | "right";
}

export interface TablePaginationProps {
    /** The total number of records. */
    total: number;
    /** The current page number. */
    page: number;
    /** The total number of pages. */
    totalPages: number;
    /** The current page limit. */
    limit: number;
    /** Callback function when the page changes. */
    onPageChange: (page: number) => void;
    /** Callback function when the page limit changes. */
    onLimitChange: (limit: number) => void;
    /** Optional list of limit choices. */
    limitOptions?: readonly number[];
    /** The class name of the pagination component. */
    className?: string;
}

// ============================================================================
// Slideout Menu Types
// ============================================================================

export type ModalOverlayProps = AriaModalOverlayProps & { ref?: Ref<HTMLDivElement> };

export type ModalProps = AriaModalOverlayProps & { ref?: Ref<HTMLDivElement> };

export type DialogProps = AriaDialogProps & { ref?: Ref<HTMLElement> };

export interface SlideoutMenuProps extends Omit<AriaModalOverlayProps, "children"> {
    ref?: Ref<HTMLDivElement>;
    children: ReactNode | ((children: AriaModalRenderProps & { close: () => void }) => ReactNode);
    dialogClassName?: string;
}

export interface SlideoutHeaderProps extends ComponentPropsWithRef<"header"> {
    onClose?: () => void;
}

// ============================================================================
// Table Types
// ============================================================================

export interface TableEmptyStateProps {
    isLoading: boolean;
    emptyText: string;
    children?: ReactNode;
}

export interface TableCardHeaderProps {
    /** The title of the table card header. */
    title: string;
    /** The badge displayed next to the title. */
    badge?: ReactNode;
    /** The description of the table card header. */
    description?: string;
    /** The content displayed after the title and badge. */
    contentTrailing?: ReactNode;
    /** The class name of the table card header. */
    className?: string;
}

export interface TableRootProps extends AriaTableProps, Omit<ComponentPropsWithRef<"table">, "className" | "slot" | "style"> {
    size?: "sm" | "md";
    containerRef?: Ref<HTMLDivElement>;
    containerClassName?: string;
    orderedSelection?: string[];
}

export interface TableHeaderProps<T extends object>
    extends AriaTableHeaderProps<T>, Omit<ComponentPropsWithRef<"thead">, "children" | "className" | "slot" | "style"> {
    bordered?: boolean;
}

export interface TableHeadProps extends AriaColumnProps, Omit<ThHTMLAttributes<HTMLTableCellElement>, "children" | "className" | "style" | "id"> {
    label?: string;
    tooltip?: string;
    /** Custom sort direction (overrides React Aria sort state) */
    sortDirection?: "ascending" | "descending" | null;
    /** Custom sort handler */
    onSort?: () => void;
    /** Whether this column is a row header (for accessibility) */
    isRowHeader?: boolean;
}

export interface TableRowProps<T extends object>
    extends AriaRowProps<T>, Omit<ComponentPropsWithRef<"tr">, "children" | "className" | "onClick" | "slot" | "style" | "id"> {
    highlightSelectedRow?: boolean;
}

export interface TableCellProps extends AriaCellProps, Omit<TdHTMLAttributes<HTMLTableCellElement>, "children" | "className" | "style" | "id"> {
    ref?: Ref<HTMLTableCellElement>;
    /** Whether this cell is a row header (for accessibility) */
    isRowHeader?: boolean;
}

// ============================================================================
// Tabs Types
// ============================================================================

export type TabsOrientation = "horizontal" | "vertical";

export type HorizontalTabTypes = "button-brand" | "button-gray" | "button-border" | "button-minimal" | "underline";
export type VerticalTabTypes = "button-brand" | "button-gray" | "button-border" | "button-minimal" | "line";
export type TabTypeColors<T> = T extends "horizontal" ? HorizontalTabTypes : VerticalTabTypes;

export interface TabListComponentProps<T extends object, K extends TabsOrientation> extends AriaTabListProps<T> {
    /** The size of the tab list. */
    size?: "sm" | "md";
    /** The type of the tab list. */
    type?: TabTypeColors<K>;
    /** The orientation of the tab list. */
    orientation?: K;
    /** The items of the tab list. */
    items: T[];
    /** Whether the tab list is full width. */
    fullWidth?: boolean;
    /** The class name of the tab list. */
    className?: string | ((values: TabListRenderProps & { defaultClassName: string | undefined }) => string);
}

export interface TabComponentProps extends AriaTabProps {
    /** The label of the tab. */
    label?: ReactNode;
    /** The children of the tab. */
    children?: ReactNode | ((props: AriaTabRenderProps) => ReactNode);
    /** The badge displayed next to the label. */
    badge?: number | string;
}
