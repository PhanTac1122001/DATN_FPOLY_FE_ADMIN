import type { Metadata } from "next";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { TypeDetailCourseClientView } from "@/views/type/type-detail-course-client-view";

interface PageProps {
    params: Promise<{ id: string; courseId: string }>;
}

export const metadata: Metadata = {
    title: `Chi tiết học liệu môn học | ${UI_TEXT.trainingTypesEl.title}`,
    description: UI_TEXT.trainingTypesEl.subtitle,
};

export default async function TypeDetailCoursePage({ params }: PageProps) {
    const { id, courseId } = await params;
    return <TypeDetailCourseClientView id={id} courseId={courseId} />;
}
