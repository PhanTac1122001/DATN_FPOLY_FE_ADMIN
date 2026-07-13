import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { NoData } from "@/components/icons/no-data";
import type { TableEmptyStateProps } from "@/types/application.types";

export function TableEmptyState({ isLoading, emptyText, children }: TableEmptyStateProps) {
    if (isLoading) {
        return (
            <div className="sticky left-0 flex items-center justify-center py-12" style={{ width: "var(--table-view-width, 100%)" }}>
                <LoadingIndicator size="lg" type="line-spinner" />
            </div>
        );
    }
    return (
        <div
            className="sticky left-0 flex flex-col items-center justify-center gap-3 py-12 text-sm text-slate-500"
            style={{ width: "var(--table-view-width, 100%)" }}
        >
            <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-slate-50">
                <NoData />
            </div>
            {children || emptyText}
        </div>
    );
}
