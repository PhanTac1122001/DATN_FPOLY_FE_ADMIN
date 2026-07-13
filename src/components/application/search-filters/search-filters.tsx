import { CloseCircle, Filter, SearchNormal1 } from "iconsax-react";
import { AdvancedFilter } from "@/components/application/advanced-filter/advanced-filter";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { ICON_COLORS } from "@/constants/app.constants";
import type { SearchFiltersProps } from "@/types/application.types";
import { cx } from "@/utils/cx";

export function SearchFilters({
    search,
    onSearchChange,
    isMobileSearchVisible,
    setIsMobileSearchVisible,
    advancedFilterState,
    setAdvancedFilterState,
    filterFields,
    searchPlaceholder = "Tìm kiếm...",
    filterButtonText = "Bộ lọc",
}: SearchFiltersProps) {
    return (
        <>
            {/* Search on Mobile */}
            <div className={cx("sm:hidden", isMobileSearchVisible && "flex-1")}>
                {isMobileSearchVisible ? (
                    <div className="relative flex w-full items-center gap-2">
                        <Input
                            placeholder={searchPlaceholder}
                            value={search}
                            onChange={onSearchChange}
                            iconTrailing={(props) => <SearchNormal1 {...props} size={16} variant="Linear" color={ICON_COLORS.GRAY_400} />}
                            inputClassName="placeholder:text-slate-400"
                            autoFocus
                            className="flex-1"
                        />
                        <Button
                            color="tertiary"
                            size="sm"
                            onClick={() => {
                                setIsMobileSearchVisible(false);
                                onSearchChange("");
                            }}
                            iconLeading={(props) => <CloseCircle {...props} size={16} variant="Linear" color={ICON_COLORS.GRAY_500} />}
                        />
                    </div>
                ) : (
                    <Button
                        color="secondary-gray"
                        size="md"
                        onClick={() => setIsMobileSearchVisible(true)}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-white p-0! text-slate-600"
                    >
                        <SearchNormal1 size={20} variant="Linear" color={ICON_COLORS.GRAY_600} />
                    </Button>
                )}
            </div>

            {/* Search on Desktop */}
            <div className="relative hidden w-70 max-w-full sm:block">
                <Input
                    placeholder={searchPlaceholder}
                    value={search}
                    onChange={onSearchChange}
                    iconTrailing={(props) => <SearchNormal1 {...props} size={16} variant="Linear" color={ICON_COLORS.GRAY_400} />}
                    inputClassName="placeholder:text-slate-400"
                />
            </div>

            {/* Advanced Filter */}
            {!isMobileSearchVisible && (
                <AdvancedFilter
                    fields={filterFields}
                    value={advancedFilterState}
                    onChange={setAdvancedFilterState}
                    trigger={
                        <Button
                            color="secondary-gray"
                            size="md"
                            className={cx(
                                "rounded-full",
                                advancedFilterState.conditions.length > 0
                                    ? "bg-blue-25! text-blue-400! shadow-blue-100 ring-blue-100! hover:bg-blue-50!"
                                    : "bg-white text-slate-600",
                                "flex h-10 w-10 items-center justify-center p-0! sm:h-auto sm:w-auto sm:px-3.5! sm:py-2.5!",
                            )}
                        >
                            <div className="flex items-center justify-center">
                                <Filter
                                    size={20}
                                    variant="Linear"
                                    color={advancedFilterState.conditions.length > 0 ? ICON_COLORS.BLUE_400 : ICON_COLORS.GRAY_600}
                                />
                                <span className="ml-2 hidden sm:inline">{filterButtonText}</span>
                                {advancedFilterState.conditions.length > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-error-500 text-[10px] font-semibold text-white ring-2 ring-white sm:relative sm:top-0 sm:right-0 sm:ml-2 sm:rounded-lg sm:ring-0">
                                        {advancedFilterState.conditions.length}
                                    </span>
                                )}
                            </div>
                        </Button>
                    }
                />
            )}
        </>
    );
}
