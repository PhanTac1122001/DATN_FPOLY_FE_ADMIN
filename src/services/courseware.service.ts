import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type { CoursewareBlockEntity } from "@/types/completion-rule.types";
import type { BlockTypeCatalogEntity } from "@/types/courseware.types";

function unwrapList<T>(response: any): T[] {
    const data = response?.data || response || [];
    return Array.isArray(data) ? data : data.items || [];
}

export const coursewareService = {
    getBlockTypes: async (): Promise<BlockTypeCatalogEntity[]> => {
        const response = await httpClient<any>("/api/staff/courseware/block-types", {
            method: HttpMethod.GET,
        });
        return unwrapList<BlockTypeCatalogEntity>(response);
    },

    getSessionBlocks: async (sessionId: string): Promise<CoursewareBlockEntity[]> => {
        const response = await httpClient<any>(`/api/staff/sessions/${sessionId}/blocks`, {
            method: HttpMethod.GET,
        });
        return unwrapList<CoursewareBlockEntity>(response).map((b: any) => ({
            id: String(b.id ?? b._id),
            type: b.type || "",
            title: b.title || "",
            isRequired: b.isRequired !== false,
            position: b.position,
        }));
    },

    getLessonBlocks: async (lessonId: string): Promise<CoursewareBlockEntity[]> => {
        const response = await httpClient<any>(`/api/staff/lessons/${lessonId}/blocks`, {
            method: HttpMethod.GET,
        });
        return unwrapList<CoursewareBlockEntity>(response).map((b: any) => ({
            id: String(b.id ?? b._id),
            type: b.type || "",
            title: b.title || "",
            isRequired: b.isRequired !== false,
            position: b.position,
            completionCriteria: b.completionCriteria || b.criteria || {},
        }));
    },

    updateBlock: async (
        blockId: string,
        body: Partial<{ title: string; description: string; isRequired: boolean; completionCriteria: Record<string, unknown> }>,
    ): Promise<CoursewareBlockEntity> => {
        const response = await httpClient<any>(`/api/staff/blocks/${blockId}`, {
            method: HttpMethod.PATCH,
            body: JSON.stringify(body),
        });
        const b = response?.data || response;
        return {
            id: String(b.id ?? b._id),
            type: b.type || "",
            title: b.title || "",
            isRequired: b.isRequired !== false,
            position: b.position,
            completionCriteria: b.completionCriteria || b.criteria || {},
        };
    },
};
