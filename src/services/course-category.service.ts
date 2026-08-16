import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type { CourseCategory, CreateCourseCategoryPayload, UpdateCourseCategoryPayload } from "@/types/course-category.types";

function unwrap<T>(response: unknown): T {
    if (response && typeof response === "object" && "data" in response) {
        return ((response as { data: T }).data ?? response) as T;
    }
    return response as T;
}

export const courseCategoryService = {
    getAll: async (): Promise<CourseCategory[]> => {
        const response = await httpClient<any>("/staff/course-categories", {
            method: HttpMethod.GET,
        });
        const data = unwrap<CourseCategory[] | { items?: CourseCategory[] }>(response);
        if (Array.isArray(data)) return data;
        return data?.items || [];
    },

    create: async (dto: CreateCourseCategoryPayload): Promise<CourseCategory> => {
        const response = await httpClient<any>("/staff/course-categories", {
            method: HttpMethod.POST,
            body: JSON.stringify(dto),
        });
        return unwrap<CourseCategory>(response);
    },

    update: async (id: string, dto: UpdateCourseCategoryPayload): Promise<CourseCategory> => {
        const response = await httpClient<any>(`/staff/course-categories/${id}`, {
            method: HttpMethod.PUT,
            body: JSON.stringify(dto),
        });
        return unwrap<CourseCategory>(response);
    },

    remove: async (id: string): Promise<void> => {
        const response = await httpClient<any>(`/staff/course-categories/${id}`, {
            method: HttpMethod.DELETE,
        });
        unwrap(response);
    },
};
