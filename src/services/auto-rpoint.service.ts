import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type { AutoRPointSeries, RpointFormula, RpointPreviewInputs, RpointPreviewResult } from "@/types/rpoint.types";

export async function getCourseRpointFormula(courseId: string): Promise<{ formula: RpointFormula; isDefault: boolean }> {
    const response = await httpClient<any>(`/api/auto-rpoint/course/${courseId}/rpoint-formula`, {
        method: HttpMethod.GET,
    });
    return response?.data || response;
}

export async function getDefaultRpointFormula(): Promise<RpointFormula> {
    const response = await httpClient<any>("/api/auto-rpoint/rpoint-formula/default", {
        method: HttpMethod.GET,
    });
    return response?.data || response;
}

export async function previewRpointFormula(payload: {
    formula: RpointFormula;
    inputs: RpointPreviewInputs;
}): Promise<RpointPreviewResult> {
    const response = await httpClient<any>("/api/auto-rpoint/rpoint-formula/preview", {
        method: HttpMethod.POST,
        body: JSON.stringify(payload),
    });
    return response?.data || response;
}

export async function setCourseRpointFormula(courseId: string, formula: RpointFormula): Promise<any> {
    const response = await httpClient<any>(`/api/auto-rpoint/course/${courseId}/rpoint-formula`, {
        method: HttpMethod.PUT,
        body: JSON.stringify(formula),
    });
    return response?.data || response;
}

export async function deleteCourseRpointFormula(courseId: string): Promise<any> {
    const response = await httpClient<any>(`/api/auto-rpoint/course/${courseId}/rpoint-formula`, {
        method: HttpMethod.DELETE,
    });
    return response?.data || response;
}

export async function setStudentManualBonus(studentId: string, courseId: string, manualBonus: number): Promise<any> {
    const response = await httpClient<any>(`/api/auto-rpoint/manual-bonus/${studentId}/${courseId}`, {
        method: HttpMethod.PUT,
        body: JSON.stringify({ manualBonus }),
    });
    return response?.data || response;
}

export async function finalizeClassRPoints(classId: string, courseId: string): Promise<any> {
    const response = await httpClient<any>(`/api/auto-rpoint/class/${classId}/course/${courseId}/finalize`, {
        method: HttpMethod.POST,
    });
    return response?.data || response;
}

export async function unfinalizeClassRPoints(classId: string, courseId: string): Promise<any> {
    const response = await httpClient<any>(`/api/auto-rpoint/class/${classId}/course/${courseId}/unfinalize`, {
        method: HttpMethod.POST,
    });
    return response?.data || response;
}

export async function finalizeStudentRPoint(studentId: string, courseId: string, classId?: string): Promise<any> {
    const query = classId ? `?classId=${classId}` : "";
    const response = await httpClient<any>(`/api/auto-rpoint/finalize/${studentId}/${courseId}${query}`, {
        method: HttpMethod.POST,
    });
    return response?.data || response;
}

export async function unfinalizeStudentRPoint(studentId: string, courseId: string, classId?: string): Promise<any> {
    const query = classId ? `?classId=${classId}` : "";
    const response = await httpClient<any>(`/api/auto-rpoint/unfinalize/${studentId}/${courseId}${query}`, {
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
    const response = await httpClient<any>(`/api/auto-rpoint/series/${studentId}/${courseId}?${query}`, {
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
    const response = await httpClient<any>("/api/auto-rpoint/violations", {
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
    const response = await httpClient<any>("/api/auto-rpoint/learning-bonus", {
        method: HttpMethod.POST,
        body: JSON.stringify(data),
    });
    return response?.data || response;
}

export async function recalculateStudentRPoint(studentId: string, courseId: string, classId?: string): Promise<any> {
    const query = classId ? `?classId=${classId}` : "";
    const response = await httpClient<any>(`/api/auto-rpoint/recalculate/${studentId}/${courseId}${query}`, {
        method: HttpMethod.POST,
    });
    return response?.data || response;
}

export async function getStudentRPointDetail(studentId: string, courseId: string, classId?: string): Promise<any> {
    const query = classId ? `?classId=${classId}` : "";
    const response = await httpClient<any>(`/api/auto-rpoint/${studentId}/${courseId}${query}`, {
        method: HttpMethod.GET,
    });
    return response?.data || response;
}
