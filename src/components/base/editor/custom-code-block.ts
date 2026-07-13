import CodeBlock from "@tiptap/extension-code-block";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { MermaidBlockView } from "./mermaid-block";

export const CustomCodeBlock = CodeBlock.extend({
    addNodeView() {
        return ReactNodeViewRenderer(MermaidBlockView);
    },

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey("custom-code-block-paste"),
                props: {
                    handlePaste(view, event) {
                        const text = event.clipboardData?.getData("text/plain");
                        if (!text) return false;

                        let trimmedText = text.trim();

                        // Strip leading/trailing quotes if they got copied accidentally
                        if (
                            (trimmedText.startsWith('"') && trimmedText.endsWith('"')) ||
                            (trimmedText.startsWith("'") && trimmedText.endsWith("'")) ||
                            (trimmedText.startsWith("“") && trimmedText.endsWith("”"))
                        ) {
                            trimmedText = trimmedText.slice(1, -1).trim();
                        }

                        // Check if it starts and ends with markdown code fences
                        if (trimmedText.startsWith("```") && trimmedText.endsWith("```")) {
                            // Find first newline to extract language
                            const firstLineEnd = trimmedText.indexOf("\n");
                            if (firstLineEnd !== -1) {
                                const codeFencePrefixLength = 3;
                                const firstLine = trimmedText.substring(0, firstLineEnd).trim();
                                const language = firstLine.substring(codeFencePrefixLength).trim();

                                const lastLineStart = trimmedText.lastIndexOf("```");
                                let codeContent = trimmedText.substring(firstLineEnd + 1, lastLineStart);

                                // Strip trailing newline/carriage returns
                                if (codeContent.endsWith("\n")) {
                                    codeContent = codeContent.slice(0, -1);
                                }
                                if (codeContent.endsWith("\r")) {
                                    codeContent = codeContent.slice(0, -1);
                                }

                                const { schema } = view.state;
                                const node = schema.nodes.codeBlock.create({ language }, codeContent ? schema.text(codeContent) : null);

                                const transaction = view.state.tr.replaceSelectionWith(node);
                                view.dispatch(transaction);
                                return true; // Handled successfully!
                            }
                        }

                        return false;
                    },
                },
            }),
        ];
    },
});
