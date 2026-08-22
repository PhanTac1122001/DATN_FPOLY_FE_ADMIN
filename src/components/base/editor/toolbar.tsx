import { useRef } from "react";
import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    Bold,
    Code,
    Eraser,
    Heading1,
    Heading2,
    Heading3,
    Image as ImageIcon,
    Italic,
    Link,
    List,
    ListOrdered,
    Minus,
    Quote,
    Redo,
    Strikethrough,
    Table as TableIcon,
    Underline,
    Undo,
} from "lucide-react";
import { UI_TEXT } from "@/constants/ui-text.constants";
// Import types for internal use
import type { ToolbarButtonProps, ToolbarProps } from "@/types/base-components.types";
import { cx } from "@/utils/cx";

// Re-export types from centralized location
export type { ToolbarButtonProps, ToolbarProps } from "@/types/base-components.types";

const Button = ({ onClick, isActive = false, disabled = false, children, title }: ToolbarButtonProps) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={cx(
            "flex h-8 w-8 items-center justify-center rounded-[4px] text-gray-600 transition-colors hover:bg-gray-100",
            isActive && "bg-gray-100 text-gray-900 shadow-inner",
            disabled && "cursor-not-allowed opacity-50",
        )}
    >
        {children}
    </button>
);

export function Toolbar({ editor, onImageUpload }: ToolbarProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!editor) {
        return null;
    }

    const addImage = () => {
        if (onImageUpload) {
            fileInputRef.current?.click();
        } else {
            const url = window.prompt("URL");
            if (url) {
                editor.chain().focus().setImage({ src: url }).run();
            }
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && onImageUpload) {
            try {
                const url = await onImageUpload(file);
                if (url) {
                    editor.chain().focus().setImage({ src: url }).run();
                }
            } catch {
                // useEditorImageUpload đã hiện toast lỗi.
            } finally {
                // Reset file input so the same file can be selected again if needed
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        }
    };

    return (
        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 rounded-t-xl border-b border-gray-200 bg-white p-2">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            <Button onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} title={UI_TEXT.common.richEditor.bold}>
                <Bold size={18} />
            </Button>
            <Button onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} title={UI_TEXT.common.richEditor.italic}>
                <Italic size={18} />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive("underline")}
                title={UI_TEXT.common.richEditor.underline}
            >
                <Underline size={18} />
            </Button>
            <Button onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive("strike")} title={UI_TEXT.common.richEditor.strike}>
                <Strikethrough size={18} />
            </Button>

            <div className="mx-1 h-6 w-px bg-gray-200" />

            <Button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive("heading", { level: 1 })}
                title={UI_TEXT.common.richEditor.heading1}
            >
                <Heading1 size={18} />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive("heading", { level: 2 })}
                title={UI_TEXT.common.richEditor.heading2}
            >
                <Heading2 size={18} />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                isActive={editor.isActive("heading", { level: 3 })}
                title={UI_TEXT.common.richEditor.heading3}
            >
                <Heading3 size={18} />
            </Button>

            <div className="mx-1 h-6 w-px bg-gray-200" />

            <Button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive("bulletList")}
                title={UI_TEXT.common.richEditor.bulletList}
            >
                <List size={18} />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive("orderedList")}
                title={UI_TEXT.common.richEditor.orderedList}
            >
                <ListOrdered size={18} />
            </Button>

            <div className="mx-1 h-6 w-px bg-gray-200" />

            <Button
                onClick={() => editor.chain().focus().setTextAlign("left").run()}
                isActive={editor.isActive({ textAlign: "left" })}
                title={UI_TEXT.common.richEditor.alignLeft}
            >
                <AlignLeft size={18} />
            </Button>
            <Button
                onClick={() => editor.chain().focus().setTextAlign("center").run()}
                isActive={editor.isActive({ textAlign: "center" })}
                title={UI_TEXT.common.richEditor.alignCenter}
            >
                <AlignCenter size={18} />
            </Button>
            <Button
                onClick={() => editor.chain().focus().setTextAlign("right").run()}
                isActive={editor.isActive({ textAlign: "right" })}
                title={UI_TEXT.common.richEditor.alignRight}
            >
                <AlignRight size={18} />
            </Button>
            <Button
                onClick={() => editor.chain().focus().setTextAlign("justify").run()}
                isActive={editor.isActive({ textAlign: "justify" })}
                title={UI_TEXT.common.richEditor.justify}
            >
                <AlignJustify size={18} />
            </Button>

            <div className="mx-1 h-6 w-px bg-gray-200" />

            <Button
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive("blockquote")}
                title={UI_TEXT.common.richEditor.quote}
            >
                <Quote size={18} />
            </Button>
            <Button
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                isActive={editor.isActive("codeBlock")}
                title={UI_TEXT.common.richEditor.codeBlock}
            >
                <Code size={18} />
            </Button>
            <Button onClick={() => editor.chain().focus().setHorizontalRule().run()} title={UI_TEXT.common.richEditor.horizontalRule}>
                <Minus size={18} />
            </Button>

            <div className="mx-1 h-6 w-px bg-gray-200" />

            <Button
                onClick={() => {
                    const previousUrl = editor.getAttributes("link").href;
                    const url = window.prompt("URL", previousUrl);
                    if (url === null) return;
                    if (url === "") {
                        editor.chain().focus().extendMarkRange("link").unsetLink().run();
                        return;
                    }
                    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
                }}
                isActive={editor.isActive("link")}
                title={UI_TEXT.common.richEditor.link}
            >
                <Link size={18} />
            </Button>
            <Button onClick={addImage} title={UI_TEXT.common.richEditor.image}>
                <ImageIcon size={18} />
            </Button>
            <Button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title={UI_TEXT.common.richEditor.table}>
                <TableIcon size={18} />
            </Button>
            <Button onClick={() => editor.chain().focus().unsetAllMarks().run()} title={UI_TEXT.common.richEditor.clearFormat}>
                <Eraser size={18} />
            </Button>

            <div className="mx-1 h-6 w-px bg-gray-200" />

            <Button
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                title={UI_TEXT.common.richEditor.undo}
            >
                <Undo size={18} />
            </Button>
            <Button
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                title={UI_TEXT.common.richEditor.redo}
            >
                <Redo size={18} />
            </Button>
        </div>
    );
}
