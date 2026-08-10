import { API_PREFIX } from "@/constants/api-endpoints.constants";
import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";

export interface StartQuizSessionPayload {
    classId: string;
    educationProgramId: string;
    subjectId: string;
    sessionId: string;
    quizId: string;
}

export interface StopQuizSessionPayload {
    classId: string;
    quizSessionId: string;
}

export interface ActiveQuizSessionParams {
    classId: string;
    subjectId?: string;
    sessionId?: string;
    quizId?: string;
}

export interface StudentQuizResultItem {
    id?: string;
    _id?: string;
    quizSessionId: string;
    classId: string;
    quizId: string;
    studentId: string;
    studentCode: string;
    studentName: string;
    dateOfBirth?: string;
    score: number;
    correctAnswersCount: number;
    totalQuestionsCount: number;
    status: "DOING" | "SUBMITTED";
    submittedAt?: string;
}

export interface ActiveQuizSessionResponse {
    session: {
        id?: string;
        _id?: string;
        classId: string;
        educationProgramId: string;
        subjectId: string;
        sessionId: string;
        quizId: string;
        status: "IDLE" | "ACTIVE" | "CLOSED";
        startedAt?: string;
        stoppedAt?: string;
    } | null;
    results: StudentQuizResultItem[];
}

export async function startQuizSession(payload: StartQuizSessionPayload) {
    const res = await httpClient<any>(`${API_PREFIX}/staff/class-quiz-sessions/start`, {
        method: HttpMethod.POST,
        body: JSON.stringify(payload),
    });
    return res?.data || res;
}

export async function stopQuizSession(payload: StopQuizSessionPayload) {
    const res = await httpClient<any>(`${API_PREFIX}/staff/class-quiz-sessions/stop`, {
        method: HttpMethod.POST,
        body: JSON.stringify(payload),
    });
    return res?.data || res;
}

export async function getActiveQuizSession(params: ActiveQuizSessionParams): Promise<ActiveQuizSessionResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set("classId", params.classId);
    if (params.subjectId) searchParams.set("subjectId", params.subjectId);
    if (params.sessionId) searchParams.set("sessionId", params.sessionId);
    if (params.quizId) searchParams.set("quizId", params.quizId);

    const res = await httpClient<any>(`${API_PREFIX}/staff/class-quiz-sessions/active?${searchParams.toString()}`, {
        method: HttpMethod.GET,
    });
    const data = res?.data || res || {};
    return {
        session: data.session || null,
        results: data.results || [],
    };
}
