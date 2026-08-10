import type React from "react";
import type { CoursewareBlockEntity } from "@/types/completion-rule.types";
import type { Lesson, Session } from "@/types/material.types";

export interface SessionTypeOption {
    id: string;
    label: string;
    code?: string;
    defaultBlocks?: Array<{
        type: string;
        title: string;
        isRequired: boolean;
        completionCriteria?: Record<string, unknown>;
    }>;
}

export interface SessionFields {
    name: string;
    type: string;
    typeId?: string;
    status: boolean;
    mindmap: string;
    srs: string;
    miniProject: string;
    pdf: string;
    exercise: string;
    quizzi: string;
    practiceEntranceQuiz: string;
    isShowMindmap: boolean;
    description: string;
}

export interface AddSessionModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    fields: SessionFields;
    setFields: React.Dispatch<React.SetStateAction<SessionFields>>;
    onSubmit: (e: React.FormEvent) => void;
    isPending: boolean;
}

export interface AddLessonModalProps {
    mode?: "create" | "edit";
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    sessionId: string;
    courseId?: string;
    sessionName: string;
    lessonName: string;
    setLessonName: (val: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onSelectPractice?: () => void;
    onSelectHomework?: () => void;
    isPending: boolean;
}

export interface SessionNodeProps {
    session: Session;
    index: number;
    selectedLessonId: string;
    selectedSessionId: string;
    selectedSessionTab: "mindmap" | "pdf" | "srs" | "miniProject" | "exercise" | "practiceEntranceQuiz" | "practice" | "homework";
    selectedTab: "video" | "reading" | "quiz";
    selectedPracticeId?: string;
    onSelectLesson: (id: string, tab: "video" | "reading" | "quiz") => void;
    onSelectSessionTab?: (
        sessionId: string,
        tab: "mindmap" | "pdf" | "srs" | "miniProject" | "exercise" | "practiceEntranceQuiz" | "practice" | "homework",
        practiceId?: string,
    ) => void;
    onSelectSession?: (
        id: string,
        tab: "mindmap" | "pdf" | "srs" | "miniProject" | "exercise" | "practiceEntranceQuiz" | "practice" | "homework",
        practiceId?: string,
    ) => void;
    onEditSession?: (session: Session) => void;
    onDeleteSession: (sessionId: string, name?: string) => void;
    onUpdateSessionName?: (sessionId: string, newName: string) => void;
    onOpenLessonCompletionRule?: (lesson: Lesson) => void;
    courseId?: string;
}

export interface LessonNodeProps {
    lesson: Lesson;
    selectedLessonId: string;
    selectedTab: "video" | "reading" | "quiz";
    onSelectLesson: (id: string, tab: "video" | "reading" | "quiz") => void;
    onDelete: () => void;
    onEdit?: () => void;
    onOpenCompletionRule?: (lesson: Lesson) => void;
    isDeletePending: boolean;
}

export enum SubmissionTypeEnum {
    LINK = "LINK",
    FILE = "FILE",
    TEXT = "TEXT",
}

export interface PracticeFormFieldsProps {
    practiceTitle?: string;
    setPracticeTitle?: (title: string) => void;
    submissionType: "LINK" | "FILE" | "TEXT";
    setSubmissionType: (type: "LINK" | "FILE" | "TEXT") => void;
    content: string;
    setContent: (content: string) => void;
    resources: { label: string; url: string }[];
    setResources: React.Dispatch<React.SetStateAction<{ label: string; url: string }[]>>;
    submitted?: boolean;
}

export enum QuestionTypeEnum {
    SINGLE_CHOICE = "SINGLE_CHOICE",
    MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
}

export interface VideoQuestionOption {
    content: string;
    isCorrect: boolean;
}

export interface VideoQuestion {
    content: string;
    type: string;
    timeInVideo: number;
    points: number;
    options: VideoQuestionOption[];
}

export interface VideoConfigTabProps {
    url: string;
    setUrl: (u: string) => void;
    duration: number;
    setDuration: (d: number) => void;
    file: File | null;
    setFile: (f: File | null) => void;
    questions: VideoQuestion[];
    setQuestions: (q: VideoQuestion[]) => void;
    onDelete?: () => void;
    onRegisterOpenModal?: (fn: () => void) => void;
    submitted?: boolean;
}

export interface SessionFormProps {
    mode: "create" | "edit";
    fields: SessionFields;
    setFields: React.Dispatch<React.SetStateAction<SessionFields>>;
    onSubmit: (e: React.FormEvent) => void;
    onDelete?: () => void;
    isPending: boolean;
    onRegisterSave?: (fn: () => void) => void;
    isDirty?: boolean;
    onOpenManageTypes?: () => void;
    onOpenCompletionRule?: () => void;
    /** Bump to reload session type options after manage-types changes */
    typesReloadToken?: number;
}

export interface SessionPracticeEditorProps {
    session: Session;
    selectedPracticeId?: string;
}

export interface QuizOptionItem {
    content: string;
    isCorrect: boolean;
}

export interface QuizQuestion {
    content: string;
    type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | QuestionTypeEnum;
    points: number;
    options: QuizOptionItem[];
}

export interface QuizConfigTabProps {
    quizId: string;
    setQuizId: (id: string) => void;
    quizzes: Record<string, unknown>[];
    onDelete?: () => void;
    onQuestionsDirtyChange?: (isDirty: boolean) => void;
    onRegisterSave?: (saveFn: () => Promise<unknown>) => void;
    onRegisterOpenModal?: (fn: () => void) => void;
}

export interface BlockTypeCatalogEntity {
    type: string;
    label: string;
    allowedScopes: ("LESSON" | "SESSION")[];
    payloadSchema: Record<string, unknown>;
    criteriaSchema: Record<string, unknown>;
    defaultCriteria?: Record<string, unknown>;
}

export interface AddLessonModalProps {
    mode?: "create" | "edit";
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    sessionId: string;
    courseId?: string;
    sessionName: string;
    lessonName: string;
    setLessonName: (val: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    onSelectPractice?: () => void;
    onSelectHomework?: () => void;
    isPending: boolean;
}

export interface SessionHomeworkEditorProps {
    session: Session;
}

export interface YTPlayer {
    getDuration(): number;
    destroy?: () => void;
}

export interface YTGlobal {
    Player: new (element: HTMLElement | null, config: unknown) => YTPlayer;
}

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

export interface PracticeFormModalProps {
    mode?: "create" | "edit";
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    sessionId: string;
    courseId?: string;
    sessionName?: string;
    initialData?: CoursewareBlockEntity | null;
    onSuccess?: () => void;
    onBack?: () => void;
}

export const NEW_PRACTICE_ID_FLAG = "NEW";
