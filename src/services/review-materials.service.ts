import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type { GetReviewMaterialsQuery, ReviewHomeworkListResponse, ReviewLessonListResponse } from "@/types/review-materials.types";

function unwrap<T>(response: unknown): T {
    if (response && typeof response === "object" && "data" in response) {
        return ((response as { data: T }).data ?? response) as T;
    }
    return response as T;
}

export const reviewMaterialsService = {
    getLessons: async (query: GetReviewMaterialsQuery): Promise<ReviewLessonListResponse> => {
        const params = new URLSearchParams();
        params.set("sessionId", query.sessionId);
        if (query.status !== undefined) params.set("status", String(query.status));
        if (query.search) params.set("search", query.search);

        const response = await httpClient<any>(`/staff/review-materials/lessons?${params.toString()}`, {
            method: HttpMethod.GET,
        });
        return unwrap<ReviewLessonListResponse>(response);
    },

    getHomework: async (query: GetReviewMaterialsQuery): Promise<ReviewHomeworkListResponse> => {
        const params = new URLSearchParams();
        params.set("sessionId", query.sessionId);
        if (query.status !== undefined) params.set("status", String(query.status));
        if (query.search) params.set("search", query.search);

        const response = await httpClient<any>(`/staff/review-materials/homework?${params.toString()}`, {
            method: HttpMethod.GET,
        });
        return unwrap<ReviewHomeworkListResponse>(response);
    },

    approveLesson: async (id: string): Promise<any> => {
        const response = await httpClient<any>(`/staff/review-materials/lessons/${id}/approve`, {
            method: HttpMethod.PATCH,
        });
        return unwrap(response);
    },

    rejectLesson: async (id: string): Promise<any> => {
        const response = await httpClient<any>(`/staff/review-materials/lessons/${id}/reject`, {
            method: HttpMethod.PATCH,
        });
        return unwrap(response);
    },

    bulkApproveLessons: async (ids: string[]): Promise<{ updated: number }> => {
        const response = await httpClient<any>("/staff/review-materials/lessons/bulk/approve", {
            method: HttpMethod.PATCH,
            body: JSON.stringify({ ids }),
        });
        return unwrap(response);
    },

    bulkRejectLessons: async (ids: string[]): Promise<{ updated: number }> => {
        const response = await httpClient<any>("/staff/review-materials/lessons/bulk/reject", {
            method: HttpMethod.PATCH,
            body: JSON.stringify({ ids }),
        });
        return unwrap(response);
    },

    approveHomework: async (id: string): Promise<any> => {
        const response = await httpClient<any>(`/staff/review-materials/homework/${id}/approve`, {
            method: HttpMethod.PATCH,
        });
        return unwrap(response);
    },

    rejectHomework: async (id: string): Promise<any> => {
        const response = await httpClient<any>(`/staff/review-materials/homework/${id}/reject`, {
            method: HttpMethod.PATCH,
        });
        return unwrap(response);
    },

    bulkApproveHomework: async (ids: string[]): Promise<any> => {
        const response = await httpClient<any>("/staff/review-materials/homework/bulk/approve", {
            method: HttpMethod.PATCH,
            body: JSON.stringify({ ids }),
        });
        return unwrap(response);
    },

    bulkRejectHomework: async (ids: string[]): Promise<any> => {
        const response = await httpClient<any>("/staff/review-materials/homework/bulk/reject", {
            method: HttpMethod.PATCH,
            body: JSON.stringify({ ids }),
        });
        return unwrap(response);
    },
};
