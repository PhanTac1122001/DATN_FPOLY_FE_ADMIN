// Giới hạn độ dài cấu hình văn phong bot (khớp validation BE: tone/outOfScope 500, orgName 200).
export const CHATBOT_TONE_MAX_LENGTH = 500;
export const CHATBOT_ORG_NAME_MAX_LENGTH = 200;
export const CHATBOT_OUT_OF_SCOPE_MAX_LENGTH = 500;

// Upload file quy trình để trích text. Khớp định dạng BE hỗ trợ + giới hạn 15MB.
export const CHATBOT_UPLOAD_ACCEPT = ".pdf,.docx,.xlsx,.pptx,.csv,.txt,.md";
export const CHATBOT_UPLOAD_EXTENSIONS = [".pdf", ".docx", ".xlsx", ".pptx", ".csv", ".txt", ".md"];
export const CHATBOT_UPLOAD_MAX_BYTES = 15 * 1024 * 1024;
