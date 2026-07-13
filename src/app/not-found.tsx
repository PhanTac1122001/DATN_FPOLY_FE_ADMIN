import { DocumentText } from "iconsax-react";
import Link from "next/link";
import { Button } from "@/components/base/buttons/button";
import { ICON_COLORS } from "@/constants/app.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
            <div className="mb-6 rounded-full bg-orange-100 p-6">
                <DocumentText size={64} variant="Bulk" color={ICON_COLORS.WARNING_500} />
            </div>
            <h1 className="mb-2 text-5xl font-bold text-slate-900">{"404"}</h1>
            <h2 className="mb-2 text-2xl font-semibold text-slate-800">{UI_TEXT.errors.notFoundTitle}</h2>
            <p className="mb-8 max-w-md text-slate-600">{UI_TEXT.errors.notFoundDescription}</p>{" "}
            <Link href="/">
                <Button size="lg" color="primary">
                    {UI_TEXT.errors.goHome}
                </Button>
            </Link>
        </div>
    );
}
