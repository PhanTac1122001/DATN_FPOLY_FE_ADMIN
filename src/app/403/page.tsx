import { Forbidden2 } from "iconsax-react";
import Link from "next/link";
import { Button } from "@/components/base/buttons/button";
import { ICON_COLORS } from "@/constants/app.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";

export default function ForbiddenPage() {
    const t = UI_TEXT.errors;

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
            <div className="mb-6 rounded-full bg-red-100 p-6">
                <Forbidden2 size={64} variant="Bulk" color={ICON_COLORS.ERROR_500} />
            </div>

            <h1 className="mb-2 text-3xl font-bold text-slate-900">{t.forbiddenTitle}</h1>

            <p className="mb-8 max-w-md text-slate-600">{t.forbiddenDescription}</p>

            <Link href="/">
                <Button size="lg" color="primary">
                    {t.goHome}
                </Button>
            </Link>
        </div>
    );
}
