import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type { AttendanceSession, CreateSessionRequest, MarkAttendanceRequest } from "@/types/class.types";

export async function createAttendanceSession(data: CreateSessionRequest): Promise<AttendanceSession> {
    const response = await httpClient<any>("/staff/attendance/sessions", {
        method: HttpMethod.POST,
        body: JSON.stringify(data),
    });
    return response?.data || response;
}

export async function getAttendanceSessions(params: { classId: string; courseId?: string; from?: string; to?: string }): Promise<AttendanceSession[]> {
    const cleanParams: Record<string, string> = {};
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            cleanParams[key] = String(value);
        }
    });
    const query = new URLSearchParams(cleanParams).toString();
    const response = await httpClient<any>(`/staff/attendance/sessions${query ? `?${query}` : ""}`, {
        method: HttpMethod.GET,
    });
    return response?.data || response || [];
}

export async function getAttendanceRoster(sessionId: string): Promise<any[]> {
    const response = await httpClient<any>(`/staff/attendance/sessions/${sessionId}/roster`, {
        method: HttpMethod.GET,
    });
    return response?.data || response || [];
}

export async function markAttendance(sessionId: string, data: MarkAttendanceRequest): Promise<any> {
    const response = await httpClient<any>(`/staff/attendance/sessions/${sessionId}/mark`, {
        method: HttpMethod.POST,
        body: JSON.stringify(data),
    });
    return response?.data || response;
}

export async function updateAttendanceMark(attendanceId: string, status: string, note?: string): Promise<any> {
    const response = await httpClient<any>(`/staff/attendance/marks/${attendanceId}`, {
        method: HttpMethod.PATCH,
        body: JSON.stringify({ status, note }),
    });
    return response?.data || response;
}

export async function updateAttendanceSession(sessionId: string, data: Partial<CreateSessionRequest>): Promise<AttendanceSession> {
    try {
        const response = await httpClient<any>(`/staff/attendance/sessions/${sessionId}`, {
            method: HttpMethod.PATCH,
            body: JSON.stringify(data),
        });
        return response?.data || response;
    } catch {
        const response = await httpClient<any>(`/staff/attendance/sessions/${sessionId}`, {
            method: HttpMethod.PUT,
            body: JSON.stringify(data),
        });
        return response?.data || response;
    }
}

export async function completeStudentElearning(sessionId: string, studentId: string): Promise<any> {
    const response = await httpClient<any>(`/staff/attendance/sessions/${sessionId}/elearning/${studentId}/complete`, {
        method: HttpMethod.POST,
    });
    return response?.data || response;
}
