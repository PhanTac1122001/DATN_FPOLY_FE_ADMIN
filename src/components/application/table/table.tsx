"use client";

import type { HTMLAttributes } from "react";
import { createContext, isValidElement, useContext } from "react";
import { ArrowDown, ChevronSelectorVertical } from "@untitledui/icons";
import {
    Cell as AriaCell,
    Checkbox as AriaCheckbox,
    Collection as AriaCollection,
    Column as AriaColumn,
    Group as AriaGroup,
    Row as AriaRow,
    RowProps as AriaRowProps,
    Table as AriaTable,
    TableBody as AriaTableBody,
    TableHeader as AriaTableHeader,
    useTableOptions,
} from "react-aria-components";
import { Badge } from "@/components/base/badges/badges";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { RadioButtonBase } from "@/components/base/radio-buttons/radio-buttons";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import { Copy01, Edit01, HelpCircle, Trash01 } from "@/components/icons";
import { ICON_COLORS } from "@/constants/app.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import type { TableCardHeaderProps, TableCellProps, TableHeadProps, TableHeaderProps, TableRootProps, TableRowProps } from "@/types/application.types";
import { cx } from "@/utils/cx";

export const TableRowActionsDropdown = () => (
    <Dropdown.Root>
        <Dropdown.DotsButton />

        <Dropdown.Popover className="w-min">
            <Dropdown.Menu>
                <Dropdown.Item icon={Edit01}>
                    <span className="pr-4">{UI_TEXT.common.actions.edit}</span>
                </Dropdown.Item>
                <Dropdown.Item icon={Copy01}>
                    <span className="pr-4">{UI_TEXT.common.actions.copyLink}</span>
                </Dropdown.Item>
                <Dropdown.Item icon={Trash01}>
                    <span className="pr-4">{UI_TEXT.common.actions.delete}</span>
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown.Popover>
    </Dropdown.Root>
);

const TableContext = createContext<{ size: "sm" | "md" }>({ size: "md" });
const OrderedSelectionContext = createContext<string[] | undefined>(undefined);

const TableCardRoot = ({ children, className, size = "md", ...props }: HTMLAttributes<HTMLDivElement> & { size?: "sm" | "md" }) => {
    return (
        <TableContext.Provider value={{ size }}>
            <div {...props} className={cx("overflow-hidden rounded-xl bg-primary shadow-xs ring-1 ring-secondary", className)}>
                {children}
            </div>
        </TableContext.Provider>
    );
};

const TableCardHeader = ({ title, badge, description, contentTrailing, className }: TableCardHeaderProps) => {
    const { size } = useContext(TableContext);

    return (
        <div
            className={cx(
                "relative flex flex-col items-start gap-4 border-b border-secondary bg-primary px-4 md:flex-row",
                size === "sm" ? "py-4 md:px-5" : "py-5 md:px-6",
                className,
            )}
        >
            <div className="flex flex-1 flex-col gap-0.5">
                <div className="flex items-center gap-2">
                    <h2 className={cx("font-semibold text-primary", size === "sm" ? "text-md" : "text-lg")}>{title}</h2>
                    {badge ? (
                        isValidElement(badge) ? (
                            badge
                        ) : (
                            <Badge color="brand" size="sm">
                                {badge}
                            </Badge>
                        )
                    ) : null}
                </div>
                {description && <p className="text-sm text-tertiary">{description}</p>}
            </div>
            {contentTrailing}
        </div>
    );
};

const TableRoot = ({ className, size = "md", containerRef, containerClassName, orderedSelection, ...props }: TableRootProps) => {
    const context = useContext(TableContext);

    return (
        <TableContext.Provider value={{ size: context?.size ?? size }}>
            <OrderedSelectionContext.Provider value={orderedSelection}>
                <div className={cx("overflow-x-auto", containerClassName)} ref={containerRef}>
                    <AriaTable
                        className={(state) => cx("w-full overflow-x-hidden", typeof className === "function" ? className(state) : className)}
                        {...props}
                    />
                </div>
            </OrderedSelectionContext.Provider>
        </TableContext.Provider>
    );
};
TableRoot.displayName = "Table";

