"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Danger } from "iconsax-react";
import Link from "next/link";
import { Button } from "@/components/base/buttons/button";
import { ICON_COLORS } from "@/constants/app.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";

interface GlobalErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
    useEffect(() => {
        // Log error to Sentry
        Sentry.captureException(error);
    }, [error]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
            <div className="mb-6 rounded-full bg-red-100 p-6">
                <Danger size={64} variant="Bulk" color={ICON_COLORS.ERROR_500} />
            </div>

            <h1 className="mb-2 text-3xl font-bold text-slate-900">{UI_TEXT.errors.title}</h1>

            <p className="mb-4 max-w-md text-slate-600">{UI_TEXT.errors.somethingWentWrong}</p>

            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" color="primary" onClick={reset}>
                    {UI_TEXT.errors.retry}
                </Button>

                <Link href="/">
                    <Button size="lg" color="secondary">
                        {UI_TEXT.errors.goHome}
                    </Button>
                </Link>
            </div>
        </div>
    );
}
