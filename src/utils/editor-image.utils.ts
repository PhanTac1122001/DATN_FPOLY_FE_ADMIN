import type { EditorView } from "@tiptap/pm/view";
import { EDITOR_IMAGE } from "@/constants/app.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";

export function isAcceptedImage(file: File): boolean {
    return (EDITOR_IMAGE.ACCEPTED_MIME_TYPES as readonly string[]).includes(file.type);
}

/** Trả về message lỗi nếu file không hợp lệ, null nếu hợp lệ. */
export function validateEditorImage(file: File): string | null {
    if (!isAcceptedImage(file)) return UI_TEXT.common.richEditor.invalidImageType;
    if (file.size > EDITOR_IMAGE.MAX_SIZE_BYTES) return UI_TEXT.common.richEditor.imageTooLarge;
    return null;
}

export function imageFilesFrom(list: FileList | null | undefined): File[] {
    if (!list) return [];
    return Array.from(list).filter((file) => file.type.startsWith("image/"));
}

/** Chèn ảnh vào đúng vị trí đã chốt trước khi upload, kể cả khi user đã gõ thêm. */
export function insertImageAt(view: EditorView, pos: number, src: string): void {
    const nodeType = view.state.schema.nodes[EDITOR_IMAGE.NODE_NAME];
    if (!nodeType) return;
    const safePos = Math.min(pos, view.state.doc.content.size);
    view.dispatch(view.state.tr.insert(safePos, nodeType.create({ src })));
}

/** Tìm vị trí hiện tại của node ảnh đang mang đúng src này (vị trí trôi sau mỗi lần gõ). */
export function findImagePosBySrc(view: EditorView, src: string): number {
    let found = -1;
    view.state.doc.descendants((node, pos) => {
        if (found >= 0) return false;
        if (node.type.name === EDITOR_IMAGE.NODE_NAME && node.attrs.src === src) {
            found = pos;
            return false;
        }
        return true;
    });
    return found;
}

/** Thay src của node ảnh đang mang `oldSrc` bằng `newSrc`. */
export function replaceImageSrc(view: EditorView, oldSrc: string, newSrc: string): void {
    const pos = findImagePosBySrc(view, oldSrc);
    if (pos < 0) return;
    const node = view.state.doc.nodeAt(pos);
    if (!node) return;
    view.dispatch(view.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, src: newSrc }));
}

/** Gom src của mọi ảnh base64 đang nằm trong document (do dán từ Word/web). */
export function collectDataUriSrcs(view: EditorView): string[] {
    const srcs: string[] = [];
    view.state.doc.descendants((node) => {
        const src: unknown = node.attrs.src;
        if (node.type.name === EDITOR_IMAGE.NODE_NAME && typeof src === "string" && src.startsWith(EDITOR_IMAGE.DATA_URI_PREFIX)) {
            srcs.push(src);
        }
        return true;
    });
    return srcs;
}

export async function dataUriToFile(dataUri: string): Promise<File> {
    const blob = await fetch(dataUri).then((res) => res.blob());
    const extension = blob.type.split("/")[1] || EDITOR_IMAGE.FALLBACK_EXTENSION;
    return new File([blob], `${EDITOR_IMAGE.PASTED_FILE_BASE_NAME}.${extension}`, { type: blob.type });
}

export function dropPositionFrom(view: EditorView, event: DragEvent): number {
    return view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos ?? view.state.selection.from;
}
