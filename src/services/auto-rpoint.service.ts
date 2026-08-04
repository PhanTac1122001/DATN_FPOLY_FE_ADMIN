import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type { AutoRPointSeries } from "@/types/rpoint.types";

export async function finalizeClassRPoints(classId: string, courseId: string): Promise<any> {
    const response = await httpClient<any>(`/api/staff/auto-rpoint/class/${classId}/course/${courseId}/finalize`, {
        method: HttpMethod.POST,
    });
    return response?.data || response;
}

export async function unfinalizeClassRPoints(classId: string, courseId: string): Promise<any> {
    const response = await httpClient<any>(`/api/staff/auto-rpoint/class/${classId}/course/${courseId}/unfinalize`, {
        method: HttpMethod.POST,
    });
    return response?.data || response;
}

export async function finalizeStudentRPoint(studentId: string, courseId: string, classId?: string): Promise<any> {
    const query = classId ? `?classId=${classId}` : "";
    const response = await httpClient<any>(`/api/staff/auto-rpoint/finalize/${studentId}/${courseId}${query}`, {
        method: HttpMethod.POST,
    });
    return response?.data || response;
}

export async function unfinalizeStudentRPoint(studentId: string, courseId: string, classId?: string): Promise<any> {
    const query = classId ? `?classId=${classId}` : "";
    const response = await httpClient<any>(`/api/staff/auto-rpoint/unfinalize/${studentId}/${courseId}${query}`, {
        method: HttpMethod.POST,
    });
    return response?.data || response;
}

export async function getStudentRPointSeries(
    studentId: string,
    courseId: string,
    params?: { classId?: string; from?: string; to?: string; groupBy?: "day" | "week" | "month" },
): Promise<AutoRPointSeries[]> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const response = await httpClient<any>(`/api/staff/auto-rpoint/series/${studentId}/${courseId}?${query}`, {
        method: HttpMethod.GET,
    });
    return response?.data || response || [];
}

export async function addStudentViolation(data: {
    studentId: string;
    courseId: string;
    classId?: string;
    penaltyPoints?: number;
    description?: string;
}): Promise<any> {
    const response = await httpClient<any>("/api/staff/auto-rpoint/violations", {
        method: HttpMethod.POST,
        body: JSON.stringify(data),
    });
    return response?.data || response;
}

export async function addStudentLearningBonus(data: {
    studentId: string;
    courseId: string;
    classId?: string;
    bonusPoints: number;
    reason?: string;
}): Promise<any> {
    const response = await httpClient<any>("/api/staff/auto-rpoint/learning-bonus", {
        method: HttpMethod.POST,
        body: JSON.stringify(data),
    });
    return response?.data || response;
}

export async function recalculateStudentRPoint(studentId: string, courseId: string, classId?: string): Promise<any> {
    const query = classId ? `?classId=${classId}` : "";
    const response = await httpClient<any>(`/api/staff/auto-rpoint/recalculate/${studentId}/${courseId}${query}`, {
        method: HttpMethod.POST,
    });
    return response?.data || response;
}

export async function getStudentRPointDetail(studentId: string, courseId: string, classId?: string): Promise<any> {
    const query = classId ? `?classId=${classId}` : "";
    const response = await httpClient<any>(`/api/staff/auto-rpoint/${studentId}/${courseId}${query}`, {
        method: HttpMethod.GET,
    });
    return response?.data || response;
}
