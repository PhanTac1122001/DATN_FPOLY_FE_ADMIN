import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type { CreateSessionTypeDto, SessionType, UpdateSessionTypeDto } from "@/types/session-type.types";

export const sessionTypeService = {
    getAll: async (includeInactive = true): Promise<SessionType[]> => {
        return await httpClient<SessionType[]>(`/v1/staff/session-types?includeInactive=${includeInactive}`, { method: HttpMethod.GET });
    },

    create: async (dto: CreateSessionTypeDto): Promise<SessionType> => {
        return await httpClient<SessionType>("/v1/staff/session-types", {
            method: HttpMethod.POST,
            body: JSON.stringify(dto),
        });
    },

    update: async (id: string, dto: UpdateSessionTypeDto): Promise<SessionType> => {
        return await httpClient<SessionType>(`/v1/staff/session-types/${id}`, {
            method: HttpMethod.PATCH,
            body: JSON.stringify(dto),
        });
    },

    remove: async (id: string): Promise<{ success: boolean; deactivatedOnly?: boolean }> => {
        return await httpClient<{ success: boolean; deactivatedOnly?: boolean }>(`/v1/staff/session-types/${id}`, { method: HttpMethod.DELETE });
    },

    reorder: async (ids: string[]): Promise<{ success: boolean }> => {
        return await httpClient<{ success: boolean }>("/v1/staff/session-types/reorder", {
            method: HttpMethod.PUT,
            body: JSON.stringify({ ids }),
        });
    },
};
