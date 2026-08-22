import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type {
    BulkMarkSessionCompletionDto,
    EditSubmissionFeedbackDto,
    HomeworkCompletionItem,
    HomeworkSubmissionItem,
    MarkSessionCompletionDto,
    SessionStudentDetailResponse,
} from "@/types/homework.types";

export type { HomeworkCompletionItem, HomeworkSubmissionItem };

export async function getCompletionsByClass(classId: string, courseId?: string): Promise<HomeworkCompletionItem[]> {
    const url = courseId ? `/homework/completion/class/${classId}?courseId=${courseId}` : `/homework/completion/class/${classId}`;
    const res = await httpClient<any>(url, { method: HttpMethod.GET });
    return res.data || res || [];
}

export async function getCompletionsBySession(sessionId: string, classId?: string): Promise<HomeworkCompletionItem[]> {
    const url = classId ? `/homework/completion/session/${sessionId}?classId=${classId}` : `/homework/completion/session/${sessionId}`;
    const res = await httpClient<any>(url, { method: HttpMethod.GET });
    return res.data || res || [];
}

export async function markSessionCompletion(dto: MarkSessionCompletionDto): Promise<HomeworkCompletionItem> {
    const res = await httpClient<any>("/homework/completion/session", {
        method: HttpMethod.PATCH,
        body: JSON.stringify(dto),
    });
    return res.data || res;
}

export async function markSessionCompletionBulk(dto: BulkMarkSessionCompletionDto): Promise<{ updated: number }> {
    const res = await httpClient<any>("/homework/completion/session/bulk", {
        method: HttpMethod.PATCH,
        body: JSON.stringify(dto),
    });
    return res.data || res;
}

export async function getSessionStudentDetail(sessionId: string, studentId: string): Promise<SessionStudentDetailResponse> {
    const res = await httpClient<any>(`/homework/completion/session/${sessionId}/student/${studentId}`, {
        method: HttpMethod.GET,
    });
    return res.data || res;
}

export async function editSubmissionFeedback(submissionId: string, dto: EditSubmissionFeedbackDto): Promise<any> {
    const res = await httpClient<any>(`/homework/completion/submission/${submissionId}/feedback`, {
        method: HttpMethod.PATCH,
        body: JSON.stringify(dto),
    });
    return res.data || res;
}

export async function approveSessionAiFeedback(sessionId: string, studentId: string): Promise<any> {
    const res = await httpClient<any>(`/homework/completion/session/${sessionId}/student/${studentId}/approve-ai`, {
        method: HttpMethod.PATCH,
    });
    return res.data || res;
}

export async function getCompletionDetail(id: string): Promise<HomeworkCompletionItem> {
    const res = await httpClient<any>(`/homework/completion/${id}`, { method: HttpMethod.GET });
    return res.data || res;
}

export async function getCompletionSubmissions(id: string): Promise<HomeworkSubmissionItem[]> {
    const res = await httpClient<any>(`/homework/completion/${id}/submissions`, { method: HttpMethod.GET });
    return res.data || res || [];
}

export async function gradeCompletion(
    id: string,
    data: {
        status: "COMPLETED" | "NOT_COMPLETED" | "PENDING_TEACHER" | "PENDING_AI";
        teacherNote?: string;
        studentId?: string;
        sessionId?: string;
        classId?: string;
        courseId?: string;
        homeworkId?: string;
    },
): Promise<HomeworkCompletionItem> {
    const res = await httpClient<any>(`/homework/completion/${id}/grade`, {
        method: HttpMethod.PATCH,
        body: JSON.stringify(data),
    });
    return res.data || res;
}

export async function approveCompletionFeedback(id: string): Promise<HomeworkCompletionItem> {
    const res = await httpClient<any>(`/homework/completion/${id}/approve-feedback`, {
        method: HttpMethod.PATCH,
    });
    return res.data || res;
}

export async function approveAllCompletionFeedbackByStudent(studentId: string, classId?: string, courseId?: string): Promise<any> {
    const query = new URLSearchParams();
    if (classId) query.set("classId", classId);
    if (courseId) query.set("courseId", courseId);
    const queryString = query.toString() ? `?${query.toString()}` : "";
    const res = await httpClient<any>(`/homework/completion/student/${studentId}/approve-all-feedback${queryString}`, {
        method: HttpMethod.PATCH,
    });
    return res.data || res;
}

export async function getSessionsByCourseId(courseId: string): Promise<Array<{ id: string; name: string; position?: number }>> {
    const res = await httpClient<any>(`/staff/sessions/course/${courseId}`, {
        method: HttpMethod.GET,
    });
    return res.data || res || [];
}
