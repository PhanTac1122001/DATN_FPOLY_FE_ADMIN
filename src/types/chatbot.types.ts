// Kiểu dữ liệu cho chatbot quy trình (microservice riêng). Response RAW, không
// bọc { statusCode, data }. Xem docs/staff_chatbot_fe_spec.md.

export interface ProcessDocument {
    _id: string;
    code: string;
    title: string;
    summary?: string;
    keywords?: string[];
    content: string;
    department?: string;
    contactInfo?: string;
    answerGuidance?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateProcessDocumentInput {
    code: string;
    title: string;
    summary?: string;
    keywords?: string[];
    content: string;
    department?: string;
    contactInfo?: string;
    answerGuidance?: string;
    isActive?: boolean;
}

export type UpdateProcessDocumentInput = Partial<CreateProcessDocumentInput>;

export interface ProcessDocumentListResponse {
    items: ProcessDocument[];
    total: number;
    page: number;
    limit: number;
}

export interface Contact {
    _id: string;
    code: string;
    name: string;
    department?: string;
    email?: string;
    phone?: string;
    description?: string;
    keywords?: string[];
    isDefault?: boolean;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateContactInput {
    code: string;
    name: string;
    department?: string;
    email?: string;
    phone?: string;
    description?: string;
    keywords?: string[];
    isDefault?: boolean;
    isActive?: boolean;
}

export type UpdateContactInput = Partial<CreateContactInput>;

export interface ContactListResponse {
    items: Contact[];
    total: number;
    page: number;
    limit: number;
}

export interface BotSettings {
    tone?: string;
    orgName?: string;
    outOfScopeMessage?: string;
}

export interface ProcessDocumentExtractResult {
    content: string;
    title: string;
}

export interface ProcessDocumentIngestResult {
    content: string;
    chunks: number;
}

export interface ChatbotListParams {
    search?: string;
    page?: number;
    limit?: number;
}

export type ChatbotTabId = "documents" | "contacts" | "settings";

export interface ProcessDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editingDocument?: ProcessDocument | null;
}

export interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editingContact?: Contact | null;
}
