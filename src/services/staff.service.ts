import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type { CreateStaffRequest, Staff, System, UpdateStaffRequest } from "@/types/staff.types";

export async function getStaffList(): Promise<Staff[]> {
    const response = await httpClient<any>("/staff", { method: HttpMethod.GET });
    return response?.data || response || [];
}

export async function createStaff(data: CreateStaffRequest): Promise<Staff> {
    const response = await httpClient<any>("/staff", {
        method: HttpMethod.POST,
        body: JSON.stringify(data),
    });
    return response?.data || response;
}

export async function updateStaff(id: string, data: UpdateStaffRequest): Promise<Staff> {
    const response = await httpClient<any>(`/staff/${id}`, {
        method: HttpMethod.PUT,
        body: JSON.stringify(data),
    });
    return response?.data || response;
}

export async function deleteStaff(id: string): Promise<void> {
    const response = await httpClient<any>(`/staff/${id}`, { method: HttpMethod.DELETE });
    return response?.data || response;
}

export async function getSystemsList(): Promise<System[]> {
    const response = await httpClient<any>("/systems", { method: HttpMethod.GET });
    return response?.data || response || [];
}