const TableHeader = <T extends object>({ columns, children, bordered = true, className, ...props }: TableHeaderProps<T>) => {
    const { size } = useContext(TableContext);
    const { selectionBehavior, selectionMode } = useTableOptions();

    return (
        <AriaTableHeader
            {...props}
            className={(state) =>
                cx(
                    "relative",
                    size === "sm" ? "h-9" : "h-11",

                    // Row borderâ€”using an "after" pseudo-element to avoid the border taking up space.
                    bordered &&
                        "[&>tr>th]:after:pointer-events-none [&>tr>th]:after:absolute [&>tr>th]:after:inset-x-0 [&>tr>th]:after:bottom-0 [&>tr>th]:after:h-px [&>tr>th]:after:bg-border-secondary [&>tr>th]:focus-visible:after:bg-transparent",

                    typeof className === "function" ? className(state) : className,
                )
            }
        >
            {selectionBehavior === "toggle" && (
                <AriaColumn className={cx("relative py-2 pr-0 pl-4", size === "sm" ? "w-9 md:pl-5" : "w-11 md:pl-6")}>
                    {selectionMode === "multiple" && (
                        <div className="flex items-start">
                            <Checkbox slot="selection" size={size} />
                        </div>
                    )}
                </AriaColumn>
            )}
            <AriaCollection items={columns}>{children}</AriaCollection>
        </AriaTableHeader>
    );
};

TableHeader.displayName = "TableHeader";

const TableHead = ({ className, tooltip, label, children, sortDirection: customSortDirection, onSort, isRowHeader, ...props }: TableHeadProps) => {
    const { selectionBehavior } = useTableOptions();

    return (
        <AriaColumn
            {...props}
            isRowHeader={isRowHeader}
            className={(state) =>
                cx(
                    "relative p-0 px-6 py-2 outline-hidden focus-visible:z-1 focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-bg-primary focus-visible:ring-inset",
                    selectionBehavior === "toggle" && "nth-2:pl-3",
                    (state.allowsSorting || onSort) && "cursor-pointer",
                    typeof className === "function" ? className(state) : className,
                )
            }
        >
            {(state) => {
                // Use custom sort direction if provided, otherwise use React Aria state
                const effectiveSortDirection =
                    customSortDirection !== undefined ? (customSortDirection === null ? undefined : customSortDirection) : state.sortDirection;
                const isSortable = onSort || state.allowsSorting;

                return (
                    <AriaGroup
                        className="flex items-center justify-between gap-1"
                        onClick={
                            onSort
                                ? (e: React.MouseEvent) => {
                                      e.stopPropagation();
                                      onSort();
                                  }
                                : undefined
                        }
                    >
                        <div className="flex items-center gap-1">
                            {label && <span className="text-xs font-semibold whitespace-nowrap text-gray-300">{label}</span>}
                            {typeof children === "function" ? children(state) : children}
                        </div>

                        {tooltip && (
                            <Tooltip title={tooltip} placement="top">
                                <TooltipTrigger className="cursor-pointer text-fg-quaternary transition duration-100 ease-linear hover:text-fg-quaternary_hover focus:text-fg-quaternary_hover">
                                    <HelpCircle className="size-4" />
                                </TooltipTrigger>
                            </Tooltip>
                        )}

                        {isSortable &&
                            (effectiveSortDirection ? (
                                <ArrowDown
                                    color={ICON_COLORS.GRAY_300}
                                    className={cx("size-3 stroke-[3px]", effectiveSortDirection === "ascending" && "rotate-180")}
                                />
                            ) : (
                                <ChevronSelectorVertical color={ICON_COLORS.GRAY_300} size={12} strokeWidth={3} />
                            ))}
                    </AriaGroup>
                );
            }}
        </AriaColumn>
    );
};
TableHead.displayName = "TableHead";

