export const getTableSortDirection = (field: string, sortBy?: string, sortOrder?: "asc" | "desc"): "ascending" | "descending" | null => {
    if (sortBy !== field || !sortOrder) {
        return null;
    }

    return sortOrder === "asc" ? "ascending" : "descending";
};
