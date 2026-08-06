"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Layers, Search, ShieldAlert, X } from "lucide-react";
import { Input } from "@/components/base/input/input";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import type { SessionSelectItem, SessionSelectModalProps } from "@/types/completion-rule.types";

export type { SessionSelectItem };

export function SessionSelectModal({
    isOpen,
    onOpenChange,
    sessions,
    onSelectSession,
}: SessionSelectModalProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredSessions = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return sessions;
        return sessions.filter(
            (s) => s.name.toLowerCase().includes(query) || (s.type && s.type.toLowerCase().includes(query)),
        );
    }, [sessions, searchQuery]);

    const handleSelect = (session: SessionSelectItem) => {
        onSelectSession(session);
        onOpenChange(false);
    };

    return (
        <CustomModal.Root open={isOpen} onOpenChange={onOpenChange}>
            <CustomModal.Content className="w-full max-w-3xl overflow-hidden !rounded-[24px]">
                <Dialog className="flex max-h-[85vh] flex-col outline-none">
                    {/* Header */}
                    <div className="relative flex flex-col border-b border-slate-100 px-6 pt-6 pb-4">
                        <div className="flex items-center gap-2">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-wine">
                                <ShieldAlert className="size-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{UI_TEXT.sessionSelectModal.title}</h3>
                                <p className="text-xs font-medium text-slate-500">
                                    {UI_TEXT.sessionSelectModal.subtitle}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="absolute top-5 right-5 cursor-pointer rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
                        {/* Search Bar */}
                        <div className="relative">
                            <Input
                                placeholder={UI_TEXT.sessionSelectModal.placeholder}
                                value={searchQuery}
                                onChange={(val) => setSearchQuery(val)}
                                className="pl-10"
                            />
                            <Search className="absolute top-3 left-3.5 size-4 text-slate-400 pointer-events-none" />
                        </div>

                        {/* Sessions Table */}
                        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/50">
                            {filteredSessions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                    <Layers className="size-8 opacity-40" />
                                    <p className="mt-2 text-xs font-medium">{UI_TEXT.sessionSelectModal.empty}</p>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200/80 bg-slate-100/70 text-xs font-extrabold uppercase tracking-wider text-slate-600">
                                            <th className="py-3.5 px-4.5 w-16 text-center">{UI_TEXT.sessionSelectModal.thStt}</th>
                                            <th className="py-3.5 px-4.5">{UI_TEXT.sessionSelectModal.thSessionName}</th>
                                            <th className="py-3.5 px-4.5 w-40">{UI_TEXT.sessionSelectModal.thType}</th>
                                            <th className="py-3.5 px-4.5 w-40 text-right">{UI_TEXT.sessionSelectModal.thActions}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {filteredSessions.map((session, index) => (
                                            <tr
                                                key={session.id}
                                                onClick={() => handleSelect(session)}
                                                className="group cursor-pointer transition hover:bg-wine/5"
                                            >
                                                <td className="py-3.5 px-4.5 text-center font-extrabold text-slate-400 text-sm">
                                                    {index + 1}
                                                </td>
                                                <td className="py-3.5 px-4.5 font-bold text-slate-800 text-sm group-hover:text-wine transition">
                                                    {session.name}
                                                </td>
                                                <td className="py-3.5 px-4.5 font-medium text-slate-500">
                                                    {session.type ? (
                                                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                                                            {session.type}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400">—</span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4.5 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleSelect(session);
                                                        }}
                                                        className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-wine/10 px-4 py-1.5 text-sm font-bold text-wine transition hover:bg-wine hover:text-white"
                                                    >
                                                        <span>{UI_TEXT.sessionSelectModal.configureBtn}</span>
                                                        <ChevronRight className="size-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
                        <span className="text-xs font-bold text-slate-500">
                            {UI_TEXT.sessionSelectModal.totalPrefix}{filteredSessions.length}{UI_TEXT.sessionSelectModal.totalSuffix}
                        </span>
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="cursor-pointer rounded-full border border-slate-200 bg-white px-6 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                        >
                            {UI_TEXT.sessionSelectModal.closeBtn}
                        </button>
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
