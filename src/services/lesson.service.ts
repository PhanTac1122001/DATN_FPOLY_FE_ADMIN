import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type { Lesson } from "@/types/material.types";

export async function getLessonsBySession(sessionId: string): Promise<Lesson[]> {
    const res = await httpClient<any>(`/staff/lessons/session/${sessionId}`, { method: HttpMethod.GET });
    return res.data || res || [];
}

export async function createLesson(body: { name: string; sessionId: string; courseId: string; position?: number }): Promise<Lesson> {
    if (!body.courseId) {
        throw new Error("courseId is required when creating a lesson");
    }
    const res = await httpClient<any>("/staff/lessons", {
        method: HttpMethod.POST,
        body: JSON.stringify(body),
    });
    return res.data || res;
}

export async function getLessonDetails(id: string): Promise<Lesson> {
    const res = await httpClient<any>(`/staff/lessons/${id}`, { method: HttpMethod.GET });
    return res.data || res;
}

export async function updateLesson(
    id: string,
    body: Partial<{ name: string; position: number; sequentialBlocks: boolean; video: unknown; reading: unknown; quiz: unknown; quizId: string }>,
): Promise<Lesson> {
    const res = await httpClient<any>(`/staff/lessons/${id}`, {
        method: HttpMethod.PUT,
        body: JSON.stringify(body),
    });
    return res.data || res;
}

export async function deleteLesson(id: string): Promise<void> {
    await httpClient<any>(`/staff/lessons/${id}`, { method: HttpMethod.DELETE });
}

export async function configureLessonVideo(lessonId: string, formData: FormData): Promise<Lesson> {
    const res = await httpClient<any>(`/staff/lessons/${lessonId}/video`, {
        method: HttpMethod.POST,
        body: formData,
    });
    return res.data || res;
}

export async function deleteLessonVideo(lessonId: string): Promise<Lesson> {
    const res = await httpClient<any>(`/staff/lessons/${lessonId}/video`, {
        method: HttpMethod.DELETE,
    });
    return res.data || res;
}

export async function configureLessonReading(lessonId: string, formData: FormData): Promise<Lesson> {
    const res = await httpClient<any>(`/staff/lessons/${lessonId}/reading`, {
        method: HttpMethod.POST,
        body: formData,
    });
    return res.data || res;
}

export async function configureLessonReadingHtml(lessonId: string, formData: FormData): Promise<Lesson> {
    const res = await httpClient<any>(`/staff/lessons/${lessonId}/reading-html`, {
        method: HttpMethod.POST,
        body: formData,
    });
    return res.data || res;
}

export async function deleteLessonReading(lessonId: string): Promise<Lesson> {
    const res = await httpClient<any>(`/staff/lessons/${lessonId}/reading`, {
        method: HttpMethod.DELETE,
    });
    try {
        await httpClient<any>(`/staff/lessons/${lessonId}`, {
            method: HttpMethod.PUT,
            body: JSON.stringify({ pdf: "" }),
        });
    } catch (e) {
        console.error("Failed to clear root pdf field", e);
    }
    return res.data || res;
}

export async function linkLessonQuiz(lessonId: string, quizId: string): Promise<Lesson> {
    const res = await httpClient<any>(`/staff/lessons/${lessonId}/quiz`, {
        method: HttpMethod.PUT,
        body: JSON.stringify({ quizId }),
    });
    return res.data || res;
}

export const lessonService = {
    getLessonsBySession,
    createLesson,
    getLessonDetails,
    updateLesson,
    deleteLesson,
    configureLessonVideo,
    deleteLessonVideo,
    configureLessonReading,
    configureLessonReadingHtml,
    deleteLessonReading,
    linkLessonQuiz,
};
