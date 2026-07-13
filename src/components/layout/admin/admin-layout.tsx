"use client";

import type { ReactNode } from "react";
import { AdminHeader } from "./admin-header";
import { AdminSidebar } from "./admin-sidebar";

interface AdminLayoutProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
}

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
    return (
        <div id="lms-shell" className="flex min-h-screen bg-cream text-ink">
            {/* Sidebar Left */}
            <AdminSidebar />

            {/* Main Content Area Right */}
            <main className="flex flex-1 flex-col min-w-0 bg-cream pb-10">
                {/* Header Top */}
                <AdminHeader title={title} subtitle={subtitle} />

                {/* View Wrapper Content */}
                <div className="flex flex-1 flex-col w-full px-8 pt-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
