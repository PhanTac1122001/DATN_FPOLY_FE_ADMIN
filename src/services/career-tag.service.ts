import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type { CareerTag, CreateCareerTagPayload, UpdateCareerTagPayload } from "@/types/career-tag.types";
import type { TagCourse } from "@/types/course-roadmap.types";

function unwrap<T>(response: unknown): T {
    if (response && typeof response === "object" && "data" in response) {
        return ((response as { data: T }).data ?? response) as T;
    }
    return response as T;
}

export const careerTagService = {
    getAll: async (): Promise<CareerTag[]> => {
        const response = await httpClient<any>("/staff/tags", {
            method: HttpMethod.GET,
        });
        const data = unwrap<CareerTag[] | { items?: CareerTag[] }>(response);
        if (Array.isArray(data)) return data;
        return data?.items || [];
    },

    create: async (dto: CreateCareerTagPayload): Promise<CareerTag> => {
        const response = await httpClient<any>("/staff/tags", {
            method: HttpMethod.POST,
            body: JSON.stringify(dto),
        });
        return unwrap<CareerTag>(response);
    },

    update: async (id: string, dto: UpdateCareerTagPayload): Promise<CareerTag> => {
        const response = await httpClient<any>(`/staff/tags/${id}`, {
            method: HttpMethod.PUT,
            body: JSON.stringify(dto),
        });
        return unwrap<CareerTag>(response);
    },

    remove: async (id: string): Promise<void> => {
        const response = await httpClient<any>(`/staff/tags/${id}`, {
            method: HttpMethod.DELETE,
        });
        unwrap(response);
    },

    getCourses: async (tagId: string): Promise<TagCourse[]> => {
        const response = await httpClient<any>(`/staff/tags/${tagId}/courses`, {
            method: HttpMethod.GET,
        });
        const data = unwrap<TagCourse[] | { items?: TagCourse[] }>(response);
        if (Array.isArray(data)) return data;
        return data?.items || [];
    },

    setCourses: async (tagId: string, courseIds: string[]): Promise<{ added: number; removed: number }> => {
        const response = await httpClient<any>(`/staff/tags/${tagId}/courses`, {
            method: HttpMethod.PUT,
            body: JSON.stringify({ courseIds }),
        });
        return unwrap<{ added: number; removed: number }>(response);
    },
};
