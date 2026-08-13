import { API_ENDPOINTS } from "@/constants/api-endpoints.constants";
import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type {
    BotSettings,
    ChatbotListParams,
    Contact,
    ContactListResponse,
    CreateContactInput,
    CreateProcessDocumentInput,
    ProcessDocument,
    ProcessDocumentExtractResult,
    ProcessDocumentListResponse,
    UpdateContactInput,
    UpdateProcessDocumentInput,
} from "@/types/chatbot.types";

function buildListQuery(params?: ChatbotListParams): string {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    const str = qs.toString();
    return str ? `?${str}` : "";
}

// ── Quy trình (process documents)
export async function getProcessDocuments(params?: ChatbotListParams): Promise<ProcessDocumentListResponse> {
    return httpClient<ProcessDocumentListResponse>(`${API_ENDPOINTS.CHATBOT.PROCESS_DOCUMENTS}${buildListQuery(params)}`, {
        method: HttpMethod.GET,
    });
}

export async function getProcessDocument(id: string): Promise<ProcessDocument> {
    return httpClient<ProcessDocument>(API_ENDPOINTS.CHATBOT.PROCESS_DOCUMENT_BY_ID(id), { method: HttpMethod.GET });
}

export async function createProcessDocument(data: CreateProcessDocumentInput): Promise<ProcessDocument> {
    return httpClient<ProcessDocument>(API_ENDPOINTS.CHATBOT.PROCESS_DOCUMENTS, {
        method: HttpMethod.POST,
        body: JSON.stringify(data),
    });
}

export async function updateProcessDocument(id: string, data: UpdateProcessDocumentInput): Promise<ProcessDocument> {
    return httpClient<ProcessDocument>(API_ENDPOINTS.CHATBOT.PROCESS_DOCUMENT_BY_ID(id), {
        method: HttpMethod.PUT,
        body: JSON.stringify(data),
    });
}

export async function deleteProcessDocument(id: string): Promise<void> {
    await httpClient<void>(API_ENDPOINTS.CHATBOT.PROCESS_DOCUMENT_BY_ID(id), { method: HttpMethod.DELETE });
}

// Tải file Word/PDF -> BE trích text (không lưu file), trả { content, title } để đổ vào form.
export async function extractProcessDocument(file: File): Promise<ProcessDocumentExtractResult> {
    const form = new FormData();
    form.append("file", file);
    return httpClient<ProcessDocumentExtractResult>(API_ENDPOINTS.CHATBOT.PROCESS_DOCUMENTS_EXTRACT, {
        method: HttpMethod.POST,
        body: form,
    });
}

// ── Danh bạ liên hệ (contacts)
export async function getContacts(params?: ChatbotListParams): Promise<ContactListResponse> {
    return httpClient<ContactListResponse>(`${API_ENDPOINTS.CHATBOT.CONTACTS}${buildListQuery(params)}`, {
        method: HttpMethod.GET,
    });
}

export async function getContact(id: string): Promise<Contact> {
    return httpClient<Contact>(API_ENDPOINTS.CHATBOT.CONTACT_BY_ID(id), { method: HttpMethod.GET });
}

export async function createContact(data: CreateContactInput): Promise<Contact> {
    return httpClient<Contact>(API_ENDPOINTS.CHATBOT.CONTACTS, {
        method: HttpMethod.POST,
        body: JSON.stringify(data),
    });
}

export async function updateContact(id: string, data: UpdateContactInput): Promise<Contact> {
    return httpClient<Contact>(API_ENDPOINTS.CHATBOT.CONTACT_BY_ID(id), {
        method: HttpMethod.PUT,
        body: JSON.stringify(data),
    });
}

export async function deleteContact(id: string): Promise<void> {
    await httpClient<void>(API_ENDPOINTS.CHATBOT.CONTACT_BY_ID(id), { method: HttpMethod.DELETE });
}

// ── Cấu hình bot (singleton)
export async function getBotSettings(): Promise<BotSettings> {
    return httpClient<BotSettings>(API_ENDPOINTS.CHATBOT.BOT_SETTINGS, { method: HttpMethod.GET });
}

export async function updateBotSettings(data: BotSettings): Promise<BotSettings> {
    return httpClient<BotSettings>(API_ENDPOINTS.CHATBOT.BOT_SETTINGS, {
        method: HttpMethod.PUT,
        body: JSON.stringify(data),
    });
}
