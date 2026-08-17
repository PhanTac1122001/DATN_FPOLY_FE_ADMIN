import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type { HomeworkCompletionItem, HomeworkSubmissionItem } from "@/types/homework.types";

export type { HomeworkCompletionItem, HomeworkSubmissionItem };

export async function getCompletionsBySession(sessionId: string, classId?: string): Promise<HomeworkCompletionItem[]> {
    const url = classId ? `/homework/completion/session/${sessionId}?classId=${classId}` : `/homework/completion/session/${sessionId}`;
    const res = await httpClient<any>(url, { method: HttpMethod.GET });
    return res.data || res || [];
}

export async function getCompletionDetail(id: string): Promise<HomeworkCompletionItem> {
    const res = await httpClient<any>(`/homework/completion/${id}`, { method: HttpMethod.GET });
    return res.data || res;
}

export async function getCompletionSubmissions(id: string): Promise<HomeworkSubmissionItem[]> {
    const res = await httpClient<any>(`/homework/completion/${id}/submissions`, { method: HttpMethod.GET });
    return res.data || res || [];
}

export async function gradeCompletion(id: string, data: { status: "COMPLETED" | "NOT_COMPLETED"; teacherNote?: string }): Promise<HomeworkCompletionItem> {
    const res = await httpClient<any>(`/homework/completion/${id}/grade`, {
        method: HttpMethod.PATCH,
        body: JSON.stringify(data),
    });
    return res.data || res;
}

export async function approveCompletionFeedback(id: string): Promise<HomeworkCompletionItem> {
    const res = await httpClient<any>(`/homework/completion/${id}/approve-feedback`, {
        method: HttpMethod.PATCH,
    });
    return res.data || res;
}

export async function getSessionsByCourseId(
    courseId: string,
): Promise<Array<{ id: string; name: string; position?: number; maxAiGradeAttempts?: number | null }>> {
    const res = await httpClient<any>(`/staff/sessions/course/${courseId}`, {
        method: HttpMethod.GET,
    });
    return res.data || res || [];
}
