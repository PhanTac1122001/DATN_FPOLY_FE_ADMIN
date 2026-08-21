import { API_ENDPOINTS } from "@/constants/api-endpoints.constants";
import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type {
    ApplicationItem,
    ApplicationStats,
    ApplicationStatusEnum,
    CreateApplicationDto,
    FilterApplicationQuery,
} from "@/types/application-approval.types";

export const applicationApprovalService = {
    async getApplications(query: FilterApplicationQuery): Promise<{ items: ApplicationItem[]; total: number }> {
        try {
            const params = new URLSearchParams();
            if (query.type && query.type !== "ALL") params.append("type", query.type);
            if (query.status && query.status !== "ALL") params.append("status", query.status);
            if (query.search) params.append("search", query.search);
            if (query.startDate) params.append("startDate", query.startDate);
            if (query.endDate) params.append("endDate", query.endDate);

            const res = await httpClient<any>(`${API_ENDPOINTS.APPLICATION_REQUESTS.BASE}?${params.toString()}`, {
                method: HttpMethod.GET,
            });

            const data = res?.data || res;
            if (data?.items && Array.isArray(data.items)) {
                return {
                    items: data.items.map(mapBackendToApplicationItem),
                    total: data.pagination?.total || data.items.length,
                };
            }
        } catch {
            // Silently handle offline/error state
        }

        return { items: [], total: 0 };
    },

    async getStats(): Promise<ApplicationStats> {
        try {
            const res = await httpClient<any>(API_ENDPOINTS.APPLICATION_REQUESTS.BASE, { method: HttpMethod.GET });
            const data = res?.data || res;
            if (data?.stats) return data.stats;
        } catch {
            // Silently handle offline/error state
        }

        return { totalCount: 0, pendingCount: 0, approvedCount: 0, rejectedCount: 0 };
    },

    async createApplication(dto: CreateApplicationDto): Promise<ApplicationItem> {
        const res = await httpClient<any>(API_ENDPOINTS.APPLICATION_REQUESTS.BASE, {
            method: HttpMethod.POST,
            body: JSON.stringify(dto),
        });
        const data = res?.data || res;
        return mapBackendToApplicationItem(data);
    },

    async approveApplication(id: string): Promise<ApplicationItem> {
        const res = await httpClient<any>(API_ENDPOINTS.APPLICATION_REQUESTS.APPROVE(id), {
            method: HttpMethod.PATCH,
        });
        const data = res?.data || res;
        return mapBackendToApplicationItem(data);
    },

    async rejectApplication(id: string, rejectReason: string): Promise<ApplicationItem> {
        const res = await httpClient<any>(API_ENDPOINTS.APPLICATION_REQUESTS.REJECT(id), {
            method: HttpMethod.PATCH,
            body: JSON.stringify({ rejectReason }),
        });
        const data = res?.data || res;
        return mapBackendToApplicationItem(data);
    },
};

function mapBackendToApplicationItem(raw: any): ApplicationItem {
    const s = raw?.studentInfo || {};
    return {
        id: raw?.id || raw?._id || "",
        code: raw?.code || "DON-2026-000",
        type: raw?.type || "RE_EXAM",
        typeName: raw?.typeName || "Đơn đăng ký",
        student: {
            id: raw?.studentId || "",
            studentCode: s.studentCode || "",
            fullName: s.fullName || "",
            email: s.email || "",
            dob: s.dob,
            phone: s.phone,
            className: s.className || "",
            cohort: s.cohort || "",
            major: s.major || "",
            address: s.address,
        },
        semesterId: raw?.semesterId,
        semesterName: raw?.semesterName,
        courseId: raw?.courseId,
        courseName: raw?.courseName,
        courseCode: raw?.courseCode,
        examType: raw?.examType,
        currentGrade: raw?.currentGrade,
        reason: raw?.reason,
        notes: raw?.notes,
        commitmentDate: raw?.commitmentDate,
        fromSemester: raw?.fromSemester,
        fromYear: raw?.fromYear,
        toSemester: raw?.toSemester,
        toYear: raw?.toYear,
        examDate: raw?.examDate,
        examBatch: raw?.examBatch,
        examShift: raw?.examShift,
        examRoom: raw?.examRoom,
        attachmentNotes: raw?.attachmentNotes,
        attachmentName: raw?.attachmentName,
        attachmentUrl: raw?.attachmentUrl,
        status: (raw?.status as ApplicationStatusEnum) || "PENDING",
        submittedAt: raw?.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString(),
        processedAt: raw?.reviewedAt
            ? new Date(raw.reviewedAt).toISOString()
            : raw?.updatedAt && raw?.status !== "PENDING"
              ? new Date(raw.updatedAt).toISOString()
              : undefined,
        processedBy: raw?.reviewerName || (raw?.reviewerId ? "Admin Đào tạo" : undefined),
        rejectReason: raw?.rejectReason,
    };
}
