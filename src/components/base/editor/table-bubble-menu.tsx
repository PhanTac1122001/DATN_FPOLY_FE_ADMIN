import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { ArrowDownToLine, ArrowLeftToLine, ArrowRightToLine, ArrowUpToLine, Combine, Grid2X2, Minus, PanelLeft, PanelTop, Split, Trash2 } from "lucide-react";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import { UI_TEXT } from "@/constants/ui-text.constants";
import type { MenuButtonProps } from "@/types/base-components.types";
import { cx } from "@/utils/cx";

const MenuButton = ({ onClick, disabled = false, children, title, isActive = false, isDanger = false }: MenuButtonProps) => (
    <Tooltip title={title} placement="top" arrow delay={200}>
        <TooltipTrigger
            onPress={onClick}
            isDisabled={disabled}
            className={cx(
                "flex h-8 w-8 items-center justify-center rounded transition-colors",
                isActive ? "bg-slate-200 text-slate-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                disabled && "cursor-not-allowed opacity-50",
                isDanger && "text-red-500 hover:bg-red-50 hover:text-red-700",
            )}
        >
            {children}
        </TooltipTrigger>
    </Tooltip>
);

export function TableBubbleMenu({ editor }: { editor: Editor }) {
    if (!editor) {
        return null;
    }

    const shouldShow = ({ editor }: { editor: Editor }) => {
        return editor.isActive("table");
    };

    return (
        <BubbleMenu
            editor={editor}
            shouldShow={shouldShow}
            className="flex flex-wrap items-center gap-1 rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl transition-all"
        >
            <MenuButton
                onClick={() => editor.chain().focus().toggleHeaderRow().run()}
                isActive={editor.isActive("tableHeader")}
                title={UI_TEXT.common.richEditor.toggleHeaderRow}
            >
                <PanelTop size={16} />
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().toggleHeaderColumn().run()} title={UI_TEXT.common.richEditor.toggleHeaderColumn}>
                <PanelLeft size={16} />
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().toggleHeaderCell().run()} title={UI_TEXT.common.richEditor.toggleHeaderCell}>
                <Grid2X2 size={16} />
            </MenuButton>

            <div className="mx-1 h-5 w-px bg-gray-200" />

            <MenuButton onClick={() => editor.chain().focus().addColumnBefore().run()} title={UI_TEXT.common.richEditor.addColumnBefore}>
                <ArrowLeftToLine size={16} />
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().addColumnAfter().run()} title={UI_TEXT.common.richEditor.addColumnAfter}>
                <ArrowRightToLine size={16} />
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().deleteColumn().run()} isDanger title={UI_TEXT.common.richEditor.deleteColumn}>
                <Minus size={16} />
            </MenuButton>

            <div className="mx-1 h-5 w-px bg-gray-200" />

            <MenuButton onClick={() => editor.chain().focus().addRowBefore().run()} title={UI_TEXT.common.richEditor.addRowBefore}>
                <ArrowUpToLine size={16} />
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().addRowAfter().run()} title={UI_TEXT.common.richEditor.addRowAfter}>
                <ArrowDownToLine size={16} />
            </MenuButton>
            <MenuButton onClick={() => editor.chain().focus().deleteRow().run()} isDanger title={UI_TEXT.common.richEditor.deleteRow}>
                <Minus size={16} />
            </MenuButton>

            <div className="mx-1 h-5 w-px bg-gray-200" />

            <MenuButton
                onClick={() => editor.chain().focus().mergeCells().run()}
                disabled={!editor.can().mergeCells()}
                title={UI_TEXT.common.richEditor.mergeCells}
            >
                <Combine size={16} />
            </MenuButton>
            <MenuButton
                onClick={() => editor.chain().focus().splitCell().run()}
                disabled={!editor.can().splitCell()}
                title={UI_TEXT.common.richEditor.splitCells}
            >
                <Split size={16} />
            </MenuButton>

            <div className="mx-1 h-5 w-px bg-gray-200" />

            <MenuButton onClick={() => editor.chain().focus().deleteTable().run()} isDanger title={UI_TEXT.common.richEditor.deleteTable}>
                <Trash2 size={16} />
            </MenuButton>
        </BubbleMenu>
    );
}
