export interface EmbeddedOption {
    content: string;
    isCorrect: boolean;
}

export interface EmbeddedQuestion {
    _id?: string;
    content: string;
    type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE";
    timeInVideo?: number; // seconds
    points: number;
    options: EmbeddedOption[];
}

export interface VideoMaterial {
    url: string;
    durationTime: number;
    questions: EmbeddedQuestion[];
}

export interface ReadingMaterial {
    content: string;
    pdf?: string;
    questions: EmbeddedQuestion[];
}

export interface Lesson {
    id: string;
    name: string;
    sessionId: string;
    status: boolean;
    position?: number;
    videoUrl?: string;
    pdf?: string;
    video?: VideoMaterial | null;
    reading?: ReadingMaterial | null;
    quizId?: string | null;
}

export interface SessionPracticeResource {
    label?: string;
    url: string;
}

export interface SessionPractice {
    content: string;
    resources?: SessionPracticeResource[];
    submissionType: "LINK" | "FILE" | "TEXT";
}

export interface Session {
    id: string;
    name: string;
    courseId: string;
    position: number;
    createdAt: string;
    mindmap?: string;
    srs?: string;
    pdf?: string;
    status?: boolean;
    type?: string;
    miniProject?: string;
    exercise?: string;
    quizzi?: string;
    practiceEntranceQuiz?: string;
    isShowMindmap?: boolean;
    description?: string;
    practice?: SessionPractice | null;
}

export interface Course {
    id: string;
    name: string;
    courseCode: string;
    position: number;
    hour: number;
    courseCover?: string;
    description?: string;
    isVisible: boolean;
}

export interface Quiz {
    id: string;
    title: string;
    createdAt: string;
}
