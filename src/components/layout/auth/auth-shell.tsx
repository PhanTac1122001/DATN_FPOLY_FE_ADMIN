import type { AuthShellProps } from "@/types/auth-components.types";

/**
 * Entry gate shell — extracted-portal template.html ~2095–2097
 * `position:fixed; inset:0` so decorative blobs cannot expand document scroll.
 */
export function AuthShell({ children }: AuthShellProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-linear-to-br from-brand-500 via-brand-700 to-brand-600 px-6 py-6 text-white">
            <div aria-hidden className="pointer-events-none absolute -top-20 -right-16 size-80 rounded-full bg-gold-500/25 blur-2xl" />
            <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-16 size-72 rounded-full bg-white/10 blur-2xl" />
            <div className="relative z-10 w-full max-w-[440px]">{children}</div>
        </div>
    );
}
