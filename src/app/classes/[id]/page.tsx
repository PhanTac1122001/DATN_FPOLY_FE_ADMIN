import type { Metadata } from "next";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { ClassDetailClientView } from "@/views/classes/class-detail-client-view";

interface PageProps {
    params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
    title: `${UI_TEXT.classes.classDetail} | ${UI_TEXT.common.appName}`,
    description: UI_TEXT.classes.subtitle,
};

export default async function ClassDetailPage({ params }: PageProps) {
    const { id } = await params;
    return <ClassDetailClientView id={id} />;
}
