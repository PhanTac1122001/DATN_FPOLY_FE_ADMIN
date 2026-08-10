import { type FocusEvent, useEffect, useReducer, useRef } from "react";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "tiptap-markdown";
import { uploadImage } from "@/services/image-upload.service";
// Import type for internal use
import type { TiptapEditorProps } from "@/types/base-components.types";
import { cx } from "@/utils/cx";
import { CustomCodeBlock } from "./custom-code-block";
import { TableBubbleMenu } from "./table-bubble-menu";
import { Toolbar } from "./toolbar";

// Re-export type from centralized location
export type { TiptapEditorProps } from "@/types/base-components.types";

export function TiptapEditor({ value, onChange, placeholder, readOnly, hideToolbar, className, editorClassName, onImageUpload, onBlur }: TiptapEditorProps) {
    const [, forceUpdate] = useReducer((x) => x + 1, 0);
    const hasFocusedWithinRef = useRef(false);

    const editor = useEditor({
        extensions: [
            CustomCodeBlock,
            StarterKit.configure({
                codeBlock: false,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-blue-500 hover:underline cursor-pointer",
                },
            }),
            Underline,
            Placeholder.configure({
                placeholder: placeholder || "Write something...",
            }),
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Image,
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            Markdown.configure({
                html: true,
                transformPastedText: true,
                transformCopiedText: true,
            }),
        ],
        content: value,
        editable: !readOnly,
        editorProps: {
            attributes: {
                class: cx(
                    "tiptap prose-headings:font-be-vietnam-pro prose-iframe:mx-auto prose-iframe:block prose prose-sm !max-w-none focus:outline-none prose-headings:text-slate-900 prose-table:mx-auto prose-img:!my-0 prose-img:!inline-block prose-img:!w-auto prose-img:!max-w-full prose-img:rounded-3xl [&_td_img]:!mx-auto [&_td_img]:!block",
                    !hideToolbar && "min-h-[200px] p-4",
                    editorClassName,
                ),
            },
        },
        onUpdate: ({ editor }) => {
            const markdown = (editor.storage as unknown as { markdown: { getMarkdown: () => string } }).markdown.getMarkdown();
            onChange(markdown);
            forceUpdate();
        },
        onSelectionUpdate: () => {
            forceUpdate();
        },
        immediatelyRender: false,
    });

    // Update editor content when value prop changes (programmatic — do not emit onUpdate,
    // or parent state flips HTML↔markdown and the reading tab stays falsely dirty / needs 2 saves).
    useEffect(() => {
        if (!editor) return;
        const currentMarkdown = (editor.storage as unknown as { markdown: { getMarkdown: () => string } }).markdown.getMarkdown();
        if (value === currentMarkdown) return;

        const { from, to } = editor.state.selection;
        editor.commands.setContent(value || "", { emitUpdate: false });
        editor.commands.setTextSelection({ from: Math.min(from, editor.state.doc.content.size), to: Math.min(to, editor.state.doc.content.size) });
    }, [value, editor]);

    // Update editor's editable state when readOnly prop changes
    useEffect(() => {
        if (editor) {
            editor.setEditable(!readOnly);
        }
    }, [readOnly, editor]);

    // Use provided handler or default to project's upload service
    const handleImageUpload =
        onImageUpload ??
        (async (file: File) => {
            const { url } = await uploadImage(file);
            return url;
        });

    const handleContainerBlur = (e: FocusEvent<HTMLDivElement>) => {
        if (!onBlur) return;
        if (!hasFocusedWithinRef.current) return;
        const next = e.relatedTarget;
        if (next instanceof Node && e.currentTarget.contains(next)) return;
        hasFocusedWithinRef.current = false;
        onBlur();
    };

    return (
        <div
            className={cx(
                "tiptap relative overflow-visible rounded-lg border border-gray-200 bg-white",
                className,
                hideToolbar && "rounded-none border-none bg-transparent",
            )}
            onFocusCapture={() => {
                hasFocusedWithinRef.current = true;
            }}
            onBlur={handleContainerBlur}
        >
            {!editor ? (
                <>
                    {!hideToolbar && <div className="bg-opacity-50 h-10 border-b border-gray-200 bg-gray-50" />}
                    <div className={cx("w-full", !hideToolbar && "m-5 min-h-[150px]")} />
                </>
            ) : (
                <>
                    {!hideToolbar && <Toolbar editor={editor} onImageUpload={handleImageUpload} />}
                    <TableBubbleMenu editor={editor} />
                    <EditorContent editor={editor} />
                </>
            )}
        </div>
    );
}
