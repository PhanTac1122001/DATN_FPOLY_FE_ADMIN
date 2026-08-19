import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type { AddExtraVideoPayload, CreateLearningResourcePayload, LearningResourceItem, UpdateLearningResourcePayload } from "@/types/learning-resource.types";

export type { LearningResourceItem, CreateLearningResourcePayload, UpdateLearningResourcePayload, AddExtraVideoPayload };

export async function getClassLearningResources(classId: string, params?: { courseId?: string; sessionId?: string }): Promise<LearningResourceItem[]> {
    try {
        const cleanParams: Record<string, string> = {};
        if (params?.courseId) {
            cleanParams.courseId = params.courseId;
        }
        if (params?.sessionId) {
            cleanParams.sessionId = params.sessionId;
        }
        const query = new URLSearchParams(cleanParams).toString();
        const response = await httpClient<any>(`/staff/classes/${classId}/resources${query ? `?${query}` : ""}`, {
            method: HttpMethod.GET,
        });
        return Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
    } catch (err) {
        console.error("Failed to load learning resources:", err);
        return [];
    }
}

export async function createLearningResource(classId: string, payload: CreateLearningResourcePayload): Promise<LearningResourceItem> {
    const response = await httpClient<any>(`/staff/classes/${classId}/resources`, {
        method: HttpMethod.POST,
        body: JSON.stringify(payload),
    });
    return response?.data || response;
}

export async function addExtraVideo(resourceId: string, payload: AddExtraVideoPayload): Promise<LearningResourceItem> {
    const response = await httpClient<any>(`/staff/resources/${resourceId}/extra-videos`, {
        method: HttpMethod.POST,
        body: JSON.stringify(payload),
    });
    return response?.data || response;
}

export async function updateLearningResource(id: string, payload: UpdateLearningResourcePayload): Promise<LearningResourceItem> {
    const response = await httpClient<any>(`/staff/resources/${id}`, {
        method: HttpMethod.PATCH,
        body: JSON.stringify(payload),
    });
    return response?.data || response;
}

export async function deleteLearningResource(id: string): Promise<{ success: boolean }> {
    const response = await httpClient<any>(`/staff/resources/${id}`, {
        method: HttpMethod.DELETE,
    });
    return response?.data || response || { success: true };
}
