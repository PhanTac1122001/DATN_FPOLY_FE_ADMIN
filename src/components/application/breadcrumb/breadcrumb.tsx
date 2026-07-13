import { ArrowRight2 } from "iconsax-react";
import { Route } from "next";
import Link from "next/link";
import { ICON_COLORS } from "@/constants/app.constants";
import { useUnsavedChangesStore } from "@/stores/unsaved-changes-store";
import type { BreadcrumbItem, BreadcrumbProps } from "@/types/application.types";

export type { BreadcrumbItem };

export function Breadcrumb({ items }: BreadcrumbProps) {
    const { isDirty, setGlobalConfirmOpen, setPendingRoute } = useUnsavedChangesStore();

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        if (isDirty) {
            e.preventDefault();
            setPendingRoute(href);
            setGlobalConfirmOpen(true);
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                    <div key={index} className="flex items-center gap-2">
                        {item.href && !isLast ? (
                            <Link
                                href={item.href as Route}
                                onClick={(e) => handleLinkClick(e, item.href as string)}
                                className="text-sm font-medium text-slate-400 transition-colors hover:text-slate-600 sm:whitespace-nowrap"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className={`text-sm font-medium sm:whitespace-nowrap ${isLast ? "text-slate-950" : "text-slate-400"}`}>{item.label}</span>
                        )}

                        {!isLast && <ArrowRight2 size={16} variant="Linear" color={ICON_COLORS.GRAY_400} />}
                    </div>
                );
            })}
        </div>
    );
}
