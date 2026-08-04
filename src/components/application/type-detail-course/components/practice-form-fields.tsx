"use client";

import { FileText, Link as LinkIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { TiptapEditor } from "@/components/base/editor";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { type PracticeFormFieldsProps, SubmissionTypeEnum } from "@/types/courseware.types";

export function PracticeFormFields({ submissionType, setSubmissionType, content, setContent, resources, setResources }: PracticeFormFieldsProps) {
    return (
        <div className="flex flex-col gap-4">
            {/* Submission Type */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-700">
                    {UI_TEXT.practiceFormFields.submissionTypeLabel} <span className="text-red-500">{"*"}</span>
                </label>
                <div className="flex h-[42px] w-full items-center gap-1 rounded-xl border border-slate-200/80 bg-slate-100/90 p-1">
                    <button
                        type="button"
                        onClick={() => setSubmissionType(SubmissionTypeEnum.LINK)}
                        className={`flex h-full flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                            submissionType === SubmissionTypeEnum.LINK
                                ? "bg-wine text-white shadow-xs"
                                : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
                        }`}
                    >
                        <LinkIcon className={`size-3.5 ${submissionType === SubmissionTypeEnum.LINK ? "text-white" : "text-slate-400"}`} />
                        <span>{UI_TEXT.practiceFormFields.submitLink}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setSubmissionType(SubmissionTypeEnum.FILE)}
                        className={`flex h-full flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                            submissionType === SubmissionTypeEnum.FILE
                                ? "bg-wine text-white shadow-xs"
                                : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
                        }`}
                    >
                        <FileText className={`size-3.5 ${submissionType === SubmissionTypeEnum.FILE ? "text-white" : "text-slate-400"}`} />
                        <span>{UI_TEXT.practiceFormFields.submitFile}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setSubmissionType(SubmissionTypeEnum.TEXT)}
                        className={`flex h-full flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                            submissionType === SubmissionTypeEnum.TEXT
                                ? "bg-wine text-white shadow-xs"
                                : "text-slate-600 hover:bg-slate-200/60 hover:text-slate-900"
                        }`}
                    >
                        <Pencil className={`size-3.5 ${submissionType === SubmissionTypeEnum.TEXT ? "text-white" : "text-slate-400"}`} />
                        <span>{UI_TEXT.practiceFormFields.submitText}</span>
                    </button>
                </div>
            </div>

            {/* TiptapEditor Content */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-700">
                    {UI_TEXT.practiceFormFields.contentLabel} <span className="text-red-500">{"*"}</span>
                </label>
                <TiptapEditor
                    value={content}
                    onChange={setContent}
                    placeholder={UI_TEXT.practiceFormFields.contentPlaceholder}
                    className="min-h-[160px] w-full overflow-hidden rounded-xl border border-slate-200 bg-white"
                />
            </div>

            {/* Resources List */}
            <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-700">{UI_TEXT.practiceFormFields.resourcesLabel}</label>
                    <button
                        type="button"
                        onClick={() => setResources((prev) => [...prev, { label: "", url: "" }])}
                        className="hover:text-wine-hover flex cursor-pointer items-center gap-1 text-xs font-extrabold text-wine transition"
                    >
                        <Plus className="size-3.5" /> {UI_TEXT.practiceFormFields.addResourceBtn}
                    </button>
                </div>
                <div className="flex flex-col gap-2">
                    {resources.map((resource, resIdx) => (
                        <div key={resIdx} className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 p-2">
                            <input
                                type="text"
                                value={resource.label}
                                onChange={(e) => {
                                    const newRes = [...resources];
                                    newRes[resIdx].label = e.target.value;
                                    setResources(newRes);
                                }}
                                placeholder={UI_TEXT.practiceFormFields.resourceLabelPlaceholder}
                                className="w-1/2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold focus:border-wine focus:outline-none"
                            />
                            <input
                                type="text"
                                value={resource.url}
                                onChange={(e) => {
                                    const newRes = [...resources];
                                    newRes[resIdx].url = e.target.value;
                                    setResources(newRes);
                                }}
                                placeholder={UI_TEXT.practiceFormFields.resourceUrlPlaceholder}
                                className="w-1/2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold focus:border-wine focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setResources(resources.filter((_, rIdx) => rIdx !== resIdx))}
                                className="shrink-0 cursor-pointer rounded-lg p-1.5 text-red-500 transition hover:bg-red-50 hover:text-red-600"
                                title={UI_TEXT.practiceFormFields.deleteResourceTooltip}
                            >
                                <Trash2 className="size-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
