export interface UploadImageResponse {
    url: string;
    fileName: string;
    filePath: string;
}

export interface UploadImageOptions {
    folder?: string;
    fileName?: string;
}

export interface UploadUrlResponseDto {
    url: string;
    publicUrl: string;
    key: string;
}
