import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type { PublishReportEntity, PublishStatusEntity } from "@/types/publish.types";

export const publishService = {
    validateCourse: async (courseId: string): Promise<PublishReportEntity> => {
        const response = await httpClient<any>(`/staff/courses/${courseId}/validate`, {
            method: HttpMethod.POST,
        });
        return response?.data || response;
    },

    publishCourse: async (courseId: string): Promise<PublishReportEntity> => {
        const response = await httpClient<any>(`/staff/courses/${courseId}/publish`, {
            method: HttpMethod.POST,
        });
        return response?.data || response;
    },

    getPublishStatus: async (courseId: string, withIssues = false): Promise<PublishStatusEntity> => {
        const query = withIssues ? "?withIssues=true" : "";
        const response = await httpClient<any>(`/staff/courses/${courseId}/publish-status${query}`, {
            method: HttpMethod.GET,
        });
        return response?.data || response;
    },
};
