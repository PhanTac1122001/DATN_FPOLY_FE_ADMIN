import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type {
    AssignGroupHomeworkRequest,
    CreateGroupRequest,
    FilterGroupParams,
    Group,
    GroupHomeworkAssignment,
    GroupStudent,
    UpdateGroupRequest,
} from "@/types/group.types";

export async function getGroups(params?: FilterGroupParams): Promise<{ items: Group[]; total: number }> {
    const queryParams = new URLSearchParams();
    if (params?.classId) queryParams.append("classId", params.classId);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const url = `/staff/groups${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await httpClient<any>(url, { method: HttpMethod.GET });
    const data = response?.data || response;
    return {
        items: data?.items || [],
        total: data?.total || 0,
    };
}

export async function getGroupById(id: string): Promise<Group> {
    const response = await httpClient<any>(`/staff/groups/${id}`, { method: HttpMethod.GET });
    return response?.data || response;
}

export async function createGroup(data: CreateGroupRequest): Promise<Group> {
    const response = await httpClient<any>("/staff/groups", {
        method: HttpMethod.POST,
        body: JSON.stringify(data),
    });
    return response?.data || response;
}

export async function updateGroup(id: string, data: UpdateGroupRequest): Promise<Group> {
    const response = await httpClient<any>(`/staff/groups/${id}`, {
        method: HttpMethod.PUT,
        body: JSON.stringify(data),
    });
    return response?.data || response;
}

export async function deleteGroup(id: string): Promise<void> {
    const response = await httpClient<any>(`/staff/groups/${id}`, { method: HttpMethod.DELETE });
    return response?.data || response;
}

export async function getStudentsInClass(classId: string): Promise<GroupStudent[]> {
    const response = await httpClient<any>(`/staff/groups/class-students/${classId}`, { method: HttpMethod.GET });
    return response?.data || response || [];
}

export async function assignHomeworkToGroup(groupId: string, data: AssignGroupHomeworkRequest): Promise<GroupHomeworkAssignment> {
    const response = await httpClient<any>(`/staff/groups/${groupId}/assign-homework`, {
        method: HttpMethod.POST,
        body: JSON.stringify(data),
    });
    return response?.data || response;
}

export async function getGroupHomeworkAssignments(groupId: string, subjectId?: string, difficultyLevel?: string): Promise<GroupHomeworkAssignment[]> {
    const queryParams = new URLSearchParams();
    if (subjectId) queryParams.append("subjectId", subjectId);
    if (difficultyLevel) queryParams.append("difficultyLevel", difficultyLevel);

    const url = `/staff/groups/${groupId}/homework-assignments${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await httpClient<any>(url, { method: HttpMethod.GET });
    return response?.data || response || [];
}
