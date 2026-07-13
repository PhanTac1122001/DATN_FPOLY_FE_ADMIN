/* eslint-disable @typescript-eslint/no-explicit-any, unused-imports/no-unused-vars */
"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ComboBox } from "@/components/base/select/combobox";
import { Select } from "@/components/base/select/select";
import { XIcon } from "@/components/icons/x-icon";
import { ICON_COLORS } from "@/constants/app.constants";
import { OPTIONS_STALE_TIME } from "@/constants/options.constants";
import { fetchOptions } from "@/services/options.service";
import type { SelectFilterInputProps } from "@/types/filter.types";
import type { OptionItem } from "@/types/options.types";

const pageSizeLimit = 50;
const debounceDelayMs = 300;

export function SelectFilterInput({ optionsUrl, value, onChange, supportsMultiple, placeholder = "Chọn..." }: SelectFilterInputProps) {
    const [inputValue, setInputValue] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    // Cache map for resolving ID to Name/Label
    const [labelsMap, setLabelsMap] = useState<Record<string, string>>({});

    // Flag to prevent debounce from triggering a new search after selection
    const isSelectingRef = useRef(false);

    // Ref to the wrapper div to find and blur the input after selection
    const wrapperRef = useRef<HTMLDivElement>(null);

    const blurInput = () => {
        const input = wrapperRef.current?.querySelector("input");
        if (input) {
            input.blur();
        }
    };

    // Synchronize search immediately when inputValue changes (since ComboBox already handles input debounce internally)
    useEffect(() => {
        // Skip search update when inputValue was changed by selection, not user typing
        if (isSelectingRef.current) {
            isSelectingRef.current = false;
            return;
        }

        setSearch(inputValue);
        setPage(1);
    }, [inputValue]);

    const lastSyncedValueRef = useRef<string | null>(null);

    // Synchronize selected option label to inputValue (for single select)
    useEffect(() => {
        if (!supportsMultiple) {
            if (typeof value === "string" && value) {
                if (value !== lastSyncedValueRef.current) {
                    const label = labelsMap[value];
                    if (label) {
                        setInputValue(label);
                        lastSyncedValueRef.current = value;
                    }
                }
            } else if (!value) {
                if (lastSyncedValueRef.current !== null) {
                    setInputValue("");
                    lastSyncedValueRef.current = null;
                }
            }
        }
    }, [value, labelsMap, supportsMultiple]);

    // Fetch options page-by-page with TanStack Query caching
    const {
        data: fetchedOptions,
        isLoading,
        isFetching,
    } = useQuery({
        queryKey: ["options", optionsUrl, search, page],
        queryFn: () => fetchOptions(optionsUrl, { search, page, limit: pageSizeLimit }),
        staleTime: OPTIONS_STALE_TIME,
        placeholderData: (previousData) => previousData,
    });

    // Accumulated options across pages
    const [options, setOptions] = useState<OptionItem[]>([]);
    const [hasNextPage, setHasNextPage] = useState(true);

    // Merge fetched data into accumulated options and labelsMap
    useEffect(() => {
        if (!fetchedOptions) return;

        const newOptions = fetchedOptions.map((item) => ({
            id: item.id,
            label: item.label || (item as any).name || (item as any).fullName || "",
        }));

        setOptions((prev) => {
            const combined = page === 1 ? newOptions : [...prev, ...newOptions];
            // Deduplicate
            const seen = new Set<string>();
            return combined.filter((item) => {
                if (seen.has(item.id)) return false;
                seen.add(item.id);
                return true;
            });
        });

        setLabelsMap((prev) => {
            const updated = { ...prev };
            newOptions.forEach((item) => {
                updated[item.id] = item.label;
            });
            return updated;
        });

        setHasNextPage(newOptions.length === pageSizeLimit);
    }, [fetchedOptions, page]);

    // Resolve any selected IDs that are not present in the labelsMap via the options API
    const idsToResolve = (Array.isArray(value) ? value : value ? [value] : []).filter((id) => !labelsMap[id]);

    const { data: resolvedOptions } = useQuery({
        queryKey: ["options", optionsUrl, "resolve", ...idsToResolve],
        queryFn: () => fetchOptions(optionsUrl, { ids: idsToResolve.join(",") }),
        staleTime: OPTIONS_STALE_TIME,
        enabled: idsToResolve.length > 0,
    });

    // Merge resolved labels into labelsMap
    useEffect(() => {
        if (!resolvedOptions) return;

        setLabelsMap((prev) => {
            const updated = { ...prev };
            resolvedOptions.forEach((item) => {
                updated[item.id] = item.label || (item as any).name || (item as any).fullName || "";
            });
            // Mark any unresolved IDs to prevent re-fetching
            idsToResolve.forEach((id) => {
                if (!updated[id]) {
                    updated[id] = id;
                }
            });
            return updated;
        });
    }, [resolvedOptions, idsToResolve]);

    const isLoadingMore = page > 1 && isFetching;
    const isLoadingFirstPage = isFetching && page === 1;

    const handleLoadMore = () => {
        if (hasNextPage && !isFetching) {
            setPage((prev) => prev + 1);
        }
    };

    if (supportsMultiple) {
        const selectedList = Array.isArray(value) ? value : value ? [value] : [];

        return (
            <div ref={wrapperRef} className="flex flex-col gap-2">
                {/* Selected Tags list */}
                {selectedList.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 rounded-lg py-1.5">
                        {selectedList.map((id) => (
                            <div key={id} className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
                                {labelsMap[id] || id}
                                <button
                                    type="button"
                                    onClick={() => {
                                        onChange(selectedList.filter((v) => v !== id));
                                    }}
                                    className="ml-1 flex items-center justify-center hover:text-blue-900"
                                    aria-label="Remove"
                                >
                                    <XIcon size={14} color={ICON_COLORS.BLUE_400} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                {/* Searchable ComboBox to add new items */}
                <div className="min-w-[150px] flex-1">
                    <ComboBox
                        placeholder={placeholder}
                        selectedKey={null}
                        onSelectionChange={(key) => {
                            isSelectingRef.current = true;
                            if (key && !selectedList.includes(key as string)) {
                                onChange([...selectedList, key as string]);
                            }
                            setInputValue("");
                            // Blur input to close menu (menuTrigger="focus" keeps it open while focused)
                            requestAnimationFrame(() => blurInput());
                        }}
                        inputValue={inputValue}
                        onInputChange={setInputValue}
                        items={options}
                        isLoading={isLoadingFirstPage}
                        isLoadingMore={isLoadingMore}
                        hasNextPage={hasNextPage}
                        onLoadMore={handleLoadMore}
                        size="md"
                    >
                        {(item) => <Select.Item id={item.id} label={item.label} />}
                    </ComboBox>
                </div>
            </div>
        );
    }

    // Single-select implementation
    const selectedKey = typeof value === "string" ? value : null;

    return (
        <div ref={wrapperRef}>
            <ComboBox
                placeholder={placeholder}
                selectedKey={selectedKey}
                onSelectionChange={(key) => {
                    isSelectingRef.current = true;
                    onChange((key as string) || null);
                    // Blur input to close menu (menuTrigger="focus" keeps it open while focused)
                    requestAnimationFrame(() => blurInput());
                }}
                inputValue={inputValue}
                onInputChange={setInputValue}
                items={options}
                isLoading={isLoadingFirstPage}
                isLoadingMore={isLoadingMore}
                hasNextPage={hasNextPage}
                onLoadMore={handleLoadMore}
                size="md"
            >
                {(item) => <Select.Item id={item.id} label={item.label} />}
            </ComboBox>
        </div>
    );
}
