"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Save, ShieldCheck } from "lucide-react";
import { CHATBOT_ORG_NAME_MAX_LENGTH, CHATBOT_OUT_OF_SCOPE_MAX_LENGTH, CHATBOT_TONE_MAX_LENGTH } from "@/constants/chatbot.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { getBotSettings, updateBotSettings } from "@/services/chatbot.service";
import { toast } from "@/services/toast.service";

const areaClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 transition outline-none focus:border-wine focus:ring-1 focus:ring-wine";

export function BotSettingsView() {
    const t = UI_TEXT.chatbot;

    const [tone, setTone] = useState("");
    const [orgName, setOrgName] = useState("");
    const [outOfScopeMessage, setOutOfScopeMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ["chatbot-bot-settings"],
        queryFn: getBotSettings,
    });

    useEffect(() => {
        if (data) {
            setTone(data.tone ?? "");
            setOrgName(data.orgName ?? "");
            setOutOfScopeMessage(data.outOfScopeMessage ?? "");
        }
    }, [data]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await updateBotSettings({ tone: tone.trim(), orgName: orgName.trim(), outOfScopeMessage: outOfScopeMessage.trim() });
            toast.success(UI_TEXT.common.successTitle, t.toastSaveSettingsSuccess);
        } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : UI_TEXT.common.genericError;
            toast.error(UI_TEXT.common.errorTitle, errMsg);
        } finally {
            setSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[300px] flex-1 items-center justify-center">
                <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
            </div>
        );
    }

    return (
        <div className="flex w-full flex-1 flex-col overflow-auto">
            <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-2xl flex-col gap-5">
                <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
                    <div className="flex items-start gap-3">
                        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-wine" />
                        <div className="flex flex-col gap-1">
                            <h3 className="text-sm font-extrabold text-slate-900">{t.settingsTitle}</h3>
                            <p className="text-xs font-medium text-slate-500">{t.settingsSubtitle}</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-extrabold text-slate-700">{t.fieldTone}</label>
                    <textarea
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        placeholder={t.placeholderTone}
                        rows={3}
                        maxLength={CHATBOT_TONE_MAX_LENGTH}
                        className={areaClass}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-extrabold text-slate-700">{t.fieldOrgName}</label>
                    <input
                        type="text"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        placeholder={t.placeholderOrgName}
                        maxLength={CHATBOT_ORG_NAME_MAX_LENGTH}
                        className={areaClass}
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-extrabold text-slate-700">{t.fieldOutOfScope}</label>
                    <textarea
                        value={outOfScopeMessage}
                        onChange={(e) => setOutOfScopeMessage(e.target.value)}
                        placeholder={t.placeholderOutOfScope}
                        rows={3}
                        maxLength={CHATBOT_OUT_OF_SCOPE_MAX_LENGTH}
                        className={areaClass}
                    />
                    <p className="text-[11px] font-medium text-slate-400">{t.settingsGuardrailNote}</p>
                </div>

                <div className="flex justify-end border-t border-slate-100 pt-4">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-wine px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-wine/20 transition hover:bg-wine-deep disabled:opacity-50"
                    >
                        {submitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                        <span>{t.saveSettings}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
