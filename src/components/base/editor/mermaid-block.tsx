import { useEffect, useRef, useState } from "react";
import { NodeViewContent, type NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { AlertCircle, Check, Copy, Edit3, Eye } from "lucide-react";
import { UI_TEXT } from "@/constants/ui-text.constants";

const radixHex = 36;
const substringStart = 2;
const substringEnd = 9;
const debounceRenderDelay = 150;
const copiedIndicatorTimeout = 2000;
const codeTag = "code" as "div";

export function MermaidBlockView({ node }: NodeViewProps) {
    const attrs = node.attrs as { language?: string | null } | undefined;
    const language = attrs?.language;
    const isMermaid = language === "mermaid";

    const codeText = node.textContent;
    const [isEditing, setIsEditing] = useState(() => !(isMermaid && codeText.trim()));
    const [svg, setSvg] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const t = UI_TEXT.components.editor.mermaid;

    // Render mermaid diagram on changes when in preview mode
    useEffect(() => {
        if (!isMermaid || isEditing) return;

        let isMounted = true;

        const renderMermaid = async () => {
            if (!codeText.trim()) {
                if (isMounted) {
                    setSvg("");
                    setError(null);
                }
                return;
            }

            try {
                const mermaid = (await import("mermaid")).default;
                mermaid.initialize({
                    startOnLoad: false,
                    theme: "default",
                    securityLevel: "loose",
                });

                // Generate a unique ID for mermaid rendering to prevent DOM ID conflicts
                const id = `mermaid-${Math.random().toString(radixHex).substring(substringStart, substringEnd)}`;
                const { svg: renderedSvg } = await mermaid.render(id, codeText);

                if (isMounted) {
                    setSvg(renderedSvg);
                    setError(null);
                }
            } catch (err: unknown) {
                const errorObject = err as Error;
                console.error("Mermaid render error:", errorObject);
                if (isMounted) {
                    // Extract clean error message
                    setError(errorObject?.message || "Lỗi cú pháp vẽ biểu đồ Mermaid.");
                    setSvg("");
                }
            }
        };

        const timer = setTimeout(renderMermaid, debounceRenderDelay);
        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [codeText, isEditing, isMermaid]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(codeText);
            setCopied(true);
            setTimeout(() => setCopied(false), copiedIndicatorTimeout);
        } catch (err) {
            console.error("Failed to copy text:", err);
        }
    };

    // For non-mermaid code blocks, render a standard sleek dark editor block
    if (!isMermaid) {
        return (
            <NodeViewWrapper className="code-block group relative my-6">
                <div
                    contentEditable={false}
                    className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white/95 p-1 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase opacity-0 shadow-sm transition-opacity duration-200 select-none group-hover:opacity-100"
                >
                    {language || "code"}
                </div>
                <pre className="!m-0 overflow-x-auto rounded-xl border border-slate-800 !bg-slate-900 !p-4 !pt-10 font-mono text-sm leading-relaxed !text-slate-100 shadow-inner">
                    <NodeViewContent as={codeTag} className="block min-h-[2rem] focus:outline-none" />
                </pre>
            </NodeViewWrapper>
        );
    }

    return (
        <NodeViewWrapper className="mermaid-block group relative my-6">
            {/* Floating Toolbar */}
            <div
                contentEditable={false}
                className="absolute top-3 right-3 z-10 flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white/95 p-1 opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100"
            >
                <div className="border-r border-slate-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase select-none">{t.title}</div>

                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        isEditing ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                    }`}
                    title={isEditing ? t.previewTitle : t.editSource}
                >
                    {isEditing ? (
                        <>
                            <Eye className="h-3.5 w-3.5" />
                            <span>{t.preview}</span>
                        </>
                    ) : (
                        <>
                            <Edit3 className="h-3.5 w-3.5" />
                            <span>{t.editCode}</span>
                        </>
                    )}
                </button>

                <button onClick={handleCopy} className="cursor-pointer rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-50" title={t.copyCode}>
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
            </div>

            {/* Editor View */}
            <div style={{ display: isEditing ? "block" : "none" }}>
                <pre className="relative !m-0 overflow-x-auto rounded-xl border border-slate-800 !bg-slate-900 !p-4 !pt-12 font-mono text-sm leading-relaxed !text-slate-100 shadow-inner">
                    <div className="pointer-events-none absolute top-3 left-4 text-[10px] font-semibold tracking-wider text-slate-500 uppercase select-none">
                        {t.editorModeHint}
                    </div>
                    <NodeViewContent as={codeTag} className="block min-h-[4rem] focus:outline-none" />
                </pre>
            </div>

            {/* Preview/Render View */}
            {!isEditing && (
                <div contentEditable={false} className="select-none">
                    {error ? (
                        <div className="rounded-xl border border-red-200/80 bg-red-50 p-5 shadow-sm">
                            <div className="flex gap-3">
                                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                                <div className="flex-1">
                                    <h4 className="mb-1 text-sm font-semibold text-red-800">{t.syntaxError}</h4>
                                    <pre className="max-h-40 overflow-y-auto rounded-lg border border-red-100 bg-red-100/50 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-red-600">
                                        {error}
                                    </pre>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-red-100/80 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
                                    >
                                        <Edit3 className="h-3.5 w-3.5" />
                                        {t.fixErrorButton}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : svg ? (
                        <div className="relative flex min-h-[120px] items-center justify-center overflow-hidden rounded-xl border border-slate-200/60 bg-slate-50 p-8 shadow-sm">
                            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] [background-size:16px_16px] opacity-70" />
                            <div
                                ref={containerRef}
                                className="mermaid-canvas scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300 flex w-full max-w-full justify-center overflow-x-auto"
                                dangerouslySetInnerHTML={{ __html: svg }}
                            />
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center shadow-sm">
                            <p className="mb-3 text-sm font-medium text-slate-400">{t.emptyChart}</p>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-indigo-100/50 bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-100"
                            >
                                <Edit3 className="h-3.5 w-3.5" />
                                {t.startWriting}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </NodeViewWrapper>
    );
}
