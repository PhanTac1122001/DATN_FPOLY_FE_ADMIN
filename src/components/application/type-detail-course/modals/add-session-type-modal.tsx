"use client";

import { useState } from "react";
import { Layers, Plus, X } from "lucide-react";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import type { AddSessionTypeModalProps } from "@/types/material.types";

export function AddSessionTypeModal({ isOpen, onOpenChange, onAddType }: AddSessionTypeModalProps) {
    const [label, setLabel] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = label.trim();
        if (!trimmed) return;
        onAddType(trimmed);
        setLabel("");
        onOpenChange(false);
    };

    return (
        <CustomModal.Root open={isOpen} onOpenChange={onOpenChange}>
            <CustomModal.Content className="w-full max-w-md overflow-hidden !rounded-[24px]">
                <Dialog className="flex flex-col outline-none">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-line px-6 py-4">
                        <div className="flex items-center gap-2">
                            <Layers className="size-5 text-wine" />
                            <h2 className="text-base font-extrabold text-ink">{UI_TEXT.courseDetail.addSessionTypeTitle}</h2>
                        </div>
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="cursor-pointer rounded-full p-1.5 text-muted transition hover:bg-slate-100 hover:text-ink"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold tracking-wider text-muted uppercase">
                                {UI_TEXT.courseDetail.sessionTypeNameLabel} <span className="text-rose-500">{"*"}</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                placeholder={UI_TEXT.courseDetail.sessionTypeNamePlaceholder}
                                className="w-full rounded-xl border border-line px-4 py-2.5 text-sm text-ink outline-none focus:border-wine focus:ring-1 focus:ring-wine"
                                autoFocus
                            />
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
                            <button
                                type="button"
                                onClick={() => onOpenChange(false)}
                                className="cursor-pointer rounded-full border border-line px-5 py-2 text-xs font-bold text-ink transition hover:bg-slate-100"
                            >
                                {UI_TEXT.courseDetail.cancelButton}
                            </button>
                            <button
                                type="submit"
                                disabled={!label.trim()}
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-wine px-6 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-wine/90 disabled:opacity-50"
                            >
                                <Plus className="size-4" />
                                <span>{UI_TEXT.courseDetail.createSessionTypeButton}</span>
                            </button>
                        </div>
                    </form>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
