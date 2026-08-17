"use client";

import { useState } from "react";
import { Book, Bot, ChevronDown, Layers, LogOut, Notebook, PieChart } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { diemItems, dtItems, elearningItems } from "@/constants/admin-sidebar.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { useLogout } from "@/hooks/use-logout";
import { cx } from "@/utils/cx";
import { isGroupActive, isRouteActive } from "@/utils/route.utils";

function SidebarLink({ href, label, icon: Icon }: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }) {
    const pathname = usePathname();
    const isSubActive = isRouteActive(pathname, href);
    return (
        <Link
            href={href as Route}
            className={cx(
                "menu-item flex w-full items-center justify-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition duration-150 lg:justify-start",
                isSubActive
                    ? "bg-white font-extrabold text-brand-500 shadow-[0_6px_16px_-8px_rgba(0,0,0,0.4)] hover:bg-white"
                    : "text-nav-100 hover:bg-white/10 hover:text-white",
            )}
        >
            <Icon className="size-[18px] shrink-0" />
            <span className="hidden lg:inline">{label}</span>
        </Link>
    );
}

const pathSegmentsLimit = 3;

export function AdminSidebar() {
    const pathname = usePathname();
    const { logout, isLoggingOut } = useLogout();

    const isCourseDetailPage =
        pathname.startsWith("/elearning/") || (pathname.startsWith("/type/") && pathname.split("/").filter(Boolean).length >= pathSegmentsLimit);

    const isDtActive = isGroupActive(pathname, dtItems);
    const isElearningActive = isGroupActive(pathname, elearningItems) || pathname.startsWith("/elearning");
    const isDiemActive = isGroupActive(pathname, diemItems);
    const isChatbotActive = pathname.startsWith("/chatbot");

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
        dt: isDtActive,
        elearning: isElearningActive,
        diem: isDiemActive,
    });

    const toggleGroup = (group: string) => {
        setOpenGroups((prev) => ({
            ...prev,
            [group]: !prev[group],
        }));
    };

    return (
        <aside
            className={cx(
                "sticky top-0 flex h-screen w-20 flex-col bg-gradient-to-b from-nav-500 to-nav-700 p-6 text-nav-100 transition-all duration-300 lg:w-[270px]",
                isCourseDetailPage && "course-detail-sidebar",
            )}
        >
            {/* Logo block */}
            <div className="logo-container flex flex-col justify-center gap-2 pb-4.5 lg:justify-start">
                {/* Logo Image wrapper for expanded sidebar */}
                <div className="hidden w-full rounded-xl bg-white px-3 py-[9px] shadow-[0_6px_16px_-8px_rgba(0,0,0,0.4)] lg:block">
                    <Image
                        src="/assets/rikkei-logo.png"
                        alt={UI_TEXT.layout.adminSidebar.logoAlt}
                        width={172}
                        height={40}
                        className="mx-auto block h-auto w-full max-w-[172px] object-contain"
                        priority
                    />
                </div>
                <div className="mt-1 hidden pl-0.5 text-[11px] font-semibold tracking-[0.06em] text-nav-300 uppercase lg:block">
                    {UI_TEXT.layout.adminSidebar.adminPortalLabel}
                </div>
            </div>

            {/* Menu Items */}
            <div className="sidebar-menu-wrapper custom-scrollbar my-4 -mr-6 flex-1 overflow-y-auto pr-5">
                <Link
                    href="/"
                    className={cx(
                        "menu-item flex w-full items-center justify-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition duration-150 lg:justify-start",
                        pathname === "/"
                            ? "bg-white font-extrabold text-brand-500 shadow-[0_6px_16px_-8px_rgba(0,0,0,0.4)] hover:bg-white"
                            : "text-nav-100 hover:bg-white/10 hover:text-white",
                    )}
                >
                    <PieChart className="size-[18px] shrink-0" />
                    <span className="hidden lg:inline">{UI_TEXT.layout.adminSidebar.statisticsLabel}</span>
                </Link>

                {/* Collapsible Group: Quản lý đào tạo */}
                <div className="menu-collapsible-group mt-1">
                    <button
                        onClick={() => toggleGroup("dt")}
                        className={cx(
                            "menu-group-header flex w-full items-center justify-between justify-center rounded-xl px-3.5 py-3 text-[13.5px] font-bold transition duration-150 hover:bg-white/10 hover:text-white lg:justify-between",
                            isDtActive ? "text-white" : "text-nav-300",
                        )}
                    >
                        <span className="flex items-center justify-center gap-3 lg:justify-start">
                            <Layers className="size-[18px] shrink-0" />
                            <span className="hidden lg:inline">{UI_TEXT.layout.adminSidebar.trainingManagementLabel}</span>
                        </span>
                        <ChevronDown
                            className={cx("hidden size-[14px] transition-transform duration-200 lg:block", openGroups.dt ? "rotate-180" : "rotate-0")}
                        />
                    </button>

                    <div
                        className={cx(
                            "menu-sub-items flex flex-col gap-0.5 overflow-hidden pl-0 transition-all duration-300 lg:pl-3",
                            openGroups.dt ? "mt-1 max-h-[900px] opacity-100" : "pointer-events-none max-h-0 opacity-0",
                        )}
                    >
                        {dtItems.map((item) => (
                            <SidebarLink key={item.path} href={item.path} label={item.label} icon={item.icon} />
                        ))}
                    </div>
                </div>

                {/* Collapsible Group: Quản lý E-Learning */}
                <div className="menu-collapsible-group mt-1">
                    <button
                        onClick={() => toggleGroup("elearning")}
                        className={cx(
                            "menu-group-header flex w-full items-center justify-between justify-center rounded-xl px-3.5 py-3 text-[13.5px] font-bold transition duration-150 hover:bg-white/10 hover:text-white lg:justify-between",
                            isElearningActive ? "text-white" : "text-nav-300",
                        )}
                    >
                        <span className="flex items-center justify-center gap-3 lg:justify-start">
                            <Book className="size-[18px] shrink-0" />
                            <span className="hidden lg:inline">{UI_TEXT.layout.adminSidebar.elearningManagementLabel}</span>
                        </span>
                        <ChevronDown
                            className={cx("hidden size-[14px] transition-transform duration-200 lg:block", openGroups.elearning ? "rotate-180" : "rotate-0")}
                        />
                    </button>

                    <div
                        className={cx(
                            "menu-sub-items flex flex-col gap-0.5 overflow-hidden pl-0 transition-all duration-300 lg:pl-3",
                            openGroups.elearning ? "mt-1 max-h-[300px] opacity-100" : "pointer-events-none max-h-0 opacity-0",
                        )}
                    >
                        {elearningItems.map((item) => (
                            <SidebarLink key={item.path} href={item.path} label={item.label} icon={item.icon} />
                        ))}
                    </div>
                </div>

                {/* Collapsible Group: Quản lý điểm thi */}
                <div className="menu-collapsible-group mt-1">
                    <button
                        onClick={() => toggleGroup("diem")}
                        className={cx(
                            "menu-group-header flex w-full items-center justify-between justify-center rounded-xl px-3.5 py-3 text-[13.5px] font-bold transition duration-150 hover:bg-white/10 hover:text-white lg:justify-between",
                            isDiemActive ? "text-white" : "text-nav-300",
                        )}
                    >
                        <span className="flex items-center justify-center gap-3 lg:justify-start">
                            <Notebook className="size-[18px] shrink-0" />
                            <span className="hidden lg:inline">{UI_TEXT.layout.adminSidebar.examGradeManagementLabel}</span>
                        </span>
                        <ChevronDown
                            className={cx("hidden size-[14px] transition-transform duration-200 lg:block", openGroups.diem ? "rotate-180" : "rotate-0")}
                        />
                    </button>

                    <div
                        className={cx(
                            "menu-sub-items flex flex-col gap-0.5 overflow-hidden pl-0 transition-all duration-300 lg:pl-3",
                            openGroups.diem ? "mt-1 max-h-[300px] opacity-100" : "pointer-events-none max-h-0 opacity-0",
                        )}
                    >
                        {diemItems.map((item) => (
                            <SidebarLink key={item.path} href={item.path} label={item.label} icon={item.icon} />
                        ))}
                    </div>
                </div>

                {/* Top-level: Chatbot quy trình (mục riêng, ngang các nhóm) */}
                <Link
                    href={"/chatbot" as Route}
                    className={cx(
                        "menu-item mt-1 flex w-full items-center justify-center gap-3 rounded-xl px-3.5 py-3 text-[13.5px] font-bold transition duration-150 lg:justify-start",
                        isChatbotActive
                            ? "bg-white text-brand-500 shadow-[0_6px_16px_-8px_rgba(0,0,0,0.4)] hover:bg-white"
                            : "text-nav-300 hover:bg-white/10 hover:text-white",
                    )}
                >
                    <Bot className="size-[18px] shrink-0" />
                    <span className="hidden lg:inline">{UI_TEXT.layout.adminSidebar.chatbotManagementLabel}</span>
                </Link>
            </div>

            {/* Logout Section */}
            <button
                onClick={logout}
                disabled={isLoggingOut}
                className={cx(
                    "mt-auto flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-white p-3 text-[12.5px] font-bold text-brand-600 transition duration-150 hover:bg-white/90",
                    isLoggingOut && "cursor-not-allowed opacity-50",
                )}
            >
                {isLoggingOut ? <span className="size-4 shrink-0 animate-spin rounded-full border-2" /> : <LogOut className="size-4 shrink-0" />}
                <span className="hidden lg:inline">{isLoggingOut ? UI_TEXT.layout.loggingOut : UI_TEXT.layout.logout}</span>
            </button>
        </aside>
    );
}
