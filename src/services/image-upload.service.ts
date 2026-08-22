import { API_ENDPOINTS } from "@/constants/api-endpoints.constants";
import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type { UploadImageEnvelope, UploadImageOptions, UploadImageResponse } from "@/types/image-upload.types";

/**
 * Upload ảnh lên S3 qua API (multipart). Server nén ảnh về webp rồi trả public URL.
 */
export async function uploadImage(file: File, options?: UploadImageOptions): Promise<UploadImageResponse> {
    const formData = new FormData();
    // Đổi tên file nếu caller yêu cầu — server dùng originalname để trả về fileName.
    formData.append("file", file, options?.fileName || file.name);
    if (options?.folder) {
        formData.append("folder", options.folder);
    }

    // Không set Content-Type: httpClient tự xoá nó cho FormData để browser gắn boundary.
    const response = await httpClient<UploadImageResponse & UploadImageEnvelope>(API_ENDPOINTS.UPLOAD.IMAGE, {
        method: HttpMethod.POST,
        body: formData,
    });

    const result = response?.data ?? response;
    if (!result?.url) {
        throw new Error("Upload response missing url");
    }
    return result;
}
