import { BookText, ExternalLink, File, FileText, HelpCircle, Map, ScrollText } from "lucide-react";
import { UI_TEXT } from "@/constants/ui-text.constants";
import type { SessionViewerWrapperProps } from "@/types/material.types";
import { getEmbeddableUrl } from "@/utils/type-detail-course.utils";
import { SessionHomeworkEditor } from "./session-homework-editor";
import { SessionPracticeEditor } from "./session-practice-editor";

export function SessionViewerWrapper({ session, activeTab, selectedPracticeId }: SessionViewerWrapperProps) {
    if (!session) return null;

    if (activeTab === "practice") {
        return <SessionPracticeEditor session={session} selectedPracticeId={selectedPracticeId} />;
    }

    if (activeTab === "homework") {
        return <SessionHomeworkEditor session={session} />;
    }

    const hasMindmap = !!session.mindmap;
    const hasPdf = !!session.pdf;
    const hasSrs = !!session.srs;
    const hasMiniProject = !!session.miniProject;
    const hasExercise = !!session.exercise;
    const hasEntranceQuiz = !!session.practiceEntranceQuiz;

    const noResources = !hasMindmap && !hasPdf && !hasSrs && !hasMiniProject && !hasExercise && !hasEntranceQuiz;

    return (
        <div className="flex h-full min-h-0 flex-1 flex-col gap-4">
            {/* Header */}
            <div className="flex shrink-0 flex-col border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-800">
                    {activeTab === "mindmap" && UI_TEXT.sessionViewer.headerViewMindmap}
                    {activeTab === "pdf" && UI_TEXT.sessionViewer.headerViewPdf}
                    {activeTab === "srs" && UI_TEXT.sessionViewer.headerViewSrs}
                    {activeTab === "miniProject" && UI_TEXT.sessionViewer.headerViewMiniProject}
                    {activeTab === "exercise" && UI_TEXT.sessionViewer.headerViewExercise}
                    {activeTab === "practiceEntranceQuiz" && UI_TEXT.sessionViewer.headerViewEntranceQuiz}
                </h3>
                <p className="mt-0.5 text-sm font-medium text-slate-400">{session.name}</p>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
                {noResources ? (
                    <div className="animate-fadeIn flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/30 p-8 text-center">
                        <Map className="size-8 text-slate-300" />
                        <h4 className="text-xs font-bold text-slate-800">{UI_TEXT.sessionViewer.labelNoConfigTitle}</h4>
                    </div>
                ) : activeTab === "mindmap" ? (
                    <div className="animate-fadeIn flex h-full min-h-0 flex-1 flex-col">
                        {hasMindmap ? (
                            (() => {
                                const embedInfo = getEmbeddableUrl(session.mindmap || "");
                                return embedInfo.canEmbed ? (
                                    <div className="flex h-full flex-1 flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <span className="max-w-[400px] truncate text-[10px] font-semibold text-slate-400">
                                                {UI_TEXT.sessionViewer.labelPathPrefix}{" "}
                                                <a href={session.mindmap} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                                    {session.mindmap}
                                                </a>
                                            </span>
                                            <a
                                                href={session.mindmap}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-black text-slate-700 transition duration-150 hover:bg-slate-100"
                                            >
                                                {UI_TEXT.sessionViewer.btnOpenInNewTab} <ExternalLink className="size-3" />
                                            </a>
                                        </div>
                                        <div className="w-full flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                            <iframe
                                                src={embedInfo.embedUrl}
                                                className="h-full w-full border-none"
                                                title={UI_TEXT.sessionViewer.iframeMindmapPreview}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/30 p-8 text-center">
                                        <div className="flex size-16 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400">
                                            <Map className="size-7 text-slate-400" />
                                        </div>
                                        <div className="flex max-w-[360px] flex-col gap-1">
                                            <h4 className="text-sm font-black text-slate-800">{UI_TEXT.sessionViewer.labelNoMindmapTitle}</h4>
                                            <p className="text-xs leading-relaxed font-semibold text-slate-400">{UI_TEXT.sessionViewer.labelEmbedSecurityDesc}</p>
                                        </div>
                                        <a
                                            href={session.mindmap}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:bg-wine-hover flex cursor-pointer items-center gap-1.5 rounded-full bg-wine px-6 py-2.5 text-xs font-black text-white shadow-md shadow-wine/20 transition duration-150 active:scale-[0.98]"
                                        >
                                            {UI_TEXT.sessionViewer.btnOpenLinkMindmap} <ExternalLink className="size-3.5" />
                                        </a>
                                    </div>
                                );
                            })()
                        ) : (
                            <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/30 p-8 text-center">
                                <Map className="size-8 text-slate-300" />
                                <h4 className="text-xs font-bold text-slate-800">{UI_TEXT.sessionViewer.noMindmapTitle}</h4>
                            </div>
                        )}
                    </div>
                ) : activeTab === "pdf" && hasPdf ? (
                    <div className="animate-fadeIn flex h-full min-h-0 flex-1 flex-col">
                        {(() => {
                            const embedInfo = getEmbeddableUrl(session.mindmap || "");
                            return embedInfo.canEmbed ? (
                                <div className="flex h-full flex-1 flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="max-w-[400px] truncate text-[10px] font-semibold text-slate-400">
                                            {UI_TEXT.sessionViewer.labelPathPrefix}{" "}
                                            <a href={session.mindmap} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                                {session.mindmap}
                                            </a>
                                        </span>
                                        <a
                                            href={session.mindmap}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-black text-slate-700 transition duration-150 hover:bg-slate-100"
                                        >
                                            {UI_TEXT.sessionViewer.btnOpenInNewTab} <ExternalLink className="size-3" />
                                        </a>
                                    </div>
                                    <div className="w-full flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                        <iframe
                                            src={embedInfo.embedUrl}
                                            className="h-full w-full border-none"
                                            title={UI_TEXT.sessionViewer.iframeMindmapPreview}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/30 p-8 text-center">
                                    <div className="flex size-16 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400">
                                        <Map className="size-7 text-slate-400" />
                                    </div>
                                    <div className="flex max-w-[360px] flex-col gap-1">
                                        <h4 className="text-sm font-black text-slate-800">{UI_TEXT.sessionViewer.labelNoMindmapTitle}</h4>
                                        <p className="text-xs leading-relaxed font-semibold text-slate-400">{UI_TEXT.sessionViewer.labelEmbedSecurityDesc}</p>
                                    </div>
                                    <a
                                        href={session.mindmap}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:bg-wine-hover flex cursor-pointer items-center gap-1.5 rounded-full bg-wine px-6 py-2.5 text-xs font-black text-white shadow-md shadow-wine/20 transition duration-150 active:scale-[0.98]"
                                    >
                                        {UI_TEXT.sessionViewer.btnOpenLinkMindmap} <ExternalLink className="size-3.5" />
                                    </a>
                                </div>
                            );
                        })()}
                    </div>
                ) : activeTab === "pdf" && hasPdf ? (
                    <div className="animate-fadeIn flex h-full min-h-0 flex-1 flex-col">
                        {(() => {
                            const embedInfo = getEmbeddableUrl(session.pdf || "");
                            return embedInfo.canEmbed ? (
                                <div className="flex h-full flex-1 flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="max-w-[400px] truncate text-[10px] font-semibold text-slate-400">
                                            {UI_TEXT.sessionViewer.labelPathPrefix}{" "}
                                            <a href={session.pdf} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                                {session.pdf}
                                            </a>
                                        </span>
                                        <a
                                            href={session.pdf}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-black text-slate-700 transition duration-150 hover:bg-slate-100"
                                        >
                                            {UI_TEXT.sessionViewer.btnOpenInNewTab} <ExternalLink className="size-3" />
                                        </a>
                                    </div>
                                    <div className="w-full flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                        <iframe src={embedInfo.embedUrl} className="h-full w-full border-none" title={UI_TEXT.sessionViewer.iframePdfPreview} />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/30 p-8 text-center">
                                    <div className="flex size-16 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400">
                                        <FileText className="size-7 text-slate-400" />
                                    </div>
                                    <div className="flex max-w-[360px] flex-col gap-1">
                                        <h4 className="text-sm font-black text-slate-800">{UI_TEXT.sessionViewer.labelNoPdfTitle}</h4>
                                        <p className="text-xs leading-relaxed font-semibold text-slate-400">{UI_TEXT.sessionViewer.labelEmbedSecurityDesc}</p>
                                    </div>
                                    <a
                                        href={session.pdf}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:bg-wine-hover flex cursor-pointer items-center gap-1.5 rounded-full bg-wine px-6 py-2.5 text-xs font-black text-white shadow-md shadow-wine/20 transition duration-150 active:scale-[0.98]"
                                    >
                                        {UI_TEXT.sessionViewer.btnOpenLinkPdf} <ExternalLink className="size-3.5" />
                                    </a>
                                </div>
                            );
                        })()}
                    </div>
                ) : activeTab === "srs" && hasSrs ? (
                    <div className="animate-fadeIn flex h-full min-h-0 flex-1 flex-col">
                        {(() => {
                            const embedInfo = getEmbeddableUrl(session.srs || "");
                            return embedInfo.canEmbed ? (
                                <div className="flex h-full flex-1 flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="max-w-[400px] truncate text-[10px] font-semibold text-slate-400">
                                            {UI_TEXT.sessionViewer.labelPathPrefix}{" "}
                                            <a href={session.srs} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                                {session.srs}
                                            </a>
                                        </span>
                                        <a
                                            href={session.srs}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-black text-slate-700 transition duration-150 hover:bg-slate-100"
                                        >
                                            {UI_TEXT.sessionViewer.btnOpenInNewTab} <ExternalLink className="size-3" />
                                        </a>
                                    </div>
                                    <div className="w-full flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                        <iframe src={embedInfo.embedUrl} className="h-full w-full border-none" title={UI_TEXT.sessionViewer.iframeSrsPreview} />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/30 p-8 text-center">
                                    <div className="flex size-16 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400">
                                        <ScrollText className="size-7 text-slate-400" />
                                    </div>
                                    <div className="flex max-w-[360px] flex-col gap-1">
                                        <h4 className="text-sm font-black text-slate-800">{UI_TEXT.sessionViewer.labelNoSrsTitle}</h4>
                                        <p className="text-xs leading-relaxed font-semibold text-slate-400">{UI_TEXT.sessionViewer.labelEmbedSecurityDesc}</p>
                                    </div>
                                    <a
                                        href={session.srs}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:bg-wine-hover flex cursor-pointer items-center gap-1.5 rounded-full bg-wine px-6 py-2.5 text-xs font-black text-white shadow-md shadow-wine/20 transition duration-150 active:scale-[0.98]"
                                    >
                                        {UI_TEXT.sessionViewer.btnOpenLinkSrs} <ExternalLink className="size-3.5" />
                                    </a>
                                </div>
                            );
                        })()}
                    </div>
                ) : activeTab === "miniProject" && hasMiniProject ? (
                    <div className="animate-fadeIn flex h-full min-h-0 flex-1 flex-col">
                        {(() => {
                            const embedInfo = getEmbeddableUrl(session.miniProject || "");
                            return embedInfo.canEmbed ? (
                                <div className="flex h-full flex-1 flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="max-w-[400px] truncate text-[10px] font-semibold text-slate-400">
                                            {UI_TEXT.sessionViewer.labelPathPrefix}{" "}
                                            <a href={session.miniProject} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                                {session.miniProject}
                                            </a>
                                        </span>
                                        <a
                                            href={session.miniProject}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-black text-slate-700 transition duration-150 hover:bg-slate-100"
                                        >
                                            {UI_TEXT.sessionViewer.btnOpenInNewTab} <ExternalLink className="size-3" />
                                        </a>
                                    </div>
                                    <div className="w-full flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                        <iframe
                                            src={embedInfo.embedUrl}
                                            className="h-full w-full border-none"
                                            title={UI_TEXT.sessionViewer.iframeMiniProjectPreview}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/30 p-8 text-center">
                                    <div className="flex size-16 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400">
                                        <File className="size-7 text-slate-400" />
                                    </div>
                                    <div className="flex max-w-[360px] flex-col gap-1">
                                        <h4 className="text-sm font-black text-slate-800">{UI_TEXT.sessionViewer.labelNoMiniProjectTitle}</h4>
                                        <p className="text-xs leading-relaxed font-semibold text-slate-400">{UI_TEXT.sessionViewer.labelNoMiniProjectDesc}</p>
                                    </div>
                                    <a
                                        href={session.miniProject}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:bg-wine-hover flex cursor-pointer items-center gap-1.5 rounded-full bg-wine px-6 py-2.5 text-xs font-black text-white shadow-md shadow-wine/20 transition duration-150 active:scale-[0.98]"
                                    >
                                        {UI_TEXT.sessionViewer.btnOpenLinkMiniProject} <ExternalLink className="size-3.5" />
                                    </a>
                                </div>
                            );
                        })()}
                    </div>
                ) : activeTab === "exercise" && hasExercise ? (
                    <div className="animate-fadeIn flex h-full min-h-0 flex-1 flex-col">
                        {(() => {
                            const embedInfo = getEmbeddableUrl(session.exercise || "");
                            const isUrl = session.exercise?.startsWith("http://") || session.exercise?.startsWith("https://");
                            return isUrl && embedInfo.canEmbed ? (
                                <div className="flex h-full flex-1 flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="max-w-[400px] truncate text-[10px] font-semibold text-slate-400">
                                            {UI_TEXT.sessionViewer.labelPathPrefix}{" "}
                                            <a href={session.exercise} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                                {session.exercise}
                                            </a>
                                        </span>
                                        <a
                                            href={session.exercise}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-black text-slate-700 transition duration-150 hover:bg-slate-100"
                                        >
                                            {UI_TEXT.sessionViewer.btnOpenInNewTab} <ExternalLink className="size-3" />
                                        </a>
                                    </div>
                                    <div className="w-full flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                        <iframe
                                            src={embedInfo.embedUrl}
                                            className="h-full w-full border-none"
                                            title={UI_TEXT.sessionViewer.iframeExercisePreview}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/30 p-8 text-center">
                                    <div className="flex size-16 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400">
                                        <BookText className="size-7 text-slate-400" />
                                    </div>
                                    <div className="flex max-w-[360px] flex-col gap-1">
                                        <h4 className="text-sm font-black text-slate-800">{UI_TEXT.sessionViewer.labelNoExerciseTitle}</h4>
                                        <p className="text-xs leading-relaxed font-semibold break-all text-slate-400">{session.exercise}</p>
                                    </div>
                                    {isUrl && (
                                        <a
                                            href={session.exercise}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:bg-wine-hover flex cursor-pointer items-center gap-1.5 rounded-full bg-wine px-6 py-2.5 text-xs font-black text-white shadow-md shadow-wine/20 transition duration-150 active:scale-[0.98]"
                                        >
                                            {UI_TEXT.sessionViewer.btnOpenLinkExercise} <ExternalLink className="size-3.5" />
                                        </a>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                ) : activeTab === "practiceEntranceQuiz" && hasEntranceQuiz ? (
                    <div className="animate-fadeIn flex h-full min-h-0 flex-1 flex-col">
                        {(() => {
                            const embedInfo = getEmbeddableUrl(session.practiceEntranceQuiz || "");
                            const isUrl = session.practiceEntranceQuiz?.startsWith("http://") || session.practiceEntranceQuiz?.startsWith("https://");
                            return isUrl && embedInfo.canEmbed ? (
                                <div className="flex h-full flex-1 flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="max-w-[400px] truncate text-[10px] font-semibold text-slate-400">
                                            {UI_TEXT.sessionViewer.labelPathPrefix}{" "}
                                            <a
                                                href={session.practiceEntranceQuiz}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:underline"
                                            >
                                                {session.practiceEntranceQuiz}
                                            </a>
                                        </span>
                                        <a
                                            href={session.practiceEntranceQuiz}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-black text-slate-700 transition duration-150 hover:bg-slate-100"
                                        >
                                            {UI_TEXT.sessionViewer.btnOpenInNewTab} <ExternalLink className="size-3" />
                                        </a>
                                    </div>
                                    <div className="w-full flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                        <iframe
                                            src={embedInfo.embedUrl}
                                            className="h-full w-full border-none"
                                            title={UI_TEXT.sessionViewer.iframeEntranceQuizPreview}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/30 p-8 text-center">
                                    <div className="flex size-16 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400">
                                        <HelpCircle className="size-7 text-slate-400" />
                                    </div>
                                    <div className="flex max-w-[360px] flex-col gap-1">
                                        <h4 className="text-sm font-black text-slate-800">{UI_TEXT.sessionViewer.labelNoEntranceQuizTitle}</h4>
                                        <p className="text-xs leading-relaxed font-semibold break-all text-slate-400">{session.practiceEntranceQuiz}</p>
                                    </div>
                                    {isUrl && (
                                        <a
                                            href={session.practiceEntranceQuiz}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:bg-wine-hover flex cursor-pointer items-center gap-1.5 rounded-full bg-wine px-6 py-2.5 text-xs font-black text-white shadow-md shadow-wine/20 transition duration-150 active:scale-[0.98]"
                                        >
                                            {UI_TEXT.sessionViewer.btnOpenLinkEntranceQuiz} <ExternalLink className="size-3.5" />
                                        </a>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
