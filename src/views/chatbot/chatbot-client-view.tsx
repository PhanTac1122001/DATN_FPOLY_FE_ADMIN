"use client";

import { useEffect, useState } from "react";
import { FileText, MessageSquare, Settings, Users } from "lucide-react";
import { AdminLayout } from "@/components/layout/admin/admin-layout";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { useAppRouter } from "@/hooks/use-app-router";
import { useAuth } from "@/hooks/use-auth";
import type { ChatbotTabId } from "@/types/chatbot.types";
import { cx } from "@/utils/cx";
import { BotSettingsView } from "./bot-settings-view";
import { ContactsView } from "./contacts-view";
import { ProcessDocumentsView } from "./process-documents-view";

export function ChatbotClientView() {
    const { user, isLoading } = useAuth();
    const router = useAppRouter();
    const [activeTab, setActiveTab] = useState<ChatbotTabId>("documents");

    useEffect(() => {
        if (!isLoading && !user) {
            router.replace("/login");
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-cream">
                <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const tabs: { id: ChatbotTabId; label: string; icon: typeof FileText }[] = [
        { id: "documents", label: UI_TEXT.chatbot.tabDocuments, icon: FileText },
        { id: "contacts", label: UI_TEXT.chatbot.tabContacts, icon: Users },
        { id: "settings", label: UI_TEXT.chatbot.tabSettings, icon: Settings },
    ];

    return (
        <AdminLayout title={UI_TEXT.chatbot.title} subtitle={UI_TEXT.chatbot.subtitle} disableScroll={true}>
            <div className="flex w-full flex-1 flex-col gap-6 overflow-hidden">
                {/* Tabs */}
                <div className="flex shrink-0 items-center gap-2 border-b border-slate-100">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={cx(
                                    "inline-flex cursor-pointer items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition",
                                    isActive ? "border-wine text-wine" : "border-transparent text-slate-400 hover:text-slate-600",
                                )}
                            >
                                <Icon className="size-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                    <div className="ml-auto hidden items-center gap-1.5 pr-1 text-xs font-semibold text-slate-300 sm:flex">
                        <MessageSquare className="size-3.5" />
                    </div>
                </div>

                {/* Tab content */}
                {activeTab === "documents" && <ProcessDocumentsView />}
                {activeTab === "contacts" && <ContactsView />}
                {activeTab === "settings" && <BotSettingsView />}
            </div>
        </AdminLayout>
    );
}
