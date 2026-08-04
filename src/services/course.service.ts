import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type {
    BackendScoringFormula,
    CourseBackendEntity,
    CourseGradingFormula,
    CourseItem,
    CreateCoursePayload,
    SetScoringFormulaPayload,
    UpdateCoursePayload,
} from "@/types/course.types";
import { mapBackendFormulaToUiGrading, mapUiGradingToBackendFormula } from "@/utils/course-scoring.utils";

const mockCategories: string[] = ["Lập trình Web", "Lập trình Backend", "Cơ sở dữ liệu", "Kỹ năng phần mềm"];

function mapBackendToCourseItem(raw: CourseBackendEntity): CourseItem {
    return {
        id: raw.id,
        code: raw.courseCode || "",
        title: raw.name || "",
        category: raw.scoringMethod || "Lập trình Web",
        description: raw.description,
        learningOutcomes: raw.learningOutcomes,
        accessMode: raw.accessMode || "SEQUENTIAL",
        isVisible: raw.isVisible ?? true,
        position: raw.position,
        hour: raw.hour,
        totalSessions: raw.totalSessions,
        rPointConfig: (raw.rpointFormula as CourseItem["rPointConfig"]) || {
            enabled: true,
            rPointValue: 50,
            minCompletionRate: 80,
        },
        gradingFormula: mapBackendFormulaToUiGrading(raw.scoringFormula),
        createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}

function mapPayloadToCreateDto(payload: CreateCoursePayload) {
    return {
        name: payload.title,
        courseCode: payload.code,
        description: payload.description,
        learningOutcomes: payload.learningOutcomes,
        accessMode: payload.accessMode || "SEQUENTIAL",
        isVisible: payload.isVisible ?? true,
        scoringMethod: payload.category || "FULL_PROJECT",
        position: payload.position,
        hour: payload.hour,
        totalSessions: payload.totalSessions,
    };
}

function unwrapData<T>(response: unknown): T {
    if (response && typeof response === "object" && "data" in response) {
        return ((response as { data: T }).data ?? response) as T;
    }
    return response as T;
}

async function syncCourseScoringFormula(courseId: string, grading?: CourseGradingFormula): Promise<void> {
    if (!grading) return;

    if (grading.useCustomFormula) {
        const formula = mapUiGradingToBackendFormula(grading);
        await setCourseScoringFormula(courseId, formula);
        return;
    }

    await deleteCourseScoringFormula(courseId);
}

export async function getCourseCategories(): Promise<string[]> {
    return mockCategories;
}

export async function addCourseCategory(name: string): Promise<string> {
    const trimmed = name.trim();
    if (trimmed && !mockCategories.includes(trimmed)) {
        mockCategories.push(trimmed);
    }
    return trimmed;
}

export async function getCoursesList(search?: string): Promise<CourseItem[]> {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    const response = await httpClient<any>(`/api/staff/courses${query}`, {
        method: HttpMethod.GET,
    });
    const list = unwrapData<CourseBackendEntity[] | { items?: CourseBackendEntity[] }>(response) || [];
    const items = Array.isArray(list) ? list : list.items || [];

    if (!Array.isArray(items)) {
        return [];
    }

    return items.map(mapBackendToCourseItem);
}

export async function getCourseById(id: string): Promise<CourseItem> {
    const response = await httpClient<any>(`/api/staff/courses/${id}`, {
        method: HttpMethod.GET,
    });
    const raw = unwrapData<CourseBackendEntity>(response);
    return mapBackendToCourseItem(raw);
}

export async function setCourseScoringFormula(courseId: string, formula: BackendScoringFormula): Promise<CourseItem> {
    const body: SetScoringFormulaPayload = { ...formula };
    const response = await httpClient<any>(`/api/staff/courses/${courseId}/scoring-formula`, {
        method: HttpMethod.PUT,
        body: JSON.stringify(body),
    });
    const raw = unwrapData<CourseBackendEntity>(response);
    return mapBackendToCourseItem(raw);
}

export async function deleteCourseScoringFormula(courseId: string): Promise<CourseItem> {
    const response = await httpClient<any>(`/api/staff/courses/${courseId}/scoring-formula`, {
        method: HttpMethod.DELETE,
    });
    const raw = unwrapData<CourseBackendEntity>(response);
    return mapBackendToCourseItem(raw);
}

export async function createCourse(payload: CreateCoursePayload): Promise<CourseItem> {
    const dto = mapPayloadToCreateDto(payload);
    const response = await httpClient<any>("/api/staff/courses", {
        method: HttpMethod.POST,
        body: JSON.stringify(dto),
    });
    const raw = unwrapData<CourseBackendEntity>(response);
    const created = mapBackendToCourseItem(raw);

    await syncCourseScoringFormula(created.id, payload.gradingFormula);
    return getCourseById(created.id);
}

export async function updateCourse(id: string, payload: UpdateCoursePayload): Promise<CourseItem> {
    const dto: Record<string, unknown> = {};
    if (payload.title) dto.name = payload.title;
    if (payload.code) dto.courseCode = payload.code;
    if (payload.description !== undefined) dto.description = payload.description;
    if (payload.learningOutcomes !== undefined) dto.learningOutcomes = payload.learningOutcomes;
    if (payload.accessMode) dto.accessMode = payload.accessMode;
    if (payload.isVisible !== undefined) dto.isVisible = payload.isVisible;
    if (payload.category) dto.scoringMethod = payload.category;
    if (payload.position !== undefined) dto.position = payload.position;
    if (payload.hour !== undefined) dto.hour = payload.hour;
    if (payload.totalSessions !== undefined) dto.totalSessions = payload.totalSessions;

    const response = await httpClient<any>(`/api/staff/courses/${id}`, {
        method: HttpMethod.PUT,
        body: JSON.stringify(dto),
    });
    unwrapData<CourseBackendEntity>(response);

    if (payload.gradingFormula) {
        await syncCourseScoringFormula(id, payload.gradingFormula);
    }

    return getCourseById(id);
}

export async function deleteCourse(id: string): Promise<boolean> {
    const response = await httpClient<any>(`/api/staff/courses/${id}`, {
        method: HttpMethod.DELETE,
    });
    return unwrapData(response) || true;
}
