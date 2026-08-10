import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type { CompletionRule } from "@/types/completion-rule.types";

function unwrapData<T>(response: unknown): T {
    const res = response as { data?: T } | T;
    if (res && typeof res === "object" && "data" in res && (res as { data?: T }).data !== undefined) {
        return (res as { data: T }).data;
    }
    return res as T;
}

export const completionRuleService = {
    getSessionRule: async (sessionId: string): Promise<CompletionRule> => {
        const response = await httpClient<unknown>(`/staff/sessions/${sessionId}/completion-rule`, {
            method: HttpMethod.GET,
        });
        return unwrapData<CompletionRule>(response);
    },

    setSessionRule: async (sessionId: string, rule: CompletionRule): Promise<CompletionRule> => {
        const response = await httpClient<unknown>(`/staff/sessions/${sessionId}/completion-rule`, {
            method: HttpMethod.PUT,
            body: JSON.stringify(rule),
        });
        return unwrapData<CompletionRule>(response);
    },

    getLessonRule: async (lessonId: string): Promise<CompletionRule> => {
        const response = await httpClient<unknown>(`/staff/lessons/${lessonId}/completion-rule`, {
            method: HttpMethod.GET,
        });
        return unwrapData<CompletionRule>(response);
    },

    setLessonRule: async (lessonId: string, rule: CompletionRule): Promise<CompletionRule> => {
        const response = await httpClient<unknown>(`/staff/lessons/${lessonId}/completion-rule`, {
            method: HttpMethod.PUT,
            body: JSON.stringify(rule),
        });
        return unwrapData<CompletionRule>(response);
    },
};
