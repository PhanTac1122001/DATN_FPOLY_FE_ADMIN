"use client";

import type { FC, HTMLAttributes } from "react";
import { cloneElement, createContext, isValidElement, useContext, useMemo } from "react";
import { ELLIPSIS_THRESHOLD, FIRST_PAGE, PAGE_COUNT_MULTIPLIER, PAGE_STEP, RANGE_OFFSET, TOTAL_PAGE_NUMBERS_OFFSET } from "@/constants/application.constants";
import type {
    PaginationContextComponentProps,
    PaginationContextType,
    PaginationEllipsisProps,
    PaginationItemProps,
    PaginationItemType,
    PaginationRootProps,
    TriggerProps,
} from "@/types/application.types";
import { range } from "@/utils/number.utils";

const PaginationContext = createContext<PaginationContextType | undefined>(undefined);

const PaginationRoot = ({ total, siblingCount = 1, page, onPageChange, children, style, className }: PaginationRootProps) => {
    const pages = useMemo(() => {
        const items: PaginationItemType[] = [];
        // Calculate the maximum number of pagination elements (pages, potential ellipsis, first and last) to show
        const totalPageNumbers = siblingCount * PAGE_COUNT_MULTIPLIER + TOTAL_PAGE_NUMBERS_OFFSET;

        // If the total number of items to show is greater than or equal to the total pages,
        // we can simply list all pages without needing to collapse with ellipsis
        if (totalPageNumbers >= total) {
            for (let i = FIRST_PAGE; i <= total; i++) {
                items.push({
                    type: "page",
                    value: i,
                    isCurrent: i === page,
                });
            }
        } else {
            // Calculate left and right sibling boundaries around the current page
            const leftSiblingIndex = Math.max(page - siblingCount, FIRST_PAGE);
            const rightSiblingIndex = Math.min(page + siblingCount, total);

            // Determine if we need to show ellipsis on either side
            const showLeftEllipsis = leftSiblingIndex > ELLIPSIS_THRESHOLD;
            const showRightEllipsis = rightSiblingIndex < total - FIRST_PAGE;

            // Case 1: No left ellipsis, but right ellipsis is needed
            if (!showLeftEllipsis && showRightEllipsis) {
                // Calculate how many page numbers to show starting from the beginning
                const leftItemCount = siblingCount * PAGE_COUNT_MULTIPLIER + RANGE_OFFSET;
                const leftRange = range(FIRST_PAGE, leftItemCount);

                leftRange.forEach((pageNum) =>
                    items.push({
                        type: "page",
                        value: pageNum,
                        isCurrent: pageNum === page,
                    }),
                );

                // Insert ellipsis after the left range and add the last page
                items.push({ type: "ellipsis", key: leftItemCount + PAGE_STEP });
                items.push({
                    type: "page",
                    value: total,
                    isCurrent: total === page,
                });
            }
            // Case 2: Left ellipsis needed, but right ellipsis is not needed
            else if (showLeftEllipsis && !showRightEllipsis) {
                // Determine how many items from the end should be shown
                const rightItemCount = siblingCount * PAGE_COUNT_MULTIPLIER + RANGE_OFFSET;
                const rightRange = range(total - rightItemCount + PAGE_STEP, total);

                // Always show the first page, then add an ellipsis to indicate skipped pages
                items.push({
                    type: "page",
                    value: FIRST_PAGE,
                    isCurrent: page === FIRST_PAGE,
                });
                items.push({ type: "ellipsis", key: total - rightItemCount });
                rightRange.forEach((pageNum) =>
                    items.push({
                        type: "page",
                        value: pageNum,
                        isCurrent: pageNum === page,
                    }),
                );
            }
            // Case 3: Both left and right ellipsis are needed
            else if (showLeftEllipsis && showRightEllipsis) {
                // Always show the first page
                items.push({
                    type: "page",
                    value: FIRST_PAGE,
                    isCurrent: page === FIRST_PAGE,
                });
                // Insert left ellipsis after the first page
                items.push({ type: "ellipsis", key: leftSiblingIndex - PAGE_STEP });

                // Show a range of pages around the current page
                const middleRange = range(leftSiblingIndex, rightSiblingIndex);
                middleRange.forEach((pageNum) =>
                    items.push({
                        type: "page",
                        value: pageNum,
                        isCurrent: pageNum === page,
                    }),
                );

                // Insert right ellipsis and finally the last page
                items.push({ type: "ellipsis", key: rightSiblingIndex + PAGE_STEP });
                items.push({
                    type: "page",
                    value: total,
                    isCurrent: total === page,
                });
            }
        }

        return items;
    }, [total, siblingCount, page]);

    const onPageChangeHandler = (newPage: number) => {
        onPageChange?.(newPage);
    };

    const paginationContextValue: PaginationContextType = {
        pages,
        currentPage: page,
        total,
        onPageChange: onPageChangeHandler,
    };

    return (
        <PaginationContext.Provider value={paginationContextValue}>
            <nav aria-label="Pagination Navigation" style={style} className={className}>
                {children}
            </nav>
        </PaginationContext.Provider>
    );
};

