import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type {
    CreateStaffNotificationDto,
    LmsNotificationEntity,
    NotificationCategory,
    PaginatedNotificationsResponse,
    UpdateStaffNotificationDto,
} from "@/types/notification.types";

export const notificationService = {
    listStaffNotifications: async (params?: { limit?: number; offset?: number }): Promise<PaginatedNotificationsResponse> => {
        const query = new URLSearchParams();
        if (params?.limit !== undefined) query.set("limit", String(params.limit));
        if (params?.offset !== undefined) query.set("offset", String(params.offset));
        const queryString = query.toString() ? `?${query.toString()}` : "";

        return await httpClient<PaginatedNotificationsResponse>(`/v1/staff/notifications${queryString}`, { method: HttpMethod.GET });
    },

    createStaffNotification: async (dto: CreateStaffNotificationDto): Promise<LmsNotificationEntity> => {
        return await httpClient<LmsNotificationEntity>("/v1/staff/notifications", {
            method: HttpMethod.POST,
            body: JSON.stringify(dto),
        });
    },

    updateStaffNotification: async (id: string, dto: UpdateStaffNotificationDto): Promise<LmsNotificationEntity> => {
        return await httpClient<LmsNotificationEntity>(`/v1/staff/notifications/${id}`, {
            method: HttpMethod.PUT,
            body: JSON.stringify(dto),
        });
    },

    deleteStaffNotification: async (id: string): Promise<void> => {
        return await httpClient<void>(`/v1/staff/notifications/${id}`, { method: HttpMethod.DELETE });
    },

    listCategories: async (): Promise<{ items: NotificationCategory[] }> => {
        return await httpClient<{ items: NotificationCategory[] }>("/v1/staff/notification-categories", { method: HttpMethod.GET });
    },
};
