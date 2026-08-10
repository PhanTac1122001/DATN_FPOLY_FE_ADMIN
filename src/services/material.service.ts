import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type { Course, Quiz, Session } from "@/types/material.types";

export * from "./lesson.service";

export async function getCoursesBySystem(systemId: string): Promise<Course[]> {
    const res = await httpClient<any>(`/staff/courses/system/${systemId}`, { method: HttpMethod.GET });
    return res.data || res || [];
}

export async function getSessionsByCourse(courseId: string): Promise<Session[]> {
    const res = await httpClient<any>(`/staff/sessions/course/${courseId}`, { method: HttpMethod.GET });
    return res.data || res || [];
}

export async function getSessionById(sessionId: string): Promise<Session> {
    const res = await httpClient<any>(`/staff/sessions/${sessionId}`, { method: HttpMethod.GET });
    return res.data || res;
}

export async function createSession(body: Omit<Session, "id" | "createdAt" | "position"> & { position?: number; typeId?: string }): Promise<Session> {
    const { type, typeId, ...rest } = body as Session & { position?: number; typeId?: string };
    // Chỉ gửi typeId (hoặc type legacy). Gửi cả hai → 400.
    const payload: Record<string, unknown> = { ...rest };
    if (typeId) {
        payload.typeId = typeId;
    } else if (type) {
        payload.type = type;
    }

    const res = await httpClient<any>("/staff/sessions", {
        method: HttpMethod.POST,
        body: JSON.stringify(payload),
    });
    return res.data || res;
}

export async function updateSessionPractice(sessionId: string, body: any): Promise<Session> {
    const res = await httpClient<any>(`/staff/sessions/${sessionId}/practice`, {
        method: HttpMethod.PUT,
        body: JSON.stringify(body),
    });
    return res.data || res;
}

export async function deleteSessionPractice(sessionId: string): Promise<Session> {
    const res = await httpClient<any>(`/staff/sessions/${sessionId}/practice`, {
        method: HttpMethod.DELETE,
    });
    return res.data || res;
}

export async function addSessionPractice(sessionId: string, body: any): Promise<Session> {
    const res = await httpClient<any>(`/staff/sessions/${sessionId}/practices`, {
        method: HttpMethod.POST,
        body: JSON.stringify(body),
    });
    return res.data || res;
}

export async function updateSessionPracticeById(sessionId: string, practiceId: string, body: any): Promise<Session> {
    const res = await httpClient<any>(`/staff/sessions/${sessionId}/practices/${practiceId}`, {
        method: HttpMethod.PUT,
        body: JSON.stringify(body),
    });
    return res.data || res;
}

export async function deleteSessionPracticeById(sessionId: string, practiceId: string): Promise<Session> {
    const res = await httpClient<any>(`/staff/sessions/${sessionId}/practices/${practiceId}`, {
        method: HttpMethod.DELETE,
    });
    return res.data || res;
}

export async function getQuizzesList(): Promise<Quiz[]> {
    const res = await httpClient<any>("/staff/quizzes", { method: HttpMethod.GET });
    return res.data || res || [];
}

export async function getQuizDetails(id: string): Promise<Quiz> {
    const res = await httpClient<any>(`/staff/quizzes/${id}`, { method: HttpMethod.GET });
    return res.data || res;
}

export async function updateQuiz(
    id: string,
    body: { title?: string; description?: string; passThreshold?: number; courseId?: string; questions?: any[] },
): Promise<Quiz> {
    const res = await httpClient<any>(`/staff/quizzes/${id}`, {
        method: HttpMethod.PUT,
        body: JSON.stringify(body),
    });
    return res.data || res;
}

export async function mapCourseClass(body: {
    classId: string;
    courseId: string;
    teacherId: string;
    taId?: string;
    status: string;
    startDate?: string;
    endDate?: string;
}): Promise<any> {
    const res = await httpClient<any>("/staff/course-classes", {
        method: HttpMethod.POST,
        body: JSON.stringify(body),
    });
    return res.data || res;
}

export async function getCourseClassesByClass(classId: string): Promise<any[]> {
    const res = await httpClient<any>(`/staff/course-classes/class/${classId}`, { method: HttpMethod.GET });
    return res.data || res || [];
}

export async function updateCourseClass(id: string, body: Partial<{ teacherId: string; status: string; endDate: string }>): Promise<any> {
    const res = await httpClient<any>(`/staff/course-classes/${id}`, {
        method: HttpMethod.PUT,
        body: JSON.stringify(body),
    });
    return res.data || res;
}

export async function deleteCourseClass(id: string): Promise<void> {
    await httpClient<any>(`/staff/course-classes/${id}`, { method: HttpMethod.DELETE });
}

export async function deleteSession(id: string): Promise<void> {
    await httpClient<any>(`/staff/sessions/${id}`, { method: HttpMethod.DELETE });
}

export async function updateSession(id: string, body: Partial<Omit<Session, "id" | "createdAt">> & { typeId?: string }): Promise<Session> {
    const { type, typeId, ...rest } = body as Partial<Session> & { typeId?: string };
    const payload: Record<string, unknown> = { ...rest };
    if (typeId) {
        payload.typeId = typeId;
    } else if (type !== undefined && typeId === undefined) {
        // Chỉ gửi type khi không có typeId (buổi legacy).
        payload.type = type;
    }

    const res = await httpClient<any>(`/staff/sessions/${id}`, {
        method: HttpMethod.PUT,
        body: JSON.stringify(payload),
    });
    return res.data || res;
}
