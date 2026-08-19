"use client";

import { useEffect, useState } from "react";
import { Loader2, Video, X } from "lucide-react";
import { Button } from "@/components/base/buttons/button";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { addExtraVideo } from "@/services/learning-resource.service";
import { toast } from "@/services/toast.service";
import type { CreateExtraVideoModalProps } from "@/types/learning-resource.types";

export function CreateExtraVideoModal({ isOpen, resourceId, onClose, onSuccess }: CreateExtraVideoModalProps) {
    const [url, setUrl] = useState("");
    const [title, setTitle] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setUrl("");
        setTitle("");
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resourceId) return;
        if (!url.trim()) {
            toast.error(UI_TEXT.classResourcesModal.enterVideoUrlWarning);
            return;
        }

        try {
            setIsSubmitting(true);
            await addExtraVideo(resourceId, {
                url: url.trim(),
                title: title.trim() || undefined,
            });
            toast.success(UI_TEXT.classResourcesModal.addExtraVideoSuccess);
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : UI_TEXT.classResourcesModal.genericError;
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
                <Dialog className="outline-none">
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                        <h3 className="text-base font-bold text-slate-900">{UI_TEXT.classResourcesModal.createVideoTitle}</h3>
                        <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
                            <X className="size-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
                        <div className="flex flex-col gap-1.5">
                            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                                <Video className="size-4 text-blue-600" />
                                <span>
                                    {UI_TEXT.classResourcesModal.videoUrlLabel} <span className="text-rose-500">{UI_TEXT.classResourcesModal.asterisk}</span>
                                </span>
                            </label>
                            <input
                                type="url"
                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 transition outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                placeholder={UI_TEXT.classResourcesModal.videoPlaceholder}
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-700">
                                {UI_TEXT.classResourcesModal.videoTitleLabel}{" "}
                                <span className="font-normal text-slate-400">{UI_TEXT.classResourcesModal.optionalTag}</span>
                            </label>
                            <input
                                type="text"
                                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 transition outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                placeholder={UI_TEXT.classResourcesModal.videoTitlePlaceholder}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="mt-2 flex items-center justify-end gap-3 border-t border-slate-100 pt-3">
                            <Button type="button" color="secondary" size="sm" onClick={onClose} disabled={isSubmitting}>
                                {UI_TEXT.classResourcesModal.btnCancel}
                            </Button>
                            <Button type="submit" color="primary" size="sm" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                                        {UI_TEXT.classResourcesModal.savingText}
                                    </>
                                ) : (
                                    UI_TEXT.classResourcesModal.btnCreateVideo
                                )}
                            </Button>
                        </div>
                    </form>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
