"use client";

import { UI_TEXT } from "@/constants/ui-text.constants";
import { useAuth } from "@/hooks/use-auth";

export function HomeView() {
    const { user } = useAuth();

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 rounded-2xl border border-slate-100 bg-linear-to-b from-white to-slate-50 p-8 px-6 py-16 text-center shadow-sm">
            <h1 className="font-display text-4xl font-bold text-slate-950">
                {UI_TEXT.home.welcomePrefix}
                {user?.fullName || UI_TEXT.home.defaultAdmin}
                {UI_TEXT.home.welcomeSuffix}
            </h1>
            <p className="max-w-xl text-base text-slate-600">{UI_TEXT.home.welcomeDesc}</p>
        </div>
    );
}
