import { API_PREFIX } from "@/constants/api-endpoints.constants";
import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type {
    ActiveQuizSessionParams,
    ActiveQuizSessionResponse,
    StartQuizSessionPayload,
    StopQuizSessionPayload,
    StudentQuizResultItem,
} from "@/types/session-quiz.types";

export type { ActiveQuizSessionParams, ActiveQuizSessionResponse, StartQuizSessionPayload, StopQuizSessionPayload, StudentQuizResultItem };

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
