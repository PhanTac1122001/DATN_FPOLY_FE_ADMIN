import type { Metadata } from "next";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { TypeDetailClientView } from "@/views/type/type-detail-client-view";

interface PageProps {
    params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
    title: `${UI_TEXT.trainingTypesEl.breadcrumbDetail} | ${UI_TEXT.trainingTypesEl.title}`,
    description: UI_TEXT.trainingTypesEl.subtitle,
};

export default async function TypeDetailPage({ params }: PageProps) {
    const { id } = await params;
    return <TypeDetailClientView id={id} />;
}
