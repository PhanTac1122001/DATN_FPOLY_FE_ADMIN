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
        <div id="lms-shell" className={`flex bg-cream text-ink ${disableScroll ? "h-screen overflow-hidden" : "min-h-screen"}`}>
            {/* Sidebar Left */}
            <AdminSidebar />

            {/* Main Content Area Right */}
            <main className={`flex min-w-0 flex-1 flex-col bg-cream ${disableScroll ? "h-screen overflow-hidden pb-0" : "pb-10"}`}>
                {/* Header Top */}
                <AdminHeader title={title} subtitle={subtitle} />

                {/* View Wrapper Content */}
                <div className={`flex w-full flex-1 flex-col px-8 pt-6 ${disableScroll ? "min-h-0 overflow-hidden pb-6" : ""}`}>{children}</div>
            </main>
        </div>
    );
}
