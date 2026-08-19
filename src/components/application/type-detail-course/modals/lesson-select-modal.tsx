"use client";

import { useMemo, useState } from "react";
import { BookOpen, ChevronRight, Search, X } from "lucide-react";
import { Input } from "@/components/base/input/input";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import type { LessonSelectItem, LessonSelectModalProps } from "@/types/courseware.types";

export function LessonSelectModal({ isOpen, onOpenChange, sessionName, lessons, onSelectLesson }: LessonSelectModalProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredLessons = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return lessons;
        return lessons.filter((l) => l.name.toLowerCase().includes(query));
    }, [lessons, searchQuery]);

    const handleSelect = (lesson: LessonSelectItem) => {
        onSelectLesson(lesson);
        onOpenChange(false);
    };

    const t = UI_TEXT.lessonSelectModal;

    return (
        <CustomModal.Root open={isOpen} onOpenChange={onOpenChange}>
            <CustomModal.Content className="w-full max-w-3xl overflow-hidden !rounded-[24px]">
                <Dialog className="flex max-h-[90vh] flex-col outline-none">
                    {/* Header */}
                    <div className="relative flex flex-col border-b border-slate-100 px-6 pt-6 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                                <BookOpen className="size-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{t.title}</h3>
                                <p className="text-xs font-medium text-slate-500">
                                    {t.subtitle}
                                    {sessionName ? ` — ${sessionName}` : ""}
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

                    <div className="flex flex-1 flex-col gap-4 overflow-hidden p-6">
                        {/* Search Bar */}
                        <Input icon={Search} placeholder={t.placeholder} value={searchQuery} onChange={(val) => setSearchQuery(val)} />

                        {/* Lessons Table */}
                        <div className="custom-scrollbar flex-1 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50/50">
                            {filteredLessons.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                    <BookOpen className="size-8 text-purple-400 opacity-40" />
                                    <p className="mt-2 text-xs font-medium">{t.empty}</p>
                                </div>
                            ) : (
                                <table className="w-full border-collapse text-left text-sm">
                                    <thead>
                                        <tr className="sticky top-0 z-10 border-b border-slate-200/80 bg-slate-100 text-xs font-extrabold tracking-wider text-slate-600 uppercase shadow-xs">
                                            <th className="w-16 px-4.5 py-3.5 text-center">{t.thStt}</th>
                                            <th className="px-4.5 py-3.5">{t.thLessonName}</th>
                                            <th className="px-4.5 py-3.5 text-right whitespace-nowrap">{t.thActions}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {filteredLessons.map((lesson, index) => (
                                            <tr
                                                key={lesson.id}
                                                onClick={() => handleSelect(lesson)}
                                                className="group cursor-pointer transition hover:bg-purple-50/50"
                                            >
                                                <td className="px-4.5 py-3.5 text-center text-sm font-extrabold text-slate-400">{index + 1}</td>
                                                <td className="px-4.5 py-3.5 text-sm font-bold text-slate-800 transition group-hover:text-purple-700">
                                                    {lesson.name}
                                                </td>
                                                <td className="px-4.5 py-3.5 text-right whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleSelect(lesson);
                                                        }}
                                                        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-purple-50 px-3 py-1.5 text-xs font-extrabold whitespace-nowrap text-purple-700 transition group-hover:bg-purple-600 group-hover:text-white"
                                                    >
                                                        <span className="whitespace-nowrap">{t.btnSelect}</span>
                                                        <ChevronRight className="size-3.5 shrink-0" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
