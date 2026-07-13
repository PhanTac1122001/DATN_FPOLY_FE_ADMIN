import { ReactNode } from "react";
import { cx } from "@/utils/cx";

export function PageContainer({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cx("mx-auto grid w-full max-w-[1440px] grid-cols-12 gap-6 px-4 py-8 md:px-6 lg:px-8", className)}>{children}</div>;
}
