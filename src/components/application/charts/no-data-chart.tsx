import { NoData } from "@/components/icons/no-data";
import { UI_TEXT } from "@/constants/ui-text.constants";

export function NoDataChart() {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-4">
            <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-slate-50">
                <NoData />
            </div>
            <div className="text-sm text-slate-500">{UI_TEXT.common.charts.noData}</div>
        </div>
    );
}
