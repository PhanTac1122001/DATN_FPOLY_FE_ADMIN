"use client";

import type { ReactNode } from "react";
import { AdminHeader } from "./admin-header";
import { AdminSidebar } from "./admin-sidebar";

export function AdminLayout({
    children,
    title,
    subtitle,
    disableScroll = false,
    hideSidebarAndHeader = false,
}: {
    children: ReactNode;
    title?: string;
    subtitle?: string;
    disableScroll?: boolean;
    hideSidebarAndHeader?: boolean;
}) {
    if (hideSidebarAndHeader) {
        return (
            <div id="lms-shell" className="flex h-screen w-screen flex-col overflow-hidden bg-cream text-ink">
                <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-cream">{children}</main>
            </div>
        );
    }

    return (
        <div id="lms-shell" className="flex h-screen w-screen overflow-hidden bg-cream text-ink">
            {/* Sidebar Left */}
            <AdminSidebar />

            {/* Main Content Area Right */}
            <main className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden bg-cream">
                {/* Header Top */}
                <AdminHeader title={title} subtitle={subtitle} />

                {/* View Wrapper Content */}
                <div
                    className={`flex w-full flex-1 flex-col px-8 pt-6 ${disableScroll ? "min-h-0 overflow-hidden pb-6" : "custom-scrollbar-gray min-h-0 overflow-y-auto pb-10"}`}
                >
                    {children}
                </div>
            </main>
        </div>
    );
}
