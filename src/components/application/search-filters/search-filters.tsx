import { Filter, Search } from "lucide-react";
import { AdvancedFilter } from "@/components/application/advanced-filter/advanced-filter";
import { UI_TEXT } from "@/constants/ui-text.constants";
import type { SearchFiltersProps } from "@/types/application.types";

export function SearchFilters({
    search,
    onSearchChange,
    advancedFilterState,
    setAdvancedFilterState,
    filterFields,
    searchPlaceholder = "Tìm kiếm...",
}: SearchFiltersProps) {
    return (
        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
            {/* Search Input */}
            <div className="relative w-full max-w-xs">
                <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full rounded-full border border-slate-200 bg-slate-50/50 py-2 pr-10 pl-4 text-sm text-slate-900 placeholder-slate-400 transition outline-none focus:border-wine focus:bg-white focus:ring-1 focus:ring-wine"
                />
                <span className="absolute inset-y-0 right-3 flex items-center text-slate-400">
                    <Search className="size-4" />
                </span>
            </div>

            {/* Advanced Filter */}
            <AdvancedFilter
                fields={filterFields}
                value={advancedFilterState}
                onChange={setAdvancedFilterState}
                hideOperator={true}
                trigger={
                    <button
                        type="button"
                        className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                        <Filter className="size-4" />
                        <span>{UI_TEXT.filter.title}</span>
                        {advancedFilterState.conditions.length > 0 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-wine text-xs font-bold text-white">
                                {advancedFilterState.conditions.length}
                            </span>
                        )}
                    </button>
                }
            />
        </div>
    );
}
