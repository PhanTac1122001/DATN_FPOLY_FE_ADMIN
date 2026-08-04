import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type { Homework } from "@/types/material.types";

export async function getHomeworkBySession(sessionId: string): Promise<Homework[]> {
    const res = await httpClient<any>(`/api/homework/session/${sessionId}`, { method: HttpMethod.GET });
    return res.data || res || [];
}

export async function getHomeworkById(id: string): Promise<Homework> {
    const res = await httpClient<any>(`/api/homework/${id}`, { method: HttpMethod.GET });
    return res.data || res;
}

export async function createHomework(body: Partial<Homework>): Promise<Homework> {
    const res = await httpClient<any>("/api/homework", {
        method: HttpMethod.POST,
        body: JSON.stringify(body),
    });
    return res.data || res;
}

export async function updateHomework(id: string, body: Partial<Homework>): Promise<Homework> {
    const res = await httpClient<any>(`/api/homework/${id}`, {
        method: HttpMethod.PATCH,
        body: JSON.stringify(body),
    });
    return res.data || res;
}

export async function deleteHomework(id: string): Promise<void> {
    await httpClient<any>(`/api/homework/${id}`, { method: HttpMethod.DELETE });
}

export async function approveHomework(id: string): Promise<Homework> {
    const res = await httpClient<any>(`/api/homework/${id}/approve`, { method: HttpMethod.PATCH });
    return res.data || res;
}

export async function rejectHomework(id: string): Promise<Homework> {
    const res = await httpClient<any>(`/api/homework/${id}/reject`, { method: HttpMethod.PATCH });
    return res.data || res;
}

export async function bulkApproveHomework(ids: string[]): Promise<any> {
    const res = await httpClient<any>("/api/homework/bulk/approve", {
        method: HttpMethod.PATCH,
        body: JSON.stringify({ ids }),
    });
    return res.data || res;
}

export async function bulkRejectHomework(ids: string[]): Promise<any> {
    const res = await httpClient<any>("/api/homework/bulk/reject", {
        method: HttpMethod.PATCH,
        body: JSON.stringify({ ids }),
    });
    return res.data || res;
}
