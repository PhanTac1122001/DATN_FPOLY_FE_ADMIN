import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type { Course, Lesson, Quiz, Session } from "@/types/material.types";

export async function getCoursesBySystem(systemId: string): Promise<Course[]> {
    const res = await httpClient<any>(`/api/staff/courses/system/${systemId}`, { method: HttpMethod.GET });
    return res.data || res || [];
}

export async function getSessionsByCourse(courseId: string): Promise<Session[]> {
    const res = await httpClient<any>(`/api/staff/sessions/course/${courseId}`, { method: HttpMethod.GET });
    return res.data || res || [];
}

export async function createSession(body: Omit<Session, "id" | "createdAt" | "position"> & { position?: number }): Promise<Session> {
    const res = await httpClient<any>("/api/staff/sessions", {
        method: HttpMethod.POST,
        body: JSON.stringify(body),
    });
    return res.data || res;
}

export async function getLessonsBySession(sessionId: string): Promise<Lesson[]> {
    const res = await httpClient<any>(`/api/staff/lessons/session/${sessionId}`, { method: HttpMethod.GET });
    return res.data || res || [];
}

export async function createLesson(body: { name: string; sessionId: string }): Promise<Lesson> {
    const res = await httpClient<any>("/api/staff/lessons", {
        method: HttpMethod.POST,
        body: JSON.stringify(body),
    });
    return res.data || res;
}

export async function configureLessonVideo(lessonId: string, formData: FormData): Promise<Lesson> {
    const res = await httpClient<any>(`/api/staff/lessons/${lessonId}/video`, {
        method: HttpMethod.POST,
        body: formData,
    });
    return res.data || res;
}

export async function configureLessonReading(lessonId: string, formData: FormData): Promise<Lesson> {
    const res = await httpClient<any>(`/api/staff/lessons/${lessonId}/reading`, {
        method: HttpMethod.POST,
        body: formData,
    });
    return res.data || res;
}

export async function linkLessonQuiz(lessonId: string, quizId: string): Promise<Lesson> {
    const res = await httpClient<any>(`/api/staff/lessons/${lessonId}/quiz`, {
        method: HttpMethod.PUT,
        body: JSON.stringify({ quizId }),
    });
    return res.data || res;
}

export async function getQuizzesList(): Promise<Quiz[]> {
    const res = await httpClient<any>("/api/staff/quizzes", { method: HttpMethod.GET });
    return res.data || res || [];
}

export async function getLessonDetails(id: string): Promise<Lesson> {
    const res = await httpClient<any>(`/api/staff/lessons/${id}`, { method: HttpMethod.GET });
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
    const res = await httpClient<any>("/api/staff/course-classes", {
        method: HttpMethod.POST,
        body: JSON.stringify(body),
    });
    return res.data || res;
}

export async function getCourseClassesByClass(classId: string): Promise<any[]> {
    const res = await httpClient<any>(`/api/staff/course-classes/class/${classId}`, { method: HttpMethod.GET });
    return res.data || res || [];
}

export async function updateCourseClass(id: string, body: Partial<{ teacherId: string; status: string; endDate: string }>): Promise<any> {
    const res = await httpClient<any>(`/api/staff/course-classes/${id}`, {
        method: HttpMethod.PUT,
        body: JSON.stringify(body),
    });
    return res.data || res;
}

export async function deleteCourseClass(id: string): Promise<void> {
    await httpClient<any>(`/api/staff/course-classes/${id}`, { method: HttpMethod.DELETE });
}

export async function deleteSession(id: string): Promise<void> {
    await httpClient<any>(`/api/staff/sessions/${id}`, { method: HttpMethod.DELETE });
}

export async function deleteLesson(id: string): Promise<void> {
    await httpClient<any>(`/api/staff/lessons/${id}`, { method: HttpMethod.DELETE });
}

export async function updateSession(id: string, body: Partial<Omit<Session, "id" | "createdAt">>): Promise<Session> {
    const res = await httpClient<any>(`/api/staff/sessions/${id}`, {
        method: HttpMethod.PUT,
        body: JSON.stringify(body),
    });
    return res.data || res;
}

export async function updateLesson(id: string, body: Partial<{ name: string; position: number }>): Promise<Lesson> {
    const res = await httpClient<any>(`/api/staff/lessons/${id}`, {
        method: HttpMethod.PUT,
        body: JSON.stringify(body),
    });
    return res.data || res;
}
