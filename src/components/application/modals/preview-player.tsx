"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, CheckCircle, HelpCircle, Pause, Play, Video } from "lucide-react";
import { UI_TEXT } from "@/constants/ui-text.constants";
import type { EmbeddedQuestion, Lesson, ReadingMaterial, VideoMaterial } from "@/types/material.types";

const defaultVideoDurationSeconds = 120;
const oneSecondMs = 1000;
const feedbackTimeoutMs = 2000;
const percentageMultiplier = 100;

export function PreviewPlayer({ lesson }: { lesson: Lesson }) {
    const [currentTab, setCurrentTab] = useState<"video" | "reading" | "quiz">("video");

    useEffect(() => {
        if (lesson.videoUrl || (lesson.video && lesson.video.url)) {
            setCurrentTab("video");
        } else if (lesson.pdf || (lesson.reading && (lesson.reading.content || lesson.reading.pdf))) {
            setCurrentTab("reading");
        } else if (lesson.quizId) {
            setCurrentTab("quiz");
        }
    }, [lesson]);

    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50/20 p-4">
            {/* Sub-tabs for content components */}
            <div className="flex border-b border-slate-100">
                <button
                    onClick={() => setCurrentTab("video")}
                    className={`flex items-center gap-1.5 border-b-2 px-3 py-1.5 text-xs font-bold transition ${
                        currentTab === "video" ? "border-wine text-wine" : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                >
                    <Video className="size-3.5" /> {UI_TEXT.previewPlayerModal.tabVideo}
                </button>
                <button
                    onClick={() => setCurrentTab("reading")}
                    className={`flex items-center gap-1.5 border-b-2 px-3 py-1.5 text-xs font-bold transition ${
                        currentTab === "reading" ? "border-wine text-wine" : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                >
                    <BookOpen className="size-3.5" /> {UI_TEXT.previewPlayerModal.tabArticle}
                </button>
                {lesson.quizId && (
                    <button
                        onClick={() => setCurrentTab("quiz")}
                        className={`flex items-center gap-1.5 border-b-2 px-3 py-1.5 text-xs font-bold transition ${
                            currentTab === "quiz" ? "border-wine text-wine" : "border-transparent text-slate-400 hover:text-slate-600"
                        }`}
                    >
                        <HelpCircle className="size-3.5" /> {UI_TEXT.previewPlayerModal.tabQuiz}
                    </button>
                )}
            </div>

            <div className="flex min-h-[300px] flex-col justify-between overflow-hidden rounded-xl border border-slate-100 bg-white shadow-inner">
                {currentTab === "video" && <VideoPlayerPreview video={lesson.video} />}
                {currentTab === "reading" && <ReadingPreview reading={lesson.reading} />}
                {currentTab === "quiz" && <QuizPreview quizId={lesson.quizId} />}
            </div>
        </div>
    );
}

function VideoPlayerPreview({ video }: { video?: VideoMaterial | null }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [lockQuestion, setLockQuestion] = useState<EmbeddedQuestion | null>(null);
    const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const duration = video?.durationTime || defaultVideoDurationSeconds;
    const rawQuestions = video?.questions;
    const questions = useMemo(() => rawQuestions || [], [rawQuestions]);

    useEffect(() => {
        if (isPlaying) {
            intervalRef.current = setInterval(() => {
                setCurrentTime((prev) => {
                    const next = prev + 1;
                    // Check for question locks
                    const triggerQuestion = questions.find((q) => q.timeInVideo === next);
                    if (triggerQuestion) {
                        setIsPlaying(false);
                        setLockQuestion(triggerQuestion);
                        setSelectedAnswerIdx(null);
                        setFeedback(null);
                        if (intervalRef.current) clearInterval(intervalRef.current);
                    }
                    if (next >= duration) {
                        setIsPlaying(false);
                        if (intervalRef.current) clearInterval(intervalRef.current);
                        return duration;
                    }
                    return next;
                });
            }, oneSecondMs);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isPlaying, duration, questions]);

    const handleCheckAnswer = () => {
        if (selectedAnswerIdx === null || !lockQuestion) return;
        const opts = lockQuestion.options || [];
        const opt = opts[selectedAnswerIdx];
        if (opt?.isCorrect) {
            setFeedback(UI_TEXT.previewPlayerModal.correctMsg);
            setTimeout(() => {
                setLockQuestion(null);
                setIsPlaying(true);
            }, feedbackTimeoutMs);
        } else {
            setFeedback(UI_TEXT.previewPlayerModal.incorrectMsg);
        }
    };

    return (
        <div className="relative flex flex-1 flex-col justify-between bg-slate-950 p-4 text-white">
            <div className="relative flex min-h-[220px] flex-1 items-center justify-center">
                {lockQuestion ? (
                    <div className="z-10 flex w-full max-w-sm flex-col rounded-xl border border-amber-500/30 bg-slate-900/90 p-4 shadow-2xl backdrop-blur-md">
                        <span className="flex items-center gap-1 text-[10px] font-extrabold text-amber-400 uppercase">
                            <HelpCircle className="size-3 text-amber-400" />
                            {UI_TEXT.previewPlayerModal.gateTitle}
                        </span>
                        <h4 className="mt-1.5 text-xs font-bold text-white">{lockQuestion.content}</h4>
                        <div className="mt-3 flex flex-col gap-1.5">
                            {(lockQuestion.options || []).map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedAnswerIdx(i)}
                                    className={`w-full cursor-pointer rounded border p-2 text-left text-[10px] transition ${
                                        selectedAnswerIdx === i
                                            ? "border-amber-400 bg-amber-500/10 font-bold text-white"
                                            : "border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
                                    }`}
                                >
                                    {opt.content}
                                </button>
                            ))}
                        </div>
                        {feedback && (
                            <p
                                className={`mt-2 text-[10px] font-semibold ${feedback === UI_TEXT.previewPlayerModal.correctMsg ? "text-green-400" : "text-red-400"}`}
                            >
                                {feedback}
                            </p>
                        )}
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleCheckAnswer}
                                className="cursor-pointer rounded bg-amber-500 px-4 py-1.5 text-[10px] font-bold text-slate-950 hover:bg-amber-600"
                            >
                                {UI_TEXT.previewPlayerModal.checkAnswerBtn}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <div
                            className="flex size-12 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-white/5 hover:bg-white/10"
                            onClick={() => setIsPlaying(!isPlaying)}
                        >
                            {isPlaying ? <Pause className="size-6 text-white" /> : <Play className="size-6 translate-x-0.5 text-white" />}
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400">
                            {isPlaying ? UI_TEXT.previewPlayerModal.playingPreview : UI_TEXT.previewPlayerModal.paused}
                        </span>
                    </div>
                )}
            </div>

            <div className="mt-3 flex shrink-0 items-center gap-3 border-t border-white/10 pt-2">
                <button onClick={() => setIsPlaying(!isPlaying)} className="cursor-pointer rounded p-1 hover:bg-white/10">
                    {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
                </button>
                <span className="font-mono text-[10px] text-slate-300">
                    {currentTime}
                    {UI_TEXT.previewPlayerModal.timePrefix}
                    {duration}
                    {UI_TEXT.previewPlayerModal.timeSuffix}
                </span>
                <div className="relative h-1 flex-1 overflow-hidden rounded bg-slate-800">
                    <div className="h-full bg-wine" style={{ width: `${(currentTime / duration) * percentageMultiplier}%` }} />
                    {questions.map((q, i) => (
                        <div
                            key={i}
                            className="absolute top-0 h-full w-1 bg-amber-500"
                            style={{ left: `${((q.timeInVideo || 0) / duration) * percentageMultiplier}%` }}
                            title={`${UI_TEXT.previewPlayerModal.questionAt} ${q.timeInVideo}${UI_TEXT.previewPlayerModal.timeSuffix}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function ReadingPreview({ reading }: { reading?: ReadingMaterial | null }) {
    return (
        <div className="custom-scrollbar flex max-h-[350px] flex-1 flex-col gap-4 overflow-y-auto p-5 text-slate-800">
            <div className="prose prose-sm max-w-none border-b border-slate-100 pb-3 text-xs">
                <div className="mb-1 flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                    <CheckCircle className="size-3 text-green-500" />
                    {UI_TEXT.previewPlayerModal.theoryTitle}
                </div>
                <div className="leading-relaxed whitespace-pre-wrap">{reading?.content || UI_TEXT.previewPlayerModal.noReadingContentText}</div>
            </div>

            {Array.isArray(reading?.questions) && reading.questions.length > 0 && (
                <div className="flex flex-col gap-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{UI_TEXT.previewPlayerModal.articleQuestionTitle}</span>
                    {reading.questions.map((q, i) => (
                        <div key={i} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                            <h5 className="text-xs font-bold text-slate-800">{q.content}</h5>
                            <div className="mt-2 flex flex-col gap-1.5">
                                {(q.options || []).map((opt, oIdx) => (
                                    <label key={oIdx} className="flex items-center gap-2 text-[10px] text-slate-600">
                                        <input type="radio" name={`r-q-${i}`} />
                                        <span>{opt.content}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function QuizPreview({ quizId }: { quizId: string | null | undefined }) {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <span className="rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                {UI_TEXT.previewPlayerModal.quizLinkedTitle} {quizId}
            </span>
            <h4 className="text-sm font-black text-slate-800">{UI_TEXT.previewPlayerModal.quizDescription}</h4>
            <p className="max-w-xs text-xs text-slate-500">{UI_TEXT.previewPlayerModal.quizRedirectNotice}</p>
            <button className="mt-2 cursor-pointer rounded-xl border-none bg-wine px-4 py-2 text-xs font-bold text-white shadow-md shadow-wine/10 hover:bg-wine-deep">
                {UI_TEXT.previewPlayerModal.startQuizBtn}
            </button>
        </div>
    );
}
