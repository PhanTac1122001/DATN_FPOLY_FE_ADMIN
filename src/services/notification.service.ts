import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type {
    CreateNotificationCategoryDto,
    CreateStaffNotificationDto,
    LmsNotificationEntity,
    NotificationCategory,
    PaginatedNotificationsResponse,
    UpdateNotificationCategoryDto,
    UpdateStaffNotificationDto,
} from "@/types/notification.types";

const defaultLimit = 10;

export const notificationService = {
    listStaffNotifications: async (params?: { limit?: number; offset?: number }): Promise<PaginatedNotificationsResponse> => {
        const query = new URLSearchParams();
        if (params?.limit !== undefined) query.set("limit", String(params.limit));
        if (params?.offset !== undefined) query.set("offset", String(params.offset));
        const queryString = query.toString() ? `?${query.toString()}` : "";

        const response = await httpClient<any>(`/staff/notifications${queryString}`, { method: HttpMethod.GET });
        const raw = response?.data ?? response;
        if (raw && typeof raw === "object") {
            return {
                items: Array.isArray(raw.items) ? raw.items : Array.isArray(raw) ? raw : [],
                totalItems: typeof raw.totalItems === "number" ? raw.totalItems : raw.items?.length || 0,
                limit: raw.limit || params?.limit || defaultLimit,
                offset: raw.offset || params?.offset || 0,
            };
        }
        return { items: [], totalItems: 0, limit: defaultLimit, offset: 0 };
    },

    createStaffNotification: async (dto: CreateStaffNotificationDto): Promise<LmsNotificationEntity> => {
        const response = await httpClient<any>("/staff/notifications", {
            method: HttpMethod.POST,
            body: JSON.stringify(dto),
        });
        return response?.data ?? response;
    },

    updateStaffNotification: async (id: string, dto: UpdateStaffNotificationDto): Promise<LmsNotificationEntity> => {
        const response = await httpClient<any>(`/staff/notifications/${id}`, {
            method: HttpMethod.PUT,
            body: JSON.stringify(dto),
        });
        return response?.data ?? response;
    },

    deleteStaffNotification: async (id: string): Promise<void> => {
        const response = await httpClient<any>(`/staff/notifications/${id}`, { method: HttpMethod.DELETE });
        return response?.data ?? response;
    },

    listCategories: async (): Promise<{ items: NotificationCategory[] }> => {
        const response = await httpClient<any>("/staff/notification-categories", { method: HttpMethod.GET });
        const raw = response?.data ?? response;
        if (Array.isArray(raw)) {
            return { items: raw };
        }
        if (Array.isArray(raw?.items)) {
            return { items: raw.items };
        }
        return { items: [] };
    },

    createCategory: async (dto: CreateNotificationCategoryDto): Promise<NotificationCategory> => {
        const response = await httpClient<any>("/staff/notification-categories", {
            method: HttpMethod.POST,
            body: JSON.stringify(dto),
        });
        return response?.data ?? response;
    },

    updateCategory: async (code: string, dto: UpdateNotificationCategoryDto): Promise<NotificationCategory> => {
        const response = await httpClient<any>(`/staff/notification-categories/${code}`, {
            method: HttpMethod.PUT,
            body: JSON.stringify(dto),
        });
        return response?.data ?? response;
    },

    deleteCategory: async (code: string): Promise<void> => {
        const response = await httpClient<any>(`/staff/notification-categories/${code}`, { method: HttpMethod.DELETE });
        return response?.data ?? response;
    },
};
