import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type { CreateSessionTypeDto, SessionType, UpdateSessionTypeDto } from "@/types/session-type.types";

function unwrap<T>(response: unknown): T {
    if (response && typeof response === "object" && "data" in response) {
        return ((response as { data: T }).data ?? response) as T;
    }
    return response as T;
}

export const sessionTypeService = {
    getAll: async (includeInactive = true): Promise<SessionType[]> => {
        const response = await httpClient<any>(`/api/staff/session-types?includeInactive=${includeInactive}`, {
            method: HttpMethod.GET,
        });
        const data = unwrap<SessionType[] | { items?: SessionType[] }>(response);
        if (Array.isArray(data)) return data;
        return data?.items || [];
    },

    create: async (dto: CreateSessionTypeDto): Promise<SessionType> => {
        const response = await httpClient<any>("/api/staff/session-types", {
            method: HttpMethod.POST,
            body: JSON.stringify(dto),
        });
        return unwrap<SessionType>(response);
    },

    update: async (id: string, dto: UpdateSessionTypeDto): Promise<SessionType> => {
        const response = await httpClient<any>(`/api/staff/session-types/${id}`, {
            method: HttpMethod.PATCH,
            body: JSON.stringify(dto),
        });
        return unwrap<SessionType>(response);
    },

    remove: async (id: string): Promise<{ success: boolean; hardDeleted?: boolean; deactivatedOnly?: boolean }> => {
        const response = await httpClient<any>(`/api/staff/session-types/${id}`, { method: HttpMethod.DELETE });
        return unwrap(response) || { success: true };
    },

    reorder: async (ids: string[]): Promise<{ success: boolean }> => {
        const response = await httpClient<any>("/api/staff/session-types/reorder", {
            method: HttpMethod.PUT,
            body: JSON.stringify({ ids }),
        });
        return unwrap(response) || { success: true };
    },
};
