import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type { AttendanceSession, CreateSessionRequest, MarkAttendanceRequest } from "@/types/class.types";

export async function createAttendanceSession(data: CreateSessionRequest): Promise<AttendanceSession> {
    const response = await httpClient<any>("/api/staff/attendance/sessions", {
        method: HttpMethod.POST,
        body: JSON.stringify(data),
    });
    return response?.data || response;
}

export async function getAttendanceSessions(params: { classId: string; courseId?: string; from?: string; to?: string }): Promise<AttendanceSession[]> {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const response = await httpClient<any>(`/api/staff/attendance/sessions?${query}`, {
        method: HttpMethod.GET,
    });
    return response?.data || response || [];
}

export async function getAttendanceRoster(sessionId: string): Promise<any[]> {
    const response = await httpClient<any>(`/api/staff/attendance/sessions/${sessionId}/roster`, {
        method: HttpMethod.GET,
    });
    return response?.data || response || [];
}

export async function markAttendance(sessionId: string, data: MarkAttendanceRequest): Promise<any> {
    const response = await httpClient<any>(`/api/staff/attendance/sessions/${sessionId}/mark`, {
        method: HttpMethod.POST,
        body: JSON.stringify(data),
    });
    return response?.data || response;
}

export async function updateAttendanceMark(attendanceId: string, status: string, note?: string): Promise<any> {
    const response = await httpClient<any>(`/api/staff/attendance/marks/${attendanceId}`, {
        method: HttpMethod.PATCH,
        body: JSON.stringify({ status, note }),
    });
    return response?.data || response;
}
