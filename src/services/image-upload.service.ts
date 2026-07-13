import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import { UploadImageOptions, UploadImageResponse, UploadUrlResponseDto } from "@/types/image-upload.types";

/**
 * Upload an image file to the server using Direct-to-S3 Presigned URL
 * @param file - The image file to upload
 * @param options - Upload options
 * @returns Upload response with image URL
 */
export async function uploadImage(file: File, options?: UploadImageOptions): Promise<UploadImageResponse> {
    try {
        // 1. Request Presigned PUT URL & Public URL from Backend
        const queryParams = new URLSearchParams();
        queryParams.append("filename", options?.fileName || file.name);
        queryParams.append("contentType", file.type || "application/octet-stream");
        if (options?.folder) {
            queryParams.append("folder", options.folder);
        }

        const {
            url: presignedPutUrl,
            publicUrl,
            key,
        } = await httpClient<UploadUrlResponseDto>(`/api/upload/image?${queryParams.toString()}`, {
            method: HttpMethod.GET,
        });

        // 2. Upload directly to AWS S3 using native fetch
        // Note: MUST not use httpClient here to avoid injecting 'Authorization' header which breaks S3 Signature
        const uploadResponse = await fetch(presignedPutUrl, {
            method: "PUT",
            body: file,
            headers: {
                "Content-Type": file.type || "application/octet-stream",
            },
        });

        if (!uploadResponse.ok) {
            throw new Error(`S3 Upload failed with status ${uploadResponse.status}`);
        }

        // 3. Return the exact same response shape as before so other components don't break
        return {
            url: publicUrl,
            fileName: options?.fileName || file.name,
            filePath: key,
        };
    } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
    }
}
/**
 * Delete an image from the server
 * @param url - The URL of the image to delete
 */
export async function deleteImage(url: string): Promise<void> {
    if (!url) return;

    try {
        await httpClient(`/api/upload/image?url=${encodeURIComponent(url)}`, {
            method: HttpMethod.DELETE,
        });
    } catch (error) {
        console.error("Error deleting image:", error);
        // We generally don't want to block the user flow if deletion fails,
        // so we just log the error.
    }
}
