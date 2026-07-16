import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type { Classroom, Student, StudentClassEnrollment, StudentReport } from "@/types/student.types";

export async function getStudentsReport(): Promise<StudentReport[]> {
    return httpClient<StudentReport[]>("/api/students/report/by-system", { method: HttpMethod.GET });
}

export async function getStudentsList(params: {
    page?: number;
    pageSize?: number;
    name?: string;
    studentCode?: string;
    systemId?: string;
    studentStatusSearch?: string;
}): Promise<{ items: Student[]; total: number; page: number; pageSize: number }> {
    const query = new URLSearchParams();
    if (params.page) query.append("page", String(params.page));
    if (params.pageSize) query.append("pageSize", String(params.pageSize));
    if (params.name) query.append("name", params.name);
    if (params.studentCode) query.append("studentCode", params.studentCode);
    if (params.systemId) query.append("systemId", params.systemId);
    if (params.studentStatusSearch) query.append("studentStatusSearch", params.studentStatusSearch);

    const res = await httpClient<any>(`/api/students?${query.toString()}`, { method: HttpMethod.GET });
    return res.data || res;
}

export async function getStudentById(id: string): Promise<Student> {
    const res = await httpClient<any>(`/api/students/${id}`, { method: HttpMethod.GET });
    return res.data || res;
}

export async function createStudent(data: Partial<Student> & { systemId: string }): Promise<Student> {
    const res = await httpClient<any>("/api/students", {
        method: HttpMethod.POST,
        body: JSON.stringify(data),
    });
    return res.data || res;
}

export async function updateStudent(id: string, formData: FormData): Promise<Student> {
    const res = await httpClient<any>(`/api/students/${id}`, {
        method: HttpMethod.PUT,
        body: formData,
    });
    return res.data || res;
}

export async function deleteStudent(id: string): Promise<void> {
    await httpClient<any>(`/api/students/${id}`, { method: HttpMethod.DELETE });
}

export async function importStudentsExcel(systemId: string, file: File): Promise<{ inserted: number; updated: number }> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await httpClient<any>(`/api/students/import/${systemId}`, {
        method: HttpMethod.POST,
        body: formData,
    });
    return res.data || res;
}

export async function getStudentClasses(studentId: string): Promise<StudentClassEnrollment[]> {
    const res = await httpClient<any>(`/api/staff/student-classes/student/${studentId}`, { method: HttpMethod.GET });
    return res.data || res;
}

export async function enrollStudentInClass(body: { studentId: string; classId: string; isActive: boolean; status: string }): Promise<StudentClassEnrollment> {
    const res = await httpClient<any>("/api/staff/student-classes", {
        method: HttpMethod.POST,
        body: JSON.stringify(body),
    });
    return res.data || res;
}

export async function updateStudentClass(id: string, body: { isActive: boolean; status: string }): Promise<StudentClassEnrollment> {
    const res = await httpClient<any>(`/api/staff/student-classes/${id}`, {
        method: HttpMethod.PUT,
        body: JSON.stringify(body),
    });
    return res.data || res;
}

export async function deleteStudentFromClass(id: string): Promise<void> {
    await httpClient<any>(`/api/staff/student-classes/${id}`, { method: HttpMethod.DELETE });
}

export async function getClassesList(): Promise<Classroom[]> {
    const res = await httpClient<any>("/api/staff/classes", { method: HttpMethod.GET });
    return res.data || res || [];
}
