import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type {
    ClassDetail,
    ClassEntity,
    CreateClassRequest,
    CreateCourseClassRequest,
    CreateStudentClassRequest,
    UpdateClassRequest,
    UpdateCourseClassRequest,
    UpdateStudentClassRequest,
} from "@/types/class.types";

export async function getClassList(): Promise<ClassEntity[]> {
    const response = await httpClient<any>("/staff/classes", { method: HttpMethod.GET });
    const classesList = response?.data || response || [];
    return Array.isArray(classesList) ? classesList : [];
}

export async function getClassById(id: string): Promise<ClassEntity> {
    const response = await httpClient<any>(`/staff/classes/${id}`, { method: HttpMethod.GET });
    return response?.data || response;
}

export async function getClassDetail(id: string): Promise<ClassDetail> {
    const response = await httpClient<any>(`/staff/classes/${id}/detail`, { method: HttpMethod.GET });
    return response?.data || response;
}

export async function createClass(data: CreateClassRequest): Promise<ClassEntity> {
    const response = await httpClient<any>("/staff/classes", {
        method: HttpMethod.POST,
        body: JSON.stringify(data),
    });
    return response?.data || response;
}

export async function updateClass(id: string, data: UpdateClassRequest): Promise<ClassEntity> {
    const response = await httpClient<any>(`/staff/classes/${id}`, {
        method: HttpMethod.PUT,
        body: JSON.stringify(data),
    });
    return response?.data || response;
}

export async function deleteClass(id: string): Promise<void> {
    const response = await httpClient<any>(`/staff/classes/${id}`, { method: HttpMethod.DELETE });
    return response?.data || response;
}

/* ==================== COURSE-CLASS MANAGEMENT ==================== */

export async function assignCourseToClass(data: CreateCourseClassRequest): Promise<any> {
    const response = await httpClient<any>("/staff/course-classes", {
        method: HttpMethod.POST,
        body: JSON.stringify(data),
    });
    return response?.data || response;
}

export async function updateCourseClass(id: string, data: UpdateCourseClassRequest): Promise<any> {
    const response = await httpClient<any>(`/staff/course-classes/${id}`, {
        method: HttpMethod.PUT,
        body: JSON.stringify(data),
    });
    return response?.data || response;
}

export async function deleteCourseClass(id: string): Promise<void> {
    const response = await httpClient<any>(`/staff/course-classes/${id}`, { method: HttpMethod.DELETE });
    return response?.data || response;
}

/* ==================== STUDENT-CLASS (ROSTER) MANAGEMENT ==================== */

export async function enrollStudentInClass(data: CreateStudentClassRequest): Promise<any> {
    const response = await httpClient<any>("/staff/student-classes", {
        method: HttpMethod.POST,
        body: JSON.stringify(data),
    });
    return response?.data || response;
}

export async function updateStudentClass(id: string, data: UpdateStudentClassRequest): Promise<any> {
    const response = await httpClient<any>(`/staff/student-classes/${id}`, {
        method: HttpMethod.PUT,
        body: JSON.stringify(data),
    });
    return response?.data || response;
}

export async function deleteStudentFromClass(id: string): Promise<void> {
    const response = await httpClient<any>(`/staff/student-classes/${id}`, { method: HttpMethod.DELETE });
    return response?.data || response;
}
