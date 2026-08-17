import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type { GetLeaveRequestsResponse, LeaveRequestItem } from "@/types/leave-request.types";

export type { GetLeaveRequestsResponse, LeaveRequestItem };

export async function getClassLeaveRequests(classId: string, params?: { status?: string; search?: string }): Promise<GetLeaveRequestsResponse> {
    const cleanParams: Record<string, string> = {};
    if (params?.status && params.status !== "ALL") {
        cleanParams.status = params.status;
    }
    if (params?.search) {
        cleanParams.search = params.search;
    }
    const query = new URLSearchParams(cleanParams).toString();
    const response = await httpClient<any>(`/staff/classes/${classId}/leave-requests${query ? `?${query}` : ""}`, { method: HttpMethod.GET });
    return response?.data || response || { total: 0, items: [] };
}

export async function getLeaveRequestById(id: string): Promise<LeaveRequestItem> {
    const response = await httpClient<any>(`/staff/leave-requests/${id}`, {
        method: HttpMethod.GET,
    });
    return response?.data || response;
}

export async function approveLeaveRequest(id: string): Promise<LeaveRequestItem> {
    const response = await httpClient<any>(`/staff/leave-requests/${id}/approve`, {
        method: HttpMethod.PATCH,
    });
    return response?.data || response;
}

export async function rejectLeaveRequest(id: string, reviewerNote?: string): Promise<LeaveRequestItem> {
    const response = await httpClient<any>(`/staff/leave-requests/${id}/reject`, {
        method: HttpMethod.PATCH,
        body: JSON.stringify({ reviewerNote }),
    });
    return response?.data || response;
}
