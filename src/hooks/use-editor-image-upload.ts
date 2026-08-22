"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { EditorView } from "@tiptap/pm/view";
import { EDITOR_IMAGE } from "@/constants/app.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { uploadImage } from "@/services/image-upload.service";
import { toast } from "@/services/toast.service";
import type { EditorImageUploadHandlers } from "@/types/base-components.types";
import {
    collectDataUriSrcs,
    dataUriToFile,
    dropPositionFrom,
    imageFilesFrom,
    insertImageAt,
    replaceImageSrc,
    validateEditorImage,
} from "@/utils/editor-image.utils";

/**
 * Bịt cả ba đường ảnh vào rich-text editor: nút toolbar, dán, kéo-thả.
 * Không có hook này thì ảnh dán/thả sẽ rơi mất, còn ảnh copy từ Word bị lưu
 * nguyên base64 vào nội dung.
 */
export function useEditorImageUpload(customUpload?: (file: File) => Promise<string>): EditorImageUploadHandlers {
    const [uploadingCount, setUploadingCount] = useState(0);
    // Handler của ProseMirror chỉ được tạo 1 lần lúc khởi tạo editor, nên phải
    // đọc customUpload qua ref mới thấy được bản mới nhất.
    const customUploadRef = useRef(customUpload);

    useEffect(() => {
        customUploadRef.current = customUpload;
    }, [customUpload]);

    const uploadFile = useCallback(async (file: File): Promise<string> => {
        const error = validateEditorImage(file);
        if (error) {
            toast.error(error);
            throw new Error(error);
        }

        setUploadingCount((count) => count + 1);
        try {
            if (customUploadRef.current) return await customUploadRef.current(file);
            const { url } = await uploadImage(file);
            return url;
        } catch (err) {
            console.error("Failed to upload editor image", err);
            toast.error(UI_TEXT.common.richEditor.uploadImageFailed);
            throw err;
        } finally {
            setUploadingCount((count) => Math.max(0, count - 1));
        }
    }, []);

    const uploadAndInsert = useCallback(
        (view: EditorView, files: File[], pos: number) => {
            files.forEach((file) => {
                void uploadFile(file)
                    .then((url) => insertImageAt(view, pos, url))
                    .catch(() => undefined); // uploadFile đã báo toast rồi.
            });
        },
        [uploadFile],
    );

    /**
     * Dán ảnh từ clipboard (ảnh chụp màn hình) -> upload ngay.
     * Dán HTML từ Word/web -> để ProseMirror chèn base64 trước rồi quét thay bằng
     * URL S3; nếu chặn ngay thì mất luôn phần chữ đi kèm trong nội dung dán.
     */
    const handlePaste = useCallback(
        (view: EditorView, event: ClipboardEvent): boolean => {
            const files = imageFilesFrom(event.clipboardData?.files);
            if (files.length > 0) {
                event.preventDefault();
                uploadAndInsert(view, files, view.state.selection.from);
                return true;
            }

            const html = event.clipboardData?.getData("text/html") ?? "";
            if (html.includes(EDITOR_IMAGE.DATA_URI_PREFIX)) {
                // Chạy sau khi ProseMirror đã áp dụng nội dung dán.
                setTimeout(() => {
                    collectDataUriSrcs(view).forEach((src) => {
                        void dataUriToFile(src)
                            .then((file) => uploadFile(file))
                            .then((url) => replaceImageSrc(view, src, url))
                            .catch(() => undefined);
                    });
                }, 0);
            }
            return false;
        },
        [uploadAndInsert, uploadFile],
    );

    const handleDrop = useCallback(
        (view: EditorView, event: DragEvent, _slice: unknown, moved: boolean): boolean => {
            if (moved) return false; // Kéo node có sẵn trong editor, không phải file mới.
            const files = imageFilesFrom(event.dataTransfer?.files);
            if (files.length === 0) return false;

            event.preventDefault();
            uploadAndInsert(view, files, dropPositionFrom(view, event));
            return true;
        },
        [uploadAndInsert],
    );

    return { uploadingCount, uploadFile, handlePaste, handleDrop };
}