const Trigger: FC<TriggerProps> = ({ children, style, className, asChild = false, direction, ariaLabel }) => {
    const context = useContext(PaginationContext);
    if (!context) {
        throw new Error("Pagination components must be used within a Pagination.Root");
    }

    const { currentPage, total, onPageChange } = context;

    const isDisabled = direction === "prev" ? currentPage <= FIRST_PAGE : currentPage >= total;

    const handleClick = () => {
        if (isDisabled) return;

        const newPage = direction === "prev" ? currentPage - PAGE_STEP : currentPage + PAGE_STEP;
        onPageChange?.(newPage);
    };

    const computedClassName = typeof className === "function" ? className({ isDisabled }) : className;

    const defaultAriaLabel = direction === "prev" ? "Previous Page" : "Next Page";

    // If the children is a render prop, we need to pass the isDisabled and onClick to the render prop.
    if (typeof children === "function") {
        return <>{children({ isDisabled, onClick: handleClick })}</>;
    }

    // If the children is a valid element, we need to clone it and pass the isDisabled and onClick to the cloned element.
    if (asChild && isValidElement(children)) {
        return cloneElement(children, {
            onClick: handleClick,
            disabled: isDisabled,
            isDisabled,
            "aria-label": ariaLabel || defaultAriaLabel,
            style: { ...(children.props as HTMLAttributes<HTMLElement>).style, ...style },
            className: [computedClassName, (children.props as HTMLAttributes<HTMLElement>).className].filter(Boolean).join(" ") || undefined,
        } as HTMLAttributes<HTMLElement>);
    }

    return (
        <button aria-label={ariaLabel || defaultAriaLabel} onClick={handleClick} disabled={isDisabled} style={style} className={computedClassName}>
            {children}
        </button>
    );
};

const PaginationPrevTrigger: FC<Omit<TriggerProps, "direction">> = (props) => <Trigger {...props} direction="prev" />;

const PaginationNextTrigger: FC<Omit<TriggerProps, "direction">> = (props) => <Trigger {...props} direction="next" />;

const PaginationItem = ({ value, isCurrent, children, style, className, ariaLabel, asChild = false }: PaginationItemProps) => {
    const context = useContext(PaginationContext);
    if (!context) {
        throw new Error("Pagination components must be used within a <Pagination.Root />");
    }

    const { onPageChange } = context;

    const isSelected = isCurrent;

    const handleClick = () => {
        onPageChange?.(value);
    };

    const computedClassName = typeof className === "function" ? className({ isSelected }) : className;

    // If the children is a render prop, we need to pass the necessary props to the render prop.
    if (typeof children === "function") {
        return (
            <>
                {children({
                    isSelected,
                    onClick: handleClick,
                    value,
                    "aria-current": isCurrent ? "page" : undefined,
                    "aria-label": ariaLabel || `Page ${value}`,
                })}
            </>
        );
    }

    // If the children is a valid element, we need to clone it and pass the necessary props to the cloned element.
    if (asChild && isValidElement(children)) {
        return cloneElement(children, {
            onClick: handleClick,
            "aria-current": isCurrent ? "page" : undefined,
            "aria-label": ariaLabel || `Page ${value}`,
            style: { ...(children.props as HTMLAttributes<HTMLElement>).style, ...style },
            className: [computedClassName, (children.props as HTMLAttributes<HTMLElement>).className].filter(Boolean).join(" ") || undefined,
        } as HTMLAttributes<HTMLElement>);
    }

    return (
        <button
            onClick={handleClick}
            style={style}
            className={computedClassName}
            aria-current={isCurrent ? "page" : undefined}
            aria-label={ariaLabel || `Page ${value}`}
            role="listitem"
        >
            {children}
        </button>
    );
};

const PaginationEllipsis: FC<PaginationEllipsisProps> = ({ children, style, className }) => {
    const computedClassName = typeof className === "function" ? className() : className;

    return (
        <span style={style} className={computedClassName} aria-hidden="true">
            {children}
        </span>
    );
};

const PaginationContextComponent: FC<PaginationContextComponentProps> = ({ children }) => {
    const context = useContext(PaginationContext);
    if (!context) {
        throw new Error("Pagination components must be used within a Pagination.Root");
    }

    return <>{children(context)}</>;
};

export const Pagination = {
    Root: PaginationRoot,
    PrevTrigger: PaginationPrevTrigger,
    NextTrigger: PaginationNextTrigger,
    Item: PaginationItem,
    Ellipsis: PaginationEllipsis,
    Context: PaginationContextComponent,
};
