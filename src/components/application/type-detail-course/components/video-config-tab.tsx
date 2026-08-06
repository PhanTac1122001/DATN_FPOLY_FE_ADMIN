"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ChevronDown, ChevronRight, Circle, Plus, Trash2, Video } from "lucide-react";
import { UI_TEXT } from "@/constants/ui-text.constants";
import {
    QuestionTypeEnum,
    type VideoConfigTabProps,
    type VideoQuestion,
    type VideoQuestionOption,
    type YTGlobal,
    type YTPlayer,
} from "@/types/courseware.types";
import { ConfirmModal } from "@/components/application/modals/confirm-modal";
import { LinkVideoModal, SelectVideoSourceModal } from "../modals/select-video-source-modal";

export type { VideoQuestion, VideoQuestionOption };

export function VideoConfigTab({ url, setUrl, duration, setDuration, file, setFile, questions, setQuestions, onDelete: _onDelete, onRegisterOpenModal, submitted = false }: VideoConfigTabProps) {
    const [, setVideoType] = useState<"link" | "file" | "">("");
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
    const [deleteQuestionIndex, setDeleteQuestionIndex] = useState<number | null>(null);
    const [tempLink, setTempLink] = useState("");
    const [expandedQuestionIndices, setExpandedQuestionIndices] = useState<number[]>([0]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (onRegisterOpenModal) {
            onRegisterOpenModal(() => setIsSelectModalOpen(true));
        }
    }, [onRegisterOpenModal]);

    useEffect(() => {
        if (url) {
            setVideoType("link");
        } else if (file) {
            setVideoType("file");
        } else {
            setVideoType("");
        }
    }, [url, file]);

    const youtubeVideoIdLength = 11;
    const youtubePlayerInitDelayMs = 200;
    const maxOptionsCount = 6;
    const minOptionsCount = 2;
    const regexCapturedGroupIndex = 2;

    const getYoutubeId = (urlStr: string) => {
        if (!urlStr) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = urlStr.match(regExp);
        return match && match[regexCapturedGroupIndex].length === youtubeVideoIdLength ? match[regexCapturedGroupIndex] : null;
    };

    const youtubeId = getYoutubeId(url);

    useEffect(() => {
        if (!youtubeId) return;

        let player: YTPlayer | null = null;
        let isDestroyed = false;
        let ytDiv: HTMLDivElement | null = null;

        const container = document.getElementById("youtube-container");
        if (container) {
            ytDiv = document.createElement("div");
            ytDiv.id = "youtube-preview-player";
            ytDiv.className = "w-full h-full";
            container.appendChild(ytDiv);
        }

        const initPlayer = () => {
            if (isDestroyed || !ytDiv) return;
            const ytGlobal = (window as unknown as { YT?: YTGlobal }).YT;
            if (ytGlobal && ytGlobal.Player) {
                try {
                    player = new ytGlobal.Player(ytDiv, {
                        height: "100%",
                        width: "100%",
                        videoId: youtubeId,
                        playerVars: {
                            rel: 0,
                            autoplay: 0,
                            controls: 1,
                        },
                        events: {
                            onReady: (event: { target: YTPlayer }) => {
                                const dur = event.target.getDuration();
                                if (dur) {
                                    setDuration(Math.round(dur));
                                }
                            },
                        },
                    });
                } catch {
                    // Ignore player creation error
                }
            } else {
                setTimeout(initPlayer, youtubePlayerInitDelayMs);
            }
        };

        const winObj = window as unknown as { YT?: YTGlobal; onYouTubeIframeAPIReady?: () => void };
        if (!winObj.YT) {
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName("script")[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
            winObj.onYouTubeIframeAPIReady = initPlayer;
        } else {
            initPlayer();
        }

        return () => {
            isDestroyed = true;
            if (player && typeof player.destroy === "function") {
                try {
                    player.destroy();
                } catch {
                    // Ignore destroy errors
                }
            }
            if (ytDiv && ytDiv.parentNode) {
                try {
                    ytDiv.parentNode.removeChild(ytDiv);
                } catch {
                    // Ignore DOM removal errors
                }
            }
        };
    }, [youtubeId, setDuration]);

    const addQuestion = () => {
        const newQuestions: VideoQuestion[] = [
            ...questions,
            {
                content: "",
                type: QuestionTypeEnum.SINGLE_CHOICE,
                timeInVideo: 0,
                points: 1,
                options: [
                    { content: "", isCorrect: true },
                    { content: "", isCorrect: false },
                ],
            },
        ];
        setQuestions(newQuestions);
        setExpandedQuestionIndices([...expandedQuestionIndices, newQuestions.length - 1]);
    };

    const toggleQuestionExpand = (idx: number) => {
        if (expandedQuestionIndices.includes(idx)) {
            setExpandedQuestionIndices(expandedQuestionIndices.filter((i) => i !== idx));
        } else {
            setExpandedQuestionIndices([...expandedQuestionIndices, idx]);
        }
    };

    const hasVideo = !!url || !!file;
    const videoSrc = file ? URL.createObjectURL(file) : url;

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
            <div className={`relative flex flex-col gap-1.5 ${hasVideo ? "" : "min-h-0 flex-1"}`}>
                {hasVideo && (
                    <div className="flex w-full items-center justify-between">
                        <label className="text-sm font-medium text-slate-500">{UI_TEXT.videoConfigTab.videoLabel}</label>
                    </div>
                )}
                {hasVideo ? (
                    /* Video Preview Player */
                    <div className="mx-auto flex w-full flex-col gap-3">
                        <div className="relative flex aspect-video w-full flex-col justify-center overflow-hidden rounded-xl bg-slate-950 shadow-inner">
                            {youtubeId ? (
                                <div id="youtube-container" className="h-full w-full" />
                            ) : videoSrc ? (
                                <video
                                    src={videoSrc}
                                    controls
                                    className="h-full w-full"
                                    onLoadedMetadata={(e) => {
                                        const video = e.currentTarget;
                                        if (video && video.duration) {
                                            setDuration(Math.round(video.duration));
                                        }
                                    }}
                                />
                            ) : null}
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                <span>{UI_TEXT.videoConfigTab.durationLabel}</span>
                                <span className="font-extrabold text-slate-800">
                                    {duration} {UI_TEXT.videoConfigTab.durationSuffix}
                                </span>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Centered Empty State View for Video */
                    <div className="animate-fadeIn flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/30 p-8 py-14 text-center">
                        <div className="flex size-16 items-center justify-center rounded-full border-2 border-dashed border-slate-200 bg-white text-slate-400">
                            <Video className="size-6 text-slate-400" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <h4 className="text-sm font-black text-slate-800">{UI_TEXT.videoConfigTab.emptyTitle}</h4>
                            <p className="max-w-[320px] text-xs leading-relaxed font-medium text-slate-400">{UI_TEXT.videoConfigTab.emptyDescription}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsSelectModalOpen(true)}
                            className="hover:bg-wine-hover flex cursor-pointer items-center gap-1.5 rounded-full bg-wine px-6 py-2.5 text-xs font-black text-white shadow-xs transition duration-150 active:scale-[0.98]"
                        >
                            {UI_TEXT.videoConfigTab.addVideoBtn}
                        </button>
                    </div>
                )}
            </div>

            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                    const selectedFile = e.target.files?.[0] || null;
                    if (selectedFile) {
                        setFile(selectedFile);
                        setUrl("");
                        setVideoType("file");
                    }
                }}
            />

            {/* Link Input Modal */}
            <LinkVideoModal
                isOpen={isLinkModalOpen}
                onOpenChange={setIsLinkModalOpen}
                tempLink={tempLink}
                setTempLink={setTempLink}
                onBack={() => {
                    setIsLinkModalOpen(false);
                    setIsSelectModalOpen(true);
                }}
                onConfirm={() => {
                    setUrl(tempLink);
                    setFile(null);
                    setIsLinkModalOpen(false);
                }}
            />

            {/* Video Source Method Selection Modal */}
            <SelectVideoSourceModal
                isOpen={isSelectModalOpen}
                onOpenChange={setIsSelectModalOpen}
                onSelectLink={() => {
                    setIsSelectModalOpen(false);
                    setVideoType("link");
                    setTempLink(url);
                    setIsLinkModalOpen(true);
                }}
                onSelectFile={() => {
                    setIsSelectModalOpen(false);
                    setVideoType("file");
                    if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                    }
                    fileInputRef.current?.click();
                }}
            />

            {/* Video Questions */}
            {hasVideo && (
                <div className="pt-4">
                    <div className="mb-3 flex items-center justify-between">
                        <label className="text-sm font-bold text-slate-700">{UI_TEXT.learningMaterials.embeddedQuestionsTitle}</label>
                        <button
                            type="button"
                            onClick={addQuestion}
                            className="hover:bg-wine-hover flex cursor-pointer items-center gap-1.5 rounded-full bg-wine px-5 py-2 text-xs font-black text-white shadow-xs transition duration-150"
                        >
                            <Plus className="size-3.5" />
                            <span>{UI_TEXT.videoConfigTab.addEmbeddedQuestionBtn}</span>
                        </button>
                    </div>

                    <div className="flex flex-col gap-3">
                        {questions.map((q, idx) => {
                            const isExpanded = expandedQuestionIndices.includes(idx);
                            return (
                                <div key={idx} className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/20 transition-all duration-200">
                                    {/* Header */}
                                    <div
                                        onClick={() => toggleQuestionExpand(idx)}
                                        className="flex cursor-pointer items-center justify-between bg-slate-50/40 p-3.5 transition duration-150 select-none hover:bg-slate-50/80"
                                    >
                                        <div className="flex min-w-0 flex-1 items-center gap-2">
                                            {isExpanded ? (
                                                <ChevronDown className="size-4 shrink-0 text-slate-400" />
                                            ) : (
                                                <ChevronRight className="size-4 shrink-0 text-slate-400" />
                                            )}
                                            <span className="shrink-0 text-xs font-bold text-slate-700">
                                                {UI_TEXT.videoConfigTab.questionIndexPrefix}
                                                {idx + 1}
                                            </span>
                                            <span className="truncate text-[10px] font-medium text-slate-400">
                                                {UI_TEXT.videoConfigTab.timestampPrefix}
                                                {q.timeInVideo}
                                                {UI_TEXT.videoConfigTab.timestampSecondsSuffix} {q.content ? `- ${q.content}` : ""}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteQuestionIndex(idx);
                                            }}
                                            className="cursor-pointer p-1 text-red-500 transition hover:text-red-600"
                                            title={UI_TEXT.videoConfigTab.deleteQuestionTooltip}
                                        >
                                            <Trash2 className="size-3.5" />
                                        </button>
                                    </div>

                                    {/* Body */}
                                    {isExpanded && (
                                        <div className="flex flex-col gap-3 border-t border-slate-100/60 p-3.5 pt-3">
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="col-span-2 flex flex-col gap-1.5">
                                                    <label className="text-xs font-bold text-slate-700">
                                                        {UI_TEXT.videoConfigTab.questionContentLabel} <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={q.content}
                                                        onChange={(e) => {
                                                            const copy = [...questions];
                                                            copy[idx].content = e.target.value;
                                                            setQuestions(copy);
                                                        }}
                                                        placeholder={UI_TEXT.videoConfigTab.questionContentPlaceholder}
                                                        className={`w-full rounded-full border bg-white px-4 py-2 text-xs font-semibold text-slate-800 transition duration-150 focus:outline-none focus:ring-2 ${
                                                            submitted && !(q.content || "").trim()
                                                                ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                                                                : "border-slate-200 focus:border-wine focus:ring-wine/10"
                                                        }`}
                                                    />
                                                    {submitted && !(q.content || "").trim() && (
                                                        <p className="mt-0.5 text-[11px] font-medium text-red-500">Vui lòng điền vào trường này.</p>
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-xs font-bold text-slate-700">
                                                        {UI_TEXT.videoConfigTab.timestampLabel} <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={q.timeInVideo}
                                                        onChange={(e) => {
                                                            const copy = [...questions];
                                                            let val = e.target.value;
                                                            if (val.length > 1 && val.startsWith("0")) {
                                                                val = val.replace(/^0+/, "");
                                                            }
                                                            copy[idx].timeInVideo = val === "" ? 0 : Number(val);
                                                            setQuestions(copy);
                                                        }}
                                                        onFocus={(e) => e.target.select()}
                                                        className={`w-full rounded-full border bg-white px-4 py-2 text-xs font-semibold text-slate-800 transition duration-150 focus:outline-none focus:ring-2 ${
                                                            submitted && (q.timeInVideo === undefined || q.timeInVideo === null || q.timeInVideo < 0)
                                                                ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                                                                : "border-slate-200 focus:border-wine focus:ring-wine/10"
                                                        }`}
                                                    />
                                                    {submitted && (q.timeInVideo === undefined || q.timeInVideo === null || q.timeInVideo < 0) && (
                                                        <p className="mt-0.5 text-[11px] font-medium text-red-500">Thời điểm không hợp lệ.</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-2 flex flex-col gap-2.5">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-xs font-bold text-slate-700">{UI_TEXT.videoConfigTab.optionsListTitle}</label>
                                                    {q.options.length < maxOptionsCount && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const copy = [...questions];
                                                                copy[idx].options.push({ content: "", isCorrect: false });
                                                                setQuestions(copy);
                                                            }}
                                                            className="flex cursor-pointer items-center gap-1 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 text-[9px] font-bold text-blue-600 transition hover:bg-slate-100 hover:text-blue-700"
                                                        >
                                                            <Plus className="size-3 text-blue-600" />
                                                            <span>{UI_TEXT.videoConfigTab.addOptionBtn}</span>
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {q.options.map((opt: VideoQuestionOption, optIdx: number) => {
                                                        const isCorrect = opt.isCorrect;
                                                        return (
                                                            <div
                                                                key={optIdx}
                                                                className={`relative flex flex-col gap-2.5 rounded-2xl border bg-white p-3.5 transition duration-150 ${
                                                                    isCorrect ? "border-emerald-500 bg-emerald-50/10" : "border-slate-200"
                                                                }`}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const copy = [...questions];
                                                                            copy[idx].options.forEach((o: VideoQuestionOption, oIdx: number) => {
                                                                                o.isCorrect = oIdx === optIdx;
                                                                            });
                                                                            setQuestions(copy);
                                                                        }}
                                                                        className="flex cursor-pointer items-center gap-1.5"
                                                                    >
                                                                        {isCorrect ? (
                                                                            <CheckCircle2 className="size-4 fill-emerald-100 text-emerald-600" />
                                                                        ) : (
                                                                            <Circle className="size-4 text-slate-400" />
                                                                        )}
                                                                        <span
                                                                            className={`text-[11px] font-bold ${isCorrect ? "text-emerald-600" : "text-slate-400"}`}
                                                                        >
                                                                            {isCorrect ? UI_TEXT.videoConfigTab.correctText : UI_TEXT.videoConfigTab.incorrectText}
                                                                        </span>
                                                                    </button>
                                                                    {q.options.length > minOptionsCount && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                const copy = [...questions];
                                                                                copy[idx].options.splice(optIdx, 1);
                                                                                if (isCorrect && copy[idx].options.length > 0) {
                                                                                    copy[idx].options[0].isCorrect = true;
                                                                                }
                                                                                setQuestions(copy);
                                                                            }}
                                                                            className="cursor-pointer p-0.5 text-red-500 transition hover:text-red-600"
                                                                            title={UI_TEXT.videoConfigTab.deleteOptionTooltip}
                                                                        >
                                                                            <Trash2 className="size-3.5" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <div className="flex flex-col gap-1">
                                                                    <input
                                                                        type="text"
                                                                        value={opt.content}
                                                                        onChange={(e) => {
                                                                            const copy = [...questions];
                                                                            copy[idx].options[optIdx].content = e.target.value;
                                                                            setQuestions(copy);
                                                                        }}
                                                                        placeholder={UI_TEXT.videoConfigTab.optionContentPlaceholder}
                                                                        className={`w-full rounded-full border bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 transition duration-150 focus:outline-none focus:ring-2 ${
                                                                            submitted && !(opt.content || "").trim()
                                                                                ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
                                                                                : "border-slate-200 focus:border-wine focus:ring-wine/10"
                                                                        }`}
                                                                    />
                                                                    {submitted && !(opt.content || "").trim() && (
                                                                        <p className="px-1 text-[10px] font-medium text-red-500">Vui lòng điền vào trường này.</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Confirm Delete Question Modal */}
            <ConfirmModal
                isOpen={deleteQuestionIndex !== null}
                onClose={() => setDeleteQuestionIndex(null)}
                onConfirm={() => {
                    if (deleteQuestionIndex !== null) {
                        const copy = [...questions];
                        copy.splice(deleteQuestionIndex, 1);
                        setQuestions(copy);
                        setExpandedQuestionIndices((prev) =>
                            prev.filter((i) => i !== deleteQuestionIndex).map((i) => (i > deleteQuestionIndex ? i - 1 : i))
                        );
                        setDeleteQuestionIndex(null);
                    }
                }}
                title="Xác nhận xóa"
                message="Bạn có chắc chắn muốn xóa câu hỏi nhúng này không?"
                confirmText="Xóa"
                cancelText="Hủy"
                variant="danger"
            />
        </div>
    );
}
