"use client";

import { useState } from "react";
import { ArrowLeft2, ArrowRight2 } from "iconsax-react";
import { Pagination } from "@/components/application/pagination/pagination-base";
import { Select } from "@/components/base/select/select";
import { ICON_COLORS } from "@/constants/app.constants";
import { PAGE_SIZE_OPTIONS_EXTENDED } from "@/constants/table.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import type { TablePaginationProps } from "@/types/application.types";
import { cx } from "@/utils/cx";

export function TablePagination({
    total,
    page,
    totalPages,
    limit,
    onPageChange,
    onLimitChange,
    className,
    limitOptions = PAGE_SIZE_OPTIONS_EXTENDED,
}: TablePaginationProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState("");

    if (totalPages <= 0) return null;

    const handleStartEdit = () => {
        setInputValue(page.toString());
        setIsEditing(true);
    };

    const handlePageSubmit = () => {
        setIsEditing(false);
        const parsedPage = parseInt(inputValue, 10);
        if (!isNaN(parsedPage)) {
            const targetPage = Math.max(1, Math.min(parsedPage, totalPages));
            onPageChange(targetPage);
        }
    };

    return (
        <div className={className}>
            {/* Mobile Pagination */}
            <div className="flex w-full items-center justify-between sm:hidden">
                <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => onPageChange(page - 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-white transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Previous page"
                >
                    <ArrowLeft2 size={20} variant="Linear" color={ICON_COLORS.GRAY_800} />
                </button>

                {isEditing ? (
                    <div className="flex items-center gap-1">
                        <span className="text-base font-semibold text-slate-800">{UI_TEXT.common.pagination.page}</span>
                        <input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={totalPages}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handlePageSubmit();
                                } else if (e.key === "Escape") {
                                    setIsEditing(false);
                                }
                            }}
                            onBlur={handlePageSubmit}
                            className="w-14 [appearance:textfield] rounded-md border border-slate-300 bg-white py-0.5 text-center text-base font-semibold text-slate-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            autoFocus
                        />
                        <span className="text-base font-semibold text-slate-800">
                            {UI_TEXT.common.symbols.slash}
                            {totalPages}
                        </span>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={handleStartEdit}
                        className="rounded-md px-2 py-1 text-base font-semibold text-slate-800 transition-colors hover:bg-slate-100 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
                        title={UI_TEXT.common.pagination.clickToChangePage}
                    >
                        {UI_TEXT.common.pagination.page} {page}
                        {UI_TEXT.common.symbols.slash}
                        {totalPages}
                    </button>
                )}

                <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => onPageChange(page + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-white transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Next page"
                >
                    <ArrowRight2 size={20} variant="Linear" color={ICON_COLORS.GRAY_800} />
                </button>
            </div>

            {/* Desktop Pagination */}
            <div className="mt-1 hidden items-center justify-between sm:flex">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1 text-sm">
                        <span className="text-slate-800">{UI_TEXT.common.pagination.totalRecords}</span>
                        <span className="font-bold text-slate-900">{total}</span>
                    </div>
                </div>

                <Pagination.Root page={page} total={totalPages} onPageChange={onPageChange} siblingCount={1}>
                    <div className="flex items-center gap-4">
                        <Pagination.PrevTrigger asChild>
                            {({ isDisabled, onClick }) => (
                                <button
                                    type="button"
                                    disabled={isDisabled}
                                    onClick={onClick}
                                    className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-white transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    aria-label="Previous page"
                                >
                                    <ArrowLeft2 size={20} variant="Linear" color={ICON_COLORS.GRAY_800} />
                                </button>
                            )}
                        </Pagination.PrevTrigger>

                        <Pagination.Context>
                            {({ pages }) => (
                                <div className="flex items-center gap-2">
                                    {pages.map((pageItem, index) =>
                                        pageItem.type === "page" ? (
                                            <Pagination.Item key={index} value={pageItem.value} isCurrent={pageItem.isCurrent} asChild>
                                                <button
                                                    type="button"
                                                    className={cx(
                                                        "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
                                                        pageItem.isCurrent
                                                            ? "border-brand-500 bg-brand-500 text-white"
                                                            : "border-gray-100 bg-white text-slate-800 hover:bg-slate-50",
                                                    )}
                                                >
                                                    {pageItem.value}
                                                </button>
                                            </Pagination.Item>
                                        ) : (
                                            <Pagination.Ellipsis key={index} className="flex h-10 w-10 items-center justify-center text-slate-500">
                                                {UI_TEXT.common.symbols.ellipsis}
                                            </Pagination.Ellipsis>
                                        ),
                                    )}
                                </div>
                            )}
                        </Pagination.Context>

                        <Pagination.NextTrigger asChild>
                            {({ isDisabled, onClick }) => (
                                <button
                                    type="button"
                                    disabled={isDisabled}
                                    onClick={onClick}
                                    className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-white transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    aria-label="Next page"
                                >
                                    <ArrowRight2 size={20} variant="Linear" color={ICON_COLORS.GRAY_800} />
                                </button>
                            )}
                        </Pagination.NextTrigger>

                        <Select
                            selectedKey={limit.toString()}
                            onSelectionChange={(key) => {
                                onLimitChange(Number(key));
                            }}
                            placeholder={`${limit}${UI_TEXT.common.pagination.perPage}`}
                            size="sm"
                            isClearable={false}
                            triggerClassName="!rounded-full "
                            items={limitOptions.map((opt) => ({
                                id: opt.toString(),
                                label: `${opt}${UI_TEXT.common.pagination.perPage}`,
                            }))}
                        >
                            {(item) => <Select.Item {...item}>{item.label}</Select.Item>}
                        </Select>
                    </div>
                </Pagination.Root>
            </div>
        </div>
    );
}
