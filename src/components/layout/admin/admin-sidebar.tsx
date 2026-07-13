"use client";

import { useState } from "react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    PieChart,
    ChevronDown,
    Layers,
    LogOut,
    Book,
    Notebook,
} from "lucide-react";
import {
    dtItems,
    elearningItems,
    diemItems,
} from "@/constants/admin-sidebar.constants";
import { useLogout } from "@/hooks/use-logout";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { cx } from "@/utils/cx";

function SidebarLink({ href, label, icon: Icon }: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}) {
    const pathname = usePathname();
    const isSubActive = pathname === href;
    return (
        <Link
            href={href as Route}
            className={cx(
                "menu-item flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition duration-150 hover:bg-white/8 hover:text-white justify-center lg:justify-start",
                isSubActive ? "bg-gold text-white font-bold shadow-md shadow-gold/40 hover:bg-gold" : "text-gray-200",
            )}
        >
            <Icon className="size-[18px] shrink-0" />
            <span className="hidden lg:inline">{label}</span>
        </Link>
    );
}

export function AdminSidebar() {
    const pathname = usePathname();
    const { logout, isLoggingOut } = useLogout();

    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
        dt: true,
        elearning: false,
        diem: false,
    });

    const isDtActive = dtItems.some((item) => pathname === item.path);
    const isElearningActive = elearningItems.some((item) => pathname === item.path);
    const isDiemActive = diemItems.some((item) => pathname === item.path);

    const toggleGroup = (group: string) => {
        setOpenGroups((prev) => ({
            ...prev,
            [group]: !prev[group],
        }));
    };

    return (
        <aside className="sticky top-0 flex h-screen w-20 flex-col bg-gradient-to-b from-wine to-wine-deep p-6 text-[#FCEDEF] transition-all duration-300 lg:w-[270px]">
            {/* Logo block */}
            <div className="logo-container flex flex-col border-b border-white/10 pb-4.5 justify-center lg:justify-start gap-3">
                {/* Logo Image wrapper for expanded sidebar */}
                <div className="hidden lg:block w-full">
                    <Image
                        src="/assets/rikkei-logo.png"
                        alt={UI_TEXT.layout.adminSidebar.logoAlt}
                        width={172}
                        height={40}
                        className="h-auto w-full object-contain"
                        priority
                    />
                </div>
            </div>

            {/* Menu Items */}
            <div className="sidebar-menu-wrapper flex-1 overflow-y-auto -mr-6 pr-5 my-4 custom-scrollbar">
               
                <Link
                    href="/"
                    className={cx(
                        "menu-item flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition duration-150 hover:bg-white/8 hover:text-white justify-center lg:justify-start",
                        pathname === "/" ? "bg-gold text-white font-bold shadow-md shadow-gold/40 hover:bg-gold" : "text-gray-200",
                    )}
                >
                    <PieChart className="size-[18px] shrink-0" />
                    <span className="hidden lg:inline">Thống kê hệ đào tạo</span>
                </Link>

                {/* Collapsible Group: Quản lý đào tạo */}
                <div className="menu-collapsible-group mt-1">
                    <button
                        onClick={() => toggleGroup("dt")}
                        className={cx(
                            "menu-group-header flex items-center justify-between w-full px-3.5 py-3 rounded-xl text-[13.5px] font-bold transition duration-150 hover:bg-white/8 hover:text-white justify-center lg:justify-between",
                            isDtActive ? "text-white" : "text-gray-200",
                        )}
                    >
                        <span className="flex items-center gap-3 justify-center lg:justify-start">
                            <Layers className="size-[18px] shrink-0" />
                            <span className="hidden lg:inline">Quản lý đào tạo</span>
                        </span>
                        <ChevronDown
                            className={cx(
                                "size-[14px] transition-transform duration-200 hidden lg:block",
                                openGroups.dt ? "rotate-180" : "rotate-0",
                            )}
                        />
                    </button>

                    <div
                        className={cx(
                            "menu-sub-items flex flex-col gap-0.5 overflow-hidden transition-all duration-300 pl-0 lg:pl-3",
                            openGroups.dt ? "max-h-[900px] opacity-100 mt-1" : "max-h-0 opacity-0 pointer-events-none",
                        )}
                    >
                        {dtItems.map((item) => (
                            <SidebarLink
                                key={item.path}
                                href={item.path}
                                label={item.label}
                                icon={item.icon}
                            />
                        ))}
                    </div>
                </div>

                {/* Collapsible Group: Quản lý E-Learning */}
                <div className="menu-collapsible-group mt-1">
                    <button
                        onClick={() => toggleGroup("elearning")}
                        className={cx(
                            "menu-group-header flex items-center justify-between w-full px-3.5 py-3 rounded-xl text-[13.5px] font-bold transition duration-150 hover:bg-white/8 hover:text-white justify-center lg:justify-between",
                            isElearningActive ? "text-white" : "text-gray-200",
                        )}
                    >
                        <span className="flex items-center gap-3 justify-center lg:justify-start">
                            <Book className="size-[18px] shrink-0" />
                            <span className="hidden lg:inline">Quản lý E-Learning</span>
                        </span>
                        <ChevronDown
                            className={cx(
                                "size-[14px] transition-transform duration-200 hidden lg:block",
                                openGroups.elearning ? "rotate-180" : "rotate-0",
                            )}
                        />
                    </button>

                    <div
                        className={cx(
                            "menu-sub-items flex flex-col gap-0.5 overflow-hidden transition-all duration-300 pl-0 lg:pl-3",
                            openGroups.elearning ? "max-h-[300px] opacity-100 mt-1" : "max-h-0 opacity-0 pointer-events-none",
                        )}
                    >
                        {elearningItems.map((item) => (
                            <SidebarLink
                                key={item.path}
                                href={item.path}
                                label={item.label}
                                icon={item.icon}
                            />
                        ))}
                    </div>
                </div>

                {/* Collapsible Group: Quản lý điểm thi */}
                <div className="menu-collapsible-group mt-1">
                    <button
                        onClick={() => toggleGroup("diem")}
                        className={cx(
                            "menu-group-header flex items-center justify-between w-full px-3.5 py-3 rounded-xl text-[13.5px] font-bold transition duration-150 hover:bg-white/8 hover:text-white justify-center lg:justify-between",
                            isDiemActive ? "text-white" : "text-gray-200",
                        )}
                    >
                        <span className="flex items-center gap-3 justify-center lg:justify-start">
                            <Notebook className="size-[18px] shrink-0" />
                            <span className="hidden lg:inline">Quản lý điểm thi</span>
                        </span>
                        <ChevronDown
                            className={cx(
                                "size-[14px] transition-transform duration-200 hidden lg:block",
                                openGroups.diem ? "rotate-180" : "rotate-0",
                            )}
                        />
                    </button>

                    <div
                        className={cx(
                            "menu-sub-items flex flex-col gap-0.5 overflow-hidden transition-all duration-300 pl-0 lg:pl-3",
                            openGroups.diem ? "max-h-[300px] opacity-100 mt-1" : "max-h-0 opacity-0 pointer-events-none",
                        )}
                    >
                        {diemItems.map((item) => (
                            <SidebarLink
                                key={item.path}
                                href={item.path}
                                label={item.label}
                                icon={item.icon}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Logout Section */}
            <button
                onClick={logout}
                disabled={isLoggingOut}
                className={cx(
                    "mt-auto flex items-center justify-center gap-2 rounded-xl bg-white p-3 text-[12.5px] font-bold text-brand-600 transition duration-150 hover:bg-white/90 w-full shrink-0",
                    isLoggingOut && "opacity-50 cursor-not-allowed",
                )}
            >
                {isLoggingOut ? (
                    <span className="size-4 animate-spin rounded-full border-2  shrink-0 " />
                ) : (
                    <LogOut className="size-4 shrink-0 " />
                )}
                <span className="hidden lg:inline ">
                    {isLoggingOut ? UI_TEXT.layout.loggingOut : UI_TEXT.layout.logout}
                </span>
            </button>
        </aside>
    );
}
