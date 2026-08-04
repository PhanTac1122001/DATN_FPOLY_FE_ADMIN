"use client";

import { useEffect, useState } from "react";
import { Edit2, Loader2, Plus, Tag, Trash2, X } from "lucide-react";
import { APP_CONFIG } from "@/constants/app.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { sessionTypeService } from "@/services/session-type.service";
import type { SessionType, SessionTypeModalProps } from "@/types/session-type.types";

export function SessionTypeModal({ isOpen, onClose, onChanged }: SessionTypeModalProps) {
    const [types, setTypes] = useState<SessionType[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [isCreating, setIsCreating] = useState(false);
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [color] = useState<string>(APP_CONFIG.DEFAULT_THEME_COLOR);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editDesc, setEditDesc] = useState("");

    const loadTypes = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await sessionTypeService.getAll(true);
            setTypes(data || []);
        } catch (err) {
            console.error("Failed to load session types", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadTypes();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim() || !name.trim()) {
            setError(UI_TEXT.sessionTypes.requiredError);
            return;
        }
        try {
            setSubmitting(true);
            await sessionTypeService.create({
                code: code.trim().toUpperCase(),
                name: name.trim(),
                description: description.trim() || undefined,
                color,
            });
            setIsCreating(false);
            setCode("");
            setName("");
            setDescription("");
            loadTypes();
            onChanged?.();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : UI_TEXT.common.genericError);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async (id: string) => {
        if (!editName.trim()) return;
        try {
            setSubmitting(true);
            await sessionTypeService.update(id, {
                name: editName.trim(),
                description: editDesc.trim() || undefined,
            });
            setEditingId(null);
            loadTypes();
            onChanged?.();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : UI_TEXT.common.genericError);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (type: SessionType) => {
        if (!confirm(UI_TEXT.sessionTypes.confirmDelete)) return;
        try {
            await sessionTypeService.remove(type.id);
            loadTypes();
            onChanged?.();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : UI_TEXT.common.genericError);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl duration-150 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                        <Tag className="size-5 text-wine-bright" />
                        <h3 className="font-display text-lg font-bold text-slate-900">{UI_TEXT.sessionTypes.modalTitle}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {error && <div className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600">{error}</div>}

                <div className="mt-4 max-h-[60vh] space-y-3 overflow-y-auto pr-1">
                    {/* Header Action */}
                    <div className="flex justify-end">
                        {!isCreating && (
                            <button
                                onClick={() => setIsCreating(true)}
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-wine-bright px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-wine"
                            >
                                <Plus className="size-3.5" />
                                <span>{UI_TEXT.sessionTypes.addButton}</span>
                            </button>
                        )}
                    </div>

                    {/* Create Form */}
                    {isCreating && (
                        <form onSubmit={handleCreate} className="space-y-3 rounded-xl border border-wine/20 bg-wine-soft/20 p-3">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="mb-1 block text-[11px] font-bold text-slate-700">{UI_TEXT.sessionTypes.codeLabel}</label>
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-wine-bright focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-[11px] font-bold text-slate-700">{UI_TEXT.sessionTypes.nameLabel}</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-wine-bright focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-[11px] font-bold text-slate-700">{UI_TEXT.sessionTypes.descLabel}</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-wine-bright focus:outline-none"
                                />
                            </div>
                            <div className="flex items-center justify-end gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="cursor-pointer rounded-lg border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50"
                                >
                                    {UI_TEXT.common.cancel}
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-wine-bright px-3 py-1 text-xs font-bold text-white transition-colors hover:bg-wine"
                                >
                                    {submitting && <Loader2 className="size-3 animate-spin" />}
                                    <span>{UI_TEXT.common.save}</span>
                                </button>
                            </div>
                        </form>
                    )}

                    {/* List Items */}
                    {loading ? (
                        <div className="flex items-center justify-center gap-2 py-8 text-xs font-medium text-slate-400">
                            <Loader2 className="size-4 animate-spin" />
                            <span>{UI_TEXT.common.loading}</span>
                        </div>
                    ) : types.length === 0 ? (
                        <div className="py-6 text-center text-xs font-medium text-slate-400">{UI_TEXT.common.noData}</div>
                    ) : (
                        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                            {types.map((item) => (
                                <div key={item.id} className="flex items-center justify-between gap-2 p-3">
                                    {editingId === item.id ? (
                                        <div className="flex-1 space-y-2">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold"
                                            />
                                            <input
                                                type="text"
                                                value={editDesc}
                                                onChange={(e) => setEditDesc(e.target.value)}
                                                className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600"
                                            />
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="cursor-pointer rounded px-2 py-0.5 text-xs text-slate-500"
                                                >
                                                    {UI_TEXT.common.cancel}
                                                </button>
                                                <button
                                                    onClick={() => handleUpdate(item.id)}
                                                    className="cursor-pointer rounded bg-wine-bright px-2 py-0.5 text-xs font-bold text-white"
                                                >
                                                    {UI_TEXT.common.save}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-900">{item.name}</span>
                                                    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">{item.code}</span>
                                                    {item.isSystem && (
                                                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                                                            {UI_TEXT.sessionTypes.systemBadge}
                                                        </span>
                                                    )}
                                                    {!item.isActive && (
                                                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                                                            {UI_TEXT.sessionTypes.hiddenBadge}
                                                        </span>
                                                    )}
                                                </div>
                                                {item.description && <p className="mt-0.5 truncate text-[11px] text-slate-500">{item.description}</p>}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => {
                                                        setEditingId(item.id);
                                                        setEditName(item.name);
                                                        setEditDesc(item.description || "");
                                                    }}
                                                    className="cursor-pointer rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                                    title={UI_TEXT.common.actions.edit}
                                                >
                                                    <Edit2 className="size-3.5" />
                                                </button>
                                                {!item.isSystem && (
                                                    <button
                                                        onClick={() => handleDelete(item)}
                                                        className="cursor-pointer rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                                        title={UI_TEXT.common.actions.delete}
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
