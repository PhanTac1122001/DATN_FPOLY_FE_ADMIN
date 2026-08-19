import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type { CreateSystemRequest, Semester, Specialize, System, UpdateSystemRequest } from "@/types/system.types";

let mockSystems: System[] = [];

export async function getSystemsList(): Promise<System[]> {
    try {
        const response = await httpClient<any>("/systems", { method: HttpMethod.GET });
        if (response?.data && Array.isArray(response.data)) {
            return response.data;
        }
        if (Array.isArray(response)) {
            return response;
        }
    } catch {
        // Fallback mock system data
    }
    return [...mockSystems];
}

export async function createSystem(data: CreateSystemRequest): Promise<System> {
    try {
        const response = await httpClient<any>("/systems", {
            method: HttpMethod.POST,
            body: JSON.stringify(data),
        });
        if (response?.data) return response.data;
    } catch {
        // Fallback mock
    }
    const newSystem: System = {
        id: `sys-${Date.now()}`,
        systemCode: data.code,
        name: data.name,
        createdAt: new Date().toISOString(),
    };
    mockSystems.unshift(newSystem);
    return newSystem;
}

export async function updateSystem(id: string, data: UpdateSystemRequest): Promise<System> {
    try {
        const response = await httpClient<any>(`/systems/${id}`, {
            method: HttpMethod.PUT,
            body: JSON.stringify(data),
        });
        if (response?.data) return response.data;
    } catch {
        // Fallback mock
    }
    const index = mockSystems.findIndex((s) => s.id === id);
    if (index !== -1) {
        mockSystems[index] = {
            ...mockSystems[index],
            systemCode: data.code || mockSystems[index].systemCode,
            name: data.name || mockSystems[index].name,
        };
        return mockSystems[index];
    }
    throw new Error("Hệ đào tạo không tồn tại");
}

export async function deleteSystem(id: string): Promise<void> {
    try {
        await httpClient<any>(`/systems/${id}`, { method: HttpMethod.DELETE });
    } catch {
        // Fallback mock
    }
    mockSystems = mockSystems.filter((s) => s.id !== id);
}

export async function getSpecializesList(): Promise<Specialize[]> {
    try {
        const response = await httpClient<any>("/staff/specializes", { method: HttpMethod.GET });
        if (response?.data) return response.data;
    } catch {
        // Fallback to empty array
    }
    return [];
}

export async function createSpecialize(data: { name: string; systemId: string }): Promise<Specialize> {
    const response = await httpClient<any>("/staff/specializes", {
        method: HttpMethod.POST,
        body: JSON.stringify(data),
    });
    return response?.data || response;
}

export async function updateSpecialize(id: string, data: { name: string }): Promise<Specialize> {
    const response = await httpClient<any>(`/staff/specializes/${id}`, {
        method: HttpMethod.PUT,
        body: JSON.stringify(data),
    });
    return response?.data || response;
}

export async function deleteSpecialize(id: string): Promise<void> {
    const response = await httpClient<any>(`/staff/specializes/${id}`, { method: HttpMethod.DELETE });
    return response?.data || response;
}

export async function getSemestersBySpecialize(specializeId: string): Promise<Semester[]> {
    const response = await httpClient<any>(`/staff/semesters/specialize/${specializeId}`, { method: HttpMethod.GET });
    return response?.data || response || [];
}

export async function getAllSemesters(): Promise<Semester[]> {
    const response = await httpClient<any>("/staff/semesters", { method: HttpMethod.GET });
    return response?.data || response || [];
}

export async function createSemester(data: { name: string; priority: number; specializeId: string }): Promise<Semester> {
    const response = await httpClient<any>("/staff/semesters", {
        method: HttpMethod.POST,
        body: JSON.stringify(data),
    });
    return response?.data || response;
}

export async function updateSemester(id: string, data: { name: string }): Promise<Semester> {
    const response = await httpClient<any>(`/staff/semesters/${id}`, {
        method: HttpMethod.PUT,
        body: JSON.stringify(data),
    });
    return response?.data || response;
}

export async function deleteSemester(id: string): Promise<void> {
    const response = await httpClient<any>(`/staff/semesters/${id}`, { method: HttpMethod.DELETE });
    return response?.data || response;
}
