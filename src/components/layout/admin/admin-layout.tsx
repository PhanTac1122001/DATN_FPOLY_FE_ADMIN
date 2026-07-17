"use client";

import type { ReactNode } from "react";
import { AdminHeader } from "./admin-header";
import { AdminSidebar } from "./admin-sidebar";

export function AdminLayout({ 
    children, 
    title, 
    subtitle,
    disableScroll = false
}: {
    children: ReactNode;
    title?: string;
    subtitle?: string;
    disableScroll?: boolean;
}) {
    return (
        <div 
            id="lms-shell" 
            className={`flex bg-cream text-ink ${disableScroll ? "h-screen overflow-hidden" : "min-h-screen"}`}
        >
            {/* Sidebar Left */}
            <AdminSidebar />

            {/* Main Content Area Right */}
            <main className={`flex flex-1 flex-col min-w-0 bg-cream ${disableScroll ? "h-screen overflow-hidden pb-0" : "pb-10"}`}>
                {/* Header Top */}
                <AdminHeader title={title} subtitle={subtitle} />

                {/* View Wrapper Content */}
                <div className={`flex flex-1 flex-col w-full px-8 pt-6 ${disableScroll ? "overflow-hidden pb-6" : ""}`}>
                    {children}
                </div>
            </main>
        </div>
    );
}
