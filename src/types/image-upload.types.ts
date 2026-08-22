export interface UploadImageResponse {
    url: string;
    fileName: string;
    filePath: string;
}

export interface UploadImageOptions {
    folder?: string;
    fileName?: string;
}

/** API bọc response bằng TransformInterceptor thành {statusCode, data}. */
export interface UploadImageEnvelope {
    data?: UploadImageResponse;
}