const TableRow = <T extends object>({ columns, children, className, highlightSelectedRow = true, ...props }: TableRowProps<T>) => {
    const { size } = useContext(TableContext);
    const { selectionBehavior, selectionMode } = useTableOptions();
    const orderedSelection = useContext(OrderedSelectionContext);

    const rowId = props.id !== undefined ? String(props.id) : undefined;
    const isOrderedSelected = orderedSelection && rowId ? orderedSelection.includes(rowId) : false;
    const orderNumber = isOrderedSelected && orderedSelection ? orderedSelection.indexOf(rowId!) + 1 : null;
    const isUsingOrderedSelection = orderedSelection !== undefined;

    return (
        <AriaRow
            {...(props as AriaRowProps<T>)}
            className={(state) =>
                cx(
                    "relative border-l-4 border-transparent outline-focus-ring transition-colors after:pointer-events-none hover:border-[var(--color-brand-500)] hover:bg-secondary focus-visible:outline-2 focus-visible:-outline-offset-2",
                    highlightSelectedRow && "selected:border-[var(--color-brand-500)] selected:bg-secondary",

                    // Row border—using an "after" pseudo-element to avoid the border taking up space.
                    "[&>td]:py-[14px] [&>td]:after:absolute [&>td]:after:inset-x-0 [&>td]:after:bottom-0 [&>td]:after:h-px [&>td]:after:w-full [&>td]:after:bg-border-secondary last:[&>td]:after:hidden [&>td]:focus-visible:after:opacity-0",

                    typeof className === "function" ? className(state) : className,
                )
            }
        >
            {selectionBehavior === "toggle" && (
                <AriaCell className={cx("relative py-2 pr-0 pl-4", size === "sm" ? "md:pl-5" : "md:pl-6")}>
                    <div className="flex items-end">
                        {selectionMode === "single" ? (
                            <AriaCheckbox slot="selection" className="flex items-center justify-center">
                                {({ isSelected, isIndeterminate: _isIndeterminate, isDisabled, isFocusVisible }) => (
                                    <RadioButtonBase isSelected={isSelected} isDisabled={isDisabled} isFocusVisible={isFocusVisible} size={size} />
                                )}
                            </AriaCheckbox>
                        ) : isUsingOrderedSelection ? (
                            <AriaCheckbox
                                slot="selection"
                                className={({ isFocusVisible }) =>
                                    cx(
                                        "flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 font-bold transition-all duration-200 focus-visible:outline-hidden",
                                        isOrderedSelected
                                            ? "border-brand-500 bg-brand-500 text-white shadow-sm"
                                            : "border-slate-300 bg-white text-transparent hover:border-brand-300",
                                        isFocusVisible && "outline-2 outline-offset-2 outline-focus-ring",
                                    )
                                }
                            >
                                {() => (isOrderedSelected ? String(orderNumber) : "")}
                            </AriaCheckbox>
                        ) : (
                            <Checkbox slot="selection" size={size} />
                        )}
                    </div>
                </AriaCell>
            )}
            <AriaCollection items={columns}>{children}</AriaCollection>
        </AriaRow>
    );
};

TableRow.displayName = "TableRow";

const TableCell = ({ className, children, ...props }: TableCellProps) => {
    const { size } = useContext(TableContext);
    const { selectionBehavior } = useTableOptions();

    return (
        <AriaCell
            {...props}
            className={(state) =>
                cx(
                    "relative text-sm text-tertiary outline-focus-ring select-text focus-visible:z-1 focus-visible:outline-2 focus-visible:-outline-offset-2",
                    size === "sm" && "px-5 py-3",
                    size === "md" && "px-6 py-4",
                    selectionBehavior === "toggle" && "nth-2:pl-3",
                    typeof className === "function" ? className(state) : className,
                )
            }
        >
            {children}
        </AriaCell>
    );
};
TableCell.displayName = "TableCell";

const TableCard = {
    Root: TableCardRoot,
    Header: TableCardHeader,
};

const Table = TableRoot as typeof TableRoot & {
    Body: typeof AriaTableBody;
    Cell: typeof TableCell;
    Head: typeof TableHead;
    Header: typeof TableHeader;
    Row: typeof TableRow;
};
Table.Body = AriaTableBody;
Table.Cell = TableCell;
Table.Head = TableHead;
Table.Header = TableHeader;
Table.Row = TableRow;

export { Table, TableCard };
