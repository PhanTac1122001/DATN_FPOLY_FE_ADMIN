"use client";

import { useMemo, useState } from "react";
import { BookOpen, ChevronRight, Search, X } from "lucide-react";
import { Input } from "@/components/base/input/input";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";

export interface LessonSelectItem {
    id: string;
    name: string;
    description?: string;
}

export interface LessonSelectModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    sessionName?: string;
    lessons: LessonSelectItem[];
    onSelectLesson: (lesson: LessonSelectItem) => void;
}

export function LessonSelectModal({
    isOpen,
    onOpenChange,
    sessionName,
    lessons,
    onSelectLesson,
}: LessonSelectModalProps) {
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
                <Dialog className="flex max-h-[85vh] flex-col outline-none">
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

                    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
                        {/* Search Bar */}
                        <div className="relative">
                            <Input
                                placeholder={t.placeholder}
                                value={searchQuery}
                                onChange={(val) => setSearchQuery(val)}
                                className="pl-10"
                            />
                            <Search className="absolute top-3 left-3.5 size-4 text-slate-400 pointer-events-none" />
                        </div>

                        {/* Lessons Table */}
                        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/50">
                            {filteredLessons.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                    <BookOpen className="size-8 opacity-40 text-purple-400" />
                                    <p className="mt-2 text-xs font-medium">{t.empty}</p>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200/80 bg-slate-100/70 text-xs font-extrabold uppercase tracking-wider text-slate-600">
                                            <th className="py-3.5 px-4.5 w-16 text-center">{t.thStt}</th>
                                            <th className="py-3.5 px-4.5">{t.thLessonName}</th>
                                            <th className="py-3.5 px-4.5 w-44 text-right">{t.thActions}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {filteredLessons.map((lesson, index) => (
                                            <tr
                                                key={lesson.id}
                                                onClick={() => handleSelect(lesson)}
                                                className="group cursor-pointer transition hover:bg-purple-50/50"
                                            >
                                                <td className="py-3.5 px-4.5 text-center font-extrabold text-slate-400 text-sm">
                                                    {index + 1}
                                                </td>
                                                <td className="py-3.5 px-4.5 font-bold text-slate-800 text-sm group-hover:text-purple-700 transition">
                                                    {lesson.name}
                                                </td>
                                                <td className="py-3.5 px-4.5 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleSelect(lesson);
                                                        }}
                                                        className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 px-3 py-1.5 text-xs font-extrabold text-purple-700 transition group-hover:bg-purple-600 group-hover:text-white"
                                                    >
                                                        <span>{t.btnSelect}</span>
                                                        <ChevronRight className="size-3.5" />
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
