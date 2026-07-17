import type { Metadata } from "next";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { ExamSetDetailClientView } from "@/views/exams-sets/exam-set-detail-client-view";

interface PageProps {
    params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
    title: `${UI_TEXT.examsSetsEl.breadcrumbDetail} | ${UI_TEXT.examsSetsEl.title}`,
    description: UI_TEXT.examsSetsEl.subtitle,
};

export default async function ExamSetDetailPage({ params }: PageProps) {
    const { id } = await params;
    return <ExamSetDetailClientView id={id} />;
}
