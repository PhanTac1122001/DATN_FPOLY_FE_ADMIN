import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type {
    Classroom,
    LearningPathItem,
    SpecializationOption,
    StaffCourseOption,
    Student,
    StudentClassEnrollment,
    StudentReport,
    StudentTranscriptResponse,
} from "@/types/student.types";

export async function getStudentsReport(): Promise<StudentReport[]> {
    const res = await httpClient<any>("/api/students/report/by-system", { method: HttpMethod.GET });
    const data = res?.data ?? res;
    return Array.isArray(data) ? data : [];
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

export async function createStudent(data: Partial<Student> & { systemId: string; specializeId?: string; password?: string }): Promise<Student> {
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
    const items = res?.data?.items || res?.data || res || [];
    return Array.isArray(items) ? items : [];
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
    try {
        const res = await httpClient<any>("/api/staff/classes", { method: HttpMethod.GET });
        const items = res?.data?.items || res?.data || res || [];
        return Array.isArray(items) ? items : [];
    } catch {
        return [];
    }
}

/* ==================== LEARNING PATH APIS ==================== */

export async function getStudentLearningPath(studentId: string): Promise<LearningPathItem[]> {
    const res = await httpClient<any>(`/api/staff/students/${studentId}/learning-path`, { method: HttpMethod.GET });
    return res.data || res || [];
}

export async function assignLearningPathCourse(studentId: string, body: { courseId: string; isRequired?: boolean }): Promise<LearningPathItem> {
    const res = await httpClient<any>(`/api/staff/students/${studentId}/learning-path/courses`, {
        method: HttpMethod.POST,
        body: JSON.stringify(body),
    });
    return res.data || res;
}

export async function unassignLearningPathCourse(studentId: string, courseId: string): Promise<void> {
    await httpClient<any>(`/api/staff/students/${studentId}/learning-path/courses/${courseId}`, { method: HttpMethod.DELETE });
}

export async function resyncLearningPath(studentId: string): Promise<{ inserted: number }> {
    const res = await httpClient<any>(`/api/staff/students/${studentId}/learning-path/resync`, {
        method: HttpMethod.POST,
    });
    return res.data || res || { inserted: 0 };
}

/* ==================== TRANSCRIPT & FINAL RESULT APIS ==================== */

export async function getStudentTranscript(studentId: string): Promise<StudentTranscriptResponse> {
    const res = await httpClient<any>(`/api/final-result/student/${studentId}/transcript`, { method: HttpMethod.GET });
    return res.data || res;
}

export async function getCourseGradeDetail(studentId: string, courseId: string): Promise<any[]> {
    const res = await httpClient<any>(`/api/final-result/student/${studentId}/${courseId}`, { method: HttpMethod.GET });
    return res.data || res || [];
}

export async function retakeCourse(studentId: string, courseId: string, body: any): Promise<any> {
    const res = await httpClient<any>(`/api/final-result/${studentId}/${courseId}/retake`, {
        method: HttpMethod.POST,
        body: JSON.stringify(body),
    });
    return res.data || res;
}

export async function getCurrentAttempt(studentId: string, courseId: string): Promise<any> {
    const res = await httpClient<any>(`/api/final-result/student/${studentId}/${courseId}/current`, { method: HttpMethod.GET });
    return res.data || res;
}

/* ==================== OPTIONS APIS ==================== */

export async function getStaffCoursesList(): Promise<StaffCourseOption[]> {
    try {
        const res = await httpClient<any>("/api/staff/courses", { method: HttpMethod.GET });
        const items = res.data || res || [];
        return Array.isArray(items) ? items : items.items || [];
    } catch {
        return [];
    }
}

export async function getSpecializationsList(): Promise<SpecializationOption[]> {
    try {
        let res = await httpClient<any>("/api/staff/specializes", { method: HttpMethod.GET }).catch(() => null);
        if (!res) {
            res = await httpClient<any>("/api/specializes", { method: HttpMethod.GET }).catch(() => null);
        }
        const items = res?.data || res || [];
        return Array.isArray(items) ? items : items.items || [];
    } catch {
        return [];
    }
}
