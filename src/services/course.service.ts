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

function mapBackendToCourseItem(raw: CourseBackendEntity): CourseItem {
    return {
        id: raw.id,
        code: raw.courseCode || "",
        title: raw.name || "",
        category: raw.scoringMethod || "",
        description: raw.description,
        learningOutcomes: raw.learningOutcomes,
        accessMode: raw.whitelist !== undefined ? (raw.whitelist ? "OPEN" : "SEQUENTIAL") : raw.accessMode || "SEQUENTIAL",
        isVisible: raw.isVisible ?? true,
        position: raw.position,
        hour: raw.hour,
        totalSessions: raw.totalSessions,
        rPointConfig: {
            enabled: raw.rpointFormula != null,
            rPointValue: 0,
            minCompletionRate: 0,
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
        whitelist: payload.accessMode === "OPEN",
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

const dynamicCategories: string[] = [];

export async function getCourseCategories(): Promise<string[]> {
    try {
        const response = await httpClient<any>("/api/staff/courses/scoring-methods", {
            method: HttpMethod.GET,
        });
        const list = unwrapData<Array<{ method: string; label: string }> | string[]>(response);
        if (Array.isArray(list) && list.length > 0) {
            const apiLabels = list.map((item) => (typeof item === "string" ? item : item.label || item.method));
            const merged = Array.from(new Set([...apiLabels, ...dynamicCategories]));
            return merged;
        }
    } catch (err) {
        console.warn("Failed to fetch scoring methods/categories from API:", err);
    }
    return [...dynamicCategories];
}

export async function addCourseCategory(name: string): Promise<string> {
    const trimmed = name.trim();
    if (trimmed && !dynamicCategories.includes(trimmed)) {
        dynamicCategories.push(trimmed);
    }
    return trimmed;
}

export async function updateCourseCategory(oldName: string, newName: string): Promise<string> {
    const oldTrimmed = oldName.trim();
    const newTrimmed = newName.trim();
    const index = dynamicCategories.indexOf(oldTrimmed);
    if (index !== -1 && newTrimmed) {
        dynamicCategories[index] = newTrimmed;
    }
    return newTrimmed;
}

export async function deleteCourseCategory(name: string): Promise<boolean> {
    const trimmed = name.trim();
    const index = dynamicCategories.indexOf(trimmed);
    if (index !== -1) {
        dynamicCategories.splice(index, 1);
        return true;
    }
    return false;
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
    if (payload.accessMode) {
        dto.accessMode = payload.accessMode;
        dto.whitelist = payload.accessMode === "OPEN";
    }
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
