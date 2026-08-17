"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Save, Users, X } from "lucide-react";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { createContact, updateContact } from "@/services/chatbot.service";
import { toast } from "@/services/toast.service";
import type { ContactModalProps } from "@/types/chatbot.types";

const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 transition outline-none focus:border-wine focus:ring-1 focus:ring-wine disabled:bg-slate-100 disabled:text-slate-500";
const labelClass = "text-xs font-extrabold text-slate-700";

export function ContactModal({ isOpen, onClose, onSuccess, editingContact }: ContactModalProps) {
    const t = UI_TEXT.chatbot;
    const isEdit = !!editingContact;

    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [department, setDepartment] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [description, setDescription] = useState("");
    const [keywords, setKeywords] = useState<string[]>([]);
    const [keywordInput, setKeywordInput] = useState("");
    const [isDefault, setIsDefault] = useState(false);
    const [isActive, setIsActive] = useState(true);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isOpen) return;
        setError("");
        setKeywordInput("");
        if (editingContact) {
            setCode(editingContact.code || "");
            setName(editingContact.name || "");
            setDepartment(editingContact.department || "");
            setEmail(editingContact.email || "");
            setPhone(editingContact.phone || "");
            setDescription(editingContact.description || "");
            setKeywords(editingContact.keywords || []);
            setIsDefault(editingContact.isDefault ?? false);
            setIsActive(editingContact.isActive ?? true);
        } else {
            setCode("");
            setName("");
            setDepartment("");
            setEmail("");
            setPhone("");
            setDescription("");
            setKeywords([]);
            setIsDefault(false);
            setIsActive(true);
        }
    }, [isOpen, editingContact]);

    const addKeyword = () => {
        const val = keywordInput.trim();
        if (val && !keywords.includes(val)) {
            setKeywords((prev) => [...prev, val]);
        }
        setKeywordInput("");
    };

    const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addKeyword();
        }
    };

    const removeKeyword = (kw: string) => {
        setKeywords((prev) => prev.filter((k) => k !== kw));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if ((!isEdit && !code.trim()) || !name.trim()) {
            setError(t.requiredError);
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                name: name.trim(),
                department: department.trim() || undefined,
                email: email.trim() || undefined,
                phone: phone.trim() || undefined,
                description: description.trim() || undefined,
                keywords,
                isDefault,
                isActive,
            };

            if (isEdit && editingContact) {
                await updateContact(editingContact._id, payload);
                toast.success(UI_TEXT.common.successTitle, t.toastUpdateContactSuccess);
            } else {
                await createContact({ ...payload, code: code.trim().toUpperCase() });
                toast.success(UI_TEXT.common.successTitle, t.toastCreateContactSuccess);
            }

            onSuccess();
            onClose();
        } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : UI_TEXT.common.genericError;
            setError(errMsg);
            toast.error(UI_TEXT.common.errorTitle, errMsg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="w-full max-w-xl overflow-hidden !rounded-[24px]">
                <Dialog className="flex max-h-[88vh] flex-col outline-none">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-wine">
                                <Users className="size-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-extrabold text-slate-900">{isEdit ? t.editContactTitle : t.createContactTitle}</h2>
                                <p className="text-xs font-semibold text-slate-400">{t.contactModalSubtitle}</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
                            {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-600">{error}</div>}

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-extrabold text-slate-700">
                                        {t.fieldCode} {!isEdit && <span className="text-rose-500">{t.asterisk}</span>}
                                    </label>
                                    <input
                                        type="text"
                                        disabled={isEdit}
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder={t.placeholderCode}
                                        className={`${inputClass} uppercase`}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-extrabold text-slate-700">
                                        {t.fieldContactName} <span className="text-rose-500">{t.asterisk}</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder={t.placeholderContactName}
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="flex flex-col gap-1.5">
                                    <label className={labelClass}>{t.fieldDepartment}</label>
                                    <input
                                        type="text"
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        placeholder={t.placeholderDepartment}
                                        className={inputClass}
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className={labelClass}>{t.fieldPhone}</label>
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder={t.placeholderPhone}
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className={labelClass}>{t.fieldEmail}</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t.placeholderEmail}
                                    className={inputClass}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className={labelClass}>{t.fieldDescription}</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={t.placeholderContactDesc}
                                    className={inputClass}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className={labelClass}>{t.fieldKeywords}</label>
                                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 focus-within:border-wine focus-within:ring-1 focus-within:ring-wine">
                                    {keywords.map((kw) => (
                                        <span key={kw} className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-wine">
                                            {kw}
                                            <button type="button" onClick={() => removeKeyword(kw)} className="cursor-pointer text-wine/60 hover:text-wine">
                                                <X className="size-3" />
                                            </button>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        value={keywordInput}
                                        onChange={(e) => setKeywordInput(e.target.value)}
                                        onKeyDown={handleKeywordKeyDown}
                                        onBlur={addKeyword}
                                        placeholder={t.placeholderKeywords}
                                        className="min-w-[140px] flex-1 bg-transparent px-1.5 py-1 text-xs font-bold text-slate-800 outline-none"
                                    />
                                </div>
                            </div>

                            <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5">
                                <input
                                    type="checkbox"
                                    checked={isDefault}
                                    onChange={(e) => setIsDefault(e.target.checked)}
                                    className="mt-0.5 size-4 accent-wine"
                                />
                                <span className="flex flex-col gap-0.5">
                                    <span className="text-xs font-bold text-slate-700">{t.fieldIsDefault}</span>
                                    <span className="text-[11px] font-medium text-slate-400">{t.defaultHint}</span>
                                </span>
                            </label>

                            <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5">
                                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="size-4 accent-wine" />
                                <span className="text-xs font-bold text-slate-700">{t.thActive}</span>
                            </label>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="cursor-pointer rounded-full border border-slate-200 px-5 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
                            >
                                {UI_TEXT.common.cancel}
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-wine px-6 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-wine/90 disabled:opacity-50"
                            >
                                {submitting ? (
                                    <Loader2 className="size-3.5 animate-spin" />
                                ) : isEdit ? (
                                    <Save className="size-3.5" />
                                ) : (
                                    <Plus className="size-3.5" />
                                )}
                                <span>{isEdit ? UI_TEXT.common.save : t.addContact}</span>
                            </button>
                        </div>
                    </form>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
